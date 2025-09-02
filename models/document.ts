export enum DocumentType {
    PAN_CARD = 'PAN_CARD',
    AADHAR_CARD = 'AADHAR_CARD',
    CANCELLED_CHEQUE = 'CANCELLED_CHEQUE',
    OFFER_LETTER = 'OFFER_LETTER',
}

export enum DocumentStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
}

export interface Document {
    id: string;
    userId: string;
    type: DocumentType;
    s3Key: string; // path/key in S3 bucket
    status: DocumentStatus;
    uploadedAt: Date;
    reviewedBy?: string; // admin userId
    reviewedAt?: Date;
    notes?: string;
}
