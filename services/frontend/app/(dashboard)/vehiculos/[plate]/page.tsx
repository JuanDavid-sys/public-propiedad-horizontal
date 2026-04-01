'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CenteredDetailSkeleton } from '@/components/skeletons/PageSkeletons';
import { VehicleDetailView } from '../../_components/VehicleDetailView';

type VehicleDetailByPlateParams = {
    plate: string;
};

function VehicleDetailByPlateContent({ paramsPromise }: { paramsPromise: Promise<VehicleDetailByPlateParams> }) {
    const params = React.use(paramsPromise);
    const searchParams = useSearchParams();

    return (
        <VehicleDetailView
            plate={params.plate}
            from={searchParams.get('from')}
        />
    );
}

export default function VehicleDetailByPlatePage({ params }: { params: Promise<VehicleDetailByPlateParams> }) {
    return (
        <Suspense fallback={<CenteredDetailSkeleton />}>
            <VehicleDetailByPlateContent paramsPromise={params} />
        </Suspense>
    );
}
