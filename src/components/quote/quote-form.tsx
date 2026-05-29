"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PriceBreakdown } from "./price-breakdown";
import { createClient } from "@/lib/supabase/client";
import { calculatePricing, toNumber } from "@/lib/pricing";
import { getErrorMessage } from "@/lib/errors";
import { MATERIALS, ORDER_STATUSES, type Order, type Profile } from "@/lib/types";

const schema = z.object({
  customerName: z.string().min(1, "Numele clientului este obligatoriu"),
  customerPhone: z.string().optional(),
  customerEmail: z
    .string()
    .optional()
    .refine((v) => !v || z.string().email().safeParse(v).success, {
      message: "Email invalid",
    }),
  title: z.string().min(1, "Titlul este obligatoriu"),
  description: z.string().optional(),
  fileName: z.string().optional(),
  material: z.string().min(1, "Selectează materialul"),
  color: z.string().min(1, "Culoarea este obligatorie"),
  quantity: z.coerce.number().min(1, "Minim 1 bucată"),
  estimatedPrintHours: z.coerce.number().min(0.1, "Minim 0,1 ore"),
  estimatedMaterialGrams: z.coerce.number().min(1, "Minim 1 gram"),
  deadline: z.string().optional(),
  notes: z.string().optional(),
  materialCostPerKg: z.coerce.number().min(0),
  machineHourlyRate: z.coerce.number().min(0),
  electricityCostPerHour: z.coerce.number().min(0),
  laborCost: z.coerce.number().min(0),
  packagingCost: z.coerce.number().min(0),
  failureRiskPercentage: z.coerce.number().min(0).max(100),
  profitMarginPercentage: z.coerce.number().min(0).max(200),
  status: z.string().optional(),
  customerId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface QuoteFormProps {
  profile: Profile | null;
  order?: Order & {
    customers?: { id: string; name: string; phone: string | null; email: string | null } | null;
  };
}

function buildDefaults(
  order: QuoteFormProps["order"],
  profile: Profile | null
): FormValues {
  return {
    customerName: order?.customers?.name ?? "",
    customerPhone: order?.customers?.phone ?? "",
    customerEmail: order?.customers?.email ?? "",
    title: order?.title ?? "",
    description: order?.description ?? "",
    fileName: order?.file_name ?? "",
    material: order?.material ?? "PLA",
    color: order?.color ?? "",
    quantity: order?.quantity ?? 1,
    estimatedPrintHours: order?.estimated_print_hours ?? 2,
    estimatedMaterialGrams: order?.estimated_material_grams ?? 50,
    deadline: order?.deadline ?? "",
    notes: order?.notes ?? "",
    materialCostPerKg: toNumber(
      order?.material_cost_per_kg ?? profile?.default_material_cost_per_kg,
      80
    ),
    machineHourlyRate: toNumber(
      order?.machine_hourly_rate ?? profile?.default_machine_hourly_rate,
      5
    ),
    electricityCostPerHour: toNumber(
      order?.electricity_cost_per_hour ?? profile?.default_electricity_cost_per_hour,
      1
    ),
    laborCost: toNumber(order?.labor_cost ?? profile?.default_labor_cost, 10),
    packagingCost: toNumber(order?.packaging_cost ?? profile?.default_packaging_cost, 3),
    failureRiskPercentage: toNumber(
      order?.failure_risk_percentage ?? profile?.default_failure_risk_percentage,
      10
    ),
    profitMarginPercentage: toNumber(
      order?.profit_margin_percentage ?? profile?.default_profit_margin_percentage,
      30
    ),
    status: order?.status ?? "Nou",
    customerId: order?.customer_id ?? "",
  };
}

export function QuoteForm({ profile, order }: QuoteFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const isEdit = !!order;
  const formKey = order?.id ?? "new";

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: buildDefaults(order, profile),
  });

  const pricingWatch = useWatch({
    control,
    name: [
      "materialCostPerKg",
      "machineHourlyRate",
      "electricityCostPerHour",
      "laborCost",
      "packagingCost",
      "failureRiskPercentage",
      "profitMarginPercentage",
      "estimatedPrintHours",
      "estimatedMaterialGrams",
      "quantity",
    ],
  });

  const material = useWatch({ control, name: "material" });
  const status = useWatch({ control, name: "status" });

  const breakdown = useMemo(() => {
    const [
      materialCostPerKg,
      machineHourlyRate,
      electricityCostPerHour,
      laborCost,
      packagingCost,
      failureRiskPercentage,
      profitMarginPercentage,
      estimatedPrintHours,
      estimatedMaterialGrams,
      quantity,
    ] = pricingWatch;

    return calculatePricing({
      materialCostPerKg: Number(materialCostPerKg) || 0,
      machineHourlyRate: Number(machineHourlyRate) || 0,
      electricityCostPerHour: Number(electricityCostPerHour) || 0,
      laborCost: Number(laborCost) || 0,
      packagingCost: Number(packagingCost) || 0,
      failureRiskPercentage: Number(failureRiskPercentage) || 0,
      profitMarginPercentage: Number(profitMarginPercentage) || 0,
      estimatedPrintHours: Number(estimatedPrintHours) || 0,
      estimatedMaterialGrams: Number(estimatedMaterialGrams) || 0,
      quantity: Number(quantity) || 1,
    });
  }, [pricingWatch]);

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

    let customerId = data.customerId || order?.customer_id || null;

    if (!customerId) {
      const { data: newCustomer, error: custErr } = await supabase
        .from("customers")
        .insert({
          user_id: user.id,
          name: data.customerName.trim(),
          phone: data.customerPhone?.trim() || null,
          email: data.customerEmail?.trim() || null,
        })
        .select("id")
        .single();

      if (custErr) {
        toast.error(getErrorMessage(custErr));
        setSaving(false);
        return;
      }
      customerId = newCustomer.id;
    } else {
      const { error: updateCustErr } = await supabase
        .from("customers")
        .update({
          name: data.customerName.trim(),
          phone: data.customerPhone?.trim() || null,
          email: data.customerEmail?.trim() || null,
        })
        .eq("id", customerId)
        .eq("user_id", user.id);

      if (updateCustErr) {
        toast.error(getErrorMessage(updateCustErr));
        setSaving(false);
        return;
      }
    }

    const orderPayload = {
      user_id: user.id,
      customer_id: customerId,
      title: data.title.trim(),
      description: data.description?.trim() || null,
      file_name: data.fileName?.trim() || null,
      material: data.material,
      color: data.color.trim(),
      quantity: data.quantity,
      estimated_print_hours: data.estimatedPrintHours,
      estimated_material_grams: data.estimatedMaterialGrams,
      deadline: data.deadline || null,
      status: (isEdit ? data.status : "Ofertat") || "Ofertat",
      material_cost_per_kg: data.materialCostPerKg,
      machine_hourly_rate: data.machineHourlyRate,
      electricity_cost_per_hour: data.electricityCostPerHour,
      labor_cost: data.laborCost,
      packaging_cost: data.packagingCost,
      failure_risk_percentage: data.failureRiskPercentage,
      profit_margin_percentage: data.profitMarginPercentage,
      material_cost: breakdown.materialCost,
      machine_cost: breakdown.machineCost,
      electricity_cost: breakdown.electricityCost,
      subtotal: breakdown.subtotal,
      failure_buffer: breakdown.failureBuffer,
      cost_before_profit: breakdown.costBeforeProfit,
      final_price: breakdown.finalPrice,
      estimated_profit: breakdown.estimatedProfit,
      notes: data.notes?.trim() || null,
    };

    if (isEdit && order) {
      const { error } = await supabase
        .from("orders")
        .update(orderPayload)
        .eq("id", order.id)
        .eq("user_id", user.id);

      if (error) {
        toast.error(getErrorMessage(error));
      } else {
        toast.success("Comanda a fost actualizată");
        router.push(`/orders/${order.id}`);
        router.refresh();
      }
    } else {
      const { data: newOrder, error } = await supabase
        .from("orders")
        .insert(orderPayload)
        .select("id")
        .single();

      if (error) {
        toast.error(getErrorMessage(error));
      } else {
        toast.success("Oferta a fost salvată");
        router.push(`/orders/${newOrder.id}`);
        router.refresh();
      }
    }
    setSaving(false);
  }

  return (
    <form
      key={formKey}
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-6 pb-24 lg:grid-cols-2 lg:pb-0"
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Client</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="customerName">Nume client *</Label>
              <Input id="customerName" autoComplete="name" {...register("customerName")} />
              {errors.customerName && (
                <p className="mt-1 text-sm text-destructive">{errors.customerName.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="customerPhone">Telefon</Label>
              <Input
                id="customerPhone"
                type="tel"
                inputMode="tel"
                placeholder="07xx xxx xxx"
                {...register("customerPhone")}
              />
            </div>
            <div>
              <Label htmlFor="customerEmail">Email (opțional)</Label>
              <Input id="customerEmail" type="email" {...register("customerEmail")} />
              {errors.customerEmail && (
                <p className="mt-1 text-sm text-destructive">{errors.customerEmail.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comandă</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="title">Titlu *</Label>
              <Input id="title" {...register("title")} placeholder="ex. Suport telefon" />
              {errors.title && (
                <p className="mt-1 text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="description">Descriere</Label>
              <Textarea id="description" {...register("description")} rows={2} />
            </div>
            <div>
              <Label htmlFor="fileName">Nume fișier (opțional)</Label>
              <Input id="fileName" {...register("fileName")} placeholder="model.stl" />
            </div>
            <div>
              <Label>Material *</Label>
              <Select value={material} onValueChange={(v) => setValue("material", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Alege materialul" />
                </SelectTrigger>
                <SelectContent>
                  {MATERIALS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="color">Culoare *</Label>
              <Input id="color" {...register("color")} placeholder="ex. Negru" />
              {errors.color && (
                <p className="mt-1 text-sm text-destructive">{errors.color.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="quantity">Cantitate *</Label>
              <Input id="quantity" type="number" min={1} {...register("quantity")} />
              {errors.quantity && (
                <p className="mt-1 text-sm text-destructive">{errors.quantity.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="estimatedPrintHours">Timp print / bucată (ore) *</Label>
              <Input
                id="estimatedPrintHours"
                type="number"
                step="0.1"
                min={0.1}
                {...register("estimatedPrintHours")}
              />
            </div>
            <div>
              <Label htmlFor="estimatedMaterialGrams">Material / bucată (g) *</Label>
              <Input
                id="estimatedMaterialGrams"
                type="number"
                min={1}
                {...register("estimatedMaterialGrams")}
              />
            </div>
            <p className="sm:col-span-2 text-xs text-muted-foreground">
              Timpul și gramajul sunt per bucată; prețul final include cantitatea.
            </p>
            <div>
              <Label htmlFor="deadline">Termen livrare</Label>
              <Input id="deadline" type="date" {...register("deadline")} />
            </div>
            {isEdit && (
              <div>
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => setValue("status", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="sm:col-span-2">
              <Label htmlFor="notes">Note interne</Label>
              <Textarea id="notes" {...register("notes")} rows={2} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Parametri preț</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="materialCostPerKg">Cost material / kg (lei)</Label>
              <Input
                id="materialCostPerKg"
                type="number"
                step="0.01"
                min={0}
                {...register("materialCostPerKg")}
              />
            </div>
            <div>
              <Label htmlFor="machineHourlyRate">Rată mașină / oră (lei)</Label>
              <Input
                id="machineHourlyRate"
                type="number"
                step="0.01"
                min={0}
                {...register("machineHourlyRate")}
              />
            </div>
            <div>
              <Label htmlFor="electricityCostPerHour">Electricitate / oră (lei)</Label>
              <Input
                id="electricityCostPerHour"
                type="number"
                step="0.01"
                min={0}
                {...register("electricityCostPerHour")}
              />
            </div>
            <div>
              <Label htmlFor="laborCost">Manoperă / comandă (lei)</Label>
              <Input id="laborCost" type="number" step="0.01" min={0} {...register("laborCost")} />
            </div>
            <div>
              <Label htmlFor="packagingCost">Ambalaj / comandă (lei)</Label>
              <Input
                id="packagingCost"
                type="number"
                step="0.01"
                min={0}
                {...register("packagingCost")}
              />
            </div>
            <div>
              <Label htmlFor="failureRiskPercentage">Risc eșec (%)</Label>
              <Input
                id="failureRiskPercentage"
                type="number"
                min={0}
                max={100}
                {...register("failureRiskPercentage")}
              />
            </div>
            <div>
              <Label htmlFor="profitMarginPercentage">Marjă profit (%)</Label>
              <Input
                id="profitMarginPercentage"
                type="number"
                min={0}
                max={200}
                {...register("profitMarginPercentage")}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <PriceBreakdown breakdown={breakdown} currency={profile?.currency} />
        <Button
          type="submit"
          size="lg"
          className="hidden w-full lg:inline-flex"
          disabled={saving}
        >
          {saving ? "Se salvează..." : isEdit ? "Salvează modificările" : "Salvează oferta"}
        </Button>
      </div>

      {/* Mobile sticky save */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-white/95 p-4 backdrop-blur lg:hidden">
        <Button type="submit" size="lg" className="w-full" disabled={saving}>
          {saving ? "Se salvează..." : isEdit ? "Salvează" : "Salvează oferta"}
        </Button>
      </div>
    </form>
  );
}
