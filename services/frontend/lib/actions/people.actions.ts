'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '../../auth';
import { MOCK_PEOPLE } from '../constants/directory.mocks';


async function getAuthHeader(): Promise<Record<string, string>> {
    const session = await auth();
    const sessionError = (session as any)?.error;

    if (sessionError === 'RefreshAccessTokenError') {
        console.warn('Server action blocked due to invalid refresh token.');
        return {};
    }

    if (sessionError === 'RefreshNetworkError') {
        console.warn('Server action blocked due to refresh network error.');
        return {};
    }

    const token = (session as any)?.backendTokens?.access_token;
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export interface PersonData {
    id: string;
    document_number: string;
    first_name: string;
    last_name: string;
    document_type: string;
    role: string;
    units: string[];
    unit_assignments: PersonUnitAssignment[];
    email: string;
    phone: string;
    is_minor: boolean;
    is_elderly: boolean;
    has_disability: boolean;
    is_realtor: boolean;
    registration_date: string;
    data_authorization: boolean;
    observations: string;
}

export interface PersonUnitAssignment {
    tower: string;
    unit_number: string;
    unit_id: string;
    is_owner: boolean;
    is_resident: boolean;
}

interface RawPersonUnitAssignment {
    tower?: string;
    unit_number?: string;
    is_owner?: boolean;
    is_resident?: boolean;
}

interface RawPersonData {
    document_number?: string;
    first_name?: string;
    last_name?: string;
    document_type?: string;
    role?: string;
    units?: RawPersonUnitAssignment[];
    email?: string;
    phone?: string;
    is_minor?: boolean;
    is_elderly?: boolean;
    has_disability?: boolean;
    is_realtor?: boolean;
    registration_date?: string;
    data_authorization?: boolean;
    observations?: string;
}

function mapPersonUnitAssignment(unit: RawPersonUnitAssignment): PersonUnitAssignment {
    const tower = String(unit?.tower || '');
    const unit_number = String(unit?.unit_number || '');

    return {
        tower,
        unit_number,
        unit_id: [tower, unit_number].filter(Boolean).join('-'),
        is_owner: Boolean(unit.is_owner),
        is_resident: Boolean(unit.is_resident),
    };
}

function mapPersonData(item: RawPersonData): PersonData {
    const unitAssignments = Array.isArray(item?.units)
        ? item.units.map(mapPersonUnitAssignment)
        : [];

    return {
        id: String(item.document_number || ''),
        document_number: String(item.document_number || ''),
        first_name: item.first_name || '',
        last_name: item.last_name || '',
        document_type: String(item.document_type || ''),
        role: String(item.role || ''),
        units: unitAssignments.map((unit) => unit.unit_id).filter(Boolean),
        unit_assignments: unitAssignments,
        email: String(item.email || ''),
        phone: String(item.phone || ''),
        is_minor: Boolean(item.is_minor),
        is_elderly: Boolean(item.is_elderly),
        has_disability: Boolean(item.has_disability),
        is_realtor: Boolean(item.is_realtor),
        registration_date: String(item.registration_date || ''),
        data_authorization: Boolean(item.data_authorization),
        observations: String(item.observations || ''),
    };
}

export interface PersonUpdatePayload {
    first_name?: string;
    last_name?: string;
    email?: string | null;
    phone?: string | null;
    is_minor?: boolean;
    is_elderly?: boolean;
    has_disability?: boolean;
    is_realtor?: boolean;
    data_authorization?: boolean;
    observations?: string | null;
}

export async function fetchPeopleData(): Promise<PersonData[]> {
    try {
        const apiUrl = process.env.INTERNAL_API_URL || 'http://localhost:8000/api';
        const authHeader = await getAuthHeader();

        if (process.env.NEXT_PUBLIC_USE_MOCKS === 'true') {
            return (MOCK_PEOPLE as RawPersonData[]).map(mapPersonData);
        }

        const response = await fetch(`${apiUrl}/residential/people`, {
            cache: 'no-store',
            headers: authHeader
        });


        if (!response.ok) {
            throw new Error(`Error fetching people: ${response.statusText}`);
        }

        const rawData: RawPersonData[] = await response.json();

        return rawData.map(mapPersonData);
    } catch (error) {
        console.error('Error al obtener datos de personas del backend:', error);
        return [];
    }
}

export async function fetchPersonByDocument(documentNumber: string): Promise<PersonData | null> {
    try {
        const apiUrl = process.env.INTERNAL_API_URL || 'http://localhost:8000/api';
        const authHeader = await getAuthHeader();

        if (process.env.NEXT_PUBLIC_USE_MOCKS === 'true') {
            const item = (MOCK_PEOPLE as RawPersonData[]).find(p => p.document_number === documentNumber);
            return item ? mapPersonData(item) : null;
        }

        const response = await fetch(`${apiUrl}/residential/people/${documentNumber}`, {
            cache: 'no-store',
            headers: authHeader
        });


        if (!response.ok) return null;

        const item: RawPersonData = await response.json();

        return mapPersonData(item);
    } catch (error) {
        console.error(`Error al obtener persona ${documentNumber}:`, error);
        return null;
    }
}

export async function updatePersonData(documentNumber: string, updatedData: PersonUpdatePayload): Promise<{ success: boolean; error?: string }> {
    try {
        if (process.env.NEXT_PUBLIC_USE_MOCKS === 'true') {
            return { success: true };
        }
        const apiUrl = process.env.INTERNAL_API_URL || 'http://localhost:8000/api';

        const authHeader = await getAuthHeader();

        const response = await fetch(`${apiUrl}/residential/people/${documentNumber}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                ...authHeader
            },
            body: JSON.stringify(updatedData),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error updating person: ${response.statusText}`);
        }

        revalidatePath('/apartamentos');
        revalidatePath('/personas');
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error: any) {
        console.error('Error al actualizar la persona:', error);
        return { success: false, error: error.message || 'Ocurrió un error al intentar guardar los datos.' };
    }
}

export async function createPerson(personData: any): Promise<{ success: boolean; error?: string }> {
    try {
        if (process.env.NEXT_PUBLIC_USE_MOCKS === 'true') {
            return { success: true };
        }
        const apiUrl = process.env.INTERNAL_API_URL || 'http://localhost:8000/api';

        const authHeader = await getAuthHeader();

        const response = await fetch(`${apiUrl}/residential/people`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...authHeader
            },
            body: JSON.stringify(personData),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { success: false, error: errorData.message || `Error status: ${response.status}` };
        }

        revalidatePath('/apartamentos');
        revalidatePath('/personas');
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error: any) {
        console.error('Error al crear persona:', error);
        return { success: false, error: error.message || 'Error al crear el registro de la persona.' };
    }
}

export async function deletePerson(documentNumber: string): Promise<{ success: boolean; error?: string }> {
    try {
        if (process.env.NEXT_PUBLIC_USE_MOCKS === 'true') {
            return { success: true };
        }
        const apiUrl = process.env.INTERNAL_API_URL || 'http://localhost:8000/api';

        const authHeader = await getAuthHeader();

        const response = await fetch(`${apiUrl}/residential/people/${documentNumber}`, {
            method: 'DELETE',
            headers: authHeader
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error deleting person: ${response.statusText}`);
        }

        revalidatePath('/apartamentos');
        revalidatePath('/personas');
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error: any) {
        console.error('Error al eliminar la persona:', error);
        return { success: false, error: error.message || 'Ocurrió un error al intentar eliminar el registro.' };
    }
}
