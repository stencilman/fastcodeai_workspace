"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Document as BaseDocument, DocumentStatus, DocumentType } from "@/models/document";
import { toast } from "sonner";

// Extended Document interface with additional properties from API response
interface Document extends BaseDocument {
  user?: {
    id: string;
    name: string;
    email: string;
  };
  url: string;
}
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loading } from "@/components/ui/loading";
import { FileText, Eye, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { DocumentCard } from "@/components/admin/users/document-card";

// Document type names for display
const documentTypeNames: Record<DocumentType, string> = {
  [DocumentType.PAN_CARD]: "PAN Card",
  [DocumentType.AADHAR_CARD]: "Aadhaar Card",
  [DocumentType.CANCELLED_CHEQUE]: "Cancelled Cheque",
  [DocumentType.OFFER_LETTER]: "Offer Letter",
};

// Status badge component
const StatusBadge = ({ status }: { status: DocumentStatus }) => {
  const variants: Record<DocumentStatus, { color: string; label: string }> = {
    [DocumentStatus.PENDING]: {
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      label: "Pending",
    },
    [DocumentStatus.APPROVED]: {
      color: "bg-green-100 text-green-800 border-green-200",
      label: "Approved",
    },
    [DocumentStatus.REJECTED]: {
      color: "bg-red-100 text-red-800 border-red-200",
      label: "Rejected",
    },
  };

  return (
    <Badge
      variant="outline"
      className={`${variants[status].color} border`}
    >
      {variants[status].label}
    </Badge>
  );
};

// Function to fetch all documents from the API
const fetchAllDocuments = async (): Promise<any> => {
  const response = await fetch("/api/admin/documents");
  
  if (!response.ok) {
    throw new Error("Failed to fetch documents");
  }
  
  return response.json();
};

// API function for document review (approval/rejection)
const reviewDocument = async (documentId: string, status: 'APPROVED' | 'REJECTED', notes?: string) => {
  const response = await fetch(`/api/admin/documents/${documentId}/review`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status, notes }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `Failed to ${status.toLowerCase()} document`);
  }
};

export default function AdminDocumentsPage() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [processingDocumentId, setProcessingDocumentId] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<"approve" | "reject" | null>(null);

  // Map tab values to document status for client-side filtering
  const tabToStatus: Record<string, string | undefined> = {
    all: undefined,
    pending: DocumentStatus.PENDING,
    approved: DocumentStatus.APPROVED,
    rejected: DocumentStatus.REJECTED,
  };

  // Fetch all documents once
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["adminDocuments"],
    queryFn: fetchAllDocuments,
    staleTime: 0, // Consider data stale immediately
    refetchOnMount: 'always', // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });
  
  // Define the expected data structure
  interface DocumentsResponse {
    documents: Document[];
    counts: {
      total: number;
      pending: number;
      approved: number;
      rejected: number;
    };
  }
  
  // Get all documents from the response
  const allDocuments = ((data as DocumentsResponse)?.documents) || [];
  const allCounts = ((data as DocumentsResponse)?.counts) || { total: 0, pending: 0, approved: 0, rejected: 0 };
  
  // Filter documents based on active tab - client-side filtering
  const filteredDocuments = allDocuments.filter((doc: Document) => {
    if (activeTab === "all") return true;
    return doc.status === tabToStatus[activeTab];
  });

  // DocumentCard component handles preview internally
  
  // Handle document approval
  const handleApprove = async (documentId: string) => {
    try {
      setProcessingDocumentId(documentId);
      setProcessingAction("approve");
      await reviewDocument(documentId, "APPROVED");
      // Clear processing state immediately after successful API call
      setProcessingDocumentId(null);
      setProcessingAction(null);
      toast.success("Document approved successfully");
      refetch(); // Refetch documents to update the UI
    } catch (error) {
      console.error("Error approving document:", error);
      toast.error("Failed to approve document");
      setProcessingDocumentId(null);
      setProcessingAction(null);
    }
  };

  // Handle document rejection
  const handleReject = async (documentId: string, reason?: string) => {
    try {
      setProcessingDocumentId(documentId);
      setProcessingAction("reject");
      await reviewDocument(documentId, "REJECTED", reason);
      // Clear processing state immediately after successful API call
      setProcessingDocumentId(null);
      setProcessingAction(null);
      toast.success("Document rejected successfully");
      refetch(); // Refetch documents to update the UI
    } catch (error) {
      console.error("Error rejecting document:", error);
      toast.error("Failed to reject document");
      setProcessingDocumentId(null);
      setProcessingAction(null);
    }
  };

  // Check if a file is an image
  const isImage = (fileType: string): boolean => {
    return /^image\/(jpeg|jpg|png|gif|webp|svg\+xml)$/.test(fileType);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading size="lg" variant="primary" text="Loading documents..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 text-red-800 rounded-md">
        <h2 className="text-lg font-semibold">Error loading documents</h2>
        <p>{(error as Error).message || "An unknown error occurred"}</p>
      </div>
    );
  }
  
  // Calculate counts for the tabs
  const counts = {
    total: allDocuments.length,
    pending: allDocuments.filter(doc => doc.status === DocumentStatus.PENDING).length,
    approved: allDocuments.filter(doc => doc.status === DocumentStatus.APPROVED).length,
    rejected: allDocuments.filter(doc => doc.status === DocumentStatus.REJECTED).length
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Document Management</h1>
          <p className="text-muted-foreground mt-1">
            Review and manage all user documents
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-slate-50 border">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Total Documents</span>
            <span className="text-2xl font-bold">{counts.total}</span>
          </div>
        </Card>
        <Card className="p-4 bg-yellow-50 border border-yellow-100">
          <div className="flex flex-col">
            <span className="text-sm text-yellow-800">Pending Review</span>
            <span className="text-2xl font-bold text-yellow-800">{counts.pending}</span>
          </div>
        </Card>
        <Card className="p-4 bg-green-50 border border-green-100">
          <div className="flex flex-col">
            <span className="text-sm text-green-800">Approved</span>
            <span className="text-2xl font-bold text-green-800">{counts.approved}</span>
          </div>
        </Card>
        <Card className="p-4 bg-red-50 border border-red-100">
          <div className="flex flex-col">
            <span className="text-sm text-red-800">Rejected</span>
            <span className="text-2xl font-bold text-red-800">{counts.rejected}</span>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto pb-2 mb-2">
          <TabsList className="inline-flex md:flex md:w-full w-auto bg-primary/10 p-1">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary px-6 md:flex-1"
            >
              All ({counts.total})
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary px-6 md:flex-1"
            >
              Pending ({counts.pending})
            </TabsTrigger>
            <TabsTrigger
              value="approved"
              className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary px-6 md:flex-1"
            >
              Approved ({counts.approved})
            </TabsTrigger>
            <TabsTrigger
              value="rejected"
              className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary px-6 md:flex-1"
            >
              Rejected ({counts.rejected})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Document list - filtering is now done client-side */}
        <TabsContent value={activeTab} className="mt-6">
          {filteredDocuments.length > 0 ? (
            <div className="space-y-4">
              {filteredDocuments.map((doc: Document) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  isProcessing={processingDocumentId === doc.id}
                  processingAction={processingDocumentId === doc.id ? processingAction : null}
                  showSubmitter={true}
                />
              ))}
            </div>
          ) : (
            <div className="text-center p-8 border rounded-md bg-slate-50">
              <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <h3 className="font-medium text-lg">No documents found</h3>
              <p className="text-muted-foreground mt-1">
                {activeTab === "all"
                  ? "There are no documents in the system."
                  : activeTab === "pending"
                  ? "There are no pending documents to review."
                  : activeTab === "approved"
                  ? "There are no approved documents."
                  : "There are no rejected documents."}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
