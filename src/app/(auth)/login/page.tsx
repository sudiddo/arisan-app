"use client";

import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import SessionDebug from "@/components/SessionDebug";
import DebugTools from "@/components/DebugTools";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const callbackUrl = searchParams.get("callbackUrl") || "/groups";
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(error);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    // Check for redirect loop
    const redirectCount = parseInt(
      localStorage.getItem("redirectCount") || "0"
    );

    // Reset redirect counter if user explicitly visits login page
    if (
      window.location.pathname === "/login" &&
      !document.referrer.includes("/api/auth")
    ) {
      localStorage.setItem("redirectCount", "0");
    }
    // Increment counter if coming from another page
    else if (document.referrer) {
      localStorage.setItem("redirectCount", (redirectCount + 1).toString());
    }

    // Show debug if too many redirects
    if (redirectCount > 3) {
      setShowDebug(true);
      console.error("Redirect loop detected, debug tools enabled");
    }

    // Log auth state on page load
    console.log("Login page loaded", {
      error,
      callbackUrl,
      cookies: document.cookie,
      redirectCount,
    });
  }, [error, callbackUrl]);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      setAuthError(null);

      // Force clear any existing session before sign in
      document.cookie.split(";").forEach((cookie) => {
        const [name] = cookie.split("=");
        if (name.trim().includes("next-auth")) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        }
      });

      console.log("Starting sign in...");
      await signIn("google", {
        callbackUrl,
        redirect: true,
      });
    } catch (error) {
      console.error("Sign-in error:", error);
      setIsLoading(false);
      setAuthError("Failed to sign in. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-12 flex items-center justify-center">
        <div className="max-w-md w-full p-8 border rounded-lg shadow-sm">
          <h1 className="text-3xl font-bold mb-6 text-center">Sign In</h1>
          <p className="text-center mb-8">
            Sign in to create or manage your arisan groups
          </p>

          {authError && (
            <div className="p-3 mb-4 text-sm text-red-500 bg-red-50 rounded-md">
              {authError}
            </div>
          )}

          <Button
            onClick={handleSignIn}
            className="w-full"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in with Google"}
          </Button>

          {process.env.NODE_ENV !== "production" && (
            <div className="mt-4">
              <Button
                variant="outline"
                className="w-full text-xs"
                onClick={() => setShowDebug(!showDebug)}
              >
                {showDebug ? "Hide Debug Tools" : "Show Debug Tools"}
              </Button>
            </div>
          )}
        </div>
      </main>
      {process.env.NODE_ENV === "development" && <SessionDebug />}
      {showDebug && <DebugTools />}
    </div>
  );
}
