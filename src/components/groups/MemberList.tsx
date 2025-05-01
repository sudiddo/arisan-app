"use client";

import useSWR from "swr";
import { PaymentStatus } from "./PaymentStatus";
import { useSession } from "next-auth/react";
import { AdminBadge } from "./AdminBadge";

type Member = {
  id: string;
  name: string;
  createdAt: string;
  userId: string | null;
  isAdmin: boolean;
  paymentStatus?: {
    isPaid: boolean;
  };
};

type MemberListProps = {
  groupId: string;
};

export function MemberList({ groupId }: MemberListProps) {
  const { data: session } = useSession();
  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const { data: members, isLoading } = useSWR<Member[]>(
    `/api/groups/${groupId}/members`,
    fetcher
  );

  // Check if current user is an admin
  const isCurrentUserAdmin = members?.some(
    (member) => member.userId === session?.user?.id && member.isAdmin
  );

  // Get current month and year for payment status
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="font-medium">Members</h3>
        <div className="divide-y rounded-md border">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex animate-pulse items-center justify-between p-4"
            >
              <div className="space-y-2">
                <div className="h-5 w-24 rounded bg-muted"></div>
                <div className="h-4 w-32 rounded bg-muted"></div>
              </div>
              <div className="h-6 w-16 rounded bg-muted"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Members ({members?.length || 0})</h3>
      <div className="divide-y rounded-md border">
        {!members || members.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No members found
          </div>
        ) : (
          members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">
                    {member.name}
                    {member.userId === session?.user?.id && " (You)"}
                  </p>
                  {member.isAdmin && <AdminBadge />}
                </div>
                <p className="text-sm text-muted-foreground">
                  Joined {new Date(member.createdAt).toLocaleDateString()}
                  {member.isAdmin && " • Creator"}
                </p>
              </div>
              <PaymentStatus
                memberId={member.id}
                groupId={groupId}
                isAdmin={isCurrentUserAdmin}
                month={currentMonth}
                year={currentYear}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
