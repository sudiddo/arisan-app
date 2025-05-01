import { prisma } from "../lib/prisma";

async function verifyPaymentIsolation() {
  console.log("Starting payment isolation verification...");

  const testMemberId = "MEM_TEST_123";
  const testGroupId = "GROUP_TEST";
  const today = new Date();

  // Mark current month as paid
  const currentMonthDate = new Date(today.getFullYear(), today.getMonth(), 1);
  currentMonthDate.setHours(0, 0, 0, 0);

  console.log(
    `Setting current month (${currentMonthDate.toISOString()}) to paid`
  );

  await prisma.payment.upsert({
    where: {
      memberId_scheduledDate: {
        memberId: testMemberId,
        scheduledDate: currentMonthDate,
      },
    },
    create: {
      memberId: testMemberId,
      groupId: testGroupId,
      scheduledDate: currentMonthDate,
      isPaid: true,
    },
    update: { isPaid: true },
  });

  // Check next month should be unpaid
  const nextMonthDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  nextMonthDate.setHours(0, 0, 0, 0);

  console.log(
    `Checking next month (${nextMonthDate.toISOString()}) payment status`
  );

  const nextMonthPayment = await prisma.payment.findUnique({
    where: {
      memberId_scheduledDate: {
        memberId: testMemberId,
        scheduledDate: nextMonthDate,
      },
    },
  });

  // Check previous month
  const prevMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  prevMonthDate.setHours(0, 0, 0, 0);

  console.log(
    `Checking previous month (${prevMonthDate.toISOString()}) payment status`
  );

  const prevMonthPayment = await prisma.payment.findUnique({
    where: {
      memberId_scheduledDate: {
        memberId: testMemberId,
        scheduledDate: prevMonthDate,
      },
    },
  });

  console.log("Verification results:", {
    currentMonthPaid: true,
    nextMonthPaid: !!nextMonthPayment?.isPaid,
    prevMonthPaid: !!prevMonthPayment?.isPaid,
  });

  // Cross year boundary check (December to January)
  const decemberDate = new Date(today.getFullYear(), 11, 1); // December
  const januaryNextYearDate = new Date(today.getFullYear() + 1, 0, 1); // January next year

  await prisma.payment.upsert({
    where: {
      memberId_scheduledDate: {
        memberId: testMemberId,
        scheduledDate: decemberDate,
      },
    },
    create: {
      memberId: testMemberId,
      groupId: testGroupId,
      scheduledDate: decemberDate,
      isPaid: true,
    },
    update: { isPaid: true },
  });

  const januaryPayment = await prisma.payment.findUnique({
    where: {
      memberId_scheduledDate: {
        memberId: testMemberId,
        scheduledDate: januaryNextYearDate,
      },
    },
  });

  console.log("Year boundary verification:", {
    decemberPaid: true,
    januaryNextYearPaid: !!januaryPayment?.isPaid,
  });

  console.log("Payment isolation verification complete.");
}

// Self-executing function to run the verification
(async () => {
  try {
    await verifyPaymentIsolation();
  } catch (error) {
    console.error("Verification failed:", error);
  } finally {
    await prisma.$disconnect();
  }
})();
