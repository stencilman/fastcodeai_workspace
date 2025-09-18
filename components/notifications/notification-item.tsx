"use client";

import { Notification } from "@/models/notification";
import { useNotifications } from "@/contexts/notification-context";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { CheckCircle, AlertCircle, Upload, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/utils";

interface NotificationItemProps {
  notification: Notification;
  showActions?: boolean;
  className?: string;
}

export function NotificationItem({
  notification,
  showActions = false,
  className,
}: NotificationItemProps) {
  const { markAsRead, deleteNotification } = useNotifications();

  const icons = {
    document_uploaded: <Upload className="h-4 w-4 text-blue-500" />,
    document_approved: <CheckCircle className="h-4 w-4 text-green-500" />,
    document_rejected: <AlertCircle className="h-4 w-4 text-red-500" />,
  };

  const handleClick = () => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    deleteNotification(notification.id);
  };

  return (
    <div
      className={cn(
        "block px-4 py-3 hover:bg-gray-50 border-b last:border-b-0",
        !notification.isRead ? "bg-blue-50" : "",
        className
      )}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-1">{icons[notification.type]}</div>
        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <Link
              href={notification.relatedLink || "#"}
              onClick={handleClick}
              className="block"
            >
              <p className="text-sm font-medium">{notification.title}</p>
            </Link>

            {showActions && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            )}
          </div>

          <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
          <p className="text-xs text-gray-400 mt-1">
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
