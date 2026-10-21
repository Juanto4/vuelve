import { createClient } from "@supabase/supabase-js";

/**
 * Cliente con service_role: SOLO servidor (route handlers).
 * Nunca importarlo desde un componente de cliente.
 */
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}
