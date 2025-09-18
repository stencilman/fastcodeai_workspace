import { NextRequest, NextResponse } from "next/server";
import { getNotifications, getUnreadCount } from "@/data/notification-service";
import { auth } from "@/auth";
import { db } from "@/lib/db";

/**
 * GET /api/notifications
 * Fetch notifications for the current user with pagination
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
    
    // Get pagination parameters from query string
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);
    const cursor = url.searchParams.get('cursor') || undefined;
    
    // Get notifications and unread count
    const [notificationsResult, unreadCount] = await Promise.all([
      getNotifications(userId, page, pageSize, cursor),
      getUnreadCount(userId),
    ]);

    return NextResponse.json({
      notifications: notificationsResult.notifications,
      unreadCount,
      totalCount: await getTotalCount(userId),
      nextCursor: notificationsResult.nextCursor,
      hasMore: notificationsResult.hasMore,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

/**
 * Get the total count of notifications for a user
 */
async function getTotalCount(userId: string): Promise<number> {
  try {
    if (!db.notification) {
      return 0;
    }
    return await db.notification.count({
      where: { userId },
    });
  } catch (error) {
    console.error("Error counting notifications:", error);
    return 0;
  }
}
