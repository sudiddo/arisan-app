import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
  PrismaClientInitializationError,
} from "@prisma/client/runtime/library";
import { decode } from "next-auth/jwt";
import {
  logError,
  formatErrorResponse,
  checkDatabaseHealth,
} from "@/lib/errorMonitor";

type GroupMember = {
  id: string;
  name: string;
  createdAt: Date;
  userId: string | null;
};

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check database health before proceeding
    const isDbHealthy = await checkDatabaseHealth();
    if (!isDbHealthy) {
      return NextResponse.json(
        formatErrorResponse(
          new Error("Database connection unavailable"),
          "Database connection failed",
          503
        ),
        { status: 503 }
      );
    }

    // Log available Prisma models for debugging
    console.log("Prisma client models:", Object.keys(prisma));

    // Check session
    const session = await getServerSession(authOptions);
    console.log("Session present:", !!session);
    console.log("Session user ID:", session?.user?.id);
    console.log("Requested group ID:", params.id);

    if (!session?.user?.id) {
      // Try to validate token directly as fallback
      try {
        const sessionCookie = request.headers
          .get("cookie")
          ?.split(";")
          .find((c) => c.trim().startsWith("next-auth.session-token="));

        const token = sessionCookie?.split("=")[1];
        if (token) {
          const decoded = await decode({
            token,
            secret: process.env.NEXTAUTH_SECRET || "",
          });
          console.log("Direct token decode attempt:", !!decoded);

          if (!decoded?.sub) {
            return NextResponse.json(
              formatErrorResponse(
                new Error("Invalid session"),
                "Unauthorized",
                401
              ),
              { status: 401 }
            );
          }
        }
      } catch (tokenError) {
        logError(tokenError, "auth", {
          operation: "tokenValidation",
          path: request.url,
        });
        return NextResponse.json(
          formatErrorResponse(tokenError, "Unauthorized", 401),
          { status: 401 }
        );
      }
    }

    // At this point, if we still don't have a session, return unauthorized
    if (!session?.user?.id) {
      return NextResponse.json(
        formatErrorResponse(new Error("No valid session"), "Unauthorized", 401),
        { status: 401 }
      );
    }

    const { id } = params;

    // Validate group ID format before querying
    if (!id || typeof id !== "string") {
      return NextResponse.json(
        formatErrorResponse(
          new Error(`Invalid group ID: ${id}`),
          "Invalid group ID format",
          400
        ),
        { status: 400 }
      );
    }

    // Debug log for Prisma query
    console.log(`Executing Prisma query for group: ${id}`);

    const group = await prisma.group.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        monthlyAmount: true,
        description: true,
        rules: true,
        createdAt: true,
        updatedAt: true,
        creatorId: true,
        creator: true,
        members: {
          select: {
            id: true,
            name: true,
            createdAt: true,
            userId: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!group) {
      return NextResponse.json(
        formatErrorResponse(
          new Error(`Group not found: ${id}`),
          "Group not found",
          404
        ),
        { status: 404 }
      );
    }

    // Check if user is authorized to view this group
    const isMember =
      group.creatorId === session.user.id ||
      group.members.some(
        (member: GroupMember) => member.userId === session.user.id
      );

    if (!isMember) {
      return NextResponse.json(
        formatErrorResponse(
          new Error(`User ${session.user.id} not authorized for group ${id}`),
          "You don't have access to this group",
          403
        ),
        { status: 403 }
      );
    }

    // Check if payment model is available
    if (!prisma.payment) {
      console.error("Payment model not available in Prisma client");
      logError(
        new Error("Payment model missing from Prisma client"),
        "database",
        {
          availableModels: Object.keys(prisma).join(","),
          groupId: id,
        }
      );

      // Return group data without payments
      return NextResponse.json({
        ...group,
        payments: [],
      });
    }

    // Fetch payments separately since they're related to both group and members
    let payments = [];
    try {
      payments = await prisma.payment.findMany({
        where: {
          groupId: id,
        },
        select: {
          id: true,
          memberId: true,
          scheduledDate: true,
          isPaid: true,
        },
        orderBy: {
          scheduledDate: "asc",
        },
      });
    } catch (paymentError) {
      console.error("Failed to fetch payments:", paymentError);
      logError(paymentError, "database", {
        operation: "findPayments",
        groupId: id,
      });

      // Continue with empty payments array
      payments = [];
    }

    // Combine group data with payments
    const groupWithPayments = {
      ...group,
      payments,
    };

    return NextResponse.json(groupWithPayments);
  } catch (error) {
    // Enhanced error logging with type checking
    if (error instanceof PrismaClientKnownRequestError) {
      logError(error, "database", {
        code: error.code,
        meta: error.meta,
        groupId: params.id,
      });

      // Specific error handling based on error code
      if (error.code === "P2001" || error.code === "P2025") {
        return NextResponse.json(
          formatErrorResponse(error, "Record not found", 404),
          { status: 404 }
        );
      }

      // Handle schema-database mismatch errors
      if (error.code === "P2022") {
        console.error("Schema-database mismatch detected:", error.message);

        // Try fallback query without the problematic field
        try {
          const fallbackGroup = await prisma.group.findUnique({
            where: { id: params.id },
            select: {
              id: true,
              name: true,
              monthlyAmount: true,
              rules: true,
              createdAt: true,
              updatedAt: true,
              creatorId: true,
              creator: true,
              members: {
                select: {
                  id: true,
                  name: true,
                  createdAt: true,
                  userId: true,
                },
              },
            },
          });

          if (!fallbackGroup) {
            return NextResponse.json(
              formatErrorResponse(
                new Error(`Group not found: ${params.id}`),
                "Group not found",
                404
              ),
              { status: 404 }
            );
          }

          return NextResponse.json(fallbackGroup);
        } catch (fallbackError) {
          // If fallback also fails, log and return 500
          logError(fallbackError, "database", {
            operation: "fallbackQuery",
            groupId: params.id,
          });
        }
      }

      return NextResponse.json(
        formatErrorResponse(error, `Database error: ${error.code}`, 500),
        { status: 500 }
      );
    } else if (error instanceof PrismaClientValidationError) {
      logError(error, "validation", {
        groupId: params.id,
        operation: "findUnique",
      });

      return NextResponse.json(
        formatErrorResponse(error, "Invalid query format", 400),
        { status: 400 }
      );
    } else if (error instanceof PrismaClientInitializationError) {
      logError(error, "database", {
        operation: "initialization",
      });

      return NextResponse.json(
        formatErrorResponse(error, "Database initialization failed", 500),
        { status: 500 }
      );
    } else {
      logError(error, "api", {
        groupId: params.id,
        path: request.url,
      });

      return NextResponse.json(
        formatErrorResponse(error, "Failed to fetch group details", 500),
        { status: 500 }
      );
    }
  }
}
