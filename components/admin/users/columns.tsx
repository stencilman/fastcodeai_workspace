"use client";

import { ColumnDef } from "@tanstack/react-table";
import { UserRole, OnboardingStatus } from "@/models/user";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, FileText, Edit, Trash, CheckCircle } from "lucide-react";

// Function to update onboarding status
async function updateOnboardingStatus(userId: string, status: OnboardingStatus) {
  try {
    const response = await fetch(`/api/users/${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ onboardingStatus: status }),
    });

    if (!response.ok) {
      throw new Error("Failed to update onboarding status");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating onboarding status:", error);
    throw error;
  }
}

// Define the User type for the table
export type UserTableData = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  onboardingStatus: OnboardingStatus;
  createdAt: Date;
  updatedAt: Date;
};

// Define column classes for consistent widths
const columnClasses = {
  name: "w-[150px]",
  email: "w-[200px]",
  role: "w-[100px]",
  onboardingStatus: "w-[120px]",
  createdAt: "w-[100px]",
  updatedAt: "w-[100px]",
  actions: "w-[80px]",
};

export const columns: ColumnDef<UserTableData>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const user = row.original;
      return user.name;
    },
    size: 150,
  },
  {
    accessorKey: "email",
    header: "Email",
    size: 200,
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as UserRole;
      return (
        <Badge
          variant={role === UserRole.ADMIN ? "secondary" : "default"}
          className={
            role === UserRole.ADMIN
              ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
              : "bg-green-100 text-green-800 hover:bg-green-100"
          }
        >
          {role}
        </Badge>
      );
    },
    size: 100,
  },
  {
    accessorKey: "onboardingStatus",
    header: "Onboarding",
    cell: ({ row }) => {
      const status = row.getValue("onboardingStatus") as OnboardingStatus;
      return status === OnboardingStatus.COMPLETED ? (
        <span className="text-green-600">Completed</span>
      ) : (
        <span className="text-amber-600">In Progress</span>
      );
    },
    size: 100,
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      // Use explicit date format to avoid hydration errors
      return <span>{date.toISOString().split("T")[0]}</span>;
    },
    size: 100,
  },
  {
    accessorKey: "updatedAt",
    header: "Updated",
    cell: ({ row }) => {
      const date = row.getValue("updatedAt") as Date;
      // Use explicit date format to avoid hydration errors
      return <span>{date.toISOString().split("T")[0]}</span>;
    },
    size: 100,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;
      const queryClient = useQueryClient();
      
      const handleOnboardingStatusUpdate = async (e: React.MouseEvent, status: OnboardingStatus) => {
        e.stopPropagation();
        try {
          await updateOnboardingStatus(user.id, status);
          const message = status === OnboardingStatus.COMPLETED 
            ? "Onboarding marked as completed" 
            : "Onboarding marked as in progress";
          toast.success(message);
          // Invalidate and refetch users data
          queryClient.invalidateQueries({ queryKey: ["users"] });
        } catch (error) {
          toast.error("Failed to update onboarding status");
        }
      };
      
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 p-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem asChild>
              <Link
                href={`/admin/users/${user.id}?tab=documents`}
                className="flex items-center gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <FileText className="h-4 w-4" />
                <span>Documents</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href={`/admin/users/${user.id}?edit=true`}
                className="flex items-center gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </Link>
            </DropdownMenuItem>
            {user.onboardingStatus === OnboardingStatus.IN_PROGRESS ? (
              <DropdownMenuItem
                onClick={(e) => handleOnboardingStatusUpdate(e, OnboardingStatus.COMPLETED)}
                className="flex items-center gap-2 text-green-600"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Mark as Complete</span>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={(e) => handleOnboardingStatusUpdate(e, OnboardingStatus.IN_PROGRESS)}
                className="flex items-center gap-2 text-amber-600"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Mark as Incomplete</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              variant="destructive"
              onClick={(e) => {
                e.stopPropagation();
                console.log("Delete", user.id);
              }}
              className="flex items-center gap-2 text-destructive"
            >
              <Trash className="h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    size: 100,
  },
];
