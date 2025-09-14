"use client";

import { useEffect, useState } from "react";

// Hook to ensure tour cards stay within viewport
export function useViewportConstraints() {
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before accessing browser APIs
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const constrainTourCards = () => {
      try {
        const tourCards = document.querySelectorAll("[data-onborda-card]");

        tourCards.forEach((card) => {
          const rect = card.getBoundingClientRect();
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;

          // Check if card is going off-screen
          let needsRepositioning = false;
          let newLeft = rect.left;
          let newTop = rect.top;

          // Check right boundary
          if (rect.right > viewportWidth - 16) {
            newLeft = viewportWidth - rect.width - 16;
            needsRepositioning = true;
          }

          // Check bottom boundary
          if (rect.bottom > viewportHeight - 16) {
            newTop = viewportHeight - rect.height - 16;
            needsRepositioning = true;
          }

          // Check left boundary
          if (rect.left < 16) {
            newLeft = 16;
            needsRepositioning = true;
          }

          // Check top boundary
          if (rect.top < 16) {
            newTop = 16;
            needsRepositioning = true;
          }

          // Apply repositioning if needed
          if (needsRepositioning) {
            (card as HTMLElement).style.left = `${newLeft}px`;
            (card as HTMLElement).style.top = `${newTop}px`;
          }
        });
      } catch (error) {
        console.error("Error constraining tour cards:", error);
      }
    };

    // Run constraint check after a short delay to allow Onborda to position
    const timer = setTimeout(constrainTourCards, 100);

    // Also run on window resize
    window.addEventListener("resize", constrainTourCards);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", constrainTourCards);
    };
  }, [mounted]);
}
