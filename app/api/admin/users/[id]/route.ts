import { NextRequest, NextResponse } from "next/server";
import { getUserById, updateUser } from "@/data/user";
import { UpdateUserInput } from "@/models/user";
import { auth } from "@/auth";
import { db } from '@/lib/db';

// GET endpoint to fetch user details (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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
    // Check if the current user is an admin
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

    const user = await getUserById(id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// PATCH endpoint to update user details (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
  try {
    // Check if the current user is an admin
    const currentUser = await db.user.findUnique({
      where: { email: session.user.email },
  });
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

    const body = await request.json();

    // Check if user exists
    const existingUser = await getUserById(id);
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Only pass fields that are in the Prisma schema
    const updateData: UpdateUserInput = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.role !== undefined) updateData.role = body.role;
    if (body.firstName !== undefined) updateData.firstName = body.firstName;
    if (body.lastName !== undefined) updateData.lastName = body.lastName;
    if (body.image !== undefined) updateData.image = body.image;

    // Update the user
    const updatedUser = await updateUser(id, {
      ...updateData,
      // Include non-DB fields from the request
      phone: body.phone,
      address: body.address,
      slackUserId: body.slackUserId,
      linkedinProfile: body.linkedinProfile,
      bloodGroup: body.bloodGroup,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
