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

// Mock function to fetch documents - would be replaced with actual API call
const fetchUserDocuments = async (): Promise<Document[]> => {
  // This would be an API call in a real implementation
  // For now, we'll just return mock data
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: "1",
          userId: "user-1",
          type: DocumentType.PAN_CARD,
          s3Key: "documents/pan-1.pdf",
          status: DocumentStatus.APPROVED,
          uploadedAt: new Date(2025, 8, 1),
          reviewedBy: "admin-1",
          reviewedAt: new Date(2025, 8, 2),
        },
        {
          id: "2",
          userId: "user-1",
          type: DocumentType.AADHAR_CARD,
          s3Key: "documents/aadhar-1.pdf",
          status: DocumentStatus.PENDING,
          uploadedAt: new Date(2025, 8, 1),
        },
      ]);
    }, 500);
  });
};

// Mock function to upload a document - would be replaced with actual API call
const uploadDocument = async (
  file: File,
  docType: DocumentType
): Promise<Document> => {
  // This would be an API call in a real implementation
  console.log(`Uploading ${file.name} as ${docType}`);

  // Simulate API delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: Math.random().toString(36).substring(2, 9),
        userId: "user-1",
        type: docType,
        s3Key: `documents/${file.name}`,
        status: DocumentStatus.PENDING,
        uploadedAt: new Date(),
      });
    }, 1000);
  });
};

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
    queryFn: fetchUserDocuments,
  });

  // Get uploaded document types
  const uploadedDocTypes = documents?.map((doc) => doc.type) || [];

  // Get missing document types
  const missingDocTypes = requiredDocuments
    .map((doc) => doc.type)
    .filter((type) => !uploadedDocTypes.includes(type));

  // Filter documents based on active tab
  const filteredDocuments = documents?.filter((doc) => {
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
      await uploadDocument(file, docType);
      await refetch();
      setDrawerOpen(false);
    } catch (error) {
      console.error("Error uploading document:", error);
    } finally {
      setIsUploading(false);
    }
  };

  // Find document by type
  const findDocumentByType = (type: DocumentType) => {
    return documents?.find((doc) => doc.type === type);
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
            {/* Show pending documents */}
            {filteredDocuments && filteredDocuments.length > 0
              ? filteredDocuments.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    docType={doc.type}
                    document={doc}
                    onClick={() => handleDocumentCardClick(doc, doc.type)}
                  />
                ))
              : // Show missing documents that need to be uploaded
                missingDocTypes.map((docType) => (
                  <DocumentCard
                    key={docType}
                    docType={docType}
                    onClick={() => openUploadDrawer(docType)}
                  />
                ))}
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
              {filteredDocuments.map((doc) => (
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
              {filteredDocuments.map((doc) => (
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
