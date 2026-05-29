import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { OrderDetailClient } from "@/components/orders/order-detail-client";
import { createClient } from "@/lib/supabase/server";
import type { Customer, Order } from "@/lib/types";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .eq("user_id", user!.id)
    .single();

  if (!order) notFound();

  let customer: Customer | null = null;
  if (order.customer_id) {
    const { data } = await supabase
      .from("customers")
      .select("*")
      .eq("id", order.customer_id)
      .single();
    customer = data;
  }

  return (
    <div className="space-y-4">
      <Link
        href="/orders"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Înapoi la comenzi
      </Link>
      <OrderDetailClient order={order as Order} customer={customer} />
    </div>
  );
}
