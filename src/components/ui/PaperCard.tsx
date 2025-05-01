import { cn } from "@/lib/utils";

export function PaperCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-[hsl(45,30%,95%)] border-2 border-gray-800",
        "shadow-[6px_6px_0_hsl(0,0%,20%)] p-6",
        "bg-[length:200px_200px] bg-center",
        className
      )}
    >
      {children}
    </div>
  );
}
