const { PrismaClient } = require("@prisma/client");

async function main() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: "file:../prisma/dev.db",
      },
    },
  });

  try {
    console.log("Starting database cleanup...");

    // Delete in order considering foreign key constraints
    console.log("Deleting ArisanRounds...");
    await prisma.arisanRound.deleteMany();

    console.log("Deleting Payments...");
    await prisma.payment.deleteMany();

    console.log("Deleting Members...");
    await prisma.member.deleteMany();

    console.log("Deleting Groups...");
    await prisma.group.deleteMany();

    console.log("Deleting Sessions...");
    await prisma.session.deleteMany();

    console.log("Deleting VerificationTokens...");
    await prisma.verificationToken.deleteMany();

    console.log("Deleting Accounts...");
    await prisma.account.deleteMany();

    console.log("Deleting Users...");
    await prisma.user.deleteMany();

    console.log("Database cleanup completed successfully!");
  } catch (error) {
    console.error("Error during database cleanup:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
