import { NextRequest, NextResponse } from 'next/server';
import { S3Service } from '@/lib/s3-service';
import { auth } from '@/auth';

// Initialize S3 service
const s3Service = new S3Service();

export async function GET(req: NextRequest) {
    try {
        // Check authentication
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get query parameters
        const { searchParams } = new URL(req.url);
        const prefix = searchParams.get('prefix') || '';

        // Get bucket info
        const bucketInfo = s3Service.getBucketInfo();
        console.log('AWS test route - Bucket info:', bucketInfo);

        // List objects in the bucket
        const objects = await s3Service.listObjects(prefix);

        return NextResponse.json({
            bucketInfo,
            objects,
            count: objects.length
        });
    } catch (error) {
        // Log detailed error information
        if (error instanceof Error) {
            console.error('Error in AWS test route:', {
                message: error.message,
                name: error.name,
                stack: error.stack,
            });
            return NextResponse.json(
                { error: `Failed to list objects: ${error.message}` },
                { status: 500 }
            );
        } else {
            console.error('Unknown error in AWS test route:', error);
            return NextResponse.json(
                { error: 'Failed to list objects from storage due to an unknown error' },
                { status: 500 }
            );
        }
    }
}

export async function POST(req: NextRequest) {
    try {
        // Check authentication
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get request body
        const { keys } = await req.json();

        if (!keys || !Array.isArray(keys) || keys.length === 0) {
            return NextResponse.json(
                { error: 'No keys provided for deletion' },
                { status: 400 }
            );
        }

        // Delete objects
        const result = await s3Service.deleteObjects(keys);

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error deleting objects:', error);
        return NextResponse.json(
            { error: 'Failed to delete objects' },
            { status: 500 }
        );
    }
}
