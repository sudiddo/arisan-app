import { Button } from "@/components/ui/button";
import Link from "next/link";

export function EmptyState() {
  return (
    <div className="text-center py-12 border rounded-lg bg-muted/30 flex flex-col items-center">
      <div className="mb-6 p-4 bg-primary/10 rounded-full">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary w-8 h-8"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4" />
          <path d="M12 16h.01" />
        </svg>
      </div>
      <h2 className="text-2xl font-medium mb-2">No Groups Yet</h2>
      <p className="text-muted-foreground max-w-md mb-8">
        Create your first Arisan group to start managing your savings circle, or
        join an existing group using a claim code.
      </p>
      <div className="flex gap-4 justify-center">
        <Button size="lg" asChild>
          <Link href="/groups/new">Create Your First Group</Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/claim">Join a Group</Link>
        </Button>
      </div>
    </div>
  );
}
