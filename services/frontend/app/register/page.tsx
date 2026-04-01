'use client';

import React, { useState } from 'react';
import { OptimisticLink } from '@/components/ui/OptimisticLink';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useOptimisticNavigation } from '@/app/_contexts/OptimisticNavigationContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { AlertCircleIcon, ArrowRightIcon, BuildingIcon, GoogleIcon, LockIcon, MailIcon, UserIcon } from '@/components/icons/AuthIcons';
import { signIn } from 'next-auth/react';
import api from '@/lib/api';

export default function RegisterPage() {
    const router = useRouter();
    const { pushOptimistic } = useOptimisticNavigation();
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        password_confirm: '',
        phone: '',
        unit_number: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.first_name.trim()) newErrors.first_name = 'El nombre es requerido';
        if (!formData.last_name.trim()) newErrors.last_name = 'El apellido es requerido';
        if (!formData.email.trim()) newErrors.email = 'El correo es requerido';
        if (!formData.password) newErrors.password = 'La contraseña es requerida';
        if (formData.password.length < 8) newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
        if (formData.password !== formData.password_confirm) {
            newErrors.password_confirm = 'Las contraseñas no coinciden';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);

        try {
            const response = await api.post('/auth/register', formData);

            const result = await signIn('credentials', {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            if (result?.error) {
                pushOptimistic('/login?registered=true');
            } else {
                pushOptimistic('/apartamentos');
                router.refresh();
            }
        } catch (err: any) {
            console.error('Error al registrarse:', err);
            if (!err?.response) {
                setErrors({
                    general: 'No fue posible conectar con el servidor. Si acabas de abrir la app, espera unos segundos e intenta de nuevo.'
                });
                return;
            }

            const errorDetail = err.response?.data?.detail;

            if (typeof errorDetail === 'string') {
                setErrors({ general: errorDetail });
            } else if (Array.isArray(errorDetail)) {
                const newErrors: Record<string, string> = {};
                errorDetail.forEach((error: any) => {
                    const field = error.loc?.[error.loc.length - 1];
                    if (field) {
                        newErrors[field] = error.msg;
                    }
                });
                setErrors(newErrors);
            } else {
                setErrors({ general: 'Error al crear la cuenta. Intenta nuevamente.' });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex">
            {/* Columna Izquierda - Imagen */}
            <div className="hidden lg:flex lg:w-1/2 lg:max-w-[412px] relative bg-zinc-900">
                <Image
                    src="/hero-bg.png"
                    alt="Conjunto Residencial"
                    fill
                    className="object-cover opacity-90"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/80 via-zinc-900/40 to-transparent" />

                <div className="relative z-10 flex flex-col justify-between p-12 text-white">
                    <div className="animate-in fade-in slide-in-from-left-4 duration-700">
                        <OptimisticLink href="/" className="flex items-center gap-3 group">
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-all duration-300 border border-white/20">
                                <BuildingIcon className="text-white w-6 h-6" />
                            </div>
                            <span className="text-2xl font-bold tracking-tight italic">Residential</span>
                        </OptimisticLink>
                    </div>

                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                        <h2 className="text-4xl font-bold leading-tight">
                            Únete a nuestra
                            <br />
                            comunidad residencial
                        </h2>
                        <p className="text-lg text-white/80 max-w-md">
                            Gestiona tu unidad, accede a servicios exclusivos y conecta con tus vecinos desde una única plataforma.
                        </p>

                        <div className="flex gap-8 pt-4">
                            <div className="space-y-1">
                                <div className="text-3xl font-bold">100%</div>
                                <div className="text-sm text-white/60">Seguro</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-3xl font-bold">24/7</div>
                                <div className="text-sm text-white/60">Disponible</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-3xl font-bold">0</div>
                                <div className="text-sm text-white/60">Papel</div>
                            </div>
                        </div>
                    </div>

                    <div className="text-sm text-white/40">
                        © 2026 Residential. Todos los derechos reservados.
                    </div>
                </div>
            </div>

            {/* Columna Derecha - Formulario */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 bg-gradient-to-br from-zinc-50 to-zinc-100 overflow-y-auto">
                {/* Logo móvil */}
                <div className="lg:hidden mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <OptimisticLink href="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center">
                            <BuildingIcon className="text-white w-5 h-5" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-zinc-900 italic">Residential</span>
                    </OptimisticLink>
                </div>

                <div className="w-full max-w-md lg:max-w-md space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    {/* Header */}
                    <div className="text-center lg:text-left space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
                            Crear Cuenta
                        </h1>
                        <p className="text-zinc-500">
                            Únete a nuestra comunidad de Residential hoy mismo
                        </p>
                    </div>

                    {/* Error general */}
                    {errors.general && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                            <AlertCircleIcon className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm">{errors.general}</p>
                        </div>
                    )}

                    {/* Formulario */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Nombre y Apellido */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="first_name" className="text-zinc-700 font-medium text-sm">Nombre</Label>
                                <div className="relative group">
                                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-zinc-600 transition-colors" />
                                    <Input
                                        id="first_name"
                                        name="first_name"
                                        placeholder="Juan"
                                        className={`pl-11 h-12 bg-white border-zinc-200 rounded-xl focus:border-zinc-900 focus:ring-zinc-900/20 transition-all ${errors.first_name ? 'border-red-500' : ''}`}
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                {errors.first_name && <p className="text-xs text-red-500">{errors.first_name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="last_name" className="text-zinc-700 font-medium text-sm">Apellido</Label>
                                <div className="relative group">
                                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-zinc-600 transition-colors" />
                                    <Input
                                        id="last_name"
                                        name="last_name"
                                        placeholder="Pérez"
                                        className={`pl-11 h-12 bg-white border-zinc-200 rounded-xl focus:border-zinc-900 focus:ring-zinc-900/20 transition-all ${errors.last_name ? 'border-red-500' : ''}`}
                                        value={formData.last_name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                {errors.last_name && <p className="text-xs text-red-500">{errors.last_name}</p>}
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-zinc-700 font-medium text-sm">Correo Electrónico</Label>
                            <div className="relative group">
                                <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-zinc-600 transition-colors" />
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="correo@ejemplo.com"
                                    className={`pl-11 h-12 bg-white border-zinc-200 rounded-xl focus:border-zinc-900 focus:ring-zinc-900/20 transition-all ${errors.email ? 'border-red-500' : ''}`}
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                        </div>

                        {/* Contraseñas */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-zinc-700 font-medium text-sm">Contraseña</Label>
                                <div className="relative group">
                                    <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-zinc-600 transition-colors" />
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        placeholder="••••••••"
                                        className={`pl-11 h-12 bg-white border-zinc-200 rounded-xl focus:border-zinc-900 focus:ring-zinc-900/20 transition-all ${errors.password ? 'border-red-500' : ''}`}
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password_confirm" className="text-zinc-700 font-medium text-sm">Confirmar</Label>
                                <div className="relative group">
                                    <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-zinc-600 transition-colors" />
                                    <Input
                                        id="password_confirm"
                                        name="password_confirm"
                                        type="password"
                                        placeholder="••••••••"
                                        className={`pl-11 h-12 bg-white border-zinc-200 rounded-xl focus:border-zinc-900 focus:ring-zinc-900/20 transition-all ${errors.password_confirm ? 'border-red-500' : ''}`}
                                        value={formData.password_confirm}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                {errors.password_confirm && <p className="text-xs text-red-500">{errors.password_confirm}</p>}
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl transition-all gap-2 group shadow-lg shadow-zinc-900/10"
                            disabled={loading}
                        >
                            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                            <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </form>

                    {/* Separador */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-zinc-200" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="bg-gradient-to-br from-zinc-50 to-zinc-100 px-4 text-zinc-400 uppercase tracking-wider">
                                O registrarse con
                            </span>
                        </div>
                    </div>

                    {/* Google */}
                    <Button
                        variant="outline"
                        className="w-full h-12 bg-white border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 rounded-xl transition-all gap-3"
                        onClick={() => {
                            document.cookie = "auth_action=register; path=/; max-age=300";
                            signIn('google', { callbackUrl: '/apartamentos' });
                        }}
                    >
                        <GoogleIcon className="w-5 h-5 text-zinc-600" />
                        <span className="text-zinc-700">Continuar con Google</span>
                    </Button>

                    {/* Footer */}
                    <div className="text-center space-y-3">
                        <p className="text-sm text-zinc-500">
                            ¿Ya tienes una cuenta?{' '}
                            <OptimisticLink href="/login" prefetch={false} className="text-zinc-900 font-semibold hover:underline transition-colors">
                                Inicia sesión
                            </OptimisticLink>
                        </p>
                        <p className="text-xs text-zinc-400">
                            Al registrarte, aceptas nuestros{' '}
                            <OptimisticLink href="#" className="underline hover:text-zinc-600">Términos de Servicio</OptimisticLink>
                            {' '}y{' '}
                            <OptimisticLink href="#" className="underline hover:text-zinc-600">Política de Privacidad</OptimisticLink>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
