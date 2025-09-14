"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FaGoogle } from "react-icons/fa";
import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const error = searchParams.get("error");
  const { status } = useSession();
  const router = useRouter();

  // Handle error parameter in URL
  useEffect(() => {
    if (error) {
      if (error === "Configuration") {
        setNetworkError(
          "Unable to connect to authentication service. Please check your internet connection."
        );
      } else if (error === "OAuthAccountNotLinked") {
        setNetworkError("Email already in use with a different provider.");
      } else {
        setNetworkError("Authentication failed. Please try again.");
      }
    }
  }, [error]);

  // Keep loading state active during authentication and redirection
  useEffect(() => {
    if (isLoading && status === "authenticated") {
      // User is authenticated, but we'll keep the loading state
      // The redirection will happen automatically via middleware
    }
  }, [isLoading, status, router]);

  // Check for internet connection
  const checkInternetConnection = (): boolean => {
    return navigator.onLine;
  };

  const handleGoogleLogin = async () => {
    setNetworkError(null);
    setIsLoading(true);

    // Check for internet connection first
    if (!checkInternetConnection()) {
      setNetworkError(
        "No internet connection. Please check your network and try again."
      );
      setIsLoading(false);
      return;
    }

    try {
      const result = await signIn("google", {
        callbackUrl: callbackUrl || "/user/dashboard",
        redirect: false, // Don't automatically redirect to handle errors
      });

      if (result?.error) {
        // Handle specific NextAuth errors
        if (result.error === "Configuration") {
          setNetworkError(
            "Unable to connect to authentication service. Please check your internet connection."
          );
        } else {
          setNetworkError("Authentication failed. Please try again.");
        }
        setIsLoading(false);
      } else if (result?.url) {
        // Successful authentication, manually redirect
        router.push(result.url);
        // Keep loading state true for better UX
      }
    } catch (error) {
      console.error("Google login error:", error);
      setNetworkError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Welcome to FastCodeAI Day One
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

          {(error || networkError) && (
            <div className="bg-red-100 p-3 rounded-md text-sm text-red-600 w-full">
              {networkError
                ? networkError
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
            <span>{isLoading ? "Logging in..." : "Login with Google"}</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
