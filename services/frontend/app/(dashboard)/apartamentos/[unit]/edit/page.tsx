'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOptimisticNavigation } from '@/app/_contexts/OptimisticNavigationContext';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import {
    ChevronLeft, Save, X, User, Car, Baby, Pencil, Motorbike,
    PawPrint, Bike, Loader2, ShieldCheck,
    AlertCircle, Trash2, Plus, UploadCloud, FileText,
    Key, Heart, Smartphone, HelpCircle, Download, Eye,
    Construction, MessageSquare
} from 'lucide-react';
import {
    fetchUnitDetail, updateUnitData,
    assignPersonToUnit, unassignPersonFromUnit
} from '@/lib/actions/unit.actions';
import {
    assignVehicleToUnit, unassignVehicleFromUnit,
    updateVehicleData
} from '@/lib/actions/vehicle.actions';
import {
    createPetForUnit, deletePet, updatePetData
} from '@/lib/actions/pet.actions';
import {
    uploadUnitDocument, deleteUnitDocument
} from '@/lib/actions/document.actions';
import {
    assignParkingToUnit, unassignParkingFromUnit
} from '@/lib/actions/parking.actions';
import { UnitDocument } from '@/lib/actions/base.actions';
import { usePeopleData } from '@/lib/hooks/usePeopleData';
import { fetchPersonByDocument, createPerson, updatePersonData } from '@/lib/actions/people.actions';
import { PersonFormModal } from '../../_components/modals/PersonFormModal';
import { PetFormModal } from '../../_components/modals/PetFormModal';
import { VehicleFormModal } from '../../_components/modals/VehicleFormModal';
import { BicycleFormModal } from '../../_components/modals/BicycleFormModal';
import { TagFormModal } from '../../_components/modals/TagFormModal';
import { VehicleUnassignModal } from '../../_components/modals/VehicleUnassignModal';
import { SearchDropdown } from '../../_components/SearchDropdown';
import { EditUnitSkeleton } from '@/components/skeletons/PageSkeletons';
import { EmptyState } from './_components/EmptyState';
import { ListItemRow } from './_components/ListItemRow';
import { ListSectionCard } from './_components/ListSectionCard';
import {
    addListItem,
    addParkingFromSearch,
    addPersonFromSearch,
    addPetFromSearch,
    addVehicleFromSearch,
    removeDocumentById,
    removeListItemAtIndex,
    upsertDocument
} from '@/lib/utils/unitListHelpers';

// --- Helper Components ---

interface DocumentBoxProps {
    label: string;
    type: string;
    documents: UnitDocument[];
    onUpload: (doc: UnitDocument) => void;
    onDelete: (id: number) => void;
    unitId: string;
    required?: boolean;
}

const DocumentBox = ({ label, type, documents, onUpload, onDelete, unitId: _unitId, required }: DocumentBoxProps) => {
    const [isUploading] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const doc = documents.find(d => d.document_type === type);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Crear un objeto de documento temporal
        const tempDoc: UnitDocument = {
            id: -Date.now(), // ID negativo para temporales
            document_type: type,
            file: URL.createObjectURL(file),
            original_name: file.name,
            mime_type: file.type,
            size: file.size,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            isTemporary: true,
            tempFile: file
        };

        onUpload(tempDoc);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDelete = () => {
        if (!doc) return;
        if (!confirm("¿Está seguro de eliminar este documento de la lista? El cambio se aplicará al Guardar.")) return;
        onDelete(doc.id);
    };

    return (
        <div className={cn(
            "p-4 rounded-2xl border transition-all",
            doc ? "bg-white border-zinc-200" : "bg-zinc-50 border-dashed border-zinc-200"
        )}>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Label className="text-[10px] font-bold uppercase text-zinc-400 tracking-tight">{label}</Label>
                    {required && !doc && <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />}
                </div>
                {doc && (
                    <div className="flex items-center gap-1">
                        <a
                            href={doc.file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-zinc-400 hover:text-blue-600 transition-colors"
                            title="Ver documento"
                        >
                            <Eye size={14} />
                        </a>
                        <a
                            href={doc.file}
                            download={doc.original_name}
                            className="p-1.5 text-zinc-400 hover:text-blue-600 transition-colors"
                            title="Descargar"
                        >
                            <Download size={14} />
                        </a>
                        <button
                            onClick={handleDelete}
                            className="p-1.5 text-zinc-400 hover:text-rose-600 transition-colors"
                            title="Eliminar"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                )}
            </div>

            {doc ? (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                        <FileText size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-zinc-800 truncate">{doc.original_name}</p>
                        <p className="text-[9px] text-zinc-400 font-medium uppercase">
                            {(doc.size / 1024).toFixed(1)} KB • {new Date(doc.created_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    />
                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={isUploading}
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-10 border border-zinc-200 rounded-xl text-[10px] font-black uppercase text-zinc-500 hover:bg-white hover:text-blue-600"
                    >
                        {isUploading ? <Loader2 size={14} className="animate-spin mr-2" /> : <UploadCloud size={14} className="mr-2" />}
                        Subir Archivo
                    </Button>
                </div>
            )}
        </div>
    );
};

export default function EditUnitPage({ params: paramsPromise }: { params: Promise<any> }) {
    const params = React.use(paramsPromise);
    const router = useRouter();
    const { pushOptimistic } = useOptimisticNavigation();
    const queryClient = useQueryClient();
    const unit = params.unit as string;

    const [formData, setFormData] = useState<any>(null);
    const [lists, setLists] = useState({
        owners: [] as any[],
        residents: [] as any[],
        vehicles: [] as any[],
        bicycles: [] as any[],
        tags: [] as string[],
        pets: [] as any[],
        parkingSpaces: [] as any[]
    });
    const [documents, setDocuments] = useState<UnitDocument[]>([]);
    const [initialLists, setInitialLists] = useState<any>(null);
    const [initialFormData, setInitialFormData] = useState<any>(null);
    const [initialDocuments, setInitialDocuments] = useState<UnitDocument[]>([]);

    // Modal States
    const [modals, setModals] = useState({
        person: false,
        pet: false,
        vehicle: false,
        bicycle: false,
        tag: false
    });
    const [personRole, setPersonRole] = useState<'Propietario' | 'Residente'>('Residente');
    const [vehicleRemoval, setVehicleRemoval] = useState<{
        listName: 'vehicles' | 'bicycles';
        index: number;
        plate: string;
        type?: string;
    } | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [editingPerson, setEditingPerson] = useState<{ list: 'owners' | 'residents'; index: number } | null>(null);
    const [editingVehicle, setEditingVehicle] = useState<{ index: number } | null>(null);
    const [editingBicycle, setEditingBicycle] = useState<{ index: number } | null>(null);
    const [editingPet, setEditingPet] = useState<{ index: number } | null>(null);
    const [editingTag, setEditingTag] = useState<{ index: number } | null>(null);
    const [isVacancyConfirmOpen, setIsVacancyConfirmOpen] = useState(false);

    const { data: peopleData = [] } = usePeopleData();

    const handleDocumentUpsert = (doc: UnitDocument) => {
        setDocuments(prev => upsertDocument(prev, doc));
    };

    const handleDocumentDelete = (id: number) => {
        setDocuments(prev => removeDocumentById(prev, id));
    };

    const isStatusArrendado = formData?.status === 'Arrendado';
    const isUnderRemodelation = !!formData?.isUnderRemodelation;
    const affectedResidentCount = lists.residents.length;
    const affectedPetCount = lists.pets.length;
    const affectedVehicleCount = lists.vehicles.length;
    const affectedBicycleCount = lists.bicycles.length;
    const affectedMobilityCount = affectedVehicleCount + affectedBicycleCount;

    const vacancyImpactLabels = [
        affectedResidentCount > 0 ? `${affectedResidentCount} residente${affectedResidentCount === 1 ? '' : 's'}` : null,
        affectedPetCount > 0 ? `${affectedPetCount} mascota${affectedPetCount === 1 ? '' : 's'}` : null,
        affectedVehicleCount > 0 ? `${affectedVehicleCount} vehículo${affectedVehicleCount === 1 ? '' : 's'}` : null,
        affectedBicycleCount > 0 ? `${affectedBicycleCount} bicicleta${affectedBicycleCount === 1 ? '' : 's'}` : null,
    ].filter(Boolean);

    const hasLeaseContract = documents.some(d => d.document_type === 'Contrato de Arrendamiento');
    const hasPropertyCertificate = documents.some(d => d.document_type === 'Certificado de Propiedad');
    const hasConstructionContract = documents.some(d => d.document_type === 'Contrato de Obra');

    const missingDocs: string[] = [];
    if (!hasPropertyCertificate) missingDocs.push("Certificado de Propiedad");
    if (isStatusArrendado && !hasLeaseContract) missingDocs.push("Contrato de Arrendamiento");
    if (isUnderRemodelation && !hasConstructionContract) missingDocs.push("Contrato de Obra");

    // Lógica de "sucio" (cambios realizados)
    const isDirty =
        JSON.stringify(lists) !== JSON.stringify(initialLists) ||
        formData?.status !== initialFormData?.status ||
        formData?.isUnderRemodelation !== initialFormData?.isUnderRemodelation ||
        formData?.observations !== initialFormData?.observations ||
        JSON.stringify(documents.map(d => ({ id: d.id, type: d.document_type }))) !==
        JSON.stringify(initialDocuments.map(d => ({ id: d.id, type: d.document_type }))) ||
        JSON.stringify(lists.parkingSpaces.map(p => p.id)) !== JSON.stringify(initialLists?.parkingSpaces.map((p: any) => p.id));

    const canSave = !isSaving && !isLoading && isDirty;

    useEffect(() => {
        const loadUnitData = async () => {
            setIsLoading(true);
            try {
                const [tower, unitNumber] = unit.split('-');
                const unitInfo = await fetchUnitDetail(tower, unitNumber);

                if (unitInfo) {
                    setFormData(unitInfo);

                    // Mapeo directo de assignments desde la API estructurada
                    const owners = (unitInfo.assignments || [])
                        .filter((a: any) => a.is_owner)
                        .map((a: any) => ({
                            document_number: a.person.document_number,
                            first_name: a.person.first_name,
                            last_name: a.person.last_name,
                            document_type: a.person.document_type || 'CC',
                            email: a.person.email || '',
                            phone: a.person.phone || '',
                            is_minor: a.person.is_minor,
                            is_elderly: a.person.is_elderly,
                            has_disability: a.person.has_disability,
                            is_realtor: a.person.is_realtor,
                            data_authorization: a.person.data_authorization,
                            observations: a.person.observations || '',
                            role: 'Propietario'
                        }));

                    const residents = (unitInfo.assignments || [])
                        .filter((a: any) => !a.is_owner)
                        .map((a: any) => ({
                            document_number: a.person.document_number,
                            first_name: a.person.first_name,
                            last_name: a.person.last_name,
                            document_type: a.person.document_type || 'CC',
                            email: a.person.email || '',
                            phone: a.person.phone || '',
                            is_minor: a.person.is_minor,
                            is_elderly: a.person.is_elderly,
                            has_disability: a.person.has_disability,
                            is_realtor: a.person.is_realtor,
                            data_authorization: a.person.data_authorization,
                            observations: a.person.observations || '',
                            role: 'Residente'
                        }));

                    const vehicles = (unitInfo.vehicles || [])
                        .filter((v: any) => v.type !== 'Bicicleta')
                        .map((v: any) => ({
                            plate: v.plate.toUpperCase(),
                            type: v.type,
                            status: v.status,
                            brand: v.brand || '',
                            model: v.model || '',
                            color: v.color || '',
                            parking_space_id: v.parking_space?.id || v.parking_space_id || '',
                            observations: v.observations || ''
                        }));

                    const bicycles = (unitInfo.vehicles || [])
                        .filter((v: any) => v.type === 'Bicicleta')
                        .map((v: any) => ({
                            plate: v.plate.toUpperCase(),
                            type: 'Bicicleta',
                            status: v.status,
                            brand: v.brand || '',
                            model: v.model || '',
                            color: v.color || '',
                            observations: v.observations || ''
                        }));

                    const pets = (unitInfo.pets || []).map((p: any, i: number) => ({
                        id: p.id || i,
                        name: p.name,
                        type: p.species || 'Canino',
                        breed: p.breed || '',
                        color: p.color || '',
                        age: p.age || '',
                        gender: p.gender || 'Macho',
                        vaccinated: p.vaccinated ? 'Si' : 'No',
                        observations: p.observations || ''
                    }));

                    const currentLists = {
                        owners,
                        residents,
                        vehicles,
                        bicycles,
                        tags: unitInfo.tags || [],
                        pets,
                        parkingSpaces: unitInfo.parkingSpaces || []
                    };

                    setLists(currentLists);
                    setInitialLists(JSON.parse(JSON.stringify(currentLists)));
                    setFormData(unitInfo);
                    setInitialFormData(JSON.parse(JSON.stringify(unitInfo)));
                    setDocuments(unitInfo.documents || []);
                    setInitialDocuments(unitInfo.documents || []);
                }
            } catch (err) {
                console.error("Error loading unit detail for edit:", err);
                setError("No se pudo cargar la información detallada de la unidad.");
            } finally {
                setIsLoading(false);
            }
        };
        loadUnitData();
    }, [unit]);

    const openVehicleRemovalModal = (listName: 'vehicles' | 'bicycles', index: number) => {
        const target = lists[listName][index];
        if (!target?.plate) return;
        const initialVehicles = [...(initialLists?.vehicles || []), ...(initialLists?.bicycles || [])];
        const wasInInitial = initialVehicles.some((iv: any) => iv.plate === target.plate);
        if (!wasInInitial) {
            setLists(prev => ({
                ...prev,
                [listName]: prev[listName].filter((_, i) => i !== index)
            }));
            return;
        }
        setVehicleRemoval({
            listName,
            index,
            plate: target.plate,
            type: target.type || (listName === 'bicycles' ? 'Bicicleta' : undefined)
        });
    };

    const applyVehicleRemoval = () => {
        if (!vehicleRemoval) return;
        const { listName, index } = vehicleRemoval;
        setLists(prev => ({
            ...prev,
            [listName]: prev[listName].filter((_, i) => i !== index)
        }));
        setVehicleRemoval(null);
    };

    const handleAddToList = (listName: keyof typeof lists, value: any) => {
        if (!value) return;

        setLists(prev => {
            const { lists: nextLists } = addListItem(prev, listName, value);
            return nextLists;
        });
    };

    const handleSelectExisting = (type: keyof typeof lists, item: any) => {
        if (!item) return;

        if (type === 'owners' || type === 'residents') {
            setLists(prev => addPersonFromSearch(prev, type, item).lists);
            return;
        }

        if (type === 'vehicles') {
            setLists(prev => {
                const result = addVehicleFromSearch(prev, item);
                return result.lists;
            });
            return;
        }

        if (type === 'pets') {
            setLists(prev => addPetFromSearch(prev, item).lists);
            return;
        }

        if (type === 'parkingSpaces' as any) {
            setLists(prev => addParkingFromSearch(prev, item).lists);
        }
    };

    const handleRemoveFromList = (listName: keyof typeof lists, index: number) => {
        setLists(prev => removeListItemAtIndex(prev, listName, index));
    };

    const handleStatusChange = (nextStatus: string) => {
        if (!formData) return;

        const isTransitionToVacant = formData.status !== 'Desocupado' && nextStatus === 'Desocupado';
        const hasOccupancyLinkedRecords = affectedResidentCount > 0 || affectedPetCount > 0 || affectedMobilityCount > 0;

        if (isTransitionToVacant && hasOccupancyLinkedRecords) {
            setIsVacancyConfirmOpen(true);
            return;
        }

        setFormData((prev: any) => prev ? { ...prev, status: nextStatus } : prev);
    };

    const applyVacancyChange = () => {
        setLists(prev => ({
            ...prev,
            residents: [],
            vehicles: [],
            bicycles: [],
            pets: []
        }));
        setFormData((prev: any) => prev ? { ...prev, status: 'Desocupado' } : prev);
        setIsVacancyConfirmOpen(false);
    };

    const normalizeText = (value: any) => {
        if (value === undefined) return undefined;
        if (value === null) return null;
        if (typeof value === 'string') {
            const trimmed = value.trim();
            return trimmed.length ? trimmed : null;
        }
        return value;
    };

    const buildPersonUpdatePayload = (current: any, initial?: any) => {
        const fields = [
            'first_name',
            'last_name',
            'email',
            'phone',
            'is_minor',
            'is_elderly',
            'has_disability',
            'is_realtor',
            'data_authorization',
            'observations'
        ];
        const updates: Record<string, any> = {};

        fields.forEach((field) => {
            const currentValue = normalizeText(current?.[field]);
            const initialValue = normalizeText(initial?.[field]);
            if (currentValue !== undefined && currentValue !== initialValue) {
                updates[field] = currentValue;
            }
        });

        return updates;
    };

    const normalizeParkingId = (value: any) => {
        if (value === undefined || value === null || value === '') return null;
        const asNumber = Number(value);
        return Number.isNaN(asNumber) ? null : asNumber;
    };

    const buildVehicleUpdatePayload = (current: any, initial?: any) => {
        const updates: Record<string, any> = {};
        const fields = ['type', 'brand', 'model', 'color', 'status', 'observations'];

        fields.forEach((field) => {
            const currentValue = normalizeText(current?.[field]);
            const initialValue = normalizeText(initial?.[field]);
            if (currentValue !== undefined && currentValue !== initialValue) {
                updates[field] = currentValue;
            }
        });

        const currentParking = normalizeParkingId(current?.parking_space_id);
        const initialParking = normalizeParkingId(initial?.parking_space_id);
        if (currentParking !== initialParking) {
            updates.parking_space_id = currentParking;
        }

        return updates;
    };

    const normalizeVaccinated = (value: any) => {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') return value.toLowerCase() === 'si';
        return undefined;
    };

    const buildPetUpdatePayload = (current: any, initial?: any) => {
        const updates: Record<string, any> = {};
        const currentSpecies = normalizeText(current?.type);
        const initialSpecies = normalizeText(initial?.type);

        if (currentSpecies !== undefined && currentSpecies !== initialSpecies) {
            updates.species = currentSpecies;
        }

        const fields = ['name', 'breed', 'color', 'age', 'gender', 'observations'];
        fields.forEach((field) => {
            const currentValue = normalizeText(current?.[field]);
            const initialValue = normalizeText(initial?.[field]);
            if (currentValue !== undefined && currentValue !== initialValue) {
                updates[field] = currentValue;
            }
        });

        const currentVaccinated = normalizeVaccinated(current?.vaccinated);
        const initialVaccinated = normalizeVaccinated(initial?.vaccinated);
        if (currentVaccinated !== undefined && currentVaccinated !== initialVaccinated) {
            updates.vaccinated = currentVaccinated;
        }

        return updates;
    };

    const resolvePersonEditData = (listName: 'owners' | 'residents', index: number) => {
        const basePerson = lists[listName]?.[index];
        if (!basePerson) return undefined;
        const match = peopleData.find((p: any) => p.document_number === basePerson.document_number);
        return {
            ...match,
            ...basePerson,
            role: basePerson.role || (listName === 'owners' ? 'Propietario' : 'Residente')
        };
    };

    const openNewPersonModal = (role: 'Propietario' | 'Residente') => {
        setEditingPerson(null);
        setPersonRole(role);
        setModals({ ...modals, person: true });
    };

    const openEditPersonModal = (listName: 'owners' | 'residents', index: number) => {
        setPersonRole(listName === 'owners' ? 'Propietario' : 'Residente');
        setEditingPerson({ list: listName, index });
        setModals({ ...modals, person: true });
    };

    const openNewVehicleModal = () => {
        setEditingVehicle(null);
        setModals({ ...modals, vehicle: true });
    };

    const openEditVehicleModal = (index: number) => {
        setEditingVehicle({ index });
        setModals({ ...modals, vehicle: true });
    };

    const openNewBicycleModal = () => {
        setEditingBicycle(null);
        setModals({ ...modals, bicycle: true });
    };

    const openEditBicycleModal = (index: number) => {
        setEditingBicycle({ index });
        setModals({ ...modals, bicycle: true });
    };

    const openNewPetModal = () => {
        setEditingPet(null);
        setModals({ ...modals, pet: true });
    };

    const openEditPetModal = (index: number) => {
        setEditingPet({ index });
        setModals({ ...modals, pet: true });
    };

    const openNewTagModal = () => {
        setEditingTag(null);
        setModals({ ...modals, tag: true });
    };

    const openEditTagModal = (index: number) => {
        setEditingTag({ index });
        setModals({ ...modals, tag: true });
    };

    const handleSavePerson = (data: any) => {
        if (editingPerson) {
            setLists(prev => {
                const listName = editingPerson.list;
                const updatedList = prev[listName].map((item, idx) =>
                    idx === editingPerson.index ? { ...item, ...data } : item
                );
                return {
                    ...prev,
                    [listName]: updatedList
                };
            });
            setEditingPerson(null);
            return;
        }

        handleAddToList(personRole === 'Propietario' ? 'owners' : 'residents', data);
    };

    const handleSaveVehicle = (data: any) => {
        if (editingVehicle) {
            const currentItem = lists.vehicles[editingVehicle.index];
            const merged = { ...currentItem, ...data };
            setLists(prev => {
                const withoutCurrent = {
                    ...prev,
                    vehicles: prev.vehicles.filter((_, idx) => idx !== editingVehicle.index)
                };
                const { lists: nextLists } = addListItem(withoutCurrent, 'vehicles', merged);
                return nextLists;
            });
            setEditingVehicle(null);
            return;
        }

        handleAddToList('vehicles', data);
    };

    const handleSaveBicycle = (data: any) => {
        if (editingBicycle) {
            const currentItem = lists.bicycles[editingBicycle.index];
            const merged = { ...currentItem, ...data, type: 'Bicicleta' };
            setLists(prev => {
                const updatedList = prev.bicycles.map((item, idx) =>
                    idx === editingBicycle.index ? merged : item
                );
                return {
                    ...prev,
                    bicycles: updatedList
                };
            });
            setEditingBicycle(null);
            return;
        }

        handleAddToList('bicycles', data);
    };

    const handleSavePet = (data: any) => {
        if (editingPet) {
            setLists(prev => {
                const updatedList = prev.pets.map((item, idx) =>
                    idx === editingPet.index ? { ...item, ...data } : item
                );
                return {
                    ...prev,
                    pets: updatedList
                };
            });
            setEditingPet(null);
            return;
        }

        handleAddToList('pets', data);
    };

    const handleSaveTag = (value: string) => {
        if (editingTag) {
            setLists(prev => {
                const updatedTags = prev.tags.map((tag, idx) => (idx === editingTag.index ? value : tag));
                return {
                    ...prev,
                    tags: updatedTags
                };
            });
            setEditingTag(null);
            return;
        }

        handleAddToList('tags', value);
    };

    const saveUnitBasics = async () => {
        console.log(">>> [EditUnitPage] 1. Updating basic unit info...");
        const unitResponse = await updateUnitData(unit, {
            status: formData.status,
            isUnderRemodelation: formData.isUnderRemodelation,
            observations: formData.observations,
            tags: lists.tags,
            pets: lists.pets.length,
            bikes: lists.bicycles.length,
        });

        if (!unitResponse.success) {
            console.error(">>> [EditUnitPage] Basic unit update failed:", unitResponse.error);
            throw new Error(unitResponse.error || "Error al actualizar datos básicos");
        }
    };

    const syncPeople = async () => {
        console.log(">>> [EditUnitPage] 2. Handling person assignments...");
        const currentPeople = [...lists.owners, ...lists.residents];
        const initialPeople = [...(initialLists?.owners || []), ...(initialLists?.residents || [])];
        const initialPeopleByDoc = new Map(initialPeople.map((p: any) => [p.document_number, p]));

        for (const person of currentPeople) {
            const docNum = person.document_number;
            const isOwner = lists.owners.some(o => o.document_number === docNum);
            const wasInInitial = initialPeople.some(p => p.document_number === docNum);

            const personName = `${person.first_name} ${person.last_name}`;

            if (!wasInInitial) {
                console.log(`>>> [EditUnitPage] Checking if person ${docNum} exists in DB...`);
                const dbPerson = await fetchPersonByDocument(docNum);

                if (!dbPerson) {
                    console.log(`>>> [EditUnitPage] Person ${docNum} does not exist, creating...`);
                    const createRes = await createPerson(person);
                    if (!createRes.success) {
                        throw new Error(`Error al crear registro para ${personName}: ${createRes.error}`);
                    }
                }

                console.log(`>>> [EditUnitPage] Assigning person: ${personName}`);
                const assignRes = await assignPersonToUnit(unit, {
                    document_number: docNum,
                    is_owner: isOwner,
                    is_resident: !isOwner
                });

                if (!assignRes.success) {
                    throw new Error(`Error al vincular a ${personName}: ${assignRes.error}`);
                }
            } else {
                const initialPerson = initialPeopleByDoc.get(docNum);
                const updates = buildPersonUpdatePayload(person, initialPerson);
                if (Object.keys(updates).length > 0) {
                    const updateRes = await updatePersonData(docNum, updates);
                    if (!updateRes.success) {
                        console.warn(`>>> [EditUnitPage] Update warning for ${docNum}:`, updateRes.error);
                    }
                }
            }
        }

        for (const person of initialPeople) {
            const docNum = person.document_number;
            const isStillIn = currentPeople.some(p => p.document_number === docNum);
            const personName = `${person.first_name} ${person.last_name}`;
            if (!isStillIn) {
                console.log(`>>> [EditUnitPage] Unassigning person: ${personName}`);
                const unassignRes = await unassignPersonFromUnit(unit, docNum);
                if (!unassignRes.success) {
                    console.warn(`>>> [EditUnitPage] Unassign warning for ${docNum}:`, unassignRes.error);
                }
            }
        }
    };

    const syncVehicles = async () => {
        console.log(">>> [EditUnitPage] 3. Handling vehicle assignments...");
        const currentVehicles = [...lists.vehicles, ...lists.bicycles];
        const initialVehicles = [...(initialLists?.vehicles || []), ...(initialLists?.bicycles || [])];
        const initialVehiclesByPlate = new Map(initialVehicles.map((v: any) => [v.plate, v]));

        for (const v of currentVehicles) {
            const plate = v.plate;
            const initialVehicle = initialVehiclesByPlate.get(plate);
            if (!initialVehicle) {
                console.log(`>>> [EditUnitPage] Assigning vehicle/bike: ${plate}`);
                const vAssignRes = await assignVehicleToUnit(unit, v);
                if (!vAssignRes.success) {
                    throw new Error(`Error al registrar activo ${plate}: ${vAssignRes.error}`);
                }
            } else {
                const updates = buildVehicleUpdatePayload(v, initialVehicle);
                if (Object.keys(updates).length > 0) {
                    const updateRes = await updateVehicleData(unit, plate, updates);
                    if (!updateRes.success) {
                        console.warn(`>>> [EditUnitPage] Update warning for vehicle ${plate}:`, updateRes.error);
                    }
                }
            }
        }

        for (const v of initialVehicles) {
            const plate = v.plate;
            const stillIn = currentVehicles.some(cv => cv.plate === plate);
            if (!stillIn) {
                console.log(`>>> [EditUnitPage] Unassigning vehicle/bike: ${plate}`);
                const unassignRes = await unassignVehicleFromUnit(unit, plate);
                if (!unassignRes.success) {
                    console.warn(`>>> [EditUnitPage] Unassign warning for ${plate}:`, unassignRes.error);
                }
            }
        }
    };

    const syncPets = async () => {
        console.log(">>> [EditUnitPage] 4. Handling pet assignments...");
        const currentPets = lists.pets;
        const initialPets = initialLists?.pets || [];
        const initialPetsById = new Map(initialPets.map((p: any) => [String(p.id), p]));

        for (const pet of currentPets) {
            const wasInInitial = initialPets.some((ip: any) => String(ip.id) === String(pet.id));
            if (!wasInInitial) {
                const createPetRes = await createPetForUnit(unit, {
                    name: pet.name,
                    species: pet.type || 'Canino',
                    breed: pet.breed || null,
                    color: pet.color || null,
                    age: pet.age || null,
                    gender: pet.gender || 'Macho',
                    vaccinated: normalizeVaccinated(pet.vaccinated) ?? false,
                    observations: pet.observations || null,
                });
                if (!createPetRes.success) {
                    throw new Error(`Error al registrar mascota ${pet.name}: ${createPetRes.error}`);
                }
            } else if (Number.isFinite(Number(pet.id))) {
                const initialPet = initialPetsById.get(String(pet.id));
                const updates = buildPetUpdatePayload(pet, initialPet);
                if (Object.keys(updates).length > 0) {
                    const updateRes = await updatePetData(Number(pet.id), updates);
                    if (!updateRes.success) {
                        console.warn(`>>> [EditUnitPage] Update warning for pet ${pet.id}:`, updateRes.error);
                    }
                }
            }
        }

        for (const pet of initialPets) {
            const isStillIn = currentPets.some((cp: any) => String(cp.id) === String(pet.id));
            if (!isStillIn && Number.isFinite(Number(pet.id))) {
                const deletePetRes = await deletePet(Number(pet.id));
                if (!deletePetRes.success) {
                    console.warn(`>>> [EditUnitPage] Delete warning for pet ${pet.id}:`, deletePetRes.error);
                }
            }
        }
    };

    const syncDocuments = async () => {
        console.log(">>> [EditUnitPage] 5. Handling document persistence...");
        const docsToDelete = initialDocuments.filter(idoc => !documents.some(doc => doc.id === idoc.id));
        const docsToUpload = documents.filter(doc => doc.isTemporary && doc.tempFile);

        for (const doc of docsToDelete) {
            console.log(`>>> [EditUnitPage] Deleting document: ${doc.original_name}`);
            await deleteUnitDocument(unit, doc.id);
        }

        for (const doc of docsToUpload) {
            if (!doc.tempFile) continue;
            console.log(`>>> [EditUnitPage] Uploading document: ${doc.original_name}`);
            const docFormData = new FormData();
            docFormData.append('file', doc.tempFile);
            docFormData.append('document_type', doc.document_type);
            const uploadRes = await uploadUnitDocument(unit, docFormData);
            if (!uploadRes.success) {
                throw new Error(`Error al subir ${doc.document_type}: ${uploadRes.error}`);
            }
        }
    };

    const syncParking = async () => {
        console.log(">>> [EditUnitPage] 6. Handling parking assignments...");
        const currentParkingIds = lists.parkingSpaces.map(p => p.id);
        const initialParkingIds = initialLists?.parkingSpaces.map((p: any) => p.id) || [];

        for (const pId of currentParkingIds) {
            if (!initialParkingIds.includes(pId)) {
                const assignParkRes = await assignParkingToUnit(unit, pId);
                if (!assignParkRes.success) {
                    throw new Error(`Error al asignar parqueadero: ${assignParkRes.error}`);
                }
            }
        }

        for (const pId of initialParkingIds) {
            if (!currentParkingIds.includes(pId)) {
                const unassignParkRes = await unassignParkingFromUnit(unit, pId);
                if (!unassignParkRes.success) {
                    console.warn(`>>> [EditUnitPage] Unassign parking warning for ${pId}:`, unassignParkRes.error);
                }
            }
        }
    };

    const handleSave = async (e?: React.FormEvent) => {
        console.log(">>> [EditUnitPage] handleSave triggered", { unit, formData, lists });
        if (e) e.preventDefault();

        if (missingDocs.length > 0) {
            setError(`Faltan documentos obligatorios: ${missingDocs.join(", ")}`);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        if (!formData) {
            console.error(">>> [EditUnitPage] No formData available to save");
            setError("No hay datos cargados para guardar.");
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            await saveUnitBasics();
            await syncPeople();
            await syncVehicles();
            await syncPets();
            await syncDocuments();
            await syncParking();

            console.log(">>> [EditUnitPage] Save successful, invalidating caches and redirecting...");

            // Force refresh global data
            await queryClient.invalidateQueries({ queryKey: ['peopleData'] });
            await queryClient.invalidateQueries({ queryKey: ['directoryData'] });
            await queryClient.invalidateQueries({ queryKey: ['vehiclesData'] });
            await queryClient.invalidateQueries({ queryKey: ['petsData'] });
            await queryClient.invalidateQueries({ queryKey: ['parkingData'] });

            router.refresh();
            setTimeout(() => {
                pushOptimistic(`/apartamentos/${unit}`);
            }, 100);
        } catch (err: any) {
            console.error(">>> [EditUnitPage] Save error exception:", err);
            setError(err.message || 'Error de conexión con el servidor');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <EditUnitSkeleton />;
    }

    if (!formData) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-6 p-12 text-center min-h-[400px]">
                <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-[2rem] flex items-center justify-center shadow-inner">
                    <AlertCircle size={40} />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tight">Datos no disponibles</h2>
                    <p className="text-zinc-500 max-w-md mx-auto">
                        No logramos recuperar la información de la unidad <span className="font-bold text-zinc-900">{unit}</span>.
                        Verifique su conexión o contacte al administrador del sistema.
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => router.back()}
                    className="rounded-2xl h-12 px-8 border-zinc-200 font-bold"
                >
                    <ChevronLeft size={18} className="mr-2" /> Volver al Directorio
                </Button>
            </div >
        );
    }

    return (
        <div className="p-4 md:p-8 mx-auto space-y-8 animate-in fade-in duration-500 pb-32">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-zinc-400 hover:text-zinc-600 text-[10px] font-black transition-colors uppercase tracking-[0.2em] mb-2"
                    >
                        <ChevronLeft size={14} /> Volver sin guardar
                    </button>
                    <h1 className="text-4xl font-black text-zinc-900 tracking-tight">
                        Gestión de <span className="text-blue-600">Apartamento {unit}</span>
                    </h1>
                    <p className="text-zinc-500 text-sm font-medium">Panel administrativo de actualización de registros maestros.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={() => router.back()}
                        className="h-12 px-6 rounded-2xl border-zinc-200 font-bold text-zinc-500 hover:bg-zinc-50"
                    >
                        <X size={18} className="mr-2" /> Cancelar
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving || !canSave}
                        className={cn(
                            "h-12 px-8 rounded-2xl font-bold shadow-xl transition-all hover:scale-[1.02] active:scale-95",
                            canSave ? "bg-zinc-900 hover:bg-zinc-800 text-white shadow-zinc-200" : "bg-zinc-100 text-zinc-400 shadow-none cursor-not-allowed"
                        )}
                    >
                        {isSaving ? <Loader2 size={18} className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
                        Aplicar Cambios
                    </Button>
                </div>
            </div>

            {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-600 p-4 rounded-3xl flex items-center gap-3">
                    <AlertCircle size={20} />
                    <p className="text-sm font-black uppercase tracking-tight">{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Column 1: Config & Docs */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Status Card */}
                    <ListSectionCard
                        title="Configuración Vital"
                        icon={<ShieldCheck size={20} />}
                        iconWrapperClassName="bg-blue-50 text-blue-600"
                        className="space-y-6"
                    >
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Estado Operativo</Label>
                                <Select
                                    name="status"
                                    value={formData.status}
                                    onChange={(e) => handleStatusChange(e.target.value)}
                                >
                                    <option value="Propietario">Propietario Residente</option>
                                    <option value="Arrendado">Unidad Arrendada</option>
                                    <option value="Desocupado">Unidad Desocupada</option>
                                </Select>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-8 h-8 rounded-xl flex items-center justify-center transition-colors",
                                        formData.isUnderRemodelation ? "bg-amber-100 text-amber-600" : "bg-zinc-100 text-zinc-400"
                                    )}>
                                        <Construction size={16} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-tight text-zinc-900">Remodelación / Obra</p>
                                        <p className="text-[9px] text-zinc-500 font-medium tracking-tighter uppercase">Estado excepcional</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setFormData({ ...formData, isUnderRemodelation: !formData.isUnderRemodelation })}
                                    className={cn(
                                        "w-10 h-5 rounded-full transition-all relative",
                                        formData.isUnderRemodelation ? "bg-amber-500" : "bg-zinc-200"
                                    )}
                                >
                                    <div className={cn(
                                        "w-3.5 h-3.5 bg-white rounded-full absolute top-0.75 transition-all",
                                        formData.isUnderRemodelation ? "right-1" : "left-1"
                                    )} />
                                </button>
                            </div>

                            {/* Documentación Obligatoria */}
                            <div className="space-y-4 pt-4 border-t border-zinc-100">
                                <DocumentBox
                                    label="Certificado de Propiedad"
                                    type="Certificado de Propiedad"
                                    documents={documents}
                                    onUpload={handleDocumentUpsert}
                                    onDelete={handleDocumentDelete}
                                    unitId={unit}
                                    required
                                />

                                {isStatusArrendado && (
                                    <DocumentBox
                                        label="Contrato de Arrendamiento"
                                        type="Contrato de Arrendamiento"
                                        documents={documents}
                                        onUpload={handleDocumentUpsert}
                                        onDelete={handleDocumentDelete}
                                        unitId={unit}
                                        required
                                    />
                                )}

                                {isUnderRemodelation && (
                                    <DocumentBox
                                        label="Contrato de Obra"
                                        type="Contrato de Obra"
                                        documents={documents}
                                        onUpload={handleDocumentUpsert}
                                        onDelete={handleDocumentDelete}
                                        unitId={unit}
                                        required
                                    />
                                )}
                            </div>
                        </div>
                    </ListSectionCard>
                </div>

                {/* Column 2: Lists Management */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Personnel Section */}
                    <ListSectionCard
                        title="Gestión de Personas"
                        icon={<User size={20} />}
                        iconWrapperClassName="bg-purple-50 text-purple-600"
                        className="space-y-8"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {/* Propietarios */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                        Propietarios <HelpCircle size={10} className="text-zinc-300" />
                                    </Label>
                                    <div className="flex items-center gap-1.5">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 w-8 rounded-xl p-0 border-blue-100 text-blue-600 hover:bg-blue-50"
                                            onClick={() => {
                                                openNewPersonModal('Propietario');
                                            }}
                                            title="Nuevo Propietario"
                                        >
                                            <Plus size={14} />
                                        </Button>
                                        <SearchDropdown
                                            type="person"
                                            color="blue"
                                            excludeMinors
                                            onSelect={(item) => handleSelectExisting('owners', item)}
                                            placeholder="Buscar propietario..."
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    {lists.owners.map((p, i) => (
                                        <ListItemRow
                                            key={i}
                                            className="bg-zinc-50 border-zinc-100"
                                            leading={(
                                                <div className={cn(
                                                    "w-8 h-8 rounded-xl flex items-center justify-center shadow-sm border",
                                                    p.is_minor ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-blue-50 text-blue-600 border-blue-100"
                                                )}>
                                                    {p.is_minor ? <Baby size={14} /> : <User size={14} />}
                                                </div>
                                            )}
                                            title={`${p.first_name} ${p.last_name}`}
                                            subtitle={p.document_number ? `${p.document_type || 'CC'} ${p.document_number}` : null}
                                            titleClassName="text-sm font-bold text-zinc-700"
                                            subtitleClassName="text-[10px] text-zinc-400 font-medium"
                                            onEdit={() => openEditPersonModal('owners', i)}
                                            editIcon={<Pencil size={14} />}
                                            editButtonLabel="Editar propietario"
                                            onRemove={() => handleRemoveFromList('owners', i)}
                                            removeIcon={<X size={14} />}
                                            removeButtonLabel="Eliminar propietario"
                                        />
                                    ))}
                                    {lists.owners.length === 0 && (
                                        <EmptyState message="No hay propietarios registrados" />
                                    )}
                                </div>
                            </div>

                            {/* Residentes */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                        Residentes <HelpCircle size={10} className="text-zinc-300" />
                                    </Label>
                                    <div className="flex items-center gap-1.5">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 w-8 rounded-xl p-0 border-purple-100 text-purple-600 hover:bg-purple-50"
                                            onClick={() => {
                                                openNewPersonModal('Residente');
                                            }}
                                            title="Nuevo Residente"
                                        >
                                            <Plus size={14} />
                                        </Button>
                                        <SearchDropdown
                                            type="person"
                                            color="purple"
                                            onSelect={(item) => handleSelectExisting('residents', item)}
                                            placeholder="Buscar residente..."
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    {lists.residents.map((p, i) => (
                                        <ListItemRow
                                            key={i}
                                            className="bg-zinc-50 border-zinc-100"
                                            leading={(
                                                <div className={cn(
                                                    "w-8 h-8 rounded-xl flex items-center justify-center shadow-sm border",
                                                    p.is_minor ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-blue-50 text-blue-600 border-blue-100"
                                                )}>
                                                    {p.is_minor ? <Baby size={14} /> : <User size={14} />}
                                                </div>
                                            )}
                                            title={`${p.first_name} ${p.last_name}`}
                                            subtitle={p.document_number ? `${p.document_type || 'CC'} ${p.document_number}` : null}
                                            titleClassName="text-sm font-bold text-zinc-700"
                                            subtitleClassName="text-[10px] text-zinc-400 font-medium"
                                            onEdit={() => openEditPersonModal('residents', i)}
                                            editIcon={<Pencil size={14} />}
                                            editButtonLabel="Editar residente"
                                            onRemove={() => handleRemoveFromList('residents', i)}
                                            removeIcon={<X size={14} />}
                                            removeButtonLabel="Eliminar residente"
                                        />
                                    ))}
                                    {lists.residents.length === 0 && (
                                        <EmptyState message="No hay residentes registrados" />
                                    )}
                                </div>
                            </div>
                        </div>
                    </ListSectionCard>

                    {/* Infrastructure & Assets */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Vehicles Card (Motorized) */}
                        <ListSectionCard
                            title="Vehículos"
                            subtitle="Automóviles y motos"
                            icon={(
                                <div className="flex gap-2 items-center">
                                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                                        <Car size={16} />
                                    </div>
                                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                                        <Motorbike size={16} />
                                    </div>
                                </div>
                            )}
                            iconWrapperClassName="w-20 bg-transparent border-none p-0 flex items-center justify-center"
                            titleClassName="text-[10px] tracking-widest leading-none"
                            className="space-y-6"
                            actions={(
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 w-8 rounded-xl p-0 border-amber-100 text-amber-600 hover:bg-amber-50"
                                        onClick={openNewVehicleModal}
                                        title="Nuevo Vehículo"
                                    >
                                        <Plus size={14} />
                                    </Button>
                                    <SearchDropdown
                                        type="vehicle"
                                        color="amber"
                                        onSelect={(item) => handleSelectExisting('vehicles', item)}
                                        placeholder="Buscar..."
                                    />
                                </>
                            )}
                        >
                            <div className="space-y-3">
                                {lists.vehicles.map((v, i) => (
                                    <ListItemRow
                                        key={i}
                                        className="bg-amber-50/10 border-amber-100/50"
                                        leading={(
                                            <div className={cn(
                                                "w-8 h-8 rounded-xl flex items-center justify-center shadow-sm border bg-white",
                                                v.type === 'Motocicleta' ? "text-blue-600 border-blue-100" : "text-amber-600 border-amber-100"
                                            )}>
                                                {v.type === 'Motocicleta' ? <Motorbike size={14} /> : <Car size={14} />}
                                            </div>
                                        )}
                                        title={v.plate}
                                        subtitle={`${v.type || 'Vehículo'} / ${v.status || 'Activo'}`}
                                        titleClassName="text-xs font-black text-zinc-800 tracking-tight"
                                        subtitleClassName="text-[9px] text-zinc-400 font-bold uppercase tracking-tighter"
                                        onEdit={() => openEditVehicleModal(i)}
                                        editIcon={<Pencil size={14} />}
                                        editButtonLabel="Editar vehículo"
                                        onRemove={() => openVehicleRemovalModal('vehicles', i)}
                                        removeIcon={<X size={14} />}
                                        removeButtonLabel="Quitar vehículo"
                                    />
                                ))}
                                {lists.vehicles.length === 0 && (
                                    <EmptyState message="Sin vehículos asociados" className="py-6 px-0" />
                                )}
                            </div>
                        </ListSectionCard>

                        {/* Bicycles Card */}
                        <ListSectionCard
                            title="Bicicletas e Items"
                            subtitle="Movilidad alternativa"
                            icon={<Bike size={20} />}
                            iconWrapperClassName="bg-emerald-50 text-emerald-600 border border-emerald-100/50"
                            titleClassName="text-[10px] tracking-widest leading-none"
                            className="space-y-6"
                            actions={(
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 w-8 rounded-xl p-0 border-emerald-100 text-emerald-600 hover:bg-emerald-50"
                                        onClick={() => {
                                            openNewBicycleModal();
                                        }}
                                        title="Nueva Bicicleta"
                                    >
                                        <Plus size={14} />
                                    </Button>
                                    <SearchDropdown
                                        type="vehicle"
                                        color="rose"
                                        onSelect={(item) => handleSelectExisting('vehicles', item)}
                                        placeholder="Buscar..."
                                    />
                                </>
                            )}
                        >
                            <div className="space-y-3">
                                {lists.bicycles.map((b, i) => (
                                    <ListItemRow
                                        key={i}
                                        className="bg-emerald-50/20 border-emerald-100"
                                        leading={(
                                            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-50">
                                                <Bike size={14} />
                                            </div>
                                        )}
                                        title={b.plate}
                                        subtitle={`Bicicleta / ${b.status || 'Activo'}`}
                                        titleClassName="text-xs font-black text-zinc-800 tracking-tight"
                                        subtitleClassName="text-[9px] text-zinc-400 font-bold uppercase tracking-tighter"
                                        onEdit={() => openEditBicycleModal(i)}
                                        editIcon={<Pencil size={14} />}
                                        editButtonLabel="Editar bicicleta"
                                        onRemove={() => openVehicleRemovalModal('bicycles', i)}
                                        removeIcon={<X size={14} />}
                                        removeButtonLabel="Quitar bicicleta"
                                    />
                                ))}
                                {lists.bicycles.length === 0 && (
                                    <EmptyState message="Sin bicicletas registradas" className="py-6 px-0" />
                                )}
                            </div>
                        </ListSectionCard>
                    </div>

                    {/* Pets Card */}
                    <div className="mt-8">
                        <ListSectionCard
                            title="Mascotas"
                            subtitle="Compañeros del hogar"
                            icon={<PawPrint size={20} />}
                            iconWrapperClassName="bg-rose-50 text-rose-600 border border-rose-100/50"
                            titleClassName="text-[10px] tracking-widest leading-none"
                            className="space-y-6"
                            actions={(
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 w-8 rounded-xl p-0 border-rose-100 text-rose-600 hover:bg-rose-50"
                                        onClick={openNewPetModal}
                                        title="Nueva Mascota"
                                    >
                                        <Plus size={14} />
                                    </Button>
                                    <SearchDropdown
                                        type="pet"
                                        color="rose"
                                        onSelect={(item) => handleSelectExisting('pets', item)}
                                        placeholder="Buscar..."
                                    />
                                </>
                            )}
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {lists.pets.map((pet, i) => (
                                    <ListItemRow
                                        key={i}
                                        className="bg-rose-50/10 border-rose-100"
                                        leading={<Heart size={14} className="text-rose-500 fill-rose-500" />}
                                        title={pet.name}
                                        subtitle={pet.type}
                                        titleClassName="text-xs font-bold text-zinc-800"
                                        subtitleClassName="text-[9px] text-zinc-500 uppercase font-black tracking-tighter"
                                        onEdit={() => openEditPetModal(i)}
                                        editIcon={<Pencil size={12} />}
                                        editButtonLabel="Editar mascota"
                                        onRemove={() => handleRemoveFromList('pets', i)}
                                        removeIcon={<Trash2 size={12} />}
                                        removeButtonLabel="Eliminar mascota"
                                    />
                                ))}
                                {lists.pets.length === 0 && (
                                    <EmptyState message="Sin mascotas registradas" className="col-span-full py-6 px-0" />
                                )}
                            </div>
                        </ListSectionCard>
                    </div>

                    {/* Access & Tags */}
                    <ListSectionCard
                        title="Control de Acceso (Tags)"
                        icon={<Key size={20} />}
                        iconWrapperClassName="bg-zinc-50 text-zinc-600 border border-zinc-200/50"
                        className="space-y-8"
                    >
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {lists.tags.map((id, i) => (
                                <div key={i} className="relative group">
                                    <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex flex-col items-center gap-1 group-hover:border-blue-200 transition-all">
                                        <Smartphone size={16} className="text-zinc-400" />
                                        <span className="text-[10px] font-black text-zinc-900"># {id}</span>
                                    </div>
                                    <button
                                        onClick={() => openEditTagModal(i)}
                                        className="absolute -top-1 -left-1 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg transform scale-0 group-hover:scale-100 transition-transform"
                                        aria-label="Editar tag"
                                    >
                                        <Pencil size={10} />
                                    </button>
                                    <button
                                        onClick={() => handleRemoveFromList('tags', i)}
                                        className="absolute -top-1 -right-1 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg transform scale-0 group-hover:scale-100 transition-transform"
                                    >
                                        <X size={10} />
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={openNewTagModal}
                                className="p-4 rounded-2xl border-2 border-dashed border-zinc-100 flex flex-col items-center justify-center gap-1 hover:bg-zinc-50 hover:border-blue-200 transition-all text-zinc-300"
                            >
                                <Plus size={16} />
                                <span className="text-[9px] font-bold uppercase tracking-widest">Añadir</span>
                            </button>
                        </div>
                    </ListSectionCard>

                    {/* Internal Notes */}
                    <ListSectionCard
                        title="Observaciones Privadas"
                        icon={<MessageSquare size={20} />}
                        iconWrapperClassName="bg-amber-50 text-amber-600 border border-amber-100"
                        titleClassName="text-amber-700"
                        className="bg-amber-50/50 border-amber-200/50 space-y-6"
                    >
                        <Textarea
                            className="bg-white border-amber-200 text-zinc-900 placeholder:text-zinc-400 rounded-3xl min-h-[150px] focus:ring-amber-500/20"
                            placeholder="Ingrese notas especiales para la administración, historial de conflictos, o acuerdos de pago..."
                            value={formData.observations}
                            onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                        />
                        <div className="flex items-center gap-2 text-[10px] text-amber-600/70 font-bold uppercase tracking-widest">
                            <AlertCircle size={12} /> Solo visible por la administración
                        </div>
                    </ListSectionCard>
                </div>
            </div>

            {/* Modals */}
            <PersonFormModal
                isOpen={modals.person}
                role={personRole}
                initialData={editingPerson ? resolvePersonEditData(editingPerson.list, editingPerson.index) : undefined}
                onClose={() => {
                    setModals({ ...modals, person: false });
                    setEditingPerson(null);
                }}
                onSave={handleSavePerson}
            />

            <PetFormModal
                isOpen={modals.pet}
                initialData={editingPet ? lists.pets[editingPet.index] : undefined}
                onClose={() => {
                    setModals({ ...modals, pet: false });
                    setEditingPet(null);
                }}
                onSave={handleSavePet}
            />

            <VehicleFormModal
                isOpen={modals.vehicle}
                initialData={editingVehicle ? lists.vehicles[editingVehicle.index] : undefined}
                onClose={() => {
                    setModals({ ...modals, vehicle: false });
                    setEditingVehicle(null);
                }}
                onSave={handleSaveVehicle}
                availableParkingSpaces={lists.parkingSpaces.filter(p => {
                    const isUsedByOther = lists.vehicles.some((v, idx) => {
                        if (editingVehicle && idx === editingVehicle.index) return false;
                        return v.parking_space_id?.toString() === p.id?.toString();
                    });
                    return !isUsedByOther;
                })}
            />

            <BicycleFormModal
                isOpen={modals.bicycle}
                initialData={editingBicycle ? lists.bicycles[editingBicycle.index] : undefined}
                onClose={() => {
                    setModals({ ...modals, bicycle: false });
                    setEditingBicycle(null);
                }}
                onSave={handleSaveBicycle}
            />

            <TagFormModal
                isOpen={modals.tag}
                initialData={editingTag ? lists.tags[editingTag.index] : undefined}
                onClose={() => {
                    setModals({ ...modals, tag: false });
                    setEditingTag(null);
                }}
                onSave={handleSaveTag}
            />

            <VehicleUnassignModal
                isOpen={!!vehicleRemoval}
                plate={vehicleRemoval?.plate || ''}
                onClose={() => setVehicleRemoval(null)}
                onUnassign={applyVehicleRemoval}
                showDelete={false}
                note="El cambio se aplicara al guardar."
            />

            <Modal
                isOpen={isVacancyConfirmOpen}
                onClose={() => setIsVacancyConfirmOpen(false)}
                title="Cambiar a Unidad Desocupada"
                description="Esta acción limpiará los registros de ocupación en esta pantalla y solo se aplicará cuando guardes los cambios."
                size="md"
                footer={
                    <>
                        <Button
                            variant="outline"
                            onClick={() => setIsVacancyConfirmOpen(false)}
                            className="rounded-2xl h-10 px-4"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={applyVacancyChange}
                            className="rounded-2xl h-10 px-5 bg-rose-600 hover:bg-rose-700 text-white"
                        >
                            Aceptar
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3">
                        <AlertCircle className="text-rose-600 shrink-0" size={20} />
                        <div>
                            <p className="text-sm font-bold text-rose-900">
                                ¿Está seguro de desvincular residentes, mascotas y vehículos de esta unidad?
                            </p>
                            <p className="text-xs text-rose-800/80 mt-1">
                                Si aceptas, se limpiarán los registros asociados a la ocupación actual, pero el cambio real solo se enviará al presionar <span className="font-bold">Aplicar Cambios</span>.
                            </p>
                        </div>
                    </div>

                    {vacancyImpactLabels.length > 0 && (
                        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                            <p className="text-[11px] font-black uppercase tracking-widest text-zinc-500">
                                Se limpiarán
                            </p>
                            <p className="text-sm font-semibold text-zinc-800 mt-1">
                                {vacancyImpactLabels.join(', ')}
                            </p>
                        </div>
                    )}
                </div>
            </Modal>

            {/* Sticky Mobile Fab */}
            <div className="md:hidden fixed bottom-6 left-6 right-6">
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full h-14 bg-zinc-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3"
                >
                    {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                    Guardar Cambios
                </Button>
            </div>
        </div>
    );
}
