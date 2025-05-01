"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type PaymentToggleProps = {
  memberId: string;
  groupId: string;
  isPaid: boolean;
  onToggleSuccess?: () => void;
};

export function PaymentToggle({
  memberId,
  groupId,
  isPaid,
  onToggleSuccess,
}: PaymentToggleProps) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    console.log("Sending payment toggle request:", { memberId, groupId });

    try {
      const response = await fetch(`/api/groups/${groupId}/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ memberId }),
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to update payment");
      }

      if (onToggleSuccess) {
        onToggleSuccess();
      }
    } catch (error) {
      console.error("Failed to toggle payment:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={isPaid ? "default" : "outline"}
      onClick={handleToggle}
      disabled={loading}
      size="sm"
    >
      {isPaid ? "✓ Paid" : "Mark Paid"}
    </Button>
  );
}
