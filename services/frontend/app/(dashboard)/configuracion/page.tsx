'use client';

import React from 'react';
import { PageHeader } from '../apartamentos/_components/PageHeader';
import { Settings, Construction } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export default function ConfiguracionPage() {
    const router = useRouter();

    return (
        <div className="p-6 space-y-8 max-w-5xl mx-auto h-[80vh] flex flex-col items-center justify-center">
            <div className="text-center space-y-6">
                <div className="relative inline-block">
                    <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center animate-pulse">
                        <Settings size={48} />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center border-4 border-white">
                        <Construction size={20} />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Módulo en Construcción</h1>
                    <p className="text-zinc-500 max-w-md mx-auto">
                        Estamos trabajando para traerte las mejores opciones de personalización. ¡Vuelve pronto para configurar tu experiencia en Ventura!
                    </p>
                </div>

                <div className="pt-4">
                    <Button
                        onClick={() => router.back()}
                        className="bg-zinc-900 text-white hover:bg-zinc-800 font-bold rounded-xl px-8"
                    >
                        Regresar
                    </Button>
                </div>
            </div>
        </div>
    );
}
