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
import { useViewportConstraints } from "@/hooks/use-viewport-constraints";

interface TourProviderProps {
  children: React.ReactNode;
}

// Component that handles tour triggering using useOnborda hook
function TourTrigger() {
  const { data: session, status } = useSession();
  const { startOnborda } = useOnborda();
  const [tourStatusChecked, setTourStatusChecked] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before accessing browser APIs
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (
      mounted &&
      status === "authenticated" &&
      session?.user?.role === "USER" &&
      !tourStatusChecked
    ) {
      const triggerTour = async () => {
        try {
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
  }, [mounted, session, status, tourStatusChecked, startOnborda]);

  // Listen for custom event to show tour after dashboard loads
  useEffect(() => {
    if (!mounted) return;

    const handleShowTour = () => {
      try {
        const isMobile =
          typeof window !== "undefined" && window.innerWidth < 768;
        const tourName = isMobile
          ? "userOnboardingMobile"
          : "userOnboardingDesktop";
        startOnborda(tourName);
      } catch (error) {
        console.error("Error showing tour:", error);
      }
    };

    window.addEventListener("show-tour", handleShowTour);

    return () => {
      window.removeEventListener("show-tour", handleShowTour);
    };
  }, [mounted, startOnborda]);

  return null; // This component doesn't render anything
}

export function TourProvider({ children }: TourProviderProps) {
  const [mounted, setMounted] = useState(false);
  const [currentSteps, setCurrentSteps] = useState(userOnboardingTourDesktop);

  // Ensure component is mounted before accessing browser APIs
  useEffect(() => {
    setMounted(true);
  }, []);

  // Apply viewport constraints only after mounting
  useViewportConstraints();

  // Determine which tour to show based on current page and screen size
  useEffect(() => {
    if (!mounted) return;

    const getCurrentTourSteps = () => {
      try {
        if (typeof window !== "undefined") {
          const pathname = window.location.pathname;
          if (pathname.includes("/documents")) {
            return documentUploadTour;
          }

          // Check if it's mobile view (screen width < 768px)
          const isMobile = window.innerWidth < 768;
          return isMobile
            ? userOnboardingTourMobile
            : userOnboardingTourDesktop;
        }
        return userOnboardingTourDesktop;
      } catch (error) {
        console.error("Error determining tour steps:", error);
        return userOnboardingTourDesktop;
      }
    };

    setCurrentSteps(getCurrentTourSteps());
  }, [mounted]);

  // Don't render Onborda until mounted to prevent SSR issues
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <OnbordaProvider>
      <Onborda
        steps={currentSteps}
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
