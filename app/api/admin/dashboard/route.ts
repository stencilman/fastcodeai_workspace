import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { DocumentStatus, DocumentType } from "@/models/document";

// Get dashboard data for admin
export async function GET() {
  const startTime = Date.now();
  const session = await auth();

  // Check if user is authenticated and is an admin
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get current user to verify admin role
    const currentUser = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    // Run all major queries in parallel using Promise.all
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Define all the queries we'll run in parallel
    const [
      // User statistics
      userStats,
      // Document statistics
      documentStats,
      // Recent document activity
      recentDocumentActivity,
      // Document type distribution
      documentTypeGroups,
      // Recent users
      recentUsers,
    ] = await Promise.all([
      // 1. User statistics
      db.$transaction([
        db.user.count({ where: { role: "USER" } }),
        db.user.count({
          where: { role: "USER", createdAt: { gte: oneWeekAgo } },
        }),
        db.user.count({
          where: { role: "USER", onboardingStatus: { not: "COMPLETED" } },
        }),
      ]),

      // 2. Document statistics
      db.$transaction([
        db.document.count(),
        db.document.count({ where: { status: DocumentStatus.PENDING } }),
        db.document.count({ where: { status: DocumentStatus.APPROVED } }),
        db.document.count({ where: { status: DocumentStatus.REJECTED } }),
      ]),

      // 3. Recent document activity
      db.document.findMany({
        orderBy: { uploadedAt: "desc" },
        take: 10,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),

      // 4. Document type distribution
      db.document.groupBy({
        by: ["type"],
        _count: {
          _all: true,
        },
      }),

      // 5. Recent users
      db.user.findMany({
        where: { role: "USER" },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          onboardingStatus: true,
        },
      }),
    ]);

    // Process user statistics
    const [userCount, newUsersThisWeek, usersWithIncompleteOnboarding] =
      userStats;

    // Process document statistics
    const [totalDocuments, pendingCount, approvedCount, rejectedCount] =
      documentStats;

    const documentStatsObj = {
      total: totalDocuments,
      pending: pendingCount,
      approved: approvedCount,
      rejected: rejectedCount,
    };

    // Calculate approval rate
    const approvalRate =
      totalDocuments > 0
        ? Math.round((documentStatsObj.approved / totalDocuments) * 100)
        : 0;

    // Process document activity with reviewer information
    // Get all unique reviewer IDs from the documents
    const reviewerIds = recentDocumentActivity
      .filter((doc) => doc.reviewedBy)
      .map((doc) => doc.reviewedBy as string);

    // If we have reviewers, fetch them all at once
    let reviewerMap = new Map();
    if (reviewerIds.length > 0) {
      const reviewers = await db.user.findMany({
        where: { id: { in: reviewerIds } },
        select: { id: true, name: true },
      });
      reviewerMap = new Map(reviewers.map((r) => [r.id, r.name]));
    }

    // Process the document activity with the reviewer map
    const processedActivity = recentDocumentActivity.map((doc) => {
      const reviewerName = doc.reviewedBy
        ? reviewerMap.get(doc.reviewedBy)
        : null;
      return {
        ...doc,
        userId: doc.userId,
        reviewer: reviewerName ? { name: reviewerName } : null,
      };
    });

    // Format document type distribution
    const documentsByType = Object.values(DocumentType).map((type) => {
      const found = documentTypeGroups?.find((group) => group.type === type);
      return {
        type,
        count: found ? found._count._all : 0,
      };
    });

    // Prepare the response data
    const responseData = {
      userStats: {
        totalUsers: userCount,
        newUsersThisWeek,
        incompleteOnboarding: usersWithIncompleteOnboarding,
      },
      documentStats: documentStatsObj,
      approvalRate,
      pendingReview: pendingCount,
      recentDocumentActivity: processedActivity,
      documentsByType,
      recentUsers,
    };

    // Log the response time
    console.log(`Dashboard data generated in ${Date.now() - startTime}ms`);

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching admin dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin dashboard data" },
      { status: 500 }
    );
  }
}
