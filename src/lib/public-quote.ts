import { format, parseISO } from "date-fns";
import { ro } from "date-fns/locale";
import { toNumber } from "./pricing";

export interface PublicQuote {
  business_name: string;
  seller_phone: string | null;
  title: string;
  description: string | null;
  material: string | null;
  color: string | null;
  quantity: number;
  deadline: string | null;
  final_price: number | null;
  currency: string;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidShareToken(token: string): boolean {
  return UUID_RE.test(token);
}

export function parsePublicQuote(data: unknown): PublicQuote | null {
  if (!data || typeof data !== "object") return null;
  const row = data as Record<string, unknown>;
  if (typeof row.title !== "string") return null;

  return {
    business_name:
      typeof row.business_name === "string" ? row.business_name : "Atelier 3D Print",
    seller_phone: typeof row.seller_phone === "string" ? row.seller_phone : null,
    title: row.title,
    description: typeof row.description === "string" ? row.description : null,
    material: typeof row.material === "string" ? row.material : null,
    color: typeof row.color === "string" ? row.color : null,
    quantity: toNumber(row.quantity, 1),
    deadline: typeof row.deadline === "string" ? row.deadline : null,
    final_price:
      row.final_price == null ? null : toNumber(row.final_price),
    currency: typeof row.currency === "string" ? row.currency : "RON",
  };
}

export function getPublicQuotePath(shareToken: string): string {
  return `/q/${shareToken}`;
}

export function getPublicQuoteUrl(shareToken: string, origin?: string): string {
  const path = getPublicQuotePath(shareToken);
  if (origin) return `${origin.replace(/\/$/, "")}${path}`;
  if (typeof window !== "undefined") {
    return `${window.location.origin}${path}`;
  }
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl) return `${appUrl.replace(/\/$/, "")}${path}`;
  return path;
}

export function formatPublicDeadline(deadline: string | null): string {
  if (!deadline) return "De convenit";
  try {
    const d = /^\d{4}-\d{2}-\d{2}$/.test(deadline)
      ? parseISO(`${deadline}T12:00:00`)
      : new Date(deadline);
    return format(d, "d MMMM yyyy", { locale: ro });
  } catch {
    return deadline;
  }
}

export function materialDisplay(material: string | null): string {
  if (!material) return "—";
  if (material === "Other" || material === "Altul") return "Altul";
  return material;
}

export function buildCustomerConfirmationMessage(
  title: string,
  finalPrice: number | null
): string {
  const amount =
    finalPrice != null && Number.isFinite(finalPrice) ? Math.round(finalPrice) : 0;
  return `Salut! Confirm oferta pentru comanda ${title} la prețul de ${amount} lei.`;
}
