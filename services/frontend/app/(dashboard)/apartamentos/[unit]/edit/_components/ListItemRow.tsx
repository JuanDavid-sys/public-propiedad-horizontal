'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ListItemRowProps {
    leading?: React.ReactNode;
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    onEdit?: () => void;
    editIcon?: React.ReactNode;
    onRemove?: () => void;
    removeIcon?: React.ReactNode;
    className?: string;
    contentClassName?: string;
    titleClassName?: string;
    subtitleClassName?: string;
    editButtonClassName?: string;
    editButtonLabel?: string;
    removeButtonClassName?: string;
    removeButtonLabel?: string;
}

export function ListItemRow({
    leading,
    title,
    subtitle,
    onEdit,
    editIcon,
    onRemove,
    removeIcon,
    className,
    contentClassName,
    titleClassName,
    subtitleClassName,
    editButtonClassName,
    editButtonLabel,
    removeButtonClassName,
    removeButtonLabel
}: ListItemRowProps) {
    return (
        <div className={cn('flex items-center justify-between p-3 rounded-2xl border', className)}>
            <div className={cn('flex items-center gap-3', contentClassName)}>
                {leading ? leading : null}
                <div className="flex flex-col">
                    <span className={cn('text-sm font-bold text-zinc-700', titleClassName)}>
                        {title}
                    </span>
                    {subtitle ? (
                        <span className={cn('text-[10px] text-zinc-400 font-medium', subtitleClassName)}>
                            {subtitle}
                        </span>
                    ) : null}
                </div>
            </div>
            {onEdit || onRemove ? (
                <div className="flex items-center gap-1">
                    {onEdit ? (
                        <button
                            onClick={onEdit}
                            className={cn('p-2 text-zinc-300 hover:text-blue-600 transition-colors', editButtonClassName)}
                            aria-label={editButtonLabel}
                        >
                            {editIcon}
                        </button>
                    ) : null}
                    {onRemove ? (
                        <button
                            onClick={onRemove}
                            className={cn('p-2 text-zinc-300 hover:text-rose-600 transition-colors', removeButtonClassName)}
                            aria-label={removeButtonLabel}
                        >
                            {removeIcon}
                        </button>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}
