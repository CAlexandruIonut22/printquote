import { createBrowserClient } from "@supabase/ssr";

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !key) {
    throw new Error(
      "Lipsesc NEXT_PUBLIC_SUPABASE_URL sau NEXT_PUBLIC_SUPABASE_ANON_KEY în .env.local"
    );
  }

  if (!url.includes(".supabase.co")) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL invalid — folosește https://PROIECTUL-TAU.supabase.co (din Settings → API)"
    );
  }

  return { url, key };
}

export function createClient() {
  const { url, key } = getSupabaseConfig();
  return createBrowserClient(url, key);
}
