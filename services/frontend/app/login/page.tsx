'use client';

import React, { Suspense, useState } from 'react';
import { OptimisticLink } from '@/components/ui/OptimisticLink';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useOptimisticNavigation } from '@/app/_contexts/OptimisticNavigationContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { AlertCircleIcon, ArrowRightIcon, BuildingIcon, GoogleIcon, LockIcon, MailIcon } from '@/components/icons/AuthIcons';
import { signIn } from 'next-auth/react';
import { AuthPageSkeleton } from '@/components/skeletons/PageSkeletons';
import { MOCK_AUTH_USER } from '@/lib/constants/auth.mocks';
import { InfoIcon, ClipboardCheckIcon } from 'lucide-react';

const GOOGLE_AUTH_ENABLED = process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === 'true';

function LoginPageContent() {
    const router = useRouter();
    const { pushOptimistic } = useOptimisticNavigation();
    const searchParams = useSearchParams();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        remember_me: false
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Manejar errores de NextAuth que vienen en la URL
    React.useEffect(() => {
        const authError = searchParams.get('error');

        if (authError === 'account_not_registered') {
            setError('Tu cuenta no está registrada. Redirigiéndote al registro...');

            const timer = setTimeout(() => {
                pushOptimistic('/register');
            }, 1000);
            return () => clearTimeout(timer);
        }

        if (authError === 'google_auth_failed') {
            setError('No fue posible iniciar sesión con Google en este momento. Intenta de nuevo más tarde.');
            return;
        }

        if (authError === 'AccessDenied') {
            setError('No fue posible completar el inicio de sesión con Google.');
        }
    }, [searchParams, router, pushOptimistic]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFillMock = () => {
        setFormData({
            email: MOCK_AUTH_USER.email,
            password: MOCK_AUTH_USER.password,
            remember_me: false
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {

        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await signIn('credentials', {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            if (result?.error) {
                if (result.error.includes('EMAIL_NOT_FOUND')) {
                    setError('Este correo electrónico no está registrado.');
                } else if (result.error.includes('INVALID_PASSWORD')) {
                    setError('La contraseña es incorrecta.');
                } else {
                    setError('Credenciales incorrectas. Por favor, intenta de nuevo.');
                }
                setLoading(false);
            } else {
                pushOptimistic('/apartamentos');
                router.refresh();
            }
        } catch {
            setError('Ocurrió un error inesperado. Intenta de nuevo más tarde.');
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
                {/* Overlay gradiente */}
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/80 via-zinc-900/40 to-transparent" />

                {/* Contenido sobre la imagen */}
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
                            Gestión inteligente<br />
                            para tu conjunto residencial
                        </h2>
                        <p className="text-lg text-white/80 max-w-md">
                            Administra unidades, residentes, vehículos y más desde una única plataforma moderna y segura.
                        </p>

                        {/* Stats o features */}
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
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 bg-gradient-to-br from-zinc-50 to-zinc-100">
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
                    {/* Header del formulario */}
                    <div className="text-center lg:text-left space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
                            Bienvenido de nuevo
                        </h1>
                        <p className="text-zinc-500">
                            Ingresa tus credenciales para acceder a la plataforma
                        </p>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                            <AlertCircleIcon className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {/* Formulario */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-zinc-700 font-medium text-sm">
                                Correo Electrónico
                            </Label>
                            <div className="relative group">
                                <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-zinc-600 transition-colors" />
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="correo@ejemplo.com"
                                    className="pl-11 h-12 bg-white border-zinc-200 rounded-xl focus:border-zinc-900 focus:ring-zinc-900/20 transition-all"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-zinc-700 font-medium text-sm">
                                    Contraseña
                                </Label>
                                <OptimisticLink href="#" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
                                    ¿Olvidaste tu contraseña?
                                </OptimisticLink>
                            </div>
                            <div className="relative group">
                                <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-zinc-600 transition-colors" />
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-11 h-12 bg-white border-zinc-200 rounded-xl focus:border-zinc-900 focus:ring-zinc-900/20 transition-all"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl transition-all gap-2 group shadow-lg shadow-zinc-900/10"
                            disabled={loading}
                        >
                            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                            <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </form>

                    {GOOGLE_AUTH_ENABLED && (
                        <>
                            {/* Separador */}
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-zinc-200" />
                                </div>
                                <div className="relative flex justify-center text-xs">
                                    <span className="bg-gradient-to-br from-zinc-50 to-zinc-100 px-4 text-zinc-400 uppercase tracking-wider">
                                        O continuar con
                                    </span>
                                </div>
                            </div>

                            {/* Botón Google */}
                            <Button
                                variant="outline"
                                className="w-full h-12 bg-white border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 rounded-xl transition-all gap-3"
                                onClick={() => {
                                    document.cookie = "auth_action=login; path=/; max-age=300";
                                    signIn('google', { callbackUrl: '/apartamentos' });
                                }}
                            >
                                <GoogleIcon className="w-5 h-5 text-zinc-600" />
                                <span className="text-zinc-700">Continuar con Google</span>
                            </Button>
                        </>
                    )}

                    {/* Footer */}
                    <div className="text-center pt-4">
                        <p className="text-sm text-zinc-500">
                            ¿No tienes una cuenta?{' '}
                            <OptimisticLink href="/register" prefetch={false} className="text-zinc-900 font-semibold hover:underline transition-colors">
                                Regístrate ahora
                            </OptimisticLink>
                        </p>
                    </div>

                    {/* Recuadro de Credenciales Mock */}
                    <div className="mt-8 p-4 bg-amber-50/50 border border-amber-200/50 rounded-2xl space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider">
                                <InfoIcon className="w-4 h-4" />
                                Cuenta de Prueba (Mock)
                            </div>
                            <button 
                                onClick={handleFillMock}
                                className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-200/50 hover:bg-amber-200 text-amber-900 rounded-lg text-[10px] font-black uppercase transition-all active:scale-95 border border-amber-300/30"
                            >
                                <ClipboardCheckIcon className="w-3 h-3" />
                                Auto-completar
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-[10px] text-amber-700 font-bold uppercase tracking-tight opacity-70">Email</p>
                                <p className="text-sm text-amber-950 font-mono font-medium">{MOCK_AUTH_USER.email}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] text-amber-700 font-bold uppercase tracking-tight opacity-70">Password</p>
                                <p className="text-sm text-amber-950 font-mono font-medium">{MOCK_AUTH_USER.password}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


export default function LoginPage() {
    return (
        <Suspense fallback={<AuthPageSkeleton />}>
            <LoginPageContent />
        </Suspense>
    );
}
