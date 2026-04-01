import { Skeleton } from '@/components/ui/Skeleton';

export default function RootLoading() {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center animate-pulse">
                <div className="w-6 h-6 rounded-full bg-blue-600/40" />
            </div>
            <div className="space-y-2 flex flex-col items-center w-full max-w-xs">
                <Skeleton className="h-4 w-32 rounded-full" />
                <Skeleton className="h-3 w-48 rounded-full opacity-50" />
            </div>
        </div>
    );
}
