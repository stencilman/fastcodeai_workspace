import { NextRequest, NextResponse } from "next/server";
import { createNotification } from "@/data/notification-service";
import { auth } from "@/auth";
import { CreateNotificationInput } from "@/models/notification";
import { UserRole } from "@prisma/client";

/**
 * POST /api/notifications/create
 * Create a new notification
 * Note: This endpoint is admin-only to prevent users from creating notifications
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    // Check if user is authenticated and is an admin
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only admins can create notifications
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Forbidden: Only admins can create notifications" },
        { status: 403 }
      );
    }

    // Parse request body
    const data = await req.json();
    
    // Validate required fields
    if (!data.userId || !data.title || !data.message || !data.type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create notification
    const notification = await createNotification(data as CreateNotificationInput);

    return NextResponse.json(notification);
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}
