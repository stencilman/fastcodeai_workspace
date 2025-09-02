"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, UserRole } from "@/models/user";
import { Loading } from "@/components/ui/loading";
import { ProfileDetailsForm } from "@/components/user/profile-details-form";
import { useQuery } from "@tanstack/react-query";

// Mock function to fetch user data - would be replaced with actual API call
const fetchUserData = async (): Promise<User> => {
  // This would be an API call in a real implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: "user-1",
        email: "john.doe@fastcode.ai",
        name: "John Doe",
        phone: "+91 9876543210",
        address: "123 Main St, Bangalore",
        role: UserRole.CANDIDATE,
        createdAt: new Date(2025, 0, 1),
        updatedAt: new Date(2025, 0, 1),
      });
    }, 500);
  });
};

export default function ProfilePage() {
  // Use TanStack Query to fetch user data
  const {
    data: userData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["userData"],
    queryFn: fetchUserData,
  });

  if (isLoading) {
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
          <CardTitle className="text-lg font-medium">
            {userData.name}
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({userData.email})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Personal Details</h3>
            <ProfileDetailsForm userData={userData} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
