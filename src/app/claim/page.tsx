"use client";

import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ClaimPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groupName, setGroupName] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError(
        "No token provided. You need to scan a QR code or use a valid invite link."
      );
      return;
    }

    async function getGroupInfo() {
      try {
        const response = await fetch(`/api/members/info?token=${token}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to get group information");
        }

        const data = await response.json();
        setGroupName(data.groupName);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to get group information"
        );
      }
    }

    getGroupInfo();
  }, [token]);

  async function claimMembership() {
    if (!token || !session?.user) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/members/claim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to claim membership");
      }

      const data = await response.json();
      toast.success("Successfully claimed membership!");
      router.push(`/groups/${data.groupId}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to claim membership"
      );
      setError(
        err instanceof Error ? err.message : "Failed to claim membership"
      );
    } finally {
      setIsLoading(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container py-12 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Loading...</h1>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-12 flex items-center justify-center">
        <div className="max-w-md w-full p-8 border rounded-lg shadow-sm">
          <h1 className="text-3xl font-bold mb-6 text-center">
            Claim Membership
          </h1>

          {error ? (
            <div className="text-center">
              <div className="mb-6 p-4 bg-destructive/10 rounded-md text-destructive">
                {error}
              </div>
              <Button asChild variant="outline">
                <Link href="/">Go Home</Link>
              </Button>
            </div>
          ) : !token ? (
            <div className="text-center">
              <p className="mb-6">
                To claim your membership, please scan a QR code or use an invite
                link.
              </p>
              <Button asChild variant="outline">
                <Link href="/">Go Home</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                {groupName ? (
                  <p className="mb-2">
                    You are claiming membership to join:
                    <span className="block font-semibold text-lg mt-2">
                      {groupName}
                    </span>
                  </p>
                ) : (
                  <p>Preparing to claim your membership...</p>
                )}
              </div>

              {status === "authenticated" ? (
                <div className="space-y-4">
                  <p className="text-sm text-center text-muted-foreground mb-4">
                    You will join as {session.user.name || session.user.email}
                  </p>
                  <Button
                    className="w-full"
                    onClick={claimMembership}
                    disabled={isLoading || !groupName}
                  >
                    {isLoading ? "Claiming..." : "Claim Membership"}
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <p className="mb-4">
                    Please sign in to claim your membership
                  </p>
                  <Button asChild className="w-full">
                    <Link
                      href={`/api/auth/signin?callbackUrl=${encodeURIComponent(
                        `/claim?token=${token}`
                      )}`}
                    >
                      Sign In to Continue
                    </Link>
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
