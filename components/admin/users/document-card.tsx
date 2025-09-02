import React, { useState, useEffect } from "react";
import { Document, DocumentStatus, DocumentType } from "@/models/document";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loading } from "@/components/ui/loading";
import {
  Check,
  X,
  FileText,
  FileImage,
  CreditCard,
  FileCheck,
  ExternalLink,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentCardProps {
  document: Document;
  onApprove: (documentId: string) => Promise<void>;
  onReject: (documentId: string, reason?: string) => Promise<void>;
  isProcessing?: boolean;
  processingAction?: "approve" | "reject" | null;
}

export function DocumentCard({
  document,
  onApprove,
  onReject,
  isProcessing = false,
  processingAction = null,
}: DocumentCardProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pdfError, setPdfError] = useState(false);
  const [localDocumentStatus, setLocalDocumentStatus] =
    useState<DocumentStatus>(document.status);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionReasonError, setRejectionReasonError] = useState(false);

  useEffect(() => {
    setLocalDocumentStatus(document.status);
  }, [document.status]);

  // Get appropriate icon based on document type
  const getDocumentIcon = () => {
    switch (document.type) {
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
    switch (document.status) {
      case DocumentStatus.PENDING:
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            Pending
          </Badge>
        );
      case DocumentStatus.APPROVED:
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Approved
          </Badge>
        );
      case DocumentStatus.REJECTED:
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Get document type badge
  const getTypeBadge = () => {
    switch (document.type) {
      case DocumentType.PAN_CARD:
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            PAN Card
          </Badge>
        );
      case DocumentType.AADHAR_CARD:
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Aadhar Card
          </Badge>
        );
      case DocumentType.CANCELLED_CHEQUE:
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
            Cancelled Cheque
          </Badge>
        );
      case DocumentType.OFFER_LETTER:
        return (
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
            Offer Letter
          </Badge>
        );
      default:
        return <Badge>Unknown</Badge>;
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

  const isPending = localDocumentStatus === DocumentStatus.PENDING;
  const isPdf = document.s3Key.toLowerCase().endsWith(".pdf");
  const documentName = document.s3Key.split("/").pop() || "Document";

  const togglePreview = () => {
    setIsPreviewOpen(!isPreviewOpen);
    setIsLoading(true);
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

  const openDialog = () => {
    setDialogOpen(true);
    setIsLoading(true);

    // Set a timeout to handle PDFs that never trigger onLoad
    if (isPdf) {
      setTimeout(() => {
        setIsLoading(false);
      }, 3000);
    }
  };

  const handleApprove = async () => {
    try {
      await onApprove(document.id);
    } catch (error) {
      console.error("Error approving document:", error);
    }
  };

  const handleReject = async () => {
    setRejectionDialogOpen(true);
  };

  const submitRejection = async () => {
    if (!rejectionReason.trim()) {
      setRejectionReasonError(true);
      return;
    }

    setRejectionReasonError(false);
    setRejectionDialogOpen(false);

    try {
      await onReject(document.id, rejectionReason);
      setRejectionReason(""); // Reset the reason after submission
    } catch (error) {
      console.error("Error rejecting document:", error);
    }
  };

  const cancelRejection = () => {
    setRejectionDialogOpen(false);
    setRejectionReason("");
    setRejectionReasonError(false);
  };

  const isApproving = isProcessing && processingAction === "approve";
  const isRejecting = isProcessing && processingAction === "reject";

  return (
    <Card className="overflow-hidden">
      <div className="p-4 flex flex-col md:flex-row md:items-center gap-4">
        <div
          className="bg-slate-100 p-3 rounded-md flex items-center justify-center cursor-pointer hover:bg-slate-200 transition-colors flex-shrink-0"
          onClick={openDialog}
        >
          {getDocumentIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {getTypeBadge()}
            {getStatusBadge()}
          </div>
          <div className="text-sm font-medium truncate">{documentName}</div>
          <div className="flex flex-wrap items-center gap-x-4 text-xs text-muted-foreground mt-1">
            <span>Uploaded: {formatDate(document.uploadedAt)}</span>
            {document.reviewedAt && (
              <span>Reviewed: {formatDate(document.reviewedAt)}</span>
            )}
          </div>
          {document.notes && (
            <div className="text-xs mt-1 italic truncate">{document.notes}</div>
          )}
        </div>
        {isPending && (
          <div className="hidden md:flex gap-2 ml-auto">
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
              onClick={handleReject}
              disabled={isProcessing}
            >
              {isRejecting ? (
                <Loading
                  size="sm"
                  variant="danger"
                  text="Rejecting..."
                  textClassName="text-red-600"
                />
              ) : (
                <>
                  <X className="h-4 w-4 mr-1" /> Reject
                </>
              )}
            </Button>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleApprove}
              disabled={isProcessing}
            >
              {isApproving ? (
                <Loading
                  size="sm"
                  variant="white"
                  text="Approving..."
                  textClassName="text-white"
                />
              ) : (
                <>
                  <Check className="h-4 w-4 mr-1" /> Approve
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {isPending && (
        <div className="md:hidden px-4 pb-4 pt-0 grid grid-cols-2 gap-2">
          <Button
            size="sm"
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
            onClick={handleReject}
            disabled={isProcessing}
          >
            {isRejecting ? (
              <Loading
                size="sm"
                variant="danger"
                text="Rejecting..."
                textClassName="text-red-600"
              />
            ) : (
              <>
                <X className="h-4 w-4 mr-1" /> Reject
              </>
            )}
          </Button>
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={handleApprove}
            disabled={isProcessing}
          >
            {isApproving ? (
              <Loading
                size="sm"
                variant="default"
                text="Approving..."
                textClassName="text-white"
                className="text-white"
              />
            ) : (
              <>
                <Check className="h-4 w-4 mr-1" /> Approve
              </>
            )}
          </Button>
        </div>
      )}

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

      {/* Rejection Dialog */}
      <Dialog open={rejectionDialogOpen} onOpenChange={setRejectionDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Reject Document</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this document. This
              information will be shared with the user.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="rejection-reason"
                  className="text-sm font-medium"
                >
                  Rejection Reason <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="rejection-reason"
                  placeholder="Enter the reason for rejection..."
                  value={rejectionReason}
                  onChange={(e) => {
                    setRejectionReason(e.target.value);
                    if (e.target.value.trim()) {
                      setRejectionReasonError(false);
                    }
                  }}
                  className={cn(
                    "resize-none min-h-[100px]",
                    rejectionReasonError
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  )}
                />
                {rejectionReasonError && (
                  <p className="text-sm text-red-500">
                    Rejection reason is required
                  </p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={cancelRejection}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={submitRejection}
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isRejecting ? (
                <Loading
                  size="sm"
                  variant="default"
                  text="Rejecting..."
                  textClassName="text-white"
                />
              ) : (
                "Confirm Rejection"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
