import React, { useState, useEffect } from "react";
import { DocumentStatus, DocumentType } from "@/models/document";
import Link from "next/link";

// Extended Document interface with user information
interface Document {
  id: string;
  userId: string;
  type: DocumentType;
  fileName: string;
  fileSize: number;
  fileType: string;
  s3Key: string;
  status: DocumentStatus;
  uploadedAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  notes?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}
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
  Eye,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils/utils";
import { getDocumentUrl } from "@/lib/document-upload-service";

interface DocumentCardProps {
  document: Document;
  onApprove: (documentId: string) => Promise<void>;
  onReject: (documentId: string, reason?: string) => Promise<void>;
  isProcessing?: boolean;
  processingAction?: "approve" | "reject" | null;
  showSubmitter?: boolean;
}

export function DocumentCard({
  document,
  onApprove,
  onReject,
  isProcessing = false,
  processingAction = null,
  showSubmitter = false,
}: DocumentCardProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pdfError, setPdfError] = useState(false);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [localDocumentStatus, setLocalDocumentStatus] =
    useState<DocumentStatus>(document.status);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionReasonError, setRejectionReasonError] = useState(false);

  useEffect(() => {
    setLocalDocumentStatus(document.status);
  }, [document.status]);

  // Determine file type
  const isPdf = document.fileName.toLowerCase().endsWith(".pdf");
  const isImage = document.fileName
    .toLowerCase()
    .match(/\.(jpg|jpeg|png|gif|webp)$/i);
  const documentName = document.fileName || "Document";

  // Fetch thumbnail URL for image documents
  useEffect(() => {
    if (document?.id && isImage) {
      getDocumentUrl(document.id)
        .then((url) => {
          setThumbnailUrl(url);
        })
        .catch((error) => {
          console.error("Error fetching thumbnail URL:", error);
        });
    }
  }, [document?.id, isImage]);

  // Fetch document URL when needed for dialog preview
  useEffect(() => {
    if (document?.id && dialogOpen) {
      setDocumentUrl(null);
      getDocumentUrl(document.id)
        .then((url) => {
          setDocumentUrl(url);
        })
        .catch((error) => {
          console.error("Error fetching document URL:", error);
          setPdfError(true);
        });
    }
  }, [document?.id, dialogOpen]);

  // Get appropriate icon based on document type
  const getDocumentIcon = () => {
    // For image documents, show the image if thumbnail URL is available
    if (isImage) {
      if (thumbnailUrl) {
        return (
          <div className="w-12 h-12 overflow-hidden rounded-md">
            <img
              src={thumbnailUrl}
              alt={document.fileName}
              className="w-full h-full object-cover"
            />
          </div>
        );
      } else {
        // Show loading indicator while fetching the image
        return (
          <div className="h-12 w-12 flex items-center justify-center">
            <Loading size="sm" variant="primary" />
          </div>
        );
      }
    }

    // For PDF documents
    if (isPdf) {
      return (
        <div className="relative">
          <FileText className="h-12 w-12 text-gray-500" />
          <div className="absolute -bottom-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            <Eye className="h-3 w-3" />
          </div>
        </div>
      );
    }

    // Default document icon for other types
    return <FileText className="h-12 w-12 text-gray-500" />;
  };

  // Get status badge color
  const getStatusBadge = () => {
    // Use localDocumentStatus instead of document.status for immediate feedback
    switch (localDocumentStatus) {
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
    let label = "Document";

    switch (document.type) {
      case DocumentType.PAN_CARD:
        label = "PAN Card";
        break;
      case DocumentType.AADHAR_CARD:
        label = "Aadhar Card";
        break;
      case DocumentType.CANCELLED_CHEQUE:
        label = "Cancelled Cheque";
        break;
      case DocumentType.OFFER_LETTER:
        label = "Offer Letter";
        break;
    }

    return (
      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
        {label}
      </Badge>
    );
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
      // Only update status after successful API response
      await onApprove(document.id);
      // Update local status after successful API call
      setLocalDocumentStatus(DocumentStatus.APPROVED);

      // Clear notes when transitioning from rejected to approved
      if (document.status === DocumentStatus.REJECTED) {
        // Update the document object to remove notes
        document.notes = undefined;
      }
    } catch (error) {
      console.error("Error approving document:", error);
      // Status remains unchanged since we only update after success
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
      // Only update status after successful API response
      await onReject(document.id, rejectionReason);
      // Update local status after successful API call
      setLocalDocumentStatus(DocumentStatus.REJECTED);
      setRejectionReason(""); // Reset the reason after submission
    } catch (error) {
      console.error("Error rejecting document:", error);
      // Status remains unchanged since we only update after success
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
            {showSubmitter && document.user && (
              <span className="flex items-center gap-1">
                Submitted by:{" "}
                <Link
                  href={`/admin/users/${document.user.id}`}
                  className="text-primary font-medium hover:underline"
                >
                  {document.user.name}
                </Link>
              </span>
            )}
          </div>
          {document.notes &&
            localDocumentStatus === DocumentStatus.REJECTED && (
              <div className="text-xs mt-1 italic truncate text-red-600">
                Reason: {document.notes}
              </div>
            )}
        </div>
        <div className="hidden md:flex gap-2 ml-auto">
          {isPending ? (
            <>
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
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" disabled={isProcessing}>
                  {isProcessing ? (
                    <Loading size="sm" variant="primary" />
                  ) : (
                    <MoreVertical className="h-4 w-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {localDocumentStatus !== DocumentStatus.APPROVED && (
                  <DropdownMenuItem
                    onClick={handleApprove}
                    disabled={isProcessing}
                    className="text-green-600 focus:text-green-700 focus:bg-green-50"
                  >
                    <Check className="h-4 w-4 mr-2" /> Approve Document
                  </DropdownMenuItem>
                )}
                {localDocumentStatus !== DocumentStatus.REJECTED && (
                  <DropdownMenuItem
                    onClick={handleReject}
                    disabled={isProcessing}
                    className="text-red-600 focus:text-red-700 focus:bg-red-50"
                  >
                    <X className="h-4 w-4 mr-2" /> Reject Document
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <div className="md:hidden px-4 pb-4 pt-0">
        {isPending ? (
          <div className="grid grid-cols-2 gap-2">
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
        ) : (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" disabled={isProcessing}>
                  {isProcessing ? (
                    <Loading size="sm" variant="primary" text="Processing..." />
                  ) : (
                    <>
                      <MoreVertical className="h-4 w-4 mr-1" /> Actions
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {localDocumentStatus !== DocumentStatus.APPROVED && (
                  <DropdownMenuItem
                    onClick={handleApprove}
                    disabled={isProcessing}
                    className="text-green-600 focus:text-green-700 focus:bg-green-50"
                  >
                    <Check className="h-4 w-4 mr-2" /> Approve Document
                  </DropdownMenuItem>
                )}
                {localDocumentStatus !== DocumentStatus.REJECTED && (
                  <DropdownMenuItem
                    onClick={handleReject}
                    disabled={isProcessing}
                    className="text-red-600 focus:text-red-700 focus:bg-red-50"
                  >
                    <X className="h-4 w-4 mr-2" /> Reject Document
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden w-[95vw] max-w-full">
          <DialogHeader>
            <DialogTitle className="pr-8">
              <span className="truncate">{documentName}</span>
              {/* 'Open in new tab' button moved to DialogFooter for mobile */}
              <div className="hidden sm:block mt-2 sm:mt-0">
                {documentUrl && (
                  <a
                    href={documentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 whitespace-nowrap"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Open in new tab
                  </a>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="relative w-full h-[60vh] md:h-[70vh] mt-2">
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
                  {documentUrl && (
                    <a
                      href={documentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open in new tab
                    </a>
                  )}
                </div>
              ) : (
                <iframe
                  src={documentUrl || undefined}
                  className="w-full h-full border-0"
                  onLoad={handleLoad}
                  onError={handleError}
                  title="PDF Document"
                />
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 overflow-hidden">
                <div className="flex items-center justify-center w-full h-full">
                  <img
                    src={documentUrl || undefined}
                    alt={documentName}
                    className="max-w-full max-h-full object-contain"
                    onLoad={handleLoad}
                    onError={handleError}
                    style={{ margin: "0 auto" }}
                  />
                </div>
              </div>
            )}
          </div>
          {/* Add DialogFooter with 'Open in new tab' button for mobile */}
          <DialogFooter className="sm:hidden mt-4">
            {documentUrl && (
              <Button asChild variant="outline" className="w-full">
                <a
                  href={documentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in new tab
                </a>
              </Button>
            )}
          </DialogFooter>
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
