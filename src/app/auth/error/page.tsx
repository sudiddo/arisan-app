"use client";

import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  let errorMessage = "An error occurred during authentication.";

  if (error === "AccessDenied") {
    errorMessage = "You do not have permission to sign in.";
  } else if (error === "Configuration") {
    errorMessage = "There is a problem with the server configuration.";
  } else if (error === "Verification") {
    errorMessage =
      "The verification link may have expired or has already been used.";
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-12 flex items-center justify-center">
        <div className="max-w-md w-full p-8 border rounded-lg shadow-sm">
          <h1 className="text-3xl font-bold mb-6 text-center">
            Authentication Error
          </h1>

          <div className="mb-8 p-4 bg-destructive/10 rounded-md text-destructive text-center">
            {errorMessage}
          </div>

          <div className="flex flex-col gap-4">
            <Button asChild>
              <Link href="/auth/signin">Try Again</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
