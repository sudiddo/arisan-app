"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { MemberList } from "@/components/groups/MemberList";
import { PaymentSchedule } from "@/components/groups/PaymentSchedule";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type GroupDetails = {
  id: string;
  name: string;
  monthlyAmount: number;
  description: string | null;
  rules: string | null;
  createdAt: string;
  creatorId: string;
  members: {
    id: string;
    name: string;
    createdAt: string;
    userId: string | null;
  }[];
  payments: {
    id: string;
    memberId: string;
    amount: number;
    scheduledDate: string;
    isPaid: boolean;
  }[];
};

export default function GroupDetailPage() {
  const params = useParams();
  const { data: session } = useSession();
  const [group, setGroup] = useState<GroupDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const groupId = params.id as string;

  const isCreator = group?.creatorId === session?.user?.id;

  const fetchGroupDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/groups/${groupId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch group details");
      }

      const data = await response.json();
      setGroup(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
      toast.error("Failed to load group details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (groupId) {
      fetchGroupDetails();
    }
  }, [groupId]);

  const handleRecordPayment = async (memberId: string, month: number) => {
    try {
      const response = await fetch(`/api/groups/${groupId}/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ memberId, month }),
      });

      if (!response.ok) {
        throw new Error("Failed to record payment");
      }

      toast.success("Payment recorded successfully");
      fetchGroupDetails();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };

  return (
    <div className="container mx-auto py-6">
      {isLoading ? (
        <div className="space-y-4">
          <div className="h-8 w-64 animate-pulse rounded-lg bg-muted"></div>
          <div className="h-4 w-48 animate-pulse rounded-lg bg-muted"></div>
          <div className="mt-8 h-64 animate-pulse rounded-lg border bg-muted/50"></div>
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-center text-destructive">
          <p className="mb-4 text-lg font-medium">{error}</p>
          <Button variant="outline" asChild>
            <Link href="/groups">Return to Groups</Link>
          </Button>
        </div>
      ) : group ? (
        <div className="space-y-8">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">{group.name}</h1>
              {isCreator && (
                <Button asChild>
                  <Link href={`/groups/${group.id}/invite`}>
                    Invite Members
                  </Link>
                </Button>
              )}
            </div>
            <p className="text-muted-foreground">
              Monthly contribution: ${group.monthlyAmount.toLocaleString()}
            </p>
            {group.description && (
              <p className="mt-2 text-sm">{group.description}</p>
            )}
          </div>

          {group.rules && (
            <div className="rounded-lg border p-4">
              <h2 className="mb-2 text-xl font-semibold">Group Rules</h2>
              <div className="whitespace-pre-wrap text-sm">{group.rules}</div>
            </div>
          )}

          <div className="grid gap-8 lg:grid-cols-2">
            <MemberList
              groupId={group.id}
              members={group.members}
              isCreator={isCreator}
            />

            <PaymentSchedule
              members={group.members}
              payments={group.payments}
              monthlyAmount={group.monthlyAmount}
              isCreator={isCreator}
              onRecordPayment={handleRecordPayment}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
