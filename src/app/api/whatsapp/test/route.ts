import { NextResponse } from "next/server";
import { getUsuario } from "@/lib/supabase-server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getMetaTemplate, readableTemplate } from "@/lib/templates";
import { enviarPlantilla, explicarError } from "@/lib/whatsapp";
import { construirDatos } from "@/lib/motor";
import { getVertical } from "@/lib/verticals";
import type { Client, Workspace } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * POST /api/whatsapp/test
 * Manda una plantilla a un número (normalmente el tuyo) para comprobar
 * que las credenciales y la plantilla funcionan.
 * Body: { workspaceId, phone, templateName }
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
  const phone = String(body.phone ?? "").trim();
  const templateName = String(body.templateName ?? "revision_programada");

  if (!workspaceId || !phone) {
    return NextResponse.json({ error: "Faltan el cliente y el teléfono" }, { status: 400 });
  }

  const tpl = getMetaTemplate(templateName);
  if (!tpl) return NextResponse.json({ error: `Plantilla desconocida: ${templateName}` }, { status: 400 });

  const { data: ws, error: errWs } = await admin
    .from("workspaces")
    .select("*")
    .eq("id", workspaceId)
    .eq("user_id", user.id)
    .single();

  if (errWs || !ws) return NextResponse.json({ error: "Ese cliente no es tuyo" }, { status: 403 });
  const espacio = ws as Workspace;

  const phoneNumberId = espacio.wa_phone_number_id ?? process.env.WHATSAPP_PHONE_NUMBER_ID ?? "";
  const token = espacio.wa_token ?? process.env.WHATSAPP_TOKEN ?? "";
  if (!phoneNumberId || !token) {
    return NextResponse.json({ error: "Faltan las credenciales de WhatsApp Business" }, { status: 400 });
  }

  const vertical = getVertical(espacio.vertical);
  const falsoCliente: Client = {
    id: "test",
    user_id: user.id,
    workspace_id: workspaceId,
    created_at: new Date().toISOString(),
    name: "Prueba",
    phone,
    last_visit: null,
    service: null,
    ticket: null,
    notes: null,
    status: "activo",
    wa_consent: true,
    wa_consent_at: null,
    wa_consent_source: null,
  };

  const datos = construirDatos({
    cliente: falsoCliente,
    negocio: espacio.name ?? "tu negocio",
    servicioPorDefecto: vertical.servicio,
    fecha: "próxima semana",
    hora: "10:00",
    oferta: "un 10% en el mantenimiento",
    enlace: "https://g.page/r/tu-negocio",
  });

  const res = await enviarPlantilla({ phoneNumberId, token }, phone, tpl, datos);

  if (!res.ok) {
    return NextResponse.json(
      { ok: false, error: res.error, codigo: res.codigo, explicacion: explicarError(res.codigo) },
      { status: 400 },
    );
  }

  return NextResponse.json({
    ok: true,
    id: res.id,
    mensaje: readableTemplate(tpl, datos),
  });
}
