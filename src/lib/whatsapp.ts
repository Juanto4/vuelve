import { buildParameters, type MetaTemplate } from "./templates";

export type WaConfig = {
  phoneNumberId: string;
  token: string;
  apiVersion?: string;
};

export type WaResult = {
  ok: boolean;
  id?: string;
  error?: string;
  codigo?: string;
};

/**
 * Envia una plantilla aprobada por WhatsApp Business Cloud API.
 * Docs: https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages
 */
export async function enviarPlantilla(
  cfg: WaConfig,
  to: string,
  tpl: MetaTemplate,
  datos: Record<string, string | number>,
): Promise<WaResult> {
  if (!cfg.phoneNumberId || !cfg.token) {
    return { ok: false, error: "Faltan credenciales de WhatsApp Business" };
  }
  const telefono = to.replace(/[^\d]/g, "");
  if (telefono.length < 10) {
    return { ok: false, error: "Telefono no valido" };
  }

  const version = cfg.apiVersion ?? "v21.0";
  const url = `https://graph.facebook.com/${version}/${cfg.phoneNumberId}/messages`;

  const body = {
    messaging_product: "whatsapp",
    to: telefono,
    type: "template",
    template: {
      name: tpl.name,
      language: { code: "es" },
      components: [
        {
          type: "body",
          parameters: buildParameters(tpl, datos),
        },
      ],
    },
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfg.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      const err = json?.error ?? {};
      return {
        ok: false,
        error: err?.error_user_msg ?? err?.message ?? `Error ${res.status} de la API de WhatsApp`,
        codigo: err?.code ? String(err.code) : undefined,
      };
    }

    return { ok: true, id: json?.messages?.[0]?.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Error de red" };
  }
}

/**
 * Errores frecuentes de la API de WhatsApp y que hacer:
 *  131047 -> mensaje fuera de la ventana de 24 h sin plantilla: usa plantilla aprobada.
 *  131009 -> el numero de parametros no coincide con la plantilla.
 *  131051 -> tipo de mensaje no soportado.
 *  132001 -> la plantilla no existe en tu cuenta o no esta aprobada.
 *  47002 -> fuera de la ventana de 24 h y sin plantilla.
 *  131047/131048 -> el usuario no ha dado consentimiento de marketing.
 */
export const ERRORES_WA: Record<string, string> = {
  "131009": "La plantilla espera mas (o menos) parametros de los que le estas pasando. Revisa el orden.",
  "131047": "WhatsApp no permite ese mensaje fuera de la ventana de 24 h o sin consentimiento de marketing.",
  "131051": "Tipo de mensaje no soportado en esta plantilla.",
  "132001": "La plantilla no existe en tu cuenta de WhatsApp o aun no esta aprobada.",
  "132007": "Has superado el limite de plantillas de la categoria. Revisa el estado de calidad.",
  "47002": "El contacto no te ha escrito en las ultimas 24 h: usa una plantilla aprobada.",
  "131052": "El numero de telefono no es valido para WhatsApp.",
};

export function explicarError(codigo?: string): string {
  if (!codigo) return "";
  return ERRORES_WA[codigo] ?? "";
}
