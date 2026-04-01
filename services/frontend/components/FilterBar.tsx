import React from 'react';
import { Search } from 'lucide-react';
import { SelectPremium } from './ui/SelectPremium';

interface FilterOption {
    label: string;
    value: string;
}

interface ExtraFilter {
    label: string;
    value: string;
    options: FilterOption[];
    onChange: (val: string) => void;
}

interface FilterBarProps {
    searchPlaceholder?: string;
    searchValue: string;
    onSearchChange: (val: string) => void;
    towers?: string[];
    selectedTower?: string;
    onTowerChange?: (val: string) => void;
    extraFilters?: ExtraFilter[];
}

export function FilterBar({
    searchPlaceholder = "Buscar...",
    searchValue,
    onSearchChange,
    towers,
    selectedTower = "Cualquiera",
    onTowerChange,
    extraFilters = []
}: FilterBarProps) {
    const hasFilters = (towers && onTowerChange) || extraFilters.length > 0;
    const towerOptions = [
        { label: "Todas las Torres", value: "Cualquiera" },
        ...(towers?.map(t => ({ label: `Torre ${t}`, value: t })) || [])
    ];

    return (
        <div className="bg-white/70 backdrop-blur-2xl p-2 rounded-2xl shadow-[0_30px_60px_-20px_rgba(2,6,23,0.6)] border border-white/50 flex flex-wrap items-center gap-2 transition-all duration-300 w-full max-w-4xl mx-auto">
            {/* Search Input */}
            <div className="relative group w-full sm:flex-1 sm:min-w-[260px] rounded-xl transition-colors hover:bg-white/50 focus-within:bg-white/60">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400 group-focus-within:text-blue-500 transition-all duration-300" />
                <input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full bg-transparent border-none rounded-xl py-3 pl-11 pr-4 text-sm font-medium text-zinc-700 focus:ring-0 outline-none transition-all duration-300 placeholder:text-zinc-400"
                />
            </div>

            {hasFilters && (
                <div className="hidden sm:block h-8 w-px bg-zinc-200/70 mx-1" />
            )}

            {/* Tower Filter */}
            {towers && onTowerChange && (
                <div className="w-full sm:w-auto min-w-[160px]">
                    <SelectPremium
                        options={towerOptions}
                        value={selectedTower}
                        onChange={onTowerChange}
                        placeholder="Todas las Torres"
                        variant="blue"
                    />
                </div>
            )}

            {/* Extra Filters */}
            {extraFilters.map((filter, idx) => {
                const options = [
                    { label: filter.label, value: "Cualquiera" },
                    ...filter.options
                ];

                return (
                    <div key={idx} className="w-full sm:w-auto min-w-[160px]">
                        <SelectPremium
                            options={options}
                            value={filter.value}
                            onChange={filter.onChange}
                            placeholder={filter.label}
                        />
                    </div>
                );
            })}
        </div>
    );
}
