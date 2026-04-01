import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Specialized Components for Premium Design ---

export function SectionHeader({
    title,
    icon: Icon,
    className
}: {
    title: string;
    icon?: LucideIcon;
    className?: string
}) {
    return (
        <div className={cn("flex items-center gap-3 mb-8", className)}>
            {Icon && (
                <div className="p-2 bg-zinc-50 rounded-xl border border-zinc-100 shadow-sm text-zinc-400">
                    <Icon size={14} />
                </div>
            )}
            <h3 className="text-zinc-500 font-bold text-[10px] uppercase tracking-[0.2em]">
                {title}
            </h3>
        </div>
    );
}

interface DetailSectionProps {
    title: string;
    icon?: LucideIcon;
    iconColor?: string;
    iconBg?: string;
    children: React.ReactNode;
    className?: string;
    innerClassName?: string;
    topRight?: React.ReactNode;
}

/**
 * Updated DetailSection that matches the "Architectural Grid" look
 * Uses the p-0.5 outer / p-8 inner pattern from the requested design
 */
export function DetailSection({
    title,
    icon,
    _iconColor,
    _iconBg,
    children,
    className,
    innerClassName,
    topRight
}: DetailSectionProps & { _iconColor?: string; _iconBg?: string }) {
    return (
        <section className={cn(
            "bg-zinc-100/50 rounded-[1.25rem] p-0.5 overflow-hidden transition-all",
            className
        )}>
            <div className={cn(
                "bg-white rounded-[1.25rem] p-8 shadow-sm",
                innerClassName
            )}>
                <div className="flex justify-between items-start">
                    <SectionHeader title={title} icon={icon} />
                    {topRight}
                </div>
                {children}
            </div>
        </section>
    );
}

interface DetailItemProps {
    label: string;
    value: React.ReactNode;
    variant?: 'default' | 'large' | 'xlarge' | 'tiny';
    className?: string;
    valueClassName?: string;
}

export function DetailItem({
    label,
    value,
    variant = 'default',
    className,
    valueClassName
}: DetailItemProps) {
    return (
        <div className={cn("space-y-1", className)}>
            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{label}</div>
            {variant === 'xlarge' && (
                <div className={cn("text-5xl font-black text-zinc-900 tracking-tighter leading-none", valueClassName)}>{value}</div>
            )}
            {variant === 'large' && (
                <div className={cn("text-2xl font-black text-zinc-900", valueClassName)}>{value}</div>
            )}
            {variant === 'default' && (
                <div className={cn("text-sm font-bold text-zinc-700", valueClassName)}>{value}</div>
            )}
            {variant === 'tiny' && (
                <div className={cn("text-xs font-medium text-zinc-500", valueClassName)}>{value}</div>
            )}
        </div>
    );
}
