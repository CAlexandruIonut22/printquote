export const ORDER_STATUSES = [
  "Nou",
  "Ofertat",
  "Acceptat",
  "Plătit",
  "În printare",
  "Gata",
  "Livrat",
  "Anulat",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const MATERIALS = [
  "PLA",
  "PETG",
  "ABS",
  "TPU",
  "Resin",
  "Altul",
] as const;

export type Material = (typeof MATERIALS)[number];

export interface Profile {
  id: string;
  business_name: string | null;
  phone: string | null;
  currency: string;
  default_material_cost_per_kg: number;
  default_machine_hourly_rate: number;
  default_electricity_cost_per_hour: number;
  default_labor_cost: number;
  default_packaging_cost: number;
  default_failure_risk_percentage: number;
  default_profit_margin_percentage: number;
  created_at: string;
}

export interface Customer {
  id: string;
  user_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  share_token: string;
  customer_id: string | null;
  title: string;
  description: string | null;
  file_name: string | null;
  material: string | null;
  color: string | null;
  quantity: number;
  estimated_print_hours: number | null;
  estimated_material_grams: number | null;
  deadline: string | null;
  status: OrderStatus;
  material_cost_per_kg: number | null;
  machine_hourly_rate: number | null;
  electricity_cost_per_hour: number | null;
  labor_cost: number | null;
  packaging_cost: number | null;
  failure_risk_percentage: number | null;
  profit_margin_percentage: number | null;
  material_cost: number | null;
  machine_cost: number | null;
  electricity_cost: number | null;
  subtotal: number | null;
  failure_buffer: number | null;
  cost_before_profit: number | null;
  final_price: number | null;
  estimated_profit: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  customers?: Customer | null;
}

export interface PricingInputs {
  materialCostPerKg: number;
  machineHourlyRate: number;
  electricityCostPerHour: number;
  laborCost: number;
  packagingCost: number;
  failureRiskPercentage: number;
  profitMarginPercentage: number;
  estimatedPrintHours: number;
  estimatedMaterialGrams: number;
  quantity: number;
}

export interface PricingBreakdown {
  materialCost: number;
  machineCost: number;
  electricityCost: number;
  laborCost: number;
  packagingCost: number;
  subtotal: number;
  failureBuffer: number;
  costBeforeProfit: number;
  finalPrice: number;
  estimatedProfit: number;
  quantity: number;
}
