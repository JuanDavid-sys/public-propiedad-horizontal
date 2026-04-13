import type { UnitDocument } from '@/lib/actions/base.actions';

export type PersonItem = {
    document_number: string;
    first_name: string;
    last_name: string;
    document_type?: string;
    is_minor?: boolean;
    email?: string;
    phone?: string;
    is_elderly?: boolean;
    has_disability?: boolean;
    is_realtor?: boolean;
    data_authorization?: boolean;
    observations?: string;
    role?: string;
};

export type VehicleItem = {
    plate: string;
    type?: string;
    status?: string;
};

export type PetItem = {
    id: number | string;
    name: string;
    type?: string;
    species?: string;
    observations?: string | null;
};

export type ParkingItem = {
    id: number;
    [key: string]: unknown;
};

export type UnitLists = {
    owners: PersonItem[];
    residents: PersonItem[];
    vehicles: VehicleItem[];
    bicycles: VehicleItem[];
    tags: string[];
    pets: PetItem[];
    parkingSpaces: ParkingItem[];
};

export type PersonListType = 'owners' | 'residents';
export type VehicleListType = 'vehicles' | 'bicycles';

export type SearchPersonItem = {
    documentNumber: string;
    name?: string;
    documentType?: string;
    is_minor?: boolean;
    email?: string;
    phone?: string;
    is_elderly?: boolean;
    has_disability?: boolean;
    is_realtor?: boolean;
    data_authorization?: boolean;
    observations?: string;
    role?: string;
    [key: string]: unknown;
};

export type SearchVehicleItem = {
    plate: string;
    type?: string;
    [key: string]: unknown;
};

export type SearchPetItem = {
    name: string;
    type?: string;
    species?: string;
    [key: string]: unknown;
};

export type SearchParkingItem = ParkingItem;

interface AddListItemResult {
    lists: UnitLists;
    targetList: keyof UnitLists;
    resolvedType?: string;
}

interface AddFromSearchResult {
    lists: UnitLists;
    added: boolean;
    listKey?: VehicleListType;
    resolvedType?: string;
}

const isVehicleItem = (value: UnitLists[keyof UnitLists][number]): value is VehicleItem => {
    return typeof value === 'object' && value !== null && 'plate' in value;
};

/**
 * Adds an item to the target list, preserving the existing list logic.
 */
export function addListItem(
    lists: UnitLists,
    listName: keyof UnitLists,
    value: UnitLists[keyof UnitLists][number]
): AddListItemResult {
    if (!value) return { lists, targetList: listName };

    let targetList: keyof UnitLists = listName;
    if (listName === 'vehicles' && isVehicleItem(value) && value.type === 'Bicicleta') {
        targetList = 'bicycles';
    }

    const resolvedType =
        (targetList === 'vehicles' || targetList === 'bicycles') && isVehicleItem(value)
            ? value.type || (targetList === 'bicycles' ? 'Bicicleta' : undefined)
            : undefined;

    return {
        lists: {
            ...lists,
            [targetList]: [...lists[targetList], value]
        } as UnitLists,
        targetList,
        resolvedType
    };
}

/**
 * Removes an item by index from a list.
 */
export function removeListItemAtIndex(
    lists: UnitLists,
    listName: keyof UnitLists,
    index: number
): UnitLists {
    return {
        ...lists,
        [listName]: lists[listName].filter((_, i) => i !== index)
    } as UnitLists;
}

/**
 * Adds a person from search results into the appropriate list.
 */
export function addPersonFromSearch(
    lists: UnitLists,
    type: PersonListType,
    item: SearchPersonItem
): AddFromSearchResult {
    if (!item) return { lists, added: false };
    if (type === 'owners' && item.is_minor) return { lists, added: false };

    const exists = lists[type].some((p) => p.document_number === item.documentNumber);
    if (exists) return { lists, added: false };

    const names = (item.name || '').split(' ');
    const first_name = names[0] || '';
    const last_name = names.slice(1).join(' ') || '';

    const nextPerson: PersonItem = {
        document_number: item.documentNumber,
        first_name,
        last_name,
        document_type: item.documentType || 'CC',
        is_minor: Boolean(item.is_minor),
        email: item.email as string | undefined,
        phone: item.phone as string | undefined,
        is_elderly: item.is_elderly as boolean | undefined,
        has_disability: item.has_disability as boolean | undefined,
        is_realtor: item.is_realtor as boolean | undefined,
        data_authorization: item.data_authorization as boolean | undefined,
        observations: item.observations as string | undefined,
        role: item.role as string | undefined
    };

    return {
        lists: {
            ...lists,
            [type]: [...lists[type], nextPerson]
        } as UnitLists,
        added: true
    };
}

/**
 * Adds a vehicle from search results into the proper list.
 */
export function addVehicleFromSearch(lists: UnitLists, item: SearchVehicleItem): AddFromSearchResult {
    if (!item) return { lists, added: false };

    const isBike = item.type === 'Bicicleta';
    const listKey: VehicleListType = isBike ? 'bicycles' : 'vehicles';
    const exists = lists[listKey].some((v) => v.plate === item.plate);

    const resolvedType = item.type || (isBike ? 'Bicicleta' : 'Automóvil');

    if (exists) {
        return { lists, added: false, listKey, resolvedType };
    }

    const nextVehicle: VehicleItem = {
        plate: item.plate,
        type: resolvedType
    };

    return {
        lists: {
            ...lists,
            [listKey]: [...lists[listKey], nextVehicle]
        } as UnitLists,
        added: true,
        listKey,
        resolvedType
    };
}

/**
 * Adds a pet from search results.
 */
export function addPetFromSearch(lists: UnitLists, item: SearchPetItem): AddFromSearchResult {
    if (!item) return { lists, added: false };

    const nextPet: PetItem = {
        id: Date.now(),
        name: item.name,
        type: item.type || item.species || 'Canino'
    };

    return {
        lists: {
            ...lists,
            pets: [...lists.pets, nextPet]
        } as UnitLists,
        added: true
    };
}

/**
 * Adds a parking space from search results if it is not already present.
 */
export function addParkingFromSearch(lists: UnitLists, item: SearchParkingItem): AddFromSearchResult {
    if (!item) return { lists, added: false };

    const exists = lists.parkingSpaces.some((p) => p.id === item.id);
    if (exists) return { lists, added: false };

    return {
        lists: {
            ...lists,
            parkingSpaces: [...lists.parkingSpaces, item]
        } as UnitLists,
        added: true
    };
}

/**
 * Replaces an existing document by type, or appends if new.
 */
export function upsertDocument(prev: UnitDocument[], doc: UnitDocument): UnitDocument[] {
    return [...prev.filter((d) => d.document_type !== doc.document_type), doc];
}

/**
 * Removes a document by its id.
 */
export function removeDocumentById(prev: UnitDocument[], id: number): UnitDocument[] {
    return prev.filter((doc) => doc.id !== id);
}
