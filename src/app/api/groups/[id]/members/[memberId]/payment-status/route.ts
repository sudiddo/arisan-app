import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { verifyGroupMember } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { id: string; memberId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: groupId, memberId } = params;
    const url = new URL(req.url);
    const monthParam = url.searchParams.get("month");
    const yearParam = url.searchParams.get("year");

    // Verify user belongs to group
    const isMember = await verifyGroupMember(groupId, session.user.id);

    if (!isMember) {
      return NextResponse.json(
        { error: "You don't have access to this group" },
        { status: 403 }
      );
    }

    // Get date range for payment status
    const currentDate = new Date();
    let month = currentDate.getMonth();
    let year = currentDate.getFullYear();

    // Use provided month/year if available
    if (monthParam !== null) {
      month = parseInt(monthParam, 10);
    }

    if (yearParam !== null) {
      year = parseInt(yearParam, 10);
    }

    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);

    // Find payment for this member in specified month
    const payment = await prisma.payment.findFirst({
      where: {
        memberId,
        scheduledDate: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      select: {
        id: true,
        isPaid: true,
        scheduledDate: true,
      },
    });

    return NextResponse.json({
      isPaid: payment?.isPaid || false,
      scheduledDate: payment?.scheduledDate || startOfMonth,
      paymentId: payment?.id,
    });
  } catch (error) {
    console.error("[MEMBER_PAYMENT_STATUS_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
