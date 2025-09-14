"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar Skeleton */}
      <header className="h-14 w-full border-b flex items-center justify-between px-4 fixed z-50 bg-white">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-40" />
        </div>
        <Skeleton className="h-9 w-9 rounded-full" />
      </header>

      <div className="flex flex-1">
        {/* Sidebar Skeleton */}
        <aside className="border-r w-64 hidden md:block bg-white relative z-20">
          <div className="flex flex-col h-full pt-14 pb-4">
            <div className="px-3 py-2">
              <Skeleton className="h-9 w-full mb-2" />
              <Skeleton className="h-9 w-full mb-2" />
              <Skeleton className="h-9 w-full mb-2" />
              <Skeleton className="h-9 w-full mb-2" />
              <Skeleton className="h-9 w-full mb-2" />
            </div>
            <div className="mt-auto px-3">
              <Skeleton className="h-9 w-full" />
            </div>
          </div>
        </aside>

        {/* Mobile hamburger menu skeleton */}
        <div className="md:hidden fixed top-4 left-4 z-30">
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>

        {/* Main content */}
        <main className="flex-1 p-6 overflow-y-auto mt-14">
          <div className="space-y-6">
            <div>
              <Skeleton className="h-8 w-48 mb-1" />
              <Skeleton className="h-4 w-72" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Documents Card Skeleton */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-12 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>

              {/* Profile Completion Card Skeleton */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-12 mb-2" />
                  <Skeleton className="w-full h-2 rounded-full mt-2" />
                </CardContent>
              </Card>

              {/* Onboarding Status Card Skeleton */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-28 mb-2" />
                  <Skeleton className="h-3 w-40" />
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
