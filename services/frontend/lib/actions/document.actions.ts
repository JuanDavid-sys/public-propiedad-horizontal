'use server';

import { revalidatePath } from 'next/cache';
import { getAuthHeader, UnitDocument } from './base.actions';
import { getDiskMockCache, updateMockCache } from './unit.actions';
import { MOCK_UNITS } from '../constants/directory.mocks';

export async function fetchUnitDocuments(unitId: string): Promise<UnitDocument[]> {
    try {
        if (process.env.NEXT_PUBLIC_USE_MOCKS === 'true') {
            const cache = await getDiskMockCache() as any;
            const [tower, unit_number] = unitId.split('-');
            const unit = MOCK_UNITS.find((u: any) => String(u.tower) === tower && String(u.unit_number) === unit_number) as any;
            const baseDocs = unit?.documents || [];
            const cachedData = cache[unitId];
            return cachedData?.documents || baseDocs;
        }
        const apiUrl = process.env.INTERNAL_API_URL || 'http://localhost:8000/api';
        const [tower, unit_number] = unitId.split('-');
        const authHeader = await getAuthHeader();
        const response = await fetch(`${apiUrl}/residential/units/${tower}/${unit_number}/documents`, { cache: 'no-store', headers: authHeader });
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        return [];
    }
}

export async function uploadUnitDocument(unitId: string, formData: FormData): Promise<{ success: boolean; data?: UnitDocument; error?: string }> {
    try {
        if (process.env.NEXT_PUBLIC_USE_MOCKS === 'true') {
            const file = formData.get('file') as File;
            const docType = formData.get('document_type') as string;
            
            // Generar URL de muestra funcional para el modo Mock
            const isImage = file?.type && file.type.startsWith('image/');
            const sampleUrl = isImage 
                ? `https://picsum.photos/seed/${Math.random()}/800/1200` 
                : 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

            const newDoc: UnitDocument = {
                id: Math.floor(Math.random() * 1000000),
                document_type: docType || 'OTROS',
                file: sampleUrl,
                original_name: file?.name || 'documento.pdf',
                mime_type: file?.type || 'application/pdf',
                size: file?.size || 1024,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            // Persistir en DISCO
            const cache = await getDiskMockCache() as any;
            const currentUnitCache = cache[unitId] || {};
            const [tower, unit_number] = unitId.split('-');
            const originalUnit = MOCK_UNITS.find((u: any) => String(u.tower) === tower && String(u.unit_number) === unit_number) as any;
            
            const existingDocs = currentUnitCache.documents || originalUnit?.documents || [];
            const updatedDocs = [...existingDocs, newDoc];
            
            await updateMockCache(unitId, { documents: updatedDocs });
            
            revalidatePath(`/apartamentos/${unitId}`);
            revalidatePath(`/apartamentos/${unitId}/edit`);
            return { success: true, data: newDoc };
        }
        
        const apiUrl = process.env.INTERNAL_API_URL || 'http://localhost:8000/api';
        const [tower, unit_number] = unitId.split('-');
        const authHeader = await getAuthHeader();
        const response = await fetch(`${apiUrl}/residential/units/${tower}/${unit_number}/documents`, {
            method: 'POST',
            headers: authHeader,
            body: formData
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error uploading document: ${response.statusText} - ${errorText}`);
        }
        
        const data = await response.json();
        revalidatePath(`/apartamentos/${unitId}`);
        revalidatePath(`/apartamentos/${unitId}/edit`);
        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteUnitDocument(unitId: string, documentId: number): Promise<{ success: boolean; error?: string }> {
    try {
        if (process.env.NEXT_PUBLIC_USE_MOCKS === 'true') {
            const cache = await getDiskMockCache() as any;
            if (cache[unitId]?.documents) {
                const updatedDocs = cache[unitId].documents.filter((d: any) => d.id !== documentId);
                await updateMockCache(unitId, { documents: updatedDocs });
            }
            revalidatePath(`/apartamentos/${unitId}`);
            revalidatePath(`/apartamentos/${unitId}/edit`);
            return { success: true };
        }
        
        const apiUrl = process.env.INTERNAL_API_URL || 'http://localhost:8000/api';
        const [tower, unit_number] = unitId.split('-');
        const authHeader = await getAuthHeader();
        const response = await fetch(`${apiUrl}/residential/units/${tower}/${unit_number}/documents/${documentId}`, {
            method: 'DELETE',
            headers: authHeader
        });
        
        if (response.ok) {
            revalidatePath(`/apartamentos/${unitId}`);
            revalidatePath(`/apartamentos/${unitId}/edit`);
        }
        return { success: response.ok };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
