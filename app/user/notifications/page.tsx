"use client";

import { useNotifications } from '@/contexts/notification-context';
import { NotificationItem } from '@/components/notifications/notification-item';
import { Button } from '@/components/ui/button';
import { BellOff, AlertCircle, Loader2, RefreshCw, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useCallback } from 'react';

export default function UserNotificationsPage() {
  const { 
    notifications, 
    markAllAsRead, 
    unreadCount, 
    isLoading, 
    isError, 
    error, 
    refetchNotifications,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useNotifications();
  
  // Filter notifications for the current user (non-admin notifications)
  const userNotifications = notifications.filter(
    notification => notification.type !== 'document_uploaded'
  );
  
  // Intersection observer for infinite scrolling
  const observerTarget = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    const element = observerTarget.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "0px",
      threshold: 1.0,
    });

    observer.observe(element);

    return () => {
      observer.unobserve(element);
      observer.disconnect();
    };
  }, [handleObserver]);
  
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
        
        {isLoading ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <Loader2 className="h-12 w-12 text-gray-300 mb-3 animate-spin" />
            <p className="font-medium mb-1">Loading notifications...</p>
            <p className="text-sm text-muted-foreground">Please wait while we fetch your notifications</p>
          </div>
        ) : isError ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <AlertCircle className="h-12 w-12 text-red-300 mb-3" />
            <p className="text-red-500 font-medium mb-1">Failed to load notifications</p>
            <p className="text-sm text-muted-foreground mb-4">There was an error loading your notifications</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={() => refetchNotifications()}
            >
              <RefreshCw className="h-4 w-4" /> Try again
            </Button>
          </div>
        ) : userNotifications.length === 0 ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <BellOff className="h-12 w-12 text-gray-300 mb-3" />
            <p className="font-medium mb-1">No notifications</p>
            <p className="text-sm text-muted-foreground">You don't have any notifications at the moment</p>
          </div>
        ) : (
          <>
            <div className="divide-y">
              {userNotifications.map(notification => (
                <NotificationItem 
                  key={notification.id} 
                  notification={notification}
                  showActions={true}
                />
              ))}
            </div>
            
            {/* Loading indicator for infinite scroll */}
            <div ref={observerTarget} className="py-4 flex justify-center">
              {isFetchingNextPage ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  <span className="text-sm text-gray-500">Loading more...</span>
                </div>
              ) : hasNextPage ? (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => fetchNextPage()}
                  className="text-sm text-gray-500 flex items-center gap-1"
                >
                  <ChevronDown className="h-4 w-4" />
                  Load more
                </Button>
              ) : userNotifications.length > 0 ? (
                <span className="text-sm text-gray-500">No more notifications</span>
              ) : null}
            </div>
          </>
        )}
      </div>
    </>
  );
}
