"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { parseISO } from "date-fns";
import { Copy, ExternalLink, MessageCircle, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { StatusBadge } from "./status-badge";
import { PriceBreakdown } from "@/components/quote/price-breakdown";
import { createClient } from "@/lib/supabase/client";
import { formatPrice, toNumber } from "@/lib/pricing";
import { getErrorMessage } from "@/lib/errors";
import {
  buildOrderReadyMessage,
  buildOrderStartedMessage,
  buildPaymentReminderMessage,
  buildQuoteMessage,
  buildWhatsAppLink,
} from "@/lib/whatsapp";
import { ShareQuoteLink } from "./share-quote-link";
import { ORDER_STATUSES, type Customer, type Order, type OrderStatus } from "@/lib/types";

interface OrderDetailClientProps {
  order: Order;
  customer: Customer | null;
}

function formatDeadlineDisplay(deadline: string | null): string {
  if (!deadline) return "—";
  try {
    const d = /^\d{4}-\d{2}-\d{2}$/.test(deadline)
      ? parseISO(`${deadline}T12:00:00`)
      : new Date(deadline);
    return format(d, "d MMMM yyyy", { locale: ro });
  } catch {
    return deadline;
  }
}

export function OrderDetailClient({ order, customer }: OrderDetailClientProps) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [deleting, setDeleting] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    setStatus(order.status);
  }, [order.status]);

  const breakdown = {
    materialCost: toNumber(order.material_cost),
    machineCost: toNumber(order.machine_cost),
    electricityCost: toNumber(order.electricity_cost),
    laborCost: toNumber(order.labor_cost),
    packagingCost: toNumber(order.packaging_cost),
    subtotal: toNumber(order.subtotal),
    failureBuffer: toNumber(order.failure_buffer),
    costBeforeProfit: toNumber(order.cost_before_profit),
    finalPrice: toNumber(order.final_price),
    estimatedProfit: toNumber(order.estimated_profit),
    quantity: order.quantity ?? 1,
  };

  const messages = [
    { id: "quote", label: "Mesaj ofertă", text: buildQuoteMessage(order, customer) },
    {
      id: "payment",
      label: "Reminder plată",
      text: buildPaymentReminderMessage(order, customer),
    },
    {
      id: "printing",
      label: "Comandă în printare",
      text: buildOrderStartedMessage(order, customer),
    },
    { id: "ready", label: "Comandă gata", text: buildOrderReadyMessage(order, customer) },
  ] as const;

  async function copyText(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} — copiat în clipboard`);
    } catch {
      toast.error("Nu am putut copia textul. Copiază manual.");
    }
  }

  async function changeStatus(newStatus: OrderStatus) {
    if (newStatus === status) return;
    setStatusLoading(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", order.id);

    setStatusLoading(false);

    if (error) {
      toast.error(getErrorMessage(error));
    } else {
      setStatus(newStatus);
      toast.success("Status actualizat");
      router.refresh();
    }
  }

  async function deleteOrder() {
    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase.from("orders").delete().eq("id", order.id);
    setDeleting(false);

    if (error) {
      toast.error(getErrorMessage(error));
    } else {
      toast.success("Comanda a fost ștearsă");
      router.push("/orders");
      router.refresh();
    }
  }

  const defaultWaLink = buildWhatsAppLink(customer?.phone, messages[0].text);

  return (
    <div className="space-y-6 pb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{order.title}</h1>
          <p className="truncate text-muted-foreground">
            {customer?.name ?? "Fără client asociat"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-none">
            <Link href={`/quote/${order.id}/edit`}>
              <Pencil className="h-4 w-4" />
              Editează
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={deleting}>
                <Trash2 className="h-4 w-4" />
                Șterge
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="mx-4 max-w-[calc(100vw-2rem)] sm:max-w-lg">
              <AlertDialogHeader>
                <AlertDialogTitle>Ștergi comanda?</AlertDialogTitle>
                <AlertDialogDescription>
                  „{order.title}” va fi ștearsă definitiv. Această acțiune nu poate fi anulată.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
                <AlertDialogCancel className="mt-0">Anulează</AlertDialogCancel>
                <AlertDialogAction onClick={deleteOrder} disabled={deleting}>
                  {deleting ? "Se șterge..." : "Șterge comanda"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <StatusBadge status={status} />
        <Select
          value={status}
          onValueChange={(v) => changeStatus(v as OrderStatus)}
          disabled={statusLoading}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Schimbă statusul" />
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

      <p className="text-2xl font-bold text-primary tabular-nums">
        Preț final: {formatPrice(order.final_price)}
      </p>

      {order.share_token && (
        <ShareQuoteLink shareToken={order.share_token} orderTitle={order.title} />
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Detalii comandă</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Descriere" value={order.description} />
            <Row label="Fișier" value={order.file_name} />
            <Row label="Material" value={order.material === "Other" ? "Altul" : order.material} />
            <Row label="Culoare" value={order.color} />
            <Row label="Cantitate" value={`${order.quantity} buc.`} />
            <Row
              label="Timp print / bucată"
              value={
                order.estimated_print_hours != null
                  ? `${order.estimated_print_hours} ore`
                  : null
              }
            />
            <Row
              label="Material / bucată"
              value={
                order.estimated_material_grams != null
                  ? `${order.estimated_material_grams} g`
                  : null
              }
            />
            <Row label="Termen" value={formatDeadlineDisplay(order.deadline)} />
            <Row
              label="Creat la"
              value={format(new Date(order.created_at), "d MMM yyyy, HH:mm", { locale: ro })}
            />
            <Row label="Note" value={order.notes} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Client</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Nume" value={customer?.name} />
            <Row label="Telefon" value={customer?.phone} />
            <Row label="Email" value={customer?.email} />
            {customer && (
              <Button variant="outline" size="sm" asChild className="mt-2 w-full sm:w-auto">
                <Link href={`/customers/${customer.id}`}>Vezi fișa clientului</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <PriceBreakdown breakdown={breakdown} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageCircle className="h-5 w-5" />
            Mesaje WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!customer?.phone && (
            <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Adaugă numărul de telefon la client pentru link direct WhatsApp.
            </p>
          )}
          {messages.map((msg) => {
            const link = buildWhatsAppLink(customer?.phone, msg.text);
            return (
              <div key={msg.id} className="rounded-lg border bg-muted/30 p-3">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium">{msg.label}</span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyText(msg.text, msg.label)}
                    >
                      <Copy className="h-4 w-4" />
                      <span className="sr-only sm:not-sr-only sm:ml-1">Copiază</span>
                    </Button>
                    {link && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                          <span className="sr-only sm:not-sr-only sm:ml-1">WhatsApp</span>
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">{msg.text}</p>
              </div>
            );
          })}
          {defaultWaLink && (
            <Button asChild className="w-full" size="lg">
              <a href={defaultWaLink} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" />
                Deschide WhatsApp cu mesajul de ofertă
              </a>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/50 py-2 last:border-0">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value?.trim() ? value : "—"}</span>
    </div>
  );
}
