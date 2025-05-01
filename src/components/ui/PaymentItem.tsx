import { cn } from "@/lib/utils";
import { PaperCard } from "./PaperCard";
import { CurrencyDisplay } from "./CurrencyDisplay";

type Payment = {
  member: {
    name: string;
  };
  amount: number;
  scheduledDate: string;
  isPaid: boolean;
};

export function PaymentItem({ payment }: { payment: Payment }) {
  return (
    <PaperCard className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 bg-amber-100 border-2 border-gray-800 flex items-center justify-center">
          💸
        </div>
        <div>
          <p className="font-bold">{payment.member.name}</p>
          <p className="text-sm">
            {new Date(payment.scheduledDate).toLocaleDateString("id-ID")}
          </p>
        </div>
      </div>
      <div className="text-right">
        <CurrencyDisplay
          amount={payment.amount}
          className="text-lg font-bold"
        />
        <p
          className={cn(
            "text-xs mt-1 px-2 py-0.5 inline-block rounded-sm",
            payment.isPaid
              ? "bg-green-100 text-green-900"
              : "bg-yellow-100 text-yellow-900"
          )}
        >
          {payment.isPaid ? "Lunas" : "Menunggu"}
        </p>
      </div>
    </PaperCard>
  );
}
