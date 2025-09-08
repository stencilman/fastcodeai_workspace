"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "@/models/user";
import { Loading } from "@/components/ui/loading";
import { ProfileDetailsForm } from "@/components/user/profile-details-form";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

// Function to fetch user data from the API
const fetchUserData = async (userId: string): Promise<User> => {
  const response = await fetch(`/api/users/${userId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch user data");
  }

  return response.json();
};

export default function ProfilePage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/auth/signin?callbackUrl=/user/profile");
    },
  });

  const userId = session?.user?.id;

  // Use TanStack Query to fetch user data
  const {
    data: userData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["userData", userId],
    queryFn: () => fetchUserData(userId as string),
    enabled: !!userId, // Only run the query if we have a userId
  });

  // Show loading state while checking authentication or fetching data
  if (status === "loading" || isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading size="lg" variant="primary" text="Loading profile..." />
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold text-red-600">Error</h2>
        <p className="mt-2">
          Failed to load profile data. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">My Profile</h1>
        <p className="text-muted-foreground mt-1">
          View and manage your profile information
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="space-y-1">
            <CardTitle className="text-lg font-medium">
              {userData.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {userData.email}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <ProfileDetailsForm userData={userData} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
