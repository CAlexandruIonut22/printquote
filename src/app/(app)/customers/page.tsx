import { CustomersClient } from "@/components/customers/customers-client";
import { createClient } from "@/lib/supabase/server";
import type { Customer } from "@/lib/types";

export default async function CustomersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: customers } = await supabase
    .from("customers")
    .select("*")
    .eq("user_id", user!.id)
    .order("name");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Clienți</h1>
        <p className="text-muted-foreground">Baza ta de clienți și istoric comenzi</p>
      </div>
      <CustomersClient customers={(customers ?? []) as Customer[]} />
    </div>
  );
}
