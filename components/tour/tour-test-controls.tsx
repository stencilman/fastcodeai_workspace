"use client";

import { Button } from "@/components/ui/button";
import { useOnborda } from "onborda";

export function TourTestControls() {
  const { startOnborda } = useOnborda();

  const handleStartTour = () => {
    // Check if it's mobile view and start appropriate tour
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const tourName = isMobile
      ? "userOnboardingMobile"
      : "userOnboardingDesktop";
    startOnborda(tourName);
  };

  const handleResetTour = () => {
    localStorage.removeItem("fastcodeai-tour-completed");
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 bg-white p-3 rounded-lg shadow-lg border">
      <Button onClick={handleStartTour} size="sm" className="w-full">
        🎯 Start Tour
      </Button>
      <Button
        onClick={handleResetTour}
        variant="outline"
        size="sm"
        className="w-full"
      >
        🔄 Reset Tour
      </Button>
    </div>
  );
}
