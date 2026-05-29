import { createClient } from "@supabase/supabase-js";
import type { PublicQuote } from "@/lib/public-quote";
import { parsePublicQuote } from "@/lib/public-quote";

/** Anon client for public RPC only — no cookies/session */
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function fetchPublicQuoteByToken(
  token: string
): Promise<PublicQuote | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase.rpc("get_public_quote", {
    p_token: token,
  });

  if (error || data == null) {
    return null;
  }

  return parsePublicQuote(data);
}
