import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string; roundId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: groupId, roundId } = params;
    const { winnerId } = await request.json();

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
        { error: "Only group creators can complete rounds" },
        { status: 403 }
      );
    }

    // Verify the round exists
    const round = await prisma.arisanRound.findUnique({
      where: {
        id: roundId,
      },
    });

    if (!round) {
      return NextResponse.json({ error: "Round not found" }, { status: 404 });
    }

    // Verify the round belongs to this group
    if (round.groupId !== groupId) {
      return NextResponse.json(
        { error: "Round does not belong to this group" },
        { status: 400 }
      );
    }

    // Verify the round is not already completed
    if (round.is_completed) {
      return NextResponse.json(
        { error: "Round is already completed" },
        { status: 400 }
      );
    }

    // Verify the winner is a member of the group
    const winner = await prisma.member.findFirst({
      where: {
        userId: winnerId,
        groupId,
      },
    });

    if (!winner && winnerId) {
      return NextResponse.json(
        { error: "Winner must be a member of the group" },
        { status: 400 }
      );
    }

    // Complete the round
    const completedRound = await prisma.arisanRound.update({
      where: {
        id: roundId,
      },
      data: {
        is_completed: true,
        winner_id: winnerId || null,
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

    return NextResponse.json(completedRound);
  } catch (error) {
    console.error("[ROUND_COMPLETE]", error);
    return NextResponse.json(
      { error: "Failed to complete round" },
      { status: 500 }
    );
  }
}
