import { DocumentType } from "@/models/document";
import { FileText } from "lucide-react";

// Define required document types
export const requiredDocuments = [
  {
    type: DocumentType.AADHAR_CARD,
    label: "Aadhaar Card",
    description: "Upload your Aadhaar card (front and back)",
    icon: FileText,
  },
  {
    type: DocumentType.PAN_CARD,
    label: "PAN Card",
    description: "Upload your PAN card",
    icon: FileText,
  },
  {
    type: DocumentType.CANCELLED_CHEQUE,
    label: "Cancelled Cheque",
    description: "Upload a cancelled cheque for bank verification",
    icon: FileText,
  },
  {
    type: DocumentType.OFFER_LETTER,
    label: "Offer Letter",
    description: "Upload your signed offer letter",
    icon: FileText,
  },
];

// Document type display names
export const documentTypeNames: Record<DocumentType, string> = {
  [DocumentType.PAN_CARD]: "PAN Card",
  [DocumentType.AADHAR_CARD]: "Aadhaar Card",
  [DocumentType.CANCELLED_CHEQUE]: "Cancelled Cheque",
  [DocumentType.OFFER_LETTER]: "Offer Letter",
};
