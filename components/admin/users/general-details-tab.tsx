import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ExternalLink } from "lucide-react";
import { FaLinkedin, FaSlack } from "react-icons/fa6";
import { getDisplayBloodGroup } from "@/lib/utils";

export function GeneralDetailsTab() {
  const params = useParams();
  const userId = params.id as string;

  const { data: user, isLoading } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUser(userId),
  });

  const fetchUser = async (userId: string) => {
    const response = await fetch(`/api/users/${userId}`);
    const data = await response.json();
    return data;
  };

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
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p className="text-sm text-muted-foreground">
            Loading user details...
          </p>
        </div>
      </TabsContent>
    );
  }

  return (
    <TabsContent value="general" className="p-4 border rounded-lg">
      <h2 className="text-xl font-medium mb-4">General Details</h2>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
            <p>{user?.name}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
            <p>{user?.email}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Phone</h3>
            <p>{user?.phone || "Not provided"}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">
              Address
            </h3>
            <p>{user?.address || "Not provided"}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Role</h3>
            <p>{user?.role}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">
              Blood Group
            </h3>
            <p>{getDisplayBloodGroup(user?.bloodGroup) || "Not provided"}</p>
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
      </div>
    </TabsContent>
  );
}
