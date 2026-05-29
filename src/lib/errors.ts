/** Mesaje prietenoase pentru erori Supabase / rețea */
export function getErrorMessage(error: unknown, fallback = "A apărut o eroare. Încearcă din nou."): string {
  if (!error) return fallback;

  const msg =
    typeof error === "string"
      ? error
      : error instanceof Error
        ? error.message
        : typeof error === "object" && error !== null && "message" in error
          ? String((error as { message: unknown }).message)
          : fallback;

  const lower = msg.toLowerCase();

  if (lower.includes("invalid login credentials")) {
    return "Email sau parolă incorectă.";
  }
  if (lower.includes("user already registered")) {
    return "Există deja un cont cu acest email.";
  }
  if (lower.includes("email not confirmed")) {
    return "Confirmă adresa de email înainte de autentificare.";
  }
  if (lower.includes("jwt") || lower.includes("session")) {
    return "Sesiunea a expirat. Autentifică-te din nou.";
  }
  if (lower.includes("row-level security") || lower.includes("permission")) {
    return "Nu ai permisiunea pentru această acțiune.";
  }
  if (lower.includes("duplicate key")) {
    return "Înregistrarea există deja.";
  }
  if (lower.includes("network") || lower.includes("fetch")) {
    return "Nu se poate contacta Supabase. Verifică NEXT_PUBLIC_SUPABASE_URL în .env.local (trebuie să fie https://xxx.supabase.co, nu linkul din browser). Repornește npm run dev după modificare.";
  }

  return msg || fallback;
}

export function safeRedirectPath(path: string | null): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return "/dashboard";
  }
  return path;
}
