import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { verifyGroupAdmin, verifyGroupMember } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const groupId = params.id;
    const url = new URL(req.url);
    const month = url.searchParams.get("month");
    const year = url.searchParams.get("year");
    const memberId = url.searchParams.get("memberId");

    // Verify user belongs to group
    const isGroupMember = await verifyGroupMember(groupId, session.user.id);

    if (!isGroupMember) {
      return NextResponse.json(
        { error: "You don't have access to this group" },
        { status: 403 }
      );
    }

    // Set up date range for the query
    let startDate: Date;
    let endDate: Date;

    if (month !== null && year !== null) {
      const monthNum = parseInt(month, 10);
      const yearNum = parseInt(year, 10);

      startDate = new Date(yearNum, monthNum, 1);
      endDate = new Date(yearNum, monthNum + 1, 0); // Last day of month
    } else {
      // Default to current month
      const currentDate = new Date();
      startDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      endDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );
    }

    // Build the query
    interface PaymentWhereClause {
      member: {
        groupId: string;
      };
      scheduledDate: {
        gte: Date;
        lte: Date;
      };
      memberId?: string;
    }

    const whereClause: PaymentWhereClause = {
      member: {
        groupId,
      },
      scheduledDate: {
        gte: startDate,
        lte: endDate,
      },
    };

    // Add memberId filter if provided
    if (memberId) {
      whereClause.memberId = memberId;
    }

    // Get payments with member info
    const payments = await prisma.payment.findMany({
      where: whereClause,
      include: {
        member: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        scheduledDate: "asc",
      },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error("[PAYMENTS_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const groupId = params.id;
    const body = await req.json();
    const { memberId } = body;

    // Make date optional - default to current month if not provided
    const date = body.date || new Date().toISOString();

    if (!memberId) {
      return NextResponse.json(
        { error: "Member ID is required" },
        { status: 400 }
      );
    }

    // Verify user is the group creator (admin)
    const isAdmin = await verifyGroupAdmin(groupId, session.user.id);

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Only group admins can record payments" },
        { status: 403 }
      );
    }

    // Get the payment to toggle
    const paymentDate = new Date(date);

    let payment = await prisma.payment.findFirst({
      where: {
        memberId,
        scheduledDate: paymentDate,
      },
    });

    // If no payment record, create one
    if (!payment) {
      payment = await prisma.payment.create({
        data: {
          memberId,
          groupId,
          scheduledDate: paymentDate,
          isPaid: true,
        },
      });
    } else {
      // Toggle the payment status
      payment = await prisma.payment.update({
        where: {
          id: payment.id,
        },
        data: {
          isPaid: !payment.isPaid,
        },
      });
    }

    return NextResponse.json(payment);
  } catch (error) {
    console.error("[PAYMENT_TOGGLE]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
