"use client";

import { useState, useEffect } from 'react';

const HISTORY_KEY = 'ventura_search_history';
const MAX_HISTORY_ITEMS = 10;

export function useSearchHistory() {
    const [history, setHistory] = useState<string[]>([]);

    useEffect(() => {
        const storedHistory = localStorage.getItem(HISTORY_KEY);
        if (storedHistory) {
            try {
                setHistory(JSON.parse(storedHistory));
            } catch (e) {
                console.error("Failed to parse search history", e);
                setHistory([]);
            }
        }
    }, []);

    const saveHistory = (newHistory: string[]) => {
        setHistory(newHistory);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    };

    const addSearchTerm = (term: string) => {
        if (!term.trim()) return;
        const normalizedTerm = term.trim();

        // Remove if exists to move to top
        const filtered = history.filter(item => item.toLowerCase() !== normalizedTerm.toLowerCase());

        const newHistory = [normalizedTerm, ...filtered].slice(0, MAX_HISTORY_ITEMS);
        saveHistory(newHistory);
    };

    const removeSearchTerm = (term: string) => {
        const newHistory = history.filter(item => item !== term);
        saveHistory(newHistory);
    };

    const clearHistory = () => {
        saveHistory([]);
    };

    return {
        history,
        addSearchTerm,
        removeSearchTerm,
        clearHistory
    };
}
