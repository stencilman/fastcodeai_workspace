"use client";

import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { User, LogOut } from "lucide-react";

export default function Navbar() {
  return (
    <header className="h-14 w-full border-b flex items-center justify-between px-4 fixed z-50 bg-white">
      <Link href="/" className="text-lg font-semibold">
        Fastcode Onboard
      </Link>

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
