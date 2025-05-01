import { ShieldCheck } from "lucide-react";

export function AdminBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
      <ShieldCheck className="h-3 w-3" />
      Admin
    </span>
  );
}
