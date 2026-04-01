'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
    message: string;
    className?: string;
    textClassName?: string;
}

export function EmptyState({ message, className, textClassName }: EmptyStateProps) {
    return (
        <div className={cn('p-8 border-2 border-dashed border-zinc-100 rounded-3xl text-center', className)}>
            <p className={cn('text-xs text-zinc-400 font-medium italic', textClassName)}>{message}</p>
        </div>
    );
}
