import React from 'react';
import { Download, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PageHeaderProps {
    title: string;
    description: string;
    showActions?: boolean;
}

export function PageHeader({ title, description, showActions = true }: PageHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">{title}</h1>
                <p className="text-zinc-500 text-sm mt-1">{description}</p>
            </div>
            {showActions && (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button variant="outline" className="bg-white border-zinc-200 gap-2 text-zinc-600 rounded-2xl h-10 flex-1 sm:flex-none">
                        <Download className="w-4 h-4" /> Exportar
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 rounded-2xl h-10 px-4 flex-1 sm:flex-none">
                        <Plus className="w-4 h-4 mr-2" /> Nueva Unidad
                    </Button>
                </div>
            )}
        </div>
    );
}
