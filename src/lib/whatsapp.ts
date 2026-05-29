import { formatPrice } from "./pricing";
import type { Customer, Order } from "./types";
import { format, parseISO } from "date-fns";
import { ro } from "date-fns/locale";

function customerFirstName(customer: Customer | null): string | null {
  const name = customer?.name?.trim();
  if (!name) return null;
  return name.split(/\s+/)[0] ?? name;
}

function greeting(customer: Customer | null): string {
  const first = customerFirstName(customer);
  return first ? `Salut, ${first}!` : "Salut!";
}

function parseDeadlineDate(deadline: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(deadline)) {
    return parseISO(`${deadline}T12:00:00`);
  }
  return new Date(deadline);
}

function formatDeadline(deadline: string | null): string {
  if (!deadline) return "de convenit";
  try {
    return format(parseDeadlineDate(deadline), "d MMMM yyyy", { locale: ro });
  } catch {
    return deadline;
  }
}

function materialLabel(material: string | null): string {
  if (!material) return "—";
  if (material === "Other" || material === "Altul") return "Altul";
  return material;
}

export function buildQuoteMessage(order: Order, customer: Customer | null): string {
  const price = formatPrice(order.final_price);
  const qty = order.quantity ?? 1;
  return `${greeting(customer)} Pentru comanda „${order.title}”, prețul estimat este ${price}, pentru ${qty} buc., material ${materialLabel(order.material)}, culoare ${order.color ?? "—"}. Termen estimat: ${formatDeadline(order.deadline)}. Dacă este în regulă, pot începe după confirmarea ta.`;
}

export function buildPaymentReminderMessage(order: Order, customer: Customer | null): string {
  return `${greeting(customer)} Revin cu un reminder pentru comanda „${order.title}”. După confirmarea plății, pot începe printarea. Mulțumesc!`;
}

export function buildOrderStartedMessage(order: Order, customer: Customer | null): string {
  return `${greeting(customer)} Comanda ta „${order.title}” a intrat în printare. Te anunț când este gata.`;
}

export function buildOrderReadyMessage(order: Order, customer: Customer | null): string {
  const price = formatPrice(order.final_price);
  return `${greeting(customer)} Comanda ta „${order.title}” este gata. Preț final: ${price}. Putem stabili livrarea sau ridicarea.`;
}

/** Normalizează număr românesc (07xx) la format wa.me fără + */
export function normalizePhoneForWhatsApp(phone: string): string | null {
  let digits = phone.replace(/\D/g, "");
  if (!digits) return null;

  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }

  if (digits.startsWith("40") && digits.length >= 11) {
    return digits;
  }

  if (digits.startsWith("0") && digits.length === 10) {
    return `40${digits.slice(1)}`;
  }

  if (digits.length === 9 && digits.startsWith("7")) {
    return `40${digits}`;
  }

  if (digits.length >= 10) {
    return digits.startsWith("4") ? digits : `40${digits}`;
  }

  return null;
}

export function buildWhatsAppLink(
  phone: string | null | undefined,
  message: string
): string | null {
  if (!phone?.trim()) return null;
  const normalized = normalizePhoneForWhatsApp(phone);
  if (!normalized) return null;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}
