'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { PawPrint, Heart, Info } from 'lucide-react';

interface PetFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    initialData?: any;
}

export const PetFormModal: React.FC<PetFormModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialData
}) => {
    const emptyForm = {
        name: '',
        type: 'Canino',
        breed: '',
        color: '',
        age: '',
        gender: 'Macho',
        vaccinated: 'Si',
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
        setFormData((prev: any) => ({ ...prev, [name]: value }));
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
            title={initialData ? "Editar Mascota" : "Registrar Nueva Mascota"}
            description="Vincule una mascota a la unidad con todos sus datos de identificación."
            size="md"
            footer={
                <>
                    <Button variant="outline" onClick={onClose} className="rounded-2xl h-12 px-6">
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-12 px-8 font-bold">
                        {initialData ? 'Guardar' : 'Registrar Mascota'}
                    </Button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 shadow-inner">
                        <PawPrint size={40} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2 space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Nombre de la Mascota</Label>
                        <Input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Ej: Max, Luna..."
                            required
                            className="rounded-2xl h-12 bg-zinc-50 border-zinc-100 focus:bg-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Especie</Label>
                        <Select name="type" value={formData.type} onChange={handleChange}>
                            <option value="Canino">Canino / Perro</option>
                            <option value="Felino">Felino / Gato</option>
                            <option value="Ave">Ave / Pájaro</option>
                            <option value="Otro">Otro</option>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Raza</Label>
                        <Input
                            name="breed"
                            value={formData.breed}
                            onChange={handleChange}
                            placeholder="Ej: Labrador, Persa..."
                            className="rounded-2xl h-12 bg-zinc-50 border-zinc-100 focus:bg-white"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Color</Label>
                        <Input
                            name="color"
                            value={formData.color}
                            onChange={handleChange}
                            placeholder="Blanco, Negro..."
                            className="rounded-2xl h-12 bg-zinc-50 border-zinc-100 focus:bg-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Edad</Label>
                        <Input
                            name="age"
                            value={formData.age}
                            onChange={handleChange}
                            placeholder="Ej: 2 meses, 3 años..."
                            className="rounded-2xl h-12 bg-zinc-50 border-zinc-100 focus:bg-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Género</Label>
                        <Select name="gender" value={formData.gender} onChange={handleChange}>
                            <option value="Macho">Macho</option>
                            <option value="Hembra">Hembra</option>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Vacunado</Label>
                        <Select name="vaccinated" value={formData.vaccinated} onChange={handleChange}>
                            <option value="Si">Sí</option>
                            <option value="No">No</option>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Observaciones / Notas Médicas</Label>
                    <Textarea
                        name="observations"
                        value={formData.observations}
                        onChange={handleChange}
                        placeholder="Información relevante (ej. agresividad, necesidades especiales)..."
                        className="rounded-2xl min-h-[100px] bg-zinc-50 border-zinc-100 focus:bg-white"
                    />
                </div>
            </form>
        </Modal>
    );
};
