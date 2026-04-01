export type VehicleVisualKind = 'bicycle' | 'motorbike' | 'car';

function normalizeVehicleType(type?: string | null) {
    return (type || '').trim().toLowerCase();
}

export function getVehicleVisualKind(type?: string | null): VehicleVisualKind {
    const normalizedType = normalizeVehicleType(type);

    if (normalizedType === 'bicicleta') {
        return 'bicycle';
    }

    if (normalizedType === 'motocicleta') {
        return 'motorbike';
    }

    return 'car';
}

export function isBicycleType(type?: string | null) {
    return getVehicleVisualKind(type) === 'bicycle';
}

export function isMotorbikeType(type?: string | null) {
    return getVehicleVisualKind(type) === 'motorbike';
}
