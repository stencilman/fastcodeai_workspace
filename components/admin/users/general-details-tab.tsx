"use client";

import React, { useState, useEffect } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ExternalLink, Pencil } from "lucide-react";
import { FaLinkedin, FaSlack } from "react-icons/fa6";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminProfileDetailsForm } from "@/components/admin/users/admin-profile-details-form";
import { Button } from "@/components/ui/button";
import { getDisplayBloodGroup } from "@/lib/utils";

export function GeneralDetailsTab() {
  const params = useParams();
  const searchParams = useSearchParams();
  const editParam = searchParams.get("edit");
  const [isEditing, setIsEditing] = useState(false);

  // Check for edit parameter in URL and set edit mode accordingly
  useEffect(() => {
    if (editParam === "true") {
      setIsEditing(true);
    }
  }, [editParam]);

  const { data: user, isLoading } = useQuery({
    queryKey: ["user", params.id],
    queryFn: async () => {
      const response = await fetch(`/api/admin/users/${params.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }
      const data = await response.json();
      return data;
    },
  });

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    return dateString.split("T")[0];
  };

  const extractLinkedInUsername = (url: string): string => {
    try {
      // Handle different LinkedIn URL formats
      if (url.includes("linkedin.com/in/")) {
        // Extract username from linkedin.com/in/username
        const username = url
          .split("linkedin.com/in/")[1]
          .split("/")[0]
          .split("?")[0];
        return username;
      } else if (url.includes("linkedin.com/company/")) {
        // Extract company name from linkedin.com/company/company-name
        const companyName = url
          .split("linkedin.com/company/")[1]
          .split("/")[0]
          .split("?")[0];
        return companyName;
      }
      // If we can't parse it, just return the URL
      return url;
    } catch (error) {
      return url;
    }
  };

  if (isLoading) {
    return (
      <TabsContent value="general" className="p-4 border rounded-lg">
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </TabsContent>
    );
  }

  return (
    <TabsContent value="general">
      <Card>
        <CardHeader className="pb-3 flex flex-row justify-between items-center">
          <CardTitle className="text-lg font-medium">
            {user?.name}
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({user?.email})
            </span>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? (
              "Cancel"
            ) : (
              <>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isEditing ? (
              <>
                <h3 className="text-lg font-medium">Edit User Details</h3>
                <AdminProfileDetailsForm
                  userData={user}
                  onSuccess={() => setIsEditing(false)}
                />
              </>
            ) : (
              <>
                <h3 className="text-lg font-medium">User Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Name
                    </h3>
                    <p>{user?.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Email
                    </h3>
                    <p>{user?.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Phone
                    </h3>
                    <p>{user?.phone || "Not provided"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Address
                    </h3>
                    <p>{user?.address || "Not provided"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Role
                    </h3>
                    <p>{user?.role}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Blood Group
                    </h3>
                    <p>
                      {getDisplayBloodGroup(user?.bloodGroup) || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Slack ID
                    </h3>
                    {user?.slackUserId ? (
                      <div className="flex items-center gap-1">
                        <FaSlack className="h-4 w-4 text-[#4A154B]" />
                        <a
                          href={`https://fastcodeai.slack.com/team/${user.slackUserId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          {user.slackUserId}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    ) : (
                      <p>Not provided</p>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      LinkedIn Profile
                    </h3>
                    {user?.linkedinProfile ? (
                      <div className="flex items-center gap-1">
                        <FaLinkedin className="h-4 w-4 text-[#0A66C2]" />
                        <a
                          href={user.linkedinProfile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          {extractLinkedInUsername(user.linkedinProfile)}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    ) : (
                      <p>Not provided</p>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Created
                    </h3>
                    <p>{formatDate(user?.createdAt)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Last Updated
                    </h3>
                    <p>{formatDate(user?.updatedAt)}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
