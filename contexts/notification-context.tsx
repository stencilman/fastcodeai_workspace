"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Notification } from '@/models/notification';
import { mockNotifications } from '@/lib/mock-data/notifications';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  fetchNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  markAsRead: () => {},
  markAllAsRead: () => {},
  deleteNotification: () => {},
  fetchNotifications: () => {},
});

export const useNotifications = () => useContext(NotificationContext);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load mock notifications on initial render
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Update unread count whenever notifications change
  useEffect(() => {
    const count = notifications.filter(notification => !notification.isRead).length;
    setUnreadCount(count);
  }, [notifications]);

  const fetchNotifications = () => {
    // In a real implementation, this would fetch from an API
    setNotifications(mockNotifications);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true } 
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== id)
    );
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
