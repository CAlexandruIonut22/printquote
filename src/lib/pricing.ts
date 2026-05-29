import type { PricingBreakdown, PricingInputs } from "./types";

/**
 * Calculează prețul unei comenzi.
 * Timpul (ore) și gramajul (g) sunt per bucată; costurile variabile se înmulțesc cu cantitatea.
 * Manoperă și ambalaj sunt per comandă.
 */
export function calculatePricing(inputs: PricingInputs): PricingBreakdown {
  const {
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
  } = inputs;

  const qty = Math.max(1, quantity || 1);

  const materialCostPerUnit =
    (estimatedMaterialGrams / 1000) * materialCostPerKg;
  const machineCostPerUnit = estimatedPrintHours * machineHourlyRate;
  const electricityCostPerUnit = estimatedPrintHours * electricityCostPerHour;

  const materialCost = materialCostPerUnit * qty;
  const machineCost = machineCostPerUnit * qty;
  const electricityCost = electricityCostPerUnit * qty;

  const subtotal =
    materialCost + machineCost + electricityCost + laborCost + packagingCost;
  const failureBuffer = subtotal * (failureRiskPercentage / 100);
  const costBeforeProfit = subtotal + failureBuffer;
  const finalPrice = costBeforeProfit * (1 + profitMarginPercentage / 100);
  const estimatedProfit = finalPrice - costBeforeProfit;

  return {
    materialCost: round2(materialCost),
    machineCost: round2(machineCost),
    electricityCost: round2(electricityCost),
    laborCost: round2(laborCost),
    packagingCost: round2(packagingCost),
    subtotal: round2(subtotal),
    failureBuffer: round2(failureBuffer),
    costBeforeProfit: round2(costBeforeProfit),
    finalPrice: round2(finalPrice),
    estimatedProfit: round2(estimatedProfit),
    quantity: qty,
  };
}

function round2(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100) / 100;
}

export function formatPrice(
  amount: number | null | undefined,
  currency = "RON"
): string {
  if (amount == null || Number.isNaN(amount)) return "—";
  const rounded = Math.round(amount);
  const label = currency === "RON" ? "lei" : currency;
  return `${rounded.toLocaleString("ro-RO")} ${label}`;
}

/** Convertește valori numerice din Supabase (string | number) */
export function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = parseFloat(value);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}
