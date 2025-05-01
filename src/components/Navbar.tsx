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
    <nav className="border-b-4 border-ink bg-paper">
      <div className="container flex justify-between items-center h-20">
        <Link
          href="/"
          className="font-pixel text-xl text-primary flex items-center"
        >
          <span className="text-primary">Arisan</span>
          <span className="text-stamp">Ku!</span>
          <div className="ml-2 w-6 h-6 relative">
            <Image
              src="/money-coins.png"
              alt="Coins"
              width={24}
              height={24}
              className="animate-bounce"
              style={{
                imageRendering: "auto",
              }}
            />
          </div>
        </Link>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link
                href="/groups"
                className="text-sm font-mono hover:underline"
              >
                Grup Saya
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut()}
                className="font-mono"
              >
                Keluar
              </Button>
              <div className="flex items-center gap-2 border-3 border-ink p-1 px-3 rounded-md bg-muted shadow-retro-sm">
                {session?.user?.image && (
                  <Image
                    src={session.user.image}
                    alt="User profile"
                    className="h-8 w-8 rounded-full border-2 border-ink"
                    width={32}
                    height={32}
                  />
                )}
                <span className="text-sm font-mono">{session?.user?.name}</span>
              </div>
            </>
          ) : (
            <Button
              onClick={() => signIn("google")}
              disabled={isLoading}
              className="bg-primary text-ink font-mono"
            >
              {isLoading ? "Loading..." : "Masuk"}
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
