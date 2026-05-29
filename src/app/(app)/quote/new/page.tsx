import { QuoteForm } from "@/components/quote/quote-form";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export default async function NewQuotePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ofertă nouă</h1>
        <p className="text-muted-foreground">
          Completează detaliile — prețul se calculează automat
        </p>
      </div>
      <QuoteForm profile={(profile as Profile) ?? null} />
    </div>
  );
}
