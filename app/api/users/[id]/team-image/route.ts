import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { S3Service } from '@/lib/s3-service';
import { UserRole } from '@/models/user';

const s3Service = new S3Service();

// GET /api/users/[id]/team-image - Get presigned URL for team image
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Check if the user is an admin or the user themselves
    const currentUser = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only allow admins or the user themselves to access their team image
    const isAdmin = currentUser.role === 'ADMIN';
    const isSelf = currentUser.id === params.id;

    if (!isAdmin && !isSelf) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get the user's team image S3 key
    const user = await db.user.findUnique({
      where: { id: params.id },
      select: { teamImageS3Key: true },
    });

    if (!user || !user.teamImageS3Key) {
      return NextResponse.json({ error: 'Team image not found' }, { status: 404 });
    }

    // Generate presigned URL for the team image
    const url = await s3Service.getPresignedDownloadUrl(user.teamImageS3Key);

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Error fetching team image URL:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team image URL' },
      { status: 500 }
    );
  }
}
