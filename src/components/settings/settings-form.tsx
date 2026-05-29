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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { getErrorMessage } from "@/lib/errors";
import { toNumber } from "@/lib/pricing";
import type { Profile } from "@/lib/types";

const schema = z.object({
  business_name: z.string().optional(),
  phone: z.string().optional(),
  currency: z.string(),
  default_material_cost_per_kg: z.coerce.number().min(0),
  default_machine_hourly_rate: z.coerce.number().min(0),
  default_electricity_cost_per_hour: z.coerce.number().min(0),
  default_labor_cost: z.coerce.number().min(0),
  default_packaging_cost: z.coerce.number().min(0),
  default_failure_risk_percentage: z.coerce.number().min(0).max(100),
  default_profit_margin_percentage: z.coerce.number().min(0).max(200),
});

type FormValues = z.infer<typeof schema>;

export function SettingsForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      business_name: profile.business_name ?? "",
      phone: profile.phone ?? "",
      currency: profile.currency ?? "RON",
      default_material_cost_per_kg: toNumber(profile.default_material_cost_per_kg, 80),
      default_machine_hourly_rate: toNumber(profile.default_machine_hourly_rate, 5),
      default_electricity_cost_per_hour: toNumber(profile.default_electricity_cost_per_hour, 1),
      default_labor_cost: toNumber(profile.default_labor_cost, 10),
      default_packaging_cost: toNumber(profile.default_packaging_cost, 3),
      default_failure_risk_percentage: toNumber(profile.default_failure_risk_percentage, 10),
      default_profit_margin_percentage: toNumber(profile.default_profit_margin_percentage, 30),
    },
  });

  const currency = watch("currency");

  async function onSubmit(data: FormValues) {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        business_name: data.business_name || null,
        phone: data.phone || null,
        currency: data.currency,
        default_material_cost_per_kg: data.default_material_cost_per_kg,
        default_machine_hourly_rate: data.default_machine_hourly_rate,
        default_electricity_cost_per_hour: data.default_electricity_cost_per_hour,
        default_labor_cost: data.default_labor_cost,
        default_packaging_cost: data.default_packaging_cost,
        default_failure_risk_percentage: data.default_failure_risk_percentage,
        default_profit_margin_percentage: data.default_profit_margin_percentage,
      })
      .eq("id", profile.id);

    setSaving(false);
    if (error) toast.error(getErrorMessage(error));
    else {
      toast.success("Setările au fost salvate");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Date afacere</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="business_name">Nume afacere</Label>
            <Input id="business_name" {...register("business_name")} />
          </div>
          <div>
            <Label htmlFor="phone">Telefon</Label>
            <Input id="phone" {...register("phone")} />
          </div>
          <div>
            <Label>Monedă preferată</Label>
            <Select value={currency} onValueChange={(v) => setValue("currency", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RON">RON (lei)</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Prețuri implicite pentru oferte noi</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Cost material / kg (lei)</Label>
            <Input type="number" step="0.01" {...register("default_material_cost_per_kg")} />
          </div>
          <div>
            <Label>Rată mașină / oră (lei)</Label>
            <Input type="number" step="0.01" {...register("default_machine_hourly_rate")} />
          </div>
          <div>
            <Label>Electricitate / oră (lei)</Label>
            <Input type="number" step="0.01" {...register("default_electricity_cost_per_hour")} />
          </div>
          <div>
            <Label>Manoperă (lei)</Label>
            <Input type="number" step="0.01" {...register("default_labor_cost")} />
          </div>
          <div>
            <Label>Ambalaj (lei)</Label>
            <Input type="number" step="0.01" {...register("default_packaging_cost")} />
          </div>
          <div>
            <Label>Risc eșec (%)</Label>
            <Input type="number" {...register("default_failure_risk_percentage")} />
          </div>
          <div>
            <Label>Marjă profit (%)</Label>
            <Input type="number" {...register("default_profit_margin_percentage")} />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" size="lg" disabled={saving}>
        {saving ? "Se salvează..." : "Salvează setările"}
      </Button>
    </form>
  );
}
