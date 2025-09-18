import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { S3Service } from '@/lib/s3-service';

const s3Service = new S3Service();

// GET /api/users/checklist - Get current user's checklist data
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate presigned URL for team image if it exists
    let teamImageUrl = null;
    if (user && user.teamImageS3Key) {
      try {
        teamImageUrl = await s3Service.getPresignedDownloadUrl(user.teamImageS3Key);
      } catch (error) {
        console.error('Error generating presigned URL for team image:', error);
        // Continue without the image URL
      }
    }

    return NextResponse.json({
      ...user,
      teamImageUrl,
    });
  } catch (error) {
    console.error('Error fetching user checklist:', error);
    return NextResponse.json(
      { error: 'Failed to fetch checklist data' },
      { status: 500 }
    );
  }
}

// PATCH /api/users/checklist - Update checklist items
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { linkedinUpdated, profilePictureUpdated, teamBio } = body;

    // Validate input
    if (typeof linkedinUpdated !== 'boolean' && 
        typeof profilePictureUpdated !== 'boolean' && 
        teamBio === undefined) {
      return NextResponse.json(
        { error: 'Invalid input. At least one field must be provided.' },
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

    // Prepare update data
    const updateData: any = {};
    
    if (typeof linkedinUpdated === 'boolean') {
      updateData.linkedinUpdated = linkedinUpdated;
    }
    
    if (typeof profilePictureUpdated === 'boolean') {
      updateData.profilePictureUpdated = profilePictureUpdated;
    }
    
    if (teamBio !== undefined) {
      updateData.teamBio = teamBio;
      updateData.teamBioProvided = teamBio.trim().length > 0;
    }

    // Update user
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: updateData,
    });

    // Generate presigned URL for team image if it exists
    let teamImageUrl = null;
    if (updatedUser && updatedUser.teamImageS3Key) {
      try {
        teamImageUrl = await s3Service.getPresignedDownloadUrl(updatedUser.teamImageS3Key);
      } catch (error) {
        console.error('Error generating presigned URL for team image:', error);
        // Continue without the image URL
      }
    }

    return NextResponse.json({
      ...updatedUser,
      teamImageUrl,
    });
  } catch (error) {
    console.error('Error updating user checklist:', error);
    return NextResponse.json(
      { error: 'Failed to update checklist data' },
      { status: 500 }
    );
  }
}
