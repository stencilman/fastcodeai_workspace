import { Notification } from '@/models/notification';
import { DocumentType } from '@/models/document';
import { addHours, addMinutes, addDays } from 'date-fns';

// Helper function to create dates relative to now
const getRelativeDate = (days = 0, hours = 0, minutes = 0) => {
  let date = new Date();
  if (days) date = addDays(date, -days);
  if (hours) date = addHours(date, -hours);
  if (minutes) date = addMinutes(date, -minutes);
  return date;
};

export const mockNotifications: Notification[] = [
  {
    id: '1',
    userId: 'current-user',
    title: 'Passport Approved',
    message: 'Your passport document has been approved by the admin.',
    type: 'document_approved',
    isRead: false,
    createdAt: getRelativeDate(0, 0, 30), // 30 minutes ago
    updatedAt: getRelativeDate(0, 0, 30),
    documentId: 'doc-123',
    documentType: DocumentType.PAN_CARD,
    relatedLink: '/user/documents',
  },
  {
    id: '2',
    userId: 'admin-user',
    title: 'New Document Uploaded',
    message: 'User John Doe has uploaded a new address proof document for review.',
    type: 'document_uploaded',
    isRead: false,
    createdAt: getRelativeDate(0, 2, 0), // 2 hours ago
    updatedAt: getRelativeDate(0, 2, 0),
    documentId: 'doc-789',
    documentType: DocumentType.AADHAR_CARD,
    relatedLink: '/admin/documents',
  },
  {
    id: '3',
    userId: 'current-user',
    title: 'ID Proof Rejected',
    message: 'Your ID proof document was rejected. Please upload a clearer image.',
    type: 'document_rejected',
    isRead: true,
    createdAt: getRelativeDate(1, 0, 0), // 1 day ago
    updatedAt: getRelativeDate(1, 0, 0),
    documentId: 'doc-456',
    documentType: DocumentType.AADHAR_CARD,
    relatedLink: '/user/documents',
  },
  {
    id: '4',
    userId: 'admin-user',
    title: 'New Document Uploaded',
    message: 'User Sarah Smith has uploaded a new passport document for review.',
    type: 'document_uploaded',
    isRead: false,
    createdAt: getRelativeDate(2, 3, 0), // 2 days and 3 hours ago
    updatedAt: getRelativeDate(2, 3, 0),
    documentId: 'doc-321',
    documentType: DocumentType.PAN_CARD,
    relatedLink: '/admin/documents',
  },
  {
    id: '5',
    userId: 'current-user',
    title: 'Address Proof Approved',
    message: 'Your address proof document has been approved.',
    type: 'document_approved',
    isRead: true,
    createdAt: getRelativeDate(3, 0, 0), // 3 days ago
    updatedAt: getRelativeDate(3, 0, 0),
    documentId: 'doc-555',
    documentType: DocumentType.CANCELLED_CHEQUE,
    relatedLink: '/user/documents',
  },
  {
    id: '6',
    userId: 'admin-user',
    title: 'New Document Uploaded',
    message: 'User Michael Johnson has uploaded a new ID proof document for review.',
    type: 'document_uploaded',
    isRead: true,
    createdAt: getRelativeDate(4, 0, 0), // 4 days ago
    updatedAt: getRelativeDate(4, 0, 0),
    documentId: 'doc-654',
    documentType: DocumentType.OFFER_LETTER,
    relatedLink: '/admin/documents',
  },
];
