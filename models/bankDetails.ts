export interface BankDetails {
    id: string;
    userId: string;
    accountHolderName: string;
    bankName: string;
    accountNumber: string; // ideally store encrypted
    ifscCode: string;
    branch?: string;
    uploadedCancelledChequeS3Key?: string; // link to cancelled cheque document
    verified: boolean;
    verifiedAt?: Date;
    verifiedBy?: string; // admin id
}
