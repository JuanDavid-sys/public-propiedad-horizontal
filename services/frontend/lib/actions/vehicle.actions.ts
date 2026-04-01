'use server';

import { revalidatePath } from 'next/cache';
import { MOCK_UNITS } from '../constants/directory.mocks';
import { getAuthHeader, VehicleData } from './base.actions';

export async function fetchVehicleByPlate(plate: string): Promise<any | null> {
    try {
        if (process.env.NEXT_PUBLIC_USE_MOCKS === 'true') {
            for (const unit of (MOCK_UNITS as any[])) {
                const vehicle = (unit.vehicles || []).find((v: any) => v.plate.toUpperCase() === plate.toUpperCase());
                if (vehicle) return { ...vehicle, unit: { id: unit.id, tower: unit.tower, unit_number: unit.unit_number, status: unit.status } };
            }
            return null;
        }
        const apiUrl = process.env.INTERNAL_API_URL || 'http://localhost:8000/api';
        const authHeader = await getAuthHeader();
        const response = await fetch(`${apiUrl}/residential/vehicles/${encodeURIComponent(plate)}`, { cache: 'no-store', headers: authHeader });
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        return null;
    }
}

export async function fetchVehicleDetailByPlate(plate: string): Promise<VehicleData | null> {
    try {
        if (process.env.NEXT_PUBLIC_USE_MOCKS === 'true') {
            const v = await fetchVehicleByPlate(plate);
            if (!v) return null;
            return {
                id: v.unit ? `${v.plate}-${v.unit?.tower}-${v.unit?.unit_number}` : `${v.plate}-unassigned`,
                plate: v.plate,
                type: v.type || '',
                brand: v.brand || null,
                model: v.model || null,
                color: v.color || null,
                tower: v.unit?.tower || '',
                apartment: v.unit?.unit_number || '',
                unit: v.unit ? `${v.unit.tower}-${v.unit.unit_number}` : '',
                parking: v.parking_space?.number || '',
                parkingSpace: v.parking_space || null,
                status: v.status || 'Activo',
                observations: v.observations || null,
            };
        }
        const apiUrl = process.env.INTERNAL_API_URL || 'http://localhost:8000/api';
        const authHeader = await getAuthHeader();
        const response = await fetch(`${apiUrl}/residential/vehicles/${encodeURIComponent(plate)}`, {
            cache: 'no-store',
            headers: authHeader
        });
        if (!response.ok) return null;
        const v = await response.json();
        return {
            id: v.unit ? `${v.plate}-${v.unit?.tower}-${v.unit?.unit_number}` : `${v.plate}-unassigned`,
            plate: v.plate,
            type: v.type || '',
            brand: v.brand || null,
            model: v.model || null,
            color: v.color || null,
            tower: v.unit?.tower || '',
            apartment: v.unit?.unit_number || '',
            unit: v.unit ? `${v.unit.tower}-${v.unit.unit_number}` : '',
            parking: v.parking_space?.number || '',
            parkingSpace: v.parking_space || null,
            status: v.status || 'Activo',
            observations: v.observations || null,
        };
    } catch (error) {
        console.error(`Error al obtener vehículo ${plate}:`, error);
        return null;
    }
}

export async function fetchVehiclesData(): Promise<VehicleData[]> {
    try {
        if (process.env.NEXT_PUBLIC_USE_MOCKS === 'true') {
            const allVehicles: VehicleData[] = [];
            (MOCK_UNITS as any[]).forEach(unit => {
                (unit.vehicles || []).forEach((v: any) => {
                    allVehicles.push({
                        id: `${v.plate}-${unit.tower}-${unit.unit_number}`,
                        plate: v.plate,
                        type: v.type || '',
                        brand: v.brand || null,
                        model: v.model || null,
                        color: v.color || null,
                        tower: unit.tower,
                        apartment: unit.unit_number,
                        unit: `${unit.tower}-${unit.unit_number}`,
                        parking: v.parking_space?.number || '',
                        parkingSpace: v.parking_space || null,
                        status: v.status || 'Activo',
                        observations: v.observations || null,
                    });
                });
            });
            return allVehicles;
        }
        const apiUrl = process.env.INTERNAL_API_URL || 'http://localhost:8000/api';
        const authHeader = await getAuthHeader();
        const response = await fetch(`${apiUrl}/residential/vehicles`, { cache: 'no-store', headers: authHeader });
        if (!response.ok) throw new Error(`Error fetching vehicles`);
        const rawData = await response.json();
        return rawData.map((v: any) => ({
            id: v.unit ? `${v.plate}-${v.unit?.tower}-${v.unit?.unit_number}` : `${v.plate}-unassigned`,
            plate: v.plate,
            type: v.type || '',
            brand: v.brand || null,
            model: v.model || null,
            color: v.color || null,
            tower: v.unit?.tower || '',
            apartment: v.unit?.unit_number || '',
            unit: v.unit ? `${v.unit.tower}-${v.unit.unit_number}` : '',
            parking: v.parking_space?.number || '',
            parkingSpace: v.parking_space || null,
            status: v.status,
            observations: v.observations || null,
        }));
    } catch (error) {
        return [];
    }
}

export async function fetchVehicleByUnitAndPlate(unitId: string, plate: string): Promise<VehicleData | null> {
    try {
        if (process.env.NEXT_PUBLIC_USE_MOCKS === 'true') {
            const [tower, unit_number] = unitId.split('-');
            const unit = (MOCK_UNITS as any[]).find(u => String(u.tower) === tower && String(u.unit_number) === unit_number);
            if (!unit) return null;
            const v = (unit.vehicles || []).find((v: any) => v.plate.toUpperCase() === plate.toUpperCase());
            if (!v) return null;
            return {
                id: `${v.plate}-${tower}-${unit_number}`,
                plate: v.plate,
                type: v.type || '',
                brand: v.brand || null,
                model: v.model || null,
                color: v.color || null,
                tower,
                apartment: unit_number,
                unit: unitId,
                parking: v.parking_space?.number || '',
                parkingSpace: v.parking_space || null,
                status: v.status || 'Activo',
                observations: v.observations || null,
            };
        }
        const apiUrl = process.env.INTERNAL_API_URL || 'http://localhost:8000/api';
        const [tower, unit_number] = unitId.split('-');
        const authHeader = await getAuthHeader();
        const response = await fetch(`${apiUrl}/residential/units/${tower}/${unit_number}/vehicles/${encodeURIComponent(plate)}`, { cache: 'no-store', headers: authHeader });
        if (!response.ok) return null;
        const v = await response.json();
        return {
            id: v.unit ? `${v.plate}-${v.unit?.tower}-${v.unit?.unit_number}` : `${v.plate}-unassigned`,
            plate: v.plate,
            type: v.type || '',
            brand: v.brand || null,
            model: v.model || null,
            color: v.color || null,
            tower: v.unit?.tower || tower,
            apartment: v.unit?.unit_number || unit_number,
            unit: v.unit ? `${v.unit.tower}-${v.unit.unit_number}` : unitId,
            parking: v.parking_space?.number || '',
            parkingSpace: v.parking_space || null,
            status: v.status || 'Activo',
            observations: v.observations || null,
        };
    } catch (error) {
        return null;
    }
}

export async function assignVehicleToUnit(unitId: string, vehicleData: any): Promise<{ success: boolean; error?: string }> {
    try {
        if (process.env.NEXT_PUBLIC_USE_MOCKS === 'true') {
            return { success: true };
        }
        const apiUrl = process.env.INTERNAL_API_URL || 'http://localhost:8000/api';
        const [tower, unit_number] = unitId.split('-');
        const authHeader = await getAuthHeader();
        const response = await fetch(`${apiUrl}/residential/units/${tower}/${unit_number}/assign-vehicle`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeader },
            body: JSON.stringify(vehicleData),
        });
        if (!response.ok) throw new Error('Error assigning vehicle');
        revalidatePath('/apartamentos');
        revalidatePath(`/apartamentos/${unitId}`);
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function unassignVehicleFromUnit(unitId: string, plate: string): Promise<{ success: boolean; error?: string }> {
    try {
        if (process.env.NEXT_PUBLIC_USE_MOCKS === 'true') {
            return { success: true };
        }
        const apiUrl = process.env.INTERNAL_API_URL || 'http://localhost:8000/api';
        const [tower, unit_number] = unitId.split('-');
        const authHeader = await getAuthHeader();
        const response = await fetch(`${apiUrl}/residential/units/${tower}/${unit_number}/unassign-vehicle/${plate}`, {
            method: 'DELETE',
            headers: authHeader
        });
        if (!response.ok) throw new Error('Error unassigning vehicle');
        revalidatePath('/apartamentos');
        revalidatePath(`/apartamentos/${unitId}`);
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteVehicleByPlate(plate: string): Promise<{ success: boolean; error?: string }> {
    try {
        if (process.env.NEXT_PUBLIC_USE_MOCKS === 'true') {
            return { success: true };
        }
        const apiUrl = process.env.INTERNAL_API_URL || 'http://localhost:8000/api';
        const authHeader = await getAuthHeader();
        const response = await fetch(`${apiUrl}/residential/vehicles/${encodeURIComponent(plate)}`, {
            method: 'DELETE',
            headers: authHeader
        });
        if (!response.ok) throw new Error('Error deleting vehicle');
        revalidatePath('/vehiculos');
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateVehicleData(unitId: string, plate: string, updatedData: any): Promise<{ success: boolean; error?: string }> {
    try {
        if (process.env.NEXT_PUBLIC_USE_MOCKS === 'true') {
            return { success: true };
        }
        const apiUrl = process.env.INTERNAL_API_URL || 'http://localhost:8000/api';
        const [tower, unit_number] = unitId.split('-');
        const authHeader = await getAuthHeader();
        const response = await fetch(`${apiUrl}/residential/units/${tower}/${unit_number}/vehicles/${encodeURIComponent(plate)}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', ...authHeader },
            body: JSON.stringify(updatedData),
        });
        if (!response.ok) throw new Error('Error updating vehicle');
        revalidatePath('/apartamentos');
        revalidatePath(`/apartamentos/${unitId}`);
        revalidatePath('/vehiculos');
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
