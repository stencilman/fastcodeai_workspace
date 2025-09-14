"use client";
import { useState } from "react";
import SideNav from "@/components/navigation/side-nav";
import Navbar from "@/components/navigation/navbar";
import { cn } from "@/lib/utils/utils";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TourProvider } from "@/components/tour/tour-provider";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Use null as initial state to avoid hydration mismatch
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  // const [mounted, setMounted] = useState(false);

  // Only render client-specific UI after mounting
  // useEffect(() => {
  //   setMounted(true);
  // }, []);

  return (
    <TourProvider>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex flex-1">
          {/* Mobile hamburger menu */}
          <div className="md:hidden fixed top-4 left-4 z-30">
            <Button
              id="mobile-hamburger-menu"
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="h-8 w-8"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          {/* Mobile overlay */}
          { mobileOpen && (
            <div
              className="md:hidden fixed inset-0 bg-black/50 z-20"
              onClick={() => setMobileOpen(false)}
            />
          )}

          {/* Sidebar */}
          <aside
            id="sidebar-navigation"
            className={cn(
              "border-r transition-all duration-300 bg-white relative z-20",
               collapsed ? "w-16" : "w-64",
               mobileOpen
                ? "fixed left-0 top-0 h-full bg-background z-20"
                : "hidden md:block"
            )}
          >
            {/* {mounted && ( */}
              <SideNav
                isAdmin={false}
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                setMobileOpen={setMobileOpen}
              />
            {/* )} */}
          </aside>

          {/* Main content */}
          <main className="flex-1 p-6 overflow-y-auto mt-14">{children}</main>
        </div>
      </div>
    </TourProvider>
  );
}
