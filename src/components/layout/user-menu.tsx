"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { getMessages } from "@/locales";
import { toast } from "sonner";

const t = getMessages();

export function UserMenu() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Te-ai deconectat");
    router.push("/");
    router.refresh();
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      className="gap-1.5 px-2 sm:px-3"
    >
      <LogOut className="h-4 w-4" />
      <span className="hidden sm:inline">{t.nav.logout}</span>
    </Button>
  );
}
