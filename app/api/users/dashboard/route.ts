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

        // Get user's documents
        const documents = await db.document.findMany({
            where: { userId: user.id },
            orderBy: { uploadedAt: 'desc' },
        });

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

        // Get recent activity (last 5 document uploads or status changes)
        const recentActivity = await db.document.findMany({
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
        });

        // Calculate onboarding status
        // Use the user's onboardingStatus field if it's COMPLETED, otherwise calculate based on documents
        const documentsCompletion = Math.round((uploadedDocumentTypes.length / requiredDocumentTypes.length) * 100);
        
        // Handle onboardingStatus with type safety
        // Since we just updated the schema, TypeScript might not recognize the field yet
        const userOnboardingStatus = (user as any).onboardingStatus || OnboardingStatus.IN_PROGRESS;
        
        const onboardingStatus = {
            status: userOnboardingStatus === OnboardingStatus.COMPLETED 
                ? 'Completed'
                : 'In Progress',
            startDate: user.createdAt,
            profileCompletion: profileCompletion,
            documentsCompletion: documentsCompletion
        };

        return NextResponse.json({
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
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard data' },
            { status: 500 }
        );
    }
}
