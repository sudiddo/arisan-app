"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { MemberList } from "@/components/groups/MemberList";
import { PaymentSchedule } from "@/components/groups/PaymentSchedule";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";
import RoundStatus from "@/components/group/RoundStatus";

type GroupDetails = {
  id: string;
  name: string;
  monthlyAmount: number;
  description: string | null;
  rules: string | null;
  createdAt: string;
  creatorId: string;
  start_month: string;
  members: {
    id: string;
    name: string;
    createdAt: string;
    userId: string | null;
  }[];
  payments: {
    id: string;
    memberId: string;
    scheduledDate: string;
    isPaid: boolean;
  }[];
  rounds: {
    id: string;
    month: string;
    is_completed: boolean;
    winner_id: string | null;
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

  // Prepare members with admin status
  const membersWithAdminStatus =
    group?.members.map((member) => ({
      ...member,
      isAdmin: member.userId === group.creatorId,
    })) || [];

  const fetchGroupDetails = useCallback(async () => {
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
  }, [groupId]);

  useEffect(() => {
    if (groupId) {
      fetchGroupDetails();
    }
  }, [groupId, fetchGroupDetails]);

  const handleRecordPayment = async (memberId: string) => {
    try {
      const response = await fetch(`/api/groups/${groupId}/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ memberId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to record payment");
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
              Monthly contribution:{" "}
              <CurrencyDisplay amount={group.monthlyAmount} />
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
            <div className="space-y-8">
              <RoundStatus
                groupId={group.id}
                isCreator={isCreator}
                refetchGroup={fetchGroupDetails}
              />
              <MemberList groupId={group.id} />
            </div>

            <PaymentSchedule
              members={membersWithAdminStatus}
              payments={group.payments}
              groupId={groupId}
              onRecordPayment={handleRecordPayment}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
