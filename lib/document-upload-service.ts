import { DocumentType } from '@/models/document';

export async function initiateDocumentUpload(
    file: File,
    docType: DocumentType
): Promise<{ documentId: string; uploadUrl: string }> {
    // Step 1: Create document record and get upload URL
    const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            docType,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to initiate upload');
    }

    const { document, uploadUrl } = await response.json();

    return { documentId: document.id, uploadUrl };
}

export async function uploadFileToS3(file: File, uploadUrl: string): Promise<void> {
    // Upload file directly to S3 using the presigned URL
    const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
            'Content-Type': file.type,
        },
    });

    if (!uploadResponse.ok) {
        throw new Error('Failed to upload file to S3');
    }
}

export async function getDocumentUrl(documentId: string): Promise<string> {
    const response = await fetch(`/api/documents/${documentId}`);

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get document URL');
    }

    const { url } = await response.json();
    return url;
}

export async function getUserDocuments() {
    const response = await fetch('/api/documents');

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch documents');
    }

    const { documents } = await response.json();
    return documents;
}

export async function deleteDocument(documentId: string): Promise<void> {
    const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete document');
    }
}
