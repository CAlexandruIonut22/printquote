"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { getErrorMessage } from "@/lib/errors";
import type { Customer } from "@/lib/types";

const schema = z.object({
  name: z.string().min(1, "Numele este obligatoriu"),
  phone: z.string().optional(),
  email: z
    .string()
    .optional()
    .refine((v) => !v || z.string().email().safeParse(v).success, {
      message: "Email invalid",
    }),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface CustomerFormDialogProps {
  customer?: Customer;
  onClose: () => void;
}

export function CustomerFormDialog({ customer, onClose }: CustomerFormDialogProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const isEdit = !!customer;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: customer?.name ?? "",
      phone: customer?.phone ?? "",
      email: customer?.email ?? "",
      notes: customer?.notes ?? "",
    },
  });

  async function onSubmit(data: FormValues) {
    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Nu ești autentificat");
      setSaving(false);
      return;
    }

    const payload = {
      name: data.name.trim(),
      phone: data.phone?.trim() || null,
      email: data.email?.trim() || null,
      notes: data.notes?.trim() || null,
    };

    if (isEdit && customer) {
      const { error } = await supabase
        .from("customers")
        .update(payload)
        .eq("id", customer.id)
        .eq("user_id", user.id);

      if (error) toast.error(getErrorMessage(error));
      else {
        toast.success("Client actualizat");
        onClose();
        router.refresh();
      }
    } else {
      const { error } = await supabase.from("customers").insert({
        ...payload,
        user_id: user.id,
      });

      if (error) toast.error(getErrorMessage(error));
      else {
        toast.success("Client adăugat");
        onClose();
        router.refresh();
      }
    }
    setSaving(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-xl bg-white p-6 shadow-xl sm:max-w-md sm:rounded-xl">
        <h2 className="text-lg font-semibold">
          {isEdit ? "Editează clientul" : "Client nou"}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div>
            <Label htmlFor="name">Nume *</Label>
            <Input id="name" autoFocus {...register("name")} />
            {errors.name && (
              <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="phone">Telefon</Label>
            <Input id="phone" type="tel" placeholder="07xx xxx xxx" {...register("phone")} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && (
              <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="notes">Note</Label>
            <Textarea id="notes" {...register("notes")} rows={2} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Anulează
            </Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? "Se salvează..." : "Salvează"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
