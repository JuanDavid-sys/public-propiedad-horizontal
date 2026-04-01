"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, User, IdCard, Car, Dog, ChevronRight, X, ParkingSquare, Baby } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePeopleData } from '@/lib/hooks/usePeopleData';
import { useVehiclesData } from '@/lib/hooks/useVehiclesData';
import { usePetsData } from '@/lib/hooks/usePetsData';
import { useParkingData } from '@/lib/hooks/useParkingData';
import type { PersonData } from '@/lib/actions/people.actions';
import type { ParkingData, PetData, VehicleData } from '@/lib/actions/base.actions';

type SearchPersonResult = PersonData & {
    name: string;
    documentNumber: string;
    documentType: string;
};

type SearchDropdownSelectItem = SearchPersonResult | VehicleData | PetData | ParkingData;

interface SearchDropdownProps {
    type: 'person' | 'vehicle' | 'pet' | 'parking';
    onSelect: (item: SearchDropdownSelectItem) => void;
    placeholder?: string;
    color?: 'blue' | 'purple' | 'amber' | 'rose';
    excludeMinors?: boolean;
}

function HighlightedText({ text, highlight }: { text: string; highlight: string }) {
    if (!highlight.trim()) return <span>{text}</span>;
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    return (
        <span>
            {parts.map((part, i) =>
                regex.test(part) ? (
                    <mark key={i} className="bg-yellow-200 text-yellow-900 rounded-px px-0.5 font-bold">
                        {part}
                    </mark>
                ) : (
                    <span key={i}>{part}</span>
                )
            )}
        </span>
    );
}

export function SearchDropdown({
    type: searchType,
    onSelect,
    placeholder,
    color = 'blue',
    excludeMinors = false
}: SearchDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [alignment, setAlignment] = useState<'left' | 'right' | 'center'>('center');
    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const { data: people = [] } = usePeopleData();
    const { data: vehiculos = [] } = useVehiclesData();
    const { data: pets = [] } = usePetsData();
    const { data: parkingSpaces = [] } = useParkingData();

    const colorClasses = {
        blue: "text-blue-600 border-blue-100 hover:bg-blue-50",
        purple: "text-purple-600 border-purple-100 hover:bg-purple-50",
        amber: "text-amber-600 border-amber-100 hover:bg-amber-50",
        rose: "text-rose-600 border-rose-100 hover:bg-rose-50"
    };

    const iconBgClasses = {
        blue: "bg-blue-100/50 text-blue-600 group-hover:bg-blue-600",
        purple: "bg-purple-100/50 text-purple-600 group-hover:bg-purple-600",
        amber: "bg-amber-100/50 text-amber-600 group-hover:bg-amber-600",
        rose: "bg-rose-100/50 text-rose-600 group-hover:bg-rose-600"
    };

    const [isReady, setIsReady] = useState(false);

    React.useLayoutEffect(() => {
        if (isOpen && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const dropdownWidth = 288;
            const halfDropdown = dropdownWidth / 2;
            const triggerCenter = rect.left + rect.width / 2;

            let newAlignment: 'left' | 'right' | 'center' = 'center';
            if (triggerCenter < halfDropdown + 20) {
                newAlignment = 'left';
            } else if (viewportWidth - triggerCenter < halfDropdown + 20) {
                newAlignment = 'right';
            } else {
                newAlignment = 'center';
            }

            setAlignment(newAlignment);
            setIsReady(true);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const results = useMemo<SearchDropdownSelectItem[]>(() => {
        const term = query.toLowerCase().trim();
        if (!term) return [];

        if (searchType === 'person') {
            return people
                .map((p) => ({
                    ...p,
                    name: `${p.first_name} ${p.last_name}`.trim(),
                    documentNumber: p.document_number,
                    documentType: p.document_type,
                }))
                .filter((p) =>
                    p.name.toLowerCase().includes(term) ||
                    p.documentNumber.toLowerCase().includes(term)
                )
                .filter((p) => !excludeMinors || !p.is_minor)
                .slice(0, 8) as SearchPersonResult[];
        }

        if (searchType === 'vehicle') {
            return vehiculos.filter(v => v.plate.toLowerCase().includes(term)).slice(0, 8);
        }

        if (searchType === 'pet') {
            return pets.filter(p => p.name.toLowerCase().includes(term)).slice(0, 8);
        }

        if (searchType === 'parking') {
            return parkingSpaces
                .filter(p =>
                    (p.number.toLowerCase().includes(term) ||
                        p.status.toLowerCase().includes(term)) &&
                    (p.status === 'DISPONIBLE')
                )
                .slice(0, 8);
        }

        return [];
    }, [query, searchType, people, vehiculos, pets, parkingSpaces, excludeMinors]);

    const handleSelect = (item: SearchDropdownSelectItem) => {
        onSelect(item);
        setIsOpen(false);
        setQuery('');
    };

    return (
        <div className="relative" ref={containerRef}>
            <button
                ref={triggerRef}
                type="button"
                onClick={() => {
                    if (!isOpen) setIsReady(false);
                    setIsOpen(!isOpen);
                }}
                className={cn(
                    "h-8 w-8 rounded-xl flex items-center justify-center border transition-all shadow-sm",
                    colorClasses[color]
                )}
                title="Buscar existente"
            >
                <Search size={14} />
            </button>

            {isOpen && (
                <div
                    className={cn(
                        "absolute top-full mt-2 w-72 bg-white rounded-2xl border border-zinc-200 shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 transition-opacity",
                        !isReady ? "opacity-0" : "opacity-100",
                        alignment === 'center' && "left-1/2 -translate-x-1/2",
                        alignment === 'left' && "left-0",
                        alignment === 'right' && "right-0"
                    )}
                >
                    <div className="p-2 border-b border-zinc-50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder={placeholder || "Buscar..."}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="w-full bg-zinc-50 border-transparent rounded-xl py-2 pl-9 pr-8 text-xs focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:border-blue-500/30 transition-all outline-none border"
                            />
                            {query && (
                                <button
                                    onClick={() => setQuery('')}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-200 rounded-full transition-colors"
                                >
                                    <X size={12} className="text-zinc-400" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="max-h-60 overflow-y-auto p-1">
                        {results.length > 0 ? (
                            results.map((item, i) => {
                                const person = searchType === 'person' ? item as SearchPersonResult : null;
                                const vehicle = searchType === 'vehicle' ? item as VehicleData : null;
                                const pet = searchType === 'pet' ? item as PetData : null;
                                const parking = searchType === 'parking' ? item as ParkingData : null;
                                const isIdMatch = person ? person.documentNumber.toLowerCase().includes(query.toLowerCase()) : false;
                                const isMinorPerson = Boolean(person?.is_minor);
                                const personIconClassName = isMinorPerson ? iconBgClasses.amber : iconBgClasses[color];

                                return (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => handleSelect(item)}
                                        className="w-full flex items-center gap-3 p-2.5 hover:bg-zinc-50 rounded-xl transition-all group text-left"
                                    >
                                        <div className={cn(
                                            "w-8 h-8 rounded-lg flex items-center justify-center group-hover:text-white transition-colors shrink-0",
                                            personIconClassName
                                        )}>
                                            {person ? (
                                                isMinorPerson ? <Baby size={16} /> : isIdMatch ? <IdCard size={16} /> : <User size={16} />
                                            ) : vehicle ? <Car size={16} /> : pet ? <Dog size={16} /> : <ParkingSquare size={16} />}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            {vehicle ? (
                                                <div className="px-2 py-0.5 bg-zinc-50 rounded border border-zinc-200 w-fit mb-0.5 group-hover:bg-white group-hover:border-amber-200 transition-colors">
                                                    <span className="text-[10px] font-black text-zinc-600 tracking-widest">
                                                        <HighlightedText text={vehicle.plate} highlight={query} />
                                                    </span>
                                                </div>
                                            ) : parking ? (
                                                <span className="text-sm font-bold text-zinc-900 truncate">
                                                    Puesto <HighlightedText text={parking.number} highlight={query} />
                                                </span>
                                            ) : (
                                                <span className="text-sm font-bold text-zinc-900 truncate">
                                                    {person ? (
                                                        isIdMatch ? (
                                                            <>ID: <HighlightedText text={person.documentNumber} highlight={query} /></>
                                                        ) : (
                                                            <HighlightedText text={person.name} highlight={query} />
                                                        )
                                                    ) : (
                                                        <HighlightedText text={pet?.name || ''} highlight={query} />
                                                    )}
                                                </span>
                                            )}
                                            <span className="text-[10px] text-zinc-400 font-medium truncate">
                                                {person ? (
                                                    isIdMatch ? person.name : `ID: ${person.documentNumber}`
                                                ) : parking ? (
                                                    `${parking.type} • ${parking.status}`
                                                ) : (
                                                    `Unidad: ${(vehicle?.unit || pet?.unit) || 'N/A'}`
                                                )}
                                            </span>
                                        </div>
                                        <ChevronRight size={12} className="ml-auto text-zinc-300 group-hover:text-zinc-500" />
                                    </button>
                                );
                            })
                        ) : query ? (
                            <div className="py-8 px-4 text-center">
                                <p className="text-xs font-bold text-zinc-900 mb-1">Sin coincidencias</p>
                                <p className="text-[10px] text-zinc-500">No encontramos resultados para tu búsqueda</p>
                            </div>
                        ) : (
                            <div className="py-6 px-4 text-center">
                                <Search className="w-8 h-8 text-zinc-100 mx-auto mb-2" />
                                <p className="text-[10px] text-zinc-400 font-medium tracking-wide uppercase">Ingresa un término para buscar</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
