import type { Activity, Client, Workspace } from "./types";
import { daysSince } from "./utils";

/**
 * Días sin actividad a partir de los cuales consideramos "cliente dormido".
 * 180 días: en el sector de la instalación el ciclo es largo (una caldera dura
 * 10-15 años), así que antes de escribir a alguien hay que tener margen.
 */
export const DORMIDO_DIAS = 180;

/** Límite diario por defecto si el cliente no lo configura (evita bloqueos de Meta). */
export const LIMITE_DIARIO_POR_DEFECTO = 80;

export type Segmento = "dormidos" | "todos";

export type DatosPlantilla = {
  nombre: string;
  negocio: string;
  meses: number;
  servicio: string;
  fecha: string;
  hora: string;
  oferta: string;
  enlace: string;
};

/** Primer nombre del cliente, sin apellidos (para que el mensaje suene cercano). */
export function nombreCorto(nombre: string): string {
  return (nombre || "").trim().split(/\s+/)[0] || "cliente";
}

/** Meses transcurridos desde la última visita (mínimo 1). */
export function mesesSinVolver(last_visit: string | null | undefined): number {
  return Math.max(1, Math.round(daysSince(last_visit) / 30));
}

/**
 * Construye los valores de los parámetros de una plantilla a partir de un
 * cliente concreto. El orden lo fija la plantilla (src/lib/templates.ts).
 */
export function construirDatos(opts: {
  cliente: Client;
  negocio: string;
  servicioPorDefecto: string;
  fecha?: string;
  hora?: string;
  oferta?: string;
  enlace?: string;
}): DatosPlantilla {
  const { cliente, servicioPorDefecto } = opts;
  return {
    nombre: nombreCorto(cliente.name),
    negocio: opts.negocio || "tu negocio",
    meses: mesesSinVolver(cliente.last_visit),
    servicio: cliente.service || servicioPorDefecto,
    fecha: opts.fecha || "la próxima semana",
    hora: opts.hora || "10:00",
    oferta: opts.oferta || "un 10% en el mantenimiento",
    enlace: opts.enlace || "https://g.page/r/tu-negocio",
  };
}

/** Filtra la cartera según el segmento elegido. */
export function segmentar(clients: Client[], segmento: Segmento): Client[] {
  if (segmento === "todos") return clients;
  return clients.filter((c) => daysSince(c.last_visit) >= DORMIDO_DIAS);
}

/** Límite de envíos por día configurado para el espacio de trabajo. */
export function limiteDiario(ws: Pick<Workspace, "wa_daily_limit"> | null | undefined): number {
  const n = Number(ws?.wa_daily_limit ?? 0);
  return Number.isFinite(n) && n > 0 ? Math.min(n, 1000) : LIMITE_DIARIO_POR_DEFECTO;
}

/** Envíos ya realizados hoy (cuenta los registros de tipo "envio"). */
export function enviosHoy(acts: Pick<Activity, "kind" | "created_at">[]): number {
  const inicio = new Date();
  inicio.setHours(0, 0, 0, 0);
  return acts.filter((a) => a.kind === "envio" && new Date(a.created_at).getTime() >= inicio.getTime()).length;
}

/** Nunca devolvemos el token entero: solo los últimos 4 caracteres. */
export function enmascararToken(token: string | null | undefined): string {
  if (!token) return "";
  if (token.length <= 4) return "••••";
  return `••••${token.slice(-4)}`;
}

export type EstadoMotor = {
  configurado: boolean;
  origen: "cliente" | "servidor" | "ninguno";
  phoneNumberId: string | null;
  tokenEnmascarado: string;
  limite: number;
  usadosHoy: number;
  restantes: number;
};

/** Estado del motor de un espacio de trabajo. */
export function estadoMotor(
  ws: (Workspace & { wa_token?: string | null }) | null | undefined,
  acts: Pick<Activity, "kind" | "created_at">[] = [],
): EstadoMotor {
  const usados = enviosHoy(acts);
  const limite = limiteDiario(ws);
  const tokenCliente = ws?.wa_token ?? "";
  const tokenServidor = process.env.WHATSAPP_TOKEN ?? "";
  const phoneCliente = ws?.wa_phone_number_id ?? "";
  const phoneServidor = process.env.WHATSAPP_PHONE_NUMBER_ID ?? "";

  if (tokenCliente && phoneCliente) {
    return {
      configurado: true,
      origen: "cliente",
      phoneNumberId: phoneCliente,
      tokenEnmascarado: enmascararToken(tokenCliente),
      limite,
      usadosHoy: usados,
      restantes: Math.max(0, limite - usados),
    };
  }
  if (tokenServidor && phoneServidor) {
    return {
      configurado: true,
      origen: "servidor",
      phoneNumberId: phoneServidor,
      tokenEnmascarado: enmascararToken(tokenServidor),
      limite,
      usadosHoy: usados,
      restantes: Math.max(0, limite - usados),
    };
  }
  return {
    configurado: false,
    origen: "ninguno",
    phoneNumberId: null,
    tokenEnmascarado: "",
    limite,
    usadosHoy: usados,
    restantes: limite,
  };
}
