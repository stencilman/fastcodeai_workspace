import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { S3Service } from '@/lib/s3-service';
import { db } from '@/lib/db';

const s3Service = new S3Service();

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Get token from query params
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

        // Save file to local storage
        await s3Service.saveLocalFile(key, fileBuffer);

        return NextResponse.json({ success: true, key });
    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json(
            { error: 'Failed to upload file' },
            { status: 500 }
        );
    }
}
