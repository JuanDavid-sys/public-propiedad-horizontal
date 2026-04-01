import { auth } from '@/auth';

// Helper to get auth header
export async function getAuthHeader(): Promise<Record<string, string>> {
    const session = await auth();
    const sessionError = (session as any)?.error;
    if (sessionError === 'RefreshAccessTokenError' || sessionError === 'RefreshNetworkError') return {};
    const token = (session as any)?.backendTokens?.access_token;
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export interface ParkingData {
    id: number;
    number: string;
    status: string;
    type: string;
    unit?: {
        id: string | number;
        tower: string;
        unit_number: string;
        status: string;
    } | null;
    vehicle?: {
        plate: string;
        type: string;
        brand?: string | null;
        model?: string | null;
    } | null;
}

export interface UnitData {
    id: string | number;
    unit: string;
    tower: string;
    apartment: string;
    status: string;
    ownerCount: number;
    residentCount: number;
    leaseId: string;
    parking: string;
    parkingCount: number;
    vehicleCount: number;
    bikes: number;
    pets: number;
    tags: string;
    authorizations: string;
    observations: string;
    parkingSpaces?: ParkingData[];
    privateParkingSpace?: ParkingData | null;
    hasParkingConflict?: boolean;
    parkingIntegrityIssue?: string | null;
}

export interface VehicleData {
    id: string;
    plate: string;
    type?: string;
    brand?: string | null;
    model?: string | null;
    color?: string | null;
    tower: string;
    apartment: string;
    unit: string;
    parking?: string;
    parkingSpace?: ParkingData | null;
    status: string;
    observations?: string | null;
}

export interface PetData {
    id: number | string;
    name: string;
    species: string;
    breed?: string | null;
    color?: string | null;
    age?: string | null;
    gender: string;
    vaccinated: boolean;
    status: string;
    observations?: string | null;
    tower: string;
    apartment: string;
    unit: string;
}

export interface UnitDocument {
    id: number;
    document_type: string;
    file: string;
    original_name: string;
    mime_type: string;
    size: number;
    created_at: string;
    updated_at: string;
    isTemporary?: boolean;
    tempFile?: File;
}
