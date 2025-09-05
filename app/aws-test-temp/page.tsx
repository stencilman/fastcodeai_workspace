"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Trash2, RefreshCw, Upload, FileIcon, Check, Square } from "lucide-react";
import { formatBytes, formatDate } from "@/lib/utils";

interface BucketInfo {
  bucketName: string;
  region: string;
}

interface S3Object {
  Key: string;
  Size: number;
  LastModified?: Date;
}

export default function AwsTestPage() {
  const [bucketInfo, setBucketInfo] = useState<BucketInfo | null>(null);
  const [objects, setObjects] = useState<S3Object[]>([]);
  const [loading, setLoading] = useState(true);
  const [prefix, setPrefix] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch objects on load and when prefix changes
  useEffect(() => {
    fetchObjects();
  }, [prefix]);

  const fetchObjects = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/aws-test?prefix=${encodeURIComponent(prefix)}`);
      
      const data = await response.json();
      
      if (!response.ok) {
        const errorMessage = data.error || "Failed to fetch objects";
        console.error("Server error:", errorMessage);
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }
      
      setBucketInfo(data.bucketInfo);
      setObjects(data.objects || []);
    } catch (error) {
      console.error("Error fetching objects:", error);
      toast.error(error instanceof Error ? error.message : "Failed to fetch objects");
      // Set empty objects array to prevent undefined errors
      setObjects([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedKeys.length === objects.length) {
      setSelectedKeys([]);
    } else {
      setSelectedKeys(objects.map(obj => obj.Key));
    }
  };

  const toggleSelectObject = (key: string) => {
    if (selectedKeys.includes(key)) {
      setSelectedKeys(selectedKeys.filter(k => k !== key));
    } else {
      setSelectedKeys([...selectedKeys, key]);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedKeys.length === 0) {
      toast.error("No objects selected for deletion");
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedKeys.length} objects?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch("/api/aws-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ keys: selectedKeys }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete objects");
      }

      const result = await response.json();
      
      if (result.Errors.length > 0) {
        toast.error(`Deleted ${result.Deleted.length} objects, but ${result.Errors.length} failed`);
      } else {
        toast.success(`Successfully deleted ${result.Deleted.length} objects`);
      }
      
      // Refresh the list and clear selection
      fetchObjects();
      setSelectedKeys([]);
    } catch (error) {
      console.error("Error deleting objects:", error);
      toast.error("Failed to delete objects");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) {
      toast.error("No file selected");
      return;
    }

    setIsUploading(true);
    try {
      // Create a document record and get upload URL
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: uploadFile.name,
          fileSize: uploadFile.size,
          fileType: uploadFile.type,
          docType: 'TEST_UPLOAD',
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to initiate upload");
      }

      const { document, uploadUrl } = await response.json();

      // Upload the file to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: uploadFile,
        headers: {
          'Content-Type': uploadFile.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file to S3");
      }

      toast.success("File uploaded successfully");
      setUploadFile(null);
      
      // Refresh the list
      fetchObjects();
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">AWS S3 Storage Test</CardTitle>
          <CardDescription>
            {bucketInfo ? (
              <span className="text-green-600">
                Connected to S3 bucket: <strong>{bucketInfo.bucketName}</strong> in region: <strong>{bucketInfo.region}</strong>
              </span>
            ) : (
              <span className="text-gray-500">Loading storage information...</span>
            )}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-col space-y-4">
            {/* Filter and actions */}
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Filter by prefix (folder path)"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                className="max-w-md"
              />
              <Button 
                variant="outline" 
                onClick={fetchObjects}
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                Refresh
              </Button>
            </div>

            {/* Upload section */}
            <div className="flex items-center space-x-2 py-4 border-t border-b">
              <Input
                type="file"
                onChange={handleFileChange}
                disabled={isUploading}
              />
              <Button 
                onClick={handleUpload} 
                disabled={!uploadFile || isUploading}
              >
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                Upload
              </Button>
            </div>

            {/* Objects table */}
            <div className="border rounded-md">
              <div className="grid grid-cols-12 gap-2 p-2 font-medium bg-muted">
                <div className="col-span-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="p-0 h-6 w-6" 
                    onClick={toggleSelectAll}
                  >
                    {objects.length > 0 && selectedKeys.length === objects.length ? 
                      <Check className="h-4 w-4" /> : 
                      <Square className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="col-span-7">Key</div>
                <div className="col-span-2">Size</div>
                <div className="col-span-2">Last Modified</div>
              </div>
              
              {loading ? (
                <div className="flex justify-center items-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : objects.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No objects found
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  {objects.map((obj) => (
                    <div key={obj.Key} className="grid grid-cols-12 gap-2 p-2 border-t hover:bg-gray-50">
                      <div className="col-span-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="p-0 h-6 w-6" 
                          onClick={() => toggleSelectObject(obj.Key)}
                        >
                          {selectedKeys.includes(obj.Key) ? 
                            <Check className="h-4 w-4" /> : 
                            <Square className="h-4 w-4" />}
                        </Button>
                      </div>
                      <div className="col-span-7 flex items-center">
                        <FileIcon className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="truncate" title={obj.Key}>{obj.Key}</span>
                      </div>
                      <div className="col-span-2">{formatBytes(obj.Size)}</div>
                      <div className="col-span-2">{obj.LastModified ? formatDate(obj.LastModified) : 'N/A'}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <div>
            {objects.length > 0 && (
              <span className="text-sm text-gray-500">
                {selectedKeys.length} of {objects.length} objects selected
              </span>
            )}
          </div>
          <Button 
            variant="destructive" 
            onClick={handleDeleteSelected}
            disabled={selectedKeys.length === 0 || isDeleting}
          >
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
            Delete Selected
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
