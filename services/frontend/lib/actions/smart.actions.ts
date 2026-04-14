'use client';

import { 
  fetchPeopleData as originalFetchPeopleData,
  fetchPersonByDocument as originalFetchPersonByDocument,
  createPerson as originalCreatePerson,
  updatePersonData as originalUpdatePersonData,
  deletePerson as originalDeletePerson 
} from './people.actions';
import { 
  fetchPetsData as originalFetchPetsData,
  fetchPetById as originalFetchPetById,
  createPetForUnit as originalCreatePetForUnit,
  updatePetData as originalUpdatePetData,
  deletePet as originalDeletePet 
} from './pet.actions';
import { 
  fetchVehicleByPlate as originalFetchVehicleByPlate,
  fetchVehiclesData as originalFetchVehiclesData,
  fetchVehicleByUnitAndPlate as originalFetchVehicleByUnitAndPlate,
  assignVehicleToUnit as originalAssignVehicleToUnit,
  unassignVehicleFromUnit as originalUnassignVehicleFromUnit,
  updateVehicleData as originalUpdateVehicleData,
  deleteVehicleByPlate as originalDeleteVehicleByPlate 
} from './vehicle.actions';
import { 
  fetchDirectoryData as originalFetchDirectoryData,
  fetchUnitDetail as originalFetchUnitDetail,
  updateUnitData as originalUpdateUnitData,
  assignPersonToUnit as originalAssignPersonToUnit,
  unassignPersonFromUnit as originalUnassignPersonFromUnit 
} from './unit.actions';
import { 
  fetchParkingData as originalFetchParkingData,
  assignParkingToUnit as originalAssignParkingToUnit,
  unassignParkingFromUnit as originalUnassignParkingFromUnit 
} from './parking.actions';
import { LocalStorageService } from '@/lib/services/localStorage.service';

const isDemoMode = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';

// ============================================
// DIRECTORIO Y UNIDADES
// ============================================

export const fetchDirectoryData = async () => {
  if (isDemoMode) {
    const units = LocalStorageService.getAllUnits();
    return units.map((item: any, index: number) => ({
      id: index + 1,
      unit: `${item.tower}-${item.unit_number}`,
      tower: String(item.tower || ''),
      apartment: String(item.unit_number || ''),
      status: String(item.status || ''),
      ownerCount: Number(item.owner_count || 0),
      residentCount: Number(item.resident_count || 0),
      leaseId: '',
      parking: item.private_parking_space?.number || '',
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
  return await originalFetchDirectoryData();
};

export const fetchUnitDetail = async (tower: string, unitNumber: string) => {
  if (isDemoMode) {
    const rawData = LocalStorageService.getUnitById(tower, unitNumber);
    if (!rawData) return null;
    
    return {
      ...rawData,
      id: `${tower}-${unitNumber}`,
      unit: `${tower}-${unitNumber}`,
      tower,
      apartment: unitNumber,
      leaseId: rawData.authorizations || '',
      parking: rawData.parking || rawData.private_parking_space?.number || '',
      parkingCount: Number(rawData.parking_count || 0),
      isUnderRemodelation: !!rawData.is_under_remodelation,
      petCount: Number(rawData.pet_count || 0),
      bikeCount: Number(rawData.bicycle_count || 0),
      hasParkingConflict: !!rawData.has_parking_conflict,
      parkingIntegrityIssue: rawData.parking_integrity_issue || null,
      privateParkingSpace: rawData.private_parking_space ? {
        id: rawData.id * 1000,
        number: rawData.private_parking_space.number,
        status: rawData.private_parking_space.status || 'OCUPADO',
        type: 'PRIVADO'
      } : null,
      pets: Array.isArray(rawData.pets) ? rawData.pets : [],
      vehicles: (Array.isArray(rawData.vehicles) ? rawData.vehicles : []).map((v: any) => ({
        ...v,
        parkingSpace: v.parking_space ? {
          id: Math.random() * 1000,
          number: v.parking_space.number,
          status: 'OCUPADO',
          type: 'PRIVADO'
        } : null
      })),
      documents: Array.isArray(rawData.documents) ? rawData.documents : [],
      parkingSpaces: rawData.private_parking_space ? [{
        id: rawData.id * 1000,
        number: rawData.private_parking_space.number,
        status: rawData.private_parking_space.status || 'OCUPADO',
        type: 'PRIVADO'
      }] : []
    };
  }
  return await originalFetchUnitDetail(tower, unitNumber);
};

// ============================================
// PERSONAS
// ============================================

export const fetchPeopleData = async () => {
  if (isDemoMode) {
    const people = LocalStorageService.getAllPeople();
    return people.map(p => ({
      ...p,
      id: p.document_number,
      units: (p.units || []).map(u => `${u.tower}-${u.unit_number}`),
      unit_assignments: (p.units || []).map(u => ({
        tower: u.tower,
        unit_number: u.unit_number,
        unit_id: `${u.tower}-${u.unit_number}`,
        is_owner: u.is_owner,
        is_resident: u.is_resident,
      })),
      email: p.email || '',
      phone: p.phone || '',
      registration_date: p.registration_date || '',
      observations: p.observations || '',
    }));
  }
  return await originalFetchPeopleData();
};

export const fetchPersonByDocument = async (documentNumber: string) => {
  if (isDemoMode) {
    const person = LocalStorageService.getPersonByDocument(documentNumber);
    if (!person) return null;
    return {
      ...person,
      id: person.document_number,
      units: (person.units || []).map(u => `${u.tower}-${u.unit_number}`),
      unit_assignments: (person.units || []).map(u => ({
        tower: u.tower,
        unit_number: u.unit_number,
        unit_id: `${u.tower}-${u.unit_number}`,
        is_owner: u.is_owner,
        is_resident: u.is_resident,
      })),
      email: person.email || '',
      phone: person.phone || '',
      registration_date: person.registration_date || '',
      observations: person.observations || '',
    };
  }
  return await originalFetchPersonByDocument(documentNumber);
};

export const createPerson = async (personData: any) => {
  if (isDemoMode) {
    return LocalStorageService.createPerson(personData);
  }
  return await originalCreatePerson(personData);
};

export const updatePersonData = async (documentNumber: string, updates: any) => {
  if (isDemoMode) {
    return LocalStorageService.updatePerson(documentNumber, updates);
  }
  return await originalUpdatePersonData(documentNumber, updates);
};

export const deletePerson = async (documentNumber: string) => {
  if (isDemoMode) {
    return LocalStorageService.deletePerson(documentNumber);
  }
  return await originalDeletePerson(documentNumber);
};

// ============================================
// MASCOTAS
// ============================================

export const fetchPetsData = async () => {
  if (isDemoMode) {
    return LocalStorageService.getAllPets();
  }
  return await originalFetchPetsData();
};

export const fetchPetById = async (id: number) => {
  if (isDemoMode) {
    return LocalStorageService.getPetById(id);
  }
  return await originalFetchPetById(id);
};

export const createPetForUnit = async (unitId: string, petData: any) => {
  if (isDemoMode) {
    const [tower, apartment] = unitId.split('-');
    return LocalStorageService.createPet({
      ...petData,
      unit: unitId,
      tower,
      apartment,
    });
  }
  return await originalCreatePetForUnit(unitId, petData);
};

export const updatePetData = async (petId: number, updates: any) => {
  if (isDemoMode) {
    return LocalStorageService.updatePet(petId, updates);
  }
  return await originalUpdatePetData(petId, updates);
};

export const deletePet = async (petId: number) => {
  if (isDemoMode) {
    return LocalStorageService.deletePet(petId);
  }
  return await originalDeletePet(petId);
};

// ============================================
// VEHÍCULOS
// ============================================

export const fetchVehicleByPlate = async (plate: string) => {
  if (isDemoMode) {
    const vehicle = LocalStorageService.getVehicleByPlate(plate);
    if (!vehicle) return null;
    return {
      ...vehicle,
      id: `VH-${vehicle.plate}`,
      parkingSpace: vehicle.parking_space ? {
        id: Math.random() * 1000,
        number: vehicle.parking_space.number,
        status: 'OCUPADO',
        type: 'PRIVADO'
      } : null,
      parking: vehicle.parking_space?.number || '',
    };
  }
  return await originalFetchVehicleByPlate(plate);
};

export const fetchVehicleDetailByPlate = async (plate: string) => {
  return await fetchVehicleByPlate(plate);
};

export const fetchVehiclesData = async () => {
  if (isDemoMode) {
    const vehicles = LocalStorageService.getAllVehicles();
    return vehicles.map(v => ({
      ...v,
      id: v.unit ? `${v.plate}-${v.unit}` : `${v.plate}-unassigned`,
      parkingSpace: v.parking_space ? {
        id: Math.random() * 1000,
        number: v.parking_space.number,
        status: 'OCUPADO',
        type: 'PRIVADO'
      } : null,
      parking: v.parking_space?.number || '',
    }));
  }
  return await originalFetchVehiclesData();
};

export const fetchVehicleByUnitAndPlate = async (unitId: string, plate: string) => {
  if (isDemoMode) {
    const vehicle = LocalStorageService.getVehicleByPlate(plate);
    if (!vehicle) return null;
    return {
      ...vehicle,
      id: `VH-${vehicle.plate}`,
      parkingSpace: vehicle.parking_space ? {
        id: Math.random() * 1000,
        number: vehicle.parking_space.number,
        status: 'OCUPADO',
        type: 'PRIVADO'
      } : null,
      parking: vehicle.parking_space?.number || '',
    };
  }
  return await originalFetchVehicleByUnitAndPlate(unitId, plate);
};

export const assignVehicleToUnit = async (unitId: string, vehicleData: any) => {
  if (isDemoMode) {
    return LocalStorageService.assignVehicleToUnit(unitId, vehicleData);
  }
  return await originalAssignVehicleToUnit(unitId, vehicleData);
};

export const unassignVehicleFromUnit = async (unitId: string, plate: string) => {
  if (isDemoMode) {
    return LocalStorageService.unassignVehicleFromUnit(unitId, plate);
  }
  return await originalUnassignVehicleFromUnit(unitId, plate);
};

export const updateVehicleData = async (unitId: string, plate: string, updates: any) => {
  if (isDemoMode) {
    return LocalStorageService.updateVehicle(plate, updates);
  }
  return await originalUpdateVehicleData(unitId, plate, updates);
};

export const deleteVehicleByPlate = async (plate: string) => {
  if (isDemoMode) {
    return LocalStorageService.deleteVehicle(plate);
  }
  return await originalDeleteVehicleByPlate(plate);
};

// ============================================
// PARQUEADEROS
// ============================================

export const fetchParkingData = async (type?: string) => {
  if (isDemoMode) {
    const units = LocalStorageService.getAllUnits();
    const allParking: any[] = [];
    let globalId = 1;

    units.forEach(unit => {
      if (unit.private_parking_space) {
        const firstVehicle = unit.vehicles?.[0];
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
    return type ? allParking.filter(p => p.type === type) : allParking;
  }
  return await originalFetchParkingData(type);
};

export const assignParkingToUnit = async (unitId: string, parkingId: number) => {
  if (isDemoMode) {
    return { success: true };
  }
  return await originalAssignParkingToUnit(unitId, parkingId);
};

export const unassignParkingFromUnit = async (unitId: string, parkingId: number) => {
  if (isDemoMode) {
    return { success: true };
  }
  return await originalUnassignParkingFromUnit(unitId, parkingId);
};

// ============================================
// ASIGNACIONES Y UNIDADES
// ============================================

export const updateUnitData = async (unitId: string, updates: any) => {
  if (isDemoMode) {
    return LocalStorageService.updateUnitData(unitId, updates);
  }
  return await originalUpdateUnitData(unitId, updates);
};

export const assignPersonToUnit = async (unitId: string, personData: any) => {
  if (isDemoMode) {
    return LocalStorageService.assignPersonToUnit(unitId, personData);
  }
  return await originalAssignPersonToUnit(unitId, personData);
};

export const unassignPersonFromUnit = async (unitId: string, documentNumber: string) => {
  if (isDemoMode) {
    return LocalStorageService.unassignPersonFromUnit(unitId, documentNumber);
  }
  return await originalUnassignPersonFromUnit(unitId, documentNumber);
};
