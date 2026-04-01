'use client';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { Building2, LogIn, UserPlus, Menu } from 'lucide-react';
import Link from 'next/link';

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        handleScroll();
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinkClass = "font-manrope text-sm font-medium transition-colors duration-200 text-slate-600 hover:text-blue-600 px-2 py-1";
    const scrolledNavLinkClass = "font-manrope text-sm font-bold transition-colors duration-200 text-blue-700 border-b-2 border-blue-700 px-2 py-1";

    return (
        <nav
            className={cn(
                'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent',
                isScrolled
                    ? 'bg-white/95 backdrop-blur-md border-slate-200 py-4 shadow-sm'
                    : 'bg-white/80 backdrop-blur-md py-4'
            )}
        >
            <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <span className="text-xl font-bold tracking-tighter text-blue-600">
                        Residential
                    </span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8">
                    <Link href="#inicio" className={isScrolled ? scrolledNavLinkClass : navLinkClass}>Beneficios</Link>
                    <Link href="#planes" className={navLinkClass}>Precios</Link>
                    <Link href="#futuro" className={navLinkClass}>Roadmap</Link>
                    <Link href="#contacto" className={navLinkClass}>Contacto</Link>
                </div>

                <div className="flex items-center gap-3">
                    <Link href="/login" className="hidden sm:inline-flex">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-600 hover:text-blue-600"
                        >
                            <LogIn className="w-4 h-4 mr-2" /> Iniciar Sesión
                        </Button>
                    </Link>
                    <Link href="/register">
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95"
                        >
                            Comenzar Ahora
                        </Button>
                    </Link>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden text-slate-700 hover:bg-slate-100"
                    >
                        <Menu className="w-6 h-6" />
                    </Button>
                </div>
            </div>
        </nav>
    );
}
