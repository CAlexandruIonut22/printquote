import Link from "next/link";
import { Plus, Package, FileText, Printer, TrendingUp, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderCard } from "@/components/orders/order-card";
import { DashboardDemoButton } from "@/components/dashboard/demo-button";
import { EmptyState } from "@/components/ui/empty-state";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/pricing";
import { computeDashboardStats } from "@/lib/dashboard-stats";
import type { Order } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: orders, error } = await supabase
    .from("orders")
    .select("*, customers ( name )")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Dashboard orders error:", error.message);
  }

  const list = (orders ?? []) as (Order & { customers?: { name: string } | null })[];
  const stats = computeDashboardStats(list);
  const recent = list.slice(0, 5);

  const statCards = [
    {
      label: "Comenzi active",
      hint: "Exclude livrate și anulate",
      value: String(stats.activeOrders),
      icon: Package,
    },
    {
      label: "Oferte în așteptare",
      hint: "Status Ofertat sau Acceptat",
      value: String(stats.unpaidQuotes),
      icon: FileText,
    },
    {
      label: "În printare acum",
      hint: "Comenzi cu status În printare",
      value: String(stats.printing),
      icon: Printer,
    },
    {
      label: "Venituri luna aceasta",
      hint: "Comenzi plătite / finalizate create luna aceasta",
      value: formatPrice(stats.revenueMonth),
      icon: Wallet,
    },
    {
      label: "Profit estimat",
      hint: "Din comenzile cu venit recunoscut luna aceasta",
      value: formatPrice(stats.profitMonth),
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Panou de control</h1>
          <p className="text-muted-foreground">Privire de ansamblu asupra atelierului tău</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <DashboardDemoButton />
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/quote/new">
              <Plus className="h-4 w-4" />
              Creează ofertă nouă
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-5 xl:gap-4">
        {statCards.map(({ label, hint, value, icon: Icon }) => (
          <Card key={label} className="col-span-1">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 pt-4">
              <CardTitle className="text-xs font-medium leading-snug text-muted-foreground sm:text-sm">
                {label}
              </CardTitle>
              <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            </CardHeader>
            <CardContent className="pb-4">
              <p className="text-xl font-bold tabular-nums sm:text-2xl">{value}</p>
              <p className="mt-1 hidden text-xs text-muted-foreground xl:block">{hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Comenzi recente</h2>
          {list.length > 0 && (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/orders">Vezi toate</Link>
            </Button>
          )}
        </div>
        {recent.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Nicio comandă încă"
            description="Creează prima ofertă pentru un client — o vei gestiona de aici."
            actionLabel="Creează ofertă nouă"
            actionHref="/quote/new"
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
