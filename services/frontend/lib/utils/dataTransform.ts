import { countValidItems } from "@/lib/utils";

export function transformToPersonas(data: any[]) {
    const personas: any[] = [];
    let idCounter = 1;

    data.forEach(unit => {
        // Extraer Propietarios (ahora son IDs/CC)
        if (unit.owner && typeof unit.owner === 'string' && unit.owner.toLowerCase() !== 'n/a') {
            unit.owner.split(',').forEach((id: string) => {
                const trimmedId = id.trim();
                if (trimmedId) {
                    personas.push({
                        id: idCounter++,
                        name: `Ciudadano ${trimmedId}`,
                        cc: trimmedId,
                        role: 'Propietario',
                        unit: unit.unit,
                        tower: unit.unit.split('-')[0],
                        apartment: unit.unit.split('-')[1]
                    });
                }
            });
        }

        // Extraer Residentes (ahora son IDs/CC)
        if (unit.residents && typeof unit.residents === 'string' && unit.residents.toLowerCase() !== 'n/a') {
            unit.residents.split(',').forEach((id: string) => {
                const trimmedId = id.trim();
                if (trimmedId && !personas.find(p => p.cc === trimmedId && p.unit === unit.unit)) {
                    personas.push({
                        id: idCounter++,
                        name: `Ciudadano ${trimmedId}`,
                        cc: trimmedId,
                        role: 'Residente',
                        unit: unit.unit,
                        tower: unit.unit.split('-')[0],
                        apartment: unit.unit.split('-')[1]
                    });
                }
            });
        }
    });

    return personas;
}

export function transformToVehiculos(data: any[]) {
    const vehiculos: any[] = [];
    let idCounter = 1;

    data.forEach(unit => {
        if (unit.vehicles && typeof unit.vehicles === 'string' && unit.vehicles.toLowerCase() !== 'n/a') {
            unit.vehicles.split(',').forEach((plate: string) => {
                const trimmedPlate = plate.trim();
                if (trimmedPlate) {
                    vehiculos.push({
                        id: idCounter++,
                        plate: trimmedPlate.toUpperCase(),
                        unit: unit.unit,
                        tower: unit.unit.split('-')[0],
                        apartment: unit.unit.split('-')[1],
                        parking: unit.parking
                    });
                }
            });
        }
    });

    return vehiculos;
}

export function transformToMascotas(data: any[]) {
    const mascotas: any[] = [];
    let idCounter = 1;

    data.forEach(unit => {
        const count = Number(unit.pets || 0);
        if (!isNaN(count) && count > 0) {
            for (let i = 0; i < count; i++) {
                mascotas.push({
                    id: idCounter++,
                    name: `Mascota ${i + 1}`, // No tenemos nombres en el JSON actual
                    type: 'No especificado',
                    unit: unit.unit,
                    tower: unit.unit.split('-')[0],
                    apartment: unit.unit.split('-')[1]
                });
            }
        }
    });

    return mascotas;
}

export function transformToParqueaderos(data: any[]) {
    const parqueaderos: any[] = [];
    let idCounter = 1;

    data.forEach(unit => {
        if (unit.parking && typeof unit.parking === 'string' && unit.parking.toLowerCase() !== 'n/a') {
            unit.parking.split(',').forEach((slot: string) => {
                const trimmedSlot = slot.trim();
                if (trimmedSlot) {
                    parqueaderos.push({
                        id: idCounter++,
                        spot: trimmedSlot.toUpperCase(),
                        unit: unit.unit,
                        tower: unit.unit.split('-')[0],
                        apartment: unit.unit.split('-')[1],
                        status: 'Asignado'
                    });
                }
            });
        }
    });

    return parqueaderos;
}
