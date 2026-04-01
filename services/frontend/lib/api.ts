import axios from 'axios';
import { getSession } from 'next-auth/react';
import { logout } from './actions/auth.actions';
import type { AppSessionLike } from '@/types/auth';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor
api.interceptors.request.use(
    async (config) => {
        // En el cliente, obtenemos la sesión de NextAuth
        // getSession() disparará automáticamente el refresco del token si es necesario
        if (typeof window !== 'undefined') {
            const session = await getSession() as AppSessionLike | null;

            const sessionError = session?.error;

            if (sessionError === 'RefreshAccessTokenError') {
                await logout(session);
                return Promise.reject(new Error('Session refresh failed'));
            }

            if (sessionError === 'RefreshNetworkError') {
                console.warn('Session refresh temporarily unavailable due to network error.');
            }

            const token = session?.backendTokens?.access_token;
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        // Si el error es 401 (No autorizado)
        if (error.response?.status === 401) {
            console.error('🔴 Sesión de backend expirada (401). Cerrando sesión en frontend...');

            if (typeof window !== 'undefined') {
                await logout();
            }
        }

        return Promise.reject(error);
    }
);

export default api;
