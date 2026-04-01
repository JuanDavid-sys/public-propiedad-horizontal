import React from 'react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
    status: string;
}

const getStatusStyles = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('propietario')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (s.includes('arrendado')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (s.includes('desocupado')) return 'bg-zinc-100 text-zinc-600 border-zinc-200';
    return 'bg-zinc-100 text-zinc-600 border-zinc-200';
};

export function StatusBadge({ status }: StatusBadgeProps) {
    return (
        <span className={cn(
            "px-2.5 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap",
            getStatusStyles(status)
        )}>
            {status}
        </span>
    );
} 
