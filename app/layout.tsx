import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TanStackQueryProvider } from "@/lib/tanstack-query-provider";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { Suspense } from "react";
import { NotificationProvider } from "@/contexts/notification-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FastCodeAI DayOne",
  description: "FastCodeAI DayOne",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Suspense fallback={null}>
          <SessionProvider>
            <TanStackQueryProvider>
              <NotificationProvider>
                {children}
              </NotificationProvider>
            </TanStackQueryProvider>
          </SessionProvider>
        </Suspense>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
