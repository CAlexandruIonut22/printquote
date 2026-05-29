import Link from "next/link";
import { format, parseISO } from "date-fns";
import { ro } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "./status-badge";
import { formatPrice } from "@/lib/pricing";
import type { Order } from "@/lib/types";

interface OrderCardProps {
  order: Order & { customers?: { name: string } | null };
  compact?: boolean;
}

function formatDeadlineShort(deadline: string | null): string {
  if (!deadline) return "—";
  try {
    const d = /^\d{4}-\d{2}-\d{2}$/.test(deadline)
      ? parseISO(`${deadline}T12:00:00`)
      : new Date(deadline);
    return format(d, "d MMM", { locale: ro });
  } catch {
    return deadline;
  }
}

export function OrderCard({ order, compact }: OrderCardProps) {
  const customerName = order.customers?.name ?? "Fără client";
  const deadline = formatDeadlineShort(order.deadline);
  const material =
    order.material === "Other" || order.material === "Altul" ? "Altul" : order.material;

  return (
    <Link href={`/orders/${order.id}`} className="block active:scale-[0.99]">
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className={compact ? "p-3" : "p-4"}>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium leading-snug">{order.title}</p>
              <p className="truncate text-sm text-muted-foreground">{customerName}</p>
            </div>
            <StatusBadge status={order.status} />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            <span className="font-medium text-foreground tabular-nums">
              {formatPrice(order.final_price)}
            </span>
            <span aria-hidden>·</span>
            <span className="truncate">
              {material ?? "—"} / {order.color ?? "—"}
            </span>
            <span aria-hidden>·</span>
            <span>{order.quantity} buc.</span>
          </div>
          {!compact && (
            <p className="mt-2 text-xs text-muted-foreground">Termen: {deadline}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
