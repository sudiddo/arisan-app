"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

export type PaymentToggleProps = {
  memberId: string;
  groupId: string;
  isPaid: boolean;
  month: number;
  onToggleSuccess?: () => void;
};

export function PaymentToggle({
  memberId,
  groupId,
  isPaid,
  month,
  onToggleSuccess,
}: PaymentToggleProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(isPaid);

  const togglePayment = async () => {
    setIsLoading(true);
    try {
      // Calculate the date based on month offset
      const currentDate = new Date();
      const paymentDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + month,
        1
      );

      const response = await fetch(`/api/groups/${groupId}/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memberId,
          date: paymentDate.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update payment");
      }

      const data = await response.json();
      setPaymentStatus(data.isPaid);

      if (onToggleSuccess) {
        onToggleSuccess();
      }
    } catch (error) {
      console.error("Error updating payment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">
        <Loader2 className="h-3 w-3 animate-spin text-gray-500" />
      </div>
    );
  }

  return paymentStatus ? (
    <button
      onClick={togglePayment}
      className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 transition-colors hover:bg-green-200"
      aria-label="Mark as unpaid"
    >
      <span>Paid</span>
    </button>
  ) : (
    <button
      onClick={togglePayment}
      className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 transition-colors hover:bg-amber-200"
      aria-label="Mark as paid"
    >
      <span>Pending</span>
    </button>
  );
}
