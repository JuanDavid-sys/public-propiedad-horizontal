import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
    user: any | null;
    setUser: (user: any) => void;
    logout: () => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            user: null,
            setUser: (user) => set({ user }),
            logout: () => set({ user: null }),
        }),
        {
            name: 'app-storage',
        }
    )
);
