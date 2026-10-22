export type Vars = {
  nombre: string;
  negocio: string;
  servicio: string;
  fecha: string;
  hora: string;
  meses: number;
  oferta: string;
};

export type TemplateId =
  | "reactivar"
  | "recordatorio"
  | "confirmacion"
  | "lista_espera"
  | "oferta"
  | "resena";

export type MessageTemplate = {
  id: TemplateId;
  label: string;
  descripcion: string;
  texto: (v: Vars) => string;
};

export type Vertical = {
  id: string;
  nombre: string;
  ejemplos: string;
  ticket: number;
  noShow: number;
  dormidos: number;
  donde: string[];
  servicio: string;
  servicioPlural: string;
  plantillas: MessageTemplate[];
};

export type LeadStatus =
  | "nuevo"
  | "contactado"
  | "propuesta"
  | "cerrado"
  | "perdido";

export type Lead = {
  id: string;
  user_id: string | null;
  created_at: string;
  name: string | null;
  business: string | null;
  email: string | null;
  phone: string | null;
  vertical: string | null;
  clients_count: number | null;
  ticket: number | null;
  message: string | null;
  status: LeadStatus;
  notes: string | null;
  source: string | null;
};

export type Workspace = {
  id: string;
  user_id: string;
  created_at: string;
  name: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  vertical: string;
  ticket: number | null;
  no_show_pct: number | null;
  dormant_pct: number | null;
  notes: string | null;
  status: string;
  /** Motor de WhatsApp: credenciales del propio cliente del servicio. */
  wa_phone_number_id: string | null;
  wa_token: string | null;
  wa_daily_limit: number | null;
  wa_auto: boolean | null;
};

export type Client = {
  id: string;
  user_id: string;
  workspace_id: string | null;
  created_at: string;
  name: string;
  phone: string;
  last_visit: string | null;
  service: string | null;
  ticket: number | null;
  notes: string | null;
  status: string;
  /** Consentimiento de marketing registrado (obligatorio para plantillas MARKETING). */
  wa_consent: boolean | null;
  wa_consent_at: string | null;
  wa_consent_source: string | null;
};

export type Activity = {
  id: string;
  user_id: string;
  workspace_id: string | null;
  created_at: string;
  client_id: string | null;
  kind: "envio" | "respuesta" | "cita" | "resena" | "baja";
  template: string | null;
  amount: number | null;
  note: string | null;
};
