'use client';

import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void, () => void] {
    const [storedValue, setStoredValue] = useState<T>(initialValue);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        try {
            const item = window.localStorage.getItem(key);
            if (item) {
                setStoredValue(JSON.parse(item));
            }
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);
        }
        setIsInitialized(true);
    }, [key]);

    const setValue = useCallback((value: T | ((prev: T) => T)) => {
        try {
            setStoredValue(prev => {
                const valueToStore = value instanceof Function ? value(prev) : value;
                if (typeof window !== 'undefined') {
                    window.localStorage.setItem(key, JSON.stringify(valueToStore));
                }
                return valueToStore;
            });
        } catch (error) {
            console.warn(`Error setting localStorage key "${key}":`, error);
        }
    }, [key]);

    const removeValue = useCallback(() => {
        try {
            if (typeof window !== 'undefined') {
                window.localStorage.removeItem(key);
            }
            setStoredValue(initialValue);
        } catch (error) {
            console.warn(`Error removing localStorage key "${key}":`, error);
        }
    }, [key, initialValue]);

    return [storedValue, setValue, removeValue];
}

// Initialize mock data in localStorage if empty
export function initializeMockData(key: string, mockData: any[]) {
    if (typeof window === 'undefined') return;

    try {
        const existing = window.localStorage.getItem(key);
        if (!existing) {
            window.localStorage.setItem(key, JSON.stringify(mockData));
        }
    } catch (error) {
        console.warn(`Error initializing localStorage key "${key}":`, error);
    }
}

// Get data from localStorage
export function getLocalStorageData<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;

    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.warn(`Error getting localStorage key "${key}":`, error);
        return defaultValue;
    }
}

// Set data in localStorage
export function setLocalStorageData<T>(key: string, value: T) {
    if (typeof window === 'undefined') return;

    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
    }
}

// Storage keys
export const STORAGE_KEYS = {
    PEOPLE: 'residential_mock_people',
    UNITS: 'residential_mock_units',
    VEHICLES: 'residential_mock_vehicles',
    PETS: 'residential_mock_pets',
} as const;
