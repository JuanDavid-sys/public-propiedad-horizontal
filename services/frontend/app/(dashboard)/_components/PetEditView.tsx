'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useOptimisticNavigation } from "@/app/_contexts/OptimisticNavigationContext";
import { ArrowLeft, Loader2, PawPrint, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { fetchPetById, updatePetData } from '@/lib/actions/smart.actions';
import { Breadcrumbs, BreadcrumbItem } from '../apartamentos/_components/Breadcrumbs';
import { PetEditSkeleton } from '@/components/skeletons/PageSkeletons';

interface PetEditViewProps {
    unitId: string;
    petId: number | string;
    from?: string | null;
}

interface PetFormState {
    name: string;
    species: string;
    breed: string;
    color: string;
    age: string;
    gender: string;
    vaccinated: boolean;
    status: string;
    observations: string;
}

export function PetEditView({ unitId, petId, from }: PetEditViewProps) {
    const router = useRouter();
    const { pushOptimistic } = useOptimisticNavigation();
    const searchParamsFromURL = useSearchParams();
    const editMode = searchParamsFromURL.get('editMode');

    const [loading, setLoading] = React.useState(true);
    const [isSaving, setIsSaving] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [resolvedUnitId, setResolvedUnitId] = React.useState(unitId);
    const [form, setForm] = React.useState<PetFormState>({
        name: '',
        species: 'Canino',
        breed: '',
        color: '',
        age: '',
        gender: 'No especificado',
        vaccinated: false,
        status: 'Al Día',
        observations: '',
    });

    React.useEffect(() => {
        const loadPet = async () => {
            const numericId = typeof petId === 'string' ? parseInt(petId) : petId;
            if (isNaN(numericId)) {
                setLoading(false);
                setError('El identificador de la mascota no es válido.');
                return;
            }

            setLoading(true);
            setError(null);
            const pet = await fetchPetById(numericId);
            if (!pet) {
                setLoading(false);
                setError('No fue posible encontrar la mascota solicitada.');
                return;
            }
            setResolvedUnitId(pet.unit || unitId);
            setForm({
                name: pet.name || '',
                species: pet.species || 'Canino',
                breed: pet.breed || '',
                color: pet.color || '',
                age: pet.age || '',
                gender: pet.gender || 'No especificado',
                vaccinated: !!pet.vaccinated,
                status: pet.status || (pet.vaccinated ? 'Al Día' : 'Pendiente'),
                observations: pet.observations || '',
            });
            setLoading(false);
        };
        loadPet();
    }, [petId, unitId]);

    const numericIdForSave = typeof petId === 'string' ? parseInt(petId) : petId;

    const detailPath = `/apartamentos/${resolvedUnitId}/mascotas/${petId}${from ? `?from=${from}` : ''}`;
    const unitPath = `/apartamentos/${resolvedUnitId}?tab=pets${from ? `&from=${from}` : ''}`;
    const navigationPath = editMode === 'card' ? unitPath : detailPath;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            label: from === 'mascotas' ? 'Censo de Mascotas' : from === 'search' ? 'Resultados' : 'Directorio',
            onClick: () => pushOptimistic(from === 'mascotas' ? '/mascotas' : from === 'search' ? '/search-results' : '/apartamentos')
        },
        { label: `Unidad ${resolvedUnitId}`, onClick: () => pushOptimistic(unitPath) },
        { label: form.name || `Mascota ${petId}`, onClick: () => pushOptimistic(detailPath) },
        { label: 'Editar' }
    ];

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        if (isNaN(numericIdForSave)) {
            setError('ID de mascota inválido para actualización.');
            setIsSaving(false);
            return;
        }
        const result = await updatePetData(numericIdForSave, {
            name: form.name.trim(),
            species: form.species,
            breed: form.breed.trim() || null,
            color: form.color.trim() || null,
            age: form.age.trim() || null,
            gender: form.gender,
            vaccinated: form.vaccinated,
            status: form.status,
            observations: form.observations.trim() || null,
        });

        setIsSaving(false);

        if (!result.success) {
            setError(result.error || 'No fue posible guardar los cambios.');
            return;
        }

        pushOptimistic(navigationPath);
    };

    if (loading) {
        return <PetEditSkeleton />;
    }

    if (error) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-zinc-100 rounded-full flex items-center justify-center mb-6">
                    <PawPrint size={40} className="text-zinc-400" />
                </div>
                <h2 className="text-2xl font-bold text-zinc-900">Formulario No Disponible</h2>
                <p className="text-zinc-500 mt-2">{error}</p>
                <Button onClick={() => router.back()} className="mt-8 bg-zinc-900 text-white rounded-xl px-6">
                    Volver Atrás
                </Button>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-4">
                <Breadcrumbs items={breadcrumbs} />
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Editar Mascota</h1>
                        <p className="text-sm text-zinc-500 mt-2">
                            Actualiza los datos de identificación y salud de la mascota.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => pushOptimistic(navigationPath)}
                            className="h-11 rounded-2xl px-5 font-bold gap-2"
                        >
                            <ArrowLeft size={16} /> Cancelar
                        </Button>
                        <Button
                            type="submit"
                            form="pet-edit-form"
                            disabled={isSaving}
                            className="h-11 rounded-2xl px-6 font-bold bg-zinc-900 text-white gap-2"
                        >
                            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            Guardar Cambios
                        </Button>
                    </div>
                </div>
            </div>

            <form id="pet-edit-form" onSubmit={handleSave} className="bg-white rounded-3xl border border-zinc-200 p-6 md:p-8 space-y-8 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Nombre</Label>
                        <Input
                            value={form.name}
                            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                            required
                            className="h-11 rounded-2xl bg-zinc-50 border-zinc-100 focus:bg-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Especie</Label>
                        <Select value={form.species} onChange={(e) => setForm((prev) => ({ ...prev, species: e.target.value }))}>
                            <option value="Canino">Canino</option>
                            <option value="Felino">Felino</option>
                            <option value="Ave">Ave</option>
                            <option value="Otro">Otro</option>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Raza</Label>
                        <Input value={form.breed} onChange={(e) => setForm((prev) => ({ ...prev, breed: e.target.value }))} className="h-11 rounded-2xl bg-zinc-50 border-zinc-100 focus:bg-white" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Color / Manto</Label>
                        <Input value={form.color} onChange={(e) => setForm((prev) => ({ ...prev, color: e.target.value }))} className="h-11 rounded-2xl bg-zinc-50 border-zinc-100 focus:bg-white" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Edad Estimada</Label>
                        <Input value={form.age} onChange={(e) => setForm((prev) => ({ ...prev, age: e.target.value }))} className="h-11 rounded-2xl bg-zinc-50 border-zinc-100 focus:bg-white" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Género</Label>
                        <Select value={form.gender} onChange={(e) => setForm((prev) => ({ ...prev, gender: e.target.value }))}>
                            <option value="Macho">Macho</option>
                            <option value="Hembra">Hembra</option>
                            <option value="No especificado">No especificado</option>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Esquema Vacunación</Label>
                        <Select value={String(form.vaccinated)} onChange={(e) => setForm((prev) => ({ ...prev, vaccinated: e.target.value === 'true' }))}>
                            <option value="true">Al Día</option>
                            <option value="false">Pendiente / No Registra</option>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Estado Administrativo</Label>
                        <Input value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))} className="h-11 rounded-2xl bg-zinc-50 border-zinc-100 focus:bg-white" />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Observaciones</Label>
                    <Textarea
                        value={form.observations}
                        onChange={(e) => setForm((prev) => ({ ...prev, observations: e.target.value }))}
                        className="rounded-2xl min-h-[120px] bg-zinc-50 border-zinc-100 focus:bg-white"
                    />
                </div>

                {error ? (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                        {error}
                    </div>
                ) : null}
            </form>
        </div>
    );
}
