import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { S3Service } from '@/lib/s3-service';
import { DocumentStatus } from '@/models/document';

const s3Service = new S3Service();

// Get all documents for admin with filtering options
export async function GET(req: NextRequest) {
    const session = await auth();
    
    // Check if user is authenticated and is an admin
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Get current user to verify admin role
        const currentUser = await db.user.findUnique({
            where: { email: session.user.email },
        });

        if (!currentUser || currentUser.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        // Parse query parameters
        const url = new URL(req.url);
        const status = url.searchParams.get('status');
        const userId = url.searchParams.get('userId');
        const type = url.searchParams.get('type');
        
        // Build where clause for filtering
        const whereClause: any = {};
        
        if (status) {
            whereClause.status = status;
        }
        
        if (userId) {
            whereClause.userId = userId;
        }
        
        if (type) {
            whereClause.type = type;
        }
        
        // Fetch documents with filters
        const documents = await db.document.findMany({
            where: whereClause,
            orderBy: { uploadedAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
        
        // Get document counts by status
        const totalDocuments = await db.document.count();
        const pendingDocuments = await db.document.count({ where: { status: DocumentStatus.PENDING } });
        const approvedDocuments = await db.document.count({ where: { status: DocumentStatus.APPROVED } });
        const rejectedDocuments = await db.document.count({ where: { status: DocumentStatus.REJECTED } });

        // Generate presigned URLs for each document
        const documentsWithUrls = await Promise.all(
            documents.map(async (doc: any) => {
                const url = await s3Service.getPresignedDownloadUrl(doc.s3Key);
                return { ...doc, url };
            })
        );

        return NextResponse.json({
            documents: documentsWithUrls,
            counts: {
                total: totalDocuments,
                pending: pendingDocuments,
                approved: approvedDocuments,
                rejected: rejectedDocuments
            }
        });
    } catch (error) {
        console.error('Error fetching documents for admin:', error);
        return NextResponse.json(
            { error: 'Failed to fetch documents' },
            { status: 500 }
        );
    }
}
