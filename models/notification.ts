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
  documentId?: string;
  documentType?: DocumentType;
  relatedLink?: string;
}

export interface CreateNotificationInput {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  documentId?: string;
  documentType?: DocumentType;
  relatedLink?: string;
}

export interface UpdateNotificationInput {
  id: string;
  isRead?: boolean;
}

export interface NotificationResponse {
  notifications: Notification[];
  unreadCount: number;
}
