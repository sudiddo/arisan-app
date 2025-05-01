"use client";

import useSWR from "swr";
import { Clock } from "lucide-react";
import { PaymentToggle } from "./PaymentToggle";

type PaymentStatusProps = {
  memberId: string;
  groupId: string;
  isAdmin?: boolean;
  disabled?: boolean;
  month?: number;
  year?: number;
};

export function PaymentStatus({
  memberId,
  groupId,
  isAdmin = false,
  month,
  year,
}: PaymentStatusProps) {
  const fetcher = (url: string) => fetch(url).then((res) => res.json());

  // Build URL with optional month/year query params
  const urlParams = new URLSearchParams();
  if (month !== undefined) urlParams.append("month", month.toString());
  if (year !== undefined) urlParams.append("year", year.toString());

  const queryString = urlParams.toString();
  const apiUrl = `/api/groups/${groupId}/members/${memberId}/payment-status${
    queryString ? `?${queryString}` : ""
  }`;

  const { data: paymentStatus, mutate } = useSWR(apiUrl, fetcher);

  const handleToggleSuccess = () => {
    mutate();
  };

  if (!paymentStatus) {
    return (
      <span className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
        <Clock className="h-3 w-3" />
        Loading
      </span>
    );
  }

  if (isAdmin) {
    return (
      <PaymentToggle
        memberId={memberId}
        groupId={groupId}
        isPaid={paymentStatus.isPaid}
        month={month ?? 0}
        onToggleSuccess={handleToggleSuccess}
      />
    );
  }
}
