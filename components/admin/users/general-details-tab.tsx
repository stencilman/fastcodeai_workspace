import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

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
              Slack Status
            </h3>
            <p>{user?.slackUserId ? "Connected" : "Not Invited"}</p>
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
