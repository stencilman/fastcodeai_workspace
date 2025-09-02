"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Determine if current path is in admin section
  const isAdmin = pathname.startsWith("/admin");

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
          >
            <User className="h-5 w-5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" /> Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
