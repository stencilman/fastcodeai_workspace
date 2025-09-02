"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Building,
  ExternalLink,
  Smartphone,
  CreditCard,
  Receipt,
} from "lucide-react";

export default function OfficeEntryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Office Entry Protocol</h1>
        <p className="text-muted-foreground mt-1">
          Follow these steps to get access to the office space
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-blue-600" />
            Bhive Workspace Access
          </CardTitle>
          <CardDescription>
            We use Bhive Workspace for our office space. You'll need to purchase
            a Bulk Day Pass.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1 - Download App */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                1
              </span>
              Download the Bhive App
            </h3>
            <p className="text-sm text-muted-foreground">
              Download the Bhive Workspace app from your device's app store.
            </p>
            <div className="flex flex-wrap gap-3 mt-2">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() =>
                  window.open(
                    "https://apps.apple.com/in/app/bhive-workspace/id6463923684",
                    "_blank"
                  )
                }
              >
                <Smartphone className="h-4 w-4" />
                App Store
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() =>
                  window.open(
                    "https://play.google.com/store/apps/details?id=com.bhive.workspace",
                    "_blank"
                  )
                }
              >
                <Smartphone className="h-4 w-4" />
                Google Play
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>

          {/* Step 2 - Purchase Pass */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                2
              </span>
              Purchase a 10-Day Pass
            </h3>
            <p className="text-sm text-muted-foreground">
              After creating an account, find and select the BHIVE Premium
              Whitefield Campus location.
            </p>

            {/* Purchase Pass Steps with Images */}
            <div className="mt-6">
              <h4 className="font-medium mb-3">How to Purchase Your Pass:</h4>

              <div className="flex overflow-x-auto pb-4 gap-4 snap-x">
                {/* Step 1 */}
                <div className="min-w-[280px] max-w-[280px] flex-shrink-0 space-y-2 snap-start">
                  <p className="text-sm font-medium">Step 1</p>
                  <div className="border rounded-md overflow-hidden">
                    <Image
                      src="/bhive_step_1.png"
                      alt="Bhive Purchase Step 1"
                      width={400}
                      height={200}
                      className="w-full object-contain"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Find BHIVE Premium Whitefield Campus and Select Bulk Day
                    Pass
                  </p>
                </div>

                {/* Step 2 */}
                <div className="min-w-[280px] max-w-[280px] flex-shrink-0 space-y-2 snap-start">
                  <p className="text-sm font-medium">Step 2</p>
                  <div className="border rounded-md overflow-hidden">
                    <Image
                      src="/bhive_step_2.png"
                      alt="Bhive Purchase Step 2"
                      width={400}
                      height={200}
                      className="w-full object-contain"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Click on the Book Button
                  </p>
                </div>

                {/* Step 3 */}
                <div className="min-w-[280px] max-w-[280px] flex-shrink-0 space-y-2 snap-start">
                  <p className="text-sm font-medium">Step 3</p>
                  <div className="border rounded-md overflow-hidden">
                    <Image
                      src="/bhive_step_3.png"
                      alt="Bhive Purchase Step 3"
                      width={400}
                      height={200}
                      className="w-full object-contain"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Click on Pay Now button and Proceed with the payment
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 - Get Reimbursed */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                3
              </span>
              Get Reimbursed
            </h3>
            <p className="text-sm text-muted-foreground">
              Submit your receipt for reimbursement through the expense portal.
            </p>
            <div className="bg-green-50 p-4 rounded-md border border-green-100">
              <div className="flex items-start gap-3">
                <Receipt className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-800">
                    Reimbursement Process
                  </p>
                  <ol className="text-sm text-green-700 mt-1 space-y-2 list-decimal pl-4">
                    <li>Download the receipt from your email</li>
                    <li>Log in to the expense portal</li>
                    <li>
                      Create a report (a report can have multiple expenses)
                    </li>
                    <li>Create the expenses and upload the receipts</li>
                    <li>Add all expenses to report</li>
                    <li>Submit the report</li>
                  </ol>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Button
                className="flex items-center gap-2"
                onClick={() =>
                  window.open("https://expense.fastcode.ai", "_blank")
                }
              >
                <Receipt className="h-4 w-4" />
                Go to Expense Portal
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
