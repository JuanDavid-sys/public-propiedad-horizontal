'use client';

import React, { Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { PersonDetailView } from '../../../_components/PersonDetailView';
import { PersonDetailSkeleton } from '@/components/skeletons/PageSkeletons';

function PersonDetailPageContent() {
    const params = useParams();
    const searchParams = useSearchParams();

    const unit = params.unit as string;
    const personId = params.id as string;
    const from = searchParams.get('from');

    return (
        <PersonDetailView
            personId={personId}
            unitId={unit}
            from={from}
        />
    );
}

export default function PersonDetailPage() {
    return (
        <Suspense fallback={<PersonDetailSkeleton />}>
            <PersonDetailPageContent />
        </Suspense>
    );
}
