'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PetEditView } from '../../../../../_components/PetEditView';
import { PetEditSkeleton } from '@/components/skeletons/PageSkeletons';

function PetEditPageContent({ paramsPromise }: { paramsPromise: Promise<any> }) {
    const params = React.use(paramsPromise);
    const searchParams = useSearchParams();

    const unit = params.unit as string;
    const petId = params.id as string;
    const from = searchParams.get('from');

    return (
        <PetEditView
            unitId={unit}
            petId={petId}
            from={from}
        />
    );
}

export default function PetEditPage({ params }: { params: Promise<any> }) {
    return (
        <Suspense fallback={<PetEditSkeleton />}>
            <PetEditPageContent paramsPromise={params} />
        </Suspense>
    );
}
