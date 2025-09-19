import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { DocumentStatus, DocumentType } from '@/models/document';
import { getUserByEmail } from '@/data/user';
import { updateDocumentStatus, getDocumentById } from '@/data/documents';
import { db } from '@/lib/db';
import { sendDocumentApprovalEmail, sendDocumentRejectionEmail, formatDateForEmail } from '@/lib/email-service';

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

        // Ensure notes are provided when rejecting a document
        if (status === 'REJECTED' && (!notes || notes.trim() === '')) {
            return NextResponse.json(
                { error: 'Notes are required when rejecting a document' },
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

        // Get the document with user information to send email
        const documentWithUser = await db.document.findUnique({
            where: { id },
            include: { user: true },
        });

        if (documentWithUser && documentWithUser.user && documentWithUser.user.email) {
            try {
                const baseData = {
                    user_name: documentWithUser.user.name || 'User',
                    document_type: documentWithUser.type as string,
                    submission_date: formatDateForEmail(documentWithUser.uploadedAt),
                    review_date: formatDateForEmail(new Date()),
                    file_name: documentWithUser.fileName,
                    notes: notes || undefined,
                };

                const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

                if (status === DocumentStatus.APPROVED) {
                    // Send approval email
                    await sendDocumentApprovalEmail(documentWithUser.user.email, {
                        ...baseData,
                        dashboard_url: `${appUrl}/user/documents?tab=approved`,
                    });
                    console.log(`Document approval email sent to ${documentWithUser.user.email}`);
                } else if (status === DocumentStatus.REJECTED) {
                    // Send rejection email
                    await sendDocumentRejectionEmail(documentWithUser.user.email, {
                        ...baseData,
                        upload_url: `${appUrl}/user/documents?tab=rejected`,
                    });
                    console.log(`Document rejection email sent to ${documentWithUser.user.email}`);
                }
            } catch (emailError) {
                console.error('Error sending document status email:', emailError);
                // Don't fail the request if email sending fails
            }
        }

        return NextResponse.json({ document });
    } catch (error) {
        console.error('Error reviewing document:', error);
        return NextResponse.json(
            { error: 'Failed to review document' },
            { status: 500 }
        );
    }
}
