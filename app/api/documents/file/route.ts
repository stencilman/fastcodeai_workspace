import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { S3Service } from '@/lib/s3-service';
import { db } from '@/lib/db';

const s3Service = new S3Service();

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const url = new URL(req.url);
        const token = url.searchParams.get('token');

        if (!token) {
            return NextResponse.json({ error: 'Missing token' }, { status: 400 });
        }

        // Verify token and get file key
        const key = s3Service.verifyToken(token);
        if (!key) {
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 403 });
        }

        // Extract userId from key (format: documents/{userId}/...)
        const userIdMatch = key.match(/documents\/([^\/]+)\//);
        if (!userIdMatch) {
            return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
        }

        const fileUserId = userIdMatch[1];

        // Get current user
        const user = await db.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Check if user has access to this file (either it's their file or they're an admin)
        if (user.id !== fileUserId && user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        // Get file from local storage
        const fileBuffer = s3Service.getLocalFile(key);
        if (!fileBuffer) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        // Determine content type based on file extension
        const fileExtension = key.split('.').pop()?.toLowerCase() || '';
        const contentType = getContentType(fileExtension);

        // Return file as response
        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `inline; filename="${key.split('/').pop()}"`,
            },
        });
    } catch (error) {
        console.error('Error serving file:', error);
        return NextResponse.json(
            { error: 'Failed to serve file' },
            { status: 500 }
        );
    }
}

// Helper function to determine content type
function getContentType(extension: string): string {
    const contentTypes: Record<string, string> = {
        'pdf': 'application/pdf',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'txt': 'text/plain',
    };

    return contentTypes[extension] || 'application/octet-stream';
}
