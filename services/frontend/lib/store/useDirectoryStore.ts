import { create } from 'zustand';

interface DirectoryState {
    // Apartamentos
    searchTerm: string;
    selectedTower: string;
    selectedStatus: string;
    apartmentFilter: string;
    setSearchTerm: (term: string) => void;
    setSelectedTower: (tower: string) => void;
    setSelectedStatus: (status: string) => void;
    setApartmentFilter: (apt: string) => void;

    // Personas
    personaSearch: string;
    personaRole: string;
    personaTower: string;
    setPersonaSearch: (val: string) => void;
    setPersonaRole: (val: string) => void;
    setPersonaTower: (val: string) => void;

    // Vehiculos
    vehiculoSearch: string;
    vehiculoTower: string;
    setVehiculoSearch: (val: string) => void;
    setVehiculoTower: (val: string) => void;

    // Mascotas
    mascotaSearch: string;
    mascotaTower: string;
    setMascotaSearch: (val: string) => void;
    setMascotaTower: (val: string) => void;

    // Parqueaderos
    parqueaderoSearch: string;
    parqueaderoUnitSearch: string;
    parqueaderoStatus: string;
    setParqueaderoSearch: (val: string) => void;
    setParqueaderoUnitSearch: (val: string) => void;
    setParqueaderoStatus: (val: string) => void;

    resetFilters: () => void;
}

export const useDirectoryStore = create<DirectoryState>((set) => ({
    // Apartamentos
    searchTerm: '',
    selectedTower: '1',
    selectedStatus: 'Cualquiera',
    apartmentFilter: '',
    setSearchTerm: (term) => set({ searchTerm: term }),
    setSelectedTower: (tower) => set({ selectedTower: tower }),
    setSelectedStatus: (status) => set({ selectedStatus: status }),
    setApartmentFilter: (apt) => set({ apartmentFilter: apt }),

    // Personas
    personaSearch: '',
    personaRole: 'Cualquiera',
    personaTower: 'Cualquiera',
    setPersonaSearch: (personaSearch) => set({ personaSearch }),
    setPersonaRole: (personaRole) => set({ personaRole }),
    setPersonaTower: (personaTower) => set({ personaTower }),

    // Vehiculos
    vehiculoSearch: '',
    vehiculoTower: 'Cualquiera',
    setVehiculoSearch: (vehiculoSearch) => set({ vehiculoSearch }),
    setVehiculoTower: (vehiculoTower) => set({ vehiculoTower }),

    // Mascotas
    mascotaSearch: '',
    mascotaTower: 'Cualquiera',
    setMascotaSearch: (mascotaSearch) => set({ mascotaSearch }),
    setMascotaTower: (mascotaTower) => set({ mascotaTower }),

    // Parqueaderos
    parqueaderoSearch: '',
    parqueaderoUnitSearch: '',
    parqueaderoStatus: 'Cualquiera',
    setParqueaderoSearch: (parqueaderoSearch) => set({ parqueaderoSearch }),
    setParqueaderoUnitSearch: (parqueaderoUnitSearch) => set({ parqueaderoUnitSearch }),
    setParqueaderoStatus: (parqueaderoStatus) => set({ parqueaderoStatus }),

    resetFilters: () => set({
        searchTerm: '',
        selectedTower: '1',
        selectedStatus: 'Cualquiera',
        apartmentFilter: '',
        personaSearch: '',
        personaRole: 'Cualquiera',
        personaTower: 'Cualquiera',
        vehiculoSearch: '',
        vehiculoTower: 'Cualquiera',
        mascotaSearch: '',
        mascotaTower: 'Cualquiera',
        parqueaderoSearch: '',
        parqueaderoUnitSearch: '',
        parqueaderoStatus: 'Cualquiera',
    }),
}));
