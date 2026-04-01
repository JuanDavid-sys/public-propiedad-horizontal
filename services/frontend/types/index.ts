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
}

export interface Person {
    id: string;
    name: string;
    document: string;
    role: 'Propietario' | 'Residente' | 'Visitante';
    email?: string;
    phone?: string;
}

export interface Vehicle {
    id: string;
    plate: string;
    brand: string;
    model: string;
    color: string;
}
