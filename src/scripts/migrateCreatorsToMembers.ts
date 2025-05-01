import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

async function migrate() {
  console.log("Starting migration to add creators as members...");

  // Get all groups
  const groups = await prisma.group.findMany({
    include: {
      members: {
        select: { userId: true },
      },
      creator: {
        select: { id: true, name: true },
      },
    },
  });

  console.log(`Found ${groups.length} groups to check`);
  let migratedCount = 0;

  for (const group of groups) {
    // Check if creator is already a member
    const creatorIsMember = group.members.some(
      (m: { userId: string | null }) => m.userId === group.creator.id
    );

    if (!creatorIsMember) {
      console.log(`Adding creator as member for group: ${group.id}`);

      // Generate token and set expiry date (30 days from now)
      const claimToken = randomUUID();
      const tokenExpiry = new Date();
      tokenExpiry.setDate(tokenExpiry.getDate() + 30);

      // Add creator as member
      await prisma.member.create({
        data: {
          name: group.creator.name || "Group Creator",
          userId: group.creator.id,
          groupId: group.id,
          claimToken,
          tokenExpiry,
          createdAt: group.createdAt, // Same creation date as the group
        },
      });

      migratedCount++;
    }
  }

  console.log(
    `Migration complete. Added creators as members for ${migratedCount} groups.`
  );
}

migrate()
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
