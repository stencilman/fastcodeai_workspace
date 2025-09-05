"use client";

import { useMemo } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Clock,
  FileCheck,
  FileText,
  FileX,
  Users,
  UserPlus,
  UserCheck,
  ClipboardList,
  BarChart,
} from "lucide-react";
import { DocumentStatus, DocumentType } from "@/models/document";
import { formatDistanceToNow } from "date-fns";

// Type definitions for admin dashboard data
interface AdminDashboardData {
  userStats: {
    totalUsers: number;
    newUsersThisWeek: number;
    incompleteOnboarding: number;
  };
  documentStats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  approvalRate: number;
  pendingReview: number;
  recentDocumentActivity: {
    id: string;
    userId: string;
    type: DocumentType;
    status: DocumentStatus;
    uploadedAt: string;
    reviewedAt?: string;
    fileName: string;
    user: {
      name: string;
      email: string;
    };
    reviewer?: {
      name: string;
    };
  }[];
  documentsByType: {
    type: DocumentType;
    count: number;
  }[];
  recentUsers: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
    onboardingStatus: string;
  }[];
}

// Document type display names
const documentTypeNames: Record<DocumentType, string> = {
  [DocumentType.PAN_CARD]: "PAN Card",
  [DocumentType.AADHAR_CARD]: "Aadhaar Card",
  [DocumentType.CANCELLED_CHEQUE]: "Cancelled Cheque",
  [DocumentType.OFFER_LETTER]: "Offer Letter",
};

// Status badge component
const StatusBadge = ({ status }: { status: DocumentStatus }) => {
  switch (status) {
    case DocumentStatus.APPROVED:
      return (
        <Badge className="bg-green-500 hover:bg-green-600">
          <CheckCircle className="h-3 w-3 mr-1" /> Approved
        </Badge>
      );
    case DocumentStatus.REJECTED:
      return (
        <Badge className="bg-red-500 hover:bg-red-600">
          <AlertCircle className="h-3 w-3 mr-1" /> Rejected
        </Badge>
      );
    default:
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-600">
          <Clock className="h-3 w-3 mr-1" /> Pending
        </Badge>
      );
  }
};

// Function to fetch dashboard data
const fetchDashboardData = async (): Promise<AdminDashboardData> => {
  const response = await fetch("/api/admin/dashboard");

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard data");
  }

  return response.json();
};

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();

  // Use React Query for data fetching with caching
  const {
    data: dashboardData,
    isLoading,
    error,
  } = useQuery<AdminDashboardData, Error>({
    queryKey: ["adminDashboard"],
    queryFn: fetchDashboardData,
    enabled: status === "authenticated",
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: true,
    retry: 1,
  });

  // Memoize processed document activity to prevent unnecessary re-renders
  const processedActivity = useMemo(() => {
    if (!dashboardData?.recentDocumentActivity) return [];

    return dashboardData.recentDocumentActivity.map((activity) => ({
      ...activity,
      formattedType:
        documentTypeNames[activity.type as DocumentType] || activity.type,
      formattedTime: activity.reviewedAt
        ? `Reviewed ${formatDistanceToNow(new Date(activity.reviewedAt), {
            addSuffix: true,
          })} by ${activity.reviewer?.name || "Admin"}`
        : `Uploaded ${formatDistanceToNow(new Date(activity.uploadedAt), {
            addSuffix: true,
          })}`,
    }));
  }, [dashboardData?.recentDocumentActivity]);

  // Memoize document type distribution
  const formattedDocumentsByType = useMemo(() => {
    if (!dashboardData?.documentsByType) return [];

    return dashboardData.documentsByType.map((item) => ({
      ...item,
      formattedType: documentTypeNames[item.type as DocumentType] || item.type,
    }));
  }, [dashboardData?.documentsByType]);

  // Loading state
  if (status === "loading" || isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error || status === "unauthenticated") {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">
          {status === "unauthenticated"
            ? "Please sign in to view the admin dashboard"
            : "Error"}
        </h2>
        <p className="text-muted-foreground mb-4">
          {status === "unauthenticated"
            ? "You need to be signed in as an admin to access this page"
            : error instanceof Error
            ? error.message
            : "Something went wrong"}
        </p>
        <Button asChild>
          <Link
            href={
              status === "unauthenticated" ? "/auth/signin" : "/admin/dashboard"
            }
          >
            {status === "unauthenticated" ? "Sign In" : "Try Again"}
          </Link>
        </Button>
      </div>
    );
  }

  // Render dashboard with data
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of users, documents, and system activity
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* User Stats Card */}
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="text-2xl font-bold">
              {dashboardData?.userStats.totalUsers || 0}
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <UserPlus className="h-3 w-3" />{" "}
                {dashboardData?.userStats.newUsersThisWeek || 0} New this week
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <UserCheck className="h-3 w-3" />{" "}
                {dashboardData?.userStats.incompleteOnboarding || 0} Incomplete
                onboarding
              </Badge>
            </div>
          </CardContent>
          <CardFooter className="pt-0 mt-auto">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              asChild
            >
              <Link href="/admin/users">
                Manage Users <ArrowRight className="ml-auto h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Document Stats Card */}
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="text-2xl font-bold">
              {dashboardData?.documentStats.total || 0}
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />{" "}
                {dashboardData?.documentStats.pending || 0} Pending
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <FileCheck className="h-3 w-3" />{" "}
                {dashboardData?.documentStats.approved || 0} Approved
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <FileX className="h-3 w-3" />{" "}
                {dashboardData?.documentStats.rejected || 0} Rejected
              </Badge>
            </div>
          </CardContent>
          <CardFooter className="pt-0 mt-auto">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              asChild
            >
              <Link href="/admin/documents">
                Manage Documents <ArrowRight className="ml-auto h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Approval Rate Card */}
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="text-2xl font-bold">
              {dashboardData?.approvalRate || 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {dashboardData?.documentStats.approved || 0} approved out of{" "}
              {dashboardData?.documentStats.total || 0} total documents
            </p>
          </CardContent>
          <CardFooter className="pt-0 mt-auto">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              asChild
            >
              <Link href="/admin/documents?filter=approved">
                View Approved Documents{" "}
                <ArrowRight className="ml-auto h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Pending Review Card */}
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Pending Review
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="text-2xl font-bold">
              {dashboardData?.pendingReview || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Documents waiting for your review
            </p>
          </CardContent>
          <CardFooter className="pt-0 mt-auto">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              asChild
            >
              <Link href="/admin/documents?filter=pending">
                Review Pending Documents{" "}
                <ArrowRight className="ml-auto h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Document Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Document Activity</CardTitle>
            <CardDescription>
              Latest document uploads and status changes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {processedActivity.length > 0 ? (
              <div className="space-y-4">
                {processedActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0"
                  >
                    <div className="bg-primary/10 p-2 rounded-full">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{activity.formattedType}</p>
                        <StatusBadge status={activity.status} />
                      </div>
                      <p className="text-sm">
                        By{" "}
                        <Link
                          href={`/admin/users/${activity.userId}`}
                          className="font-medium hover:underline text-primary"
                        >
                          {activity.user.name}
                        </Link>
                      </p>
                      <p className="text-sm text-muted-foreground truncate max-w-[250px]">
                        {activity.fileName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.formattedTime}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="h-10 w-10 text-muted-foreground mb-2 opacity-50" />
                <p className="text-muted-foreground">No recent activity</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href="/admin/documents">View All Documents</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Recent User Registrations */}
        <Card>
          <CardHeader>
            <CardTitle>Recent User Registrations</CardTitle>
            <CardDescription>
              Latest users who joined the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData?.recentUsers &&
            dashboardData.recentUsers.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0"
                  >
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="font-medium hover:underline text-primary"
                        >
                          {user.name}
                        </Link>
                        <Badge
                          variant={
                            user.onboardingStatus === "COMPLETED"
                              ? "default"
                              : "outline"
                          }
                          className={
                            user.onboardingStatus === "COMPLETED"
                              ? "bg-green-500"
                              : ""
                          }
                        >
                          {user.onboardingStatus === "COMPLETED"
                            ? "Completed"
                            : "In Progress"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Joined{" "}
                        {formatDistanceToNow(new Date(user.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users className="h-10 w-10 text-muted-foreground mb-2 opacity-50" />
                <p className="text-muted-foreground">
                  No recent user registrations
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href="/admin/users">View All Users</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Document Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Document Type Distribution</CardTitle>
          <CardDescription>Breakdown of documents by type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {formattedDocumentsByType.map((item) => (
              <div
                key={item.type}
                className="bg-muted/50 p-4 rounded-lg flex flex-col"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {item.formattedType}
                  </span>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold mt-2">{item.count}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
