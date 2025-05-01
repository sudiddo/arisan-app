import { Button } from "@/components/ui/button";
import Link from "next/link";

export function MarketingPage() {
  return (
    <>
      <section className="py-20 md:py-28">
        <div className="container flex flex-col items-center text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Manage your <span className="text-primary">Arisan</span> groups with
            ease
          </h1>
          <p className="text-xl text-muted-foreground max-w-[700px]">
            A modern app for Rotating Savings and Credit Associations (ROSCA)
            with QR code member invitations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" asChild>
              <Link href="/login">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/claim">Claim Membership</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-14 bg-muted/50">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6">
              <div className="bg-primary/10 text-primary rounded-full w-12 h-12 flex items-center justify-center mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Create a Group</h3>
              <p className="text-muted-foreground">
                Set up your savings group with a name, monthly amount, and
                rules.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6">
              <div className="bg-primary/10 text-primary rounded-full w-12 h-12 flex items-center justify-center mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Add Members</h3>
              <p className="text-muted-foreground">
                Add members and share QR codes for them to join securely.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6">
              <div className="bg-primary/10 text-primary rounded-full w-12 h-12 flex items-center justify-center mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Manage Together</h3>
              <p className="text-muted-foreground">
                Keep track of contributions and manage your ROSCA with
                transparency.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
