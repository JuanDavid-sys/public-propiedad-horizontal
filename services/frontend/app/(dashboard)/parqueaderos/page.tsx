'use client';

import React from 'react';
import { useParkingData } from '@/lib/hooks/useParkingData';
import { useDirectoryStore } from '@/lib/store/useDirectoryStore';
import { DataTable } from '@/components/DataTable';
import { PageHeader } from '../apartamentos/_components/PageHeader';
import { TablePagination } from '../apartamentos/_components/TablePagination';
import { ParkingSquare, Hash, Building2, ArrowUpRight } from 'lucide-react';
import { SelectPremium } from '@/components/ui/SelectPremium';
import { cn } from '@/lib/utils';
import { useOptimisticNavigation } from '@/app/_contexts/OptimisticNavigationContext';

export default function ParqueaderosPage() {
    const { pushOptimistic } = useOptimisticNavigation();
    const { data: parkingSpaces = [], isLoading } = useParkingData();
    const {
        parqueaderoSearch, setParqueaderoSearch,
        parqueaderoUnitSearch, setParqueaderoUnitSearch,
        parqueaderoStatus, setParqueaderoStatus
    } = useDirectoryStore();

    const [currentPage, setCurrentPage] = React.useState(1);
    const pageSize = 50;

    // Reset page when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [parqueaderoSearch, parqueaderoUnitSearch, parqueaderoStatus]);

    const statusOptions = [
        { label: "Todos los Estados", value: "Cualquiera" },
        { label: "Disponible / Libre", value: "DISPONIBLE" },
        { label: "Ocupado", value: "OCUPADO" },
        { label: "Visitantes", value: "VISITANTE" },
        { label: "Mantenimiento", value: "MANTENIMIENTO" },
    ];

    const filteredParqueaderos = parkingSpaces.filter(p => {
        const matchesSearch = !parqueaderoSearch || p.number.toLowerCase().includes(parqueaderoSearch.toLowerCase());

        const matchesUnitSearch = !parqueaderoUnitSearch ||
            (p.unit?.unit_number && p.unit.unit_number.toLowerCase().includes(parqueaderoUnitSearch.toLowerCase())) ||
            (p.unit?.tower && p.unit.tower.toLowerCase().includes(parqueaderoUnitSearch.toLowerCase()));

        let matchesStatus = true;
        if (parqueaderoStatus !== 'Cualquiera') {
            if (parqueaderoStatus === 'VISITANTE') {
                matchesStatus = p.type === 'VISITANTE';
            } else {
                matchesStatus = p.status === parqueaderoStatus;
            }
        }

        return matchesSearch && matchesUnitSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredParqueaderos.length / pageSize);
    const paginatedParqueaderos = filteredParqueaderos.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <PageHeader
                title="Gestión de Parqueaderos"
                description="Inventario de espacios de estacionamiento y sus unidades asignadas."
                showActions={false}
            />

            {/* Custom Filter Bar */}
            <div className="bg-white/70 backdrop-blur-2xl p-2 rounded-2xl shadow-[0_30px_60px_-20px_rgba(2,6,23,0.6)] border border-white/50 flex flex-wrap items-center gap-2 transition-all duration-300 w-full max-w-4xl mx-auto">
                {/* Search by Parking Number */}
                <div className="relative group w-full sm:flex-1 min-w-[220px] rounded-xl transition-colors hover:bg-white/50 focus-within:bg-white/60">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-blue-500 transition-all duration-300" />
                    <input
                        type="text"
                        placeholder="N° Parqueadero..."
                        value={parqueaderoSearch}
                        onChange={(e) => setParqueaderoSearch(e.target.value)}
                        className="w-full bg-transparent border-none rounded-xl py-3 pl-11 pr-4 text-sm font-medium text-zinc-700 focus:ring-0 outline-none transition-all duration-300 placeholder:text-zinc-400"
                    />
                </div>

                <div className="hidden sm:block h-8 w-px bg-zinc-200/70 mx-1" />

                {/* Search by Unit */}
                <div className="relative group w-full sm:flex-[1.2] min-w-[240px] rounded-xl transition-colors hover:bg-white/50 focus-within:bg-white/60">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-amber-500 transition-all duration-300" />
                    <input
                        type="text"
                        placeholder="Buscar por Apartamento / Torre..."
                        value={parqueaderoUnitSearch}
                        onChange={(e) => setParqueaderoUnitSearch(e.target.value)}
                        className="w-full bg-transparent border-none rounded-xl py-3 pl-11 pr-4 text-sm font-medium text-zinc-700 focus:ring-0 outline-none transition-all duration-300 placeholder:text-zinc-400"
                    />
                </div>

                <div className="hidden sm:block h-8 w-px bg-zinc-200/70 mx-1" />

                {/* Status Filter */}
                <div className="w-full sm:w-auto min-w-[180px]">
                    <SelectPremium
                        options={statusOptions}
                        value={parqueaderoStatus}
                        onChange={setParqueaderoStatus}
                        placeholder="Filtrar por Estado"
                        variant="default"
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-zinc-200/50 overflow-hidden">
                <DataTable
                    data={paginatedParqueaderos}
                    isLoading={isLoading}
                    onRowClick={(row) => {
                        if (row.unit) {
                            const unitId = `${row.unit.tower}-${row.unit.unit_number}`;
                            pushOptimistic(`/apartamentos/${unitId}?tab=parking_vehicles`);
                        }
                    }}
                    columns={[
                        {
                            header: "Espacio / Spot",
                            align: "center",
                            render: (row) => (
                                <div className="flex items-center gap-3 px-6 text-center w-full justify-center">
                                    <div className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center transition-colors shadow-sm",
                                        row.type === 'VISITANTE' ? "bg-amber-50" : "bg-blue-50"
                                    )}>
                                        <ParkingSquare size={16} className={row.type === 'VISITANTE' ? "text-amber-600" : "text-blue-600"} />
                                    </div>
                                    <div className="flex flex-col min-w-0 items-center">
                                        <span className="font-black text-zinc-900 leading-tight">{row.number}</span>
                                        <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">{row.type === 'VISITANTE' ? 'Invitado' : 'Propio'}</span>
                                    </div>
                                </div>
                            )
                        },
                        {
                            header: "Estado",
                            render: (row) => (
                                <div className={cn(
                                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit border shadow-sm",
                                    row.status === 'DISPONIBLE' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                        row.status === 'OCUPADO' ? "bg-blue-50 text-blue-600 border-blue-100" :
                                            "bg-zinc-100 text-zinc-500 border-zinc-200"
                                )}>
                                    {row.status === 'DISPONIBLE' ? 'Libre' : row.status}
                                </div>
                            )
                        },
                        {
                            header: "Unidad Asignada",
                            render: (row) => (
                                <div className="font-medium text-zinc-600">
                                    {row.unit ? (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (row.unit) {
                                                        const unitId = `${row.unit.tower}-${row.unit.unit_number}`;
                                                        pushOptimistic(`/apartamentos/${unitId}?tab=parking_vehicles`);
                                                    }
                                                }}
                                                className="group/unit-btn flex items-center gap-2 bg-zinc-50 px-3 py-1.5 rounded-xl border border-zinc-200 shadow-sm cursor-pointer transition-all hover:bg-blue-600 hover:border-blue-700 hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 active:scale-95"
                                                title={`Ver apartamento ${row.unit.tower}-${row.unit.unit_number}`}
                                                aria-label={`Ver apartamento ${row.unit.tower}-${row.unit.unit_number}`}
                                            >
                                                <span className="px-1.5 py-0.5 bg-zinc-200/50 rounded text-[9px] font-black text-zinc-600 tracking-tighter uppercase transition-colors group-hover/unit-btn:bg-white/15 group-hover/unit-btn:text-white">T{row.unit.tower}</span>
                                                <span className="font-black text-zinc-900 text-sm group-hover/unit-btn:text-white transition-colors">{row.unit.unit_number}</span>
                                                <ArrowUpRight size={14} className="text-zinc-400 group-hover/unit-btn:text-white transition-colors" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 text-zinc-300 italic text-sm font-medium">
                                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-200" />
                                            Sin asignar
                                        </div>
                                    )}
                                </div>
                            )
                        },
                        {
                            header: "Vehículo Asignado",
                            render: (row) => (
                                <div className="font-medium text-zinc-600">
                                    {row.vehicle ? (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (row.unit) {
                                                        const unitId = `${row.unit.tower}-${row.unit.unit_number}`;
                                                        pushOptimistic(`/apartamentos/${unitId}/vehiculos/${encodeURIComponent(row.vehicle!.plate)}?from=parqueaderos`);
                                                    }
                                                }}
                                                className="group/plate-btn flex items-center gap-2 bg-zinc-50 px-3 py-1.5 rounded-xl border border-zinc-200 shadow-sm cursor-pointer transition-all hover:bg-blue-600 hover:border-blue-700 hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 active:scale-95"
                                                title={`Ver detalles del vehículo ${row.vehicle.plate}`}
                                                aria-label={`Ver detalles del vehículo ${row.vehicle.plate}`}
                                            >
                                                <span className="font-black text-zinc-900 text-sm group-hover/plate-btn:text-white transition-colors">{row.vehicle.plate}</span>
                                                <ArrowUpRight size={14} className="text-zinc-400 group-hover/plate-btn:text-white transition-colors" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 text-zinc-300 italic text-sm font-medium">
                                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-200" />
                                            Sin asignar
                                        </div>
                                    )}
                                </div>
                            )
                        }
                    ]}
                    emptyMessage="No se encontraron parqueaderos con los filtros seleccionados."
                />
                <TablePagination
                    filteredCount={filteredParqueaderos.length}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>
        </div>
    );
}
