"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { OnbordaProvider, Onborda, useOnborda } from "onborda";
import { CustomTourCard } from "./custom-tour-card";
import {
  userOnboardingTourDesktop,
  userOnboardingTourMobile,
  documentUploadTour,
} from "@/lib/tour-config";
import { tourUtils } from "@/lib/tour-utils";
import { useViewportConstraints } from "@/hooks/use-viewport-constraints";

interface TourProviderProps {
  children: React.ReactNode;
}

// Component that handles tour triggering using useOnborda hook
function TourTrigger() {
  const { data: session, status } = useSession();
  const { startOnborda } = useOnborda();
  const [tourStatusChecked, setTourStatusChecked] = useState(false);

  useEffect(() => {
    if (
      status === "authenticated" &&
      session?.user?.role === "USER" &&
      !tourStatusChecked
    ) {
      const triggerTour = async () => {
        try {
          // Check if manually marked as new (for testing)
          const isManuallyMarkedNew = tourUtils.isManuallyMarkedNew();

          if (isManuallyMarkedNew) {
            const isMobile =
              typeof window !== "undefined" && window.innerWidth < 768;
            const tourName = isMobile
              ? "userOnboardingMobile"
              : "userOnboardingDesktop";
            startOnborda(tourName);
            setTourStatusChecked(true);
            return;
          }

          // For production, only trigger tour via custom event from dashboard
          // Don't trigger tour automatically on login
          setTourStatusChecked(true);
        } catch (error) {
          console.error("Error in tour trigger:", error);
          setTourStatusChecked(true);
        }
      };

      // Trigger tour immediately
      triggerTour();
    }
  }, [session, status, tourStatusChecked, startOnborda]);

  // Listen for custom event to show tour after dashboard loads
  useEffect(() => {
    const handleShowTour = () => {
      const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
      const tourName = isMobile
        ? "userOnboardingMobile"
        : "userOnboardingDesktop";
      startOnborda(tourName);
    };

    window.addEventListener("show-tour", handleShowTour);

    return () => {
      window.removeEventListener("show-tour", handleShowTour);
    };
  }, [startOnborda]);

  return null; // This component doesn't render anything
}

export function TourProvider({ children }: TourProviderProps) {
  // Apply viewport constraints to keep tour cards within screen bounds
  useViewportConstraints();

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

  return (
    <OnbordaProvider>
      <Onborda
        steps={getCurrentTourSteps()}
        cardComponent={CustomTourCard}
        shadowRgb="0, 0, 0"
        shadowOpacity="0.6"
      >
        {children}
        <TourTrigger />
      </Onborda>
    </OnbordaProvider>
  );
}
