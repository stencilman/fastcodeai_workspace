import { NextRequest, NextResponse } from "next/server";
import { getNotifications, getUnreadCount } from "@/data/notification-service";
import { auth } from "@/auth";

/**
 * GET /api/notifications
 * Fetch notifications for the current user
 */
export async function GET(req: NextRequest) {
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
    
    // Get notifications and unread count
    const [notifications, unreadCount] = await Promise.all([
      getNotifications(userId),
      getUnreadCount(userId),
    ]);

    return NextResponse.json({
      notifications,
      unreadCount,
      totalCount: notifications.length,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}
