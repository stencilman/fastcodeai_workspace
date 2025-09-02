import React, { useState } from "react";
import { Document, DocumentStatus } from "@/models/document";
import { TabsContent } from "@/components/ui/tabs";
import { DocumentCard } from "@/components/admin/users/document-card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { Loading } from "@/components/ui/loading";

export function DocumentsTab() {
  const params = useParams();
  const userId = params.id as string;
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Fetch documents for the user
  const {
    data: documents,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["documents", userId],
    queryFn: async () => {
      const response = await fetch(`/api/documents?userId=${userId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch documents");
      }
      return response.json();
    },
  });

  // Mutation for approving documents
  const approveMutation = useMutation({
    mutationFn: async (documentId: string) => {
      const response = await fetch(`/api/documents/${documentId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reviewerId: "3", // Admin user ID
          status: DocumentStatus.APPROVED,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to approve document");
      }

      return response.json();
    },
    onSuccess: (_, documentId) => {
      // Optimistically update the cache
      queryClient.setQueryData(
        ["documents", userId],
        (oldData: Document[] | undefined) => {
          if (!oldData) return [];
          return oldData.map((doc) =>
            doc.id === documentId
              ? {
                  ...doc,
                  status: DocumentStatus.APPROVED,
                  reviewedAt: new Date(),
                  reviewedBy: "3", // Admin user ID
                }
              : doc
          );
        }
      );

      // Clear approving id
      setApprovingId(null);

      // Invalidate and refetch documents query
      queryClient.invalidateQueries({ queryKey: ["documents", userId] });
    },
    onError: () => {
      // Clear approving id on error
      setApprovingId(null);
    },
  });

  // Mutation for rejecting documents
  const rejectMutation = useMutation({
    mutationFn: async ({
      documentId,
      reason,
    }: {
      documentId: string;
      reason: string;
    }) => {
      const response = await fetch(`/api/documents/${documentId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reviewerId: "3", // Admin user ID
          status: DocumentStatus.REJECTED,
          notes: reason,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to reject document");
      }

      return response.json();
    },
    onSuccess: (data, { documentId }) => {
      // Optimistically update the cache
      queryClient.setQueryData(
        ["documents", userId],
        (oldData: Document[] | undefined) => {
          if (!oldData) return [];
          return oldData.map((doc) =>
            doc.id === documentId
              ? {
                  ...doc,
                  status: DocumentStatus.REJECTED,
                  reviewedAt: new Date(),
                  reviewedBy: "3", // Admin user ID
                  notes: data.notes, // Use the notes from the response
                }
              : doc
          );
        }
      );

      // Clear rejecting id
      setRejectingId(null);

      // Invalidate and refetch documents query
      queryClient.invalidateQueries({ queryKey: ["documents", userId] });
    },
    onError: () => {
      // Clear rejecting id on error
      setRejectingId(null);
    },
  });

  const handleApprove = async (documentId: string): Promise<void> => {
    // Set approving id
    setApprovingId(documentId);
    await approveMutation.mutateAsync(documentId);
  };

  const handleReject = async (
    documentId: string,
    reason?: string
  ): Promise<void> => {
    // Set rejecting id
    setRejectingId(documentId);
    await rejectMutation.mutateAsync({
      documentId,
      reason: reason || "Document rejected by admin",
    });
  };

  return (
    <TabsContent value="documents" className="p-4 border rounded-lg">
      <h2 className="text-xl font-medium mb-4">Documents</h2>
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loading size="lg" variant="primary" />
          </div>
        ) : error ? (
          <div className="text-red-500 p-4 border border-red-200 rounded-md bg-red-50">
            Error loading documents. Please try again.
          </div>
        ) : documents && documents.length > 0 ? (
          <div className="flex flex-col gap-3">
            {documents.map((document: Document) => (
              <DocumentCard
                key={document.id}
                document={document}
                onApprove={handleApprove}
                onReject={handleReject}
                isProcessing={
                  approvingId === document.id || rejectingId === document.id
                }
                processingAction={
                  approvingId === document.id
                    ? "approve"
                    : rejectingId === document.id
                    ? "reject"
                    : null
                }
              />
            ))}
          </div>
        ) : (
          <p>No documents found for this user.</p>
        )}
      </div>
    </TabsContent>
  );
}
