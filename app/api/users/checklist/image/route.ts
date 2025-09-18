import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { S3Service } from '@/lib/s3-service';

const s3Service = new S3Service();

// Maximum file size (2MB)
const MAX_FILE_SIZE = 2 * 1024 * 1024;

// POST /api/users/checklist/image - Upload team image
export async function POST(req: NextRequest) {
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

    // Check file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Generate S3 key for the team image
    const s3Key = `team-images/${user.id}/${Date.now()}_${file.name}`;

    // Delete old image if exists
    if (user && user.teamImageS3Key) {
      try {
        await s3Service.deleteFile(user.teamImageS3Key);
      } catch (error) {
        console.error('Error deleting old team image:', error);
        // Continue even if deletion fails
      }
    }

    // Upload file to S3
    await s3Service.uploadFile(s3Key, fileBuffer, file.type);

    // Update user record with new S3 key
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        teamImageS3Key: s3Key,
        teamBioProvided: true, // Set to true when an image is uploaded
      },
    });

    // Generate presigned URL for the uploaded image
    const teamImageUrl = await s3Service.getPresignedDownloadUrl(s3Key);

    return NextResponse.json({
      ...updatedUser,
      teamImageUrl,
    });
  } catch (error) {
    console.error('Error uploading team image:', error);
    return NextResponse.json(
      { error: 'Failed to upload team image' },
      { status: 500 }
    );
  }
}
