'use client';

import React from 'react';
import { useOptimisticNavigation } from "@/app/_contexts/OptimisticNavigationContext";
import { usePeopleData } from '@/lib/hooks/usePeopleData';
import { useDirectoryStore } from '@/lib/store/useDirectoryStore';
import { DataTable } from '@/components/DataTable';
import { FilterBar } from '@/components/FilterBar';
import { PageHeader } from '../apartamentos/_components/PageHeader';
import { TablePagination } from '../apartamentos/_components/TablePagination';
import { Baby, User, IdCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PersonData } from '@/lib/actions/people.actions';

export default function PersonasPage() {
    const { data: people = [], isLoading } = usePeopleData();
    const {
        personaSearch, setPersonaSearch,
        personaRole, setPersonaRole,
        personaTower, setPersonaTower
    } = useDirectoryStore();

    // Obtener torres únicas para el filtro
    const towers = Array.from(new Set(
        people.flatMap(p => p.units.map(u => u.split('-')[0]))
    )).filter(Boolean).sort();

    const [currentPage, setCurrentPage] = React.useState(1);
    const pageSize = 50;

    // Reset page when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [personaSearch, personaRole, personaTower]);

    const filteredPersonas = people.filter(p => {
        const matchesSearch =
            `${p.first_name} ${p.last_name}`.toLowerCase().includes(personaSearch.toLowerCase()) ||
            p.document_number.includes(personaSearch);

        const matchesRole = personaRole === 'Cualquiera' || p.role === personaRole;

        // Check if any of the person's units match the selected tower
        const personTowers = p.units.map(u => u.split('-')[0]);
        const matchesTower = personaTower === 'Cualquiera' || personTowers.includes(personaTower);

        return matchesSearch && matchesRole && matchesTower;
    });

    const totalPages = Math.ceil(filteredPersonas.length / pageSize);
    const paginatedPersonas = filteredPersonas.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const { pushOptimistic } = useOptimisticNavigation();

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <PageHeader
                title="Directorio de Personas"
                description="Listado completo de propietarios y residentes de la copropiedad."
                showActions={false}
            />

            <FilterBar
                searchPlaceholder="Buscar por nombre o documento..."
                searchValue={personaSearch}
                onSearchChange={setPersonaSearch}
                towers={towers}
                selectedTower={personaTower}
                onTowerChange={setPersonaTower}
                extraFilters={[
                    {
                        label: "Todos los Roles",
                        value: personaRole,
                        onChange: setPersonaRole,
                        options: [
                            { label: "Propietarios", value: "Propietario" },
                            { label: "Residentes", value: "Residente" }
                        ]
                    }
                ]}
            />

            <div className="bg-white rounded-2xl shadow-sm border border-zinc-200/50 overflow-hidden">
                <DataTable<PersonData>
                    data={paginatedPersonas}
                    isLoading={isLoading}
                    columns={[
                        {
                            header: "Nombre Completo",
                            align: "left",
                            headerAlign: "center",
                            render: (row: PersonData) => {
                                const fullName = `${row.first_name} ${row.last_name}`;
                                const names = fullName.trim().split(/\s+/);
                                let shortName = names[0] || '';
                                if (names.length >= 3) {
                                    // Heurística: Primer nombre y primer apellido (asumiendo formato N1 N2 A1 A2)
                                    shortName = `${names[0]} ${names[2]}`;
                                } else if (names.length === 2) {
                                    shortName = `${names[0]} ${names[1]}`;
                                }

                                const isMinor = Boolean(row.is_minor);

                                return (
                                    <div className="flex items-center gap-3 px-6">
                                        <div
                                            className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center border",
                                                isMinor
                                                    ? "bg-amber-50 border-amber-100 text-amber-600"
                                                    : "bg-blue-50 border-blue-100 text-blue-600"
                                            )}
                                            title={isMinor ? 'Menor de edad' : 'Mayor de edad'}
                                            aria-label={isMinor ? 'Menor de edad' : 'Mayor de edad'}
                                        >
                                            {isMinor ? <Baby size={16} /> : <User size={16} />}
                                        </div>
                                        <span className="font-bold text-zinc-900">{shortName}</span>
                                    </div>
                                );
                            }
                        },
                        {
                            header: "Documento",
                            align: "left",
                            headerAlign: "center",
                            render: (row: PersonData) => (
                                <div className="flex items-center gap-2 text-zinc-600 px-6">
                                    <span className="font-mono text-xs bg-zinc-100 px-2 py-1 rounded">
                                        <IdCard size={12} className="inline mr-1" />
                                        {row.document_type || 'CC'}
                                    </span>
                                    <span className="font-medium">{row.document_number}</span>
                                </div>
                            )
                        },
                        {
                            header: "Rol",
                            align: "center",
                            headerAlign: "center",
                            render: (row: PersonData) => (
                                <div className="px-6 flex justify-center w-full">
                                    <div className={cn(
                                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit",
                                        row.role === 'Propietario' ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
                                    )}>
                                        {row.role}
                                    </div>
                                </div>
                            )
                        },
                        {
                            header: "Unidades",
                            align: "center",
                            headerAlign: "center",
                            render: (row: PersonData) => (
                                <div className="flex flex-wrap gap-1 px-6">
                                    {row.units.length > 0 ? (
                                        row.units.map((unit, idx) => (
                                            <span key={idx} className="bg-zinc-50 text-zinc-700 px-2 py-1 rounded text-xs font-medium border border-zinc-100">
                                                {unit}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-zinc-400 italic text-xs">Sin asignar</span>
                                    )}
                                </div>
                            )
                        },
                        {
                            header: "Contacto",
                            align: "left",
                            headerAlign: "center",
                            render: (row: PersonData) => (
                                <div className="flex flex-col text-xs text-zinc-500 px-6">
                                    <span>{row.email !== 'No Registrado' ? row.email : '-'}</span>
                                    <span>{row.phone !== 'No Registrado' ? row.phone : '-'}</span>
                                </div>
                            )
                        }
                    ]}
                    onRowClick={(row) => {
                        pushOptimistic(`/personas/${row.document_number}?from=personas`);
                    }}
                    emptyMessage="No se encontraron personas con los filtros seleccionados."
                />
                <TablePagination
                    filteredCount={filteredPersonas.length}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>
        </div>
    );
}
