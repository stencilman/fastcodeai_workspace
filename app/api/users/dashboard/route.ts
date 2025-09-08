import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { getUserById } from '@/data/user';
import { DocumentStatus, DocumentType } from '@/models/document';
import { OnboardingStatus } from '@/models/user';

// Calculate profile completion percentage based on filled fields
function calculateProfileCompletion(user: any): number {
    // Define required fields for a complete profile
    const requiredFields = [
        'name',
        'email',
        'phone',
        'address',
        'slackUserId',
        'linkedinProfile',
        'bloodGroup',
        'image'
    ];

    // Count filled fields
    const filledFields = requiredFields.filter(field =>
        user[field] !== undefined &&
        user[field] !== null &&
        user[field] !== ''
    ).length;

    // Calculate percentage
    return Math.round((filledFields / requiredFields.length) * 100);
}

// Get dashboard data for the current user
export async function GET(req: NextRequest) {
    const startTime = Date.now();
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Get user
        const user = await db.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Run all queries in parallel using Promise.all
        const [
            // Get all user documents in a single query
            documents,
            // Get recent activity in a separate query
            recentActivity
        ] = await Promise.all([
            db.document.findMany({
                where: { userId: user.id },
                orderBy: { uploadedAt: 'desc' },
            }),

            db.document.findMany({
                where: { userId: user.id },
                orderBy: { uploadedAt: 'desc' },
                take: 5,
                select: {
                    id: true,
                    type: true,
                    status: true,
                    uploadedAt: true,
                    reviewedAt: true,
                    fileName: true
                }
            })
        ]);

        // Calculate document statistics
        const documentStats = {
            total: documents.length,
            pending: documents.filter(doc => doc.status === DocumentStatus.PENDING).length,
            approved: documents.filter(doc => doc.status === DocumentStatus.APPROVED).length,
            rejected: documents.filter(doc => doc.status === DocumentStatus.REJECTED).length,
        };

        // Calculate required documents
        const requiredDocumentTypes = Object.values(DocumentType);
        const uploadedDocumentTypes = [...new Set(documents.map(doc => doc.type))];
        const missingDocumentTypes = requiredDocumentTypes.filter(
            type => !uploadedDocumentTypes.includes(type)
        );

        // Calculate profile completion
        const profileCompletion = calculateProfileCompletion(user);

        // Calculate onboarding status
        const documentsCompletion = Math.round((uploadedDocumentTypes.length / requiredDocumentTypes.length) * 100);

        // Handle onboardingStatus with type safety
        const userOnboardingStatus = (user as any).onboardingStatus || OnboardingStatus.IN_PROGRESS;

        const onboardingStatus = {
            status: userOnboardingStatus === OnboardingStatus.COMPLETED
                ? 'Completed'
                : 'In Progress',
            startDate: user.createdAt,
            profileCompletion: profileCompletion,
            documentsCompletion: documentsCompletion
        };

        const responseData = {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.image,
                role: user.role
            },
            documentStats,
            missingDocumentTypes,
            profileCompletion,
            recentActivity,
            onboardingStatus
        };

        // Log the response time
        console.log(`User dashboard data generated in ${Date.now() - startTime}ms`);

        return NextResponse.json(responseData);
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard data' },
            { status: 500 }
        );
    }
}
