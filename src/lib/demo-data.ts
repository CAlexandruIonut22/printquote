import type { SupabaseClient } from "@supabase/supabase-js";
import { calculatePricing } from "./pricing";

export async function seedDemoData(
  supabase: SupabaseClient,
  userId: string
): Promise<{ error: Error | null }> {
  const { data: existing } = await supabase
    .from("customers")
    .select("id")
    .eq("user_id", userId)
    .limit(1);

  if (existing && existing.length > 0) {
    return { error: new Error("Datele demo există deja în cont.") };
  }

  const customers = [
    {
      user_id: userId,
      name: "Andrei Popescu",
      phone: "0721123456",
      email: "andrei.popescu@email.ro",
      notes: "Client fidel, preferă PLA negru",
    },
    {
      user_id: userId,
      name: "Maria Ionescu",
      phone: "0732987654",
      email: null,
      notes: "Comenzi de pe Instagram",
    },
    {
      user_id: userId,
      name: "Cristian Dumitrescu",
      phone: "0744555666",
      email: "cristian.d@email.ro",
      notes: null,
    },
  ];

  const { data: insertedCustomers, error: custError } = await supabase
    .from("customers")
    .insert(customers)
    .select();

  if (custError || !insertedCustomers?.length) {
    return { error: custError ?? new Error("Failed to insert customers") };
  }

  const [andrei, maria, cristian] = insertedCustomers;

  const orders = [
    {
      user_id: userId,
      customer_id: andrei.id,
      title: "Suport telefon",
      description: "Suport universal pentru birou, unghi 45°",
      material: "PLA",
      color: "Negru",
      quantity: 2,
      estimated_print_hours: 3.5,
      estimated_material_grams: 85,
      deadline: daysFromNow(5),
      status: "Ofertat",
      material_cost_per_kg: 80,
      machine_hourly_rate: 5,
      electricity_cost_per_hour: 1,
      labor_cost: 10,
      packaging_cost: 3,
      failure_risk_percentage: 10,
      profit_margin_percentage: 30,
      final_price: 95,
      estimated_profit: 22,
      material_cost: 6.8,
      machine_cost: 17.5,
      electricity_cost: 3.5,
      subtotal: 40.8,
      failure_buffer: 4.08,
      cost_before_profit: 44.88,
      notes: "Trimis ofertă pe WhatsApp",
    },
    {
      user_id: userId,
      customer_id: maria.id,
      title: "Organizator cabluri",
      description: "Set 3 bucăți pentru birou",
      material: "PETG",
      color: "Alb",
      quantity: 3,
      estimated_print_hours: 5,
      estimated_material_grams: 120,
      deadline: daysFromNow(7),
      status: "În printare",
      material_cost_per_kg: 90,
      machine_hourly_rate: 5,
      electricity_cost_per_hour: 1,
      labor_cost: 15,
      packaging_cost: 5,
      failure_risk_percentage: 10,
      profit_margin_percentage: 35,
      final_price: 145,
      estimated_profit: 38,
      material_cost: 10.8,
      machine_cost: 25,
      electricity_cost: 5,
      subtotal: 50.8,
      failure_buffer: 5.08,
      cost_before_profit: 55.88,
    },
    {
      user_id: userId,
      customer_id: cristian.id,
      title: "Suport căști",
      description: "Design personalizat cu logo",
      material: "PLA",
      color: "Gri",
      quantity: 1,
      estimated_print_hours: 4,
      estimated_material_grams: 95,
      deadline: daysFromNow(3),
      status: "Plătit",
      material_cost_per_kg: 80,
      machine_hourly_rate: 5,
      electricity_cost_per_hour: 1,
      labor_cost: 12,
      packaging_cost: 3,
      failure_risk_percentage: 10,
      profit_margin_percentage: 30,
      final_price: 78,
      estimated_profit: 18,
      material_cost: 7.6,
      machine_cost: 20,
      electricity_cost: 4,
      subtotal: 46.6,
      failure_buffer: 4.66,
      cost_before_profit: 51.26,
    },
    {
      user_id: userId,
      customer_id: andrei.id,
      title: "Piesă de schimb",
      description: "Capac plastic pentru aparat electrocasnic",
      material: "ABS",
      color: "Alb",
      quantity: 1,
      estimated_print_hours: 2,
      estimated_material_grams: 45,
      deadline: daysFromNow(10),
      status: "Gata",
      material_cost_per_kg: 100,
      machine_hourly_rate: 5,
      electricity_cost_per_hour: 1,
      labor_cost: 8,
      packaging_cost: 3,
      failure_risk_percentage: 15,
      profit_margin_percentage: 25,
      final_price: 52,
      estimated_profit: 10,
      material_cost: 4.5,
      machine_cost: 10,
      electricity_cost: 2,
      subtotal: 27.5,
      failure_buffer: 4.13,
      cost_before_profit: 31.63,
    },
    {
      user_id: userId,
      customer_id: maria.id,
      title: "Miniatură decorativă",
      description: "Figurină 8cm pentru cadou",
      material: "Resin",
      color: "Personalizat",
      quantity: 1,
      estimated_print_hours: 6,
      estimated_material_grams: 30,
      deadline: daysFromNow(14),
      status: "Nou",
      material_cost_per_kg: 150,
      machine_hourly_rate: 8,
      electricity_cost_per_hour: 1.5,
      labor_cost: 20,
      packaging_cost: 5,
      failure_risk_percentage: 20,
      profit_margin_percentage: 40,
      notes: "Aștept fișier STL de la client",
    },
  ];

  const miniBreakdown = calculatePricing({
    materialCostPerKg: 150,
    machineHourlyRate: 8,
    electricityCostPerHour: 1.5,
    laborCost: 20,
    packagingCost: 5,
    failureRiskPercentage: 20,
    profitMarginPercentage: 40,
    estimatedPrintHours: 6,
    estimatedMaterialGrams: 30,
    quantity: 1,
  });

  orders[4] = {
    ...orders[4],
    material_cost: miniBreakdown.materialCost,
    machine_cost: miniBreakdown.machineCost,
    electricity_cost: miniBreakdown.electricityCost,
    subtotal: miniBreakdown.subtotal,
    failure_buffer: miniBreakdown.failureBuffer,
    cost_before_profit: miniBreakdown.costBeforeProfit,
    final_price: miniBreakdown.finalPrice,
    estimated_profit: miniBreakdown.estimatedProfit,
  };

  const { error: orderError } = await supabase.from("orders").insert(orders);

  if (orderError) {
    return { error: orderError };
  }

  return { error: null };
}

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}
