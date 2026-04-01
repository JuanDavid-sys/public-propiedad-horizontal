import React from 'react';
import { Car, AlertCircle, Key, PawPrint, Heart, Eye, Edit, Motorbike, Bike } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getVehicleVisualKind } from '@/lib/utils/vehicleType';
import { Button } from '@/components/ui/Button';

interface Vehicle {
    name: string;
    plate: string;
    type?: string;
    id: string;
    parking?: string;
    hasConflict?: boolean;
}

export function VehicleCard({
    vehicle,
    onView,
    onEdit
}: {
    vehicle: Vehicle;
    onView?: () => void;
    onEdit?: () => void;
}) {
    const vehicleKind = getVehicleVisualKind(vehicle.type);

    return (
        <div
            className={cn(
                "bg-white p-4 rounded-2xl border transition-all shadow-sm group",
                "hover:shadow-md",
                vehicle.hasConflict ? "border-rose-200 bg-rose-50/20" : "border-zinc-200 hover:border-blue-200"
            )}
        >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105",
                        vehicle.hasConflict ? "bg-rose-100 text-rose-600" :
                            vehicleKind === 'bicycle' ? "bg-emerald-50 text-emerald-600" :
                                vehicleKind === 'motorbike' ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"
                    )}>
                        {vehicleKind === 'bicycle' ? <Bike size={24} /> :
                            vehicleKind === 'motorbike' ? <Motorbike size={24} /> : <Car size={24} />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                            <h4 className="text-sm font-bold text-zinc-900 truncate">{vehicle.name}</h4>
                            {vehicle.hasConflict && (
                                <span className="flex items-center gap-1 text-[9px] font-bold text-rose-600 uppercase bg-rose-100 px-1.5 py-0.5 rounded-full ring-2 ring-rose-50 shrink-0">
                                    <AlertCircle size={10} /> Conflicto
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                            <div className="space-y-0.5">
                                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Placa</p>
                                <div className="px-2 py-0.5 bg-zinc-50 border border-zinc-200 rounded text-[10px] font-black text-zinc-600 tracking-widest w-fit">
                                    {vehicle.plate}
                                </div>
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Puesto</p>
                                <p className="text-xs font-bold text-zinc-700">{vehicle.parking || 'Sin asignar'}</p>
                            </div>
                        </div>
                    </div>
                </div>
                {(onView || onEdit) && (
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:justify-end">
                        {onView && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={onView}
                                className="h-9 px-3 rounded-xl gap-2 text-xs font-bold text-zinc-600 border-zinc-200 hover:bg-zinc-50"
                            >
                                <Eye size={14} /> Ver
                            </Button>
                        )}
                        {onEdit && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={onEdit}
                                className="h-9 px-3 rounded-xl gap-2 text-xs font-bold text-blue-600 border-blue-100 hover:bg-blue-50"
                            >
                                <Edit size={14} /> Editar
                            </Button>
                        )}
                    </div>
                )}
            </div>
            {vehicle.hasConflict && (
                <p className="mt-3 text-[10px] text-rose-600 font-medium bg-white/50 p-2 rounded-lg border border-rose-100">
                    Advertencia: Este espacio de parqueo está asignado a otro vehículo activo.
                </p>
            )}
        </div>
    );
}

interface Tag {
    id: string;
    assignedTo: string;
    status: 'active' | 'inactive';
}

export function TagCard({ tag }: { tag: Tag }) {
    return (
        <div className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm flex items-center gap-4 hover:border-zinc-300 transition-all cursor-pointer group">
            <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                <Key size={20} />
            </div>
            <div className="flex-1">
                <div className="flex items-center justify-between">
                    <p className="text-xs font-mono font-bold text-zinc-900 tracking-tight">FOB #{tag.id}</p>
                    <div className={cn("w-1.5 h-1.5 rounded-full shadow-[0_0_5px_rgba(0,0,0,0.1)]",
                        tag.status === 'active' ? "bg-emerald-500 shadow-emerald-200" : "bg-zinc-300 shadow-zinc-200"
                    )} />
                </div>
                <p className="text-[10px] text-zinc-400 mt-0.5 font-medium leading-none">Asignado: <span className="text-zinc-600 uppercase font-bold">{tag.assignedTo}</span></p>
            </div>
        </div>
    );
}

interface Pet {
    id: string;
    name: string;
    type: string;
    breed?: string;
}

export function PetCard({
    pet,
    onView,
    onEdit
}: {
    pet: Pet;
    onView?: () => void;
    onEdit?: () => void;
}) {
    return (
        <div
            className="bg-white p-5 rounded-[2rem] border border-zinc-100 shadow-sm hover:border-emerald-100 hover:shadow-emerald-50 transition-all group relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -mr-12 -mt-12 transition-all group-hover:scale-110" />
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 relative z-10">
                <div className="flex items-center gap-5 flex-1 min-w-0">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center transition-transform group-hover:rotate-12 shrink-0">
                        <PawPrint size={28} />
                    </div>
                    <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h4 className="text-base font-black text-zinc-900 truncate">{pet.name}</h4>
                            <Heart size={12} className="text-rose-400 fill-rose-400 shrink-0" />
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="space-y-0.5">
                                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Especie</p>
                                <p className="text-xs font-bold text-zinc-600">{pet.type}</p>
                            </div>
                            <div className="w-px h-4 bg-zinc-100" />
                            <div className="space-y-0.5">
                                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Estado</p>
                                <p className="text-xs font-bold text-emerald-600">Al Día</p>
                            </div>
                        </div>
                    </div>
                </div>
                {(onView || onEdit) && (
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:justify-end">
                        {onView && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={onView}
                                className="h-9 px-3 rounded-xl gap-2 text-xs font-bold text-zinc-600 border-zinc-200 hover:bg-zinc-50"
                            >
                                <Eye size={14} /> Ver
                            </Button>
                        )}
                        {onEdit && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={onEdit}
                                className="h-9 px-3 rounded-xl gap-2 text-xs font-bold text-blue-600 border-blue-100 hover:bg-blue-50"
                            >
                                <Edit size={14} /> Editar
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
