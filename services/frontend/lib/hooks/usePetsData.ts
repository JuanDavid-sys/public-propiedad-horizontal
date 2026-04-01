import { useQuery } from '@tanstack/react-query';
import { fetchPetsData } from '@/lib/actions/pet.actions';

export function usePetsData() {
    return useQuery({
        queryKey: ['petsData'],
        queryFn: () => fetchPetsData(),
        staleTime: 5 * 60 * 1000, 
        gcTime: 30 * 60 * 1000,
    });
}
