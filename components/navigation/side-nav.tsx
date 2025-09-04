"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Users,
  FileText,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  IndianRupee,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SideNavProps {
  isAdmin: boolean;
  collapsed?: boolean;
  setCollapsed?: (collapsed: boolean) => void;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

type Route = {
  label: string;
  href: string;
  icon: LucideIcon;
  external?: boolean;
};

export default function SideNav({
  isAdmin,
  collapsed = false,
  setCollapsed,
  mobileOpen = false,
  setMobileOpen,
}: SideNavProps) {
  const pathname = usePathname();
  const [internalCollapsed, setInternalCollapsed] = useState(false);

  // Use either the external or internal collapsed state
  const isCollapsed = collapsed !== undefined ? collapsed : internalCollapsed;
  const toggleCollapsed = () => {
    if (setCollapsed) {
      setCollapsed(!isCollapsed);
    } else {
      setInternalCollapsed(!internalCollapsed);
    }
  };

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
      label: "General Guidelines",
      href: "/user/general-guidelines",
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
    <div className={cn("fixed mt-14 p-3", isCollapsed ? "w-16" : "w-64")}>
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleCollapsed}
        className="absolute top-3 -right-3 h-6 w-6 rounded-full border bg-background shadow-sm"
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>

      {/* Side navigation */}
      <nav className="flex flex-col space-y-1 overflow-hidden">
        {routes.map(({ label, href, icon: Icon, external }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 text-sm hover:text-primary px-3 py-2.5 transition-colors",
              isActive(href)
                ? "bg-slate-100 text-primary font-medium border-r-4 border-primary"
                : "text-muted-foreground",
              isCollapsed ? "justify-center w-10 px-2" : ""
            )}
            onClick={() => {
              if (setMobileOpen && window.innerWidth < 768) {
                setMobileOpen(false);
              }
            }}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            {!isCollapsed && <span className="truncate">{label}</span>}
            {!isCollapsed && external && (
              <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0" />
            )}
          </Link>
        ))}
      </nav>
    </div>
  );
}
