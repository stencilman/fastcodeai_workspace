"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Document, DocumentStatus, DocumentType } from "@/models/document";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loading } from "@/components/ui/loading";
import { FileText } from "lucide-react";
import { DocumentCard } from "@/components/user/document-card";
import {
  FileUploadDrawer,
  requiredDocuments,
} from "@/components/user/file-upload-drawer";
import {
  getUserDocuments,
  initiateDocumentUpload,
  uploadFileToS3,
} from "@/lib/document-upload-service";
import { toast } from "sonner";

export default function UserDocumentsPage() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<DocumentType | null>(
    null
  );
  const [isUploading, setIsUploading] = useState(false);

  const {
    data: documents,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["userDocuments"],
    queryFn: getUserDocuments,
  });

  // Get uploaded document types
  const uploadedDocTypes = documents?.map((doc: Document) => doc.type) || [];

  // Get missing document types
  const missingDocTypes = requiredDocuments
    .map((doc) => doc.type)
    .filter((type) => !uploadedDocTypes.includes(type));

  // Filter documents based on active tab
  const filteredDocuments = documents?.filter((doc: Document) => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return doc.status === DocumentStatus.PENDING;
    if (activeTab === "approved") return doc.status === DocumentStatus.APPROVED;
    if (activeTab === "rejected") return doc.status === DocumentStatus.REJECTED;
    return true;
  });

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

      // Step 1: Create document record and get upload URL
      const { documentId, uploadUrl } = await initiateDocumentUpload(
        file,
        docType
      );

      // Step 2: Upload file to S3 or local storage
      await uploadFileToS3(file, uploadUrl);

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

  // Find document by type
  const findDocumentByType = (type: DocumentType) => {
    return documents?.find((doc: Document) => doc.type === type);
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
        <TabsList className="grid grid-cols-4 w-full mb-4 bg-primary/10">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary"
          >
            All
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary"
          >
            Pending
          </TabsTrigger>
          <TabsTrigger
            value="approved"
            className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary"
          >
            Approved
          </TabsTrigger>
          <TabsTrigger
            value="rejected"
            className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary"
          >
            Rejected
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requiredDocuments.map((docType) => {
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

        <TabsContent value="pending" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Group documents by type and show only the latest one */}
            {(() => {
              // Create a map to store the latest document of each type
              const latestDocsByType = new Map<DocumentType, Document>();

              // Find the latest document for each type
              filteredDocuments?.forEach((doc: Document) => {
                const existingDoc = latestDocsByType.get(doc.type);
                if (
                  !existingDoc ||
                  new Date(doc.uploadedAt) > new Date(existingDoc.uploadedAt)
                ) {
                  latestDocsByType.set(doc.type, doc);
                }
              });

              // Convert map to array
              const uniqueDocs = Array.from(latestDocsByType.values());

              if (uniqueDocs.length > 0) {
                return uniqueDocs.map((doc: Document) => (
                  <DocumentCard
                    key={doc.id}
                    docType={doc.type}
                    document={doc}
                    onClick={() => handleDocumentCardClick(doc, doc.type)}
                    isUploading={isUploading && selectedDocType === doc.type}
                  />
                ));
              } else {
                // Show missing documents that need to be uploaded
                return missingDocTypes.map((docType) => (
                  <DocumentCard
                    key={docType}
                    docType={docType}
                    onClick={() => openUploadDrawer(docType)}
                    isUploading={isUploading && selectedDocType === docType}
                  />
                ));
              }
            })()}
          </div>

          {filteredDocuments?.length === 0 && missingDocTypes.length === 0 && (
            <div className="text-center p-8 border rounded-md bg-slate-50">
              <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <h3 className="font-medium text-lg">No pending documents</h3>
              <p className="text-muted-foreground mt-1">
                You don't have any pending documents to upload.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          {filteredDocuments && filteredDocuments.length > 0 ? (
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
                You don't have any approved documents yet.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          {filteredDocuments && filteredDocuments.length > 0 ? (
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
                You don't have any rejected documents.
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
