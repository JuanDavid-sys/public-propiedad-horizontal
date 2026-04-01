"use client";

import React, { Suspense } from 'react';
import {
    Search,
    Home,
    User,
    PawPrint,
    Car,
    ParkingSquare,
    ChevronRight,
    IdCard,
    Users
} from 'lucide-react';
import { useDirectoryData } from '@/lib/hooks/useDirectoryData';
import { usePeopleData } from '@/lib/hooks/usePeopleData';
import { useVehiclesData } from '@/lib/hooks/useVehiclesData';
import { usePetsData } from '@/lib/hooks/usePetsData';
import {
    transformToParqueaderos
} from '@/lib/utils/dataTransform';
import { DataTable } from '@/components/DataTable';
import { StatusBadge } from '../apartamentos/_components/StatusBadge';
import { CounterBadge } from '../apartamentos/_components/CounterBadge';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { TablePagination } from '../apartamentos/_components/TablePagination';
import { SearchResultsSkeleton } from '@/components/skeletons/PageSkeletons';
import { useOptimisticNavigation } from '@/app/_contexts/OptimisticNavigationContext';

// Definición fuera para evitar errores de lint "react-hooks/static-components"
const SectionHeader = ({ title, icon: Icon, color }: { title: string, icon: React.ElementType, color: string }) => (
    <div className="flex items-center justify-between mb-4 mt-8 first:mt-0">
        <div className="flex items-center gap-2">
            <div className={cn("p-2 rounded-lg bg-white shadow-sm border border-zinc-200", color)}>
                <Icon size={18} />
            </div>
            <h2 className="text-lg font-bold text-zinc-800">{title}</h2>
        </div>
    </div>
);

function SearchResultsPageContent() {
    const { pushOptimistic } = useOptimisticNavigation();
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';
    const term = query.toLowerCase();

    const { data: units = [], isLoading: loadingUnits } = useDirectoryData();
    const { data: people = [], isLoading: loadingPeople } = usePeopleData();
    const { data: vehiculos = [], isLoading: loadingVehicles } = useVehiclesData();
    const { data: mascotas = [], isLoading: loadingMascotas } = usePetsData();

    const isLoading = loadingUnits || loadingPeople || loadingVehicles || loadingMascotas;

    // Transformaciones
    const parqueaderos = transformToParqueaderos(units);

    // Filtrado
    const filteredUnits = units.filter(u =>
        u.unit.toLowerCase().includes(term) ||
        u.status.toLowerCase().includes(term)
    );

    const normalizedPeople = people.map((p) => ({
        ...p,
        name: `${p.first_name} ${p.last_name}`.trim(),
        documentNumber: p.document_number,
        documentType: p.document_type,
    }));

    const filteredPeople = normalizedPeople.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.documentNumber.toLowerCase().includes(term)
    );

    const filteredVehiculos = vehiculos.filter(v =>
        v.plate.toLowerCase().includes(term)
    );

    const filteredMascotas = mascotas.filter(m =>
        (m.name || '').toLowerCase().includes(term)
    );

    const filteredParqueaderos = parqueaderos.filter(p =>
        p.spot.toLowerCase().includes(term) ||
        p.unit.toLowerCase().includes(term)
    );

    const hasResults =
        filteredUnits.length > 0 ||
        filteredPeople.length > 0 ||
        filteredVehiculos.length > 0 ||
        filteredMascotas.length > 0 ||
        filteredParqueaderos.length > 0;

    // Función para scroll suave personalizado (más lento y controlado)
    const smoothScrollTo = (targetId: string) => {
        const element = document.getElementById(targetId);
        if (!element) return;

        const headerOffset = 90; // Ajuste para el header sticky
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    };

    const sectionToScroll = searchParams.get('section');

    // Efecto para auto-scroll basado en el parámetro 'section' de la URL
    React.useEffect(() => {
        if (!isLoading && hasResults && sectionToScroll) {
            // Un delay un poco más largo (500ms) para que se note el inicio del scroll
            const timer = setTimeout(() => {
                smoothScrollTo(sectionToScroll);
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [isLoading, hasResults, sectionToScroll]);

    return (
        <div className="flex flex-col min-h-full bg-slate-50/50 p-4 sm:p-6 pb-20">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-white rounded-xl shadow-sm border border-zinc-200 text-blue-600">
                    <Search size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
                        Resultados de Búsqueda
                    </h1>
                    <p className="text-zinc-500 text-sm">
                        Mostrando resultados para <span className="font-semibold text-zinc-900">&quot;{query}&quot;</span>
                    </p>
                </div>
            </div>

            {isLoading ? (
                <SearchResultsSkeleton withHeader={false} />
            ) : !hasResults ? (
                <div className="flex-1 flex flex-col items-center justify-center p-20 bg-white rounded-3xl border border-dashed border-zinc-300">
                    <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
                        <Search size={24} className="text-zinc-300" />
                    </div>
                    <h3 className="text-zinc-900 font-bold mb-1">Sin coincidencias</h3>
                    <p className="text-zinc-500 text-sm max-w-[300px] text-center">
                        No encontramos resultados para <span className="text-blue-600 font-medium">&quot;{query}&quot;</span>.
                        Prueba buscando por nombre, documento, unidad o placa.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredUnits.length > 0 && (
                        <section id="unidades">
                            <SectionHeader title="Unidades Residenciales" icon={Home} color="text-blue-600" />
                            <div className="bg-white rounded-2xl shadow-sm border border-zinc-200/50 overflow-hidden">
                                <DataTable
                                    data={filteredUnits}
                                    columns={[
                                        {
                                            header: "Torre-Apto",
                                            render: (row) => (
                                                <div className="flex items-center gap-2 font-bold text-zinc-900 px-4">
                                                    {row.unit}
                                                    <ChevronRight size={14} className="text-zinc-300" />
                                                </div>
                                            )
                                        },
                                        {
                                            header: "Estado",
                                            render: (row) => <StatusBadge status={row.status} />
                                        },
                                        {
                                            header: "Propietarios",
                                            render: (row) => <CounterBadge icon={User} count={row.ownerCount} />
                                        },
                                        {
                                            header: "Residentes",
                                            render: (row) => <CounterBadge icon={Users} count={row.residentCount} center />
                                        }
                                    ]}
                                    onRowClick={(row) => pushOptimistic(`/apartamentos/${row.unit}`)}
                                />
                                <TablePagination
                                    filteredCount={filteredUnits.length}
                                    currentPage={1}
                                    totalPages={1}
                                    onPageChange={() => { }}
                                    hidePagination={true}
                                />
                            </div>
                        </section>
                    )}

                    {filteredPeople.length > 0 && (
                        <section id="personas">
                            <SectionHeader title="Personas" icon={User} color="text-emerald-600" />
                            <div className="bg-white rounded-2xl shadow-sm border border-zinc-200/50 overflow-hidden">
                                <DataTable
                                    data={filteredPeople}
                                    columns={[
                                        {
                                            header: "Nombre Completo",
                                            align: "left",
                                            headerAlign: "center",
                                            render: (row) => (
                                                <div className="flex items-center gap-3 px-4">
                                                    <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center">
                                                        <User size={16} className="text-zinc-500" />
                                                    </div>
                                                    <span className="font-bold text-zinc-900">{row.name}</span>
                                                </div>
                                            )
                                        },
                                        {
                                            header: "Documento",
                                            render: (row) => (
                                                <div className="flex items-center gap-2 text-zinc-600">
                                                    <span className="font-mono text-xs bg-zinc-100 px-2 py-1 rounded">
                                                        <IdCard size={12} className="inline mr-1" />
                                                        {row.documentType || 'CC'}
                                                    </span>
                                                    <span className="font-medium">{row.documentNumber}</span>
                                                </div>
                                            )
                                        },
                                        {
                                            header: "Unidades",
                                            render: (row) => (
                                                <div className="flex flex-wrap gap-1">
                                                    {row.units.map((unit: string, idx: number) => (
                                                        <span key={idx} className="bg-zinc-50 text-zinc-700 px-2 py-1 rounded text-xs font-medium border border-zinc-100">
                                                            {unit}
                                                        </span>
                                                    ))}
                                                </div>
                                            )
                                        }
                                    ]}
                                    onRowClick={(row) => {
                                        const firstUnit = row.units?.[0];
                                        if (firstUnit) {
                                            pushOptimistic(`/apartamentos/${firstUnit}/${row.documentNumber}?from=search`);
                                        } else {
                                            pushOptimistic(`/personas`);
                                        }
                                    }}
                                />
                                <TablePagination
                                    filteredCount={filteredPeople.length}
                                    currentPage={1}
                                    totalPages={1}
                                    onPageChange={() => { }}
                                    hidePagination={true}
                                />
                            </div>
                        </section>
                    )}

                    {filteredVehiculos.length > 0 && (
                        <section id="vehiculos">
                            <SectionHeader title="Vehículos" icon={Car} color="text-amber-600" />
                            <div className="bg-white rounded-2xl shadow-sm border border-zinc-200/50 overflow-hidden">
                                <DataTable
                                    data={filteredVehiculos}
                                    columns={[
                                        {
                                            header: "Placa / Matrícula",
                                            render: (row) => (
                                                <div className="flex items-center gap-3 px-4">
                                                    <div className="px-3 py-1 bg-zinc-50 rounded border border-zinc-200 flex items-center justify-center">
                                                        <span className="text-[10px] font-black text-zinc-600 tracking-widest">{row.plate}</span>
                                                    </div>
                                                </div>
                                            )
                                        },
                                        {
                                            header: "Unidad",
                                            render: (row) => <span className="text-zinc-600 font-medium">Torre {row.tower} - Apt {row.apartment}</span>
                                        },
                                        {
                                            header: "Parqueadero",
                                            render: (row) => (
                                                <div className="flex items-center gap-2">
                                                    <ParkingSquare size={16} className="text-blue-500" />
                                                    <span className="font-bold text-zinc-700">{row.parking || 'Sin asignar'}</span>
                                                </div>
                                            )
                                        }
                                    ]}
                                    onRowClick={(row) => row.unit ? pushOptimistic(`/apartamentos/${row.unit}/vehiculos/${encodeURIComponent(row.plate)}?from=search`) : pushOptimistic(`/vehiculos/${encodeURIComponent(row.plate)}?from=search`)}
                                />
                                <TablePagination
                                    filteredCount={filteredVehiculos.length}
                                    currentPage={1}
                                    totalPages={1}
                                    onPageChange={() => { }}
                                    hidePagination={true}
                                />
                            </div>
                        </section>
                    )}

                    {filteredMascotas.length > 0 && (
                        <section id="mascotas">
                            <SectionHeader title="Mascotas" icon={PawPrint} color="text-rose-500" />
                            <div className="bg-white rounded-2xl shadow-sm border border-zinc-200/50 overflow-hidden">
                                <DataTable
                                    data={filteredMascotas}
                                    columns={[
                                        {
                                            header: "Mascota",
                                            render: (row) => (
                                                <div className="flex items-center gap-3 px-4">
                                                    <div className="w-8 h-8 bg-rose-50 rounded-full flex items-center justify-center">
                                                        <PawPrint size={16} className="text-rose-600" />
                                                    </div>
                                                    <span className="font-bold text-zinc-900">{row.name}</span>
                                                </div>
                                            )
                                        },
                                        {
                                            header: "Tipo / Raza",
                                            render: (row) => <span className="text-zinc-500 italic">{row.species}{row.breed ? ` / ${row.breed}` : ''}</span>
                                        },
                                        {
                                            header: "Unidad",
                                            render: (row) => (
                                                <span className="text-zinc-600 font-medium">
                                                    {row.unit ? `Torre ${row.tower} - Apt ${row.apartment}` : 'Sin Unidad'}
                                                </span>
                                            )
                                        }
                                    ]}
                                    onRowClick={(row) => row.unit ? pushOptimistic(`/apartamentos/${row.unit}/mascotas/${row.id}?from=search`) : pushOptimistic(`/mascotas`)}
                                />
                                <TablePagination
                                    filteredCount={filteredMascotas.length}
                                    currentPage={1}
                                    totalPages={1}
                                    onPageChange={() => { }}
                                    hidePagination={true}
                                />
                            </div>
                        </section>
                    )}

                    {filteredParqueaderos.length > 0 && (
                        <section id="parqueaderos">
                            <SectionHeader title="Parqueaderos" icon={ParkingSquare} color="text-blue-500" />
                            <div className="bg-white rounded-2xl shadow-sm border border-zinc-200/50 overflow-hidden">
                                <DataTable
                                    data={filteredParqueaderos}
                                    columns={[
                                        {
                                            header: "Espacio",
                                            render: (row) => (
                                                <div className="flex items-center gap-3 px-4">
                                                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                                                        <ParkingSquare size={16} className="text-blue-600" />
                                                    </div>
                                                    <span className="font-black text-zinc-900">{row.spot}</span>
                                                </div>
                                            )
                                        },
                                        {
                                            header: "Unidad",
                                            render: (row) => <span className="text-zinc-600 font-medium">Torre {row.tower} - Apt {row.apartment}</span>
                                        },
                                        {
                                            header: "Estado",
                                            render: (row) => (
                                                <div className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider w-fit">
                                                    {row.status}
                                                </div>
                                            )
                                        }
                                    ]}
                                    onRowClick={() => pushOptimistic(`/parqueaderos`)}
                                />
                                <TablePagination
                                    filteredCount={filteredParqueaderos.length}
                                    currentPage={1}
                                    totalPages={1}
                                    onPageChange={() => { }}
                                    hidePagination={true}
                                />
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
}

export default function SearchResultsPage() {
    return (
        <Suspense fallback={<SearchResultsSkeleton />}>
            <SearchResultsPageContent />
        </Suspense>
    );
}
