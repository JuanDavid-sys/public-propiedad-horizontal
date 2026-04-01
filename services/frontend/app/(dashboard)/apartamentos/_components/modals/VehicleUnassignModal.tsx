'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { AlertTriangle } from 'lucide-react';

interface VehicleUnassignModalProps {
    isOpen: boolean;
    plate: string;
    onClose: () => void;
    onUnassign: () => void;
    onDelete?: () => void;
    isLoading?: boolean;
    description?: string;
    deleteLabel?: string;
    note?: string;
    showUnassign?: boolean;
    showDelete?: boolean;
}

export const VehicleUnassignModal: React.FC<VehicleUnassignModalProps> = ({
    isOpen,
    plate,
    onClose,
    onUnassign,
    onDelete,
    isLoading = false,
    description,
    deleteLabel,
    note,
    showUnassign = true,
    showDelete = true,
}) => {
    const resolvedDescription = description
        ?? (showDelete
            ? "Puedes desasignar el vehículo de la unidad o eliminar el registro."
            : "Puedes desasignar el vehículo de la unidad.");
    const resolvedDeleteLabel = deleteLabel ?? (showUnassign ? 'Desasignar y eliminar' : 'Eliminar');
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="¿Qué deseas hacer?"
            description={resolvedDescription}
            size="sm"
            overlay="none"
            footer={
                <>
                    <Button variant="outline" onClick={onClose} className="rounded-2xl h-10 px-4">
                        Cancelar
                    </Button>
                    {showUnassign ? (
                        <Button
                            variant="outline"
                            onClick={onUnassign}
                            disabled={isLoading}
                            className="rounded-2xl h-10 px-4 border-zinc-200 text-zinc-700"
                        >
                            Desasignar
                        </Button>
                    ) : null}
                    {showDelete ? (
                        <Button
                            onClick={onDelete}
                            disabled={isLoading}
                            className="rounded-2xl h-10 px-4 bg-rose-600 hover:bg-rose-700 text-white"
                        >
                            {resolvedDeleteLabel}
                        </Button>
                    ) : null}
                </>
            }
        >
            <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/60 p-4 text-sm text-amber-700">
                <AlertTriangle size={18} className="mt-0.5" />
                <div>
                    <p className="font-bold text-amber-800">Vehículo: {plate}</p>
                    {showDelete ? (
                        <p>Eliminar borra el registro de forma permanente.</p>
                    ) : null}
                    {note ? (
                        <p className="mt-2 text-[11px] uppercase tracking-wide text-amber-600">{note}</p>
                    ) : null}
                </div>
            </div>
        </Modal>
    );
};
