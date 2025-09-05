import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { S3Service } from '@/lib/s3-service';
import { db } from '@/lib/db';
import { DocumentStatus } from '@/models/document';

const s3Service = new S3Service();

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Get document ID from query params
        const url = new URL(req.url);
        const documentId = url.searchParams.get('documentId');

        if (!documentId) {
            return NextResponse.json({ error: 'Missing document ID' }, { status: 400 });
        }

        // Find the document in the database
        const document = await db.document.findUnique({
            where: { id: documentId }
        });

        if (!document) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        // Verify user owns this document
        const user = await db.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user || (user.id !== document.userId && user.role !== 'ADMIN')) {
            return NextResponse.json({ error: 'Not authorized to upload this document' }, { status: 403 });
        }

        // Parse form data
        const formData = await req.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: `File size exceeds maximum allowed size (${MAX_FILE_SIZE / (1024 * 1024)}MB)` },
                { status: 400 }
            );
        }

        // Convert file to buffer
        const fileBuffer = Buffer.from(await file.arrayBuffer());

        // Upload file directly to S3
        await s3Service.uploadFile(document.s3Key, fileBuffer, document.fileType);

        // Update document status in database
        await db.document.update({
            where: { id: documentId },
            data: { status: DocumentStatus.PENDING }
        });

        // Generate a URL for the frontend to use
        const downloadUrl = await s3Service.getPresignedDownloadUrl(document.s3Key);

        return NextResponse.json({ 
            success: true, 
            documentId,
            url: downloadUrl
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json(
            { error: 'Failed to upload file' },
            { status: 500 }
        );
    }
}
