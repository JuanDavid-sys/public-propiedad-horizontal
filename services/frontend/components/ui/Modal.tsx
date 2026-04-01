'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { Button } from './Button';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
    className?: string;
    showCloseButton?: boolean;
    overlay?: 'dark' | 'none';
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    description,
    children,
    footer,
    size = 'md',
    className,
    showCloseButton = true,
    overlay = 'dark',
}) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    if (!mounted || !isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        '2xl': 'max-w-6xl',
        full: 'max-w-[95vw]',
    };

    const overlayClasses = overlay === 'none'
        ? 'bg-transparent'
        : 'bg-zinc-900/60 backdrop-blur-sm';

    const modalContent = (
        <div className={cn(
            "fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300 m-0",
            overlayClasses
        )}>
            <div
                ref={modalRef}
                className={cn(
                    "bg-white w-full rounded-[2.5rem] shadow-2xl border border-zinc-200/60 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300",
                    sizeClasses[size],
                    className
                )}
            >
                {/* Header */}
                <div className="p-8 pb-4 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black text-zinc-900 tracking-tight leading-none uppercase">
                            {title}
                        </h2>
                        {description && (
                            <p className="text-zinc-500 text-sm font-medium">{description}</p>
                        )}
                    </div>
                    {showCloseButton && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onClose}
                            className="rounded-full w-10 h-10 p-0 border-zinc-100 hover:bg-zinc-50 text-zinc-400 hover:text-zinc-600 transition-all active:scale-90"
                        >
                            <X size={18} />
                        </Button>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 p-8 pt-4 overflow-y-auto custom-scrollbar">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="p-8 pt-4 bg-zinc-50/50 border-t border-zinc-100 flex items-center justify-end gap-3">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};
