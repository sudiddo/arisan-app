"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "./ui/button";
import Image from "next/image";

export function Navbar() {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  return (
    <nav className="border-b bg-background">
      <div className="container flex justify-between items-center h-16">
        <Link href="/" className="font-bold text-xl">
          Arisan App
        </Link>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link href="/groups" className="text-sm font-medium">
                My Groups
              </Link>
              <Button variant="ghost" size="sm" onClick={() => signOut()}>
                Sign Out
              </Button>
              <div className="flex items-center gap-2">
                {session?.user?.image && (
                  <Image
                    src={session.user.image}
                    alt="User profile"
                    className="h-8 w-8 rounded-full"
                    width={32}
                    height={32}
                  />
                )}
                <span className="text-sm font-medium">
                  {session?.user?.name}
                </span>
              </div>
            </>
          ) : (
            <Button onClick={() => signIn("google")} disabled={isLoading}>
              {isLoading ? "Loading..." : "Sign In"}
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
