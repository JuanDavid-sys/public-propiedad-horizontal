'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import type { ParkingData } from '@/lib/actions/base.actions';
import { Car, Bike, Motorbike } from 'lucide-react';
import { cn } from '@/lib/utils';

type VehicleFormData = {
    plate: string;
    type: string;
    brand: string;
    model: string;
    color: string;
    status: string;
    parking_space_id: string;
    observations: string;
};

interface VehicleFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: VehicleFormData) => void;
    initialData?: Partial<VehicleFormData>;
    availableParkingSpaces?: ParkingData[];
}

const EMPTY_FORM: VehicleFormData = {
    plate: '',
    type: 'Automóvil',
    brand: '',
    model: '',
    color: '',
    status: 'Activo',
    parking_space_id: '',
    observations: ''
};

export const VehicleFormModal: React.FC<VehicleFormModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialData,
    availableParkingSpaces = []
}) => {
    const privateParkingSpaces = availableParkingSpaces.filter((space) => space?.type === 'PRIVADO');
    const [attemptedSubmit, setAttemptedSubmit] = useState(false);
    const [formData, setFormData] = useState<VehicleFormData>(
        initialData ? { ...EMPTY_FORM, ...initialData } : EMPTY_FORM
    );

    React.useEffect(() => {
        if (!isOpen) {
            setAttemptedSubmit(false);
            return;
        }
        if (initialData) {
            setFormData({ ...EMPTY_FORM, ...initialData });
            return;
        }
        setFormData({ ...EMPTY_FORM });
    }, [initialData, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name === 'plate') {
            setAttemptedSubmit(false);

            // Limpia espacios y convierte a mayúsculas
            let val = value.toUpperCase().replace(/\s/g, '-');

            // Lógica de auto-guión: si llega a 3 caracteres y es nuevo, añade '-'
            const prevVal = formData.plate;
            if (val.length === 3 && val.length > prevVal.length && !val.includes('-')) {
                val = val + '-';
            }

            // Evitar múltiples guiones seguidos
            val = val.replace(/-{2,}/g, '-');

            setFormData((prev) => ({
                ...prev,
                plate: val
            }));
            return;
        }

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setAttemptedSubmit(true);

        // Validación básica: la placa es obligatoria para todos menos bicicletas
        if (formData.type !== 'Bicicleta' && !formData.plate.trim()) {
            return;
        }

        onSave(formData);
        onClose();
    };

    const isPlateMissing = formData.type !== 'Bicicleta' && !formData.plate.trim();

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? "Editar Vehículo" : "Registrar Nuevo Vehículo"}
            description="Asocie un vehículo y parqueadero a la unidad residencial."
            size="md"
            footer={
                <>
                    <Button variant="outline" onClick={onClose} className="rounded-2xl h-12 px-6">
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        className={cn(
                            "rounded-2xl h-12 px-8 font-bold shadow-lg transition-all bg-amber-500 hover:bg-amber-600 text-white shadow-amber-100"
                        )}
                    >
                        {initialData ? 'Guardar' : 'Vincular Vehículo'}
                    </Button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-center mb-6">
                    <div className={cn(
                        "w-20 h-20 rounded-full flex items-center justify-center shadow-inner transition-all duration-300",
                        formData.type === 'Motocicleta' ? "bg-blue-50 text-blue-600" :
                            formData.type === 'Bicicleta' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                    )}>
                        {formData.type === 'Motocicleta' ? <Motorbike size={44} /> :
                            formData.type === 'Bicicleta' ? <Bike size={40} /> : <Car size={40} />}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2 col-span-full">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex justify-center w-full">
                            {formData.type === 'Bicicleta' ? 'Serial / Color' : 'Placa del Vehículo'}
                        </Label>
                        <Input
                            name="plate"
                            value={formData.plate}
                            onChange={handleChange}
                            onKeyDown={(e) => {
                                if (e.key === ' ') {
                                    e.preventDefault();
                                }
                            }}
                            placeholder={formData.type === 'Bicicleta' ? "Ej: BIKE-01" : "ABC-123"}
                            required={formData.type !== 'Bicicleta'}
                            className={cn(
                                "rounded-2xl h-12 bg-zinc-50 border-zinc-100 focus:bg-white font-black tracking-widest text-center text-lg max-w-xs mx-auto",
                                attemptedSubmit && isPlateMissing && "border-rose-200 bg-rose-50/30"
                            )}
                        />
                        {attemptedSubmit && isPlateMissing && (
                            <p className="text-[10px] text-rose-500 font-bold text-center animate-pulse">La placa es obligatoria para este tipo de vehículo</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Tipo de Vehículo</Label>
                        <Select name="type" value={formData.type} onChange={handleChange}>
                            <option value="Automóvil">Automóvil / Carro</option>
                            <option value="Camioneta">Camioneta / SUV</option>
                            <option value="Motocicleta">Motocicleta</option>
                            <option value="Otro">Otro</option>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Estado</Label>
                        <Select name="status" value={formData.status} onChange={handleChange}>
                            <option value="Activo">Activo (En Conjunto)</option>
                            <option value="Inactivo">Inactivo / Fuera</option>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Marca</Label>
                        <Input
                            name="brand"
                            value={formData.brand}
                            onChange={handleChange}
                            placeholder="Ej: Toyota"
                            className="rounded-2xl h-11 bg-zinc-50 border-zinc-100 focus:bg-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Modelo/Año</Label>
                        <Input
                            name="model"
                            value={formData.model}
                            onChange={handleChange}
                            placeholder="Ej: 2024"
                            className="rounded-2xl h-11 bg-zinc-50 border-zinc-100 focus:bg-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Color</Label>
                        <Input
                            name="color"
                            value={formData.color}
                            onChange={handleChange}
                            placeholder="Gris"
                            className="rounded-2xl h-11 bg-zinc-50 border-zinc-100 focus:bg-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Parqueadero</Label>
                        <Select name="parking_space_id" value={formData.parking_space_id} onChange={handleChange}>
                            <option value="">Sin asignar</option>
                            {privateParkingSpaces.map((space) => (
                                <option key={space.id} value={space.id}>
                                    {space.number}
                                </option>
                            ))}
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Observaciones</Label>
                    <Textarea
                        name="observations"
                        value={formData.observations}
                        onChange={handleChange}
                        placeholder="Descripción adicional, estado del parqueadero..."
                        className="rounded-2xl min-h-[100px] bg-zinc-50 border-zinc-100 focus:bg-white"
                    />
                </div>
            </form>
        </Modal>
    );
};
