'use client';

import React, { Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useOptimisticNavigation } from '@/app/_contexts/OptimisticNavigationContext';
import { ChevronLeft, PawPrint, Building2, ShieldCheck, Heart, Info, ShieldAlert, Edit, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { DetailSection, DetailItem } from '../../../_components/DetailComponents';
import { Breadcrumbs, BreadcrumbItem } from '../../../_components/Breadcrumbs';
import { CenteredDetailSkeleton } from '@/components/skeletons/PageSkeletons';
import { fetchPetById, deletePet } from '@/lib/actions/smart.actions';
import { PetData } from '@/lib/actions/base.actions';

function PetDetailPageContent({ paramsPromise }: { paramsPromise: Promise<any> }) {
    const params = React.use(paramsPromise);
    const router = useRouter();
    const { pushOptimistic } = useOptimisticNavigation();
    const searchParams = useSearchParams();
    const from = searchParams.get('from');

    const unit = params.unit as string;
    const rawId = params.id as string;
    const petId = Number(rawId);

    const [pet, setPet] = React.useState<PetData | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [deleteError, setDeleteError] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (isNaN(petId)) {
            setLoading(false);
            return;
        }

        const loadPet = async () => {
            setLoading(true);
            const data = await fetchPetById(petId);
            if (data) {
                setPet(data);
            }
            setLoading(false);
        };
        loadPet();
    }, [petId, rawId, unit]);

    if (loading) {
        return <CenteredDetailSkeleton />;
    }

    if (!pet || isNaN(petId)) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-zinc-100 rounded-full flex items-center justify-center mb-6">
                    <PawPrint size={40} className="text-zinc-400" />
                </div>
                <h2 className="text-2xl font-bold text-zinc-900">Perfil No Encontrado</h2>
                <p className="text-zinc-500 mt-2">
                    {isNaN(petId)
                        ? "El identificador proporcionado no es válido."
                        : `No pudimos encontrar el registro de mascota con ID ${rawId}.`}
                </p>
                <Button onClick={() => router.back()} className="mt-8 bg-zinc-900 text-white rounded-xl px-6">
                    Volver Atrás
                </Button>
            </div>
        );
    }

    const fromParam = from ? `&from=${from}` : '';
    const petUnit = pet.unit || unit;
    const editPath = `/apartamentos/${petUnit}/mascotas/${pet.id}/edit?editMode=detail${from ? `&from=${from}` : ''}`;
    const breadcrumbs: BreadcrumbItem[] = [
        {
            label: from === 'mascotas' ? 'Censo de Mascotas' : from === 'search' ? 'Resultados' : 'Directorio',
            onClick: () => pushOptimistic(from === 'mascotas' ? '/mascotas' : from === 'search' ? '/search-results' : '/apartamentos')
        },
        { label: `Unidad ${petUnit}`, onClick: () => pushOptimistic(`/apartamentos/${petUnit}?tab=pets${fromParam}`) },
        { label: pet.name }
    ];

    return (
        <div className="p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="space-y-4">
                    <Breadcrumbs items={breadcrumbs} />

                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
                            <PawPrint size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-zinc-900 tracking-tight leading-none uppercase">
                                {pet.name}
                            </h1>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100">
                                    {pet.status || 'Al Día'}
                                </span>
                                <span className="text-xs text-zinc-400 font-medium flex items-center gap-1">
                                    <Heart size={12} className="text-rose-400 fill-rose-400" /> Miembro de la Unidad {petUnit}
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
                title="Eliminar Mascota"
                description="Esta acción eliminará el registro de la mascota permanentemente."
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
                                if (!pet) return;
                                setIsDeleting(true);
                                setDeleteError(null);
                                const result = await deletePet(petId);
                                if (result.success) {
                                    // Comportamiento de redirección alineado con Personas
                                    if (from === 'mascotas') {
                                        pushOptimistic('/mascotas');
                                    } else if (from === 'search') {
                                        pushOptimistic('/search-results');
                                    } else {
                                        // Si no hay contexto claro de navegación, volvemos a la unidad
                                        pushOptimistic(`/apartamentos/${unit}?tab=pets`);
                                    }
                                } else {
                                    setDeleteError(result.error || 'No se pudo eliminar el registro de la mascota.');
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
                            <p className="text-sm font-bold text-rose-900">¿Estás seguro de eliminar a {pet.name}?</p>
                            <p className="text-xs text-rose-800/80 mt-1">
                                Se eliminará el registro de la mascota de la unidad {unit}. Esta acción no se puede deshacer.
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
                    <DetailSection title="Identificación Animal" icon={PawPrint} iconColor="text-emerald-600" iconBg="bg-emerald-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6">
                            <DetailItem label="Nombre" value={pet.name} variant="large" />
                            <DetailItem label="Especie / Tipo" value={pet.species} variant="large" />
                            <DetailItem label="Raza" value={pet.breed || 'No registrada'} />
                            <DetailItem label="Color predominante" value={pet.color || 'No especificado'} />
                            <DetailItem label="Edad" value={pet.age || 'No especificada'} />
                            <DetailItem label="Género" value={pet.gender || 'No especificado'} />
                        </div>
                    </DetailSection>

                    <DetailSection title="Salud y Convivencia" icon={ShieldCheck} iconColor="text-blue-600" iconBg="bg-blue-50">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 text-center">
                                <p className="text-[10px] uppercase font-bold text-zinc-400 mb-1">Vacunación</p>
                                <p className={`font-bold ${pet.vaccinated ? 'text-emerald-600' : 'text-rose-600'}`}>{pet.vaccinated ? 'Completa' : 'Pendiente'}</p>
                            </div>
                            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 text-center">
                                <p className="text-[10px] uppercase font-bold text-zinc-400 mb-1">Estado</p>
                                <p className="font-bold text-zinc-700">{pet.status || 'No especificado'}</p>
                            </div>
                            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 text-center">
                                <p className="text-[10px] uppercase font-bold text-zinc-400 mb-1">Especie</p>
                                <p className="font-bold text-zinc-500">{pet.species || 'N/A'}</p>
                            </div>
                            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 text-center">
                                <p className="text-[10px] uppercase font-bold text-zinc-400 mb-1">Registro</p>
                                <p className="font-bold text-emerald-600">Activo</p>
                            </div>
                        </div>
                    </DetailSection>

                    {pet.observations ? (
                        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 flex items-start gap-4">
                            <Info className="text-amber-600 shrink-0 mt-1" size={20} />
                            <div>
                                <h3 className="text-sm font-bold text-amber-900 mb-1">Notas de Administración</h3>
                                <p className="text-sm text-amber-800/80 leading-relaxed">{pet.observations}</p>
                            </div>
                        </div>
                    ) : null}
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-3xl border border-zinc-200 p-6 space-y-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <Building2 className="text-zinc-400" size={20} />
                            <h3 className="font-bold text-zinc-900">Unidad Responsable</h3>
                        </div>
                        <button
                            onClick={() => pushOptimistic(`/apartamentos/${petUnit}`)}
                            className="w-full flex items-center justify-between p-4 bg-zinc-50 hover:bg-zinc-100 rounded-2xl transition-colors border border-zinc-100 group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-emerald-600">
                                    <Building2 size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-black text-zinc-900">Unidad {petUnit}</p>
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Torre {pet.tower}</p>
                                </div>
                            </div>
                            <ChevronLeft className="rotate-180 text-zinc-300 group-hover:text-zinc-500 transition-colors" size={16} />
                        </button>
                    </div>

                    <div className="bg-zinc-50 rounded-[2rem] p-8 border border-zinc-200/60 space-y-6">
                        <div className="flex items-center gap-3">
                            <ShieldAlert className="text-zinc-600" size={20} />
                            <h3 className="font-bold text-zinc-900 uppercase tracking-tight">Manual de Convivencia</h3>
                        </div>
                        <div className="space-y-4 pt-2">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Regla Principal</p>
                                <p className="text-xs text-zinc-500 leading-relaxed italic">&quot;El uso de trailla es obligatorio en zonas comunes. La recolección de excretas es responsabilidad del dueño.&quot;</p>
                            </div>
                            <div className="h-px bg-zinc-200/60" />
                            <Button variant="outline" className="w-full border-zinc-200 text-zinc-600 hover:bg-zinc-100 rounded-xl h-10 text-xs font-bold shadow-sm">
                                Ver Reglamento Mascotas
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function PetDetailPage({ params }: { params: Promise<any> }) {
    return (
        <Suspense fallback={<CenteredDetailSkeleton />}>
            <PetDetailPageContent paramsPromise={params} />
        </Suspense>
    );
}
