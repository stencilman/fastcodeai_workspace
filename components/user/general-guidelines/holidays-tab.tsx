"use client";

import Image from "next/image";

export function HolidaysTab() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4">Company Holidays</h2>
        <p className="text-muted-foreground mb-6">
          Below is the list of official holidays observed by FastCode AI for the
          current year.
        </p>

        <div className="flex justify-center">
          <div className="relative max-w-full">
            <Image
              src="/holidays.png"
              alt="FastCode AI Holidays List"
              width={800}
              height={600}
              className="rounded-md border"
              style={{ objectFit: "contain" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
