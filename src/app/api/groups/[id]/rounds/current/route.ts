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

    // Get the group with start_month
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      select: {
        id: true,
        start_month: true,
      },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Get the current date
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get the most recent round
    const currentRound = await prisma.arisanRound.findFirst({
      where: {
        groupId,
        month: currentMonth,
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
    });

    // If no current round exists, find the latest round
    const latestRound = !currentRound
      ? await prisma.arisanRound.findFirst({
          where: {
            groupId,
          },
          orderBy: {
            month: "desc",
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
        })
      : null;

    // Calculate the next round date
    const nextRoundDate = latestRound
      ? new Date(
          latestRound.month.getFullYear(),
          latestRound.month.getMonth() + 1,
          1
        )
      : currentMonth;

    return NextResponse.json({
      current_round: currentRound || latestRound,
      next_round_date: nextRoundDate.toISOString(),
      is_new_round_available:
        nextRoundDate <= currentMonth &&
        (!currentRound || (latestRound && !latestRound.is_completed)),
    });
  } catch (error) {
    console.error("[CURRENT_ROUND_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch current round" },
      { status: 500 }
    );
  }
}
