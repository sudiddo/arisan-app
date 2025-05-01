"use client";

import { useState } from "react";
import useSWR from "swr";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { Check, Clock } from "lucide-react";

import "react-day-picker/dist/style.css";

type PaymentCalendarProps = {
  groupId: string;
};

type Payment = {
  id: string;
  memberId: string;
  scheduledDate: string;
  isPaid: boolean;
  member: {
    id: string;
    name: string;
  };
};

export function PaymentCalendar({ groupId }: PaymentCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const fetcher = (url: string) => fetch(url).then((res) => res.json());

  const { data: payments, isLoading } = useSWR<Payment[]>(
    date
      ? `/api/groups/${groupId}/payments?month=${date.getMonth()}&year=${date.getFullYear()}`
      : null,
    fetcher
  );

  // Get payments for selected date
  const selectedDatePayments = payments?.filter((payment) => {
    const paymentDate = new Date(payment.scheduledDate);
    return (
      date &&
      paymentDate.getDate() === date.getDate() &&
      paymentDate.getMonth() === date.getMonth() &&
      paymentDate.getFullYear() === date.getFullYear()
    );
  });

  // Create days with payment info for calendar
  const daysWithPayments = payments?.reduce<Record<string, Payment[]>>(
    (acc, payment) => {
      const dateStr = new Date(payment.scheduledDate).toDateString();
      if (!acc[dateStr]) {
        acc[dateStr] = [];
      }
      acc[dateStr].push(payment);
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Payment Calendar</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-md border p-3">
          <DayPicker
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rdp"
            classNames={{
              day_today: "bg-muted text-muted-foreground font-medium",
              day_selected: "bg-primary text-primary-foreground",
            }}
            modifiers={{
              payment: (day: Date) => {
                const dateStr = day.toDateString();
                return Boolean(daysWithPayments?.[dateStr]);
              },
              paid: (day: Date) => {
                const dateStr = day.toDateString();
                const payments = daysWithPayments?.[dateStr] || [];
                return payments.some((p) => p.isPaid);
              },
            }}
            modifiersClassNames={{
              payment: "!bg-gray-100 font-medium",
              paid: "!bg-green-100 font-medium",
            }}
          />
        </div>

        <div className="space-y-3 rounded-md border p-4">
          <h4 className="font-medium">
            {date ? format(date, "EEEE, MMMM d, yyyy") : "Select a date"}
          </h4>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex animate-pulse items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-muted"></div>
                  <div className="h-5 w-32 rounded bg-muted"></div>
                </div>
              ))}
            </div>
          ) : !selectedDatePayments?.length ? (
            <div className="text-center text-muted-foreground py-8">
              No payments scheduled for this date
            </div>
          ) : (
            <div className="space-y-2">
              {selectedDatePayments.map((payment) => (
                <div key={payment.id} className="flex items-center gap-2">
                  {payment.isPaid ? (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                      <Check className="h-3 w-3 text-green-800" />
                    </span>
                  ) : (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100">
                      <Clock className="h-3 w-3 text-amber-800" />
                    </span>
                  )}
                  <span className="font-medium">{payment.member.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
