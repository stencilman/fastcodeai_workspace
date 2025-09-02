import { Document, DocumentStatus, DocumentType } from "@/models/document";

// Sample document data with URLs to external images/PDFs
export const documents: Document[] = [
    {
        id: "doc1",
        userId: "1", // John Doe
        type: DocumentType.PAN_CARD,
        s3Key: "https://picsum.photos/id/1018/800/600", // Random image from Lorem Picsum
        status: DocumentStatus.PENDING,
        uploadedAt: new Date("2025-08-15"),
    },
    {
        id: "doc2",
        userId: "1", // John Doe
        type: DocumentType.AADHAR_CARD,
        s3Key: "https://picsum.photos/id/1015/800/600",
        status: DocumentStatus.APPROVED,
        uploadedAt: new Date("2025-08-10"),
        reviewedBy: "3", // Admin User
        reviewedAt: new Date("2025-08-12"),
    },
    {
        id: "doc3",
        userId: "2", // Jane Smith
        type: DocumentType.CANCELLED_CHEQUE,
        s3Key: "https://picsum.photos/id/1019/800/600",
        status: DocumentStatus.REJECTED,
        uploadedAt: new Date("2025-08-05"),
        reviewedBy: "3", // Admin User
        reviewedAt: new Date("2025-08-07"),
        notes: "Image is not clear, please upload a better quality image",
    },
    {
        id: "doc4",
        userId: "2", // Jane Smith
        type: DocumentType.OFFER_LETTER,
        s3Key: "https://www.fsa.usda.gov/Internet/FSA_File/tech_assist.pdf", // Sample PDF
        status: DocumentStatus.PENDING,
        uploadedAt: new Date("2025-08-18"),
    },
];

// Helper function to get documents by user ID
export function getDocumentsByUserId(userId: string): Document[] {
    return documents.filter(doc => doc.userId === userId);
}

// Helper function to get a document by ID
export function getDocumentById(id: string): Document | undefined {
    return documents.find(doc => doc.id === id);
}

// Helper function to update document status
export function updateDocumentStatus(
    id: string,
    status: DocumentStatus,
    reviewerId: string,
    notes?: string
): Document | null {
    const docIndex = documents.findIndex(doc => doc.id === id);

    if (docIndex === -1) return null;

    documents[docIndex] = {
        ...documents[docIndex],
        status,
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
        notes: notes || documents[docIndex].notes,
    };

    return documents[docIndex];
}
