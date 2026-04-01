'use client';

import React, { useEffect, useState } from 'react';
import {
    Building2,
    Users,
    User,
    PawPrint,
    DoorOpen,
    UserCheck,
    Bike,
    ChevronRight,
    Car,
} from 'lucide-react';
import { useDirectoryStore } from '@/lib/store/useDirectoryStore';
import { useDirectoryData } from '@/lib/hooks/useDirectoryData';
import { StatCard } from './_components/StatCard';
import { StatusBadge } from './_components/StatusBadge';
import { CounterBadge } from './_components/CounterBadge';
import { DataTableFilters } from './_components/DataTableFilters';
import { PageHeader } from './_components/PageHeader';
import { TablePagination } from './_components/TablePagination';
import { DataTable } from '@/components/DataTable';
import { useOptimisticNavigation } from '@/app/_contexts/OptimisticNavigationContext';

export default function HomePage() {
    const { pushOptimistic } = useOptimisticNavigation();
    const [isMobileViewport, setIsMobileViewport] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const mediaQuery = window.matchMedia('(max-width: 639px)');
        const updateViewport = () => setIsMobileViewport(mediaQuery.matches);

        updateViewport();
        mediaQuery.addEventListener('change', updateViewport);

        return () => {
            mediaQuery.removeEventListener('change', updateViewport);
        };
    }, []);

    const {
        selectedTower,
        setSelectedTower,
        selectedStatus,
        setSelectedStatus,
        apartmentFilter,
        setApartmentFilter,
    } = useDirectoryStore();

    const { data: rawData = [], isLoading } = useDirectoryData();
    const data = rawData;

    const filteredData = data.filter(row => {
        const rowTower = row.unit.split('-')[0];
        const apartmentPart = row.unit.split('-')[1] || '';
        const matchesTower = rowTower === selectedTower;
        const matchesStatus = selectedStatus === 'Cualquiera' || row.status === selectedStatus;
        const matchesApartment = !apartmentFilter || apartmentPart.includes(apartmentFilter);

        return matchesTower && matchesStatus && matchesApartment;
    });

    const totalUnits = data.length;
    const occupiedCount = data.filter(u => {
        const s = u.status?.toLowerCase() || '';
        return s && s !== 'desocupado';
    }).length;
    const emptyCount = totalUnits - occupiedCount;
    const occupancyRate = totalUnits > 0 ? Math.round((occupiedCount / totalUnits) * 100) : 0;
    const towers = Array.from(new Set(data.map(item => item.unit?.split('-')[0]).filter(Boolean))).sort((a, b) => Number(a) - Number(b));
    const allStatuses = Array.from(new Set(data.map(item => item.status).filter(Boolean))).sort();

    const kpis = [
        {
            label: 'Total Unidades',
            value: totalUnits.toString(),
            icon: Building2,
            trend: 'Unidades',
            color: 'text-blue-600',
            bg: 'bg-blue-100/70',
            className: 'bg-blue-50/80 border border-blue-100'
        },
        {
            label: 'Ocupación',
            value: occupiedCount.toString(),
            icon: UserCheck,
            trend: `${occupancyRate}% Habitado`,
            color: 'text-emerald-600',
            bg: 'bg-emerald-100/70',
        },
        {
            label: 'Disponibles',
            value: emptyCount.toString(),
            icon: DoorOpen,
            trend: 'Desocupados',
            color: 'text-rose-600',
            bg: 'bg-rose-100/70',
            isAlert: emptyCount > 0,
        },
    ];

    type ApartmentRow = (typeof filteredData)[number];

    const torreAptoColumn = {
        header: 'Torre-Apto',
        sticky: true,
        render: (row: ApartmentRow) => (
            <div className="flex items-center justify-center gap-2 font-bold text-zinc-900">
                {row.unit}
                <ChevronRight size={14} className="text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity translate-x-1 group-hover:translate-x-0" />
            </div>
        ),
    };

    const desktopColumns = [
        torreAptoColumn,
        {
            header: 'Estado',
            render: (row: ApartmentRow) => <StatusBadge status={row.status} />,
        },
        {
            header: 'Propietarios',
            render: (row: ApartmentRow) => <CounterBadge icon={User} count={row.ownerCount} />,
        },
        {
            header: 'Residentes',
            render: (row: ApartmentRow) => <CounterBadge icon={Users} count={row.residentCount} center />,
        },
        {
            header: 'Vehículos',
            render: (row: ApartmentRow) => <CounterBadge icon={Car} count={row.vehicleCount} variant="blue" />,
        },
        {
            header: 'Bicis',
            render: (row: ApartmentRow) => <CounterBadge icon={Bike} count={row.bikes} center />,
        },
        {
            header: 'Mascotas',
            render: (row: ApartmentRow) => <CounterBadge icon={PawPrint} count={row.pets} variant="amber" center />,
        },
    ];

    const tableColumns = isMobileViewport ? [torreAptoColumn] : desktopColumns;

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <PageHeader
                title="Directorio de Unidades"
                description="Listado y gestión de unidades residenciales, ocupación y registros."
                showActions={false}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {isMounted && kpis.map((kpi, i) => (
                    <div key={kpi.label} style={{ animationDelay: `${i * 100}ms` }} className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
                        <StatCard {...kpi} />
                    </div>
                ))}
            </div>

            <DataTableFilters
                towers={towers}
                allStatuses={allStatuses}
                selectedTower={selectedTower}
                setSelectedTower={setSelectedTower}
                selectedStatus={selectedStatus}
                setSelectedStatus={setSelectedStatus}
                apartmentFilter={apartmentFilter}
                setApartmentFilter={setApartmentFilter}
            />

            <div className="bg-white rounded-2xl shadow-sm border border-zinc-200/50 overflow-hidden">
                <DataTable
                    data={filteredData}
                    isLoading={isLoading}
                    columns={tableColumns}
                    minWidth={isMobileViewport ? '100%' : '760px'}
                    onRowClick={(row) => pushOptimistic(`/apartamentos/${row.unit}`)}
                    loadingMessage="Cargando datos de unidades..."
                    emptyMessage="No se encontraron datos de unidades en este momento."
                />
                <TablePagination
                    filteredCount={filteredData.length}
                    totalItems={data.length}
                    currentPage={1}
                    totalPages={1}
                    onPageChange={() => { }}
                    pageSize={filteredData.length}
                    hidePagination={true}
                />
            </div>
        </div>
    );
}
