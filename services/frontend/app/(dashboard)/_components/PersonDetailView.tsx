'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useOptimisticNavigation } from "@/app/_contexts/OptimisticNavigationContext";
import {
    User, Phone, Building2,
    ShieldCheck, AlertCircle, FileText,
    HeartPulse, Edit, Trash2, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { fetchPersonByDocument, deletePerson } from '@/lib/actions/smart.actions';
import { PersonData } from '@/lib/actions/people.actions';
import { DetailSection, DetailItem } from '../apartamentos/_components/DetailComponents';
import { Breadcrumbs, BreadcrumbItem } from '../apartamentos/_components/Breadcrumbs';
import { PersonDetailSkeleton } from '@/components/skeletons/PageSkeletons';
import { Loader2 } from 'lucide-react';

interface PersonDetailViewProps {
    personId: string;
    unitId?: string; // Optional unit context
    from?: string | null;
}

export function PersonDetailView({ personId, unitId, from }: PersonDetailViewProps) {
    const router = useRouter();
    const { pushOptimistic } = useOptimisticNavigation();
    const [person, setPerson] = React.useState<PersonData | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [deleteError, setDeleteError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const loadPerson = async () => {
            setLoading(true);
            const data = await fetchPersonByDocument(personId);
            if (data) {
                setPerson(data);
            }
            setLoading(false);
        };
        loadPerson();
    }, [personId]);

    const isOwner = person?.role === 'Propietario';
    const associatedUnits = person?.unit_assignments || [];

    if (loading) {
        return <PersonDetailSkeleton />;
    }

    if (!person) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div className="w-24 h-24 bg-zinc-100 rounded-full flex items-center justify-center mb-6">
                    <User size={40} className="text-zinc-400" />
                </div>
                <h2 className="text-2xl font-bold text-zinc-900">Persona No Encontrada</h2>
                <Button onClick={() => router.back()} className="mt-8 bg-zinc-900 text-white rounded-xl px-6">
                    Volver
                </Button>
            </div>
        );
    }

    const breadcrumbs: BreadcrumbItem[] = [];
    const fullName = `${person.first_name} ${person.last_name}`;
    const demographicFields: Array<{ key: keyof Pick<PersonData, 'is_minor' | 'is_elderly' | 'has_disability' | 'is_realtor'>; label: string }> = [
        { key: 'is_minor', label: 'Es Menor de Edad' },
        { key: 'is_elderly', label: 'Es Adulto Mayor' },
        { key: 'has_disability', label: 'Tiene Discapacidad' },
        { key: 'is_realtor', label: 'Inmobiliaria' }
    ];
    const editSearch = new URLSearchParams();
    if (from) editSearch.set('from', from);
    if (unitId) editSearch.set('unit', unitId);
    editSearch.set('editMode', 'detail');
    const editSuffix = editSearch.toString();
    const editPath = `/personas/${person.document_number}/edit${editSuffix ? `?${editSuffix}` : ''}`;

    if (unitId) {
        const fromParam = from ? `&from=${from}` : '';
        breadcrumbs.push(
            {
                label: from === 'personas' ? 'Directorio de Personas' : from === 'search' ? 'Resultados' : 'Directorio',
                onClick: () => pushOptimistic(from === 'personas' ? '/personas' : from === 'search' ? '/search-results' : '/apartamentos')
            },
            { label: `Unidad ${unitId}`, onClick: () => pushOptimistic(`/apartamentos/${unitId}?tab=personnel${fromParam}`) },
            { label: person.first_name }
        );
    } else {
        breadcrumbs.push(
            { label: 'Directorio de Personas', onClick: () => pushOptimistic('/personas') },
            { label: person.first_name }
        );
    }

    return (
        <div className="p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="space-y-4">
                    <Breadcrumbs items={breadcrumbs} />
                    <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm ${isOwner ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                            <User size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-zinc-900 tracking-tight leading-none uppercase">
                                {fullName}
                            </h1>
                            <div className="flex items-center gap-2 mt-2">
                                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md ${isOwner ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-purple-50 text-purple-600 border border-purple-100'}`}>
                                    {person.role}
                                </span>
                                <span className="text-xs text-zinc-400 font-medium flex items-center gap-1">
                                    <FileText size={12} /> {person.document_type} {person.document_number}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => pushOptimistic(editPath)}
                        className="h-10 px-4 rounded-xl gap-2 font-bold text-zinc-600 border-zinc-200 hover:bg-zinc-50"
                    >
                        <Edit size={16} /> Editar
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="h-10 px-4 rounded-xl gap-2 font-bold text-rose-600 border-rose-100 hover:bg-rose-50 hover:border-rose-200"
                    >
                        <Trash2 size={16} /> Eliminar
                    </Button>
                </div>
            </div>

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    if (!isDeleting) {
                        setIsDeleteModalOpen(false);
                        setDeleteError(null);
                    }
                }}
                title="Eliminar Persona"
                description="Esta acción es permanente y desvinculará a la persona de todas sus unidades."
                size="md"
                footer={
                    <>
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteModalOpen(false)}
                            disabled={isDeleting}
                            className="rounded-xl h-10 px-4"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={async () => {
                                if (!person) return;
                                setIsDeleting(true);
                                setDeleteError(null);
                                const result = await deletePerson(person.document_number);
                                if (result.success) {
                                    // Determinar si podemos volver atrás o si debemos ir al directorio
                                    if (window.history.length > 1) {
                                        router.back();
                                    } else {
                                        pushOptimistic('/personas');
                                    }
                                } else {
                                    setDeleteError(result.error || 'No se pudo eliminar a la persona.');
                                    setIsDeleting(false);
                                }
                            }}
                            disabled={isDeleting}
                            className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl h-10 px-6 font-bold flex items-center gap-2"
                        >
                            {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                            {isDeleting ? 'Eliminando...' : 'Confirmar Eliminación'}
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3">
                        <AlertCircle className="text-rose-600 shrink-0" size={20} />
                        <div>
                            <p className="text-sm font-bold text-rose-900">¿Estás seguro de eliminar a {fullName}?</p>
                            <p className="text-xs text-rose-800/80 mt-1">
                                Se eliminará el registro maestro y todas sus asignaciones vigentes en torres y apartamentos.
                            </p>
                        </div>
                    </div>
                    {deleteError && (
                        <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100 font-medium">
                            {deleteError}
                        </div>
                    )}
                </div>
            </Modal>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <DetailSection title="Información de Contacto" icon={Phone} iconColor="text-emerald-600" iconBg="bg-emerald-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6">
                            <DetailItem label="Correo Electrónico" value={person.email} className="col-span-2" variant="large" />
                            <DetailItem label="Teléfonos" value={person.phone} />
                            <DetailItem label="Fecha de Registro" value={person.registration_date} />
                        </div>
                    </DetailSection>

                    <DetailSection title="Datos Demográficos" icon={HeartPulse} iconColor="text-rose-600" iconBg="bg-rose-50">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {demographicFields.map((item) => (
                                <div key={item.key} className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 text-center">
                                    <p className="text-[10px] uppercase font-bold text-zinc-400 mb-1">{item.label}</p>
                                    <p className={`font-bold ${person[item.key] ? 'text-rose-600' : 'text-zinc-700'}`}>
                                        {person[item.key] ? 'Sí' : 'No'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </DetailSection>

                    {person.observations && (
                        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 flex items-start gap-4">
                            <AlertCircle className="text-amber-600 shrink-0 mt-1" size={20} />
                            <div>
                                <h3 className="text-sm font-bold text-amber-900 mb-1">Observaciones</h3>
                                <p className="text-sm text-amber-800/80 leading-relaxed">{person.observations}</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-zinc-50 rounded-xl text-zinc-400">
                                <Building2 size={20} />
                            </div>
                            <h2 className="text-lg font-bold text-zinc-900">Propiedades Asociadas</h2>
                        </div>
                        <div className="space-y-3">
                            {associatedUnits.length > 0 ? (
                                associatedUnits.map((u, i) => {
                                    const unitLabel = u.unit_id || `${u.tower}-${u.unit_number}`;
                                    const roleBadges = [
                                        ...(u.is_owner ? [{
                                            label: 'Propietario',
                                            className: 'bg-blue-50 text-blue-600 border-blue-100'
                                        }] : []),
                                        ...(u.is_resident ? [{
                                            label: 'Residente',
                                            className: 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                        }] : []),
                                    ];

                                    if (roleBadges.length === 0 && person?.role) {
                                        roleBadges.push({
                                            label: person.role,
                                            className: person.role === 'Propietario'
                                                ? 'bg-blue-50 text-blue-600 border-blue-100'
                                                : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                        });
                                    }

                                    return (
                                        <button key={i} onClick={() => pushOptimistic(`/apartamentos/${unitLabel}`)} className="w-full flex items-center justify-between p-3 bg-zinc-50 hover:bg-zinc-100 rounded-xl transition-colors border border-zinc-100 group">
                                            <div className="min-w-0 text-left">
                                                <span className="block font-bold text-zinc-700 text-sm">Unidad {unitLabel}</span>
                                                <div className="flex flex-wrap gap-1.5 mt-2">
                                                    {roleBadges.map((badge) => (
                                                        <span
                                                            key={badge.label}
                                                            className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border ${badge.className}`}
                                                        >
                                                            {badge.label}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <ChevronRight className="text-zinc-300 group-hover:text-emerald-500 transition-colors" size={16} />
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="p-8 text-center bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                                    <div className="text-zinc-400 mb-2">No hay unidades</div>
                                    <div className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest">Sin asignar</div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-zinc-50 rounded-3xl p-6 border border-zinc-200/60 space-y-4">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="text-zinc-600" size={20} />
                            <h3 className="font-bold text-zinc-900">Privacidad y Datos</h3>
                        </div>
                        <div className="space-y-3 pt-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-zinc-500 font-medium">Autoriza Datos</span>
                                <span className={`font-black ${person.data_authorization ? 'text-emerald-600' : 'text-rose-600'}`}>{person.data_authorization ? 'Sí' : 'No'}</span>
                            </div>
                            <div className="h-px bg-zinc-200/60" />
                            <p className="text-[10px] text-zinc-400 leading-relaxed uppercase font-bold tracking-wider">La información está protegida bajo la ley de tratamiento de datos.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
