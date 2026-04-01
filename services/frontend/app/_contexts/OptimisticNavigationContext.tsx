"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, ReactNode, useContext, useOptimistic, useTransition } from "react";

type OptimisticNavigationContextType = {
    isNavigating: boolean;
    currentPath: string;
    setOptimisticPath: (path: string) => void;
    pushOptimistic: (path: string) => void;
};

const OptimisticNavigationContext = createContext<OptimisticNavigationContextType | undefined>(undefined);

export function OptimisticNavigationProvider({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // El hook useOptimistic nos permite cambiar el estado visual antes de que termine la navegación
    const [optimisticPath, setOptimisticPath] = useOptimistic(
        pathname,
        (_, newPath: string) => newPath
    );

    const pushOptimistic = (path: string) => {
        startTransition(() => {
            setOptimisticPath(path);
            router.push(path);
        });
    };

    return (
        <OptimisticNavigationContext.Provider
            value={{
                isNavigating: pathname !== optimisticPath || isPending,
                currentPath: optimisticPath,
                setOptimisticPath,
                pushOptimistic,
            }}
        >
            {children}
        </OptimisticNavigationContext.Provider>
    );
}

export function useOptimisticNavigation() {
    const context = useContext(OptimisticNavigationContext);
    if (!context) {
        throw new Error(
            "useOptimisticNavigation must be used within OptimisticNavigationProvider"
        );
    }
    return context;
}
