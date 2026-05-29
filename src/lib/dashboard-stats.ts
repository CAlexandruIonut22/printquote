import type { Order, OrderStatus } from "./types";

const REVENUE_STATUSES: OrderStatus[] = ["Plătit", "În printare", "Gata", "Livrat"];
const UNPAID_STATUSES: OrderStatus[] = ["Ofertat", "Acceptat"];
const ACTIVE_EXCLUDED: OrderStatus[] = ["Livrat", "Anulat"];

export function isInCurrentMonth(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

export interface DashboardStats {
  activeOrders: number;
  unpaidQuotes: number;
  printing: number;
  revenueMonth: number;
  profitMonth: number;
}

export function computeDashboardStats(orders: Order[]): DashboardStats {
  const activeOrders = orders.filter((o) => !ACTIVE_EXCLUDED.includes(o.status)).length;
  const unpaidQuotes = orders.filter((o) => UNPAID_STATUSES.includes(o.status)).length;
  const printing = orders.filter((o) => o.status === "În printare").length;

  const monthOrders = orders.filter((o) => isInCurrentMonth(o.created_at));
  const revenueOrders = monthOrders.filter((o) => REVENUE_STATUSES.includes(o.status));

  const revenueMonth = revenueOrders.reduce((sum, o) => sum + (o.final_price ?? 0), 0);
  const profitMonth = revenueOrders.reduce((sum, o) => sum + (o.estimated_profit ?? 0), 0);

  return {
    activeOrders,
    unpaidQuotes,
    printing,
    revenueMonth,
    profitMonth,
  };
}
