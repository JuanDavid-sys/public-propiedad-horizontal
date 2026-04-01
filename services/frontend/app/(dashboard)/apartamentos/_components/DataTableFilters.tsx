import React from 'react';
import { Search } from 'lucide-react';
import { SelectPremium } from '@/components/ui/SelectPremium';

interface DataTableFiltersProps {
    towers: string[];
    allStatuses: string[];
    selectedTower: string;
    setSelectedTower: (value: string) => void;
    selectedStatus: string;
    setSelectedStatus: (value: string) => void;
    apartmentFilter: string;
    setApartmentFilter: (value: string) => void;
}

export function DataTableFilters({
    towers,
    allStatuses,
    selectedTower,
    setSelectedTower,
    selectedStatus,
    setSelectedStatus,
    apartmentFilter,
    setApartmentFilter
}: DataTableFiltersProps) {
    const handleApartmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        // Solo permitir números y máximo 4 caracteres
        if (/^\d{0,4}$/.test(val)) {
            setApartmentFilter(val);
        }
    };

    const towerOptions = towers.length > 0
        ? towers.map(t => ({ label: `Torre ${t}`, value: t }))
        : [{ label: "Torre 1", value: "1" }];

    const statusOptions = [
        { label: "Cualquier Estado", value: "Cualquiera" },
        ...allStatuses.map(s => ({ label: s, value: s }))
    ];

    return (
        <div className="bg-white/70 backdrop-blur-2xl p-2 rounded-2xl shadow-[0_30px_60px_-20px_rgba(2,6,23,0.6)] border border-white/50 flex flex-wrap items-center gap-2 transition-all duration-300 w-full max-w-4xl mx-auto">
            <div className="w-full sm:w-auto min-w-[150px]">
                <SelectPremium
                    options={towerOptions}
                    value={selectedTower}
                    onChange={setSelectedTower}
                    placeholder="Torre"
                    variant="blue"
                />
            </div>

            <div className="hidden sm:block h-8 w-px bg-zinc-200/70 mx-1" />

            <div className="flex items-center gap-2 w-full sm:flex-1 min-w-[220px]">
                <div className="relative group w-full rounded-xl transition-colors hover:bg-white/50 focus-within:bg-white/60">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-blue-500 transition-all duration-300" />
                    <input
                        type="text"
                        placeholder="Apto (ej. 101)"
                        value={apartmentFilter}
                        onChange={handleApartmentChange}
                        className="w-full bg-transparent border-none rounded-xl py-3 pl-10 pr-4 text-sm font-medium text-zinc-700 focus:ring-0 outline-none transition-all duration-300 placeholder:text-zinc-400"
                    />
                </div>
            </div>

            <div className="hidden sm:block h-8 w-px bg-zinc-200/70 mx-1" />

            <div className="w-full sm:w-auto min-w-[180px]">
                <SelectPremium
                    options={statusOptions}
                    value={selectedStatus}
                    onChange={setSelectedStatus}
                    placeholder="Estado"
                />
            </div>
        </div>
    );
}
