import { db } from "@/lib/db";
import { CreateNotificationInput, UpdateNotificationInput } from "@/models/notification";
import { DocumentType } from "@/models/document";
import { Notification as NotificationModel } from "@/models/notification";
import { Prisma } from "@prisma/client";

/**
 * Get notifications for a specific user with pagination
 */
export async function getNotifications(
    userId: string,
    page: number = 1,
    pageSize: number = 10,
    cursor?: string
): Promise<{ notifications: NotificationModel[]; nextCursor: string | null; hasMore: boolean }> {
    try {
        // Check if the Prisma client has been updated with the notification model
        if (!db.notification) {
            console.warn("Prisma client does not have notification model yet. Using mock data.");
            return { notifications: [], nextCursor: null, hasMore: false };
        }

        // Calculate how many items to skip if using page-based pagination
        const skip = cursor ? undefined : (page - 1) * pageSize;

        // Build the query
        const query: Prisma.NotificationFindManyArgs = {
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: pageSize + 1, // Take one extra to check if there are more items
        };

        // Add cursor-based pagination if a cursor is provided
        if (cursor) {
            query.cursor = { id: cursor };
            query.skip = 1; // Skip the cursor itself
        } else if (skip) {
            query.skip = skip;
        }

        // Execute the query
        const notifications = await db.notification.findMany(query);

        // Check if there are more items
        const hasMore = notifications.length > pageSize;
        
        // Remove the extra item we used to check for more
        const paginatedNotifications = hasMore ? notifications.slice(0, pageSize) : notifications;
        
        // Get the ID of the last item for the next cursor
        const nextCursor = hasMore ? paginatedNotifications[paginatedNotifications.length - 1].id : null;

        return {
            notifications: paginatedNotifications.map(notification => ({
                ...notification,
                createdAt: notification.createdAt,
                updatedAt: notification.updatedAt,
                documentType: notification.documentType as unknown as DocumentType,
            })),
            nextCursor,
            hasMore,
        };
    } catch (error) {
        console.error("Error fetching notifications:", error);
        throw new Error("Failed to fetch notifications");
    }
}

/**
 * Get unread notification count for a specific user
 */
export async function getUnreadCount(userId: string): Promise<number> {
    try {
        // Check if the Prisma client has been updated with the notification model
        if (!db.notification) {
            console.warn("Prisma client does not have notification model yet. Using mock data.");
            return 0;
        }

        return await db.notification.count({
            where: {
                userId,
                isRead: false,
            },
        });
    } catch (error) {
        console.error("Error counting unread notifications:", error);
        throw new Error("Failed to count unread notifications");
    }
}

/**
 * Create a new notification
 */
export async function createNotification(data: CreateNotificationInput): Promise<NotificationModel> {
    try {
        // Check if the Prisma client has been updated with the notification model
        if (!db.notification) {
            console.warn("Prisma client does not have notification model yet. Using mock data.");
            // Return a mock notification
            return {
                id: 'mock-' + Date.now(),
                userId: data.userId,
                title: data.title,
                message: data.message,
                type: data.type,
                documentId: data.documentId,
                documentType: data.documentType,
                relatedLink: data.relatedLink,
                isRead: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
        }

        const notification = await db.notification.create({
            data: {
                userId: data.userId,
                title: data.title,
                message: data.message,
                type: data.type,
                documentId: data.documentId,
                documentType: data.documentType,
                relatedLink: data.relatedLink,
                isRead: false,
            },
        });

        return {
            ...notification,
            createdAt: notification.createdAt,
            updatedAt: notification.updatedAt,
            documentType: notification.documentType as unknown as DocumentType,
        };
    } catch (error) {
        console.error("Error creating notification:", error);
        throw new Error("Failed to create notification");
    }
}

/**
 * Mark a notification as read
 */
export async function markAsRead(id: string): Promise<NotificationModel> {
    try {
        // Check if the Prisma client has been updated with the notification model
        if (!db.notification) {
            console.warn("Prisma client does not have notification model yet. Using mock data.");
            // Return a mock notification
            return {
                id,
                userId: 'mock-user',
                title: 'Mock Notification',
                message: 'This is a mock notification',
                type: 'document_approved',
                isRead: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
        }

        const notification = await db.notification.update({
            where: { id },
            data: { isRead: true },
        });

        return {
            ...notification,
            createdAt: notification.createdAt,
            updatedAt: notification.updatedAt,
            documentType: notification.documentType as unknown as DocumentType,
        };
    } catch (error) {
        console.error("Error marking notification as read:", error);
        throw new Error("Failed to mark notification as read");
    }
}

/**
 * Mark all notifications as read for a specific user
 */
export async function markAllAsRead(userId: string): Promise<number> {
    try {
        // Check if the Prisma client has been updated with the notification model
        if (!db.notification) {
            console.warn("Prisma client does not have notification model yet. Using mock data.");
            return 0;
        }

        const result = await db.notification.updateMany({
            where: {
                userId,
                isRead: false,
            },
            data: {
                isRead: true,
            },
        });

        return result.count;
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        throw new Error("Failed to mark all notifications as read");
    }
}

/**
 * Delete a notification
 */
export async function deleteNotification(id: string): Promise<void> {
    try {
        // Check if the Prisma client has been updated with the notification model
        if (!db.notification) {
            console.warn("Prisma client does not have notification model yet. Using mock data.");
            return;
        }

        await db.notification.delete({
            where: { id },
        });
    } catch (error) {
        console.error("Error deleting notification:", error);
        throw new Error("Failed to delete notification");
    }
}

/**
 * Create a document uploaded notification for admins
 */
export async function createDocumentUploadedNotification(
    documentId: string,
    documentType: DocumentType,
    userName: string,
    userId: string // Add userId parameter
): Promise<void> {
    try {
        // Get all admin users
        const adminUsers = await db.user.findMany({
            where: {
                role: "ADMIN",
            },
            select: {
                id: true,
            },
        });

        // Create a notification for each admin
        for (const admin of adminUsers) {
            await createNotification({
                userId: admin.id,
                title: "New Document Uploaded",
                message: `${userName} has uploaded a new ${documentType.replace("_", " ").toLowerCase()} for review.`,
                type: "document_uploaded",
                documentId,
                documentType,
                relatedLink: `/admin/users/${userId}?tab=documents`,
            });
        }
    } catch (error) {
        console.error("Error creating document uploaded notification:", error);
        throw new Error("Failed to create document uploaded notification");
    }
}

/**
 * Create a document status notification for a user
 */
export async function createDocumentStatusNotification(
    userId: string,
    documentId: string,
    documentType: DocumentType,
    isApproved: boolean
): Promise<void> {
    try {
        await createNotification({
            userId,
            title: isApproved ? `${documentType.replace("_", " ")} Approved` : `${documentType.replace("_", " ")} Rejected`,
            message: isApproved
                ? `Your ${documentType.replace("_", " ").toLowerCase()} document has been approved.`
                : `Your ${documentType.replace("_", " ").toLowerCase()} document was rejected. Please upload a new one.`,
            type: isApproved ? "document_approved" : "document_rejected",
            documentId,
            documentType,
            relatedLink: isApproved ? "/user/documents?tab=approved" : "/user/documents?tab=rejected",
        });
    } catch (error) {
        console.error("Error creating document status notification:", error);
        throw new Error("Failed to create document status notification");
    }
}
