/**
 * Plantillas de WhatsApp Business API (formato de Meta).
 *
 * Reglas para que Meta las apruebe:
 *  - El texto con {{1}}, {{2}}... debe ser EXACTAMENTE el que copias en el gestor de plantillas.
 *  - Los parámetros se rellenan en el mismo orden.
 *  - Categoría UTILITY = transaccional (citas, presupuestos, recordatorios de servicio).
 *    Categoría MARKETING = promocional (requiere consentimiento de marketing registrado).
 *  - Sin emojis en el cuerpo (Meta las rechaza con frecuencia).
 *  - Los textos de utilidad fuera de la ventana de 24 h también necesitan plantilla aprobada.
 */

export type TipoParametro = {
  n: number;
  key:
    | "nombre"
    | "negocio"
    | "meses"
    | "servicio"
    | "fecha"
    | "hora"
    | "oferta"
    | "enlace";
  label: string;
};

export type MetaTemplate = {
  name: string;
  label: string;
  categoria: "MARKETING" | "UTILITY";
  descripcion: string;
  cuerpo: string;
  parametros: TipoParametro[];
  requiere_consentimiento?: boolean;
};

export const META_TEMPLATES: MetaTemplate[] = [
  {
    name: "reactivacion_cliente",
    label: "Reactivar cliente dormido",
    categoria: "MARKETING",
    descripcion: "Cliente que no llama desde hace meses. Necesita consentimiento de marketing.",
    requiere_consentimiento: true,
    cuerpo:
      "Hola {{1}}, hace {{2}} meses que no nos llamabas desde {{3}}. Queríamos saber como va tu instalacion y si sigue funcionando bien. Si te apetece, te preparamos la revision de mantenimiento. Te viene bien? Responde ALTO si no quieres recibir mas mensajes.",
    parametros: [
      { n: 1, key: "nombre", label: "Nombre del cliente" },
      { n: 2, key: "meses", label: "Meses sin llamar" },
      { n: 3, key: "negocio", label: "Nombre de tu negocio" },
    ],
  },
  {
    name: "revision_programada",
    label: "Revision recomendada",
    categoria: "UTILITY",
    descripcion: "Recordatorio de revision anual. Transaccional, no necesita consentimiento de marketing.",
    cuerpo:
      "Hola {{1}}, te recordamos que la revision de tu {{2}} es recomendable cada 12 meses. Te reservamos hueco esta semana?",
    parametros: [
      { n: 1, key: "nombre", label: "Nombre del cliente" },
      { n: 2, key: "servicio", label: "Equipo (caldera, aire acondicionado, placa solar)" },
    ],
  },
  {
    name: "confirmacion_cita",
    label: "Confirmacion de cita",
    categoria: "UTILITY",
    descripcion: "Se envia justo despues de agendar la revision.",
    cuerpo:
      "Hola {{1}}, tu cita para la revision de {{2}} queda confirmada el {{3}} a las {{4}}. Te esperamos. Si necesitas cambiarla, avisanos por aqui.",
    parametros: [
      { n: 1, key: "nombre", label: "Nombre del cliente" },
      { n: 2, key: "servicio", label: "Equipo" },
      { n: 3, key: "fecha", label: "Fecha" },
      { n: 4, key: "hora", label: "Hora" },
    ],
  },
  {
    name: "presupuesto_pendiente",
    label: "Presupuesto sin respuesta",
    categoria: "UTILITY",
    descripcion: "El cliente recibio un presupuesto y no contesto. Follow-up transaccional.",
    cuerpo:
      "Hola {{1}}, hace unos dias te enviamos el presupuesto para {{2}}. Queriamos saber si quieres que lo revisemos o si hay algo que ajustar. Te lo volvemos a enviar?",
    parametros: [
      { n: 1, key: "nombre", label: "Nombre del cliente" },
      { n: 2, key: "servicio", label: "Servicio presupuestado" },
    ],
  },
  {
    name: "hueco_liberado",
    label: "Hueco liberado",
    categoria: "UTILITY",
    descripcion: "Se ha liberado un hueco en la agenda y lo ofreces a la lista de espera.",
    cuerpo:
      "Hola {{1}}, se nos ha liberado un hueco para {{2}} el {{3}} a las {{4}}. Te viene bien? Dinoslo y lo reservamos.",
    parametros: [
      { n: 1, key: "nombre", label: "Nombre del cliente" },
      { n: 2, key: "servicio", label: "Equipo" },
      { n: 3, key: "fecha", label: "Fecha" },
      { n: 4, key: "hora", label: "Hora" },
    ],
  },
  {
    name: "solicitud_resena",
    label: "Peticion de resena",
    categoria: "MARKETING",
    descripcion: "Resenas de Google. Es la via mas barata de traer clientes nuevos al Google Maps.",
    requiere_consentimiento: true,
    cuerpo:
      "Hola {{1}}, gracias por confiar en {{2}}. Si tienes un minuto, nos ayudaria mucho una resena en Google: {{3}}. Gracias! Responde ALTO si no quieres recibir mas mensajes.",
    parametros: [
      { n: 1, key: "nombre", label: "Nombre del cliente" },
      { n: 2, key: "negocio", label: "Nombre de tu negocio" },
      { n: 3, key: "enlace", label: "Enlace de resena" },
    ],
  },
];

export function getMetaTemplate(name: string): MetaTemplate | undefined {
  return META_TEMPLATES.find((t) => t.name === name);
}

/** Construye el array de parametros que espera la Graph API. */
export function buildParameters(
  tpl: MetaTemplate,
  datos: Record<string, string | number>,
): { type: "text"; text: string }[] {
  return tpl.parametros.map((p) => ({
    type: "text" as const,
    text: String(datos[p.key] ?? "").slice(0, 1024),
  }));
}

/** Texto con los numeros de variable ya sustituidos (para leerlo de un vistazo). */
export function readableTemplate(tpl: MetaTemplate, ejemplo: Record<string, string | number>): string {
  return tpl.cuerpo.replace(/\{\{(\d+)\}\}/g, (_, n: string) => {
    const p = tpl.parametros.find((x) => x.n === Number(n));
    return p ? String(ejemplo[p.key] ?? `{${p.key}}`) : "";
  });
}
