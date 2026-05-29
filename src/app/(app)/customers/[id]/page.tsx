import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderCard } from "@/components/orders/order-card";
import { createClient } from "@/lib/supabase/server";
import type { Customer, Order } from "@/lib/types";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .eq("user_id", user!.id)
    .single();

  if (!customer) notFound();

  const { data: orders } = await supabase
    .from("orders")
    .select("*, customers ( name )")
    .eq("customer_id", id)
    .order("created_at", { ascending: false });

  const c = customer as Customer;

  return (
    <div className="space-y-6">
      <Link
        href="/customers"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Înapoi la clienți
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>{c.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">Telefon: </span>
            {c.phone ?? "—"}
          </p>
          <p>
            <span className="text-muted-foreground">Email: </span>
            {c.email ?? "—"}
          </p>
          {c.notes && (
            <p>
              <span className="text-muted-foreground">Note: </span>
              {c.notes}
            </p>
          )}
        </CardContent>
      </Card>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Comenzi anterioare</h2>
        {(orders ?? []).length === 0 ? (
          <p className="text-muted-foreground">Nicio comandă pentru acest client.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {(orders as (Order & { customers?: { name: string } | null })[]).map(
              (order) => (
                <OrderCard key={order.id} order={order} />
              )
            )}
          </div>
        )}
      </section>
    </div>
  );
}
