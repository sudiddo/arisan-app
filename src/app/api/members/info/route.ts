import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

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

    if (new Date() > member.tokenExpiry) {
      return NextResponse.json({ error: "Token has expired" }, { status: 400 });
    }

    return NextResponse.json({
      groupName: member.group.name,
      groupId: member.group.id,
      memberName: member.name,
      claimed: member.userId !== null,
    });
  } catch (error) {
    console.error("Error getting member info:", error);
    return NextResponse.json(
      { error: "Failed to get member information" },
      { status: 500 }
    );
  }
}
