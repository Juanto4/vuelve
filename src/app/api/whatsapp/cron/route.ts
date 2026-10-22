import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getMetaTemplate } from "@/lib/templates";
import { ejecutarEnvio } from "@/lib/envio";
import { estadoMotor, segmentar } from "@/lib/motor";
import { getVertical } from "@/lib/verticals";
import type { Client, Workspace } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Campaña programada: envía la plantilla de reactivación a los clientes
 * dormidos de los espacios de trabajo marcados como automáticos.
 *
 * Se puede llamar desde:
 *  - Vercel Cron (vercel.json): GET con cabecera `Authorization: Bearer <CRON_SECRET>`,
 *  - n8n (en la infraestructura del cliente): POST con cabecera `x-cron-key`,
 *  - a mano: POST con `x-cron-key`.
 */
async function correr(secret: string | null, templateName: string) {
  if (!secret) {
    return NextResponse.json(
      { error: "Define CRON_SECRET para poder lanzar campañas automáticas" },
      { status: 500 },
    );
  }
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Clave incorrecta" }, { status: 401 });
  }

  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: "Supabase no configurado" }, { status: 500 });

  const tpl = getMetaTemplate(templateName);
  if (!tpl) return NextResponse.json({ error: `Plantilla desconocida: ${templateName}` }, { status: 400 });

  const { data: wsRaw, error } = await admin.from("workspaces").select("*").eq("wa_auto", true);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const workspaces = (wsRaw ?? []) as Workspace[];
  const resumen: Record<string, unknown>[] = [];

  for (const ws of workspaces) {
    const estado = estadoMotor(ws);
    if (!estado.configurado) {
      resumen.push({ cliente: ws.name, saltado: "sin credenciales" });
      continue;
    }
    if (estado.restantes <= 0) {
      resumen.push({ cliente: ws.name, saltado: "límite diario alcanzado" });
      continue;
    }

    const { data: clientesRaw } = await admin.from("clients").select("*").eq("workspace_id", ws.id);
    const clientes = segmentar((clientesRaw ?? []) as Client[], "dormidos");
    const vertical = getVertical(ws.vertical);

    const r = await ejecutarEnvio({
      admin,
      ws,
      tpl,
      clientes,
      maximo: estado.restantes,
      datos: {
        negocio: ws.name ?? "tu negocio",
        servicioPorDefecto: vertical.servicio,
      },
    });

    resumen.push({
      cliente: ws.name,
      enviados: r.enviados,
      omitidos: r.omitidos,
      errores: r.errores,
    });
  }

  return NextResponse.json({ ok: true, campanas: resumen });
}

/** GET: lo usa Vercel Cron (envía `Authorization: Bearer <CRON_SECRET>`). */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  const secret = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  const templateName = new URL(req.url).searchParams.get("template") ?? "reactivacion_cliente";
  return correr(secret, templateName);
}

/** POST: lo usa n8n o una llamada manual (cabecera `x-cron-key`). */
export async function POST(req: Request) {
  const secret = req.headers.get("x-cron-key");
  const templateName = new URL(req.url).searchParams.get("template") ?? "reactivacion_cliente";
  return correr(secret, templateName);
}
