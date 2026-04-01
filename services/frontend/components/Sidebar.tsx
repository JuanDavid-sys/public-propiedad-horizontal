"use client";

import React, { useEffect } from "react";
import { useOptimisticNavigation } from "@/app/_contexts/OptimisticNavigationContext";
import { OptimisticLink } from "./ui/OptimisticLink";
import {
    LayoutDashboard,
    ChevronLeft,
    Menu,
    X,
    Users,
    PawPrint,
    SquareParking,
    Car
} from "lucide-react";

const menuItems = [
    { label: "Apartamentos", href: "/apartamentos", icon: LayoutDashboard },
    { label: "Personas", href: "/personas", icon: Users },
    { label: "Mascotas", href: "/mascotas", icon: PawPrint },
    { label: "Parqueaderos", href: "/parqueaderos", icon: SquareParking },
    { label: "Vehículos", href: "/vehiculos", icon: Car },
];

interface SidebarProps {
    isExpanded: boolean;
    setIsExpanded: (value: boolean) => void;
    isMobileOpen?: boolean;
    onClose?: () => void;
}

export function Sidebar({ isExpanded, setIsExpanded, isMobileOpen, onClose }: SidebarProps) {
    const { currentPath, isNavigating } = useOptimisticNavigation();

    // En móvil siempre forzamos el estado expandido para legibilidad
    const showFullSidebar = isMobileOpen || isExpanded;

    useEffect(() => {
        if (!isMobileOpen) return;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [isMobileOpen]);

    return (
        <>
            {isMobileOpen && (
                <button
                    type="button"
                    aria-label="Cerrar menú lateral"
                    onClick={onClose}
                    className="fixed inset-0 z-40 bg-zinc-900/50 backdrop-blur-[1px] lg:hidden"
                />
            )}

            <aside
                className={`group fixed left-0 top-0 h-screen transition-[width,transform] duration-250 cubic-bezier(0.4, 0, 0.2, 1) z-50 border-r border-zinc-200 bg-slate-50/90 backdrop-blur-xl flex flex-col will-change-[width,transform] w-72 ${isExpanded ? "lg:w-64" : "lg:w-20"
                    } ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
            >
                <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-200/60 lg:hidden">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="Ventura Logo" className="w-8 h-8 object-contain" />
                        <span className="text-sm font-black text-blue-600 tracking-tight">Ventura</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-lg border border-zinc-200 bg-white text-zinc-500 hover:text-blue-600 hover:border-blue-200 transition-colors flex items-center justify-center"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 px-4 space-y-2 overflow-y-auto hide-scrollbar pb-4 mt-4">
                    {menuItems.map((item, idx) => {
                        const isActive = currentPath === item.href;
                        const Icon = item.icon;
                        return (
                            <OptimisticLink
                                key={idx}
                                href={item.href}
                                prefetch={true}
                                className={`flex items-center h-12 rounded-xl transition-all duration-200 relative group/item overflow-hidden active:scale-[0.98] ${isActive
                                    ? "bg-white text-blue-600 shadow-sm border border-zinc-200/50"
                                    : "text-zinc-500 hover:bg-white hover:text-blue-600 hover:shadow-sm"
                                    } ${isNavigating && isActive ? "opacity-90 animate-pulse" : ""}`}
                                title={!showFullSidebar ? item.label : ""}
                            >
                                <div className="min-w-[48px] h-full flex items-center justify-center">
                                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                </div>
                                <span className={`whitespace-nowrap font-medium text-sm transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1) ${showFullSidebar ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10 pointer-events-none"
                                    }`}>
                                    {item.label}
                                </span>

                                {isActive && (
                                    <div className="absolute left-0 w-1 h-6 bg-gradient-to-b from-blue-600 to-cyan-500 rounded-r-full shadow-[0_0_8px_rgba(37,99,235,0.3)] animate-in slide-in-from-left-2 duration-300"></div>
                                )}
                            </OptimisticLink>
                        );
                    })}
                </nav>

                {/* TOGGLE BUTTON (Bottom) */}
                <div className="p-4 border-t border-zinc-200/60 flex-shrink-0">
                    <button
                        onClick={() => {
                            if (window.innerWidth < 1024 && onClose) {
                                onClose();
                            } else {
                                setIsExpanded(!isExpanded);
                            }
                        }}
                        className="w-full h-12 rounded-xl bg-white/50 border border-zinc-200/50 hover:bg-white hover:shadow-sm transition-all flex items-center justify-center gap-3 overflow-hidden group/btn"
                    >
                        <div className={`transition-transform duration-500 text-zinc-400 group-hover/btn:text-blue-600`}>
                            <div className="lg:hidden">
                                <X size={20} />
                            </div>
                            <div className="hidden lg:block">
                                {isExpanded ? <ChevronLeft size={20} /> : <Menu size={20} />}
                            </div>
                        </div>
                        <span className={`whitespace-nowrap text-[10px] uppercase tracking-widest font-bold transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1) text-zinc-400 group-hover/btn:text-blue-600 ${showFullSidebar ? "opacity-100 translate-x-0" : "opacity-0 lg:block hidden -translate-x-10 pointer-events-none w-0"
                            }`}>
                            <span className="lg:hidden">Cerrar Menú</span>
                            <span className="hidden lg:inline">Compactar</span>
                        </span>
                    </button>
                </div>
            </aside>
        </>
    );
}
