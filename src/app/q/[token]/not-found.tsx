import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PublicQuoteNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-xl font-semibold">Oferta nu a fost găsită</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Linkul este invalid sau a expirat. Cere vânzătorului un link nou.
      </p>
      <Button asChild variant="outline" className="mt-6">
        <Link href="/">Pagina principală</Link>
      </Button>
    </div>
  );
}
