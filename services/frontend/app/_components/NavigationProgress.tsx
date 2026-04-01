"use client";

import { useOptimisticNavigation } from "../_contexts/OptimisticNavigationContext";
import { useEffect, useState } from "react";

export function NavigationProgress() {
    const { isNavigating } = useOptimisticNavigation();
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (isNavigating) {
            // Pequeño delay para evitar flashes en navegaciones instantáneas
            const timer = setTimeout(() => setShow(true), 100);
            return () => clearTimeout(timer);
        } else {
            setShow(false);
        }
    }, [isNavigating]);

    if (!show) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 animate-pulse shadow-[0_1px_10px_rgba(59,130,246,0.5)]" />
    );
}
