"use client";

import { useState, useRef } from "react";
import { DocumentType } from "@/models/document";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { toast } from "sonner";

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

interface FileUploadDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDocType: DocumentType | null;
  onDocTypeChange: (type: DocumentType) => void;
  onUpload: (file: File, docType: DocumentType) => void;
}

export function FileUploadDrawer({
  open,
  onOpenChange,
  selectedDocType,
  onDocTypeChange,
  onUpload,
}: FileUploadDrawerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get document details by type
  const getDocumentDetails = (type: DocumentType | null) => {
    if (!type) return null;
    return requiredDocuments.find((doc) => doc.type === type);
  };

  const selectedDocDetails = getDocumentDetails(selectedDocType);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  // Handle drag events
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  // Handle upload button click
  const handleUpload = async () => {
    if (!file || !selectedDocType) return;

    try {
      setIsUploading(true);

      // Call the parent's onUpload callback to handle the actual upload
      await onUpload(file, selectedDocType);

      // Reset state
      setFile(null);

      // Toast notification is now handled by the parent component
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed", {
        description:
          error instanceof Error ? error.message : "Failed to upload document",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle file removal
  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Get file size in readable format
  const getFileSize = (size: number) => {
    if (size < 1024) {
      return `${size} bytes`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(2)} KB`;
    } else {
      return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>
            {selectedDocType && selectedDocDetails
              ? `Upload ${selectedDocDetails.label}`
              : "Upload Document"}
          </DrawerTitle>
          <DrawerDescription>
            {selectedDocDetails?.description ||
              "Upload your document in PDF, JPG, or PNG format"}
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4 space-y-6">
          {/* Document Type Selector */}
          <div className="space-y-2">
            <Label htmlFor="document-type">Document Type</Label>
            <Select
              value={selectedDocType || ""}
              onValueChange={(value) => onDocTypeChange(value as DocumentType)}
            >
              <SelectTrigger id="document-type-selector">
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {requiredDocuments.map((doc) => (
                  <SelectItem key={doc.type} value={doc.type}>
                    {doc.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Drag & Drop Area */}
          <div
            id="file-upload-area"
            className={cn(
              "border-2 border-dashed rounded-lg p-6 transition-colors",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25",
              file ? "bg-muted/20" : ""
            )}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center justify-center gap-2 text-center cursor-pointer">
              {file ? (
                <div className="w-full">
                  <div className="flex items-center justify-between bg-background p-3 rounded-md border mb-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText className="h-8 w-8 text-primary flex-shrink-0" />
                      <div className="overflow-hidden">
                        <p className="font-medium text-sm truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile();
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-center text-muted-foreground">
                    Click to change file
                  </p>
                </div>
              ) : (
                <>
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium mb-1">
                      Drag and drop your file here
                    </p>
                    <p className="text-sm text-muted-foreground">
                      or click to browse
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Supported formats: PDF, JPG, PNG (Max 5MB)
                  </p>
                </>
              )}
            </div>
            <Input
              ref={fileInputRef}
              id="document"
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png"
            />
          </div>
        </div>
        <DrawerFooter>
          <Button
            id="upload-submit-button"
            onClick={handleUpload}
            disabled={!file || !selectedDocType || isUploading}
          >
            {isUploading ? "Uploading..." : "Upload Document"}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
