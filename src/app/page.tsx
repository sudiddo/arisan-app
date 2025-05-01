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
      <footer className="border-t-4 border-ink py-6 bg-muted">
        <div className="container text-center">
          <div className="text-sm font-mono mb-2">
            <span className="text-stamp">♥</span> Dibuat dengan penuh semangat
            arisan <span className="text-stamp">♥</span>
          </div>
          <div className="text-xs font-mono">
            &copy; {new Date().getFullYear()} ArisanKu. Hak cipta dilindungi.
          </div>
        </div>
      </footer>
    </div>
  );
}
