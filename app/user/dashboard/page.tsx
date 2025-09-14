"use client";

import { useMemo, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { tourUtils } from "@/lib/tour-utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle,
  Clock,
  FileCheck,
  FileText,
  FileUp,
  FileX,
  Upload,
  User,
} from "lucide-react";
import { DocumentStatus, DocumentType } from "@/models/document";
import { formatDistanceToNow } from "date-fns";
import { TourTestControls } from "@/components/tour/tour-test-controls";

// Type definitions for dashboard data
interface DashboardData {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
    role: string;
  };
  documentStats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  missingDocumentTypes: DocumentType[];
  profileCompletion: number;
  recentActivity: {
    id: string;
    type: DocumentType;
    status: DocumentStatus;
    uploadedAt: string;
    reviewedAt?: string;
    fileName: string;
  }[];
  onboardingStatus: {
    status: string;
    startDate: string;
    profileCompletion: number;
    documentsCompletion: number;
  };
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

export default function UserDashboardPage() {
  const { status } = useSession();

  // Use React Query for data fetching with caching
  const {
    data: dashboardData,
    isLoading,
    error,
    isSuccess,
  } = useQuery<DashboardData, Error>({
    queryKey: ["userDashboard"],
    queryFn: async () => {
      const response = await fetch("/api/users/dashboard");
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }
      return response.json();
    },
    enabled: status === "authenticated",
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  });

  // Trigger tour check after dashboard loads successfully
  useEffect(() => {
    if (isSuccess && dashboardData) {
      const triggerTourCheck = async () => {
        try {
          // Check tour completion status via API
          const tourCompleted = await tourUtils.checkTourStatus();

          if (!tourCompleted) {
            // Dispatch custom event to show tour immediately
            window.dispatchEvent(new CustomEvent("show-tour"));
          }
        } catch (error) {
          console.error(
            "Error checking tour status after dashboard load:",
            error
          );
          // Default to showing tour if API call fails
          window.dispatchEvent(new CustomEvent("show-tour"));
        }
      };

      triggerTourCheck();
    }
  }, [isSuccess, dashboardData]);

  // Memoize recent activity data to prevent unnecessary re-renders
  const memoizedRecentActivity = useMemo(() => {
    if (!dashboardData?.recentActivity) return [];
    return dashboardData.recentActivity;
  }, [dashboardData?.recentActivity]);

  // Memoize missing document types
  const memoizedMissingDocuments = useMemo(() => {
    if (!dashboardData?.missingDocumentTypes) return [];
    return dashboardData.missingDocumentTypes;
  }, [dashboardData?.missingDocumentTypes]);

  // Loading state
  if (status === "loading" || isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
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
            ? "Please sign in to view your dashboard"
            : "Error"}
        </h2>
        <p className="text-muted-foreground mb-4">
          {status === "unauthenticated"
            ? "You need to be signed in to access this page"
            : error instanceof Error
            ? error.message
            : "Something went wrong"}
        </p>
        <Button asChild>
          <Link
            href={
              status === "unauthenticated" ? "/auth/signin" : "/user/dashboard"
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
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome to your FastCodeAI dashboard,{" "}
          {dashboardData?.user.name.split(" ")[0]}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <FileUp className="h-3 w-3" />{" "}
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
              <Link href="/user/documents">
                View Documents <ArrowRight className="ml-auto h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Profile Completion
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="text-2xl font-bold">
              {dashboardData?.profileCompletion || 0}%
            </div>
            <Progress
              value={dashboardData?.profileCompletion || 0}
              className="h-2 mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {dashboardData?.profileCompletion === 100
                ? "Your profile is complete!"
                : "Complete your profile for better onboarding"}
            </p>
          </CardContent>
          <CardFooter className="pt-0 mt-auto">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              asChild
            >
              <Link href="/user/profile">
                Edit Profile <ArrowRight className="ml-auto h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Document Completion
            </CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="text-2xl font-bold">
              {dashboardData?.onboardingStatus.documentsCompletion || 0}%
            </div>
            <Progress
              value={dashboardData?.onboardingStatus.documentsCompletion || 0}
              className="h-2 mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {dashboardData?.missingDocumentTypes.length === 0
                ? "All required documents uploaded"
                : `${dashboardData?.missingDocumentTypes.length} documents still needed`}
            </p>
          </CardContent>
          <CardFooter className="pt-0 mt-auto">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              asChild
            >
              <Link href="/user/documents?tab=pending_submission">
                Upload Documents <ArrowRight className="ml-auto h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Onboarding Status
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">
                {dashboardData?.onboardingStatus.status || "In Progress"}
              </div>
              {dashboardData?.onboardingStatus.status === "Completed" && (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
            </div>
            <div className="mt-2">
              {dashboardData?.onboardingStatus.status !== "Completed" && (
                <Badge variant="outline" className="text-xs">
                  {dashboardData?.onboardingStatus.documentsCompletion === 100
                    ? "Waiting for admin approval"
                    : "Upload all required documents"}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              Started{" "}
              {dashboardData?.onboardingStatus.startDate
                ? formatDistanceToNow(
                    new Date(dashboardData.onboardingStatus.startDate),
                    { addSuffix: true }
                  )
                : "recently"}
            </p>
          </CardContent>
          <CardFooter className="pt-0 mt-auto">
            <Button
              id="user-guide-button"
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              asChild
            >
              <Link href="/user/general-guidelines">
                View Guidelines <ArrowRight className="ml-auto h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Document status badges */}
        <div className="space-y-3">
          {/* Show when all documents are uploaded */}
          {dashboardData?.missingDocumentTypes &&
            dashboardData.missingDocumentTypes.length === 0 && (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-md px-3 py-1.5 w-fit">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  All documents uploaded
                </span>
              </div>
            )}

          {/* Show when there are rejected documents */}
          {dashboardData?.documentStats &&
            dashboardData.documentStats.rejected > 0 && (
              <Link href="/user/documents?tab=rejected">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-md px-3 py-1.5 w-fit cursor-pointer hover:bg-red-100 dark:hover:bg-red-950/40 transition-colors">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {dashboardData.documentStats.rejected}{" "}
                    {dashboardData.documentStats.rejected === 1
                      ? "document"
                      : "documents"}{" "}
                    rejected
                  </span>
                </div>
              </Link>
            )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your latest document uploads and status changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData?.recentActivity &&
              dashboardData.recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {memoizedRecentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0"
                    >
                      <div className="bg-primary/10 p-2 rounded-full">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <p className="font-medium break-words">
                            {documentTypeNames[activity.type]}
                          </p>
                          <StatusBadge status={activity.status} />
                        </div>
                        <p className="text-sm text-muted-foreground break-words">
                          {activity.fileName}
                        </p>
                        <p className="text-xs text-muted-foreground break-words">
                          {activity.reviewedAt
                            ? `Reviewed ${formatDistanceToNow(
                                new Date(activity.reviewedAt),
                                { addSuffix: true }
                              )}`
                            : `Uploaded ${formatDistanceToNow(
                                new Date(activity.uploadedAt),
                                { addSuffix: true }
                              )}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="h-10 w-10 text-muted-foreground mb-2 opacity-50" />
                  <p className="text-muted-foreground">No recent activity</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload documents to see your activity here
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                id="upload-documents-button"
                variant="outline"
                size="sm"
                className="w-full"
                asChild
              >
                <Link href="/user/documents?tab=pending_submission">
                  <Upload className="h-4 w-4 mr-2" /> Upload Documents
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Required Documents - Only show if there are missing documents */}
          {memoizedMissingDocuments.length > 0 && (
            <Card id="required-documents-section">
              <CardHeader>
                <CardTitle>Required Documents</CardTitle>
                <CardDescription>Documents you need to upload</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {memoizedMissingDocuments.map((docType) => (
                    <div
                      key={docType}
                      className="flex items-center justify-between p-2 bg-muted rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <span>{documentTypeNames[docType]}</span>
                      </div>
                      <Button size="sm" variant="secondary" asChild>
                        <Link
                          href={`/user/documents?type=${docType}&open=true`}
                        >
                          Upload
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      {/* <TourTestControls /> */}
    </div>
  );
}
