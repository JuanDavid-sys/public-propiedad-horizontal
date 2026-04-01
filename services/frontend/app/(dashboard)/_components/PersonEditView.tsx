'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useOptimisticNavigation } from "@/app/_contexts/OptimisticNavigationContext";
import { ArrowLeft, Loader2, Save, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { fetchPersonByDocument, updatePersonData } from '@/lib/actions/people.actions';
import { Breadcrumbs, BreadcrumbItem } from '../apartamentos/_components/Breadcrumbs';
import { PersonEditSkeleton } from '@/components/skeletons/PageSkeletons';

interface PersonEditViewProps {
    personId: string;
    from?: string | null;
    unitId?: string | null;
}

interface PersonUpdateForm {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    is_minor: boolean;
    is_elderly: boolean;
    has_disability: boolean;
    is_realtor: boolean;
    data_authorization: boolean;
    observations: string;
}

const DEFAULT_FORM: PersonUpdateForm = {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    is_minor: false,
    is_elderly: false,
    has_disability: false,
    is_realtor: false,
    data_authorization: false,
    observations: '',
};

function getDirectoryPath(from?: string | null): string {
    if (from === 'search') return '/search-results';
    if (from === 'personas') return '/personas';
    return '/apartamentos';
}

function buildDetailPath(personId: string, from?: string | null, unitId?: string | null): string {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    const query = params.toString();

    if (unitId) {
        return `/apartamentos/${unitId}/${personId}${query ? `?${query}` : ''}`;
    }
    return `/personas/${personId}${query ? `?${query}` : ''}`;
}

function buildNavigationPath(personId: string, from?: string | null, unitId?: string | null, editMode?: string | null): string {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    const query = params.toString();

    if (editMode === 'card' && unitId) {
        return `/apartamentos/${unitId}?tab=personnel${query ? `&${query}` : ''}`;
    }

    return buildDetailPath(personId, from, unitId);
}

export function PersonEditView({ personId, from, unitId }: PersonEditViewProps) {
    const router = useRouter();
    const { pushOptimistic } = useOptimisticNavigation();
    const [loading, setLoading] = React.useState(true);
    const [isSaving, setIsSaving] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [personMeta, setPersonMeta] = React.useState<{ document_number: string; document_type: string; role: string } | null>(null);
    const [form, setForm] = React.useState<PersonUpdateForm>(DEFAULT_FORM);

    const searchParams = useSearchParams();
    const editMode = searchParams.get('editMode');

    const detailPath = buildDetailPath(personId, from, unitId);
    const navigationPath = buildNavigationPath(personId, from, unitId, editMode);

    React.useEffect(() => {
        const loadPerson = async () => {
            setLoading(true);
            setError(null);

            const person = await fetchPersonByDocument(personId);
            if (!person) {
                setLoading(false);
                setError('No se encontró la persona solicitada.');
                return;
            }

            setPersonMeta({
                document_number: person.document_number,
                document_type: person.document_type,
                role: person.role,
            });

            setForm({
                first_name: person.first_name || '',
                last_name: person.last_name || '',
                email: person.email || '',
                phone: person.phone || '',
                is_minor: !!person.is_minor,
                is_elderly: !!person.is_elderly,
                has_disability: !!person.has_disability,
                is_realtor: !!person.is_realtor,
                data_authorization: !!person.data_authorization,
                observations: person.observations || '',
            });
            setLoading(false);
        };

        loadPerson();
    }, [personId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleBooleanChange = (name: keyof PersonUpdateForm, value: string) => {
        setForm((prev) => ({ ...prev, [name]: value === 'true' }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!personMeta) return;

        setError(null);
        setIsSaving(true);

        const payload = {
            first_name: form.first_name.trim(),
            last_name: form.last_name.trim(),
            email: form.email.trim() || null,
            phone: form.phone.trim() || null,
            is_minor: form.is_minor,
            is_elderly: form.is_elderly,
            has_disability: form.has_disability,
            is_realtor: form.is_realtor,
            data_authorization: form.data_authorization,
            observations: form.observations.trim() || null,
        };

        const result = await updatePersonData(personMeta.document_number, payload);
        setIsSaving(false);

        if (!result.success) {
            setError(result.error || 'No fue posible guardar los cambios de la persona.');
            return;
        }

        pushOptimistic(navigationPath);
    };

    if (loading) {
        return <PersonEditSkeleton />;
    }

    if (!personMeta) {
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

    const fullName = `${form.first_name} ${form.last_name}`.trim() || personMeta.document_number;
    const fromParam = from ? `&from=${from}` : '';
    const breadcrumbs: BreadcrumbItem[] = unitId
        ? [
            {
                label: from === 'personas' ? 'Directorio de Personas' : from === 'search' ? 'Resultados' : 'Directorio',
                onClick: () => pushOptimistic(getDirectoryPath(from)),
            },
            {
                label: `Unidad ${unitId}`,
                onClick: () => pushOptimistic(`/apartamentos/${unitId}?tab=personnel${fromParam}`),
            },
            { label: fullName, onClick: () => pushOptimistic(detailPath) },
            { label: 'Editar' },
        ]
        : [
            { label: 'Directorio de Personas', onClick: () => pushOptimistic('/personas') },
            { label: fullName, onClick: () => pushOptimistic(detailPath) },
            { label: 'Editar' },
        ];

    return (
        <div className="p-4 md:p-8 mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-4">
                <Breadcrumbs items={breadcrumbs} />
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Editar Persona</h1>
                        <p className="text-sm text-zinc-500 mt-2">
                            Actualiza la información de contacto, condiciones especiales y observaciones.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => pushOptimistic(navigationPath)}
                            className="h-11 rounded-2xl px-5 font-bold gap-2"
                        >
                            <ArrowLeft size={16} />
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            form="person-edit-form"
                            disabled={isSaving}
                            className="h-11 rounded-2xl px-6 font-bold bg-zinc-900 text-white gap-2"
                        >
                            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            Guardar Cambios
                        </Button>
                    </div>
                </div>
            </div>

            <form id="person-edit-form" onSubmit={handleSave} className="bg-white rounded-3xl border border-zinc-200 p-6 md:p-8 space-y-8 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Tipo de Documento</Label>
                        <Input value={personMeta.document_type || 'CC'} disabled className="h-11 rounded-2xl bg-zinc-50 border-zinc-100 text-zinc-600" />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Número de Documento</Label>
                        <Input value={personMeta.document_number} disabled className="h-11 rounded-2xl bg-zinc-50 border-zinc-100 text-zinc-600" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="md:col-span-2 space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Rol en el Conjunto</Label>
                        <Input value={personMeta.role || 'Residente'} disabled className="h-11 rounded-2xl bg-zinc-50 border-zinc-100 text-zinc-600" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Nombres</Label>
                        <Input
                            name="first_name"
                            value={form.first_name}
                            onChange={handleInputChange}
                            required
                            className="h-11 rounded-2xl bg-zinc-50 border-zinc-100 focus:bg-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Apellidos</Label>
                        <Input
                            name="last_name"
                            value={form.last_name}
                            onChange={handleInputChange}
                            required
                            className="h-11 rounded-2xl bg-zinc-50 border-zinc-100 focus:bg-white"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Teléfonos</Label>
                        <Input
                            name="phone"
                            value={form.phone}
                            onChange={handleInputChange}
                            placeholder="Celular o fijo"
                            className="h-11 rounded-2xl bg-zinc-50 border-zinc-100 focus:bg-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Correo Electrónico</Label>
                        <Input
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleInputChange}
                            placeholder="correo@ejemplo.com"
                            className="h-11 rounded-2xl bg-zinc-50 border-zinc-100 focus:bg-white"
                        />
                    </div>
                </div>

                <div className="bg-zinc-50 p-6 rounded-[2rem] border border-zinc-100">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-4">Condiciones Especiales</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[9px] font-bold text-zinc-500 uppercase">Menor Edad</Label>
                            <Select value={String(form.is_minor)} onChange={(e) => handleBooleanChange('is_minor', e.target.value)} className="h-10 text-xs">
                                <option value="false">No</option>
                                <option value="true">Si</option>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[9px] font-bold text-zinc-500 uppercase">Adulto Mayor</Label>
                            <Select value={String(form.is_elderly)} onChange={(e) => handleBooleanChange('is_elderly', e.target.value)} className="h-10 text-xs">
                                <option value="false">No</option>
                                <option value="true">Si</option>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[9px] font-bold text-zinc-500 uppercase">Discapacidad</Label>
                            <Select value={String(form.has_disability)} onChange={(e) => handleBooleanChange('has_disability', e.target.value)} className="h-10 text-xs">
                                <option value="false">No</option>
                                <option value="true">Si</option>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[9px] font-bold text-zinc-500 uppercase">Inmobiliaria</Label>
                            <Select value={String(form.is_realtor)} onChange={(e) => handleBooleanChange('is_realtor', e.target.value)} className="h-10 text-xs">
                                <option value="false">No</option>
                                <option value="true">Si</option>
                            </Select>
                        </div>
                    </div>
                </div>

                <div className="space-y-5">
                    <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                        <span className="text-xs font-bold text-emerald-900">Autoriza tratamiento de datos personales</span>
                        <Select
                            value={String(form.data_authorization)}
                            onChange={(e) => handleBooleanChange('data_authorization', e.target.value)}
                            className="w-24 h-10 border-emerald-200 bg-white"
                        >
                            <option value="false">No</option>
                            <option value="true">Si</option>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Observaciones</Label>
                        <Textarea
                            name="observations"
                            value={form.observations}
                            onChange={handleInputChange}
                            placeholder="Notas administrativas relevantes..."
                            className="rounded-2xl min-h-[120px] bg-zinc-50 border-zinc-100 focus:bg-white"
                        />
                    </div>
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
