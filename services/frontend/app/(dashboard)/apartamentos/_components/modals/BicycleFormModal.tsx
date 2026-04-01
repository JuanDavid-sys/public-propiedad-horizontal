'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Bike, ShieldCheck, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BicycleFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    initialData?: any;
}

export const BicycleFormModal: React.FC<BicycleFormModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialData
}) => {
    const emptyForm = {
        plate: '',
        brand: '',
        model: '',
        color: '',
        type: 'Bicicleta',
        status: 'Activo',
        observations: ''
    };

    const [formData, setFormData] = useState(initialData || emptyForm);

    React.useEffect(() => {
        if (!isOpen) return;
        if (initialData) {
            setFormData({ ...emptyForm, ...initialData });
            return;
        }
        setFormData({ ...emptyForm });
    }, [initialData, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({
            ...prev,
            [name]: name === 'plate' ? value.toUpperCase() : value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? "Editar Bicicleta / Item" : "Registrar Nueva Bicicleta"}
            description="Complete los datos identificativos de la bicicleta o item de movilidad."
            size="md"
            footer={
                <>
                    <Button variant="outline" onClick={onClose} className="rounded-2xl h-12 px-6">
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-12 px-8 font-bold shadow-lg shadow-emerald-100">
                        {initialData ? 'Guardar' : 'Vincular Bicicleta'}
                    </Button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
                        <Bike size={40} />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Serial o Identificador Único</Label>
                    <Input
                        name="plate"
                        value={formData.plate}
                        onChange={handleChange}
                        placeholder="Ej: BIKE-XXXX"
                        required
                        className="rounded-2xl h-12 bg-zinc-50 border-zinc-100 focus:bg-white font-black tracking-widest text-center text-lg"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Marca</Label>
                        <Input
                            name="brand"
                            value={formData.brand}
                            onChange={handleChange}
                            placeholder="Ej: GW, Specialized"
                            className="rounded-2xl h-11 bg-zinc-50 border-zinc-100 focus:bg-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Color Dominante</Label>
                        <Input
                            name="color"
                            value={formData.color}
                            onChange={handleChange}
                            placeholder="Ej: Negro Mate"
                            className="rounded-2xl h-11 bg-zinc-50 border-zinc-100 focus:bg-white"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Estado</Label>
                        <Select name="status" value={formData.status} onChange={handleChange}>
                            <option value="Activo">Activo (En Conjunto)</option>
                            <option value="Temporal">Uso Temporal</option>
                            <option value="Inactivo">Inactivo / Retirado</option>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Modelo / Año</Label>
                        <Input
                            name="model"
                            value={formData.model}
                            onChange={handleChange}
                            placeholder="Ej: 2024"
                            className="rounded-2xl h-11 bg-zinc-50 border-zinc-100 focus:bg-white"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Notas Adicionales</Label>
                    <Textarea
                        name="observations"
                        value={formData.observations}
                        onChange={handleChange}
                        placeholder="Descripción de accesorios, candados, o ubicación específica..."
                        className="rounded-2xl min-h-[100px] bg-zinc-50 border-zinc-100 focus:bg-white"
                    />
                </div>
            </form>
        </Modal>
    );
};
