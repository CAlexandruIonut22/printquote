"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, Trash2, Pencil, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { CustomerFormDialog } from "./customer-form-dialog";
import { createClient } from "@/lib/supabase/client";
import { getErrorMessage } from "@/lib/errors";
import type { Customer } from "@/lib/types";

interface CustomersClientProps {
  customers: Customer[];
}

export function CustomersClient({ customers: initial }: CustomersClientProps) {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return initial;
    return initial.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.phone?.toLowerCase().includes(q) ?? false) ||
        (c.email?.toLowerCase().includes(q) ?? false)
    );
  }, [initial, search]);

  async function deleteCustomer(id: string) {
    if (!confirm("Ștergi acest client? Comenzile rămân, dar fără legătură la client.")) {
      return;
    }
    setDeletingId(id);
    const supabase = createClient();
    const { error } = await supabase.from("customers").delete().eq("id", id);
    setDeletingId(null);

    if (error) {
      toast.error(getErrorMessage(error));
    } else {
      toast.success("Client șters");
      router.refresh();
    }
  }

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Caută după nume, telefon sau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Caută clienți"
          />
        </div>
        <Button onClick={() => { setEditing(undefined); setDialogOpen(true); }} className="shrink-0">
          <Plus className="h-4 w-4" />
          Client nou
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={search ? "Niciun rezultat" : "Niciun client încă"}
          description={
            search
              ? "Încearcă alt termen de căutare."
              : "Adaugă clienții cu care lucrezi pe WhatsApp sau social media."
          }
          actionLabel={search ? undefined : "Adaugă client"}
          onAction={search ? undefined : () => setDialogOpen(true)}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <Card key={c.id} className="overflow-hidden">
              <CardContent className="p-4">
                <Link href={`/customers/${c.id}`} className="block hover:text-primary">
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-sm text-muted-foreground">{c.phone ?? "Fără telefon"}</p>
                  {c.email && (
                    <p className="truncate text-sm text-muted-foreground">{c.email}</p>
                  )}
                </Link>
                <div className="mt-3 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditing(c);
                      setDialogOpen(true);
                    }}
                    aria-label={`Editează ${c.name}`}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteCustomer(c.id)}
                    disabled={deletingId === c.id}
                    aria-label={`Șterge ${c.name}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {dialogOpen && (
        <CustomerFormDialog
          customer={editing}
          onClose={() => setDialogOpen(false)}
        />
      )}
    </>
  );
}
