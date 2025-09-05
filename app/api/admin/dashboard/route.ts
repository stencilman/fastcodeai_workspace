import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { DocumentStatus, DocumentType } from '@/models/document';
import { UserRole } from '@/models/user';

// Get dashboard data for admin
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

        // Get user statistics
        const userCount = await db.user.count({
            where: { role: 'USER' }
        });
        
        const newUsersThisWeek = await db.user.count({
            where: {
                role: 'USER',
                createdAt: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
                }
            }
        });

        const usersWithIncompleteOnboarding = await db.user.count({
            where: {
                role: 'USER',
                onboardingStatus: {
                    not: 'COMPLETED'
                }
            }
        });

        // Get document statistics
        const totalDocuments = await db.document.count();
        
        const documentStats = {
            total: totalDocuments,
            pending: await db.document.count({ where: { status: DocumentStatus.PENDING } }),
            approved: await db.document.count({ where: { status: DocumentStatus.APPROVED } }),
            rejected: await db.document.count({ where: { status: DocumentStatus.REJECTED } })
        };

        // Calculate approval rate
        const approvalRate = totalDocuments > 0 
            ? Math.round((documentStats.approved / totalDocuments) * 100) 
            : 0;
        
        // Get documents pending review
        const pendingReviewCount = await db.document.count({
            where: { status: DocumentStatus.PENDING }
        });

        // Get recent activity (last 10 document uploads or status changes)
        const recentDocumentActivity = await db.document.findMany({
            orderBy: { uploadedAt: 'desc' },
            take: 10,
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });
        
        // Process the document activity to include reviewer information
        const processedActivity = await Promise.all(recentDocumentActivity.map(async (doc) => {
            let reviewerName = null;
            if (doc.reviewedBy) {
                const reviewer = await db.user.findUnique({
                    where: { id: doc.reviewedBy },
                    select: { name: true }
                });
                reviewerName = reviewer?.name;
            }
            
            return {
                ...doc,
                userId: doc.userId, // Explicitly include userId for the frontend
                reviewer: reviewerName ? { name: reviewerName } : null
            };
        }));

        // Get document counts by type
        const documentsByType = await Promise.all(
            Object.values(DocumentType).map(async (type) => {
                const count = await db.document.count({ where: { type } });
                return { type, count };
            })
        );

        // Get recent user registrations
        const recentUsers = await db.user.findMany({
            where: { role: 'USER' },
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                onboardingStatus: true
            }
        });

        return NextResponse.json({
            userStats: {
                totalUsers: userCount,
                newUsersThisWeek: newUsersThisWeek,
                incompleteOnboarding: usersWithIncompleteOnboarding
            },
            documentStats: {
                total: totalDocuments,
                pending: documentStats.pending,
                approved: documentStats.approved,
                rejected: documentStats.rejected
            },
            approvalRate,
            pendingReview: documentStats.pending,
            recentDocumentActivity: processedActivity,
            documentsByType,
            recentUsers
        });
    } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch admin dashboard data' },
            { status: 500 }
        );
    }
}
