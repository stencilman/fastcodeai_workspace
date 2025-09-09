"use client";

import { useState, useId } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Menu, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import MobileNav from "./mobile-nav";
import { handleSignOut } from "@/actions/signout";
import { useSession } from "next-auth/react";
import { UserRole } from "@prisma/client";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  
  // Generate stable IDs for components
  const mobileMenuId = useId();
  const profileMenuId = useId();

  // Determine if current path is in admin section
  const isAdmin = pathname.startsWith("/admin");

  // Determine if user has admin role
  const hasAdminRole =
    session?.user?.role === UserRole.ADMIN ||
    session?.user?.email?.includes("prabal@fastcode.ai") ||
    session?.user?.email?.includes("priyanka@fastcode.ai") ||
    session?.user?.email?.includes("arjun@fastcode.ai") ||
    session?.user?.email?.includes("admin@fastcode.ai");

  const onSignOut = async () => {
    try {
      setIsSigningOut(true);
      await handleSignOut();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const navigateToProfile = () => {
    if (hasAdminRole) {
      router.push("/admin/profile");
    } else {
      router.push("/user/profile");
    }
  };

  return (
    <header className="h-14 w-full border-b flex items-center justify-between px-4 fixed z-50 bg-white">
      <div className="flex items-center gap-2">
        {/* Mobile menu button - only visible on small screens */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <button
              className="md:hidden rounded-md p-2 text-gray-500 hover:bg-gray-100"
              aria-label="Open navigation menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              id={`mobile-menu-${mobileMenuId}`}
              suppressHydrationWarning
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 pt-14">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <MobileNav
              isAdmin={isAdmin}
              onItemClick={() => setMobileMenuOpen(false)}
            />
          </SheetContent>
        </Sheet>

        <Link href="/" className="text-lg font-semibold">
          Fastcode Onboard
        </Link>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="rounded-full border bg-muted/40 hover:bg-muted p-2 outline-none focus-visible:ring"
            aria-label="Open profile menu"
            id={`profile-menu-${profileMenuId}`}
            suppressHydrationWarning
          >
            <User className="h-5 w-5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={navigateToProfile}>
            <User className="mr-2 h-4 w-4" /> Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600 hover:text-red-700 hover:bg-red-50 focus:bg-red-50 focus:text-red-700"
            onClick={onSignOut}
            disabled={isSigningOut}
          >
            <LogOut className="mr-2 h-4 w-4 text-red-600" />
            {isSigningOut ? "Signing out..." : "Logout"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
