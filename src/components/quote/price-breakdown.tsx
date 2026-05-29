import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/pricing";
import type { PricingBreakdown } from "@/lib/types";

interface PriceBreakdownProps {
  breakdown: PricingBreakdown;
  currency?: string;
}

export function PriceBreakdown({ breakdown, currency = "RON" }: PriceBreakdownProps) {
  const qtyNote =
    breakdown.quantity > 1
      ? ` (× ${breakdown.quantity} buc. — timp și gramaj per bucată)`
      : "";

  const rows = [
    { label: `Cost material${qtyNote}`, value: breakdown.materialCost },
    { label: `Cost mașină${qtyNote}`, value: breakdown.machineCost },
    { label: `Cost electricitate${qtyNote}`, value: breakdown.electricityCost },
    { label: "Manoperă", value: breakdown.laborCost },
    { label: "Ambalaj", value: breakdown.packagingCost },
    { label: "Subtotal", value: breakdown.subtotal, bold: true },
    { label: "Buffer eșec", value: breakdown.failureBuffer },
    { label: "Cost înainte de profit", value: breakdown.costBeforeProfit, bold: true },
  ];

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Detaliere preț</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {rows.map((row) => (
          <div
            key={row.label}
            className={`flex justify-between gap-2 ${row.bold ? "font-medium" : ""}`}
          >
            <span className="text-muted-foreground">{row.label}</span>
            <span className="shrink-0 tabular-nums">{formatPrice(row.value, currency)}</span>
          </div>
        ))}
        <Separator className="my-3" />
        <div className="flex justify-between text-lg font-semibold text-primary">
          <span>Preț final</span>
          <span className="tabular-nums">{formatPrice(breakdown.finalPrice, currency)}</span>
        </div>
        <div className="flex justify-between text-emerald-700">
          <span>Profit estimat</span>
          <span className="tabular-nums">{formatPrice(breakdown.estimatedProfit, currency)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
