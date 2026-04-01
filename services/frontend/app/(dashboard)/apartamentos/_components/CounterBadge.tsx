import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CounterBadgeProps {
    icon: LucideIcon;
    count: number | string;
    variant?: 'zinc' | 'blue' | 'purple' | 'amber' | 'emerald';
    className?: string;
    center?: boolean;
}

const variants = {
    zinc: 'text-zinc-500 bg-zinc-100/80',
    blue: 'text-blue-600 bg-blue-50/50',
    purple: 'text-purple-600 bg-purple-50',
    amber: 'text-amber-600 bg-amber-50',
    emerald: 'text-emerald-600 bg-emerald-50'
};

export function CounterBadge({
    icon: Icon,
    count,
    variant = 'zinc',
    className,
    center = false
}: CounterBadgeProps) {
    return (
        <span className={cn(
            "flex items-center gap-1.5 text-xs font-bold rounded-lg py-1 px-2 w-fit",
            variants[variant],
            center && "mx-auto justify-center",
            className
        )}>
            <Icon size={12} /> {count}
        </span>
    );
} 
