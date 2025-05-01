import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const groupId = params.id;

    // Get all rounds for this group
    const rounds = await prisma.arisanRound.findMany({
      where: {
        groupId,
      },
      include: {
        winner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        month: "asc",
      },
    });

    return NextResponse.json(rounds);
  } catch (error) {
    console.error("[ROUNDS_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch rounds" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const groupId = params.id;

    // Verify the user is the group creator
    const group = await prisma.group.findUnique({
      where: {
        id: groupId,
      },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    if (group.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: "Only group creators can create new rounds" },
        { status: 403 }
      );
    }

    // Get the latest round
    const latestRound = await prisma.arisanRound.findFirst({
      where: {
        groupId,
      },
      orderBy: {
        month: "desc",
      },
    });

    if (latestRound && !latestRound.is_completed) {
      return NextResponse.json(
        {
          error:
            "The previous round must be completed before starting a new round",
        },
        { status: 400 }
      );
    }

    // Calculate the next month
    const nextMonth = latestRound
      ? new Date(
          latestRound.month.getFullYear(),
          latestRound.month.getMonth() + 1,
          1
        )
      : new Date();

    // Set to first day of the month
    nextMonth.setDate(1);
    nextMonth.setHours(0, 0, 0, 0);

    // Get the current date
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Check if trying to create a round for a future month
    if (nextMonth > currentMonth) {
      return NextResponse.json(
        { error: "Cannot create rounds for future months" },
        { status: 400 }
      );
    }

    // Create a new round
    const newRound = await prisma.arisanRound.create({
      data: {
        month: nextMonth,
        is_completed: false,
        group: {
          connect: {
            id: groupId,
          },
        },
      },
    });

    return NextResponse.json(newRound);
  } catch (error) {
    console.error("[ROUND_CREATE]", error);
    return NextResponse.json(
      { error: "Failed to create new round" },
      { status: 500 }
    );
  }
}
