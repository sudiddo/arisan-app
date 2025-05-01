import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { checkDatabaseHealth } from "@/lib/errorMonitor";
import { prisma } from "@/lib/prisma";

// Define types for the diagnostic info
type DatabaseInfo = {
  healthy: boolean;
  connectionStatus: string;
  stats?: {
    users?: number;
    groups?: number;
    error?: string;
  };
  error?: string;
};

type AuthInfo = {
  nextAuthSecret: boolean;
  session: Record<string, unknown> | null;
  sessionError?: string;
};

type DiagnosticInfo = {
  timestamp: string;
  system: {
    environment: string | undefined;
    nodeVersion: string;
    uptime: number;
    memoryUsage: NodeJS.MemoryUsage;
  };
  request: {
    headers: Record<string, string>;
    url: string;
  };
  database: DatabaseInfo;
  auth: AuthInfo;
};

/**
 * Diagnostic endpoint to check system health
 * Only accessible in development or by authenticated admin users
 */
export async function GET(request: Request) {
  // Ensure only accessible in development or by admins
  if (process.env.NODE_ENV !== "development") {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin (implement your admin check here)
    const isAdmin = false; // Replace with actual admin check
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  // Collect diagnostic information
  const diagnosticInfo: DiagnosticInfo = {
    timestamp: new Date().toISOString(),
    system: {
      environment: process.env.NODE_ENV,
      nodeVersion: process.version,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
    },
    request: {
      headers: Object.fromEntries(request.headers.entries()),
      url: request.url,
    },
    database: {
      healthy: false,
      connectionStatus: "unknown",
    },
    auth: {
      nextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      session: null,
    },
  };

  // Check database connection
  try {
    diagnosticInfo.database.healthy = await checkDatabaseHealth();
    diagnosticInfo.database.connectionStatus = diagnosticInfo.database.healthy
      ? "connected"
      : "disconnected";

    // Check basic database stats if connected
    if (diagnosticInfo.database.healthy) {
      try {
        const userCount = await prisma.user.count();
        const groupCount = await prisma.group.count();
        diagnosticInfo.database.stats = {
          users: userCount,
          groups: groupCount,
        };
      } catch {
        diagnosticInfo.database.stats = {
          error: "Failed to fetch database stats",
        };
      }
    }
  } catch (dbError) {
    diagnosticInfo.database.connectionStatus = "error";
    diagnosticInfo.database.error =
      dbError instanceof Error ? dbError.message : "Unknown error";
  }

  // Get session information if available
  try {
    const session = await getServerSession(authOptions);
    if (session) {
      diagnosticInfo.auth.session = {
        userId: session.user?.id,
        hasUser: !!session.user,
        expires: session.expires,
      };
    }
  } catch (sessionError) {
    diagnosticInfo.auth.sessionError =
      sessionError instanceof Error
        ? sessionError.message
        : "Failed to get session";
  }

  return NextResponse.json(diagnosticInfo);
}
