import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { addMemberSchema } from "@/lib/schemas/group";
import { randomUUID } from "crypto";

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
      select: { creatorId: true },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    if (group.creatorId !== session.user.id) {
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

    const { name, email } = body;

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

    return NextResponse.json({
      id: member.id,
      name: member.name,
      claimToken,
      tokenExpiry,
    });
  } catch (error) {
    console.error("Error adding member:", error);
    return NextResponse.json(
      { error: "Failed to add member" },
      { status: 500 }
    );
  }
}
