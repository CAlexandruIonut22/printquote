import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const statusStyles: Record<OrderStatus, string> = {
  Nou: "bg-slate-100 text-slate-700",
  Ofertat: "bg-blue-100 text-blue-800",
  Acceptat: "bg-indigo-100 text-indigo-800",
  Plătit: "bg-violet-100 text-violet-800",
  "În printare": "bg-amber-100 text-amber-800",
  Gata: "bg-emerald-100 text-emerald-800",
  Livrat: "bg-green-100 text-green-900",
  Anulat: "bg-red-100 text-red-800",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge variant="outline" className={cn("border-0 font-medium", statusStyles[status])}>
      {status}
    </Badge>
  );
}
