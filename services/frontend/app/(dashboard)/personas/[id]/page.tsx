'use client';

import React, { Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { PersonDetailView } from '../../_components/PersonDetailView';
import { PersonDetailSkeleton } from '@/components/skeletons/PageSkeletons';

function PersonProfilePageContent({ paramsPromise }: { paramsPromise: Promise<any> }) {
    const params = React.use(paramsPromise);
    const searchParams = useSearchParams();

    const personId = params.id as string;
    const from = searchParams.get('from');

    return (
        <PersonDetailView
            personId={personId}
            from={from}
        />
    );
}

export default function PersonProfilePage({ params }: { params: Promise<any> }) {
    return (
        <Suspense fallback={<PersonDetailSkeleton />}>
            <PersonProfilePageContent paramsPromise={params} />
        </Suspense>
    );
}
