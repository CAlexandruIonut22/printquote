import { SettingsForm } from "@/components/settings/settings-form";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  if (!profile) {
    await supabase.from("profiles").insert({ id: user!.id });
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user!.id)
      .single();
    profile = data;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Setări</h1>
        <p className="text-muted-foreground">
          Valorile implicite se aplică la oferte noi
        </p>
      </div>
      <SettingsForm profile={profile as Profile} />
    </div>
  );
}
