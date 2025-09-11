"use client";

import HolidaysTab from "@/components/user/general-guidelines/holidays-tab";

export default function HolidaysPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Company Holidays</h1>
        <p className="text-muted-foreground mt-1">
          Official holiday calendar for the current year
        </p>
      </div>

      <HolidaysTab />
    </div>
  );
}
