'use server';

import { revalidatePath } from 'next/cache';
import { MOCK_UNITS } from '../constants/directory.mocks';
import { getAuthHeader } from './base.actions';

export async function fetchParkingData(type?: string): Promise<any[]> {
    try {
        if (process.env.NEXT_PUBLIC_USE_MOCKS === 'true') {
            const allParking: any[] = [];
            let globalId = 1;
            (MOCK_UNITS as any[]).forEach(unit => {
                if (unit.private_parking_space) {
                    const firstVehicle = (unit.vehicles || [])[0];
                    allParking.push({
                        id: globalId++,
                        number: unit.private_parking_space.number,
                        status: unit.private_parking_space.status || 'OCUPADO',
                        type: 'PRIVADO',
                        unit: { id: unit.id, tower: unit.tower, unit_number: unit.unit_number, status: unit.status },
                        vehicle: firstVehicle ? { plate: firstVehicle.plate, type: firstVehicle.type, brand: firstVehicle.brand, model: firstVehicle.model } : null
                    });
                }
            });
            return allParking;
        }
        const apiUrl = process.env.INTERNAL_API_URL || 'http://localhost:8000/api';
        const authHeader = await getAuthHeader();
        let url = `${apiUrl}/residential/parking`;
        if (type) url += `?type=${type}`;
        const response = await fetch(url, { cache: 'no-store', headers: authHeader });
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        return [];
    }
}

export async function assignParkingToUnit(unitId: string, parkingId: number): Promise<{ success: boolean; error?: string }> {
    try {
        if (process.env.NEXT_PUBLIC_USE_MOCKS === 'true') {
            revalidatePath(`/apartamentos/${unitId}`);
            revalidatePath('/parqueaderos');
            return { success: true };
        }
        const apiUrl = process.env.INTERNAL_API_URL || 'http://localhost:8000/api';
        const [tower, unit_number] = unitId.split('-');
        const authHeader = await getAuthHeader();
        const response = await fetch(`${apiUrl}/residential/units/${tower}/${unit_number}/assign-parking?parking_id=${parkingId}`, { method: 'POST', headers: authHeader });
        if (!response.ok) throw new Error('Error assigning parking');
        revalidatePath(`/apartamentos/${unitId}`);
        revalidatePath('/parqueaderos');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function unassignParkingFromUnit(unitId: string, parkingId: number): Promise<{ success: boolean; error?: string }> {
    try {
        if (process.env.NEXT_PUBLIC_USE_MOCKS === 'true') {
            revalidatePath(`/apartamentos/${unitId}`);
            revalidatePath('/parqueaderos');
            return { success: true };
        }
        const apiUrl = process.env.INTERNAL_API_URL || 'http://localhost:8000/api';
        const [tower, unit_number] = unitId.split('-');
        const authHeader = await getAuthHeader();
        const response = await fetch(`${apiUrl}/residential/units/${tower}/${unit_number}/unassign-parking/${parkingId}`, { method: 'DELETE', headers: authHeader });
        if (response.ok) {
            revalidatePath(`/apartamentos/${unitId}`);
            revalidatePath('/parqueaderos');
        }
        return { success: response.ok };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
