import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MessageCircle, Printer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  buildCustomerConfirmationMessage,
  formatPublicDeadline,
  isValidShareToken,
  materialDisplay,
} from "@/lib/public-quote";
import { fetchPublicQuoteByToken } from "@/lib/supabase/public";
import { formatPrice } from "@/lib/pricing";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Ofertă printare 3D",
  robots: { index: false, follow: false },
};

export default async function PublicQuotePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  if (!isValidShareToken(token)) {
    notFound();
  }

  const quote = await fetchPublicQuoteByToken(token);

  if (!quote) {
    notFound();
  }

  const confirmMessage = buildCustomerConfirmationMessage(
    quote.title,
    quote.final_price
  );
  const whatsappLink = buildWhatsAppLink(quote.seller_phone, confirmMessage);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <header className="border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center gap-2 px-4 py-4">
          <Printer className="h-5 w-5 text-primary" aria-hidden />
          <span className="font-semibold text-primary">{quote.business_name}</span>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-8">
        <p className="text-center text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Ofertă printare 3D
        </p>
        <h1 className="mt-2 text-center text-2xl font-bold tracking-tight">{quote.title}</h1>

        <Card className="mt-8 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Detalii ofertă</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {quote.description && (
              <div>
                <p className="text-muted-foreground">Descriere</p>
                <p className="mt-1 whitespace-pre-wrap font-medium">{quote.description}</p>
              </div>
            )}
            <DetailRow label="Material" value={materialDisplay(quote.material)} />
            <DetailRow label="Culoare" value={quote.color ?? "—"} />
            <DetailRow label="Cantitate" value={`${quote.quantity} buc.`} />
            <DetailRow label="Termen estimat" value={formatPublicDeadline(quote.deadline)} />
            <div className="rounded-lg bg-primary/10 px-4 py-4 text-center">
              <p className="text-sm text-muted-foreground">Preț final</p>
              <p className="mt-1 text-3xl font-bold tabular-nums text-primary">
                {formatPrice(quote.final_price, quote.currency)}
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Pentru confirmare, contactează vânzătorul pe WhatsApp.
        </p>

        {whatsappLink ? (
          <Button asChild size="lg" className="mt-4 w-full">
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-5 w-5" />
              Confirmă oferta pe WhatsApp
            </a>
          </Button>
        ) : (
          <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-center text-sm text-amber-900">
            Vânzătorul nu are un număr de telefon configurat. Contactează-l prin canalul
            obișnuit (WhatsApp, email).
          </p>
        )}

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Ofertă generată cu PrintQuote · Doar pentru vizualizare
        </p>
      </main>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/60 pb-3 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
