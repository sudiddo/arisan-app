import { GroupCard } from "@/components/groups/GroupCard";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { EmptyState } from "@/components/groups/EmptyState";

type Group = {
  id: string;
  name: string;
  monthlyAmount: number;
  rules: string | null;
  createdAt: Date;
  updatedAt: Date;
  creatorId: string;
};

interface GroupWithCount extends Group {
  memberCount: number;
  isCreator: boolean;
}

export default async function GroupsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return null; // Will be handled by layout
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    include: {
      groups: true,
      members: {
        include: { group: true },
      },
    },
  });

  if (!user) {
    return null;
  }

  // Combine created groups and groups user is a member of
  const createdGroups = user.groups;

  const memberGroups = user.members
    .filter((member: { userId: string | null }) => member.userId === user.id)
    .map((member: { group: Group }) => member.group);

  // Remove duplicates
  const allGroups = [
    ...createdGroups,
    ...memberGroups.filter(
      (memberGroup: Group) =>
        !createdGroups.some((group: Group) => group.id === memberGroup.id)
    ),
  ];

  // Get member counts for each group
  const groupsWithCounts = await Promise.all(
    allGroups.map(async (group: Group) => {
      const memberCount = await db.member.count({
        where: { groupId: group.id },
      });

      return {
        ...group,
        memberCount,
        isCreator: createdGroups.some((g: Group) => g.id === group.id),
      } as GroupWithCount;
    })
  );

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Groups</h1>
        <Button asChild>
          <Link href="/groups/new">Create New Group</Link>
        </Button>
      </div>

      {groupsWithCounts.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groupsWithCounts.map((group) => (
            <GroupCard
              key={group.id}
              id={group.id}
              name={group.name}
              monthlyAmount={group.monthlyAmount}
              memberCount={group.memberCount}
              isCreator={group.isCreator}
            />
          ))}
        </div>
      )}
    </div>
  );
}
