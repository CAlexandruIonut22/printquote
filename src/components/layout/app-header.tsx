"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Printer, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getMessages } from "@/locales";
import { UserMenu } from "./user-menu";

const t = getMessages();

const navItems = [
  { href: "/dashboard", label: t.nav.dashboard },
  { href: "/orders", label: t.nav.orders },
  { href: "/customers", label: t.nav.customers },
  { href: "/settings", label: t.nav.settings },
];

export function AppHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6">
        <Link
          href="/dashboard"
          className="flex min-w-0 items-center gap-2 font-semibold text-primary"
        >
          <Printer className="h-5 w-5 shrink-0" />
          <span className="truncate">{t.appName}</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                pathname.startsWith(item.href)
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/quote/new">{t.nav.newQuote}</Link>
          </Button>
          <UserMenu />
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Închide meniul" : "Deschide meniul"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <nav className="border-t bg-white px-4 py-3 lg:hidden">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-md px-3 py-3 text-sm font-medium",
                  pathname.startsWith(item.href) ? "bg-muted" : "text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
            <Button asChild className="mt-2 w-full" size="lg">
              <Link href="/quote/new" onClick={() => setOpen(false)}>
                {t.nav.newQuote}
              </Link>
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
}
