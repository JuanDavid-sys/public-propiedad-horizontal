'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useOptimisticNavigation } from "@/app/_contexts/OptimisticNavigationContext";
import { usePetsData } from '@/lib/hooks/usePetsData';
import { useDirectoryStore } from '@/lib/store/useDirectoryStore';
import { DataTable } from '@/components/DataTable';
import { FilterBar } from '@/components/FilterBar';
import { PageHeader } from '../apartamentos/_components/PageHeader';
import { TablePagination } from '../apartamentos/_components/TablePagination';
import { PawPrint } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MascotasPage() {
    const { pushOptimistic } = useOptimisticNavigation();
    const { data: mascotas = [], isLoading } = usePetsData();
    const { mascotaSearch, setMascotaSearch, mascotaTower, setMascotaTower } = useDirectoryStore();

    // Obtener torres únicas para el filtro
    const towers = Array.from(new Set(mascotas.map((item: any) => item.tower).filter(Boolean))).sort();

    const [currentPage, setCurrentPage] = React.useState(1);
    const pageSize = 50;

    // Reset page when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [mascotaSearch, mascotaTower]);

    const filteredMascotas = mascotas.filter(m => {
        const matchesSearch =
            m.name.toLowerCase().includes(mascotaSearch.toLowerCase()) ||
            m.unit.toLowerCase().includes(mascotaSearch.toLowerCase());
        const matchesTower = mascotaTower === 'Cualquiera' || m.tower === mascotaTower;
        return matchesSearch && matchesTower;
    });

    const totalPages = Math.ceil(filteredMascotas.length / pageSize);
    const paginatedMascotas = filteredMascotas.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <PageHeader
                title="Censo de Mascotas"
                description="Listado de mascotas registradas por cada unidad residencial."
                showActions={false}
            />

            <FilterBar
                searchPlaceholder="Buscar por nombre o unidad..."
                searchValue={mascotaSearch}
                onSearchChange={setMascotaSearch}
                towers={towers}
                selectedTower={mascotaTower}
                onTowerChange={setMascotaTower}
            />

            <div className="bg-white rounded-2xl shadow-sm border border-zinc-200/50 overflow-hidden">
                <DataTable
                    data={paginatedMascotas}
                    isLoading={isLoading}
                    onRowClick={(row) => pushOptimistic(`/apartamentos/${row.unit}/mascotas/${row.id}?from=mascotas`)}
                    columns={[
                        {
                            header: "Mascota",
                            render: (row) => (
                                <div className="flex items-center gap-3 px-6">
                                    <div className="w-8 h-8 bg-amber-50 rounded-full flex items-center justify-center">
                                        <PawPrint size={16} className="text-amber-600" />
                                    </div>
                                    <span className="font-bold text-zinc-900">{row.name}</span>
                                </div>
                            )
                        },
                        {
                            header: "Tipo / Raza",
                            render: (row) => (
                                <span className="text-zinc-500 italic">{row.species}{row.breed ? ` / ${row.breed}` : ''}</span>
                            )
                        },
                        {
                            header: "Unidad",
                            render: (row) => (
                                <div className="font-medium text-zinc-600">
                                    Torre {row.tower} - Apt {row.apartment}
                                </div>
                            )
                        }
                    ]}
                    emptyMessage="No se encontraron mascotas con los filtros seleccionados."
                />
                <TablePagination
                    filteredCount={filteredMascotas.length}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>
        </div>
    );
}
