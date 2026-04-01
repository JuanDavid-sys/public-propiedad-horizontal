'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ListSectionCardProps {
    title: string;
    subtitle?: string;
    icon: React.ReactNode;
    actions?: React.ReactNode;
    className?: string;
    headerClassName?: string;
    iconWrapperClassName?: string;
    titleClassName?: string;
    subtitleClassName?: string;
    children: React.ReactNode;
}

export function ListSectionCard({
    title,
    subtitle,
    icon,
    actions,
    className,
    headerClassName,
    iconWrapperClassName,
    titleClassName,
    subtitleClassName,
    children
}: ListSectionCardProps) {
    return (
        <div className={cn(
            'bg-white p-8 rounded-[2.5rem] border border-zinc-200/60 shadow-sm',
            className
        )}>
            <div className={cn('flex items-center justify-between', headerClassName)}>
                <div className="flex items-center gap-3">
                    <div className={cn(
                        'w-10 h-10 rounded-2xl flex items-center justify-center',
                        iconWrapperClassName
                    )}>
                        {icon}
                    </div>
                    <div className="flex flex-col">
                        <h3 className={cn(
                            'font-black text-zinc-900 uppercase text-xs tracking-widest',
                            titleClassName
                        )}>
                            {title}
                        </h3>
                        {subtitle ? (
                            <p className={cn(
                                'text-[9px] text-zinc-400 font-bold mt-1 uppercase',
                                subtitleClassName
                            )}>
                                {subtitle}
                            </p>
                        ) : null}
                    </div>
                </div>
                {actions ? (
                    <div className="flex items-center gap-1.5">
                        {actions}
                    </div>
                ) : null}
            </div>
            {children}
        </div>
    );
}
