'use client';

/**
 * Demo Actions - Cliente
 *
 * Este archivo contiene funciones que se ejecutan en el cliente
 * y operan directamente sobre localStorage cuando NEXT_PUBLIC_USE_MOCKS=true.
 *
 * Estas funciones reemplazan a las server actions en modo demo.
 */

import { LocalStorageService } from '@/lib/services/localStorage.service';

const isDemoMode = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';

// Re-exportar localStorageService para uso directo
export { LocalStorageService };

// ============================================
// Helpers de revalidación (simulados en demo)
// ============================================
function mockRevalidatePath(path: string) {
  // En demo, no necesitamos revalidar ya que todo está en localStorage
  // Los hooks de React Query se encargan de refrescar los datos
  console.log(`[Demo] Revalidate path: ${path}`);
}

// ============================================
// Actions de Personas (Demo)
// ============================================

export async function createPersonDemo(personData: any): Promise<{ success: boolean; error?: string }> {
  if (!isDemoMode) {
    throw new Error('Esta función solo debe usarse en modo demo');
  }

  const result = LocalStorageService.createPerson(personData);
  if (result.success) {
    mockRevalidatePath('/personas');
    mockRevalidatePath('/apartamentos');
  }
  return result;
}

export async function updatePersonDemo(
  documentNumber: string,
  updates: any
): Promise<{ success: boolean; error?: string }> {
  if (!isDemoMode) {
    throw new Error('Esta función solo debe usarse en modo demo');
  }

  const result = LocalStorageService.updatePerson(documentNumber, updates);
  if (result.success) {
    mockRevalidatePath('/personas');
    mockRevalidatePath('/apartamentos');
    mockRevalidatePath(`/personas/${documentNumber}`);
  }
  return result;
}

export async function deletePersonDemo(documentNumber: string): Promise<{ success: boolean; error?: string }> {
  if (!isDemoMode) {
    throw new Error('Esta función solo debe usarse en modo demo');
  }

  const result = LocalStorageService.deletePerson(documentNumber);
  if (result.success) {
    mockRevalidatePath('/personas');
    mockRevalidatePath('/apartamentos');
  }
  return result;
}

// ============================================
// Actions de Mascotas (Demo)
// ============================================

export async function createPetDemo(unitId: string, petData: any): Promise<{ success: boolean; error?: string }> {
  if (!isDemoMode) {
    throw new Error('Esta función solo debe usarse en modo demo');
  }

  const [tower, apartment] = unitId.split('-');
  const result = LocalStorageService.createPet({
    ...petData,
    unit: unitId,
    tower,
    apartment,
  });

  if (result.success) {
    mockRevalidatePath('/mascotas');
    mockRevalidatePath('/apartamentos');
    mockRevalidatePath(`/apartamentos/${unitId}`);
  }
  return result;
}

export async function updatePetDemo(petId: number, updates: any): Promise<{ success: boolean; error?: string }> {
  if (!isDemoMode) {
    throw new Error('Esta función solo debe usarse en modo demo');
  }

  const result = LocalStorageService.updatePet(petId, updates);
  if (result.success) {
    mockRevalidatePath('/mascotas');
    mockRevalidatePath('/apartamentos');
  }
  return result;
}

export async function deletePetDemo(petId: number): Promise<{ success: boolean; error?: string }> {
  if (!isDemoMode) {
    throw new Error('Esta función solo debe usarse en modo demo');
  }

  const result = LocalStorageService.deletePet(petId);
  if (result.success) {
    mockRevalidatePath('/mascotas');
    mockRevalidatePath('/apartamentos');
  }
  return result;
}

// ============================================
// Actions de Vehículos (Demo)
// ============================================

export async function createVehicleDemo(vehicleData: any): Promise<{ success: boolean; error?: string }> {
  if (!isDemoMode) {
    throw new Error('Esta función solo debe usarse en modo demo');
  }

  const result = LocalStorageService.createVehicle(vehicleData);
  if (result.success) {
    mockRevalidatePath('/vehiculos');
    mockRevalidatePath('/apartamentos');
  }
  return result;
}

export async function updateVehicleDemo(plate: string, updates: any): Promise<{ success: boolean; error?: string }> {
  if (!isDemoMode) {
    throw new Error('Esta función solo debe usarse en modo demo');
  }

  const result = LocalStorageService.updateVehicle(plate, updates);
  if (result.success) {
    mockRevalidatePath('/vehiculos');
    mockRevalidatePath('/apartamentos');
  }
  return result;
}

export async function deleteVehicleDemo(plate: string): Promise<{ success: boolean; error?: string }> {
  if (!isDemoMode) {
    throw new Error('Esta función solo debe usarse en modo demo');
  }

  const result = LocalStorageService.deleteVehicle(plate);
  if (result.success) {
    mockRevalidatePath('/vehiculos');
    mockRevalidatePath('/apartamentos');
  }
  return result;
}

// ============================================
// Asignaciones en Demo
// ============================================

export async function assignPersonToUnitDemo(
  unitId: string,
  personData: { document_number: string; is_owner?: boolean; is_resident?: boolean }
): Promise<{ success: boolean; error?: string }> {
  if (!isDemoMode) {
    throw new Error('Esta función solo debe usarse en modo demo');
  }

  return LocalStorageService.assignPersonToUnit(unitId, personData);
}

export async function unassignPersonFromUnitDemo(
  unitId: string,
  documentNumber: string
): Promise<{ success: boolean; error?: string }> {
  if (!isDemoMode) {
    throw new Error('Esta función solo debe usarse en modo demo');
  }

  return LocalStorageService.unassignPersonFromUnit(unitId, documentNumber);
}

export async function assignVehicleToUnitDemo(
  unitId: string,
  vehicleData: any
): Promise<{ success: boolean; error?: string }> {
  if (!isDemoMode) {
    throw new Error('Esta función solo debe usarse en modo demo');
  }

  return LocalStorageService.assignVehicleToUnit(unitId, vehicleData);
}

export async function unassignVehicleFromUnitDemo(
  unitId: string,
  plate: string
): Promise<{ success: boolean; error?: string }> {
  if (!isDemoMode) {
    throw new Error('Esta función solo debe usarse en modo demo');
  }

  return LocalStorageService.unassignVehicleFromUnit(unitId, plate);
}

// ============================================
// Unidades en Demo
// ============================================

export async function updateUnitDemo(unitId: string, updates: any): Promise<{ success: boolean; error?: string }> {
  if (!isDemoMode) {
    throw new Error('Esta función solo debe usarse en modo demo');
  }

  return LocalStorageService.updateUnitData(unitId, updates);
}
