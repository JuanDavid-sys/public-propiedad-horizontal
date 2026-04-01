'use client';

import React from 'react';
import { useOptimisticNavigation } from "@/app/_contexts/OptimisticNavigationContext";
import { useVehiclesData } from '@/lib/hooks/useVehiclesData';
import { useDirectoryStore } from '@/lib/store/useDirectoryStore';
import { DataTable } from '@/components/DataTable';
import { FilterBar } from '@/components/FilterBar';
import { PageHeader } from '../apartamentos/_components/PageHeader';
import { TablePagination } from '../apartamentos/_components/TablePagination';
import { ParkingSquare, Car, Motorbike, Bike } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getVehicleVisualKind } from '@/lib/utils/vehicleType';

export default function VehiculosPage() {
    const { pushOptimistic } = useOptimisticNavigation();
    const { data: vehiculos = [], isLoading } = useVehiclesData();
    const { vehiculoSearch, setVehiculoSearch, vehiculoTower, setVehiculoTower } = useDirectoryStore();

    // Obtener torres únicas para el filtro
    const towers = Array.from(new Set(vehiculos.map(v => v.tower).filter(Boolean))).sort();

    const [currentPage, setCurrentPage] = React.useState(1);
    const pageSize = 50;

    // Reset page when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [vehiculoSearch, vehiculoTower]);

    const filteredVehiculos = vehiculos.filter(v => {
        const matchesSearch = v.plate.toLowerCase().includes(vehiculoSearch.toLowerCase());
        const matchesTower = vehiculoTower === 'Cualquiera' || v.tower === vehiculoTower;
        return matchesSearch && matchesTower;
    });

    const totalPages = Math.ceil(filteredVehiculos.length / pageSize);
    const paginatedVehiculos = filteredVehiculos.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <PageHeader
                title="Directorio de Vehículos"
                description="Listado de vehículos registrados y sus parqueaderos asignados."
                showActions={false}
            />

            <FilterBar
                searchPlaceholder="Buscar por placa..."
                searchValue={vehiculoSearch}
                onSearchChange={setVehiculoSearch}
                towers={towers}
                selectedTower={vehiculoTower}
                onTowerChange={setVehiculoTower}
            />

            <div className="bg-white rounded-2xl shadow-sm border border-zinc-200/50 overflow-hidden">
                <DataTable
                    data={paginatedVehiculos}
                    isLoading={isLoading}
                    onRowClick={(row) => {
                        if (row.unit) {
                            pushOptimistic(`/apartamentos/${row.unit}/vehiculos/${row.plate}?from=vehiculos`);
                            return;
                        }
                        pushOptimistic(`/vehiculos/${encodeURIComponent(row.plate)}?from=vehiculos`);
                    }}
                    columns={[
                        {
                            header: "Placa / Matrícula",
                            headerAlign: "center",
                            render: (row) => {
                                const vehicleKind = getVehicleVisualKind(row.type);

                                return (
                                    <div className="flex items-center gap-3 px-6">
                                        <div className={cn(
                                            "w-8 h-8 rounded-lg flex items-center justify-center transition-colors shadow-sm border",
                                            vehicleKind === 'bicycle' ? "bg-emerald-50 border-emerald-200 text-emerald-600" :
                                                vehicleKind === 'motorbike' ? "bg-blue-50 border-blue-200 text-blue-600" : "bg-amber-50 border-amber-200 text-amber-600"
                                        )}>
                                            {vehicleKind === 'bicycle' ? <Bike size={16} /> :
                                                vehicleKind === 'motorbike' ? <Motorbike size={16} /> : <Car size={16} />}
                                        </div>
                                        <div className={cn(
                                            "px-3 py-1 rounded border flex items-center justify-center",
                                            vehicleKind === 'bicycle' ? "bg-emerald-50/50 border-emerald-100" :
                                                vehicleKind === 'motorbike' ? "bg-blue-50/50 border-blue-100" : "bg-zinc-50 border-zinc-200"
                                        )}>
                                            <span className={cn(
                                                "text-[10px] font-black tracking-widest",
                                                vehicleKind === 'bicycle' ? "text-emerald-600" :
                                                    vehicleKind === 'motorbike' ? "text-blue-600" : "text-zinc-600"
                                            )}>{row.plate}</span>
                                        </div>
                                    </div>
                                );
                            }
                        },
                        {
                            header: "Parqueadero",
                            headerAlign: "center",
                            render: (row) => (
                                <div className="flex items-center justify-center gap-2">
                                    <ParkingSquare size={16} className="text-blue-500" />
                                    <span className="font-bold text-zinc-700">{row.parking || 'Sin asignar'}</span>
                                </div>
                            )
                        },
                        {
                            header: "Unidad",
                            headerAlign: "center",
                            render: (row) => (
                                <div className="font-medium text-zinc-500">
                                    {row.unit ? `Torre ${row.tower} - Apt ${row.apartment}` : 'Sin asignar'}
                                </div>
                            )
                        }
                    ]}
                    emptyMessage="No se encontraron vehículos con los filtros seleccionados."
                />
                <TablePagination
                    filteredCount={filteredVehiculos.length}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>
        </div>
    );
}
