import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface StatCardProps {
    label: string;
    value: string;
    icon: LucideIcon;
    trend: string;
    color: string;
    bg: string;
    isAlert?: boolean;
    className?: string;
}

export function StatCard({
    label,
    value,
    icon: Icon,
    trend,
    color,
    bg,
    isAlert,
    className
}: StatCardProps) {
    const isPositive = trend.startsWith('+');
    const isNegative = trend.startsWith('-');
    const trendClasses = isAlert
        ? "text-red-600 bg-red-50"
        : isPositive
            ? "text-emerald-600 bg-emerald-50"
            : isNegative
                ? "text-amber-600 bg-amber-50"
                : cn(color, bg);

    return (
        <Card className={cn(
            "relative overflow-hidden border border-transparent bg-white shadow-[0_2px_10px_rgba(0,0,0,0.06)] group hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300",
            className
        )}>
            <CardContent className="relative p-5">
                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500 pointer-events-none">
                    <Icon className={cn("w-28 h-28", color)} />
                </div>
                <div className="flex items-start justify-between gap-4">
                    <p className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em] leading-none">
                        {label}
                    </p>
                    <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center shadow-sm", bg)}>
                        <Icon className={cn("w-5 h-5", color)} />
                    </div>
                </div>
                <div className="mt-6 flex items-baseline gap-2">
                    <h3 className="text-3xl sm:text-4xl font-black text-zinc-900 leading-none">
                        {value}
                    </h3>
                    <span className={cn(
                        "text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full flex items-center gap-1",
                        trendClasses
                    )}>
                        {trend.startsWith('+') && <ArrowUpRight className="w-3 h-3" />}
                        {trend.startsWith('-') && <ArrowDownRight className="w-3 h-3" />}
                        {trend.replace(/[+-]/, '')}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
} 
