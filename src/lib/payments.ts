import { prisma } from "./prisma";

export async function getMonthlyPaymentStatus(memberId: string, date?: Date) {
  const targetDate = date || new Date();
  const monthStart = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    1
  );
  monthStart.setHours(0, 0, 0, 0);

  const payment = await prisma.payment.findUnique({
    where: {
      memberId_scheduledDate: {
        memberId,
        scheduledDate: monthStart,
      },
    },
  });

  return { isPaid: payment?.isPaid || false };
}
