'use client';

import React, { Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { PersonEditView } from '../../../_components/PersonEditView';
import { PersonEditSkeleton } from '@/components/skeletons/PageSkeletons';

function PersonEditPageContent({ paramsPromise }: { paramsPromise: Promise<any> }) {
    const params = React.use(paramsPromise);
    const searchParams = useSearchParams();

    const personId = params.id as string;
    const from = searchParams.get('from');
    const unit = searchParams.get('unit');

    return (
        <PersonEditView
            personId={personId}
            from={from}
            unitId={unit || undefined}
        />
    );
}

export default function PersonEditPage({ params }: { params: Promise<any> }) {
    return (
        <Suspense fallback={<PersonEditSkeleton />}>
            <PersonEditPageContent paramsPromise={params} />
        </Suspense>
    );
}
