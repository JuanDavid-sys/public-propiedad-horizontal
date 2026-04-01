"use client";

import Link, { LinkProps } from "next/link";
import { ReactNode, useTransition } from "react";
import { useOptimisticNavigation } from "@/app/_contexts/OptimisticNavigationContext";
import { useRouter } from "next/navigation";

interface OptimisticLinkProps extends LinkProps {
    children: ReactNode;
    className?: string;
    onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
    title?: string;
}

/**
 * Un componente Link Premium que activa la navegación optimista
 * (barra de progreso + skeleton) instantáneamente al hacer clic.
 */
export function OptimisticLink({
    children,
    href,
    className,
    onClick,
    ...props
}: OptimisticLinkProps) {
    const { setOptimisticPath } = useOptimisticNavigation();
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        // Ejecutar el onClick original si existe
        if (onClick) onClick(e);

        // Si ya se previno el comportamiento por defecto, no hacemos nada
        if (e.defaultPrevented) return;

        // Solo manejamos enlaces internos (strings)
        if (typeof href === "string" && href.startsWith("/")) {
            // Evitar duplicar la navegación si ya estamos en transición
            if (isPending) return;

            // ACTIVAR LA NAVEGACIÓN OPTIMISTA
            // Esto hace que la barra azul y el skeleton aparezcan AL MILISEGUNDO
            startTransition(() => {
                setOptimisticPath(href);
            });
        }
    };

    return (
        <Link href={href} className={className} onClick={handleClick} {...props}>
            {children}
        </Link>
    );
}
