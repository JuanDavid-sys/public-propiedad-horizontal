'use server';

import { revalidatePath } from 'next/cache';
import { MOCK_UNITS } from '../constants/directory.mocks';
import { getAuthHeader, PetData } from './base.actions';

export async function fetchPetsData(): Promise<PetData[]> {
    try {
        if (process.env.NEXT_PUBLIC_USE_MOCKS === 'true') {
            const allPets: PetData[] = [];
            (MOCK_UNITS as any[]).forEach(unit => {
                (unit.pets || []).forEach((p: any) => {
                    allPets.push({
                        id: Number(p.id),
                        name: String(p.name || ''),
                        species: String(p.species || ''),
                        breed: p.breed || null,
                        color: p.color || null,
                        age: p.age || null,
                        gender: String(p.gender || 'No especificado'),
                        vaccinated: !!p.vaccinated,
                        status: String(p.status || 'Activo'),
                        observations: p.observations || null,
                        tower: String(unit.tower || ''),
                        apartment: String(unit.unit_number || ''),
                        unit: `${unit.tower}-${unit.unit_number}`,
                    });
                });
            });
            return allPets;
        }
        const apiUrl = process.env.INTERNAL_API_URL || 'http://localhost:8000/api';
        const authHeader = await getAuthHeader();
        const response = await fetch(`${apiUrl}/residential/pets`, { cache: 'no-store', headers: authHeader });
        if (!response.ok) throw new Error(`Error fetching pets`);
        const rawPets = await response.json();
        return (rawPets as any[]).map((p: any) => ({
            id: Number(p.id),
            name: String(p.name || ''),
            species: String(p.species || ''),
            breed: p.breed || null,
            color: p.color || null,
            age: p.age || null,
            gender: String(p.gender || 'No especificado'),
            vaccinated: !!p.vaccinated,
            status: String(p.status || ''),
            observations: p.observations || null,
            tower: String(p.unit?.tower || ''),
            apartment: String(p.unit?.unit_number || ''),
            unit: p.unit ? `${p.unit.tower}-${p.unit.unit_number}` : '',
        }));
    } catch (error) {
        return [];
    }
}

export async function fetchPetById(petId: number): Promise<PetData | null> {
    try {
        if (process.env.NEXT_PUBLIC_USE_MOCKS === 'true') {
            for (const unit of (MOCK_UNITS as any[])) {
                const p = (unit.pets || []).find((p: any) => Number(p.id) === Number(petId));
                if (p) return { id: Number(p.id), name: String(p.name || ''), species: String(p.species || ''), breed: p.breed || null, color: p.color || null, age: p.age || null, gender: String(p.gender || 'No especificado'), vaccinated: !!p.vaccinated, status: String(p.status || 'Activo'), observations: p.observations || null, tower: String(unit.tower || ''), apartment: String(unit.unit_number || ''), unit: `${unit.tower}-${unit.unit_number}` };
            }
            return null;
        }
        const apiUrl = process.env.INTERNAL_API_URL || 'http://localhost:8000/api';
        const authHeader = await getAuthHeader();
        const response = await fetch(`${apiUrl}/residential/pets/${petId}`, { cache: 'no-store', headers: authHeader });
        if (!response.ok) return null;
        const p = await response.json();
        return {
            id: Number(p.id),
            name: String(p.name || ''),
            species: String(p.species || ''),
            breed: p.breed || null,
            color: p.color || null,
            age: p.age || null,
            gender: String(p.gender || 'No especificado'),
            vaccinated: !!p.vaccinated,
            status: String(p.status || ''),
            observations: p.observations || null,
            tower: String(p.unit?.tower || ''),
            apartment: String(p.unit?.unit_number || ''),
            unit: p.unit ? `${p.unit.tower}-${p.unit.unit_number}` : '',
        };
    } catch (error) {
        return null;
    }
}

export async function createPetForUnit(unitId: string, petData: any): Promise<{ success: boolean; error?: string }> {
    try {
        if (process.env.NEXT_PUBLIC_USE_MOCKS === 'true') {
            return { success: true };
        }
        const apiUrl = process.env.INTERNAL_API_URL || 'http://localhost:8000/api';
        const [tower, unit_number] = unitId.split('-');
        const authHeader = await getAuthHeader();
        const response = await fetch(`${apiUrl}/residential/units/${tower}/${unit_number}/assign-pet`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeader },
            body: JSON.stringify(petData),
        });
        if (!response.ok) throw new Error('Error creating pet');
        revalidatePath('/apartamentos');
        revalidatePath(`/apartamentos/${unitId}`);
        revalidatePath('/mascotas');
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updatePetData(petId: number, petData: any): Promise<{ success: boolean; error?: string }> {
    try {
        if (process.env.NEXT_PUBLIC_USE_MOCKS === 'true') {
            return { success: true };
        }
        const apiUrl = process.env.INTERNAL_API_URL || 'http://localhost:8000/api';
        const authHeader = await getAuthHeader();
        const response = await fetch(`${apiUrl}/residential/pets/${petId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', ...authHeader },
            body: JSON.stringify(petData),
        });
        if (!response.ok) throw new Error('Error updating pet');
        revalidatePath('/apartamentos');
        revalidatePath('/mascotas');
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deletePet(petId: number): Promise<{ success: boolean; error?: string }> {
    try {
        if (process.env.NEXT_PUBLIC_USE_MOCKS === 'true') {
            return { success: true };
        }
        const apiUrl = process.env.INTERNAL_API_URL || 'http://localhost:8000/api';
        const authHeader = await getAuthHeader();
        const response = await fetch(`${apiUrl}/residential/pets/${petId}`, { method: 'DELETE', headers: authHeader });
        if (response.ok) {
            revalidatePath('/apartamentos');
            revalidatePath('/mascotas');
            revalidatePath('/', 'layout');
        }
        return { success: response.ok };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
