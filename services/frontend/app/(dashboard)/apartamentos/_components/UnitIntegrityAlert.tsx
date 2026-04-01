import React from 'react';
import { AlertTriangle, ChevronRight, ExternalLink, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface IntegrityAlertProps {
    conflictType: 'parking' | 'identity' | 'payment';
    message: string;
    onResolve?: () => void;
    onViewRaw?: () => void;
    onDismiss?: () => void;
}

export function UnitIntegrityAlert({
    conflictType,
    message,
    onResolve,
    onViewRaw,
    onDismiss
}: IntegrityAlertProps) {
    return (
        <div className="bg-[#FFFBEB] border border-[#FEF3C7] rounded-3xl p-5 flex flex-col md:flex-row items-start md:items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="p-3 bg-white rounded-2xl shadow-sm border border-[#FEF3C7]">
                <AlertTriangle className="w-6 h-6 text-[#D97706]" />
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#92400E] uppercase tracking-wider">Alerta de Integridad de Datos</h3>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-pulse" />
                </div>
                <p className="text-sm text-[#B45309] mt-0.5 leading-relaxed font-medium">
                    {message}
                </p>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto mt-4 md:mt-0">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onViewRaw}
                    className="flex-1 md:flex-none bg-white border-[#FEF3C7] text-[#92400E] hover:bg-[#FEF3C7]/50 gap-2 h-10 rounded-xl"
                >
                    Ver Datos Base <ExternalLink size={14} />
                </Button>
                <Button
                    size="sm"
                    onClick={onResolve}
                    className="flex-1 md:flex-none bg-[#D97706] hover:bg-[#B45309] text-white shadow-lg shadow-amber-200/50 h-10 rounded-xl"
                >
                    Resolver Conflicto
                </Button>
                <button
                    onClick={onDismiss}
                    className="p-2 text-[#D97706]/60 hover:text-[#D97706] transition-colors"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
} 
