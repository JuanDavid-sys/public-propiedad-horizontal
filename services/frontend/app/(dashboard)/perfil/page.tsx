'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { PageHeader } from '../apartamentos/_components/PageHeader';
import { User, Mail, Shield, Key, Bell, Camera, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function PerfilPage() {
    const { data: session } = useSession();

    const user = (session as any)?.backendTokens?.user || session?.user;
    const fullName = user?.name || (user?.first_name ? `${user?.first_name} ${user?.last_name}` : 'Usuario');
    const initials = (user?.first_name && user?.last_name)
        ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
        : (session?.user?.name ? session.user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'US');

    return (
        <div className="p-6 space-y-8 max-w-5xl mx-auto">
            <PageHeader
                title="Mi Perfil"
                description="Gestiona tu información personal y la seguridad de tu cuenta."
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Columna Izquierda: Avatar e Info Básica */}
                <div className="md:col-span-1 space-y-6">
                    <Card className="overflow-hidden border-none shadow-md">
                        <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-700" />
                        <CardContent className="relative pt-0 px-6 pb-6">
                            <div className="flex flex-col items-center -mt-12">
                                <div className="relative group">
                                    <div className="w-24 h-24 bg-white rounded-2xl p-1 shadow-xl">
                                        <div className="w-full h-full bg-zinc-100 rounded-xl flex items-center justify-center text-3xl font-black text-blue-600">
                                            {initials}
                                        </div>
                                    </div>
                                    <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition-all opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0">
                                        <Camera size={14} />
                                    </button>
                                </div>
                                <div className="mt-4 text-center">
                                    <h3 className="text-xl font-bold text-zinc-900">{fullName}</h3>
                                    <p className="text-sm font-medium text-zinc-500">{user?.role || 'Administrador'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-zinc-200/60 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold text-zinc-800 flex items-center gap-2">
                                <Shield size={16} className="text-blue-500" />
                                Estado de la Cuenta
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-zinc-500">Miembro desde</span>
                                    <span className="font-bold text-zinc-700">Octubre 2023</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-zinc-500">Verificación</span>
                                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full border border-emerald-100">Activa</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-zinc-500">Último acceso</span>
                                    <span className="font-medium text-zinc-400">Hace 2 horas</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Columna Derecha: Formularios e Info Detallada */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="border-zinc-200/60 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-zinc-800">Información Personal</CardTitle>
                            <CardDescription>Actualiza tus datos de contacto y cómo te ven los demás.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Nombre</label>
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-600">
                                            <User size={16} />
                                        </div>
                                        <input
                                            type="text"
                                            defaultValue={user?.first_name || session?.user?.name?.split(' ')[0]}
                                            className="w-full bg-zinc-50 border-zinc-200 rounded-xl py-2 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:border-blue-500/30 transition-all outline-none border"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Apellido</label>
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-600">
                                            <User size={16} />
                                        </div>
                                        <input
                                            type="text"
                                            defaultValue={user?.last_name || session?.user?.name?.split(' ').slice(1).join(' ')}
                                            className="w-full bg-zinc-50 border-zinc-200 rounded-xl py-2 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:border-blue-500/30 transition-all outline-none border"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Correo Electrónico</label>
                                <div className="relative group text-zinc-400">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                        <Mail size={16} />
                                    </div>
                                    <input
                                        type="email"
                                        value={user?.email || session?.user?.email || ''}
                                        disabled
                                        className="w-full bg-zinc-100 border-zinc-200 rounded-xl py-2 pl-10 pr-4 text-sm font-medium text-zinc-500 cursor-not-allowed border"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-amber-500 uppercase">Privado</span>
                                </div>
                                <p className="text-[10px] text-zinc-400">El correo electrónico está vinculado a tu cuenta y no puede ser modificado por seguridad.</p>
                            </div>

                            <div className="flex justify-end pt-2">
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-6">
                                    Guardar Cambios
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-zinc-200/60 shadow-sm overflow-hidden">
                        <CardHeader className="bg-zinc-50/50 border-b border-zinc-100">
                            <CardTitle className="text-lg font-bold text-zinc-800">Seguridad</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <button className="w-full p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors border-b border-zinc-100 group">
                                <div className="flex items-center gap-4 text-left">
                                    <div className="w-10 h-10 bg-amber-100/50 text-amber-600 rounded-xl flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                                        <Key size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-zinc-900 leading-none">Cambiar Contraseña</p>
                                        <p className="text-xs text-zinc-500 mt-1">Es recomendable actualizar tu contraseña cada 3 meses.</p>
                                    </div>
                                </div>
                                <ChevronRight size={16} className="text-zinc-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                            </button>
                            <button className="w-full p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors group">
                                <div className="flex items-center gap-4 text-left">
                                    <div className="w-10 h-10 bg-blue-100/50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <Bell size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-zinc-900 leading-none">Notificaciones de Seguridad</p>
                                        <p className="text-xs text-zinc-500 mt-1">Gestiona qué alertas de seguridad recibes en tu correo.</p>
                                    </div>
                                </div>
                                <ChevronRight size={16} className="text-zinc-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                            </button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
