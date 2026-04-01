import React from 'react';
import { User, Phone, Mail, Edit, Eye, Baby } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export interface PersonnelMember {
    name: string;
    document: string;
    documentType?: string;
    role: 'Owner' | 'Resident' | 'Dependent' | 'Tenant';
    contacts: {
        phone?: string;
        email?: string;
    };
    conditions?: string[]; // Disability, Senior, etc
    authStatus: 'signed' | 'invalid' | 'guardian_only';
    isUnderage?: boolean;
}

export function DetailedPersonnelCard({
    member,
    onView,
    onEdit
}: {
    member: PersonnelMember;
    onView?: () => void;
    onEdit?: () => void;
}) {
    const isOwner = member.role === 'Owner';

    return (
        <div
            className={cn(
                "group border-b border-zinc-100 last:border-0 py-6 transition-all hover:bg-zinc-50/50 px-2 sm:px-6 rounded-3xl overflow-hidden"
            )}
        >
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                {/* Avatar and Info */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={cn(
                        "w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-105",
                        isOwner ? "bg-blue-50 text-blue-600" :
                            member.isUnderage ? "bg-amber-50 text-amber-600" : "bg-zinc-100 text-zinc-500"
                    )}>
                        {member.isUnderage ? <Baby size={28} /> : <User size={28} />}
                    </div>

                    <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-base font-bold text-zinc-900 leading-none truncate">{member.name}</h4>
                        </div>
                        <p className="text-xs font-mono text-zinc-400 font-medium">{member.documentType || 'CC'} {member.document}</p>
                    </div>
                </div>

                {/* Content Row: Contacts and Auth */}
                <div className="flex flex-col sm:flex-row lg:items-center justify-between gap-6 lg:gap-12 flex-[1.5] min-w-0">
                    {/* Contacts */}
                    <div className="flex flex-col gap-1.5 min-w-0">
                        <div className="flex items-center gap-2 text-xs text-zinc-600 font-medium truncate">
                            <Phone size={12} className="text-zinc-400 shrink-0" /> {member.contacts.phone || 'N/A'}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-zinc-600 font-medium truncate">
                            <Mail size={12} className="text-zinc-400 shrink-0" /> {member.contacts.email || 'N/A'}
                        </div>
                    </div>

                    {/* Role & Conditions */}
                    <div className="flex flex-col lg:items-end gap-2 min-w-0">
                        <div className="flex flex-wrap gap-1 lg:justify-end">
                            {member.conditions?.map((cond, i) => (
                                <span key={i} className="text-[9px] font-bold bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded border border-rose-100 shrink-0">
                                    {cond}
                                </span>
                            ))}
                        </div>
                        <span className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter shrink-0 w-fit",
                            isOwner ? "bg-blue-600 text-white shadow-sm shadow-blue-200" :
                                member.role === 'Tenant' ? "bg-purple-100 text-purple-600" : "bg-zinc-100 text-zinc-500"
                        )}>
                            {member.role === 'Owner' ? 'Propietario' :
                                member.role === 'Tenant' ? 'Arrendatario' :
                                    member.role === 'Dependent' ? 'Dependiente' : 'Residente'}
                        </span>
                    </div>
                </div>
                {(onView || onEdit) && (
                    <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto lg:ml-auto">
                        {onView && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={onView}
                                className="h-9 px-3 rounded-xl gap-2 text-xs font-bold text-zinc-600 border-zinc-200 hover:bg-zinc-50"
                            >
                                <Eye size={14} /> Ver
                            </Button>
                        )}
                        {onEdit && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={onEdit}
                                className="h-9 px-3 rounded-xl gap-2 text-xs font-bold text-blue-600 border-blue-100 hover:bg-blue-50"
                            >
                                <Edit size={14} /> Editar
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
