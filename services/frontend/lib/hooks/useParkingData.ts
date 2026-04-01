import { useQuery } from '@tanstack/react-query';
import { fetchParkingData } from '@/lib/actions/parking.actions';

export function useParkingData(type?: string) {
    return useQuery({
        queryKey: ['parkingData', type],
        queryFn: () => fetchParkingData(type),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
    });
}
