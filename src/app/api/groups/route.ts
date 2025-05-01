import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

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

    const { name, monthlyAmount, rules, description, start_month } = body;

    if (!name || !monthlyAmount || !start_month) {
      return NextResponse.json(
        { error: "Name, monthly amount, and start month are required" },
        { status: 400 }
      );
    }

    // Parse start_month to a Date object (first day of the month)
    const startMonthDate = new Date(start_month);

    // Generate token and set expiry date (30 days from now)
    const claimToken = randomUUID();
    const tokenExpiry = new Date();
    tokenExpiry.setDate(tokenExpiry.getDate() + 30);

    const group = await prisma.group.create({
      data: {
        name,
        monthlyAmount: parseFloat(monthlyAmount),
        rules,
        description,
        start_month: startMonthDate,
        creator: {
          connect: { id: session.user.id },
        },
        // Automatically add creator as first member
        members: {
          create: {
            name: session.user.name || "Group Creator",
            userId: session.user.id,
            claimToken,
            tokenExpiry,
          },
        },
        // Create the first round
        rounds: {
          create: {
            month: startMonthDate,
            is_completed: false,
          },
        },
      },
      include: {
        members: true,
        rounds: true,
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
