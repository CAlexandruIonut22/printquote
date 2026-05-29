"use client";

import { AppHeader } from "./app-header";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background pb-safe">
      <AppHeader />
      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
