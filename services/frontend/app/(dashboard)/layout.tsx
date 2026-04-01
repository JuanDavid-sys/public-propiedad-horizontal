"use client";

import React, { useState, createContext, useContext } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { cn } from '@/lib/utils';
import { DashboardHeader } from './_components/DashboardHeader';
import {
    DashboardContentSkeleton,
    UnitDetailSkeleton,
    EditUnitSkeleton,
    SearchResultsSkeleton,
    CenteredDetailSkeleton,
    TableDirectorySkeleton,
    PersonDetailSkeleton,
    PersonEditSkeleton,
    VehicleEditSkeleton,
    PetEditSkeleton
} from '@/components/skeletons/PageSkeletons';

import { useOptimisticNavigation } from '../_contexts/OptimisticNavigationContext';
import { NavigationProgress } from '../_components/NavigationProgress';

interface DashboardContextType {
    isExpanded: boolean;
    setIsExpanded: (val: boolean) => void;
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (val: boolean) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function useDashboard() {
    const context = useContext(DashboardContext);
    if (!context) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
}

// Este componente interno puede usar el hook useOptimisticNavigation
function DashboardContent({ children }: { children: React.ReactNode }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { isNavigating, currentPath } = useOptimisticNavigation();

    // Determinar qué skeleton mostrar según la ruta a la que vamos
    const getSkeleton = () => {
        const pathWithoutQuery = currentPath.split('?')[0];
        const personEditPattern = /^\/personas\/[^\/?#]+\/edit$/;
        const personDetailPattern = /^\/personas\/[^\/?#]+$/;
        const personDetailFromUnitPattern = /^\/apartamentos\/[^\/?#]+\/[^\/?#]+$/;
        const vehicleEditPattern = /^\/apartamentos\/[^\/?#]+\/vehiculos\/[^\/?#]+\/edit$/;
        const petEditPattern = /^\/apartamentos\/[^\/?#]+\/mascotas\/[^\/?#]+\/edit$/;

        if (personEditPattern.test(pathWithoutQuery)) return <PersonEditSkeleton />;
        if (vehicleEditPattern.test(pathWithoutQuery)) return <VehicleEditSkeleton />;
        if (petEditPattern.test(pathWithoutQuery)) return <PetEditSkeleton />;
        if (pathWithoutQuery.includes('/edit')) return <EditUnitSkeleton />;
        if (pathWithoutQuery.includes('/mascotas/') || pathWithoutQuery.includes('/vehiculos/')) {
            return <CenteredDetailSkeleton />;
        }
        if (pathWithoutQuery.includes('/search-results')) return <SearchResultsSkeleton />;
        if (personDetailPattern.test(pathWithoutQuery) || personDetailFromUnitPattern.test(pathWithoutQuery)) {
            return <PersonDetailSkeleton />;
        }

        // Patrón para detalle de unidad: /apartamentos/XXX
        const unitDetailPattern = /^\/apartamentos\/[^\/?#]+$/;
        if (unitDetailPattern.test(pathWithoutQuery)) return <UnitDetailSkeleton />;

        // Directorios sin KPIs de dashboard
        if (
            pathWithoutQuery.includes('/personas') ||
            pathWithoutQuery.includes('/mascotas') ||
            pathWithoutQuery.includes('/vehiculos') ||
            pathWithoutQuery.includes('/parqueaderos') ||
            pathWithoutQuery.includes('/configuracion') ||
            pathWithoutQuery.includes('/perfil')
        ) {
            return <TableDirectorySkeleton />;
        }

        return <DashboardContentSkeleton />;
    };

    return (
        <DashboardContext.Provider value={{ isExpanded, setIsExpanded, isMobileMenuOpen, setIsMobileMenuOpen }}>
            <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
                <Sidebar
                    isExpanded={isExpanded}
                    setIsExpanded={setIsExpanded}
                    isMobileOpen={isMobileMenuOpen}
                    onClose={() => setIsMobileMenuOpen(false)}
                />

                <main
                    className={cn(
                        "flex-1 min-w-0 flex flex-col transition-[margin] duration-250 cubic-bezier(0.4, 0, 0.2, 1) will-change-[margin] overflow-x-hidden",
                        isExpanded ? "lg:ml-64 ml-0" : "lg:ml-20 ml-0"
                    )}
                >
                    <DashboardHeader />
                    <NavigationProgress />

                    <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
                        {/* 
                          Aquí está la magia: si isNavigating es true (click en sidebar o links optimistas), 
                          mostramos el skeleton instantáneamente en lugar de los children viejos.
                          Eliminamos el 'key' para evitar el re-montaje completo y el 'pestañeo' visual
                          cuando la navegación se completa y el contenido real toma el lugar del skeleton.
                        */}
                        <div className="animate-in fade-in duration-300">
                            {isNavigating ? getSkeleton() : children}
                        </div>
                    </div>
                </main>
            </div>
        </DashboardContext.Provider>
    );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <DashboardContent>
            {children}
        </DashboardContent>
    );
}
