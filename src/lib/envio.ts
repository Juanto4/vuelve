import type { SupabaseClient } from "@supabase/supabase-js";
import type { MetaTemplate } from "./templates";
import { enviarPlantilla, explicarError } from "./whatsapp";
import { construirDatos, limiteDiario, nombreCorto } from "./motor";
import type { Client, Workspace } from "./types";

export type ResultadoEnvio = {
  cliente_id: string;
  nombre: string;
  telefono: string;
  ok: boolean;
  motivo?: "sin_consentimiento" | "sin_telefono" | "limite_diario" | "simulacion";
  error?: string;
  codigo?: string;
  id?: string;
};

export type ResumenEnvio = {
  enviados: number;
  omitidos: number;
  errores: number;
  resultados: ResultadoEnvio[];
};

/** Pausa entre envíos: evita que la API de Meta nos throttle o nos penalice calidad. */
const PAUSA_MS = 900;

const dormir = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Envíos ya registrados hoy para ese espacio de trabajo. */
export async function enviosDeHoy(admin: SupabaseClient, workspaceId: string): Promise<number> {
  const inicio = new Date();
  inicio.setHours(0, 0, 0, 0);
  const { count } = await admin
    .from("activities")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .eq("kind", "envio")
    .gte("created_at", inicio.toISOString());
  return count ?? 0;
}

/**
 * Envía una plantilla a una lista de clientes respetando:
 *  - consentimiento de marketing (obligatorio en plantillas MARKETING),
 *  - límite diario de envíos (protege la calidad del número ante Meta),
 *  - registro de cada envío en `activities`.
 */
export async function ejecutarEnvio(opts: {
  admin: SupabaseClient;
  ws: Workspace;
  tpl: MetaTemplate;
  clientes: Client[];
  maximo?: number;
  simulacion?: boolean;
  datos: {
    negocio: string;
    servicioPorDefecto: string;
    fecha?: string;
    hora?: string;
    oferta?: string;
    enlace?: string;
  };
}): Promise<ResumenEnvio> {
  const { admin, ws, tpl, clientes, simulacion = false, datos } = opts;

  const limite = limiteDiario(ws);
  const usados = await enviosDeHoy(admin, ws.id);
  let restantes = Math.max(0, limite - usados);
  const tope = Math.min(restantes, opts.maximo ?? 100);

  const resultados: ResultadoEnvio[] = [];
  let enviados = 0;
  let omitidos = 0;
  let errores = 0;

  for (const c of clientes) {
    if (enviados + omitidos + errores >= tope) {
      resultados.push({
        cliente_id: c.id,
        nombre: c.name,
        telefono: c.phone,
        ok: false,
        motivo: "limite_diario",
        error: `Límite diario alcanzado (${limite}/día)`,
      });
      omitidos++;
      continue;
    }

    if (tpl.requiere_consentimiento && !c.wa_consent) {
      resultados.push({
        cliente_id: c.id,
        nombre: c.name,
        telefono: c.phone,
        ok: false,
        motivo: "sin_consentimiento",
        error: "Sin consentimiento de marketing registrado",
      });
      omitidos++;
      continue;
    }

    const telefono = (c.phone || "").replace(/\D/g, "");
    if (telefono.length < 10) {
      resultados.push({
        cliente_id: c.id,
        nombre: c.name,
        telefono: c.phone,
        ok: false,
        motivo: "sin_telefono",
        error: "Teléfono no válido",
      });
      omitidos++;
      continue;
    }

    const valores = construirDatos({ cliente: c, ...datos });

    if (simulacion) {
      resultados.push({
        cliente_id: c.id,
        nombre: c.name,
        telefono: c.phone,
        ok: true,
        motivo: "simulacion",
        id: "simulacion",
      });
      enviados++;
      continue;
    }

    const res = await enviarPlantilla(
      {
        phoneNumberId: ws.wa_phone_number_id ?? process.env.WHATSAPP_PHONE_NUMBER_ID ?? "",
        token: ws.wa_token ?? process.env.WHATSAPP_TOKEN ?? "",
      },
      telefono,
      tpl,
      valores,
    );

    if (res.ok) {
      enviados++;
      resultados.push({ cliente_id: c.id, nombre: c.name, telefono: c.phone, ok: true, id: res.id });
      await admin.from("activities").insert({
        user_id: ws.user_id,
        workspace_id: ws.id,
        client_id: c.id,
        kind: "envio",
        template: tpl.name,
        amount: 0,
        note: `${nombreCorto(c.name)} · ${tpl.label}`,
      });
    } else {
      errores++;
      const explicacion = explicarError(res.codigo);
      resultados.push({
        cliente_id: c.id,
        nombre: c.name,
        telefono: c.phone,
        ok: false,
        error: explicacion ? `${res.error} — ${explicacion}` : res.error,
        codigo: res.codigo,
      });
    }

    await dormir(PAUSA_MS);
  }

  return { enviados, omitidos, errores, resultados };
}
