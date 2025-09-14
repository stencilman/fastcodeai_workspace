"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Document, DocumentStatus, DocumentType } from "@/models/document";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loading } from "@/components/ui/loading";
import { FileText } from "lucide-react";
import { DocumentCard } from "@/components/user/document-card";
import { FileUploadDrawer } from "@/components/user/file-upload-drawer";
import { requiredDocuments } from "@/lib/constants/documents";
import {
  getUserDocuments,
  initiateDocumentUpload,
  uploadFileToS3,
} from "@/lib/document-upload-service";
import { toast } from "sonner";

export default function UserDocumentsPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<DocumentType | null>(
    null
  );
  const [isUploading, setIsUploading] = useState(false);

  // Check URL parameters for auto-opening drawer with selected document type
  // and for setting the active tab
  useEffect(() => {
    const typeParam = searchParams.get("type");
    const openParam = searchParams.get("open");
    const tabParam = searchParams.get("tab");

    // Handle document type and drawer opening
    if (typeParam && openParam === "true") {
      // Set the document type from URL parameter
      setSelectedDocType(typeParam as DocumentType);
      setDrawerOpen(true);

      // Set the appropriate tab
      setActiveTab("pending_submission");
    }

    // Handle tab selection
    if (tabParam) {
      // Valid tab values: all, pending_submission, pending_approval, approved, rejected
      if (
        [
          "all",
          "pending_submission",
          "pending_approval",
          "approved",
          "rejected",
        ].includes(tabParam)
      ) {
        setActiveTab(tabParam);
      }
    }
  }, [searchParams]);

  // Fetch all documents once
  const {
    data: allDocuments,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["userDocuments"],
    queryFn: getUserDocuments,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  // Derive all document-related data from allDocuments
  const documents = useMemo(() => allDocuments || [], [allDocuments]);

  // Get uploaded document types - derived from documents
  const uploadedDocTypes = useMemo(
    () => documents.map((doc: Document) => doc.type),
    [documents]
  );

  // Get missing document types
  const missingDocTypes = useMemo(
    () =>
      requiredDocuments
        ?.map((doc) => doc.type)
        .filter((type) => !uploadedDocTypes.includes(type)) || [],
    [uploadedDocTypes]
  );

  // Filter documents based on active tab - this is now done client-side
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc: Document) => {
      if (activeTab === "all") return true;
      if (activeTab === "pending_submission")
        return !uploadedDocTypes.includes(doc.type);
      if (activeTab === "pending_approval")
        return doc.status === DocumentStatus.PENDING;
      if (activeTab === "approved")
        return doc.status === DocumentStatus.APPROVED;
      if (activeTab === "rejected")
        return doc.status === DocumentStatus.REJECTED;
      return true;
    });
  }, [documents, activeTab, uploadedDocTypes]);

  // Group documents by type to show only the latest one for each type
  const latestDocsByType = useMemo(() => {
    const docMap = new Map<DocumentType, Document>();

    documents.forEach((doc: Document) => {
      const existingDoc = docMap.get(doc.type);
      if (
        !existingDoc ||
        new Date(doc.uploadedAt) > new Date(existingDoc.uploadedAt)
      ) {
        docMap.set(doc.type, doc);
      }
    });

    return docMap;
  }, [documents]);

  // Open upload drawer with pre-selected document type
  const openUploadDrawer = (docType: DocumentType) => {
    setSelectedDocType(docType);
    setDrawerOpen(true);
  };

  // Handle document card click based on status
  const handleDocumentCardClick = (
    doc: Document | undefined,
    docType: DocumentType
  ) => {
    // If document exists and is approved, do nothing (let the thumbnail handle preview)
    if (doc && doc.status === DocumentStatus.APPROVED) {
      return;
    }

    // Otherwise open upload drawer
    openUploadDrawer(docType);
  };

  // Handle document upload
  const handleUpload = async (file: File, docType: DocumentType) => {
    try {
      setIsUploading(true);

      // Step 1: Create document record in the database
      const { documentId } = await initiateDocumentUpload(file, docType);

      // Step 2: Upload file to S3 through the backend
      await uploadFileToS3(file, documentId);

      // Step 3: Refresh the documents list
      await refetch();
      setDrawerOpen(false);

      // Show success notification
      toast.success("Document uploaded successfully", {
        description: "Your document has been uploaded and is pending review.",
      });
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("Upload failed", {
        description:
          error instanceof Error ? error.message : "Failed to upload document",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Find document by type - now uses the latestDocsByType map for efficiency
  const findDocumentByType = (type: DocumentType) => {
    return latestDocsByType.get(type);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading size="lg" variant="primary" text="Loading documents..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">My Documents</h1>
          <p className="text-muted-foreground mt-1">
            View and manage your submitted documents
          </p>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto pb-2 mb-2">
          <TabsList className="inline-flex md:flex md:w-full w-auto bg-primary/10 p-1">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary px-6 md:flex-1"
            >
              All
            </TabsTrigger>
            <TabsTrigger
              value="pending_submission"
              className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary px-6 md:flex-1"
            >
              Pending Submission
            </TabsTrigger>
            <TabsTrigger
              value="pending_approval"
              className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary px-6 md:flex-1"
            >
              Pending Approval
            </TabsTrigger>
            <TabsTrigger
              value="approved"
              className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary px-6 md:flex-1"
            >
              Approved
            </TabsTrigger>
            <TabsTrigger
              value="rejected"
              className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary px-6 md:flex-1"
            >
              Rejected
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requiredDocuments?.map((docType) => {
              // Use the latestDocsByType map to efficiently find documents
              const uploadedDoc = findDocumentByType(docType.type);

              return (
                <DocumentCard
                  key={docType.type}
                  docType={docType.type}
                  document={uploadedDoc}
                  onClick={() =>
                    handleDocumentCardClick(uploadedDoc, docType.type)
                  }
                />
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="pending_submission" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Show only documents that need to be uploaded */}
            {missingDocTypes.length > 0 ? (
              missingDocTypes.map((docType) => (
                <DocumentCard
                  key={docType}
                  docType={docType}
                  onClick={() => openUploadDrawer(docType)}
                  isUploading={isUploading && selectedDocType === docType}
                />
              ))
            ) : (
              <div className="text-center p-8 border rounded-md bg-slate-50 col-span-2">
                <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                <h3 className="font-medium text-lg">No pending submissions</h3>
                <p className="text-muted-foreground mt-1">
                  All required documents have been submitted.
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="pending_approval" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(() => {
              // Filter only documents with PENDING status - using memoized filteredDocuments
              const pendingDocs = filteredDocuments;

              if (pendingDocs.length > 0) {
                return pendingDocs.map((doc: Document) => (
                  <DocumentCard
                    key={doc.id}
                    docType={doc.type}
                    document={doc}
                    onClick={() => {}} // No action needed for pending docs
                    isUploading={isUploading && selectedDocType === doc.type}
                  />
                ));
              } else {
                return (
                  <div className="text-center p-8 border rounded-md bg-slate-50 col-span-2">
                    <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                    <h3 className="font-medium text-lg">
                      No pending documents
                    </h3>
                    <p className="text-muted-foreground mt-1">
                      You don&apos;t have any documents pending approval.
                    </p>
                  </div>
                );
              }
            })()}
          </div>
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          {filteredDocuments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDocuments.map((doc: Document) => (
                <DocumentCard
                  key={doc.id}
                  docType={doc.type}
                  document={doc}
                  onClick={() => {}} // No action for approved docs, only thumbnail opens preview
                />
              ))}
            </div>
          ) : (
            <div className="text-center p-8 border rounded-md bg-slate-50">
              <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <h3 className="font-medium text-lg">No approved documents</h3>
              <p className="text-muted-foreground mt-1">
                You don&apos;t have any approved documents yet.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          {filteredDocuments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDocuments.map((doc: Document) => (
                <DocumentCard
                  key={doc.id}
                  docType={doc.type}
                  document={doc}
                  onClick={() => handleDocumentCardClick(doc, doc.type)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center p-8 border rounded-md bg-slate-50">
              <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <h3 className="font-medium text-lg">No rejected documents</h3>
              <p className="text-muted-foreground mt-1">
                You don&apos;t have any rejected documents.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Document Upload Drawer */}
      <FileUploadDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        selectedDocType={selectedDocType}
        onDocTypeChange={setSelectedDocType}
        onUpload={handleUpload}
      />
    </div>
  );
}
