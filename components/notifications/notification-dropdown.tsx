"use client";

import { NotificationItem } from './notification-item';
import { useNotifications } from '@/contexts/notification-context';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BellOff } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { UserRole } from '@prisma/client';

interface NotificationDropdownProps {
  maxItems?: number;
}

export function NotificationDropdown({ maxItems = 5 }: NotificationDropdownProps) {
  const { notifications, markAllAsRead, unreadCount } = useNotifications();
  const { data: session } = useSession();
  
  // Determine if user is admin
  const isAdmin = session?.user?.role === UserRole.ADMIN;
  
  // Set the correct notifications path based on user role
  const notificationsPath = isAdmin ? '/admin/notifications' : '/user/notifications';
  const recentNotifications = notifications.slice(0, maxItems);
  
  return (
    <div className="w-80 py-2 flex flex-col">
      <div className="flex justify-between items-center px-4 py-2 border-b">
        <h3 className="font-medium">Notifications</h3>
        {unreadCount > 0 && (
          <Button 
            onClick={markAllAsRead}
            variant="ghost"
            size="sm"
            className="text-xs text-blue-600 hover:text-blue-800 h-8 px-2"
          >
            Mark all as read
          </Button>
        )}
      </div>
      
      <div className="flex-1">
        {recentNotifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500 flex flex-col items-center">
            <BellOff className="h-8 w-8 text-gray-300 mb-2" />
            <p>No notifications</p>
          </div>
        ) : (
          recentNotifications.map(notification => (
            <NotificationItem 
              key={notification.id} 
              notification={notification} 
            />
          ))
        )}
      </div>
      
      <div className="px-4 py-2 border-t text-center mt-auto">
        <Link 
          href={notificationsPath}
          className="text-sm text-blue-600 hover:text-blue-800 block w-full"
        >
          View all notifications
        </Link>
      </div>
    </div>
  );
}
