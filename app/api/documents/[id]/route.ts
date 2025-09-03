import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { S3Service } from '@/lib/s3-service';
import { getUserByEmail } from '@/data/user';
import { getDocumentById, deleteDocument } from '@/data/documents';

const s3Service = new S3Service();

// Get a specific document
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const document = await getDocumentById(params.id);

        if (!document) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        // Check if user is authorized to access this document
        const user = await getUserByEmail(session.user.email);

        if (!user || (user.id !== document.userId && user.role !== 'ADMIN')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Generate presigned URL for viewing/downloading
        const url = await s3Service.getPresignedDownloadUrl(document.s3Key);

        return NextResponse.json({ document, url });
    } catch (error) {
        console.error('Error retrieving document:', error);
        return NextResponse.json(
            { error: 'Failed to retrieve document' },
            { status: 500 }
        );
    }
}

// Delete a document
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const document = await getDocumentById(params.id);

        if (!document) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        // Check if user is authorized to delete this document
        const user = await getUserByEmail(session.user.email);

        if (!user || (user.id !== document.userId && user.role !== 'ADMIN')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Delete file from S3
        await s3Service.deleteFile(document.s3Key);

        // Delete document from database using data layer
        await deleteDocument(params.id);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting document:', error);
        return NextResponse.json(
            { error: 'Failed to delete document' },
            { status: 500 }
        );
    }
}
