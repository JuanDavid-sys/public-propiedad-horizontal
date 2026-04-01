'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useOptimisticNavigation } from "@/app/_contexts/OptimisticNavigationContext";
import { ArrowLeft, Car, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { fetchUnitDetail } from '@/lib/actions/unit.actions';
import { fetchVehicleByUnitAndPlate, updateVehicleData } from '@/lib/actions/vehicle.actions';
import { ParkingData } from '@/lib/actions/base.actions';
import { Breadcrumbs, BreadcrumbItem } from '../apartamentos/_components/Breadcrumbs';
import { VehicleEditSkeleton } from '@/components/skeletons/PageSkeletons';

interface VehicleEditViewProps {
    unitId: string;
    plate: string;
    from?: string | null;
}

interface VehicleFormState {
    plate: string;
    parking_space_id: number | null;
    type: string;
    brand: string;
    model: string;
    color: string;
    status: string;
    observations: string;
}

export function VehicleEditView({ unitId, plate, from }: VehicleEditViewProps) {
    const router = useRouter();
    const { pushOptimistic } = useOptimisticNavigation();
    const searchParamsFromURL = useSearchParams();
    const editMode = searchParamsFromURL.get('editMode');

    const [loading, setLoading] = React.useState(true);
    const [isSaving, setIsSaving] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [parkingSpaces, setParkingSpaces] = React.useState<ParkingData[]>([]);
    const [form, setForm] = React.useState<VehicleFormState>({
        plate: '',
        parking_space_id: null,
        type: 'Automóvil',
        brand: '',
        model: '',
        color: '',
        status: 'Activo',
        observations: '',
    });

    React.useEffect(() => {
        const loadVehicle = async () => {
            setLoading(true);
            setError(null);
            const [tower, unit_number] = unitId.split('-');
            const [vehicle, unitDetail] = await Promise.all([
                fetchVehicleByUnitAndPlate(unitId, plate),
                fetchUnitDetail(tower, unit_number)
            ]);
            if (!vehicle) {
                setLoading(false);
                setError('No fue posible encontrar el vehículo solicitado.');
                return;
            }
            const unitParkingSpaces = Array.isArray(unitDetail?.parkingSpaces) ? unitDetail.parkingSpaces : [];
            const mergedParkingSpaces = [...unitParkingSpaces];
            if (vehicle.parkingSpace && !mergedParkingSpaces.find((p) => p.id === vehicle.parkingSpace?.id)) {
                mergedParkingSpaces.push(vehicle.parkingSpace);
            }
            setParkingSpaces(mergedParkingSpaces);
            setForm({
                plate: vehicle.plate,
                parking_space_id: vehicle.parkingSpace?.id ?? null,
                type: vehicle.type || 'Automóvil',
                brand: vehicle.brand || '',
                model: vehicle.model || '',
                color: vehicle.color || '',
                status: vehicle.status || 'Activo',
                observations: vehicle.observations || '',
            });
            setLoading(false);
        };
        loadVehicle();
    }, [unitId, plate]);

    const detailPath = `/apartamentos/${unitId}/vehiculos/${encodeURIComponent(plate)}${from ? `?from=${from}` : ''}`;
    const navigationPath = editMode === 'card'
        ? `/apartamentos/${unitId}?tab=parking_vehicles${from ? `&from=${from}` : ''}`
        : detailPath;
    const breadcrumbs: BreadcrumbItem[] = [
        {
            label: from === 'vehiculos' ? 'Directorio de Vehículos' : from === 'search' ? 'Resultados' : 'Directorio',
            onClick: () => pushOptimistic(from === 'vehiculos' ? '/vehiculos' : from === 'search' ? '/search-results' : '/apartamentos')
        },
        { label: `Unidad ${unitId}`, onClick: () => pushOptimistic(`/apartamentos/${unitId}?tab=parking_vehicles${from ? `&from=${from}` : ''}`) },
        { label: form.plate || plate, onClick: () => pushOptimistic(detailPath) },
        { label: 'Editar' }
    ];

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        const result = await updateVehicleData(unitId, plate, {
            parking_space_id: form.parking_space_id ?? null,
            type: form.type,
            brand: form.brand.trim() || null,
            model: form.model.trim() || null,
            color: form.color.trim() || null,
            status: form.status,
            observations: form.observations.trim() || null,
        });
        setIsSaving(false);

        if (!result.success) {
            setError(result.error || 'No fue posible guardar los cambios del vehículo.');
            return;
        }

        pushOptimistic(navigationPath);
    };

    const availableParkingSpaces = React.useMemo(() => {
        return parkingSpaces.filter((space) => {
            if (space.type !== 'PRIVADO') return false;
            if (!space.vehicle) return true;
            return space.vehicle.plate?.toUpperCase() === plate.toUpperCase();
        });
    }, [parkingSpaces, plate]);

    if (loading) {
        return <VehicleEditSkeleton />;
    }

    if (error && !form.plate) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div className="w-24 h-24 bg-zinc-100 rounded-full flex items-center justify-center mb-6">
                    <Car size={40} className="text-zinc-400" />
                </div>
                <h2 className="text-2xl font-bold text-zinc-900">Vehículo No Encontrado</h2>
                <Button onClick={() => router.back()} className="mt-8 bg-zinc-900 text-white rounded-xl px-6">
                    Volver
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
                        <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Editar Vehículo</h1>
                        <p className="text-sm text-zinc-500 mt-2">
                            Actualiza tipo, datos generales, estado y parqueadero del vehículo.
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
                            form="vehicle-edit-form"
                            disabled={isSaving}
                            className="h-11 rounded-2xl px-6 font-bold bg-zinc-900 text-white gap-2"
                        >
                            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            Guardar Cambios
                        </Button>
                    </div>
                </div>
            </div>

            <form id="vehicle-edit-form" onSubmit={handleSave} className="bg-white rounded-3xl border border-zinc-200 p-6 md:p-8 space-y-8 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Placa / Matrícula</Label>
                        <Input value={form.plate} disabled className="h-11 rounded-2xl bg-zinc-50 border-zinc-100 text-zinc-600 font-black tracking-widest" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Unidad Responsable</Label>
                        <Input value={`Unidad ${unitId}`} disabled className="h-11 rounded-2xl bg-zinc-50 border-zinc-100 text-zinc-600 font-bold" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Parqueadero Asignado</Label>
                        <Select
                            value={form.parking_space_id ? String(form.parking_space_id) : ''}
                            onChange={(e) => setForm((prev) => ({
                                ...prev,
                                parking_space_id: e.target.value ? Number(e.target.value) : null
                            }))}
                        >
                            <option value="">Sin asignar</option>
                            {availableParkingSpaces
                                .sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }))
                                .map((space) => (
                                    <option key={space.id} value={String(space.id)}>
                                        {space.number}
                                    </option>
                                ))}
                        </Select>
                        {availableParkingSpaces.length === 0 && (
                            <p className="text-[10px] text-zinc-400">No hay parqueadero privado disponible para esta unidad.</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Estado de Acceso</Label>
                        <Select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}>
                            <option value="Activo">Activo / Autorizado</option>
                            <option value="Inactivo">Inactivo / Restringido</option>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Tipo de Vehículo</Label>
                        <Select value={form.type} onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}>
                            <option value="Automóvil">Automóvil / Carro</option>
                            <option value="Camioneta">Camioneta / SUV</option>
                            <option value="Motocicleta">Motocicleta</option>
                            <option value="Bicicleta">Bicicleta</option>
                            <option value="Otro">Otro</option>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Marca</Label>
                        <Input
                            value={form.brand}
                            onChange={(e) => setForm((prev) => ({ ...prev, brand: e.target.value }))}
                            placeholder="Ej: Toyota"
                            className="rounded-2xl h-11 bg-zinc-50 border-zinc-100 focus:bg-white"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Modelo / Año</Label>
                        <Input
                            value={form.model}
                            onChange={(e) => setForm((prev) => ({ ...prev, model: e.target.value }))}
                            placeholder="Ej: 2024"
                            className="rounded-2xl h-11 bg-zinc-50 border-zinc-100 focus:bg-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Color</Label>
                        <Input
                            value={form.color}
                            onChange={(e) => setForm((prev) => ({ ...prev, color: e.target.value }))}
                            placeholder="Ej: Gris"
                            className="rounded-2xl h-11 bg-zinc-50 border-zinc-100 focus:bg-white"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Observaciones y Detalles</Label>
                    <Textarea
                        value={form.observations}
                        onChange={(e) => setForm((prev) => ({ ...prev, observations: e.target.value }))}
                        placeholder="Marca, modelo, color o notas administrativas..."
                        className="rounded-2xl min-h-[140px] bg-zinc-50 border-zinc-100 focus:bg-white"
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
