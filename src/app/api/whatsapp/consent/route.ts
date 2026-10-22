import { NextResponse } from "next/server";
import { getUsuario } from "@/lib/supabase-server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

/**
 * POST /api/whatsapp/consent
 * Body: { clientIds: string[], consent: boolean, source?: string }
 * Registra (o revoca) el consentimiento de marketing de los contactos.
 */
export async function POST(req: Request) {
  const user = await getUsuario();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: "Supabase no configurado" }, { status: 500 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Datos no válidos" }, { status: 400 });
  }

  const ids = Array.isArray(body.clientIds) ? (body.clientIds as string[]).filter(Boolean) : [];
  if (ids.length === 0) return NextResponse.json({ error: "No hay contactos seleccionados" }, { status: 400 });

  const consent = body.consent !== false;
  const source = String(body.source ?? "panel");

  // Solo se pueden tocar contactos de espacios de trabajo del usuario.
  const { data: wss } = await admin.from("workspaces").select("id").eq("user_id", user.id);
  const wsIds = (wss ?? []).map((w: { id: string }) => w.id);

  const { data: clientes, error: errCli } = await admin
    .from("clients")
    .select("id, workspace_id")
    .in("id", ids)
    .in("workspace_id", wsIds.length ? wsIds : ["00000000-0000-0000-0000-000000000000"]);

  if (errCli) return NextResponse.json({ error: errCli.message }, { status: 500 });

  const permitidos = (clientes ?? []).map((c: { id: string }) => c.id);
  if (permitidos.length === 0) return NextResponse.json({ error: "Ninguno de esos contactos es tuyo" }, { status: 403 });

  const patch: Record<string, unknown> = { wa_consent: consent };
  if (consent) {
    patch.wa_consent_at = new Date().toISOString();
    patch.wa_consent_source = source;
  } else {
    patch.wa_consent_at = null;
    patch.wa_consent_source = null;
  }

  const { error } = await admin.from("clients").update(patch).in("id", permitidos);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, actualizados: permitidos.length });
}
