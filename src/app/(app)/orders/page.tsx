import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KanbanBoard } from "@/components/orders/kanban-board";
import { createClient } from "@/lib/supabase/server";
import type { Order } from "@/lib/types";

export default async function OrdersPage() {
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
    console.error("Orders fetch error:", error.message);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Comenzi</h1>
          <p className="text-muted-foreground">
            Urmărește statusul — pe mobil schimbi statusul din lista de mai jos
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/quote/new">
            <Plus className="h-4 w-4" />
            Ofertă nouă
          </Link>
        </Button>
      </div>

      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          Nu am putut încărca comenzile. Reîncarcă pagina.
        </p>
      )}

      <KanbanBoard orders={(orders ?? []) as (Order & { customers?: { name: string } | null })[]} />
    </div>
  );
}
