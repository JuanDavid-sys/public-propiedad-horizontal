'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchVehiclesData } from '@/lib/actions/smart.actions';

export function useVehiclesData() {
    return useQuery({
        queryKey: ['vehiclesData'],
        queryFn: () => fetchVehiclesData(),
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}
