"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useGroups } from "@/context/GroupContext";

type Member = {
  id: string;
  name: string;
  createdAt: string;
  userId: string | null;
};

type MemberListProps = {
  groupId: string;
  members: Member[];
  isCreator: boolean;
};

export function MemberList({ groupId, members, isCreator }: MemberListProps) {
  const [sortBy, setSortBy] = useState<"name" | "date">("date");
  const [filter, setFilter] = useState<"all" | "active" | "pending">("all");

  const filteredMembers = members.filter((member) => {
    if (filter === "all") return true;
    if (filter === "active") return member.userId !== null;
    if (filter === "pending") return member.userId === null;
    return true;
  });

  const sortedMembers = [...filteredMembers].sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    } else {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Members ({members.length})</h2>
        {isCreator && (
          <Button size="sm" asChild>
            <Link href={`/groups/${groupId}/invite`}>Invite Member</Link>
          </Button>
        )}
      </div>

      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Sort:</span>
          <Button
            size="sm"
            variant={sortBy === "date" ? "default" : "outline"}
            onClick={() => setSortBy("date")}
            className="h-8"
          >
            Latest
          </Button>
          <Button
            size="sm"
            variant={sortBy === "name" ? "default" : "outline"}
            onClick={() => setSortBy("name")}
            className="h-8"
          >
            Name
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Show:</span>
          <Button
            size="sm"
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            className="h-8"
          >
            All
          </Button>
          <Button
            size="sm"
            variant={filter === "active" ? "default" : "outline"}
            onClick={() => setFilter("active")}
            className="h-8"
          >
            Active
          </Button>
          <Button
            size="sm"
            variant={filter === "pending" ? "default" : "outline"}
            onClick={() => setFilter("pending")}
            className="h-8"
          >
            Pending
          </Button>
        </div>
      </div>

      <div className="divide-y rounded-md border">
        {sortedMembers.length > 0 ? (
          sortedMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-2">
                <div className="font-medium">{member.name}</div>
                {member.userId === null && (
                  <span className="rounded bg-amber-100 px-2 py-1 text-xs text-amber-800">
                    Pending
                  </span>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                Joined {new Date(member.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-muted-foreground">
            No members found matching your filters
          </div>
        )}
      </div>
    </div>
  );
}
