"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PaymentToggle } from "./PaymentToggle";

type Member = {
  id: string;
  name: string;
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
  const [currentView, setCurrentView] = useState<"list" | "calendar">("list");

  // Calculate the total months based on number of members
  const totalMonths = members.length;
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Generate months for the schedule
  const months = Array.from({ length: totalMonths }, (_, i) => {
    const monthIndex = (currentMonth + i) % 12;
    const year = currentYear + Math.floor((currentMonth + i) / 12);
    return {
      label: new Date(year, monthIndex, 1).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
      date: new Date(year, monthIndex, 1),
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Payment Schedule</h2>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={currentView === "list" ? "default" : "outline"}
            onClick={() => setCurrentView("list")}
          >
            List
          </Button>
          <Button
            size="sm"
            variant={currentView === "calendar" ? "default" : "outline"}
            onClick={() => setCurrentView("calendar")}
          >
            Calendar
          </Button>
        </div>
      </div>

      {currentView === "list" ? (
        <div className="rounded-md border">
          <div className="grid grid-cols-[3fr_repeat(auto-fill,1fr)] border-b bg-muted/50 px-4 py-3 text-sm font-medium">
            <div>Member</div>
            {months.map((month, i) => (
              <div key={i} className="text-center">
                {month.label}
              </div>
            ))}
          </div>

          <div className="divide-y">
            {members.map((member) => (
              <div
                key={member.id}
                className="grid grid-cols-[3fr_repeat(auto-fill,1fr)] px-4 py-3"
              >
                <div className="font-medium">{member.name}</div>
                {months.map((_, monthIndex) => {
                  const isPaid = getMemberPaymentStatus(member.id, monthIndex);
                  return (
                    <div
                      key={monthIndex}
                      className="flex items-center justify-center"
                    >
                      {isCreator ? (
                        <PaymentToggle
                          memberId={member.id}
                          groupId={groupId}
                          isPaid={isPaid}
                          onToggleSuccess={
                            onRecordPayment
                              ? () => onRecordPayment(member.id)
                              : undefined
                          }
                        />
                      ) : (
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${
                            isPaid
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {isPaid ? "Paid" : "Pending"}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {months.map((month, monthIndex) => (
            <div key={monthIndex} className="rounded-md border p-4">
              <div className="mb-3 font-medium">{month.label}</div>
              <div className="space-y-2">
                {members.map((member) => {
                  const isPaid = getMemberPaymentStatus(member.id, monthIndex);
                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between"
                    >
                      <span>{member.name}</span>
                      {isCreator ? (
                        <PaymentToggle
                          memberId={member.id}
                          groupId={groupId}
                          isPaid={isPaid}
                          onToggleSuccess={
                            onRecordPayment
                              ? () => onRecordPayment(member.id)
                              : undefined
                          }
                        />
                      ) : (
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${
                            isPaid
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {isPaid ? "Paid" : "Pending"}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
