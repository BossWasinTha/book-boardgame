"use client";
import { createClient } from "@supabase/supabase-js";

let browserClient: ReturnType<typeof createClient> | null = null;

/**
 * Anon-key client for client components. Read-only by RLS policy —
 * used for Realtime subscriptions and public catalog reads.
 */
export function supabaseBrowser() {
  if (!browserClient) {
    browserClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  }
  return browserClient;
}
