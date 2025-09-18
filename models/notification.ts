import { DocumentType } from './document';

export type NotificationType = 'document_uploaded' | 'document_approved' | 'document_rejected';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
  documentId?: string | null;   // ID of the document related to this notification
  documentType?: DocumentType | null; // Type of document from DocumentType enum
  relatedLink?: string | null;  // URL to navigate to when clicking the notification
}

export interface CreateNotificationInput {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  documentId?: string | null;
  documentType?: DocumentType | null;
  relatedLink?: string | null;
}

export interface UpdateNotificationInput {
  id: string;
  isRead?: boolean;
}

export interface NotificationResponse {
  notifications: Notification[];
  unreadCount: number;
  totalCount: number;
}
