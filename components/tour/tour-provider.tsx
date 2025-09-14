"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { OnbordaProvider, Onborda } from "onborda";
import { CustomTourCard } from "./custom-tour-card";
import {
  userOnboardingTourDesktop,
  userOnboardingTourMobile,
  documentUploadTour,
} from "@/lib/tour-config";

interface TourProviderProps {
  children: React.ReactNode;
}

export function TourProvider({ children }: TourProviderProps) {
  const { data: session, status } = useSession();
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "USER") {
      // Check if user has completed the tour before
      const hasCompletedTour = localStorage.getItem(
        "fastcodeai-tour-completed"
      );

      if (!hasCompletedTour) {
        // Show tour after a short delay to ensure page is loaded
        const timer = setTimeout(() => {
          setShowTour(true);
        }, 1000);

        return () => clearTimeout(timer);
      }
    }
  }, [session, status]);

  // Determine which tour to show based on current page and screen size
  const getCurrentTourSteps = () => {
    if (typeof window !== "undefined") {
      const pathname = window.location.pathname;
      if (pathname.includes("/documents")) {
        return documentUploadTour;
      }

      // Check if it's mobile view (screen width < 768px)
      const isMobile = window.innerWidth < 768;
      return isMobile ? userOnboardingTourMobile : userOnboardingTourDesktop;
    }
    return userOnboardingTourDesktop;
  };

  if (status === "loading") {
    return <>{children}</>;
  }

  return (
    <OnbordaProvider>
      <Onborda
        steps={getCurrentTourSteps()}
        showOnborda={showTour}
        cardComponent={CustomTourCard}
        shadowRgb="0, 0, 0"
        shadowOpacity="0.6"
      >
        {children}
      </Onborda>
    </OnbordaProvider>
  );
}
