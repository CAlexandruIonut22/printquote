"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, ExternalLink, Link2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublicQuotePath, getPublicQuoteUrl } from "@/lib/public-quote";

interface ShareQuoteLinkProps {
  shareToken: string;
  orderTitle: string;
}

export function ShareQuoteLink({ shareToken, orderTitle }: ShareQuoteLinkProps) {
  const [copied, setCopied] = useState(false);
  const publicUrl = getPublicQuoteUrl(shareToken);
  const publicPath = getPublicQuotePath(shareToken);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      toast.success("Link copiat — trimite-l clientului");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Nu am putut copia linkul");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Link2 className="h-5 w-5" />
          Link public ofertă
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Trimite acest link clientului pentru „{orderTitle}”. Pagina este doar pentru
          vizualizare — nu necesită cont.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input readOnly value={publicUrl} className="font-mono text-xs sm:text-sm" />
          <Button type="button" variant="secondary" onClick={copyLink} className="shrink-0">
            <Copy className="h-4 w-4" />
            {copied ? "Copiat!" : "Copiază link"}
          </Button>
        </div>
        <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
          <Link href={publicPath} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
            Previzualizează pagina clientului
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
