"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Notification, NotificationResponse } from "@/models/notification";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refetchNotifications: () => Promise<void>;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  deleteNotification: async () => {},
  refetchNotifications: async () => {},
  isLoading: false,
  isError: false,
  error: null,
});

export const useNotifications = () => useContext(NotificationContext);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  // Fetch notifications query
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: async (): Promise<NotificationResponse> => {
      if (!session?.user) {
        return { notifications: [], unreadCount: 0, totalCount: 0 };
      }

      const response = await fetch("/api/notifications");

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      return response.json();
    },
    enabled: !!session?.user,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 1000 * 60 * 5, // 5 minutes
    placeholderData: { notifications: [], unreadCount: 0, totalCount: 0 },
  });

  // Extract notifications and unread count from query data
  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  // Function to refetch notifications
  const refetchNotifications = async () => {
    await refetch();
  };

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error("Failed to mark notification as read");
      }

      return response.json();
    },
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["notifications"] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<NotificationResponse>([
        "notifications",
      ]);

      // Optimistically update to the new value
      if (previousData) {
        const updatedNotifications = previousData.notifications.map(
          (notification) =>
            notification.id === id
              ? { ...notification, isRead: true }
              : notification
        );

        const newUnreadCount = Math.max(0, previousData.unreadCount - 1);

        queryClient.setQueryData<NotificationResponse>(["notifications"], {
          ...previousData,
          notifications: updatedNotifications,
          unreadCount: newUnreadCount,
        });
      }

      return { previousData };
    },
    onError: (err, id, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousData) {
        queryClient.setQueryData(["notifications"], context.previousData);
      }
      console.error("Error marking notification as read:", err);
      toast.error("Failed to mark notification as read");
    },
    onSettled: () => {
      // Always refetch after error or success to make sure our local data is correct
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAsRead = async (id: string) => {
    await markAsReadMutation.mutateAsync(id);
  };

  // Mark all notifications as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/notifications/read-all", {
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error("Failed to mark all notifications as read");
      }

      return response.json();
    },
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["notifications"] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<NotificationResponse>([
        "notifications",
      ]);

      // Optimistically update to the new value
      if (previousData) {
        const updatedNotifications = previousData.notifications.map(
          (notification) => ({ ...notification, isRead: true })
        );

        queryClient.setQueryData<NotificationResponse>(["notifications"], {
          ...previousData,
          notifications: updatedNotifications,
          unreadCount: 0,
        });
      }

      return { previousData };
    },
    onError: (err, _, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousData) {
        queryClient.setQueryData(["notifications"], context.previousData);
      }
      console.error("Error marking all notifications as read:", err);
      toast.error("Failed to mark all notifications as read");
    },
    onSettled: () => {
      // Always refetch after error or success to make sure our local data is correct
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllAsRead = async () => {
    await markAllAsReadMutation.mutateAsync();
  };

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete notification");
      }

      return response.json();
    },
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["notifications"] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<NotificationResponse>([
        "notifications",
      ]);

      // Optimistically update to the new value
      if (previousData) {
        const deletedNotification = previousData.notifications.find(
          (n) => n.id === id
        );
        const wasUnread = deletedNotification && !deletedNotification.isRead;

        const updatedNotifications = previousData.notifications.filter(
          (notification) => notification.id !== id
        );

        const newUnreadCount = wasUnread
          ? Math.max(0, previousData.unreadCount - 1)
          : previousData.unreadCount;

        queryClient.setQueryData<NotificationResponse>(["notifications"], {
          ...previousData,
          notifications: updatedNotifications,
          unreadCount: newUnreadCount,
          totalCount: previousData.totalCount - 1,
        });
      }

      return { previousData };
    },
    onError: (err, id, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousData) {
        queryClient.setQueryData(["notifications"], context.previousData);
      }
      console.error("Error deleting notification:", err);
      toast.error("Failed to delete notification");
    },
    onSuccess: () => {
      toast.success("Notification deleted");
    },
    onSettled: () => {
      // Always refetch after error or success to make sure our local data is correct
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const deleteNotification = async (id: string) => {
    await deleteNotificationMutation.mutateAsync(id);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refetchNotifications,
        isLoading,
        isError,
        error,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
