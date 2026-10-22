import { NextResponse } from "next/server";
import { getUsuario } from "@/lib/supabase-server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getMetaTemplate } from "@/lib/templates";
import { ejecutarEnvio } from "@/lib/envio";
import { segmentar, estadoMotor } from "@/lib/motor";
import { getVertical } from "@/lib/verticals";
import type { Client, Workspace } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * POST /api/whatsapp/send
 * Envía una plantilla aprobada a los clientes de un espacio de trabajo.
 * Body: { workspaceId, templateName, clientIds?, segmento?, maximo?, simulacion?,
 *         fecha?, hora?, oferta?, enlace?, negocio? }
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
  const templateName = String(body.templateName ?? "").trim();

  if (!workspaceId) return NextResponse.json({ error: "Falta el cliente (workspace)" }, { status: 400 });

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

  const estado = estadoMotor(espacio);
  if (!estado.configurado) {
    return NextResponse.json(
      {
        error:
          "Faltan las credenciales de WhatsApp Business de este cliente. Ve a la pestaña Motor y guárdalas.",
      },
      { status: 400 },
    );
  }

  // Segmento de clientes
  const clientIds = Array.isArray(body.clientIds) ? (body.clientIds as string[]) : null;
  let query = admin.from("clients").select("*").eq("workspace_id", workspaceId);
  if (clientIds && clientIds.length > 0) query = query.in("id", clientIds);
  const { data: clientesRaw, error: errCli } = await query;
  if (errCli) return NextResponse.json({ error: errCli.message }, { status: 500 });

  let clientes = (clientesRaw ?? []) as Client[];
  const segmento = body.segmento === "todos" ? "todos" : "dormidos";
  if (!clientIds || clientIds.length === 0) clientes = segmentar(clientes, segmento);

  if (clientes.length === 0) {
    return NextResponse.json({ error: "No hay clientes en ese segmento" }, { status: 400 });
  }

  const vertical = getVertical(espacio.vertical);
  const resumen = await ejecutarEnvio({
    admin,
    ws: espacio,
    tpl,
    clientes,
    maximo: Number(body.maximo ?? 100),
    simulacion: Boolean(body.simulacion),
    datos: {
      negocio: String(body.negocio ?? espacio.name ?? "tu negocio"),
      servicioPorDefecto: vertical.servicio,
      fecha: body.fecha ? String(body.fecha) : undefined,
      hora: body.hora ? String(body.hora) : undefined,
      oferta: body.oferta ? String(body.oferta) : undefined,
      enlace: body.enlace ? String(body.enlace) : undefined,
    },
  });

  return NextResponse.json({ ok: true, ...resumen });
}
