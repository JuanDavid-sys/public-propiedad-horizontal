'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Smartphone } from 'lucide-react';

interface TagFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (tag: string) => void;
    initialData?: string;
}

export const TagFormModal: React.FC<TagFormModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialData
}) => {
    const [tagValue, setTagValue] = useState('');

    React.useEffect(() => {
        if (!isOpen) return;
        setTagValue(initialData || '');
    }, [initialData, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (tagValue.trim()) {
            onSave(tagValue.trim());
            setTagValue('');
            onClose();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? "Editar Tag de Acceso" : "Añadir Tag de Acceso"}
            description="Ingrese el identificador del tag para control de acceso."
            size="sm"
            footer={
                <>
                    <Button variant="outline" onClick={onClose} className="rounded-2xl h-12 px-6">
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={!tagValue.trim()} className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl h-12 px-8 font-bold">
                        {initialData ? 'Guardar' : 'Añadir Tag'}
                    </Button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-600 shadow-inner">
                        <Smartphone size={40} />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">N. de Tag</Label>
                    <Input
                        name="tag"
                        value={tagValue}
                        onChange={(e) => setTagValue(e.target.value)}
                        placeholder="Ej: TG-00123"
                        required
                        className="rounded-2xl h-12 bg-zinc-50 border-zinc-100 focus:bg-white font-black tracking-widest text-center text-lg"
                    />
                </div>
            </form>
        </Modal>
    );
};
