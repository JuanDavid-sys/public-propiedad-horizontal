'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import {
    ChevronLeft, Building2, User, Car, PawPrint, Info,
    Loader2, FileText, Tag, Bike, AlertCircle, Clock,
    Cloud, Printer, Edit3, Plus, Key, Smartphone, Mail, Eye, Download,
    MoreHorizontal, Search, Filter,
    ParkingSquare, Activity, Phone, MessageSquare, History, Zap, CheckCircle2,
    Wallet, CreditCard, ArrowUpRight, Receipt, DollarSign
} from 'lucide-react';
import { useOptimisticNavigation } from '@/app/_contexts/OptimisticNavigationContext';
import { fetchUnitDetail } from '@/lib/actions/smart.actions';
import { StatusBadge } from '../_components/StatusBadge';
import { UnitIntegrityAlert } from '../_components/UnitIntegrityAlert';
import { UnitTabs } from '../_components/UnitTabs';
import { DetailedPersonnelCard, type PersonnelMember } from '../_components/DetailedPersonnelCard';
import { VehicleCard, TagCard, PetCard } from '../_components/UnitVisualCards';
import { DetailSection, DetailItem } from '../_components/DetailComponents';
import { Breadcrumbs, BreadcrumbItem } from '../_components/Breadcrumbs';
import { UnitDetailSkeleton } from '@/components/skeletons/PageSkeletons';

function UnitDetailPageContent({ paramsPromise }: { paramsPromise: Promise<any> }) {
    const params = React.use(paramsPromise);
    const { pushOptimistic } = useOptimisticNavigation();
    const unit = params.unit as string;

    const [unitData, setUnitData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('summary');

    useEffect(() => {
        const loadUnitData = async () => {
            if (!unit) return;
            setIsLoading(true);
            const [tower, unitNumber] = unit.split('-');
            const data = await fetchUnitDetail(tower, unitNumber);
            setUnitData(data);
            setIsLoading(false);
        };
        loadUnitData();
    }, [unit]);

    // Handle tab query parameter
    const searchParams = useSearchParams();
    useEffect(() => {
        const tabParam = searchParams.get('tab');
        if (tabParam) {
            setActiveTab(tabParam);
        }
    }, [searchParams]);
    const from = searchParams.get('from');
    const fromQuery = from ? `?from=${from}` : '';
    const privateParkingNumber = unitData?.privateParkingSpace?.number || unitData?.parking || '';
    const bikeCount = String(unitData?.bikeCount ?? unitData?.bicycle_count ?? 0);

    const status = unitData?.status || '';
    const isOwnerResidentUnit = status.toLowerCase().includes('propietario');

    // Transformar datos reales desde la API estructurada
    const personnelMembers = React.useMemo<PersonnelMember[]>(() => {
        if (!unitData || !unitData.assignments) return [];

        return unitData.assignments.map((assignment: any) => {
            const person = assignment.person;
            return {
                name: `${person.first_name} ${person.last_name}`,
                document: person.document_number,
                documentType: person.document_type,
                role: assignment.is_owner ? 'Owner' : (person.role === 'Arrendatario' ? 'Tenant' : 'Resident'),
                contacts: {
                    phone: person.phone || 'No registrado',
                    email: person.email || 'No registrado'
                },
                authStatus: person.data_authorization ? 'signed' : 'invalid',
                isUnderage: person.is_minor,
                conditions: [
                    ...(person.has_disability ? ['Discapacidad'] : []),
                    ...(person.is_elderly ? ['Adulto Mayor'] : [])
                ]
            };
        });
    }, [unitData]);

    const ownerMembers = React.useMemo(() => {
        return personnelMembers.filter((member) => member.role === 'Owner');
    }, [personnelMembers]);

    const habitantMembers = React.useMemo(() => {
        return personnelMembers.filter((member) => {
            if (member.role === 'Tenant' || member.role === 'Resident') return true;
            if (member.role === 'Owner') return isOwnerResidentUnit;
            return false;
        });
    }, [isOwnerResidentUnit, personnelMembers]);

    const mergedPersonnelMembers = React.useMemo<PersonnelMember[]>(() => {
        if (!isOwnerResidentUnit) return [];

        const seenDocuments = new Set<string>();

        return [...personnelMembers]
            .sort((a, b) => {
                if (a.role === b.role) return 0;
                if (a.role === 'Owner') return -1;
                if (b.role === 'Owner') return 1;
                return 0;
            })
            .filter((member) => {
                if (seenDocuments.has(member.document)) return false;
                seenDocuments.add(member.document);
                return true;
            });
    }, [isOwnerResidentUnit, personnelMembers]);


    const vehicles = React.useMemo(() => {
        if (!unitData || !unitData.vehicles) return [];
        return unitData.vehicles.map((v: any) => ({
            name: v.observations || 'Vehículo Registrado',
            plate: v.plate.toUpperCase(),
            type: v.type,
            id: `VH-${v.plate}`,
            parking: v.parking_space?.number || '',
            hasConflict: false
        }));
    }, [unitData]);

    const tags = React.useMemo(() => {
        if (!unitData || !unitData.tags) return [];
        return unitData.tags.map((id: string) => ({
            id: id.trim(),
            assignedTo: 'Residente',
            status: 'active'
        }));
    }, [unitData]);

    const petsList = React.useMemo(() => {
        if (!unitData || !Array.isArray(unitData.pets)) return [];
        return unitData.pets.map((pet: any) => ({
            id: String(pet.id),
            name: pet.name,
            type: pet.species || 'No especificado',
        }));
    }, [unitData]);

    const tabs = [
        { id: 'summary', label: 'Resumen' },
        { id: 'personnel', label: 'Propietarios / Residentes', count: habitantMembers.length },
        { id: 'parking_vehicles', label: 'Parqueaderos / Vehículos', count: vehicles.length },
        { id: 'pets', label: 'Mascotas', count: petsList.length },
        { id: 'tags', label: 'Tags', count: tags.length },
        { id: 'documents', label: 'Documentos', count: unitData?.documents?.length || 0 },
    ].filter(tab => tab.id === 'summary' || tab.id === 'documents' || (tab.count !== undefined && tab.count > 0) || tab.id === 'parking_vehicles');

    // Build breadcrumbs based on active tab
    const breadcrumbs: BreadcrumbItem[] = React.useMemo(() => {
        const from = searchParams.get('from');
        const items: BreadcrumbItem[] = [
            {
                label: from === 'personas' ? 'Directorio de Personas' : from === 'search' ? 'Resultados' : 'Directorio',
                onClick: () => pushOptimistic(from === 'personas' ? '/personas' : from === 'search' ? '/search-results' : '/apartamentos')
            }
        ];

        const activeTabLabel = tabs.find(t => t.id === activeTab)?.label || 'Resumen';
        items.push({ label: activeTabLabel });

        return items;
    }, [activeTab, pushOptimistic, tabs, searchParams]);

    const buildPersonEditPath = (document: string) => {
        const params = new URLSearchParams({ unit, editMode: 'card' });
        if (from) params.set('from', from);
        return `/personas/${document}/edit?${params.toString()}`;
    };


    return (
        <>
            {isLoading ? (
                <UnitDetailSkeleton />
            ) : unitData ? (
                <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
                    {/* Header Section */}
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                        <div className="space-y-4">
                            <Breadcrumbs items={breadcrumbs} />

                            <div className="space-y-1">
                                <div className="flex items-center gap-4">
                                    <h1 className="text-4xl font-black text-zinc-900 tracking-tight leading-none drop-shadow-sm uppercase">
                                        Unidad {unit}
                                    </h1>
                                    <StatusBadge status={unitData.status} />
                                </div>
                                <p className="text-zinc-500 text-sm font-medium">Información detallada y registros de la unidad.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                onClick={() => pushOptimistic(`/apartamentos/${unit}/edit`)}
                                className="bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-200 h-12 px-8 rounded-2xl gap-2 font-bold transition-all hover:scale-[1.02]"
                            >
                                <Edit3 size={18} /> Editar Unidad
                            </Button>
                        </div>
                    </div>

                    {/* Tabs Navigation */}
                    <UnitTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

                    {unitData.hasParkingConflict && (
                        <UnitIntegrityAlert
                            conflictType="parking"
                            message={unitData.parkingIntegrityIssue || 'La unidad tiene una inconsistencia en su parqueadero privado.'}
                            onResolve={() => pushOptimistic(`/apartamentos/${unit}/edit`)}
                            onViewRaw={() => setActiveTab('parking_vehicles')}
                        />
                    )}

                    {/* Tab Content Area */}
                    <div className="space-y-8">
                        {activeTab === 'summary' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                                    {/* Column Left (7/12) */}
                                    <div className="col-span-12 lg:col-span-7 space-y-8">
                                        {/* Ownership & Contact Card */}
                                        <DetailSection
                                            title="Propietario Principal"
                                            icon={User}
                                            innerClassName="relative overflow-hidden"
                                            className="group"
                                        >
                                            <User size={100} className="absolute -top-4 -right-4 text-zinc-100 rotate-12 group-hover:scale-110 transition-transform duration-700" />

                                            <div className="relative z-10 space-y-8">
                                                {ownerMembers.length > 0 ? (
                                                    ownerMembers.map((owner: any, idx: number) => (
                                                        <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                                                            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 overflow-hidden shrink-0 border border-blue-100 shadow-sm">
                                                                <User size={24} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="text-2xl font-black text-zinc-900 tracking-tight truncate">{owner.name}</h4>
                                                                <div className="flex flex-wrap items-center gap-4 mt-1">
                                                                    <span className="flex items-center gap-1.5 text-zinc-500 text-sm font-medium">
                                                                        <Phone size={14} className="text-zinc-400" />
                                                                        {owner.contacts.phone}
                                                                    </span>
                                                                    <span className="w-1 h-1 bg-zinc-200 rounded-full hidden sm:block"></span>
                                                                    <span className="flex items-center gap-1.5 text-zinc-500 text-sm font-medium">
                                                                        <Mail size={14} className="text-zinc-400" />
                                                                        {owner.contacts.email}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="p-8 text-center bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                                                        <p className="text-sm font-bold text-zinc-400 font-mono uppercase tracking-widest">Sin propietarios registrados</p>
                                                    </div>
                                                )}

                                                {unitData?.documents?.find((d: any) => d.document_type === 'Certificado de Propiedad') && (() => {
                                                    const doc = unitData.documents.find((d: any) => d.document_type === 'Certificado de Propiedad');
                                                    return (
                                                        <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-200/50">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-zinc-100">
                                                                    <FileText size={18} className="text-blue-600" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-bold text-zinc-900 truncate max-w-[150px] sm:max-w-xs">{doc.original_name}</p>
                                                                    <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-tight">Certificado • {(doc.size / 1024).toFixed(1)} KB</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <a href={doc.file} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-white rounded-lg text-zinc-400 hover:text-blue-600 border border-transparent hover:border-zinc-100"><Eye size={16} /></a>
                                                                <a href={doc.file} download={doc.original_name} className="p-2 hover:bg-white rounded-lg text-zinc-400 hover:text-blue-600 border border-transparent hover:border-zinc-100"><Download size={16} /></a>
                                                            </div>
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        </DetailSection>

                                        {/* Resident Census Card */}
                                        <DetailSection
                                            title="Censo de Residentes"
                                            icon={Building2}
                                            innerClassName="bg-white relative overflow-hidden"
                                            className="group"
                                        >
                                            <Building2 size={100} className="absolute -top-4 -right-4 text-zinc-100/50 rotate-12 group-hover:scale-110 transition-transform duration-700" />

                                            <div className="relative z-10 space-y-10">
                                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                                                    <DetailItem label="Habitantes Totales" value={habitantMembers.length.toString()} variant="xlarge" />
                                                    <div className="flex gap-8 px-6 py-3 bg-white rounded-2xl border border-zinc-100 shadow-sm">
                                                        <div className="text-right">
                                                            <p className="text-lg font-black text-zinc-900">{habitantMembers.filter((m: any) => !m.isUnderage).length.toString()}</p>
                                                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tight">Adultos</p>
                                                        </div>
                                                        <div className="w-px h-8 bg-zinc-100"></div>
                                                        <div className="text-right">
                                                            <p className="text-lg font-black text-zinc-900">{habitantMembers.filter((m: any) => m.isUnderage).length.toString()}</p>
                                                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tight">Menores</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setActiveTab('personnel')}
                                                    className="w-full h-12 rounded-2xl border-zinc-200 text-zinc-600 hover:bg-zinc-50 justify-between px-5"
                                                >
                                                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">Ver Censo Completo</span>
                                                    <ArrowUpRight size={16} />
                                                </Button>

                                                {unitData?.documents?.find((d: any) => d.document_type === 'Contrato de Arrendamiento') && (() => {
                                                    const doc = unitData.documents.find((d: any) => d.document_type === 'Contrato de Arrendamiento');
                                                    return (
                                                        <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-zinc-200/50 mt-4">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-zinc-100">
                                                                    <FileText size={18} className="text-blue-600" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-bold text-zinc-900 truncate max-w-[150px] sm:max-w-xs">{doc.original_name}</p>
                                                                    <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-tight">
                                                                        Contrato Arrendamiento • {(doc.size / 1024).toFixed(1)} KB
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <a href={doc.file} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-white rounded-lg text-zinc-400 hover:text-blue-600 border border-transparent hover:border-zinc-100">
                                                                    <Eye size={16} />
                                                                </a>
                                                                <a href={doc.file} download={doc.original_name} className="p-2 hover:bg-white rounded-lg text-zinc-400 hover:text-blue-600 border border-transparent hover:border-zinc-100">
                                                                    <Download size={16} />
                                                                </a>
                                                            </div>
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        </DetailSection>
                                    </div>

                                    {/* Column Right (5/12) */}
                                    <div className="col-span-12 lg:col-span-5 space-y-8">
                                        <DetailSection
                                            title="Movilidad y Acceso"
                                            icon={Car}
                                            innerClassName="relative overflow-hidden"
                                            className="group"
                                        >
                                            <Car size={100} className="absolute -top-4 -right-4 text-zinc-100 rotate-12 group-hover:scale-110 transition-transform duration-700" />

                                            <div className="relative z-10 space-y-8">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex gap-4">
                                                        <div className="w-12 h-12 bg-zinc-50 flex items-center justify-center rounded-xl border border-zinc-100 shadow-inner">
                                                            <ParkingSquare size={24} className="text-zinc-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-2">Estado de Parqueo</p>
                                                            <div className="flex flex-wrap gap-2 mt-1">
                                                                {privateParkingNumber ? privateParkingNumber.split(',').map((p: string, i: number) => {
                                                                    const spot = p.trim();
                                                                    const vehiclePlate = vehicles.find((v: any) => v.parking === spot)?.plate;
                                                                    return (
                                                                        <span key={i} className="px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-lg border border-blue-100 uppercase tracking-tighter">
                                                                            {spot} {vehiclePlate && ` • ${vehiclePlate}`}
                                                                        </span>
                                                                    );
                                                                }) : <span className="text-[10px] font-bold text-zinc-300 italic">Sin celdas</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-3xl font-black text-zinc-900 leading-none">{vehicles.length.toString()}</p>
                                                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight mt-1">Vehículos</p>
                                                    </div>
                                                </div>

                                                <div className="h-px bg-zinc-100"></div>

                                                <div className="grid grid-cols-2 gap-8">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-emerald-50 flex items-center justify-center rounded-xl text-emerald-600 border border-emerald-100"><Bike size={18} /></div>
                                                        <div>
                                                            <p className="text-lg font-black text-zinc-900">{bikeCount}</p>
                                                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">Bicicletas</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-amber-50 flex items-center justify-center rounded-xl text-amber-600 border border-amber-100"><Key size={18} /></div>
                                                        <div>
                                                            <p className="text-lg font-black text-zinc-900">{tags.length.toString()}</p>
                                                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">Tags Activos</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => setActiveTab('parking_vehicles')}
                                                        className="h-12 rounded-2xl border-zinc-200 text-zinc-600 hover:bg-zinc-50 justify-between px-4"
                                                    >
                                                        <span className="text-[10px] font-black uppercase tracking-[0.18em]">Vehículos y Parqueo</span>
                                                        <ArrowUpRight size={16} />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => setActiveTab('tags')}
                                                        className="h-12 rounded-2xl border-zinc-200 text-zinc-600 hover:bg-zinc-50 justify-between px-4"
                                                    >
                                                        <span className="text-[10px] font-black uppercase tracking-[0.18em]">Control de Acceso</span>
                                                        <ArrowUpRight size={16} />
                                                    </Button>
                                                </div>
                                            </div>
                                        </DetailSection>

                                        <DetailSection
                                            title="Mascotas Registradas"
                                            icon={PawPrint}
                                            innerClassName="relative overflow-hidden"
                                            className="group"
                                        >
                                            <PawPrint size={100} className="absolute -top-4 -right-4 text-zinc-100 rotate-12 group-hover:scale-110 transition-transform duration-700" />

                                            <div className="relative z-10 space-y-8">
                                                <div className="flex items-baseline gap-3 mb-8">
                                                    <span className="text-5xl font-black text-zinc-900 tracking-tighter">{unitData.pet_count || '0'}</span>
                                                    <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em]">Registros</span>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setActiveTab('pets')}
                                                    className="w-full h-12 rounded-2xl border-zinc-200 text-zinc-600 hover:bg-zinc-50 justify-between px-5"
                                                >
                                                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">Ver Mascotas</span>
                                                    <ArrowUpRight size={16} />
                                                </Button>
                                            </div>
                                        </DetailSection>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'personnel' && (
                            <div className="bg-white rounded-[2.5rem] shadow-sm border border-zinc-200/50 overflow-hidden">
                                <div className="bg-zinc-50/50 px-8 py-6 border-b border-zinc-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-xl shadow-sm border border-zinc-100"><User className="text-zinc-400" size={20} /></div>
                                        <h3 className="text-lg font-bold text-zinc-900">Directorio de la Unidad</h3>
                                    </div>
                                </div>
                                <div className="p-4">
                                    {isOwnerResidentUnit ? (
                                        <>
                                            <div className="flex items-center gap-2 px-6 py-4 text-zinc-400">
                                                <Building2 size={14} />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Listado Unificado</span>
                                                <div className="h-px flex-1 bg-zinc-100 ml-2" />
                                            </div>
                                            {mergedPersonnelMembers.map((m, i: number) => (
                                                <DetailedPersonnelCard
                                                    key={`${m.document}-${i}`}
                                                    member={m}
                                                    onView={() => pushOptimistic(`/apartamentos/${unit}/${m.document}${fromQuery}`)}
                                                    onEdit={() => pushOptimistic(buildPersonEditPath(m.document))}
                                                />
                                            ))}
                                            {mergedPersonnelMembers.length === 0 && <p className="px-6 py-4 text-xs text-zinc-400 italic">No hay personas registradas.</p>}
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-2 px-6 py-4 text-zinc-400">
                                                <Key size={14} />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Propietarios Legales</span>
                                                <div className="h-px flex-1 bg-zinc-100 ml-2" />
                                            </div>
                                            {ownerMembers.map((m, i: number) => (
                                                <DetailedPersonnelCard
                                                    key={i}
                                                    member={m}
                                                    onView={() => pushOptimistic(`/apartamentos/${unit}/${m.document}${fromQuery}`)}
                                                    onEdit={() => pushOptimistic(buildPersonEditPath(m.document))}
                                                />
                                            ))}
                                            {ownerMembers.length === 0 && <p className="px-6 py-4 text-xs text-zinc-400 italic">No hay propietarios registrados.</p>}

                                            <div className="flex items-center gap-2 px-6 py-8 text-zinc-400 mt-4">
                                                <Building2 size={14} />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Residentes Actuales</span>
                                                <div className="h-px flex-1 bg-zinc-100 ml-2" />
                                            </div>
                                            {habitantMembers.map((m, i: number) => (
                                                <DetailedPersonnelCard
                                                    key={i}
                                                    member={m}
                                                    onView={() => pushOptimistic(`/apartamentos/${unit}/${m.document}${fromQuery}`)}
                                                    onEdit={() => pushOptimistic(buildPersonEditPath(m.document))}
                                                />
                                            ))}
                                            {habitantMembers.length === 0 && <p className="px-6 py-4 text-xs text-zinc-400 italic">No hay residentes registrados.</p>}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'parking_vehicles' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <DetailSection title="Asignación de Puesto" icon={ParkingSquare} iconColor="text-blue-600" iconBg="bg-blue-50">
                                        <div className="grid grid-cols-1 gap-y-6">
                                            <DetailItem label="Identificadores" value={privateParkingNumber || 'Pendiente de sincronizar'} variant="large" />
                                            <DetailItem label="Tipo" value={unitData.privateParkingSpace ? 'Privado / Escriturado' : 'Pendiente de asignacion'} />
                                            <DetailItem label="Estado" value={unitData.privateParkingSpace?.status || 'Sin parqueadero'} />
                                        </div>
                                    </DetailSection>
                                    <DetailSection title="Vehículos de Micromovilidad" icon={Bike} iconColor="text-emerald-600" iconBg="bg-emerald-50">
                                        <div className="grid grid-cols-1 gap-y-6">
                                            <DetailItem label="Bicicletas" value={bikeCount} variant="large" />
                                            <DetailItem label="Estado" value={parseInt(bikeCount, 10) > 0 ? 'Activo' : 'Sin registros'} />
                                        </div>
                                    </DetailSection>
                                </div>
                                <div className="bg-white rounded-[2.5rem] border border-zinc-200/60 p-8 space-y-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xl font-bold text-zinc-900">Listado Maestro de Vehículos</h3>
                                        <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full uppercase tracking-wider">{vehicles.length} Activos</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {vehicles.map((v: any, i: number) => (
                                            <VehicleCard
                                                key={i}
                                                vehicle={v}
                                                onView={() => pushOptimistic(`/apartamentos/${unit}/vehiculos/${encodeURIComponent(v.plate)}${fromQuery}`)}
                                                onEdit={() => pushOptimistic(`/apartamentos/${unit}/vehiculos/${encodeURIComponent(v.plate)}/edit?editMode=card${from ? `&from=${from}` : ''}`)}
                                            />
                                        ))}
                                        {vehicles.length === 0 && <div className="text-center py-12 text-zinc-400 font-medium">No hay vehículos registrados.</div>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'pets' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                <div className="bg-white rounded-[2.5rem] border border-zinc-200/60 p-8">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-xl font-black text-zinc-900">Registro de Mascotas</h3>
                                        <Button variant="outline" className="rounded-xl gap-2"><Plus size={16} /> Registrar</Button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {petsList.map((pet: any) => (
                                            <PetCard
                                                key={pet.id}
                                                pet={pet}
                                                onView={() => pushOptimistic(`/apartamentos/${unit}/mascotas/${pet.id}${fromQuery}`)}
                                                onEdit={() => pushOptimistic(`/apartamentos/${unit}/mascotas/${pet.id}/edit?editMode=card${from ? `&from=${from}` : ''}`)}
                                            />
                                        ))}
                                        {petsList.length === 0 && <p className="col-span-2 py-12 text-center text-zinc-500">No hay mascotas registradas.</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'tags' && (
                            <div className="bg-white rounded-[2.5rem] border border-zinc-200/60 p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold text-zinc-900">Control de Acceso Electrónico</h3>
                                    <span className="px-3 py-1 bg-zinc-100 text-zinc-500 text-[10px] font-bold rounded-full uppercase tracking-wider">{tags.length} Dispositivos</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {tags.map((t: any, i: number) => <TagCard key={i} tag={t} />)}
                                </div>
                                {tags.length === 0 && <p className="text-center py-12 text-zinc-400">No se han emitido tags.</p>}
                            </div>
                        )}

                        {activeTab === 'documents' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                <div className="bg-white rounded-[2.5rem] border border-zinc-200/60 p-8">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight">Archivo Documental</h3>
                                        <Button
                                            variant="outline"
                                            className="rounded-xl gap-2 font-bold uppercase text-[10px] tracking-widest px-4"
                                            onClick={() => pushOptimistic(`/apartamentos/${unit}/edit`)}
                                        >
                                            <Edit3 size={14} /> Gestionar Archivos
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 gap-2">
                                        {unitData?.documents && unitData.documents.length > 0 ? (
                                            unitData.documents.map((doc: any) => (
                                                <div
                                                    key={doc.id}
                                                    className="flex items-center justify-between p-4 bg-zinc-50/50 hover:bg-zinc-50 border border-zinc-100 rounded-2xl transition-all group"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-white border border-zinc-100 flex items-center justify-center text-zinc-400 group-hover:text-blue-600 group-hover:border-blue-100 transition-colors">
                                                            <FileText size={20} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-zinc-900 line-clamp-1">{doc.original_name || 'Documento sin nombre'}</p>
                                                            <div className="flex items-center gap-3 mt-0.5">
                                                                <span className="text-[10px] font-black uppercase text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded-md">{doc.document_type}</span>
                                                                <span className="text-[10px] font-medium text-zinc-400">{new Date(doc.created_at).toLocaleDateString()}</span>
                                                                <span className="text-[10px] font-medium text-zinc-400">{(doc.size / 1024 / 1024).toFixed(2)} MB</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="rounded-xl text-zinc-400 hover:text-blue-600 hover:bg-blue-50"
                                                        asChild
                                                    >
                                                        <a href={doc.file} target="_blank" rel="noopener noreferrer">
                                                            <Download size={18} />
                                                        </a>
                                                    </Button>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-20 text-center space-y-4">
                                                <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-300 mx-auto">
                                                    <FileText size={32} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-zinc-500">Sin documentos registrados</p>
                                                    <p className="text-xs text-zinc-400">Cargue certificados, contratos u otros archivos desde la edición.</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab !== 'personnel' && activeTab !== 'summary' && activeTab !== 'parking_vehicles' && activeTab !== 'pets' && activeTab !== 'tags' && activeTab !== 'documents' && (
                            <div className="bg-white p-20 rounded-[2.5rem] border-2 border-dashed border-zinc-200 text-center">
                                <Loader2 size={32} className="text-zinc-300 animate-spin mx-auto mb-6" />
                                <h3 className="text-xl font-bold text-zinc-400">Próximamente</h3>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                    <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-rose-50/50"><AlertCircle size={40} className="text-rose-500" /></div>
                    <h2 className="text-2xl font-bold text-zinc-900">Unidad No Encontrada</h2>
                    <Button onClick={() => pushOptimistic('/apartamentos')} className="mt-8 bg-zinc-900 text-white rounded-xl px-8 h-12">Volver al Inicio</Button>
                </div>
            )}
        </>
    );
}

export default function UnitDetailPage({ params }: { params: Promise<any> }) {
    return (
        <Suspense fallback={<UnitDetailSkeleton />}>
            <UnitDetailPageContent paramsPromise={params} />
        </Suspense>
    );
}
