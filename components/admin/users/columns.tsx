"use client";

import { ColumnDef } from "@tanstack/react-table";
import { UserRole } from "@/models/user";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, FileText, Edit, Trash } from "lucide-react";

// Define the User type for the table
export type UserTableData = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  slackUserId: string | null;
  createdAt: Date;
  updatedAt: Date;
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
    accessorKey: "slackUserId",
    header: "Slack Status",
    cell: ({ row }) => {
      const slackUserId = row.getValue("slackUserId") as string | null;
      return slackUserId ? (
        <span className="text-green-600">Connected</span>
      ) : (
        <span className="text-amber-600">Not Invited</span>
      );
    },
    size: 120,
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
                href={`/admin/users/${user.id}`}
                className="flex items-center gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </Link>
            </DropdownMenuItem>
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
