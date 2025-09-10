import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { DocumentStatus } from '@/models/document';
import { getUserByEmail } from '@/data/user';
import { updateDocumentStatus } from '@/data/documents';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    // Get the id from params
    const { id } = await params;

    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Check if user is admin
        const admin = await getUserByEmail(session.user.email);

        if (!admin || admin.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { status, notes } = await request.json();

        if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
            return NextResponse.json(
                { error: 'Invalid status' },
                { status: 400 }
            );
        }

        // Update document using data layer
        const document = await updateDocumentStatus(
            id,
            status as DocumentStatus,
            admin.id,
            notes
        );

        return NextResponse.json({ document });
    } catch (error) {
        console.error('Error reviewing document:', error);
        return NextResponse.json(
            { error: 'Failed to review document' },
            { status: 500 }
        );
    }
}
