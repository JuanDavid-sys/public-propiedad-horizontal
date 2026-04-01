'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { User, ShieldCheck, Phone, Mail, FileText, Info } from 'lucide-react';

interface PersonFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    initialData?: any;
    role?: 'Propietario' | 'Residente';
}

export const PersonFormModal: React.FC<PersonFormModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialData,
    role = 'Residente'
}) => {
    const emptyForm = {
        document_number: '',
        first_name: '',
        last_name: '',
        document_type: 'CC',
        role: role,
        email: '',
        phone: '',
        is_minor: false,
        is_elderly: false,
        has_disability: false,
        is_realtor: false,
        data_authorization: true,
        observations: ''
    };

    const [formData, setFormData] = useState(initialData || emptyForm);

    React.useEffect(() => {
        if (!isOpen) return;
        if (initialData) {
            setFormData({
                ...emptyForm,
                ...initialData,
                role: initialData.role || role
            });
            return;
        }
        setFormData({ ...emptyForm, role });
    }, [initialData, role, isOpen]);

    React.useEffect(() => {
        const type = formData.document_type;
        if (['CC', 'CE', 'PP', 'NIT'].includes(type)) {
            setFormData((prev: any) => ({ ...prev, is_minor: false }));
        } else if (['TI', 'RC'].includes(type)) {
            setFormData((prev: any) => ({ ...prev, is_minor: true }));
        }
    }, [formData.document_type]);

    const isMinorDisabled = ['CC', 'CE', 'PP', 'NIT', 'TI', 'RC'].includes(formData.document_type);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        // Handle select booleans correctly
        if (['is_minor', 'is_elderly', 'has_disability', 'is_realtor', 'data_authorization'].includes(name)) {
            setFormData((prev: any) => ({ ...prev, [name]: value === 'true' }));
            return;
        }

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
            title={initialData ? "Editar Persona" : `Vincular Nuevo ${formData.ROL_EN_EL_CONJUNTO}`}
            description="Complete todos los campos para registrar la información detallada."
            size="lg"
            footer={
                <>
                    <Button variant="outline" onClick={onClose} className="rounded-2xl h-12 px-6">
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} className="bg-zinc-900 text-white rounded-2xl h-12 px-8 font-bold">
                        {initialData ? 'Guardar' : 'Vincular a Unidad'}
                    </Button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-8 py-2">
                {/* Identificación */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Tipo Doc.</Label>
                        <Select name="document_type" value={formData.document_type} onChange={handleChange}>
                            <option value="CC">Cédula de Cidadanía</option>
                            <option value="CE">Cédula de Extranjería</option>
                            <option value="TI">Tarjeta de Identidad</option>
                            <option value="RC">Registro Civil</option>
                            <option value="PP">Pasaporte</option>
                            <option value="NIT">NIT</option>
                        </Select>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Número de Documento</Label>
                        <Input
                            name="document_number"
                            value={formData.document_number}
                            onChange={handleChange}
                            placeholder="Ej: 1010..."
                            required
                            className="rounded-2xl h-12 bg-zinc-50 border-zinc-100 focus:bg-white"
                        />
                    </div>
                </div>

                {/* Nombres y Apellidos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Nombres</Label>
                        <Input
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            placeholder="Nombres completos"
                            required
                            className="rounded-2xl h-12 bg-zinc-50 border-zinc-100 focus:bg-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Apellidos</Label>
                        <Input
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            placeholder="Apellidos completos"
                            required
                            className="rounded-2xl h-12 bg-zinc-50 border-zinc-100 focus:bg-white"
                        />
                    </div>
                </div>

                {/* Contacto */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Teléfonos</Label>
                        <Input
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Celular o Fijo"
                            className="rounded-2xl h-12 bg-zinc-50 border-zinc-100 focus:bg-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Correo Electrónico</Label>
                        <Input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="email@ejemplo.com"
                            className="rounded-2xl h-12 bg-zinc-50 border-zinc-100 focus:bg-white"
                        />
                    </div>
                </div>

                {/* Flags Demográficos */}
                <div className="bg-zinc-50 p-6 rounded-[2rem] border border-zinc-100">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-4">Condiciones Especiales</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[9px] font-bold text-zinc-500 uppercase">Menor Edad</Label>
                            <Select
                                name="is_minor"
                                value={String(formData.is_minor)}
                                onChange={handleChange}
                                disabled={isMinorDisabled}
                                className={cn("h-10 text-xs", isMinorDisabled && "bg-zinc-100 cursor-not-allowed opacity-60")}
                            >
                                <option value="false">No</option>
                                <option value="true">Si</option>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[9px] font-bold text-zinc-500 uppercase">Adulto Mayor</Label>
                            <Select name="is_elderly" value={String(formData.is_elderly)} onChange={handleChange} className="h-10 text-xs">
                                <option value="false">No</option>
                                <option value="true">Si</option>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[9px] font-bold text-zinc-500 uppercase">Discapacidad</Label>
                            <Select name="has_disability" value={String(formData.has_disability)} onChange={handleChange} className="h-10 text-xs">
                                <option value="false">No</option>
                                <option value="true">Si</option>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[9px] font-bold text-zinc-500 uppercase">Inmobiliaria</Label>
                            <Select name="is_realtor" value={String(formData.is_realtor)} onChange={handleChange} className="h-10 text-xs">
                                <option value="false">No</option>
                                <option value="true">Si</option>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Autorización y Notas */}
                <div className="space-y-5">
                    <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                        <div className="flex items-center gap-3">
                            <ShieldCheck size={20} className="text-emerald-600" />
                            <span className="text-xs font-bold text-emerald-900">Autoriza tratamiento de datos personales</span>
                        </div>
                        <Select
                            name="data_authorization"
                            value={String(formData.data_authorization)}
                            onChange={handleChange}
                            className="w-24 h-10 border-emerald-200 bg-white"
                        >
                            <option value="false">No</option>
                            <option value="true">Si</option>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Observaciones</Label>
                        <Textarea
                            name="observations"
                            value={formData.observations}
                            onChange={handleChange}
                            placeholder="Información médica, restricciones, o notas generales..."
                            className="rounded-2xl min-h-[100px] bg-zinc-50 border-zinc-100 focus:bg-white"
                        />
                    </div>
                </div>
            </form>
        </Modal>
    );
};
