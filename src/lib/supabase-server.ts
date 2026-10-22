import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * Cliente de Supabase para el servidor, usando la cookie de sesión.
 * Permite comprobar quién está autenticado sin exposing la service_role.
 */
export async function getSupabaseSesion() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const store = await cookies();
  return createClient(url, key, {
    global: { headers: { cookie: store.toString() } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Usuario autenticado (o null). */
export async function getUsuario() {
  const sb = await getSupabaseSesion();
  if (!sb) return null;
  const { data, error } = await sb.auth.getUser();
  if (error) return null;
  return data.user ?? null;
}
