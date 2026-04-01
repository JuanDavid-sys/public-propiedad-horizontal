import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TablePaginationProps {
    filteredCount: number;
    totalItems?: number; // Total absoluto antes de filtros locales si aplica (ej. total de todas las torres)
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    pageSize?: number;
    hidePagination?: boolean; // Para mostrar solo el contador
}

export function TablePagination({
    filteredCount,
    totalItems,
    currentPage,
    totalPages,
    onPageChange,
    pageSize = 50,
    hidePagination = false
}: TablePaginationProps) {
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, filteredCount);
    const countOnPage = end - start + 1;
    const absoluteTotal = totalItems ?? filteredCount;

    // Si no hay paginación, mostrar el total filtrado vs el total absoluto opcional
    const counterText = (totalPages <= 1 || hidePagination) ? (
        absoluteTotal !== filteredCount ? (
            <>
                Mostrando <span className="font-bold text-zinc-900">{filteredCount}</span> de <span className="font-bold text-zinc-900">{absoluteTotal}</span> resultados
            </>
        ) : (
            <>
                Mostrando <span className="font-bold text-zinc-900">{filteredCount}</span> resultados
            </>
        )
    ) : (
        <>
            Mostrando <span className="font-bold text-zinc-900">{countOnPage}</span> de <span className="font-bold text-zinc-900">{filteredCount}</span> resultados
        </>
    );

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className="px-3 sm:px-6 py-3 sm:py-4 bg-zinc-50 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <p className="text-[11px] sm:text-xs text-zinc-400 text-center sm:text-left">
                {counterText}
            </p>

            {totalPages > 1 && !hidePagination && (
                <div className="flex items-center gap-1 flex-wrap justify-center">
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 text-zinc-400 hover:text-zinc-900 disabled:opacity-30 transition-colors"
                    >
                        <ChevronRight className="w-4 h-4 rotate-180" />
                    </button>

                    {pages.map((page, idx) => {
                        const isEllipsis = idx > 0 && page - pages[idx - 1] > 1;
                        return (
                            <React.Fragment key={page}>
                                {isEllipsis && <span className="px-2 text-zinc-300">...</span>}
                                <button
                                    onClick={() => onPageChange(page)}
                                    className={cn(
                                        "w-8 h-8 rounded-lg text-xs font-bold transition-all border",
                                        currentPage === page
                                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                            : "hover:bg-white text-zinc-600 border-transparent hover:border-zinc-200"
                                    )}
                                >
                                    {page}
                                </button>
                            </React.Fragment>
                        );
                    })}

                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 text-zinc-400 hover:text-zinc-900 disabled:opacity-30 transition-colors"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
} 
