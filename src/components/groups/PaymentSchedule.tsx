"use client";

import { useState } from "react";
import { PaymentToggle } from "./PaymentToggle";
import { PaymentBadge } from "./PaymentBadge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AdminBadge } from "./AdminBadge";

type Member = {
  id: string;
  name: string;
  isAdmin?: boolean;
};

type Payment = {
  id: string;
  memberId: string;
  scheduledDate: string;
  isPaid: boolean;
};

type PaymentScheduleProps = {
  members: Member[];
  payments: Payment[];
  isCreator: boolean;
  groupId: string;
  onRecordPayment?: (memberId: string) => void;
};

export function PaymentSchedule({
  members,
  payments = [],
  isCreator,
  groupId,
  onRecordPayment,
}: PaymentScheduleProps) {
  const [currentMonth, setCurrentMonth] = useState<number>(
    new Date().getMonth()
  );
  const currentYear = new Date().getFullYear();

  // Generate months for the schedule (only show next few months)
  const months = Array.from({ length: 3 }, (_, i) => {
    const monthIndex = (currentMonth + i) % 12;
    const year = currentYear + Math.floor((currentMonth + i) / 12);
    return {
      label: new Date(year, monthIndex, 1).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
      date: new Date(year, monthIndex, 1),
      monthOffset: i,
    };
  });

  // Find payments for each member and month
  const getMemberPaymentStatus = (memberId: string, monthIndex: number) => {
    const payment = payments.find((p) => {
      const paymentDate = new Date(p.scheduledDate);
      const monthDiff =
        (paymentDate.getFullYear() - currentYear) * 12 +
        paymentDate.getMonth() -
        currentMonth;
      return p.memberId === memberId && monthDiff === monthIndex;
    });

    return payment?.isPaid || false;
  };

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => (prev - 1 + 12) % 12);
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => (prev + 1) % 12);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Payment Schedule</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {months.map((month, monthIndex) => (
          <div key={monthIndex} className="rounded-md border shadow-sm p-4">
            <div className="mb-3 font-medium text-center">{month.label}</div>
            <div className="space-y-3">
              {members.map((member) => {
                const isPaid = getMemberPaymentStatus(member.id, monthIndex);
                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="truncate">{member.name}</span>
                      {member.isAdmin && <AdminBadge />}
                    </div>
                    {isCreator ? (
                      member.isAdmin ? (
                        <PaymentBadge isPaid={true} />
                      ) : (
                        <PaymentToggle
                          memberId={member.id}
                          groupId={groupId}
                          isPaid={isPaid}
                          month={month.monthOffset}
                          onToggleSuccess={
                            onRecordPayment
                              ? () => onRecordPayment(member.id)
                              : undefined
                          }
                        />
                      )
                    ) : (
                      <PaymentBadge isPaid={isPaid} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
