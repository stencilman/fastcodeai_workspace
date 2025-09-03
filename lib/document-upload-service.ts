import { DocumentType } from '@/models/document';

// Cache for document URLs to prevent repeated fetching
const documentUrlCache: Record<string, { url: string; timestamp: number }> = {};
const CACHE_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes

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
    // Check if this is a local upload URL (starts with /api/)
    if (uploadUrl.startsWith('/api/')) {
        // Local file upload to our API endpoint
        const formData = new FormData();
        formData.append('file', file);

        const uploadResponse = await fetch(uploadUrl, {
            method: 'POST',
            body: formData,
        });

        if (!uploadResponse.ok) {
            const error = await uploadResponse.json();
            throw new Error(error.error || 'Failed to upload file');
        }
    } else {
        // S3 direct upload using presigned URL
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
}

export async function getDocumentUrl(documentId: string): Promise<string> {
    // Check cache first
    const cachedData = documentUrlCache[documentId];
    const now = Date.now();

    // Return cached URL if it exists and hasn't expired
    if (cachedData && (now - cachedData.timestamp) < CACHE_EXPIRY_MS) {
        return cachedData.url;
    }

    // Fetch fresh URL if not in cache or expired
    const response = await fetch(`/api/documents/${documentId}`);

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get document URL');
    }

    const { url } = await response.json();

    // Cache the URL with current timestamp
    documentUrlCache[documentId] = { url, timestamp: now };

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
