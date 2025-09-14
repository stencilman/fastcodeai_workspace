import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { OnboardingStatus } from '@/models/user';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const session = await auth();
    
    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { onboardingStatus } = await req.json();
    
    // Validate the onboarding status
    if (!Object.values(OnboardingStatus).includes(onboardingStatus)) {
      return new NextResponse('Invalid onboarding status', { status: 400 });
    }

    // Update the user's onboarding status
    // Using Prisma.validator to ensure type safety
    const updatedUser = await db.user.update({
      where: {
        id: id,
      },
      data: {
        onboardingStatus: onboardingStatus as OnboardingStatus, // Type assertion to match Prisma schema
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating onboarding status:', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
