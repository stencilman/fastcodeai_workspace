"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { UserRole } from "@prisma/client";
import { Loading } from "@/components/ui/loading";

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
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loading size="lg" variant="primary" text="Loading..." />
    </div>
  );
}
