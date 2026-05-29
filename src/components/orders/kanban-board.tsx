"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, Plus } from "lucide-react";
import { toast } from "sonner";
import { OrderCard } from "./order-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { getErrorMessage } from "@/lib/errors";
import { ORDER_STATUSES, type Order, type OrderStatus } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface KanbanBoardProps {
  orders: (Order & { customers?: { name: string } | null })[];
}

export function KanbanBoard({ orders: initialOrders }: KanbanBoardProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  async function updateStatus(orderId: string, status: OrderStatus) {
    const previous = orders.find((o) => o.id === orderId);
    if (!previous || previous.status === status) return;

    setUpdatingId(orderId);
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));

    const supabase = createClient();
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);

    setUpdatingId(null);

    if (error) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: previous.status } : o))
      );
      toast.error(getErrorMessage(error));
      return;
    }

    toast.success("Status actualizat");
    router.refresh();
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="Nicio comandă încă"
        description="Creează prima ofertă și o vei vedea aici pe tabloul de comenzi."
        actionLabel="Creează ofertă nouă"
        actionHref="/quote/new"
      />
    );
  }

  const visibleStatuses = ORDER_STATUSES.filter((s) => s !== "Anulat");

  return (
    <>
      <div className="space-y-3 md:hidden">
        {orders.map((order) => (
          <div
            key={order.id}
            className={updatingId === order.id ? "opacity-60" : undefined}
          >
            <Select
              value={order.status}
              onValueChange={(v) => updateStatus(order.id, v as OrderStatus)}
              disabled={updatingId === order.id}
            >
              <SelectTrigger className="mb-2 h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ORDER_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <OrderCard order={order} />
          </div>
        ))}
      </div>

      <div className="hidden snap-x snap-mandatory gap-3 overflow-x-auto pb-4 md:flex">
        {visibleStatuses.map((status) => {
          const columnOrders = orders.filter((o) => o.status === status);
          return (
            <div
              key={status}
              className="flex w-[min(100%,17rem)] shrink-0 snap-start flex-col rounded-lg border bg-muted/30 sm:w-64"
            >
              <div className="flex items-center justify-between border-b bg-white px-3 py-2.5">
                <h3 className="text-sm font-semibold">{status}</h3>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {columnOrders.length}
                </span>
              </div>
              <div className="max-h-[calc(100vh-12rem)] min-h-[120px] flex-1 space-y-2 overflow-y-auto p-2">
                {columnOrders.length === 0 ? (
                  <p className="px-2 py-6 text-center text-xs text-muted-foreground">
                    Nicio comandă
                  </p>
                ) : (
                  columnOrders.map((order) => (
                    <div
                      key={order.id}
                      className={updatingId === order.id ? "opacity-60" : undefined}
                    >
                      <OrderCard order={order} compact />
                      <Select
                        value={order.status}
                        onValueChange={(v) => updateStatus(order.id, v as OrderStatus)}
                        disabled={updatingId === order.id}
                      >
                        <SelectTrigger className="mt-1 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ORDER_STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
        <div className="flex w-48 shrink-0 snap-start flex-col items-center justify-center rounded-lg border border-dashed p-4 text-center">
          <p className="text-sm text-muted-foreground">Comenzi anulate?</p>
          <p className="mt-1 text-2xl font-bold">
            {orders.filter((o) => o.status === "Anulat").length}
          </p>
          <Button variant="link" size="sm" asChild className="mt-2">
            <Link href="/quote/new">
              <Plus className="h-3 w-3" />
              Ofertă nouă
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}
