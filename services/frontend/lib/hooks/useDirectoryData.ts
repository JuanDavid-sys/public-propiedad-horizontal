import { useQuery } from '@tanstack/react-query';
import { fetchDirectoryData } from '@/lib/actions/unit.actions';

export function useDirectoryData() {
    return useQuery({
        queryKey: ['directoryData'],
        queryFn: () => fetchDirectoryData(),
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}
