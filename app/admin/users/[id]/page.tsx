"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, UserRole } from "@/models/user";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Document, DocumentStatus, DocumentType } from "@/models/document";
import { toast } from "sonner";
import { GeneralDetailsTab } from "@/components/admin/users/general-details-tab";
import { DocumentsTab } from "@/components/admin/users/documents-tab";

export default function UserDetailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<string>(
    tabParam === "documents" ? "documents" : "general"
  );

  // Update active tab when URL parameter changes
  useEffect(() => {
    if (tabParam === "documents") {
      setActiveTab("documents");
    } else {
      setActiveTab("general");
    }
  }, [tabParam]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1 mb-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Users</span>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4 bg-primary/10">
          <TabsTrigger
            value="general"
            className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary"
          >
            General Details
          </TabsTrigger>
          <TabsTrigger
            value="documents"
            className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary"
          >
            Documents
          </TabsTrigger>
        </TabsList>
        <GeneralDetailsTab />
        <DocumentsTab />
      </Tabs>
    </div>
  );
}
