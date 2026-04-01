"use client";

import { Search, Menu, X, LogOut, Settings, User, ChevronDown, Home, Car, ChevronRight, IdCard, Clock, Trash2, PawPrint, ParkingSquare, Building2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/DropdownMenu';
import { useDashboard } from '../layout';
import { logout } from '@/lib/actions/auth.actions';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useDirectoryData } from '@/lib/hooks/useDirectoryData';
import { usePeopleData } from '@/lib/hooks/usePeopleData';
import { useVehiclesData } from '@/lib/hooks/useVehiclesData';
import { usePetsData } from '@/lib/hooks/usePetsData';
import { transformToParqueaderos } from '@/lib/utils/dataTransform';
import { useSearchHistory } from '@/lib/hooks/useSearchHistory';
import { useOptimisticNavigation } from '@/app/_contexts/OptimisticNavigationContext';
import type { AppSessionLike } from '@/types/auth';

import { OptimisticLink } from '@/components/ui/OptimisticLink';

export function DashboardHeader() {
    const [mounted, setMounted] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isMobileSearchExpanded, setIsMobileSearchExpanded] = useState(false);
    const searchContainerRef = useRef<HTMLDivElement>(null);

    const { setIsMobileMenuOpen } = useDashboard();
    const { data: units = [] } = useDirectoryData();
    const { data: people = [] } = usePeopleData();
    const { data: vehiculos = [] } = useVehiclesData();
    const { data: pets = [] } = usePetsData();
    const { pushOptimistic } = useOptimisticNavigation();
    const { history, addSearchTerm, removeSearchTerm, clearHistory } = useSearchHistory();
    const { data: session } = useSession();
    const sessionData = session as AppSessionLike | null | undefined;

    const user = sessionData?.backendTokens?.user || sessionData?.user;
    const userFullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim();
    const userName = user?.name || userFullName || sessionData?.user?.name || 'Usuario';
    const userEmail = user?.email || sessionData?.user?.email || 'usuario@residencial.com';

    const initials = useMemo(() => {
        if (user?.first_name && user?.last_name) {
            return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
        }
        if (session?.user?.name) {
            const parts = session.user.name.split(' ');
            if (parts.length >= 2) {
                return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
            }
            return parts[0][0].toUpperCase();
        }
        return 'US';
    }, [session, user]);


    useEffect(() => {
        setMounted(true);
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (searchContainerRef.current && !searchContainerRef.current.contains(target)) {
                setIsOpen(false);
                setIsMobileSearchExpanded(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsMobileSearchExpanded(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const searchResults = useMemo(() => {
        if (query.trim().length < 1) return null;

        const mascotas = pets;
        const parqueaderos = transformToParqueaderos(units);
        const term = query.toLowerCase();

        // Determinar si la búsqueda parece ser un ID (números)
        const isNumericSearch = /^\d+$/.test(term);

        const allUnitsFilter = units.filter(u =>
            u.unit.toLowerCase().includes(term) ||
            u.status.toLowerCase().includes(term)
        );
        const allPeopleFilter = people.filter(p =>
            `${p.first_name} ${p.last_name}`.toLowerCase().includes(term) ||
            p.document_number.includes(term)
        );
        const allVehiclesFilter = vehiculos.filter(v =>
            v.plate.toLowerCase().includes(term)
        );
        const allPetsFilter = mascotas.filter(m =>
            (m.name || '').toLowerCase().includes(term)
        );
        const allParkingFilter = parqueaderos.filter(p =>
            p.spot.toLowerCase().includes(term) ||
            p.unit.toLowerCase().includes(term)
        );

        const matches = {
            apartamentos: allUnitsFilter.slice(0, 5),
            personas: allPeopleFilter.slice(0, 5),
            vehiculos: allVehiclesFilter.slice(0, 5),
            mascotas: allPetsFilter.slice(0, 5),
            parqueaderos: allParkingFilter.slice(0, 5),
            totalCounts: {
                apartamentos: allUnitsFilter.length,
                personas: allPeopleFilter.length,
                vehiculos: allVehiclesFilter.length,
                mascotas: allPetsFilter.length,
                parqueaderos: allParkingFilter.length
            }
        };

        const totalResults =
            matches.apartamentos.length +
            matches.personas.length +
            matches.vehiculos.length +
            matches.mascotas.length +
            matches.parqueaderos.length;

        return totalResults > 0 ? { ...matches, isNumericSearch } : null;
    }, [query, units, people, vehiculos, pets]);

    const handleSearch = (termToSearch?: string, section?: string) => {
        const term = termToSearch || query;
        if (term.trim()) {
            addSearchTerm(term.trim());
            setIsOpen(false);
            setIsMobileSearchExpanded(false);
            const sectionParam = section ? `&section=${section}` : '';
            pushOptimistic(`/search-results?q=${encodeURIComponent(term.trim())}${sectionParam}`);
        }
    };


    const handleSelect = (type: string, id: string | number) => {
        setQuery('');
        setIsOpen(false);
        setIsMobileSearchExpanded(false);
        if (type === 'apartamento') pushOptimistic(`/apartamentos/${id}`);
        if (type === 'persona') {
            pushOptimistic(`/personas/${id}?from=search`);
        }
        if (type === 'vehiculo') pushOptimistic(`/vehiculos`);
        if (type === 'mascota') pushOptimistic(`/mascotas`);
        if (type === 'parqueadero') pushOptimistic(`/parqueaderos`);
    };

    const handleVehicleNavigate = (plate: string, unit?: string) => {
        setQuery('');
        setIsOpen(false);
        setIsMobileSearchExpanded(false);
        if (unit) {
            pushOptimistic(`/apartamentos/${unit}/vehiculos/${plate}?from=search`);
            return;
        }
        pushOptimistic(`/vehiculos/${encodeURIComponent(plate)}?from=search`);
    };

    const handlePetNavigate = (pet: { id: string | number, unit?: string }) => {
        setQuery('');
        setIsOpen(false);
        setIsMobileSearchExpanded(false);
        if (pet.unit) {
            pushOptimistic(`/apartamentos/${pet.unit}/mascotas/${pet.id}?from=search`);
            return;
        }
        pushOptimistic(`/mascotas`);
    };

    const handleLogout = async () => {
        if (isLoggingOut) {
            return;
        }

        setIsLoggingOut(true);

        try {
            await logout(session);
        } finally {
            setIsLoggingOut(false);
        }
    };

    const handleSearchFocus = () => {
        setIsOpen(true);
        if (window.innerWidth < 1024) {
            setIsMobileSearchExpanded(true);
        }
    };

    const closeMobileSearchOverlay = () => {
        setIsMobileSearchExpanded(false);
        if (!query.trim()) {
            setIsOpen(false);
        }
    };

    const ShowMoreButton = ({ count, type, id }: { count: number, type: string, id: string }) => {
        if (count <= 0) return null;
        return (
            <button
                onClick={() => handleSearch(query, id)}
                className="w-full flex items-center justify-center py-2 px-3 mt-1 hover:bg-zinc-50 rounded-xl transition-all group border border-dashed border-zinc-200 hover:border-blue-400"
            >
                <span className="text-[10px] font-black text-zinc-400 group-hover:text-blue-600 uppercase tracking-widest flex items-center gap-2">
                    {count} más en {type} <ChevronRight size={10} />
                </span>
            </button>
        );
    };

    return (
        <header className="relative bg-white border-b border-zinc-200/60 sticky top-0 z-40 backdrop-blur-md bg-white/80 px-3 sm:px-4 lg:px-6 py-2">
            <div className="flex items-center gap-2 lg:gap-4">
                <div
                    className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ${isMobileSearchExpanded
                        ? 'flex-[0_0_0%] opacity-0'
                        : 'flex-[0_0_auto] opacity-100'
                        }`}
                >
                    <button
                        type="button"
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="lg:hidden w-10 h-10 rounded-xl border border-zinc-200 bg-white text-zinc-600 hover:text-blue-600 hover:border-blue-200 transition-colors flex items-center justify-center"
                        aria-label="Abrir menú lateral"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    <OptimisticLink href="/apartamentos" className="h-12 flex items-center justify-center w-12 hover:bg-zinc-100 rounded-xl transition-all duration-300 group cursor-pointer">
                        <div className="w-10 h-10 flex items-center justify-center bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm border border-blue-100/50 group-hover:border-blue-600">
                            <Building2 size={22} strokeWidth={2.5} />
                        </div>
                    </OptimisticLink>
                </div>

                <div
                    className="relative flex-1 transition-all duration-300"
                    ref={searchContainerRef}
                >
                    <div className="relative group">
                        <button
                            onClick={() => handleSearch()}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 p-0 border-none bg-transparent cursor-pointer text-zinc-400 group-focus-within:text-blue-600 hover:text-blue-600 transition-colors z-10"
                        >
                            <Search className="w-4 h-4" />
                        </button>
                        <input
                            type="text"
                            placeholder="Búsqueda global (Nombre, ID, Unidad, Placa)..."
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setIsOpen(true);
                            }}
                            onFocus={handleSearchFocus}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className={`w-full bg-zinc-100/60 border-transparent rounded-2xl pl-11 focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:border-blue-500/30 transition-all outline-none border shadow-sm ${isMobileSearchExpanded ? 'h-12 text-base pr-20 py-0' : 'h-10 text-sm pr-10 py-0'}`}
                        />
                        {query && (
                            <button
                                onClick={() => { setQuery(''); setIsOpen(false); }}
                                className={`absolute top-1/2 -translate-y-1/2 p-1.5 hover:bg-zinc-200 rounded-full transition-colors ${isMobileSearchExpanded ? 'right-10' : 'right-3'}`}
                            >
                                <X size={14} className="text-zinc-400" />
                            </button>
                        )}
                        {isMobileSearchExpanded && (
                            <button
                                onClick={closeMobileSearchOverlay}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-zinc-200 rounded-full transition-colors"
                                aria-label="Cerrar búsqueda expandida"
                            >
                                <X size={16} className="text-zinc-500" />
                            </button>
                        )}
                    </div>

                    {/* Dropdown de Resultados Globales e Historial */}
                    {isOpen && (
                        <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl border border-zinc-200 shadow-2xl z-[9999] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 flex flex-col max-h-[calc(100vh-100px)]">
                            <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent">
                                {query.trim().length === 0 ? (
                                    // Vista de Historial
                                    <div className="p-2">
                                        <div className="flex items-center justify-between px-3 py-2 mb-1">
                                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.15em]">Búsquedas Recientes</span>
                                            {history.length > 0 && (
                                                <button
                                                    onClick={clearHistory}
                                                    className="text-[10px] text-red-500 hover:text-red-700 font-medium flex items-center gap-1 transition-colors"
                                                >
                                                    <Trash2 size={10} /> Borrar todo
                                                </button>
                                            )}
                                        </div>

                                        {history.length > 0 ? (
                                            <div className="space-y-0.5">
                                                {history.map((term, index) => (
                                                    <div
                                                        key={index}
                                                        className="group flex items-center justify-between p-2 hover:bg-zinc-50 rounded-xl transition-all cursor-pointer"
                                                        onClick={() => {
                                                            setQuery(term);
                                                            handleSearch(term);
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-3 text-zinc-600 group-hover:text-blue-600 transition-colors">
                                                            <Clock size={14} className="text-zinc-400 group-hover:text-blue-400" />
                                                            <span className="text-sm font-medium">{term}</span>
                                                        </div>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                removeSearchTerm(term);
                                                            }}
                                                            className="p-1 hover:bg-zinc-200 rounded-full text-zinc-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-8 text-center text-zinc-400 text-sm">
                                                No hay búsquedas recientes
                                            </div>
                                        )}
                                    </div>
                                ) : searchResults ? (

                                    <>
                                        <div className="p-2 space-y-1 max-h-[450px] overflow-y-auto scrollbar-thin">
                                            {searchResults.apartamentos.length > 0 && (
                                                <div className="mb-3">
                                                    <div className="px-3 py-2 text-[10px] font-black text-zinc-400 uppercase tracking-[0.15em] bg-zinc-50/50 rounded-lg mb-1">Unidades Residenciales</div>
                                                    {searchResults.apartamentos.map(u => (
                                                        <button
                                                            key={`u-${u.id}`}
                                                            onClick={() => handleSelect('apartamento', u.unit)}
                                                            className="w-full flex items-center justify-between p-3 hover:bg-blue-50/50 rounded-xl transition-all group text-left"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-9 h-9 bg-blue-100/50 text-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors"><Home size={18} /></div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-sm font-bold text-zinc-800">Torre {u.unit.split('-')[0]} - Apt {u.unit.split('-')[1]}</span>
                                                                    <span className="text-[10px] text-zinc-500 font-medium">{u.status}</span>
                                                                </div>
                                                            </div>
                                                            <ChevronRight size={14} className="text-zinc-300 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                                                        </button>
                                                    ))}
                                                    <ShowMoreButton
                                                        count={searchResults.totalCounts.apartamentos - searchResults.apartamentos.length}
                                                        type="Unidades"
                                                        id="unidades"
                                                    />
                                                </div>
                                            )}

                                            {searchResults.personas.length > 0 && (
                                                <div className="mb-3">
                                                    <div className="px-3 py-2 text-[10px] font-black text-zinc-400 uppercase tracking-[0.15em] bg-zinc-50/50 rounded-lg border-t border-zinc-100/50 mb-1 pt-3">Propietarios y Residentes</div>
                                                    {searchResults.personas.map(p => {
                                                        // Si busco números (ID), muestro el ID grande (coincidencia).
                                                        // Si busco letras (Nombre), muestro el Nombre grande (coincidencia).
                                                        const showNameMain = !searchResults.isNumericSearch;

                                                        return (
                                                            <button
                                                                key={`p-${p.id}`}
                                                                onClick={() => handleSelect('persona', p.document_number)}
                                                                className="w-full flex items-center justify-between p-3 hover:bg-emerald-50/50 rounded-xl transition-all group text-left"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-9 h-9 bg-emerald-100/50 text-emerald-600 rounded-lg flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                                                        {showNameMain ? <User size={18} /> : <IdCard size={18} />}
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span className="text-sm font-bold text-zinc-800">
                                                                            {showNameMain ? `${p.first_name} ${p.last_name}` : `ID: ${p.document_number}`}
                                                                        </span>
                                                                        <span className="text-[10px] text-zinc-500 font-medium">
                                                                            {showNameMain ? `ID: ${p.document_number}` : `${p.first_name} ${p.last_name}`} • {p.role}
                                                                            {p.units.length > 0 ? ` • U ${p.units[0]}` : ` • Sin Unidad`}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <ChevronRight size={14} className="text-zinc-300 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                                                            </button>
                                                        );
                                                    })}
                                                    <ShowMoreButton
                                                        count={searchResults.totalCounts.personas - searchResults.personas.length}
                                                        type="Personas"
                                                        id="personas"
                                                    />
                                                </div>
                                            )}

                                            {searchResults.vehiculos.length > 0 && (
                                                <div className="mb-1">
                                                    <div className="px-3 py-2 text-[10px] font-black text-zinc-400 uppercase tracking-[0.15em] bg-zinc-50/50 rounded-lg border-t border-zinc-100/50 mb-1 pt-3">Control Vehicular</div>
                                                    {searchResults.vehiculos.map(v => (
                                                        <button
                                                            key={`v-${v.id}`}
                                                            onClick={() => handleVehicleNavigate(v.plate, v.unit)}
                                                            className="w-full flex items-center justify-between p-3 hover:bg-amber-50/50 rounded-xl transition-all group text-left"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-9 h-9 bg-amber-100/50 text-amber-600 rounded-lg flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors"><Car size={18} /></div>
                                                                <div className="flex flex-col">
                                                                    <div className="px-2 py-0.5 bg-zinc-50 rounded border border-zinc-200 w-fit mb-0.5 group-hover:bg-white group-hover:border-amber-200 transition-colors">
                                                                        <span className="text-[10px] font-black text-zinc-600 tracking-widest">{v.plate}</span>
                                                                    </div>
                                                                    <span className="text-[10px] text-zinc-500 font-medium">
                                                                        {v.unit ? `Unidad ${v.unit}` : 'Sin asignar'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <ChevronRight size={14} className="text-zinc-300 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                                                        </button>
                                                    ))}
                                                    <ShowMoreButton
                                                        count={searchResults.totalCounts.vehiculos - searchResults.vehiculos.length}
                                                        type="Vehículos"
                                                        id="vehiculos"
                                                    />
                                                </div>
                                            )}

                                            {searchResults.mascotas.length > 0 && (
                                                <div className="mb-3">
                                                    <div className="px-3 py-2 text-[10px] font-black text-zinc-400 uppercase tracking-[0.15em] bg-zinc-50/50 rounded-lg border-t border-zinc-100/50 mb-1 pt-3">Mascotas Registradas</div>
                                                    {searchResults.mascotas.map(m => (
                                                        <button
                                                            key={`m-${m.id}`}
                                                            onClick={() => handlePetNavigate(m)}
                                                            className="w-full flex items-center justify-between p-3 hover:bg-rose-50/50 rounded-xl transition-all group text-left"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-9 h-9 bg-rose-100/50 text-rose-600 rounded-lg flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors"><PawPrint size={18} /></div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-sm font-bold text-zinc-800">{m.name}</span>
                                                                    <span className="text-[10px] text-zinc-500 font-medium">
                                                                        {(m.species || 'No especificado')}{m.breed ? ` / ${m.breed}` : ''} • {m.unit ? `Unidad ${m.unit}` : 'Sin Unidad'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <ChevronRight size={14} className="text-zinc-300 group-hover:text-rose-400 group-hover:translate-x-1 transition-all" />
                                                        </button>
                                                    ))}
                                                    <ShowMoreButton
                                                        count={searchResults.totalCounts.mascotas - searchResults.mascotas.length}
                                                        type="Mascotas"
                                                        id="mascotas"
                                                    />
                                                </div>
                                            )}

                                            {searchResults.parqueaderos.length > 0 && (
                                                <div className="mb-1">
                                                    <div className="px-3 py-2 text-[10px] font-black text-zinc-400 uppercase tracking-[0.15em] bg-zinc-50/50 rounded-lg border-t border-zinc-100/50 mb-1 pt-3">Inventario Parqueaderos</div>
                                                    {searchResults.parqueaderos.map(p => (
                                                        <button
                                                            key={`pk-${p.spot}`}
                                                            onClick={() => handleSelect('parqueadero', p.spot)}
                                                            className="w-full flex items-center justify-between p-3 hover:bg-slate-50/50 rounded-xl transition-all group text-left"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-9 h-9 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center group-hover:bg-slate-600 group-hover:text-white transition-colors"><ParkingSquare size={18} /></div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-sm font-bold text-zinc-800">Espacio: {p.spot}</span>
                                                                    <span className="text-[10px] text-zinc-500 font-medium">Unidad {p.unit} • {p.status}</span>
                                                                </div>
                                                            </div>
                                                            <ChevronRight size={14} className="text-zinc-300 group-hover:text-slate-400 group-hover:translate-x-1 transition-all" />
                                                        </button>
                                                    ))}
                                                    <ShowMoreButton
                                                        count={searchResults.totalCounts.parqueaderos - searchResults.parqueaderos.length}
                                                        type="Parqueaderos"
                                                        id="parqueaderos"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-3 bg-zinc-50/80 border-t border-zinc-100 flex justify-center">
                                            <span className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em] animate-pulse">Ventura Search Engine</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="p-12 flex flex-col items-center justify-center text-center">
                                        <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
                                            <Search size={24} className="text-zinc-300" />
                                        </div>
                                        <p className="text-zinc-900 font-bold mb-1">No hay coincidencias</p>
                                        <p className="text-zinc-500 text-sm max-w-[200px]">No encontramos ningún resultado para &quot;<span className="text-blue-500 font-medium">{query}</span>&quot;</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div
                    className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ${isMobileSearchExpanded
                        ? 'flex-[0_0_0%] opacity-0'
                        : 'flex-[0_0_auto] opacity-100'
                        }`}
                >
                    {mounted && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-2 sm:gap-3 pl-1 sm:pl-2 hover:bg-zinc-100/80 p-1.5 rounded-xl transition-all duration-200 outline-none group border border-transparent">
                                    <div className="text-right hidden md:block">
                                        <p className="text-sm font-semibold text-zinc-900 leading-none">{user?.first_name || session?.user?.name?.split(' ')[0] || 'Usuario'}</p>
                                        <p className="text-[10px] text-zinc-400 mt-1 uppercase tracking-wider font-bold">Residencial Central</p>
                                    </div>
                                    <div className="relative">
                                        <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm group-hover:bg-blue-700 transition-colors">
                                            {initials}
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center shadow-sm border border-zinc-200">
                                            <ChevronDown className="w-2.5 h-2.5 text-zinc-500 group-data-[state=open]:rotate-180 transition-transform duration-200" />
                                        </div>
                                    </div>
                                </button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent className="w-56" align="end" sideOffset={8}>
                                <DropdownMenuLabel>
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none text-zinc-900">{userName}</p>
                                        <p className="text-xs leading-none text-zinc-500">{userEmail}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="cursor-pointer" onSelect={() => pushOptimistic('/perfil')}>
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Mi Perfil</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer" onSelect={() => pushOptimistic('/configuracion')}>
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Configuración</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 data-[disabled]:opacity-60"
                                    disabled={isLoggingOut}
                                    onSelect={handleLogout}
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>{isLoggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>
        </header>
    );
}
