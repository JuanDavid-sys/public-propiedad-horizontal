import { useQuery } from '@tanstack/react-query';
import { fetchPeopleData } from '@/lib/actions/people.actions';

export function usePeopleData() {
    return useQuery({
        queryKey: ['peopleData'],
        queryFn: async () => {
            return await fetchPeopleData();
        },
        staleTime: 0,
        gcTime: 1000 * 60 * 1, // Keep for 1 minute in cache if unused
    });
}
