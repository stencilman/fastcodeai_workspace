import { NextRequest, NextResponse } from "next/server";
import { markAllAsRead } from "@/data/notification-service";
import { auth } from "@/auth";

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read for the current user
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Ensure userId exists
    if (!session.user.id) {
      return NextResponse.json(
        { error: "User ID not found" },
        { status: 400 }
      );
    }
    
    const userId = session.user.id;
    
    // Mark all notifications as read
    const updatedCount = await markAllAsRead(userId);

    return NextResponse.json({ 
      success: true,
      updatedCount 
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return NextResponse.json(
      { error: "Failed to mark all notifications as read" },
      { status: 500 }
    );
  }
}
