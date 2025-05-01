import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Verify database schema against Prisma models
async function verifyDatabaseSchema(client: PrismaClient) {
  try {
    // Test basic queries to detect schema mismatch
    await client.$queryRaw`SELECT 1`;

    // Verify Group model matches database schema
    try {
      await client.group.findFirst({
        select: {
          id: true,
          name: true,
          description: true,
        },
        take: 1,
      });
      console.log("Group schema verification: OK");
    } catch (e: unknown) {
      const prismaError = e as { code?: string; message?: string };
      if (prismaError.code === "P2022") {
        console.error(
          "Schema mismatch detected in Group model:",
          prismaError.message
        );
        console.error(
          "Run 'npx prisma migrate dev' to sync database with schema"
        );
      } else {
        throw e;
      }
    }
  } catch (e) {
    console.error("Database schema verification failed:", e);
  }
}

// Initialize PrismaClient with logging for errors
const createPrismaClient = () => {
  const client = new PrismaClient({
    log: [
      { level: "query", emit: "event" },
      { level: "error", emit: "stdout" },
      { level: "warn", emit: "stdout" },
    ],
  });

  // Log any errors during schema loading
  try {
    // Verify that key models are accessible
    if (!client.payment) {
      console.error("WARNING: Payment model not available in Prisma client");
    }
    if (!client.group) {
      console.error("WARNING: Group model not available in Prisma client");
    }
    if (!client.member) {
      console.error("WARNING: Member model not available in Prisma client");
    }
  } catch (e) {
    console.error("Error validating Prisma client models:", e);
  }

  // Verify database schema in non-production environments
  if (process.env.NODE_ENV !== "production") {
    verifyDatabaseSchema(client).catch((e) => {
      console.error("Schema verification failed:", e);
    });
  }

  return client;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Add default export for compatibility
export default prisma;
