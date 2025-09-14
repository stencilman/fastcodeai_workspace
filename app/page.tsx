"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { UserRole } from "@prisma/client";
import { DashboardSkeleton } from "@/components/ui/dashboard-skeleton";

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    // Check user role and redirect accordingly
    if (session?.user?.role === UserRole.ADMIN) {
      router.push("/admin/dashboard");
    } else {
      router.push("/user/dashboard");
    }
  }, [router, session, status]);

  // Show loading state while checking authentication
  return <DashboardSkeleton />;
}
