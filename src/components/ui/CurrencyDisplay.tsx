"use client";
import { formatIDR } from "@/lib/formatCurrency";

export function CurrencyDisplay({
  amount,
  className = "",
}: {
  amount: number;
  className?: string;
}) {
  return (
    <span className={`font-mono tracking-tight ${className}`}>
      {formatIDR(amount)}
    </span>
  );
}
