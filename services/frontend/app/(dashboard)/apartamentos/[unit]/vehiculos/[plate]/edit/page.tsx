'use client';

import React, { Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { VehicleEditView } from '../../../../../_components/VehicleEditView';
import { VehicleEditSkeleton } from '@/components/skeletons/PageSkeletons';

function VehicleEditPageContent({ paramsPromise }: { paramsPromise: Promise<any> }) {
    const params = React.use(paramsPromise);
    const searchParams = useSearchParams();

    const unit = params.unit as string;
    const plate = params.plate as string;
    const from = searchParams.get('from');

    return (
        <VehicleEditView
            unitId={unit}
            plate={plate}
            from={from}
        />
    );
}

export default function VehicleEditPage({ params }: { params: Promise<any> }) {
    return (
        <Suspense fallback={<VehicleEditSkeleton />}>
            <VehicleEditPageContent paramsPromise={params} />
        </Suspense>
    );
}
