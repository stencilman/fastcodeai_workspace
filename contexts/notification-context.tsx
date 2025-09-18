"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Notification, NotificationResponse } from "@/models/notification";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient, useInfiniteQuery, InfiniteData } from "@tanstack/react-query";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refetchNotifications: () => Promise<void>;
  fetchNextPage: () => Promise<void>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
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
  fetchNextPage: async () => {},
  hasNextPage: false,
  isFetchingNextPage: false,
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

  // Fetch notifications with infinite query
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage: fetchNext,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery<NotificationResponse, Error, InfiniteData<NotificationResponse>, string[], string | null>({
    queryKey: ["notifications"],
    queryFn: async ({ pageParam }) => {
      if (!session?.user) {
        return { notifications: [], unreadCount: 0, totalCount: 0, nextCursor: null, hasMore: false };
      }

      const url = new URL("/api/notifications", window.location.origin);
      if (pageParam) {
        url.searchParams.set("cursor", pageParam);
      }
      url.searchParams.set("pageSize", "10");

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      return response.json();
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!session?.user,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Combine notifications from all pages
  const notifications = data?.pages.flatMap((page: NotificationResponse) => page.notifications || []) || [];
  const unreadCount = data?.pages[0]?.unreadCount || 0;

  // Function to refetch notifications
  const refetchNotifications = async () => {
    await refetch();
  };
  
  // Function to fetch next page
  const fetchNextPage = async () => {
    if (hasNextPage) {
      await fetchNext();
    }
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
      const previousData = queryClient.getQueryData<InfiniteData<NotificationResponse>>(["notifications"]);

      // Optimistically update to the new value
      if (previousData) {
        // Count how many unread notifications will be marked as read
        let markedAsReadCount = 0;

        // Update all pages
        const updatedPages = previousData.pages.map(page => {
          // Update notifications in this page
          const updatedNotifications = page.notifications.map(notification => {
            if (notification.id === id && !notification.isRead) {
              markedAsReadCount++;
              return { ...notification, isRead: true };
            }
            return notification;
          });

          // Calculate new unread count for this page
          const newUnreadCount = Math.max(0, page.unreadCount - markedAsReadCount);

          return {
            ...page,
            notifications: updatedNotifications,
            unreadCount: newUnreadCount
          };
        });

        queryClient.setQueryData<InfiniteData<NotificationResponse>>(["notifications"], {
          ...previousData,
          pages: updatedPages
        });
      }

      return { previousData };
    },
    onError: (err, _, context) => {
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
      const response = await fetch(`/api/notifications/read-all`, {
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
      const previousData = queryClient.getQueryData<InfiniteData<NotificationResponse>>(["notifications"]);

      // Optimistically update to the new value
      if (previousData) {
        const updatedPages = previousData.pages.map(page => ({
          ...page,
          notifications: page.notifications.map(notification => ({
            ...notification,
            isRead: true
          })),
          unreadCount: 0
        }));

        queryClient.setQueryData<InfiniteData<NotificationResponse>>(["notifications"], {
          ...previousData,
          pages: updatedPages
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
      const previousData = queryClient.getQueryData<InfiniteData<NotificationResponse>>(["notifications"]);

      // Optimistically update to the new value
      if (previousData) {
        // Track if the deleted notification was unread
        let wasUnread = false;
        let decrementTotal = 0;

        // Update all pages
        const updatedPages = previousData.pages.map(page => {
          // Find the notification in this page
          const deletedNotification = page.notifications.find(n => n.id === id);
          if (deletedNotification) {
            // If found, check if it was unread
            if (!deletedNotification.isRead) {
              wasUnread = true;
            }
            decrementTotal = 1;
          }

          // Filter out the deleted notification
          const updatedNotifications = page.notifications.filter(
            notification => notification.id !== id
          );

          // Calculate new unread count for this page
          const newUnreadCount = wasUnread
            ? Math.max(0, page.unreadCount - 1)
            : page.unreadCount;

          // Calculate new total count
          const newTotalCount = Math.max(0, page.totalCount - decrementTotal);

          return {
            ...page,
            notifications: updatedNotifications,
            unreadCount: newUnreadCount,
            totalCount: newTotalCount
          };
        });

        queryClient.setQueryData<InfiniteData<NotificationResponse>>(["notifications"], {
          ...previousData,
          pages: updatedPages
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
        fetchNextPage,
        hasNextPage: !!hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        error,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
