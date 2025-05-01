import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

type GroupWithMemberCount = {
  id: string;
  name: string;
  monthlyAmount: number;
  rules: string | null;
  createdAt: Date;
  updatedAt: Date;
  creatorId: string;
  _count: {
    members: number;
  };
};

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const groups = await prisma.group.findMany({
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
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: { members: true },
        },
      },
    });

    const formattedGroups = groups.map((group: GroupWithMemberCount) => ({
      id: group.id,
      name: group.name,
      monthlyAmount: group.monthlyAmount,
      rules: group.rules,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
      creatorId: group.creatorId,
      memberCount: group._count.members,
    }));

    return NextResponse.json(formattedGroups);
  } catch (error) {
    console.error("Error fetching groups:", error);
    return NextResponse.json(
      { error: "Failed to fetch groups" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const { name, monthlyAmount, rules } = body;

    if (!name || !monthlyAmount) {
      return NextResponse.json(
        { error: "Name and monthly amount are required" },
        { status: 400 }
      );
    }

    const group = await prisma.group.create({
      data: {
        name,
        monthlyAmount: parseFloat(monthlyAmount),
        rules,
        creator: {
          connect: { id: session.user.id },
        },
      },
    });

    return NextResponse.json(group);
  } catch (error) {
    console.error("Error creating group:", error);
    return NextResponse.json(
      { error: "Failed to create group" },
      { status: 500 }
    );
  }
}
