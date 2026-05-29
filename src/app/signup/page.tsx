"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { getErrorMessage } from "@/lib/errors";

const schema = z.object({
  email: z.string().email("Introdu un email valid"),
  password: z.string().min(6, "Parola trebuie să aibă minim 6 caractere"),
});

type FormValues = z.infer<typeof schema>;

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormValues) {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });
    setLoading(false);

    if (error) {
      toast.error(getErrorMessage(error));
      return;
    }

    toast.success("Cont creat cu succes! Bine ai venit.");
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="mx-auto mb-2 flex items-center justify-center gap-2 text-primary">
            <Printer className="h-6 w-6" />
            <span className="font-semibold">PrintQuote</span>
          </Link>
          <CardTitle>Creează cont</CardTitle>
          <CardDescription>Începe gratuit — fără card necesar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" {...register("email")} />
              {errors.email && (
                <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="password">Parolă</Label>
              <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
              {errors.password && (
                <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Se creează contul..." : "Creează cont"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Ai deja cont?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Autentifică-te
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
