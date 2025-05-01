import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be signed in to claim membership" },
        { status: 401 }
      );
    }

    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const member = await db.member.findUnique({
      where: { claimToken: token },
      include: { group: true },
    });

    if (!member) {
      return NextResponse.json({ error: "Invalid token" }, { status: 404 });
    }

    if (member.userId) {
      return NextResponse.json(
        { error: "This membership has already been claimed" },
        { status: 400 }
      );
    }

    if (new Date() > member.tokenExpiry) {
      return NextResponse.json({ error: "Token has expired" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updatedMember = await db.member.update({
      where: { id: member.id },
      data: {
        userId: user.id,
        // Invalidate the token by setting it to expire now
        tokenExpiry: new Date(),
      },
      include: { group: true },
    });

    return NextResponse.json({
      member: updatedMember,
      groupId: member.group.id,
    });
  } catch (error) {
    console.error("Error claiming membership:", error);
    return NextResponse.json(
      { error: "Failed to claim membership" },
      { status: 500 }
    );
  }
}
