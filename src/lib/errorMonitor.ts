/**
 * Error monitoring utility for API routes
 * Provides consistent error logging and tracking
 */

type ErrorSource = "api" | "database" | "auth" | "validation" | "unknown";

type ErrorDetails = {
  message: string;
  code?: string | number;
  source: ErrorSource;
  path?: string;
  userId?: string;
  timestamp: string;
  stack?: string;
  context?: Record<string, unknown>;
};

/**
 * Log API errors with structured format
 */
export function logError(
  error: unknown,
  source: ErrorSource = "unknown",
  context: Record<string, unknown> = {}
) {
  const errorDetails: ErrorDetails = {
    message: error instanceof Error ? error.message : String(error),
    source,
    timestamp: new Date().toISOString(),
    context,
  };

  // Extract stack trace if available
  if (error instanceof Error) {
    errorDetails.stack = error.stack;
  }

  // Extract error code if available
  if (error && typeof error === "object" && "code" in error && error.code) {
    errorDetails.code = error.code as string;
  }

  // Log to console for now - could be extended to external error monitoring
  console.error("[ERROR]", JSON.stringify(errorDetails, null, 2));

  return errorDetails;
}

/**
 * Format standard error response
 */
export function formatErrorResponse(
  error: unknown,
  defaultMessage = "An unexpected error occurred",
  statusCode = 500
) {
  // Log the error
  const details = logError(error);

  // Public error message (safe to expose to clients)
  const publicMessage =
    error instanceof Error
      ? process.env.NODE_ENV === "development"
        ? error.message
        : defaultMessage
      : defaultMessage;

  return {
    error: publicMessage,
    errorId: details.timestamp.replace(/[^0-9]/g, ""),
    status: statusCode,
  };
}

/**
 * Check if database connection is healthy
 */
export async function checkDatabaseHealth() {
  try {
    // Import within function to avoid circular dependencies
    const { prisma } = await import("@/lib/prisma");

    // Simple query to test connection
    await prisma.$queryRaw`SELECT 1 as health`;
    return true;
  } catch (error) {
    logError(error, "database", { operation: "healthCheck" });
    return false;
  }
}
