import { notFound } from "next/navigation";
import { QuoteForm } from "@/components/quote/quote-form";
import { createClient } from "@/lib/supabase/server";
import type { Order, Profile } from "@/lib/types";

export default async function EditQuotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: order }, { data: profile }] = await Promise.all([
    supabase
      .from("orders")
      .select("*, customers ( id, name, phone, email )")
      .eq("id", id)
      .eq("user_id", user!.id)
      .single(),
    supabase.from("profiles").select("*").eq("id", user!.id).single(),
  ]);

  if (!order) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Editează oferta</h1>
        <p className="text-muted-foreground">{order.title}</p>
      </div>
      <QuoteForm
        profile={(profile as Profile) ?? null}
        order={order as Order & { customers?: { id: string; name: string; phone: string | null; email: string | null } }}
      />
    </div>
  );
}
