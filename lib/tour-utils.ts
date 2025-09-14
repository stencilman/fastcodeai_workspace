// Utility functions for tour management using database
export const tourUtils = {
  // Check tour completion status via API
  checkTourStatus: async () => {
    try {
      const response = await fetch("/api/users/tour-status", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to check tour status");
      }

      const data = await response.json();
      return data.tourCompleted;
    } catch (error) {
      console.error("Error checking tour status:", error);
      // Default to showing tour if API call fails
      return false;
    }
  },

  // Mark tour as completed via API
  markTourCompleted: async () => {
    try {
      const response = await fetch("/api/users/tour-completion", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tourCompleted: true }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark tour as completed");
      }

      return await response.json();
    } catch (error) {
      console.error("Error marking tour as completed:", error);
      throw error;
    }
  },

  // Check if tour is completed (from session data - fallback)
  isTourCompleted: (sessionTourCompleted?: boolean) => {
    return sessionTourCompleted === true;
  },
};
