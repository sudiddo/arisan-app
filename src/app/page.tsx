import { Navbar } from "@/components/Navbar";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { MarketingPage } from "@/components/marketing/MarketingPage";

export default async function Home() {
  const session = await getServerSession(authOptions);

  // Redirect authenticated users to groups page
  if (session?.user) {
    redirect("/groups");
  }

  // Marketing page for unauthenticated users
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <MarketingPage />
      </main>
      <footer className="border-t py-6">
        <div className="container text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Arisan App. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
