"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FaGoogle } from "react-icons/fa";

export default function Login() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Welcome to FastCodeAI
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6 pt-4">
          <div className="relative w-40 h-40">
            <Image
              src="/brain.svg"
              alt="FastCodeAI Logo"
              fill
              priority
              className="object-contain"
            />
          </div>
          <Button
            className="w-full flex items-center justify-center gap-2"
            size="lg"
          >
            <FaGoogle className="h-5 w-5" />
            <span>Login with Google</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
