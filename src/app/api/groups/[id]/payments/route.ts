import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: groupId } = params;

  try {
    // Verify the user is the creator of the group
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      select: { creatorId: true, monthlyAmount: true },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    if (group.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: "Only group creators can record payments" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { memberId, month } = body;

    if (!memberId) {
      return NextResponse.json(
        { error: "Member ID is required" },
        { status: 400 }
      );
    }

    // Check if member exists and belongs to this group
    const member = await prisma.member.findFirst({
      where: {
        id: memberId,
        groupId,
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: "Member not found in this group" },
        { status: 404 }
      );
    }

    // Calculate payment date based on month index
    const currentDate = new Date();
    const paymentDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + (month || 0),
      1
    );

    // Create or update payment record
    const payment = await prisma.payment.upsert({
      where: {
        memberId_scheduledDate: {
          memberId,
          scheduledDate: paymentDate,
        },
      },
      update: {
        isPaid: true,
      },
      create: {
        memberId,
        amount: group.monthlyAmount,
        scheduledDate: paymentDate,
        isPaid: true,
        group: { connect: { id: groupId } },
      },
    });

    return NextResponse.json({
      id: payment.id,
      memberId: payment.memberId,
      amount: payment.amount,
      scheduledDate: payment.scheduledDate,
      isPaid: payment.isPaid,
    });
  } catch (error) {
    console.error("Error recording payment:", error);
    return NextResponse.json(
      { error: "Failed to record payment" },
      { status: 500 }
    );
  }
}
