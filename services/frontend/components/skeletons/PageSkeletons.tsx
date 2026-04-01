import { Skeleton } from '@/components/ui/Skeleton';

export function DashboardContentSkeleton() {
    return (
        <div className="p-6 space-y-6 animate-pulse w-full">
            <div className="space-y-3">
                <Skeleton className="h-8 w-64 rounded-lg" />
                <Skeleton className="h-4 w-80 rounded-lg" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-zinc-200 h-32 flex flex-col justify-between shadow-sm">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-28" />
                    </div>
                ))}
            </div>

            <div className="bg-white/70 backdrop-blur-2xl p-2 rounded-2xl shadow-[0_30px_60px_-20px_rgba(2,6,23,0.6)] border border-white/50 flex flex-wrap items-center gap-2 transition-all duration-300 w-full max-w-4xl mx-auto">
                <div className="w-full sm:w-auto min-w-[150px]">
                    <Skeleton className="h-11 w-full rounded-2xl" />
                </div>
                <div className="hidden sm:block h-8 w-px bg-zinc-200/70 mx-1" />
                <div className="w-full sm:flex-1 min-w-[220px]">
                    <Skeleton className="h-11 w-full rounded-2xl" />
                </div>
                <div className="hidden sm:block h-8 w-px bg-zinc-200/70 mx-1" />
                <div className="w-full sm:w-auto min-w-[180px]">
                    <Skeleton className="h-11 w-full rounded-2xl" />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
                <div className="h-12 border-b border-zinc-100 px-6 flex items-center">
                    <Skeleton className="h-4 w-28" />
                </div>
                <div className="p-6 space-y-4">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full rounded-lg" />
                    ))}
                </div>
            </div>
        </div>
    );
}

export function TableDirectorySkeleton() {
    return (
        <div className="p-6 space-y-6 animate-pulse w-full">
            <div className="space-y-3">
                <Skeleton className="h-8 w-64 rounded-lg" />
                <Skeleton className="h-4 w-80 rounded-lg" />
            </div>

            <div className="bg-white/70 backdrop-blur-2xl p-2 rounded-2xl shadow-[0_30px_60px_-20px_rgba(2,6,23,0.6)] border border-white/50 flex flex-wrap items-center gap-2 transition-all duration-300 w-full max-w-4xl mx-auto">
                <div className="w-full sm:flex-1 min-w-[220px]">
                    <Skeleton className="h-11 w-full rounded-2xl" />
                </div>
                <div className="hidden sm:block h-8 w-px bg-zinc-200/70 mx-1" />
                <div className="w-full sm:w-auto min-w-[160px]">
                    <Skeleton className="h-11 w-full rounded-2xl" />
                </div>
                <div className="hidden sm:block h-8 w-px bg-zinc-200/70 mx-1" />
                <div className="w-full sm:w-auto min-w-[160px]">
                    <Skeleton className="h-11 w-full rounded-2xl" />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
                <div className="h-12 border-b border-zinc-100 px-6 flex items-center gap-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-32 ml-auto" />
                </div>
                <div className="p-6 space-y-4">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full rounded-lg" />
                    ))}
                </div>
            </div>
        </div>
    );
}

export function PersonDetailSkeleton({ label = 'Cargando perfil de la persona...' }: { label?: string }) {
    return (
        <div className="p-4 md:p-8 space-y-8">
            <div className="space-y-4">
                <Skeleton className="h-4 w-48" />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Skeleton className="w-16 h-16 rounded-2xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-72" />
                            <Skeleton className="h-4 w-56" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-10 w-24 rounded-xl" />
                        <Skeleton className="h-10 w-24 rounded-xl" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl border border-zinc-200 p-6 space-y-4">
                        <Skeleton className="h-6 w-56" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton key={i} className="h-16 w-full rounded-xl" />
                            ))}
                        </div>
                    </div>
                    <div className="bg-white rounded-3xl border border-zinc-200 p-6 space-y-4">
                        <Skeleton className="h-6 w-52" />
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton key={i} className="h-16 w-full rounded-xl" />
                            ))}
                        </div>
                    </div>
                    <Skeleton className="h-28 w-full rounded-2xl" />
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-3xl border border-zinc-200 p-6 space-y-4">
                        <Skeleton className="h-6 w-48" />
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-12 w-full rounded-xl" />
                        ))}
                    </div>
                    <div className="bg-zinc-50 rounded-3xl p-6 border border-zinc-200/60 space-y-4">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>
                </div>
            </div>

            <p className="text-sm text-zinc-500 font-medium">{label}</p>
        </div>
    );
}

export function PersonEditSkeleton({ label = 'Preparando formulario de edición...' }: { label?: string }) {
    return (
        <div className="p-4 md:p-8 mx-auto space-y-8">
            <div className="space-y-3">
                <Skeleton className="h-4 w-56" />
                <Skeleton className="h-10 w-80" />
                <Skeleton className="h-4 w-72" />
            </div>

            <div className="bg-white rounded-3xl border border-zinc-200 p-6 md:p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-11 w-full rounded-2xl" />
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-11 w-full rounded-2xl" />
                    ))}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full rounded-2xl" />
                    ))}
                </div>

                <Skeleton className="h-28 w-full rounded-2xl" />

                <div className="flex justify-end gap-3">
                    <Skeleton className="h-12 w-32 rounded-2xl" />
                    <Skeleton className="h-12 w-40 rounded-2xl" />
                </div>
            </div>

            <p className="text-sm text-zinc-500 font-medium">{label}</p>
        </div>
    );
}

export function VehicleEditSkeleton({ label = 'Cargando formulario de edición...' }: { label?: string }) {
    return (
        <div className="p-4 md:p-8 mx-auto space-y-8">
            <div className="space-y-4">
                <Skeleton className="h-4 w-48" />
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-64" />
                        <Skeleton className="h-4 w-80" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-11 w-28 rounded-2xl" />
                        <Skeleton className="h-11 w-40 rounded-2xl" />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-zinc-200 p-6 md:p-8 space-y-8 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Skeleton className="h-3 w-16 ml-1" />
                        <Skeleton className="h-11 w-full rounded-2xl" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-3 w-16 ml-1" />
                        <Skeleton className="h-11 w-full rounded-2xl" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Skeleton className="h-3 w-28 ml-1" />
                        <Skeleton className="h-11 w-full rounded-2xl" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-3 w-16 ml-1" />
                        <Skeleton className="h-11 w-full rounded-2xl" />
                    </div>
                </div>

                <div className="space-y-2">
                    <Skeleton className="h-3 w-24 ml-1" />
                    <Skeleton className="h-32 w-full rounded-2xl" />
                </div>
            </div>

            <p className="text-sm text-zinc-500 font-medium">{label}</p>
        </div>
    );
}

export function PetEditSkeleton({ label = 'Cargando formulario de edición...' }: { label?: string }) {
    return (
        <div className="md:p-8 space-y-8">
            <div className="space-y-4">
                <Skeleton className="h-4 w-48" />
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-64" />
                        <Skeleton className="h-4 w-80" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-11 w-28 rounded-2xl" />
                        <Skeleton className="h-11 w-40 rounded-2xl" />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-zinc-200 p-6 md:p-8 space-y-8 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Skeleton className="h-3 w-16 ml-1" />
                        <Skeleton className="h-11 w-full rounded-2xl" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-3 w-16 ml-1" />
                        <Skeleton className="h-11 w-full rounded-2xl" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Skeleton className="h-3 w-16 ml-1" />
                        <Skeleton className="h-11 w-full rounded-2xl" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-3 w-16 ml-1" />
                        <Skeleton className="h-11 w-full rounded-2xl" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-3 w-16 ml-1" />
                        <Skeleton className="h-11 w-full rounded-2xl" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Skeleton className="h-3 w-16 ml-1" />
                        <Skeleton className="h-11 w-full rounded-2xl" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-3 w-16 ml-1" />
                        <Skeleton className="h-11 w-full rounded-2xl" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-3 w-16 ml-1" />
                        <Skeleton className="h-11 w-full rounded-2xl" />
                    </div>
                </div>

                <div className="space-y-2">
                    <Skeleton className="h-3 w-24 ml-1" />
                    <Skeleton className="h-32 w-full rounded-2xl" />
                </div>
            </div>

            <p className="text-sm text-zinc-500 font-medium">{label}</p>
        </div>
    );
}

export function CenteredDetailSkeleton({ label = 'Cargando información detallada...' }: { label?: string }) {
    return (
        <div className="md:p-8 space-y-6">
            <div className="space-y-3">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-10 w-72" />
                <Skeleton className="h-4 w-56" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-3xl p-6 space-y-5">
                    <Skeleton className="h-6 w-52" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="h-16 w-full rounded-xl" />
                        ))}
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="bg-white border border-zinc-200 rounded-3xl p-6 space-y-3">
                        <Skeleton className="h-5 w-40" />
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-12 w-full rounded-xl" />
                        ))}
                    </div>
                    <div className="bg-zinc-50 border border-zinc-200/60 rounded-3xl p-6 space-y-3">
                        <Skeleton className="h-5 w-36" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>
                </div>
            </div>

            <p className="text-sm text-zinc-500 font-medium">{label}</p>
        </div>
    );
}

export function UnitDetailSkeleton() {
    return (
        <div className="p-6 md:p-8 space-y-8 animate-pulse">
            <div className="space-y-3">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-12 w-80" />
                <Skeleton className="h-4 w-64" />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full rounded-xl" />
                ))}
            </div>

            {/* Layout de 2 columnas balanceado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Columna Izquierda Símil */}
                <div className="space-y-6">
                    <div className="bg-white border border-zinc-200 rounded-3xl p-6 space-y-6">
                        <Skeleton className="h-6 w-48" />
                        <div className="p-6 bg-zinc-50/50 rounded-3xl border border-zinc-100 space-y-4">
                            <Skeleton className="h-8 w-64" />
                            <div className="flex gap-2">
                                <Skeleton className="h-10 w-32 rounded-xl" />
                                <Skeleton className="h-10 w-32 rounded-xl" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white border border-zinc-200 rounded-3xl p-6 space-y-4">
                        <Skeleton className="h-6 w-40" />
                        <div className="grid grid-cols-2 gap-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton key={i} className="h-12 w-full rounded-xl" />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Columna Derecha Símil */}
                <div className="space-y-6">
                    <div className="bg-white border border-zinc-200 rounded-3xl p-6 space-y-4">
                        <Skeleton className="h-6 w-44" />
                        <Skeleton className="h-20 w-full rounded-2xl" />
                        <div className="grid grid-cols-2 gap-3">
                            <Skeleton className="h-14 w-full rounded-xl" />
                            <Skeleton className="h-14 w-full rounded-xl" />
                        </div>
                    </div>
                    <div className="bg-white border border-zinc-200 rounded-3xl p-6 space-y-4">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-20 w-full rounded-2xl" />
                        <Skeleton className="h-12 w-full rounded-xl" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export function EditUnitSkeleton() {
    return (
        <div className="p-6 md:p-8 mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-10 w-80" />
                    <Skeleton className="h-4 w-72" />
                </div>
                <div className="flex gap-3">
                    <Skeleton className="h-12 w-32 rounded-2xl" />
                    <Skeleton className="h-12 w-40 rounded-2xl" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 space-y-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="bg-white border border-zinc-200 rounded-3xl p-6 space-y-4">
                            <Skeleton className="h-5 w-40" />
                            {Array.from({ length: 4 }).map((__, j) => (
                                <Skeleton key={j} className="h-10 w-full rounded-xl" />
                            ))}
                        </div>
                    ))}
                </div>
                <div className="lg:col-span-8 space-y-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-white border border-zinc-200 rounded-3xl p-6 space-y-4">
                            <Skeleton className="h-5 w-52" />
                            {Array.from({ length: 5 }).map((__, j) => (
                                <Skeleton key={j} className="h-10 w-full rounded-xl" />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function SearchResultsSkeleton({ query, withHeader = true }: { query?: string; withHeader?: boolean }) {
    return (
        <div className="flex flex-col min-h-full bg-slate-50/50 p-6 pb-20 space-y-6">
            {withHeader ? (
                <div className="space-y-2">
                    <Skeleton className="h-8 w-72" />
                    <Skeleton className="h-4 w-80" />
                    {query ? <p className="text-xs text-zinc-400">Buscando: &quot;{query}&quot;</p> : null}
                </div>
            ) : null}
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
                    <div className="p-4 border-b border-zinc-100">
                        <Skeleton className="h-5 w-52" />
                    </div>
                    <div className="p-4 space-y-3">
                        {Array.from({ length: 5 }).map((__, j) => (
                            <Skeleton key={j} className="h-10 w-full rounded-lg" />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

export function AuthPageSkeleton() {
    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 z-0 bg-zinc-900" />
            <div className="container relative z-10 mx-auto px-6 flex justify-center">
                <div className="w-full max-w-lg bg-white/95 rounded-2xl p-6 md:p-8 space-y-4 border border-white/20 shadow-2xl">
                    <Skeleton className="h-7 w-44 mx-auto" />
                    <Skeleton className="h-4 w-56 mx-auto" />
                    <div className="space-y-3 pt-2">
                        <Skeleton className="h-11 w-full" />
                        <Skeleton className="h-11 w-full" />
                        <Skeleton className="h-11 w-full" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
        </div>
    );
}

export function LandingPageSkeleton() {
    return (
        <main className="relative min-h-screen bg-zinc-950">
            <div className="container mx-auto px-6 pt-28 pb-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                    <div className="space-y-5">
                        <Skeleton className="h-6 w-44 bg-zinc-700/70" />
                        <Skeleton className="h-14 w-full max-w-xl bg-zinc-700/70" />
                        <Skeleton className="h-14 w-4/5 bg-zinc-700/70" />
                        <Skeleton className="h-6 w-full max-w-2xl bg-zinc-700/70" />
                        <div className="flex gap-3">
                            <Skeleton className="h-12 w-40 bg-zinc-700/70" />
                            <Skeleton className="h-12 w-40 bg-zinc-700/70" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="rounded-3xl border border-zinc-700/70 bg-zinc-900/60 p-5 space-y-3">
                                <Skeleton className="h-6 w-6 bg-zinc-700/70" />
                                <Skeleton className="h-5 w-28 bg-zinc-700/70" />
                                <Skeleton className="h-4 w-full bg-zinc-700/70" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
