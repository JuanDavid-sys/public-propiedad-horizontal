'use client';

import { getLocalStorageData, setLocalStorageData, STORAGE_KEYS } from '../hooks/useLocalStorage';
import { MOCK_PEOPLE } from '../constants/directory.mocks';
import { PersonData, PersonUpdatePayload } from './people.actions';

// Initialize mock data if not exists
export function initializePeopleData() {
    if (typeof window === 'undefined') return;
    const existing = getLocalStorageData(STORAGE_KEYS.PEOPLE, null);
    if (!existing) {
        setLocalStorageData(STORAGE_KEYS.PEOPLE, MOCK_PEOPLE);
    }
}

// Get all people from localStorage
export function getPeopleFromStorage(): PersonData[] {
    const people = getLocalStorageData<any[]>(STORAGE_KEYS.PEOPLE, MOCK_PEOPLE);
    return people.map(item => ({
        id: String(item.document_number || ''),
        document_number: String(item.document_number || ''),
        first_name: item.first_name || '',
        last_name: item.last_name || '',
        document_type: String(item.document_type || ''),
        role: String(item.role || ''),
        units: Array.isArray(item.units) ? item.units.map((u: any) =>
            `${u.tower || ''}-${u.unit_number || ''}`.replace(/^-|-$/g, '')
        ).filter(Boolean) : [],
        unit_assignments: Array.isArray(item.units) ? item.units.map((u: any) => ({
            tower: String(u.tower || ''),
            unit_number: String(u.unit_number || ''),
            unit_id: `${u.tower || ''}-${u.unit_number || ''}`.replace(/^-|-$/g, ''),
            is_owner: Boolean(u.is_owner),
            is_resident: Boolean(u.is_resident),
        })) : [],
        email: String(item.email || ''),
        phone: String(item.phone || ''),
        is_minor: Boolean(item.is_minor),
        is_elderly: Boolean(item.is_elderly),
        has_disability: Boolean(item.has_disability),
        is_realtor: Boolean(item.is_realtor),
        registration_date: String(item.registration_date || ''),
        data_authorization: Boolean(item.data_authorization),
        observations: String(item.observations || ''),
    }));
}

// Get person by document
export function getPersonFromStorage(documentNumber: string): PersonData | null {
    const people = getPeopleFromStorage();
    return people.find(p => p.document_number === documentNumber) || null;
}

// Create or update person
export function savePersonToStorage(personData: any): { success: boolean; error?: string } {
    try {
        const people = getLocalStorageData<any[]>(STORAGE_KEYS.PEOPLE, MOCK_PEOPLE);

        // Check if person exists
        const existingIndex = people.findIndex(p => p.document_number === personData.document_number);

        // Format person data
        const formattedPerson = {
            first_name: personData.first_name,
            last_name: personData.last_name,
            document_number: personData.document_number,
            document_type: personData.document_type || 'CC',
            phone: personData.phone || '',
            email: personData.email || '',
            role: personData.role || 'Residente',
            data_authorization: personData.data_authorization ?? true,
            is_minor: personData.is_minor ?? false,
            is_elderly: personData.is_elderly ?? false,
            has_disability: personData.has_disability ?? false,
            is_realtor: personData.is_realtor ?? false,
            registration_date: personData.registration_date || new Date().toISOString().split('T')[0],
            observations: personData.observations || '',
            units: Array.isArray(personData.units) ? personData.units.map((u: any) => ({
                tower: u.tower || '',
                unit_number: u.unit_number || '',
                is_owner: u.is_owner ?? false,
                is_resident: u.is_resident ?? true,
            })) : [],
        };

        if (existingIndex >= 0) {
            // Update existing
            people[existingIndex] = { ...people[existingIndex], ...formattedPerson };
        } else {
            // Add new
            people.push(formattedPerson);
        }

        setLocalStorageData(STORAGE_KEYS.PEOPLE, people);
        return { success: true };
    } catch (error: any) {
        console.error('Error saving person:', error);
        return { success: false, error: error.message || 'Error al guardar la persona' };
    }
}

// Update person
export function updatePersonInStorage(documentNumber: string, updates: PersonUpdatePayload): { success: boolean; error?: string } {
    try {
        const people = getLocalStorageData<any[]>(STORAGE_KEYS.PEOPLE, MOCK_PEOPLE);
        const index = people.findIndex(p => p.document_number === documentNumber);

        if (index >= 0) {
            people[index] = { ...people[index], ...updates };
            setLocalStorageData(STORAGE_KEYS.PEOPLE, people);
            return { success: true };
        }

        return { success: false, error: 'Persona no encontrada' };
    } catch (error: any) {
        console.error('Error updating person:', error);
        return { success: false, error: error.message || 'Error al actualizar la persona' };
    }
}

// Delete person
export function deletePersonFromStorage(documentNumber: string): { success: boolean; error?: string } {
    try {
        const people = getLocalStorageData<any[]>(STORAGE_KEYS.PEOPLE, MOCK_PEOPLE);
        const filtered = people.filter(p => p.document_number !== documentNumber);

        if (filtered.length === people.length) {
            return { success: false, error: 'Persona no encontrada' };
        }

        setLocalStorageData(STORAGE_KEYS.PEOPLE, filtered);
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting person:', error);
        return { success: false, error: error.message || 'Error al eliminar la persona' };
    }
}

// Reset to original mocks
export function resetPeopleData() {
    setLocalStorageData(STORAGE_KEYS.PEOPLE, MOCK_PEOPLE);
}
