import { prisma } from "../lib/prisma";
import { getMonthlyPaymentStatus } from "../lib/payments";

// Test cases to verify month-specific payment tracking
async function runPaymentTests() {
  console.log("Starting payment testing suite...");

  // Setup: Create a test group and member
  const testGroup = await prisma.group.upsert({
    where: { id: "TEST_GROUP_ID" },
    create: {
      id: "TEST_GROUP_ID",
      name: "Test Payment Group",
      monthlyAmount: 100,
      creatorId: "TEST_CREATOR_ID",
      rules: "Monthly payments required",
    },
    update: {},
  });

  const testMember = await prisma.member.upsert({
    where: { id: "TEST_MEMBER_ID" },
    create: {
      id: "TEST_MEMBER_ID",
      name: "Test Member",
      groupId: testGroup.id,
      claimToken: "test-token",
      tokenExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
    update: {},
  });

  // Test 1: Current month payment
  console.log("\nTest 1: Current month payment");
  const currentDate = new Date();

  // Clear any existing payment records for this month
  await prisma.payment.deleteMany({
    where: {
      memberId: testMember.id,
      scheduledDate: {
        gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
        lt: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
      },
    },
  });

  // Check initial status (should be false)
  const initialStatus = await getMonthlyPaymentStatus(testMember.id);
  console.log("Initial payment status:", initialStatus);

  // Create payment for current month
  await prisma.payment.create({
    data: {
      memberId: testMember.id,
      groupId: testGroup.id,
      scheduledDate: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      ),
      isPaid: true,
    },
  });

  // Verify payment was recorded
  const updatedStatus = await getMonthlyPaymentStatus(testMember.id);
  console.log("Updated payment status:", updatedStatus);
  console.log("Test 1 passed:", updatedStatus.isPaid === true);

  // Test 2: Month isolation - next month should be unpaid
  console.log("\nTest 2: Month isolation");
  const nextMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    1
  );
  const nextMonthStatus = await getMonthlyPaymentStatus(
    testMember.id,
    nextMonth
  );
  console.log("Next month payment status:", nextMonthStatus);
  console.log("Test 2 passed:", nextMonthStatus.isPaid === false);

  // Test 3: Explicit month checking
  console.log("\nTest 3: Explicit month selection");

  // Create payment for next month
  await prisma.payment.create({
    data: {
      memberId: testMember.id,
      groupId: testGroup.id,
      scheduledDate: nextMonth,
      isPaid: true,
    },
  });

  // Verify both months are now paid
  const currentMonthVerify = await getMonthlyPaymentStatus(testMember.id);
  const nextMonthVerify = await getMonthlyPaymentStatus(
    testMember.id,
    nextMonth
  );

  console.log("Current month status:", currentMonthVerify);
  console.log("Next month status:", nextMonthVerify);
  console.log(
    "Test 3 passed:",
    currentMonthVerify.isPaid === true && nextMonthVerify.isPaid === true
  );

  // Test 4: Year boundary
  console.log("\nTest 4: Year boundary test");

  // December of current year
  const december = new Date(currentDate.getFullYear(), 11, 1);
  // January of next year
  const nextJanuary = new Date(currentDate.getFullYear() + 1, 0, 1);

  // Create payment for December
  await prisma.payment.upsert({
    where: {
      memberId_scheduledDate: {
        memberId: testMember.id,
        scheduledDate: december,
      },
    },
    create: {
      memberId: testMember.id,
      groupId: testGroup.id,
      scheduledDate: december,
      isPaid: true,
    },
    update: {
      isPaid: true,
    },
  });

  const decemberStatus = await getMonthlyPaymentStatus(testMember.id, december);
  const januaryStatus = await getMonthlyPaymentStatus(
    testMember.id,
    nextJanuary
  );

  console.log("December status:", decemberStatus);
  console.log("January next year status:", januaryStatus);
  console.log(
    "Test 4 passed:",
    decemberStatus.isPaid === true && januaryStatus.isPaid === false
  );

  console.log("\nAll tests completed.");
}

// Run tests and handle errors
(async () => {
  try {
    await runPaymentTests();
  } catch (error) {
    console.error("Test execution failed:", error);
  } finally {
    await prisma.$disconnect();
  }
})();
