import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { addMemberSchema } from "@/lib/schemas/group";
import { randomUUID } from "crypto";
import { verifyGroupAdmin, verifyGroupMember } from "@/lib/auth";

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
    const isAdmin = await verifyGroupAdmin(groupId, session.user.id);

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Only group creators can add members" },
        { status: 403 }
      );
    }

    const body = await request.json();

    try {
      addMemberSchema.parse(body);
    } catch (validationError) {
      return NextResponse.json(
        { error: "Invalid member data", details: validationError },
        { status: 400 }
      );
    }

    const { name } = body;

    // Generate token and set expiry date (30 days from now)
    const claimToken = randomUUID();
    const tokenExpiry = new Date();
    tokenExpiry.setDate(tokenExpiry.getDate() + 30);

    // Create new member
    const member = await prisma.member.create({
      data: {
        name,
        group: { connect: { id: groupId } },
        claimToken,
        tokenExpiry,
      },
    });

    // In a production app, you would send an email here with the invitation link
    // For now, we'll just return the claim token in the response
    console.log(
      `Invitation link: ${process.env.NEXTAUTH_URL}/claim?token=${claimToken}`
    );

    return NextResponse.json(member);
  } catch (error) {
    console.error("Error adding member:", error);
    return NextResponse.json(
      { error: "Failed to add member" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const groupId = params.id;
    const url = new URL(req.url);
    const sortBy = url.searchParams.get("sort");

    // Verify user belongs to group
    const isMember = await verifyGroupMember(groupId, session.user.id);

    if (!isMember) {
      return NextResponse.json(
        { error: "You don't have access to this group" },
        { status: 403 }
      );
    }

    // Get current month for payment status
    const currentDate = new Date();
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    // First get the group to determine creator
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      select: { creatorId: true },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Get members with payment status
    const members = await prisma.member.findMany({
      where: {
        groupId,
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        userId: true,
        payments: {
          where: {
            scheduledDate: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
          select: { isPaid: true },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Format response with payment status and admin flag
    interface Member {
      id: string;
      name: string;
      createdAt: Date;
      userId: string | null;
      payments: { isPaid: boolean }[];
    }

    interface FormattedMember {
      id: string;
      name: string;
      createdAt: Date;
      userId: string | null;
      isAdmin: boolean;
      isCurrentUser: boolean;
      paymentStatus: {
        isPaid: boolean;
      };
    }

    const formattedMembers = members.map((member: Member) => ({
      id: member.id,
      name: member.name,
      createdAt: member.createdAt,
      userId: member.userId,
      isAdmin: member.userId === group.creatorId,
      isCurrentUser: member.userId === session.user.id,
      paymentStatus: {
        isPaid: member.payments[0]?.isPaid || false,
      },
    }));

    // Apply additional sorting if needed
    if (sortBy === "payment") {
      formattedMembers.sort((a: FormattedMember, b: FormattedMember) => {
        if (a.paymentStatus.isPaid === b.paymentStatus.isPaid) return 0;
        return a.paymentStatus.isPaid ? 1 : -1;
      });
    } else if (sortBy === "admin") {
      // Put admin (creator) at the top
      formattedMembers.sort((a: FormattedMember, b: FormattedMember) => {
        if (a.isAdmin === b.isAdmin) return 0;
        return a.isAdmin ? -1 : 1;
      });
    }

    return NextResponse.json(formattedMembers);
  } catch (error) {
    console.error("[MEMBERS_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    );
  }
}
