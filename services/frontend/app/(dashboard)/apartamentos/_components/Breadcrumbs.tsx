import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
    label: string;
    onClick?: () => void;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
    return (
        <div className={cn("flex items-center gap-2 flex-wrap", className)}>
            {items.map((item, index) => (
                <React.Fragment key={index}>
                    <ChevronLeft size={14} className="text-zinc-300" />
                    <button
                        onClick={item.onClick}
                        disabled={!item.onClick}
                        className={cn(
                            "text-[10px] font-black uppercase tracking-[0.2em] transition-colors",
                            item.onClick
                                ? "text-zinc-400 hover:text-zinc-600 cursor-pointer"
                                : "text-zinc-600 cursor-default"
                        )}
                    >
                        {item.label}
                    </button>
                </React.Fragment>
            ))}
        </div>
    );
}
