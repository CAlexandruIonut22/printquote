import { Spinner } from "@/components/ui/spinner";

export default function AppLoading() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
      <Spinner />
      <p className="text-sm text-muted-foreground">Se încarcă...</p>
    </div>
  );
}
