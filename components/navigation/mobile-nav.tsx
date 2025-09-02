"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Users,
  FileText,
  ExternalLink,
  IndianRupee,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface MobileNavProps {
  isAdmin: boolean;
  onItemClick?: () => void;
}

type Route = {
  label: string;
  href: string;
  icon: LucideIcon;
  external?: boolean;
};

export default function MobileNav({ isAdmin, onItemClick }: MobileNavProps) {
  const pathname = usePathname();

  // Helper function to check if a path is active
  const isActive = (path: string) => {
    // Handle admin user detail pages
    if (path === "/admin/users" && pathname.startsWith("/admin/users/")) {
      return true;
    }

    // Handle user section routes
    if (isAdmin === false) {
      // Map root paths to their user section equivalents
      const userPath = path === "/" ? "/user/dashboard" : `/user${path}`;

      // Check if current path matches the user path or is a sub-path
      if (pathname === userPath || pathname.startsWith(`${userPath}/`)) {
        return true;
      }
    }

    return pathname === path;
  };

  const adminRoutes: Route[] = [
    {
      label: "Dashboard",
      href: "/admin/dashboard",
      icon: Home,
    },
    {
      label: "Users",
      href: "/admin/users",
      icon: Users,
    },
  ];

  const candidateRoutes: Route[] = [
    {
      label: "Dashboard",
      href: "/user/dashboard",
      icon: Home,
    },
    {
      label: "Documents",
      href: "/user/documents",
      icon: FileText,
    },
    {
      label: "Profile",
      href: "/user/profile",
      icon: User,
    },
    {
      label: "Office Entry",
      href: "/user/office-entry",
      icon: FileText,
    },
    {
      label: "Expense Tracker",
      href: "https://expense.fastcode.ai",
      icon: IndianRupee,
      external: true,
    },
  ];

  const routes = isAdmin ? adminRoutes : candidateRoutes;

  return (
    <div className="w-full">
      <nav className="flex flex-col">
        {routes.map(({ label, href, icon: Icon, external }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 text-base border-b border-gray-100",
              isActive(href)
                ? "bg-slate-50 text-primary font-medium border-l-4 border-l-primary"
                : "text-gray-700"
            )}
            onClick={() => {
              if (onItemClick) {
                onItemClick();
              }
            }}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
          >
            <Icon className="h-5 w-5 flex-shrink-0" />
            <span>{label}</span>
            {external && (
              <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0" />
            )}
          </Link>
        ))}
      </nav>
    </div>
  );
}
