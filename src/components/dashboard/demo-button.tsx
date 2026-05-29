"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Database } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { seedDemoData } from "@/lib/demo-data";
import { getErrorMessage } from "@/lib/errors";

export function DashboardDemoButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLoadDemo() {
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Nu ești autentificat");
      setLoading(false);
      return;
    }

    const { error } = await seedDemoData(supabase, user.id);
    setLoading(false);

    if (error) {
      toast.error(getErrorMessage(error));
      return;
    }

    toast.success("Date demo încărcate — explorează comenzile!");
    router.refresh();
  }

  return (
    <Button
      variant="outline"
      onClick={handleLoadDemo}
      disabled={loading}
      className="w-full sm:w-auto"
    >
      <Database className="h-4 w-4" />
      {loading ? "Se încarcă..." : "Încarcă date demo"}
    </Button>
  );
}
