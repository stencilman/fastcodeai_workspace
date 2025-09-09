"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { CommunicationTab } from "@/components/user/general-guidelines/communication-tab";
import { OfficeEntryTab } from "@/components/user/general-guidelines/office-entry-tab";

export default function GeneralGuidelinesPage() {
  const [activeTab, setActiveTab] = useState("communication");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">
          General Instructions and Guidelines
        </h1>
        <p className="text-muted-foreground mt-1">
          Important information for all Fast Code AI employees
        </p>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <p className="font-bold text-blue-800">
          IMPORTANT: Please update your job on LinkedIn to reflect your current
          position at Fast Code AI.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto pb-2 mb-2">
          <TabsList className="inline-flex md:flex md:w-full w-auto bg-primary/10 p-1">
            <TabsTrigger
              value="communication"
              className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary px-6 md:flex-1"
            >
              Communication Guidelines
            </TabsTrigger>
            <TabsTrigger
              value="office-entry"
              className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary px-6 md:flex-1"
            >
              Office Entry
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Communication Guidelines Tab Content */}
        <TabsContent value="communication" className="mt-6">
          <CommunicationTab />
        </TabsContent>

        {/* Office Entry Tab Content */}
        <TabsContent value="office-entry" className="mt-6">
          <OfficeEntryTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
