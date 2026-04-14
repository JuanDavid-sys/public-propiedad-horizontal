'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useOptimisticNavigation } from '@/app/_contexts/OptimisticNavigationContext';
import {
    ChevronLeft, Car, Motorbike, Bike, Building2,
    ParkingSquare, Info, Edit, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { 
    deleteVehicleByPlate, 
    fetchVehicleByUnitAndPlate, 
    fetchVehicleByPlate as fetchVehicleDetailByPlate,
    unassignVehicleFromUnit 
} from '@/lib/actions/smart.actions';
import { VehicleData } from '@/lib/actions/base.actions';
import { DetailSection, DetailItem } from '../apartamentos/_components/DetailComponents';
import { Breadcrumbs, BreadcrumbItem } from '../apartamentos/_components/Breadcrumbs';
import { CenteredDetailSkeleton } from '@/components/skeletons/PageSkeletons';
import { VehicleUnassignModal } from '../apartamentos/_components/modals/VehicleUnassignModal';
import { cn } from '@/lib/utils';
import { getVehicleVisualKind } from '@/lib/utils/vehicleType';

interface VehicleDetailViewProps {
    plate: string;
    unitId?: string;
    from?: string | null;
}

export function VehicleDetailView({ plate, unitId, from }: VehicleDetailViewProps) {
    const router = useRouter();
    const { pushOptimistic } = useOptimisticNavigation();
    const [vehicle, setVehicle] = React.useState<VehicleData | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [isRemoving, setIsRemoving] = React.useState(false);
    const [showRemovalModal, setShowRemovalModal] = React.useState(false);
    const [actionError, setActionError] = React.useState<string | null>(null);

    React.useEffect(() => {
        let isMounted = true;

        const loadVehicle = async () => {
            if (!plate || unitId === '') return;

            setLoading(true);
            const data = unitId
                ? await fetchVehicleByUnitAndPlate(unitId, plate)
                : await fetchVehicleDetailByPlate(plate);

            if (!isMounted) return;
            setVehicle(data);
            setLoading(false);
        };

        loadVehicle();

        return () => {
            isMounted = false;
        };
    }, [plate, unitId]);

    if (loading) {
        return <CenteredDetailSkeleton />;
    }

    if (!vehicle) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-zinc-100 rounded-full flex items-center justify-center mb-6">
                    <Car size={40} className="text-zinc-400" />
                </div>
                <h2 className="text-2xl font-bold text-zinc-900">Vehículo No Encontrado</h2>
                <p className="text-zinc-500 mt-2">No pudimos encontrar el registro con placa {plate}.</p>
                <Button onClick={() => router.back()} className="mt-8 bg-zinc-900 text-white rounded-xl px-6">
                    Volver Atrás
                </Button>
            </div>
        );
    }

    const hasUnitContext = Boolean(unitId);
    const resolvedUnitId = unitId || vehicle.unit || '';
    const resolvedTower = vehicle.tower || (resolvedUnitId ? resolvedUnitId.split('-')[0] : '');
    const vehicleKind = getVehicleVisualKind(vehicle.type);
    const isBicycle = vehicleKind === 'bicycle';
    const isMotorbike = vehicleKind === 'motorbike';
    const VehicleIcon = isBicycle ? Bike : isMotorbike ? Motorbike : Car;
    const directoryLabel = hasUnitContext
        ? from === 'vehiculos'
            ? 'Directorio de Vehículos'
            : from === 'search'
                ? 'Resultados'
                : 'Directorio'
        : from === 'search'
            ? 'Resultados'
            : 'Directorio de Vehículos';
    const directoryPath = hasUnitContext
        ? from === 'vehiculos'
            ? '/vehiculos'
            : from === 'search'
                ? '/search-results'
                : '/apartamentos'
        : from === 'search'
            ? '/search-results'
            : '/vehiculos';
    const fromParam = from ? `&from=${from}` : '';
    const backPath = hasUnitContext
        ? from === 'vehiculos'
            ? '/vehiculos'
            : from === 'search'
                ? '/search-results'
                : `/apartamentos/${unitId}?tab=parking_vehicles${fromParam}`
        : from === 'search'
            ? '/search-results'
            : '/vehiculos';
    const editPath = unitId
        ? `/apartamentos/${unitId}/vehiculos/${encodeURIComponent(plate)}/edit?editMode=detail${from ? `&from=${from}` : ''}`
        : null;
    const breadcrumbs: BreadcrumbItem[] = hasUnitContext
        ? [
            {
                label: directoryLabel,
                onClick: () => pushOptimistic(directoryPath)
            },
            {
                label: `Unidad ${unitId}`,
                onClick: () => pushOptimistic(`/apartamentos/${unitId}?tab=parking_vehicles${fromParam}`)
            },
            { label: vehicle.plate }
        ]
        : [
            { label: directoryLabel, onClick: () => pushOptimistic(directoryPath) },
            { label: vehicle.plate }
        ];

    const parkingSummary = vehicle.parking ? `Puesto ${vehicle.parking}` : 'Sin asignar';
    const parkingValue = vehicle.parking ? `#${vehicle.parking}` : 'Sin asignar';
    const removalDescription = unitId
        ? undefined
        : vehicle.unit
            ? 'Puedes eliminar el registro del vehículo desde esta vista.'
            : 'Este vehículo no está asignado a una unidad. Puedes eliminar el registro.';

    const handleUnassign = async () => {
        if (!unitId) return;

        setIsRemoving(true);
        setActionError(null);
        const res = await unassignVehicleFromUnit(unitId, plate);
        setIsRemoving(false);
        if (!res.success) {
            setActionError(res.error || 'No fue posible desasignar el vehículo.');
            return;
        }
        pushOptimistic(backPath);
    };

    const handleDelete = async () => {
        setIsRemoving(true);
        setActionError(null);
        const res = await deleteVehicleByPlate(plate);
        setIsRemoving(false);
        if (!res.success) {
            setActionError(res.error || 'No fue posible eliminar el vehículo.');
            return;
        }
        pushOptimistic(backPath);
    };

    return (
        <div className="p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="space-y-4">
                    <Breadcrumbs items={breadcrumbs} />
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "px-4 py-2 rounded-xl flex items-center justify-center shadow-sm border",
                            isBicycle ? "bg-emerald-50 border-emerald-200 text-emerald-600" :
                                isMotorbike ? "bg-blue-50 border-blue-200 text-blue-600" : "bg-zinc-50 border-zinc-200 text-zinc-600"
                        )}>
                            <VehicleIcon size={20} className="mr-2" />
                            <span className="font-black tracking-widest text-lg">{vehicle.plate}</span>
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-zinc-900 tracking-tight leading-none uppercase">
                                {vehicle.observations || 'Vehículo Registrado'}
                            </h1>
                            <div className="flex items-center gap-2 mt-2">
                                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md ${vehicle.status === 'Activo' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                                    {vehicle.status}
                                </span>
                                <span className="text-xs text-zinc-400 font-medium flex items-center gap-1">
                                    <ParkingSquare size={12} /> {parkingSummary}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {editPath ? (
                        <Button
                            variant="outline"
                            onClick={() => pushOptimistic(editPath)}
                            className="h-10 px-4 rounded-xl gap-2 font-bold text-zinc-600 border-zinc-200 hover:bg-zinc-50"
                        >
                            <Edit size={16} /> Editar
                        </Button>
                    ) : null}
                    <Button
                        variant="outline"
                        onClick={() => setShowRemovalModal(true)}
                        className="h-10 px-4 rounded-xl gap-2 font-bold text-rose-600 border-rose-100 hover:bg-rose-50 hover:border-rose-200"
                    >
                        <Trash2 size={16} /> Eliminar
                    </Button>
                </div>
            </div>

            {actionError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                    {actionError}
                </div>
            ) : null}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <DetailSection
                        title="Especificaciones Técnicas"
                        icon={VehicleIcon}
                        iconColor={isBicycle ? "text-emerald-600" : isMotorbike ? "text-blue-600" : "text-amber-600"}
                        iconBg={isBicycle ? "bg-emerald-50" : isMotorbike ? "bg-blue-50" : "bg-amber-50"}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6">
                            <DetailItem
                                label="Placa / Matrícula"
                                value={
                                    <div className="px-2 py-0.5 bg-zinc-50 border border-zinc-200 rounded text-[10px] font-black text-zinc-600 tracking-widest w-fit mt-1">
                                        {vehicle.plate}
                                    </div>
                                }
                                variant="large"
                            />
                            <DetailItem label="Tipo de Vehículo" value={vehicle.type || 'No registrado'} />
                            <DetailItem label="Marca / Fabricante" value={vehicle.brand || 'No registrado'} />
                            <DetailItem label="Modelo / Año" value={vehicle.model || 'No registrado'} />
                            <DetailItem label="Color" value={vehicle.color || 'No registrado'} />
                        </div>
                    </DetailSection>

                    <DetailSection title="Observaciones" icon={Info} iconColor="text-zinc-600" iconBg="bg-zinc-50">
                        <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-5">
                            <p className="text-sm leading-relaxed text-zinc-600 whitespace-pre-wrap">
                                {vehicle.observations || 'Sin observaciones registradas.'}
                            </p>
                        </div>
                    </DetailSection>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-3xl border border-zinc-200 p-6 space-y-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <Building2 className="text-zinc-400" size={20} />
                            <h3 className="font-bold text-zinc-900">Unidad Responsable</h3>
                        </div>
                        {resolvedUnitId ? (
                            <button
                                onClick={() => pushOptimistic(`/apartamentos/${resolvedUnitId}`)}
                                className="w-full flex items-center justify-between p-4 bg-zinc-50 hover:bg-zinc-100 rounded-2xl transition-colors border border-zinc-100 group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600">
                                        <Building2 size={20} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-black text-zinc-900">Unidad {resolvedUnitId}</p>
                                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                                            Torre {resolvedTower || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                <ChevronLeft className="rotate-180 text-zinc-300 group-hover:text-zinc-500 transition-colors" size={16} />
                            </button>
                        ) : (
                            <div className="w-full p-4 bg-zinc-50 rounded-2xl border border-zinc-100 text-sm text-zinc-500 font-medium">
                                Sin unidad asignada
                            </div>
                        )}
                    </div>

                    <DetailSection title="Asignación" icon={ParkingSquare} iconColor="text-blue-600" iconBg="bg-blue-50">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 text-center">
                                <p className="text-[10px] uppercase font-bold text-zinc-400 mb-1">Parqueadero</p>
                                <p className="font-black text-zinc-900 text-lg uppercase">{parkingValue}</p>
                            </div>
                        </div>
                    </DetailSection>
                </div>
            </div>

            <VehicleUnassignModal
                isOpen={showRemovalModal}
                plate={vehicle.plate}
                onClose={() => setShowRemovalModal(false)}
                onUnassign={handleUnassign}
                onDelete={handleDelete}
                isLoading={isRemoving}
                description={removalDescription}
                note="Esta acción es inmediata."
                showUnassign={Boolean(unitId)}
            />
        </div>
    );
}
