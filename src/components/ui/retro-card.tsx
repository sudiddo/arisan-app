import { cn } from "@/lib/utils";

interface RetroCardProps {
  children: React.ReactNode;
  className?: string;
  withStamp?: boolean;
}

export function RetroCard({
  children,
  className,
  withStamp = false,
}: RetroCardProps) {
  return (
    <div
      className={cn(
        `
        bg-paper border-3 border-ink p-6 
        shadow-retro relative
        before:content-[''] before:absolute before:-left-2 before:top-4 
        before:w-2 before:h-[calc(100%-32px)] before:bg-stamp
        hover:-translate-y-1 transition-transform duration-200
        `,
        className
      )}
    >
      {children}

      {withStamp && (
        <div className="absolute -top-4 -right-4 rotate-12 stamp">
          <div className="bg-stamp text-paper px-3 py-1 text-sm font-bold border-2 border-ink rounded-sm shadow-retro-sm">
            LUNAS
          </div>
        </div>
      )}
    </div>
  );
}
