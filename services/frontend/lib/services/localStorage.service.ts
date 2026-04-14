'use client';

// ============================================
// LocalStorage Service - Demo Mode Persistence
// ============================================
// Este servicio permite que los datos persistan en localStorage
// durante la navegación cuando NEXT_PUBLIC_USE_MOCKS=true

const STORAGE_KEY = 'demo_residential_data_v1';

export interface DemoPerson {
  document_number: string;
  first_name: string;
  last_name: string;
  document_type: string;
  role: string;
  email?: string;
  phone?: string;
  is_minor: boolean;
  is_elderly: boolean;
  has_disability: boolean;
  is_realtor: boolean;
  registration_date?: string;
  data_authorization: boolean;
  observations?: string;
  units: { tower: string; unit_number: string; is_owner: boolean; is_resident: boolean }[];
}

export interface DemoPet {
  id: number;
  name: string;
  species: string;
  breed?: string;
  color?: string;
  age?: string;
  gender: string;
  vaccinated: boolean;
  status: string;
  observations?: string;
  unit: string;
  tower: string;
  apartment: string;
}

export interface DemoVehicle {
  plate: string;
  type: string;
  brand?: string;
  model?: string;
  color?: string;
  status: string;
  observations?: string;
  unit?: string;
  tower?: string;
  apartment?: string;
  parking_space?: { number: string; status: string } | null;
}

export interface DemoUnit {
  id: number;
  tower: string;
  unit_number: string;
  status: string;
  is_under_remodelation?: boolean;
  pet_count: number;
  bicycle_count: number;
  tags: string[];
  authorizations?: string;
  observations?: string;
  owner_count: number;
  resident_count: number;
  vehicle_count: number;
  parking_count: number;
  parking?: string;
  has_parking_conflict?: boolean;
  parking_integrity_issue?: string | null;
  private_parking_space?: { number: string; status: string } | null;
  assignments: { is_owner: boolean; is_resident: boolean; person: DemoPerson }[];
  vehicles: DemoVehicle[];
  pets: DemoPet[];
  documents?: any[];
  parking_spaces?: any[];
}

export interface DemoData {
  units: DemoUnit[];
  people: DemoPerson[];
  pets: DemoPet[];
  vehicles: DemoVehicle[];
  initialized: boolean;
  lastUpdated: string;
}

export const LocalStorageService = {
  // ============================================
  // Inicialización
  // ============================================

  isInitialized(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEY) !== null;
  },

  initWithMocks(mockUnits: any[], mockPeople: any[]): void {
    if (typeof window === 'undefined') return;
    if (this.isInitialized()) return; // Ya inicializado

    // Transformar unidades para incluir pets y vehicles anidados
    const units: DemoUnit[] = mockUnits.map(u => ({
      ...u,
      assignments: u.assignments || [],
      vehicles: u.vehicles || [],
      pets: (u.pets || []).map((p: any) => ({
        ...p,
        id: p.id || Date.now() + Math.random(),
        unit: `${u.tower}-${u.unit_number}`,
        tower: u.tower,
        apartment: u.unit_number,
      })),
    }));

    // Extraer todas las mascotas
    const allPets: DemoPet[] = [];
    units.forEach(u => {
      u.pets.forEach(p => {
        allPets.push({
          ...p,
          unit: `${u.tower}-${u.unit_number}`,
          tower: u.tower,
          apartment: u.unit_number,
        });
      });
    });

    // Extraer todos los vehículos
    const allVehicles: DemoVehicle[] = [];
    units.forEach(u => {
      u.vehicles.forEach((v: any) => {
        allVehicles.push({
          ...v,
          unit: `${u.tower}-${u.unit_number}`,
          tower: u.tower,
          apartment: u.unit_number,
        });
      });
    });

    const data: DemoData = {
      units,
      people: mockPeople.map(p => ({ ...p })),
      pets: allPets,
      vehicles: allVehicles,
      initialized: true,
      lastUpdated: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  resetToMocks(mockUnits: any[], mockPeople: any[]): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
    this.initWithMocks(mockUnits, mockPeople);
  },

  // ============================================
  // Lectura de datos
  // ============================================

  getData(): DemoData | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as DemoData;
    } catch {
      return null;
    }
  },

  getAllPeople(): DemoPerson[] {
    return this.getData()?.people || [];
  },

  getAllPets(): DemoPet[] {
    return this.getData()?.pets || [];
  },

  getAllVehicles(): DemoVehicle[] {
    return this.getData()?.vehicles || [];
  },

  getAllUnits(): DemoUnit[] {
    return this.getData()?.units || [];
  },

  getPersonByDocument(documentNumber: string): DemoPerson | undefined {
    return this.getAllPeople().find(p => p.document_number === documentNumber);
  },

  getPetById(petId: number): DemoPet | undefined {
    return this.getAllPets().find(p => p.id === petId);
  },

  getVehicleByPlate(plate: string): DemoVehicle | undefined {
    return this.getAllVehicles().find(v => v.plate.toUpperCase() === plate.toUpperCase());
  },

  getUnitById(tower: string, unitNumber: string): DemoUnit | undefined {
    return this.getAllUnits().find(u => u.tower === tower && u.unit_number === unitNumber);
  },

  // ============================================
  // Operaciones CRUD - Personas
  // ============================================

  createPerson(person: Omit<DemoPerson, 'units'> & { units?: any[] }): { success: boolean; error?: string } {
    const data = this.getData();
    if (!data) return { success: false, error: 'Datos no inicializados' };

    // Verificar duplicado
    if (data.people.find(p => p.document_number === person.document_number)) {
      return { success: false, error: 'Ya existe una persona con este documento' };
    }

    const newPerson: DemoPerson = {
      ...person,
      units: person.units && Array.isArray(person.units) ? person.units : [],
      registration_date: person.registration_date || new Date().toISOString().split('T')[0],
      is_minor: !!person.is_minor,
      is_elderly: !!person.is_elderly,
      has_disability: !!person.has_disability,
      is_realtor: !!person.is_realtor,
    };

    data.people.push(newPerson);
    this.saveData(data);
    return { success: true };
  },

  updatePerson(documentNumber: string, updates: Partial<DemoPerson>): { success: boolean; error?: string } {
    const data = this.getData();
    if (!data) return { success: false, error: 'Datos no inicializados' };

    const index = data.people.findIndex(p => p.document_number === documentNumber);
    if (index === -1) return { success: false, error: 'Persona no encontrada' };

    data.people[index] = { ...data.people[index], ...updates };
    this.saveData(data);
    return { success: true };
  },

  deletePerson(documentNumber: string): { success: boolean; error?: string } {
    const data = this.getData();
    if (!data) return { success: false, error: 'Datos no inicializados' };

    const initialLength = data.people.length;
    data.people = data.people.filter(p => p.document_number !== documentNumber);

    if (data.people.length === initialLength) {
      return { success: false, error: 'Persona no encontrada' };
    }

    // También eliminar asignaciones de unidades
    data.units.forEach(unit => {
      unit.assignments = unit.assignments.filter(a => a.person.document_number !== documentNumber);
      this.updateUnitCounts(unit);
    });

    this.saveData(data);
    return { success: true };
  },

  // ============================================
  // Operaciones CRUD - Mascotas
  // ============================================

  createPet(pet: Omit<DemoPet, 'id'> & { unit: string; tower: string; apartment: string }): { success: boolean; data?: DemoPet; error?: string } {
    const data = this.getData();
    if (!data) return { success: false, error: 'Datos no inicializados' };

    const newPet: DemoPet = {
      ...pet,
      id: Date.now() + Math.floor(Math.random() * 1000),
    };

    data.pets.push(newPet);

    // Agregar a la unidad correspondiente
    const [tower, unitNumber] = pet.unit.split('-');
    const unit = data.units.find(u => u.tower === tower && u.unit_number === unitNumber);
    if (unit) {
      unit.pets.push(newPet);
      this.updateUnitCounts(unit);
    }

    this.saveData(data);
    return { success: true, data: newPet };
  },

  updatePet(petId: number, updates: Partial<DemoPet>): { success: boolean; error?: string } {
    const data = this.getData();
    if (!data) return { success: false, error: 'Datos no inicializados' };

    const petIndex = data.pets.findIndex(p => p.id === petId);
    if (petIndex === -1) return { success: false, error: 'Mascota no encontrada' };

    const oldPet = data.pets[petIndex];
    const updatedPet = { ...oldPet, ...updates };
    data.pets[petIndex] = updatedPet;

    // Actualizar también en la unidad
    const [tower, unitNumber] = oldPet.unit.split('-');
    const unit = data.units.find(u => u.tower === tower && u.unit_number === unitNumber);
    if (unit) {
      const unitPetIndex = unit.pets.findIndex(p => p.id === petId);
      if (unitPetIndex !== -1) {
        unit.pets[unitPetIndex] = updatedPet;
      }
      this.updateUnitCounts(unit);
    }

    this.saveData(data);
    return { success: true };
  },

  deletePet(petId: number): { success: boolean; error?: string } {
    const data = this.getData();
    if (!data) return { success: false, error: 'Datos no inicializados' };

    const pet = data.pets.find(p => p.id === petId);
    if (!pet) return { success: false, error: 'Mascota no encontrada' };

    data.pets = data.pets.filter(p => p.id !== petId);

    // Eliminar también de la unidad
    const [tower, unitNumber] = pet.unit.split('-');
    const unit = data.units.find(u => u.tower === tower && u.unit_number === unitNumber);
    if (unit) {
      unit.pets = unit.pets.filter(p => p.id !== petId);
      this.updateUnitCounts(unit);
    }

    this.saveData(data);
    return { success: true };
  },

  // ============================================
  // Operaciones CRUD - Vehículos
  // ============================================

  createVehicle(vehicle: DemoVehicle): { success: boolean; error?: string } {
    const data = this.getData();
    if (!data) return { success: false, error: 'Datos no inicializados' };

    // Verificar duplicado
    if (data.vehicles.find(v => v.plate.toUpperCase() === vehicle.plate.toUpperCase())) {
      return { success: false, error: 'Ya existe un vehículo con esta placa' };
    }

    const newVehicle: DemoVehicle = {
      ...vehicle,
      plate: vehicle.plate.toUpperCase(),
    };

    data.vehicles.push(newVehicle);

    // Agregar a la unidad si tiene una asignada
    if (vehicle.unit) {
      const [tower, unitNumber] = vehicle.unit.split('-');
      const unit = data.units.find(u => u.tower === tower && u.unit_number === unitNumber);
      if (unit) {
        unit.vehicles.push(newVehicle);
        this.updateUnitCounts(unit);
      }
    }

    this.saveData(data);
    return { success: true };
  },

  updateVehicle(plate: string, updates: Partial<DemoVehicle>): { success: boolean; error?: string } {
    const data = this.getData();
    if (!data) return { success: false, error: 'Datos no inicializados' };

    const upperPlate = plate.toUpperCase();
    const vehicleIndex = data.vehicles.findIndex(v => v.plate.toUpperCase() === upperPlate);
    if (vehicleIndex === -1) return { success: false, error: 'Vehículo no encontrado' };

    const oldVehicle = data.vehicles[vehicleIndex];
    const updatedVehicle = { ...oldVehicle, ...updates };
    data.vehicles[vehicleIndex] = updatedVehicle;

    // Actualizar en la unidad anterior si cambió de unidad
    if (oldVehicle.unit && updates.unit && oldVehicle.unit !== updates.unit) {
      // Remover de unidad anterior
      const [oldTower, oldUnitNum] = oldVehicle.unit.split('-');
      const oldUnit = data.units.find(u => u.tower === oldTower && u.unit_number === oldUnitNum);
      if (oldUnit) {
        oldUnit.vehicles = oldUnit.vehicles.filter(v => v.plate.toUpperCase() !== upperPlate);
        this.updateUnitCounts(oldUnit);
      }

      // Agregar a nueva unidad
      const [newTower, newUnitNum] = updates.unit.split('-');
      const newUnit = data.units.find(u => u.tower === newTower && u.unit_number === newUnitNum);
      if (newUnit) {
        newUnit.vehicles.push(updatedVehicle);
        this.updateUnitCounts(newUnit);
      }
    } else if (oldVehicle.unit && !updates.unit) {
      // Se desasignó de la unidad
      const [tower, unitNum] = oldVehicle.unit.split('-');
      const unit = data.units.find(u => u.tower === tower && u.unit_number === unitNum);
      if (unit) {
        unit.vehicles = unit.vehicles.filter(v => v.plate.toUpperCase() !== upperPlate);
        this.updateUnitCounts(unit);
      }
      updatedVehicle.unit = undefined;
      updatedVehicle.tower = undefined;
      updatedVehicle.apartment = undefined;
    }

    this.saveData(data);
    return { success: true };
  },

  deleteVehicle(plate: string): { success: boolean; error?: string } {
    const data = this.getData();
    if (!data) return { success: false, error: 'Datos no inicializados' };

    const upperPlate = plate.toUpperCase();
    const vehicle = data.vehicles.find(v => v.plate.toUpperCase() === upperPlate);
    if (!vehicle) return { success: false, error: 'Vehículo no encontrado' };

    data.vehicles = data.vehicles.filter(v => v.plate.toUpperCase() !== upperPlate);

    // Eliminar también de la unidad
    if (vehicle.unit) {
      const [tower, unitNumber] = vehicle.unit.split('-');
      const unit = data.units.find(u => u.tower === tower && u.unit_number === unitNumber);
      if (unit) {
        unit.vehicles = unit.vehicles.filter(v => v.plate.toUpperCase() !== upperPlate);
        this.updateUnitCounts(unit);
      }
    }

    this.saveData(data);
    return { success: true };
  },

  // ============================================
  // Asignaciones - Personas a Unidades
  // ============================================

  assignPersonToUnit(
    unitId: string,
    personData: { document_number: string; is_owner?: boolean; is_resident?: boolean }
  ): { success: boolean; error?: string } {
    const data = this.getData();
    if (!data) return { success: false, error: 'Datos no inicializados' };

    const [tower, unitNumber] = unitId.split('-');
    const unit = data.units.find(u => u.tower === tower && u.unit_number === unitNumber);
    if (!unit) return { success: false, error: 'Unidad no encontrada' };

    const person = data.people.find(p => p.document_number === personData.document_number);
    if (!person) return { success: false, error: 'Persona no encontrada' };

    // Verificar si ya está asignada
    const existingAssignment = unit.assignments.find(a => a.person.document_number === personData.document_number);
    if (existingAssignment) {
      existingAssignment.is_owner = personData.is_owner ?? existingAssignment.is_owner;
      existingAssignment.is_resident = personData.is_resident ?? existingAssignment.is_resident;
    } else {
      unit.assignments.push({
        is_owner: personData.is_owner ?? false,
        is_resident: personData.is_resident ?? true,
        person: { ...person },
      });
    }

    // Actualizar unidades de la persona
    if (!person.units) person.units = [];
    const existingUnit = person.units.find(u => u.tower === tower && u.unit_number === unitNumber);
    if (existingUnit) {
      existingUnit.is_owner = personData.is_owner ?? existingUnit.is_owner;
      existingUnit.is_resident = personData.is_resident ?? existingUnit.is_resident;
    } else {
      person.units.push({
        tower,
        unit_number: unitNumber,
        is_owner: personData.is_owner ?? false,
        is_resident: personData.is_resident ?? true,
      });
    }

    this.updateUnitCounts(unit);
    this.saveData(data);
    return { success: true };
  },

  unassignPersonFromUnit(unitId: string, documentNumber: string): { success: boolean; error?: string } {
    const data = this.getData();
    if (!data) return { success: false, error: 'Datos no inicializados' };

    const [tower, unitNumber] = unitId.split('-');
    const unit = data.units.find(u => u.tower === tower && u.unit_number === unitNumber);
    if (!unit) return { success: false, error: 'Unidad no encontrada' };

    unit.assignments = unit.assignments.filter(a => a.person.document_number !== documentNumber);

    // Actualizar unidades de la persona
    const person = data.people.find(p => p.document_number === documentNumber);
    if (person) {
      person.units = person.units.filter(u => !(u.tower === tower && u.unit_number === unitNumber));
    }

    this.updateUnitCounts(unit);
    this.saveData(data);
    return { success: true };
  },

  // ============================================
  // Asignaciones - Vehículos a Unidades
  // ============================================

  assignVehicleToUnit(unitId: string, vehicleData: DemoVehicle): { success: boolean; error?: string } {
    const data = this.getData();
    if (!data) return { success: false, error: 'Datos no inicializados' };

    const [tower, unitNumber] = unitId.split('-');
    const unit = data.units.find(u => u.tower === tower && u.unit_number === unitNumber);
    if (!unit) return { success: false, error: 'Unidad no encontrada' };

    const existingVehicle = data.vehicles.find(v => v.plate.toUpperCase() === vehicleData.plate.toUpperCase());

    if (existingVehicle) {
      // Actualizar vehículo existente
      const oldUnit = existingVehicle.unit;
      existingVehicle.unit = unitId;
      existingVehicle.tower = tower;
      existingVehicle.apartment = unitNumber;

      // Remover de unidad anterior si existe
      if (oldUnit && oldUnit !== unitId) {
        const [oldTower, oldUnitNum] = oldUnit.split('-');
        const oldUnitObj = data.units.find(u => u.tower === oldTower && u.unit_number === oldUnitNum);
        if (oldUnitObj) {
          oldUnitObj.vehicles = oldUnitObj.vehicles.filter(v => v.plate.toUpperCase() !== vehicleData.plate.toUpperCase());
          this.updateUnitCounts(oldUnitObj);
        }
      }

      // Agregar a nueva unidad si no está ya
      if (!unit.vehicles.find(v => v.plate.toUpperCase() === vehicleData.plate.toUpperCase())) {
        unit.vehicles.push(existingVehicle);
      }
    } else {
      // Crear nuevo vehículo
      const newVehicle: DemoVehicle = {
        ...vehicleData,
        plate: vehicleData.plate.toUpperCase(),
        unit: unitId,
        tower,
        apartment: unitNumber,
      };
      data.vehicles.push(newVehicle);
      unit.vehicles.push(newVehicle);
    }

    this.updateUnitCounts(unit);
    this.saveData(data);
    return { success: true };
  },

  unassignVehicleFromUnit(unitId: string, plate: string): { success: boolean; error?: string } {
    const data = this.getData();
    if (!data) return { success: false, error: 'Datos no inicializados' };

    const [tower, unitNumber] = unitId.split('-');
    const unit = data.units.find(u => u.tower === tower && u.unit_number === unitNumber);
    if (!unit) return { success: false, error: 'Unidad no encontrada' };

    const upperPlate = plate.toUpperCase();
    unit.vehicles = unit.vehicles.filter(v => v.plate.toUpperCase() !== upperPlate);

    const vehicle = data.vehicles.find(v => v.plate.toUpperCase() === upperPlate);
    if (vehicle) {
      vehicle.unit = undefined;
      vehicle.tower = undefined;
      vehicle.apartment = undefined;
    }

    this.updateUnitCounts(unit);
    this.saveData(data);
    return { success: true };
  },

  // ============================================
  // Actualización de Unidades
  // ============================================

  updateUnitData(unitId: string, updates: Partial<DemoUnit>): { success: boolean; error?: string } {
    const data = this.getData();
    if (!data) return { success: false, error: 'Datos no inicializados' };

    const [tower, unitNumber] = unitId.split('-');
    const unit = data.units.find(u => u.tower === tower && u.unit_number === unitNumber);
    if (!unit) return { success: false, error: 'Unidad no encontrada' };

    Object.assign(unit, updates);
    this.updateUnitCounts(unit);
    this.saveData(data);
    return { success: true };
  },

  updateUnitCounts(unit: DemoUnit): void {
    unit.owner_count = unit.assignments.filter(a => a.is_owner).length;
    unit.resident_count = unit.assignments.filter(a => a.is_resident).length;
    unit.vehicle_count = unit.vehicles.length;
    unit.pet_count = unit.pets.length;
    unit.bicycle_count = unit.vehicles.filter(v => v.type === 'Bicicleta').length;
    unit.parking_count = unit.parking_spaces?.length || (unit.private_parking_space ? 1 : 0);
  },

  // ============================================
  // Guardado interno
  // ============================================

  saveData(data: DemoData): void {
    if (typeof window === 'undefined') return;
    data.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

    // Disparar evento para notificar cambios
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
  },
};

// Hook para detectar cambios en localStorage
export function subscribeToStorageChanges(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handler = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      callback();
    }
  };

  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}
