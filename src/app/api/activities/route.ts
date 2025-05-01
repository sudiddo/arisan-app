import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

type UserGroup = {
  id: string;
  name: string;
};

type RecentMember = {
  id: string;
  name: string;
  createdAt: Date;
  groupId: string;
};

type RecentGroup = {
  id: string;
  name: string;
  createdAt: Date;
};

type Activity = {
  id: string;
  type: string;
  groupId: string;
  groupName: string;
  date: Date;
  message: string;
};

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get groups the user is a member of
    const userGroups = await prisma.group.findMany({
      where: {
        OR: [
          { creatorId: session.user.id },
          {
            members: {
              some: {
                userId: session.user.id,
              },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
      },
    });

    const groupIds = userGroups.map((group: UserGroup) => group.id);

    // For demonstration purposes, we'll generate mock activity data
    // In a real app, you would have an actual activity table in your database
    const mockActivities: Activity[] = [];

    // Add recent member additions
    const recentMembers = await prisma.member.findMany({
      where: {
        groupId: {
          in: groupIds,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      select: {
        id: true,
        name: true,
        createdAt: true,
        groupId: true,
      },
    });

    const activitiesFromMembers = recentMembers.map((member: RecentMember) => {
      const group = userGroups.find((g: UserGroup) => g.id === member.groupId);
      return {
        id: `join-${member.id}`,
        type: "join",
        groupId: member.groupId,
        groupName: group?.name || "Unknown Group",
        date: member.createdAt,
        message: `${member.name} was added to the group`,
      };
    });

    mockActivities.push(...activitiesFromMembers);

    // Add group creation activities
    const recentGroups = await prisma.group.findMany({
      where: {
        creatorId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 3,
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    });

    const groupActivities = recentGroups.map((group: RecentGroup) => ({
      id: `create-${group.id}`,
      type: "creation",
      groupId: group.id,
      groupName: group.name,
      date: group.createdAt,
      message: `You created the group`,
    }));

    mockActivities.push(...groupActivities);

    // Sort all activities by date (newest first)
    const sortedActivities = mockActivities.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    return NextResponse.json(sortedActivities.slice(0, 10));
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}
