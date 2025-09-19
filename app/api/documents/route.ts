import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { S3Service } from '@/lib/s3-service';
import { DocumentType, DocumentStatus } from '@/models/document';
import { createDocumentUploadedNotification } from '@/data/notification-service';
import { sendDocumentSubmissionEmail, formatDateForEmail } from '@/lib/email-service';

const s3Service = new S3Service();

// Get all documents for the current user
export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const url = new URL(req.url);
        const userId = url.searchParams.get('userId');

        const user = await db.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // If userId is provided and the current user is an admin, fetch documents for that user
        // Otherwise, fetch documents for the current user
        const targetUserId = (userId && user.role === 'ADMIN') ? userId : user.id;

        const documents = await db.document.findMany({
            where: { userId: targetUserId },
            orderBy: { uploadedAt: 'desc' },
        });

        // Generate presigned URLs for each document
        const documentsWithUrls = await Promise.all(
            documents.map(async (doc: { s3Key: string, [key: string]: unknown }) => {
                const url = await s3Service.getPresignedDownloadUrl(doc.s3Key);
                return { ...doc, url };
            })
        );

        return NextResponse.json({ documents: documentsWithUrls });
    } catch (error) {
        console.error('Error fetching documents:', error);
        return NextResponse.json(
            { error: 'Failed to fetch documents' },
            { status: 500 }
        );
    }
}

// Create a new document upload
export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { fileName, fileSize, fileType, docType } = body;

        if (!fileName || !fileSize || !fileType || !docType) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Get user
        const user = await db.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Find and delete any existing documents of the same type for this user
        const existingDocuments = await db.document.findMany({
            where: {
                userId: user.id,
                type: docType as DocumentType
            }
        });

        // Delete existing documents from S3 and database
        if (existingDocuments.length > 0) {
            for (const doc of existingDocuments) {
                // Delete from S3
                await s3Service.deleteFile(doc.s3Key);

                // Delete from database
                await db.document.delete({
                    where: { id: doc.id }
                });
            }
        }

        // Generate S3 key
        const s3Key = s3Service.generateS3Key(user.id, docType, fileName);

        // Create document record in database
        const document = await db.document.create({
            data: {
                userId: user.id,
                type: docType as DocumentType,
                fileName,
                fileSize,
                fileType,
                s3Key,
                status: DocumentStatus.PENDING,
            },
        });

        // Generate presigned upload URL
        const uploadUrl = await s3Service.getPresignedUploadUrl(s3Key, fileType);

        // Create notification for admins
        try {
            await createDocumentUploadedNotification(
                document.id,
                docType as DocumentType,
                user.name!,
                user.id // Pass the user ID for the related link
            );
            console.log('Document upload notification created successfully');

            // Send email notification to admins
            try {
                // Find admin users
                const adminUsers = await db.user.findMany({
                    where: { role: 'ADMIN' }
                });

                // Send email to each admin
                for (const admin of adminUsers) {
                    if (admin.email) {
                        await sendDocumentSubmissionEmail(admin.email, {
                            user_name: user.name || 'User',
                            user_email: user.email || '',
                            document_type: docType,
                            submission_date: formatDateForEmail(new Date()),
                            file_name: fileName,
                            review_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/users/${user.id}?tab=documents`
                        });
                    }
                }
                console.log('Document submission emails sent to admins');
            } catch (emailError) {
                console.error('Error sending email notifications:', emailError);
                // Don't fail the request if email sending fails
            }
        } catch (notificationError) {
            console.error('Error creating notification:', notificationError);
            // Don't fail the request if notification creation fails
        }

        return NextResponse.json({ document, uploadUrl });
    } catch (error) {
        console.error('Error creating document upload:', error);
        return NextResponse.json(
            { error: 'Failed to create document upload' },
            { status: 500 }
        );
    }
}
