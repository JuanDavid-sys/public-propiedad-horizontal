'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CenteredDetailSkeleton } from '@/components/skeletons/PageSkeletons';
import { VehicleDetailView } from '../../../../_components/VehicleDetailView';

type VehicleDetailPageParams = {
    unit: string;
    plate: string;
};

function VehicleDetailPageContent({ paramsPromise }: { paramsPromise: Promise<VehicleDetailPageParams> }) {
    const params = React.use(paramsPromise);
    const searchParams = useSearchParams();

    return (
        <VehicleDetailView
            unitId={params.unit}
            plate={params.plate}
            from={searchParams.get('from')}
        />
    );
}

export default function VehicleDetailPage({ params }: { params: Promise<VehicleDetailPageParams> }) {
    return (
        <Suspense fallback={<CenteredDetailSkeleton />}>
            <VehicleDetailPageContent paramsPromise={params} />
        </Suspense>
    );
}
