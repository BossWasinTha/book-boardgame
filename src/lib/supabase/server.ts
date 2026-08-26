import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Service-role client for use in route handlers only. Bypasses RLS —
 * never import this into client components.
 */
export function supabaseAdmin() {
  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { persistSession: false },
  });
}
