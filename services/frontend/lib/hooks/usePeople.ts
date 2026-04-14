'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    initializePeopleData,
    getPeopleFromStorage,
    getPersonFromStorage,
    savePersonToStorage,
    updatePersonInStorage,
    deletePersonFromStorage,
    resetPeopleData,
} from '../actions/people.client.actions';
import { PersonData, PersonUpdatePayload } from '../actions/people.actions';

export function usePeople() {
    const [people, setPeople] = useState<PersonData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize and load data
    useEffect(() => {
        initializePeopleData();
        loadPeople();
    }, []);

    const loadPeople = useCallback(() => {
        const data = getPeopleFromStorage();
        setPeople(data);
        setIsLoading(false);
    }, []);

    const getPerson = useCallback((documentNumber: string) => {
        return getPersonFromStorage(documentNumber);
    }, []);

    const createPerson = useCallback(async (personData: any): Promise<{ success: boolean; error?: string }> => {
        const result = savePersonToStorage(personData);
        if (result.success) {
            loadPeople();
        }
        return result;
    }, [loadPeople]);

    const updatePerson = useCallback(async (documentNumber: string, updates: PersonUpdatePayload): Promise<{ success: boolean; error?: string }> => {
        const result = updatePersonInStorage(documentNumber, updates);
        if (result.success) {
            loadPeople();
        }
        return result;
    }, [loadPeople]);

    const deletePerson = useCallback(async (documentNumber: string): Promise<{ success: boolean; error?: string }> => {
        const result = deletePersonFromStorage(documentNumber);
        if (result.success) {
            loadPeople();
        }
        return result;
    }, [loadPeople]);

    const reset = useCallback(() => {
        resetPeopleData();
        loadPeople();
    }, [loadPeople]);

    return {
        people,
        isLoading,
        getPerson,
        createPerson,
        updatePerson,
        deletePerson,
        reset,
        refresh: loadPeople,
    };
}

export function usePerson(documentNumber: string | null) {
    const [person, setPerson] = useState<PersonData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (documentNumber) {
            initializePeopleData();
            const data = getPersonFromStorage(documentNumber);
            setPerson(data);
        }
        setIsLoading(false);
    }, [documentNumber]);

    const update = useCallback(async (updates: PersonUpdatePayload): Promise<{ success: boolean; error?: string }> => {
        if (!documentNumber) return { success: false, error: 'No document number' };
        const result = updatePersonInStorage(documentNumber, updates);
        if (result.success) {
            const updated = getPersonFromStorage(documentNumber);
            setPerson(updated);
        }
        return result;
    }, [documentNumber]);

    return {
        person,
        isLoading,
        update,
        refresh: () => {
            if (documentNumber) {
                const data = getPersonFromStorage(documentNumber);
                setPerson(data);
            }
        },
    };
}
