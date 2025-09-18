"use client";

import { useNotifications } from '@/contexts/notification-context';
import { NotificationItem } from '@/components/notifications/notification-item';
import { Button } from '@/components/ui/button';
import { BellOff } from 'lucide-react';

export default function UserNotificationsPage() {
  const { notifications, markAllAsRead, unreadCount } = useNotifications();
  
  // Filter notifications for the current user (non-admin notifications)
  const userNotifications = notifications.filter(
    notification => notification.type !== 'document_uploaded'
  );
  
  return (
    <>
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-muted-foreground mt-1">
              {unreadCount > 0 
                ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` 
                : 'All notifications are read'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button 
              onClick={markAllAsRead}
              variant="outline"
              size="sm"
              className="text-sm"
            >
              Mark all as read
            </Button>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-4 border-b bg-slate-50">
          <h2 className="font-medium">Recent Activity</h2>
        </div>
        
        {userNotifications.length === 0 ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <BellOff className="h-12 w-12 text-gray-300 mb-3" />
            <p className="font-medium mb-1">No notifications</p>
            <p className="text-sm text-muted-foreground">You don't have any notifications at the moment</p>
          </div>
        ) : (
          <div className="divide-y">
            {userNotifications.map(notification => (
              <NotificationItem 
                key={notification.id} 
                notification={notification}
                showActions={true}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
