type PaymentBadgeProps = {
  isPaid: boolean;
  className?: string;
};

export function PaymentBadge({ isPaid, className = "" }: PaymentBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isPaid ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
      } ${className}`}
    >
      {isPaid ? "Paid" : "Pending"}
    </span>
  );
}
