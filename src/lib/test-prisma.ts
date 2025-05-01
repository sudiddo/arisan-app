import { prisma } from "@/lib/prisma";

async function testConnection() {
  try {
    await prisma.$connect();
    console.log("✅ Prisma connected successfully");
    const users = await prisma.user.findMany();
    console.log("Users:", users);
  } catch (error) {
    console.error("❌ Prisma connection error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
