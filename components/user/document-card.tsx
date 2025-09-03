"use client";

import { Document, DocumentStatus, DocumentType } from "@/models/document";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loading } from "@/components/ui/loading";
import {
  FileText,
  FileImage,
  CreditCard,
  FileCheck,
  Download,
  Upload,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { requiredDocuments } from "./file-upload-drawer";

interface DocumentCardProps {
  document?: Document;
  docType: DocumentType;
  onClick: () => void;
}

export function DocumentCard({
  document,
  docType,
  onClick,
}: DocumentCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pdfError, setPdfError] = useState(false);

  // Get document details from type
  const docDetails = requiredDocuments.find((doc) => doc.type === docType);
  const isUploaded = !!document;

  // Get appropriate icon based on document type
  const getDocumentIcon = () => {
    switch (docType) {
      case DocumentType.PAN_CARD:
        return <CreditCard className="h-12 w-12 text-blue-500" />;
      case DocumentType.AADHAR_CARD:
        return <FileImage className="h-12 w-12 text-green-500" />;
      case DocumentType.CANCELLED_CHEQUE:
        return <FileCheck className="h-12 w-12 text-amber-500" />;
      case DocumentType.OFFER_LETTER:
        return <FileText className="h-12 w-12 text-purple-500" />;
      default:
        return <FileText className="h-12 w-12 text-gray-500" />;
    }
  };

  // Get status badge color
  const getStatusBadge = () => {
    if (!document) {
      return (
        <Badge
          variant="outline"
          className="bg-slate-50 text-slate-700 border-slate-200 flex items-center gap-1"
        >
          <Upload className="h-4 w-4" />
          <span>Upload Now</span>
        </Badge>
      );
    }

    switch (document.status) {
      case DocumentStatus.PENDING:
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1"
          >
            <Clock className="h-4 w-4" />
            <span>Pending</span>
          </Badge>
        );
      case DocumentStatus.APPROVED:
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Approved</span>
          </Badge>
        );
      case DocumentStatus.REJECTED:
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1"
          >
            <AlertCircle className="h-4 w-4" />
            <span>Rejected</span>
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const openDialog = () => {
    if (!document) return;
    setDialogOpen(true);
    setIsLoading(true);

    // Set a timeout to handle PDFs that never trigger onLoad
    if (isPdf) {
      setTimeout(() => {
        setIsLoading(false);
      }, 3000);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    if (isPdf) {
      setPdfError(true);
    }
  };

  const isPdf = document?.s3Key?.toLowerCase().endsWith(".pdf") || false;
  const documentName =
    document?.s3Key?.split("/").pop() || docDetails?.label || "Document";

  return (
    <>
      <Card
        className="overflow-hidden cursor-pointer hover:border-primary transition-colors"
        onClick={onClick}
      >
        <div className="p-4 flex flex-col md:flex-row md:items-center gap-4">
          <div
            className={cn(
              "bg-slate-100 p-3 rounded-md flex items-center justify-center flex-shrink-0",
              document
                ? "cursor-pointer hover:bg-slate-200 transition-colors"
                : ""
            )}
            onClick={(e) => {
              if (document) {
                e.stopPropagation();
                openDialog();
              }
            }}
          >
            {getDocumentIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              {docDetails && (
                <Badge
                  className={cn(
                    "bg-blue-100 text-blue-800 hover:bg-blue-100",
                    docType === DocumentType.AADHAR_CARD &&
                      "bg-green-100 text-green-800 hover:bg-green-100",
                    docType === DocumentType.CANCELLED_CHEQUE &&
                      "bg-amber-100 text-amber-800 hover:bg-amber-100",
                    docType === DocumentType.OFFER_LETTER &&
                      "bg-purple-100 text-purple-800 hover:bg-purple-100"
                  )}
                >
                  {docDetails.label}
                </Badge>
              )}
              {getStatusBadge()}
            </div>
            <div className="text-sm font-medium truncate">
              {isUploaded
                ? documentName
                : `Upload your ${docDetails?.label || "document"}`}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 text-xs text-muted-foreground mt-1">
              {isUploaded ? (
                <span>Uploaded: {formatDate(document.uploadedAt)}</span>
              ) : (
                <span>Required document</span>
              )}
              {document?.reviewedAt && (
                <span>Reviewed: {formatDate(document.reviewedAt)}</span>
              )}
            </div>
            {document?.notes && (
              <div className="text-xs mt-1 italic truncate text-red-600">
                {document.notes}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Document Preview Dialog */}
      {document && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between pr-8">
                <span className="truncate mr-4">{documentName}</span>
                {isPdf && (
                  <a
                    href={document.s3Key}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 whitespace-nowrap"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download PDF
                  </a>
                )}
              </DialogTitle>
            </DialogHeader>
            <div className="relative w-full h-[70vh] mt-2">
              {isLoading && (
                <div className="absolute inset-0 flex justify-center items-center bg-slate-50">
                  <Loading size="lg" variant="primary" />
                </div>
              )}

              {isPdf ? (
                pdfError ? (
                  <div className="flex flex-col items-center justify-center h-full bg-slate-50">
                    <p className="mb-4 text-red-600">
                      Unable to load PDF preview.
                    </p>
                    <a
                      href={document.s3Key}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <Download className="h-4 w-4" />
                      Download PDF
                    </a>
                  </div>
                ) : (
                  <iframe
                    src={document.s3Key}
                    className="w-full h-full border-0"
                    onLoad={handleLoad}
                    onError={handleError}
                  />
                )
              ) : (
                <img
                  src={document.s3Key}
                  alt={documentName}
                  className="w-full h-full object-contain"
                  onLoad={handleLoad}
                  onError={handleError}
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
