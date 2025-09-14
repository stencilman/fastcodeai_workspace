"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useOnborda } from "onborda";

export function TourTestButton() {
  const { startOnborda } = useOnborda();
  const [isVisible, setIsVisible] = useState(false);

  const handleStartTour = () => {
    startOnborda("userOnboarding");
    setIsVisible(true);
  };

  const handleResetTour = () => {
    localStorage.removeItem("fastcodeai-tour-completed");
    setIsVisible(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      <Button onClick={handleStartTour} size="sm">
        Start Tour
      </Button>
      <Button onClick={handleResetTour} variant="outline" size="sm">
        Reset Tour
      </Button>
    </div>
  );
}
