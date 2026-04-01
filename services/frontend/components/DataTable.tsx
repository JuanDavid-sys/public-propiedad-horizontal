"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';

export interface ColumnDef<T> {
    header: string;
    accessorKey?: keyof T;
    id?: string;
    render?: (row: T) => React.ReactNode;
    className?: string;
    sticky?: boolean;
    align?: 'left' | 'center' | 'right';
    headerAlign?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
    data: T[];
    columns: ColumnDef<T>[];
    onRowClick?: (row: T) => void;
    isLoading?: boolean;
    maxHeight?: string;
    minWidth?: string;
    loadingMessage?: string;
    emptyMessage?: string;
}

export function DataTable<T extends { id: string | number }>({
    data,
    columns,
    onRowClick,
    isLoading,
    maxHeight = "500px",
    minWidth = "760px",
    loadingMessage = "Cargando datos...",
    emptyMessage = "No se encontraron datos."
}: DataTableProps<T>) {
    const skeletonWidths = ['w-16', 'w-20', 'w-24', 'w-28', 'w-32'];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200/50 overflow-hidden">
            <div
                className="overflow-x-auto overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-200"
                style={{ maxHeight }}
            >
                <table
                    className="w-full text-left border-collapse"
                    style={{ minWidth, tableLayout: 'fixed' }}
                >
                    <thead className="sticky top-0 z-20">
                        <tr className="bg-zinc-50/50 border-b border-zinc-200/80">
                            {columns.map((col, idx) => (
                                <th
                                    key={col.id || col.header || idx}
                                    className={cn(
                                        "px-[0px] py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest whitespace-nowrap",
                                        col.sticky && "sticky left-0 z-10 bg-zinc-50/50",
                                        (!col.headerAlign ? (!col.align || col.align === 'center') : col.headerAlign === 'center') && "text-center",
                                        (col.headerAlign ? col.headerAlign === 'left' : col.align === 'left') && "text-left",
                                        (col.headerAlign ? col.headerAlign === 'right' : col.align === 'right') && "text-right",
                                        col.className
                                    )}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <>
                                {Array.from({ length: 6 }).map((_, rowIndex) => (
                                    <tr key={`loading-row-${rowIndex}`} className="border-b border-zinc-100">
                                        {columns.map((col, colIdx) => (
                                            <td
                                                key={`loading-cell-${rowIndex}-${col.id || col.header || colIdx}`}
                                                className={cn(
                                                    "px-0 py-4 whitespace-nowrap",
                                                    col.sticky && "sticky left-0 z-10 bg-white border-r border-zinc-100/50",
                                                    (!col.align || col.align === 'center') && "text-center",
                                                    col.align === 'left' && "text-left",
                                                    col.align === 'right' && "text-right",
                                                    col.className
                                                )}
                                            >
                                                <div className={cn(
                                                    "flex items-center",
                                                    (!col.align || col.align === 'center') && "justify-center",
                                                    col.align === 'left' && "justify-start",
                                                    col.align === 'right' && "justify-end"
                                                )}>
                                                    <Skeleton className={cn("h-4", skeletonWidths[(rowIndex + colIdx) % skeletonWidths.length])} />
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                                <tr key="loading-message-row">
                                    <td colSpan={columns.length} className="py-4 text-center text-xs text-zinc-400 font-medium">
                                        {loadingMessage}
                                    </td>
                                </tr>
                            </>
                        ) : data.length === 0 ? (
                            <tr key="empty-row">
                                <td colSpan={columns.length} className="py-10 text-center text-zinc-400">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : data.map((row) => (
                            <tr
                                key={row.id}
                                onClick={() => onRowClick?.(row)}
                                className={cn(
                                    "border-b border-zinc-100 transition-all group",
                                    onRowClick && "cursor-pointer hover:bg-blue-200/50"
                                )}
                            >
                                {columns.map((col, colIdx) => (
                                    <td
                                        key={col.id || col.header || colIdx}
                                        className={cn(
                                            "px-0 py-4 whitespace-nowrap transition-colors",
                                            col.sticky && "sticky left-0 z-10 bg-white group-hover:bg-blue-50/50 border-r border-zinc-100/50",
                                            (!col.align || col.align === 'center') && "text-center",
                                            col.align === 'left' && "text-left",
                                            col.align === 'right' && "text-right",
                                            col.className
                                        )}
                                    >
                                        <div className={cn(
                                            "flex items-center",
                                            (!col.align || col.align === 'center') && "justify-center",
                                            col.align === 'left' && "justify-start",
                                            col.align === 'right' && "justify-end"
                                        )}>
                                            {col.render
                                                ? col.render(row)
                                                : col.accessorKey
                                                    ? (row[col.accessorKey] as React.ReactNode)
                                                    : null
                                            }
                                        </div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
