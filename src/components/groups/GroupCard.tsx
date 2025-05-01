"use client";

import { useGroups } from "@/context/GroupContext";
import Link from "next/link";

export type GroupCardProps = {
  id: string;
  name: string;
  monthlyAmount: number;
  memberCount?: number;
  isCreator?: boolean;
};

export function GroupCard({
  id,
  name,
  monthlyAmount,
  memberCount = 0,
  isCreator,
}: GroupCardProps) {
  const { activeGroupId, setActiveGroupId } = useGroups();
  const isActive = activeGroupId === id;

  return (
    <Link
      href={`/groups/${id}`}
      onClick={() => setActiveGroupId(id)}
      className={`flex flex-col rounded-lg border p-4 transition-all hover:shadow-md ${
        isActive ? "border-primary bg-primary/5" : "border-border"
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{name}</h3>
        <div className="flex gap-2">
          {isCreator && (
            <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
              Creator
            </span>
          )}
          <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
            {memberCount} {memberCount === 1 ? "member" : "members"}
          </span>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Monthly amount</span>
        <span className="font-medium">${monthlyAmount.toLocaleString()}</span>
      </div>
    </Link>
  );
}
