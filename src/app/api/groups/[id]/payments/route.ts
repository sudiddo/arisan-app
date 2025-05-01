import { NextResponse } from "next/server";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  console.log("SESSION:", JSON.stringify(session, null, 2));

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: groupId } = params;
  console.log(
    `Authorization check for userId: ${session.user.id}, groupId: ${groupId}`
  );

  try {
    // First, let's check if the group exists
    const groupExists = await prisma.group.findUnique({
      where: { id: groupId },
    });
    console.log("Group exists:", !!groupExists);

    if (!groupExists) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Check if user is the creator
    const isCreator = groupExists.creatorId === session.user.id;
    console.log("User is creator:", isCreator);

    // Check if user is a member
    const userMembership = await prisma.member.findFirst({
      where: {
        groupId,
        userId: session.user.id,
      },
    });
    console.log("User membership:", userMembership);

    // If neither creator nor member, deny access
    if (!isCreator && !userMembership) {
      console.log("DENIED: User is neither creator nor member");
      return NextResponse.json(
        { error: "Not authorized for this group" },
        { status: 403 }
      );
    }

    console.log("Authorization passed");

    const body = await request.json();
    const { memberId } = body;
    console.log("Request for memberId:", memberId);

    if (!memberId) {
      return NextResponse.json(
        { error: "Member ID is required" },
        { status: 400 }
      );
    }

    // Check if member exists and belongs to this group
    const memberExists = await prisma.member.findFirst({
      where: {
        id: memberId,
        groupId,
      },
    });
    console.log("Target member exists:", !!memberExists);

    if (!memberExists) {
      return NextResponse.json(
        { error: "Member not found in this group" },
        { status: 404 }
      );
    }

    // Get first day of current month
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    // Toggle payment status - Skip the findUnique and go straight to upsert
    const payment = await prisma.payment.upsert({
      where: {
        memberId_scheduledDate: {
          memberId,
          scheduledDate: currentMonth,
        },
      },
      update: {
        isPaid: true,
      },
      create: {
        memberId,
        groupId,
        scheduledDate: currentMonth,
        isPaid: true,
      },
    });
    console.log("Payment result:", payment);

    return NextResponse.json({
      success: true,
      isPaid: payment.isPaid,
      date: payment.scheduledDate,
    });
  } catch (error) {
    console.error("Payment update failed:", error);
    return NextResponse.json(
      { error: "Payment update failed" },
      { status: 500 }
    );
  }
}
