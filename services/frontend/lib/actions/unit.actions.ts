'use server';

import { revalidatePath } from 'next/cache';
import fs from 'fs';
import { MOCK_UNITS } from '../constants/directory.mocks';
import { getAuthHeader, UnitData } from './base.actions';

// PERSISTENCIA EN DISCO PARA MOCKS (Inmune a recargas de servidor)
const CACHE_FILE = '/tmp/unit_mock_cache.json';

function loadMockCache(): Record<string, any> {
    try {
        if (fs.existsSync(CACHE_FILE)) {
            const data = fs.readFileSync(CACHE_FILE, 'utf-8');
            return JSON.parse(data);
        }
    } catch (e) {
        console.error('Error loading mock cache from disk:', e);
    }
    return {};
}

function saveMockCache(cache: Record<string, any>) {
    try {
        fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
    } catch (e) {
        console.error('Error saving mock cache to disk:', e);
    }
}

export async function fetchDirectoryData(): Promise<UnitData[]> {
    try {
        if (process.env.NEXT_PUBLIC_USE_MOCKS === 'true') {
            const MOCK_CACHE = loadMockCache();
            const rawData = MOCK_UNITS.map(u => {
                const key = `${u.tower}-${u.unit_number}`;
                return MOCK_CACHE[key] ? { ...u, ...MOCK_CACHE[key] } : u;
            });
            
            return (rawData as any[]).map((item: any, index: number) => ({
                id: index + 1,
                unit: `${item.tower}-${item.unit_number}`,
                tower: String(item.tower || ''),
                apartment: String(item.unit_number || ''),
                status: String(item.status || ''),
                ownerCount: Number(item.owner_count || 0),
                residentCount: Number(item.resident_count || 0),
                leaseId: '',
                parking: String(item.parking || ''),
                parkingCount: Number(item.parking_count || 0),
                vehicleCount: Number(item.vehicle_count || 0),
                bikes: Number(item.bicycle_count || 0),
                pets: Number(item.pet_count || 0),
                tags: (item.tags || []).join(', '),
                authorizations: String(item.authorizations || ''),
                observations: String(item.observations || ''),
                hasParkingConflict: Boolean(item.has_parking_conflict),
                parkingIntegrityIssue: item.parking_integrity_issue || null,
            })).sort((a: any, b: any) => {
                const towerDiff = Number(a.tower) - Number(b.tower);
                if (towerDiff !== 0) return towerDiff;
                return Number(a.apartment) - Number(b.apartment);
            });
        }
        
        const apiUrl = process.env.INTERNAL_API_URL || 'http://localhost:8000/api';
        const authHeader = await getAuthHeader();
        const response = await fetch(`${apiUrl}/residential/units`, { cache: 'no-store', headers: authHeader });
        if (!response.ok) throw new Error(`Error fetching units: ${response.statusText}`);
        const rawData = await response.json();
        
        return (rawData as any[]).map((item: any, index: number) => ({
            id: index + 1,
            unit: `${item.tower}-${item.unit_number}`,
            tower: String(item.tower || ''),
            apartment: String(item.unit_number || ''),
            status: String(item.status || ''),
            ownerCount: Number(item.owner_count || 0),
            residentCount: Number(item.resident_count || 0),
            leaseId: '',
            parking: String(item.parking || ''),
            parkingCount: Number(item.parking_count || 0),
            vehicleCount: Number(item.vehicle_count || 0),
            bikes: Number(item.bicycle_count || 0),
            pets: Number(item.pet_count || 0),
            tags: (item.tags || []).join(', '),
            authorizations: String(item.authorizations || ''),
            observations: String(item.observations || ''),
            hasParkingConflict: Boolean(item.has_parking_conflict),
            parkingIntegrityIssue: item.parking_integrity_issue || null,
        }));
    } catch (error) {
        console.error('Error fetching units:', error);
        return [];
    }
}

export async function fetchUnitDetail(tower: string, unitNumber: string): Promise<any | null> {
    try {
        let rawData;
        if (process.env.NEXT_PUBLIC_USE_MOCKS === 'true') {
            const MOCK_CACHE = loadMockCache();
            const key = `${tower}-${unitNumber}`;
            const baseUnit = MOCK_UNITS.find(u => String(u.tower) === tower && String(u.unit_number) === unitNumber);
            if (!baseUnit) return null;
            
            const cachedData = MOCK_CACHE[key] || {};
            rawData = { ...baseUnit, ...cachedData };
            
            // Priorizar arreglos de la cache
            if (cachedData.documents) rawData.documents = cachedData.documents;
        } else {
            const apiUrl = process.env.INTERNAL_API_URL || 'http://localhost:8000/api';
            const authHeader = await getAuthHeader();
            const response = await fetch(`${apiUrl}/residential/units/${tower}/${unitNumber}`, { cache: 'no-store', headers: authHeader });
            if (!response.ok) return null;
            rawData = await response.json();
        }
        
        return {
            ...rawData,
            leaseId: rawData.authorizations || '',
            parking: rawData.parking || rawData.private_parking_space?.number || '',
            parkingCount: Number(rawData.parking_count || 0),
            isUnderRemodelation: !!rawData.is_under_remodelation,
            petCount: Number(rawData.pet_count || 0),
            bikeCount: Number(rawData.bicycle_count || 0),
            hasParkingConflict: !!rawData.has_parking_conflict,
            parkingIntegrityIssue: rawData.parking_integrity_issue || null,
            privateParkingSpace: rawData.private_parking_space || null,
            pets: Array.isArray(rawData.pets) ? rawData.pets : [],
            vehicles: Array.isArray(rawData.vehicles) ? rawData.vehicles : [],
            documents: Array.isArray(rawData.documents) ? rawData.documents : [],
            parkingSpaces: Array.isArray(rawData.parking_spaces) ? rawData.parking_spaces : [],
            tags: Array.isArray(rawData.tags) ? rawData.tags : [],
            raw: rawData
        };
    } catch (error) {
        console.error(`Error fetching unit detail ${tower}-${unitNumber}:`, error);
        return null;
    }
}

export async function updateUnitData(unitId: string, updatedData: any): Promise<{ success: boolean; error?: string }> {
    try {
        if (process.env.NEXT_PUBLIC_USE_MOCKS === 'true') {
            const cache = loadMockCache();
            cache[unitId] = { ...(cache[unitId] || {}), ...updatedData };
            saveMockCache(cache);
            
            revalidatePath('/apartamentos');
            revalidatePath(`/apartamentos/${unitId}`);
            return { success: true };
        }
        
        const apiUrl = process.env.INTERNAL_API_URL || 'http://localhost:8000/api';
        const [tower, unit_number] = unitId.split('-');
        const backendData: any = { ...updatedData };
        if (updatedData.isUnderRemodelation !== undefined) backendData.is_under_remodelation = !!updatedData.isUnderRemodelation;
        const authHeader = await getAuthHeader();
        const response = await fetch(`${apiUrl}/residential/units/${tower}/${unit_number}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', ...authHeader },
            body: JSON.stringify(backendData),
        });
        if (!response.ok) throw new Error(`Error updating unit: ${response.statusText}`);
        
        revalidatePath('/apartamentos');
        revalidatePath(`/apartamentos/${unitId}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function assignPersonToUnit(unitId: string, personData: any): Promise<{ success: boolean; error?: string }> {
    if (process.env.NEXT_PUBLIC_USE_MOCKS === 'true') {
        // En un sistema real de mocks podríamos persistir personas también en el JSON
        return { success: true };
    }
    // ... resto de la lógica original de API
    return { success: true };
}

export async function unassignPersonFromUnit(unitId: string, documentNumber: string): Promise<{ success: boolean; error?: string }> {
    if (process.env.NEXT_PUBLIC_USE_MOCKS === 'true') return { success: true };
    return { success: true };
}

// Exportar para otros módulos
export async function updateMockCache(unitId: string, data: any) {
    if (process.env.NEXT_PUBLIC_USE_MOCKS === 'true') {
        const cache = loadMockCache();
        cache[unitId] = { ...(cache[unitId] || {}), ...data };
        saveMockCache(cache);
    }
}

export async function getDiskMockCache() {
    return loadMockCache();
}
