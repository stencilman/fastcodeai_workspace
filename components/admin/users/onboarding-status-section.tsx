"use client";

import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { OnboardingStatus } from "@/models/user";

interface OnboardingStatusSectionProps {
  user: {
    id: string;
    onboardingStatus?: OnboardingStatus;
  };
}

export function OnboardingStatusSection({
  user,
}: OnboardingStatusSectionProps) {
  const queryClient = useQueryClient();

  // Mutation for updating onboarding status
  const updateOnboardingStatusMutation = useMutation({
    mutationFn: async (status: OnboardingStatus) => {
      const response = await fetch(
        `/api/admin/users/${user.id}/onboarding-status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ onboardingStatus: status }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update onboarding status");
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", user.id] });
      toast.success("Onboarding status updated successfully");
    },
    onError: (error) => {
      toast.error(`Error updating onboarding status: ${error.message}`);
    },
  });

  return (
    <div className="mb-6 p-4 border rounded-lg bg-muted/20">
      <h3 className="text-md font-medium mb-3">Onboarding Status</h3>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge
            variant={
              user?.onboardingStatus === OnboardingStatus.COMPLETED
                ? "default"
                : "secondary"
            }
            className="capitalize"
          >
            {user?.onboardingStatus?.toLowerCase().replace("_", " ") ||
              "in progress"}
          </Badge>
          {user?.onboardingStatus === OnboardingStatus.COMPLETED && (
            <Check className="h-4 w-4 text-green-500" />
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Label
            htmlFor={`onboarding-completed-${user.id}`}
            className="cursor-pointer text-sm font-medium whitespace-nowrap"
          >
            Mark as Completed
          </Label>
          <Switch
            id={`onboarding-completed-${user.id}`}
            checked={user?.onboardingStatus === OnboardingStatus.COMPLETED}
            onCheckedChange={(checked: boolean) => {
              updateOnboardingStatusMutation.mutate(
                checked
                  ? OnboardingStatus.COMPLETED
                  : OnboardingStatus.IN_PROGRESS
              );
            }}
            disabled={updateOnboardingStatusMutation.isPending}
            className="flex-shrink-0"
          />
        </div>
      </div>
    </div>
  );
}
