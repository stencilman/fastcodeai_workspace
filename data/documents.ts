import { Document, DocumentStatus, DocumentType } from "@/models/document";
import { db } from "@/lib/db";

// Get all documents for a user
export async function getUserDocuments(userId: string) {
    try {
        const documents = await db.document.findMany({
            where: { userId },
            orderBy: { uploadedAt: 'desc' },
        });
        return documents;
    } catch (error) {
        console.error("Error fetching user documents:", error);
        throw error;
    }
}

// Get a document by ID
export async function getDocumentById(id: string) {
    try {
        const document = await db.document.findUnique({
            where: { id },
        });
        return document;
    } catch (error) {
        console.error("Error fetching document by ID:", error);
        throw error;
    }
}

// Create a new document
export async function createDocument(data: {
    userId: string;
    type: DocumentType;
    fileName: string;
    fileSize: number;
    fileType: string;
    s3Key: string;
}) {
    try {
        const document = await db.document.create({
            data: {
                ...data,
                status: DocumentStatus.PENDING,
                uploadedAt: new Date(),
            },
        });
        return document;
    } catch (error) {
        console.error("Error creating document:", error);
        throw error;
    }
}

// Update document status (for admin review)
export async function updateDocumentStatus(
    id: string,
    status: DocumentStatus,
    reviewerId: string,
    notes?: string
) {
    try {
        // When approving a document, explicitly set notes to null
        const updateData: {
            status: DocumentStatus;
            reviewedBy: string;
            reviewedAt: Date;
            notes?: string | null;
        } = {
            status,
            reviewedBy: reviewerId,
            reviewedAt: new Date(),
        };
        
        // If status is APPROVED, explicitly set notes to null
        if (status === DocumentStatus.APPROVED) {
            updateData.notes = null;
        } else if (notes !== undefined) {
            // For other statuses, only set notes if provided
            updateData.notes = notes;
        }
        
        const document = await db.document.update({
            where: { id },
            data: updateData,
        });
        return document;
    } catch (error) {
        console.error("Error updating document status:", error);
        throw error;
    }
}

// Delete a document
export async function deleteDocument(id: string) {
    try {
        const document = await db.document.delete({
            where: { id },
        });
        return document;
    } catch (error) {
        console.error("Error deleting document:", error);
        throw error;
    }
}

// Get documents by type for a user
export async function getUserDocumentsByType(userId: string, type: DocumentType) {
    try {
        const documents = await db.document.findMany({
            where: {
                userId,
                type
            },
            orderBy: { uploadedAt: 'desc' },
        });
        return documents;
    } catch (error) {
        console.error("Error fetching user documents by type:", error);
        throw error;
    }
}

// Get all pending documents (for admin review)
export async function getPendingDocuments() {
    try {
        const documents = await db.document.findMany({
            where: { status: DocumentStatus.PENDING },
            orderBy: { uploadedAt: 'asc' },
            include: { user: true },
        });
        return documents;
    } catch (error) {
        console.error("Error fetching pending documents:", error);
        throw error;
    }
}
