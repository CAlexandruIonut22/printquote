"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h2 className="text-lg font-semibold">Ceva nu a funcționat</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        Nu am putut încărca pagina. Verifică conexiunea sau încearcă din nou.
      </p>
      <Button onClick={reset}>Încearcă din nou</Button>
    </div>
  );
}
