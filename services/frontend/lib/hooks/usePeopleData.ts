'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchPeopleData } from '@/lib/actions/smart.actions';

export function usePeopleData() {
    return useQuery({
        queryKey: ['peopleData'],
        queryFn: () => fetchPeopleData(),
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}
