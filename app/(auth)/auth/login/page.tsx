"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FaGoogle } from "react-icons/fa";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const error = searchParams.get("error");

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signIn("google", {
        callbackUrl: callbackUrl || "/user/dashboard",
      });
    } catch (error) {
      console.error("Google login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

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

          {error && (
            <div className="bg-red-100 p-3 rounded-md text-sm text-red-600 w-full">
              {error === "OAuthAccountNotLinked"
                ? "Email already in use with a different provider."
                : "Something went wrong. Please try again."}
            </div>
          )}

          <Button
            className="w-full flex items-center justify-center gap-2"
            size="lg"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <FaGoogle className="h-5 w-5" />
            )}
            <span>Login with Google</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
