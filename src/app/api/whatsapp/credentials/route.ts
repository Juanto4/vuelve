import { NextResponse } from "next/server";
import { getUsuario } from "@/lib/supabase-server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { estadoMotor, limiteDiario } from "@/lib/motor";
import type { Workspace } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * POST /api/whatsapp/credentials
 * Guarda las credenciales de WhatsApp Business de un cliente del servicio.
 * Se guardan en la fila de su espacio de trabajo y NUNCA se devuelven
 * al navegador (solo enmascaradas).
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

  const workspaceId = String(body.workspaceId ?? "").trim();
  if (!workspaceId) return NextResponse.json({ error: "Falta el espacio de trabajo" }, { status: 400 });

  const { data: ws, error: errWs } = await admin
    .from("workspaces")
    .select("*")
    .eq("id", workspaceId)
    .eq("user_id", user.id)
    .single();

  if (errWs || !ws) {
    return NextResponse.json({ error: "Ese cliente no es tuyo" }, { status: 403 });
  }

  const actual = ws as Workspace;
  const patch: Record<string, unknown> = {};

  const phone = String(body.phoneNumberId ?? "").trim();
  if (phone) patch.wa_phone_number_id = phone;

  // Token: si viene vacío es que quieres borrar el que había.
  if (typeof body.token === "string") {
    const token = body.token.trim();
    if (token) patch.wa_token = token;
    else patch.wa_token = null;
  }

  if (body.dailyLimit !== undefined && body.dailyLimit !== null && body.dailyLimit !== "") {
    patch.wa_daily_limit = Math.max(1, Math.min(1000, Number(body.dailyLimit) || 80));
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No hay nada que guardar" }, { status: 400 });
  }

  const { error } = await admin.from("workspaces").update(patch).eq("id", workspaceId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: actualizado } = await admin.from("workspaces").select("*").eq("id", workspaceId).single();

  return NextResponse.json({
    ok: true,
    estado: estadoMotor(actualizado as Workspace),
    limite: limiteDiario(actualizado as Workspace),
  });
}

/** DELETE /api/whatsapp/credentials?workspaceId=xxx → borra las credenciales. */
export async function DELETE(req: Request) {
  const user = await getUsuario();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: "Supabase no configurado" }, { status: 500 });

  const workspaceId = new URL(req.url).searchParams.get("workspaceId");
  if (!workspaceId) return NextResponse.json({ error: "Falta el espacio de trabajo" }, { status: 400 });

  const { error } = await admin
    .from("workspaces")
    .update({ wa_token: null, wa_phone_number_id: null })
    .eq("id", workspaceId)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
