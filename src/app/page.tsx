import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  LayoutDashboard,
  MessageSquare,
  Printer,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold text-primary">
            <Printer className="h-6 w-6" />
            PrintQuote
          </Link>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Autentificare</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Încearcă gratuit</Link>
            </Button>
          </nav>
        </div>
      </header>

      <section className="border-b bg-gradient-to-b from-primary/5 to-background px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Transformă comenzile de printare 3D din WhatsApp în oferte clare și organizate.
          </h1>
          <p className="mt-4 text-lg text-muted-foreground sm:text-xl">
            Calculează prețuri, salvează clienți, urmărește statusul comenzilor și trimite mesaje
            profesionale în câteva secunde.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/signup">
                Încearcă gratuit
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login?demo=1">Vezi demo</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-2xl font-bold">Problema</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
          Comenzile se pierd în conversații WhatsApp, prețurile variază de la o comandă la alta, iar
          follow-up-ul manual consumă timp prețios.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            "Comenzi pierdute în chat-uri",
            "Prețuri inconsistente",
            "Urmărire manuală a statusului",
          ].map((item) => (
            <Card key={item}>
              <CardContent className="flex items-center gap-3 p-6">
                <span className="text-destructive">✕</span>
                <span>{item}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-muted/40 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-2xl font-bold">Soluția PrintQuote</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Zap,
                title: "Oferte rapide",
                desc: "Calculator de preț cu detaliere live",
              },
              {
                icon: LayoutDashboard,
                title: "Tablou comenzi",
                desc: "Kanban cu toate statusurile",
              },
              {
                icon: Users,
                title: "Bază clienți",
                desc: "Istoric comenzi per client",
              },
              {
                icon: MessageSquare,
                title: "Mesaje WhatsApp",
                desc: "Șabloane profesionale, fără API",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <Card key={title}>
                <CardHeader>
                  <Icon className="mb-2 h-8 w-8 text-primary" />
                  <CardTitle className="text-lg">{title}</CardTitle>
                  <CardDescription>{desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-2xl font-bold">Prețuri</h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Abonamentele vor fi disponibile în curând — MVP gratuit pentru testare
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {[
            { name: "Free", price: "0", desc: "10 comenzi / lună", features: ["Calculator preț", "Mesaje WhatsApp", "Tablou comenzi"] },
            { name: "Starter", price: "49", desc: "Comenzi nelimitate", features: ["Tot din Free", "Export date", "Suport email"], highlight: false },
            { name: "Pro", price: "99", desc: "Pentru ateliere active", features: ["Tot din Starter", "Statistici avansate", "Prioritate suport"], highlight: true },
          ].map((plan) => (
            <Card
              key={plan.name}
              className={plan.highlight ? "border-primary shadow-lg ring-1 ring-primary" : ""}
            >
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <p className="text-3xl font-bold">
                  {plan.price} <span className="text-base font-normal text-muted-foreground">lei/lună</span>
                </p>
                <CardDescription>{plan.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t bg-primary px-4 py-16 text-primary-foreground sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold">Gata să organizezi atelierul?</h2>
          <p className="mt-3 opacity-90">
            Creează cont gratuit și începe să trimiți oferte profesionale astăzi.
          </p>
          <Button size="lg" variant="secondary" className="mt-6" asChild>
            <Link href="/signup">Încearcă gratuit</Link>
          </Button>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} PrintQuote. Toate drepturile rezervate.
      </footer>
    </div>
  );
}
