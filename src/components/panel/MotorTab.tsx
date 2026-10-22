"use client";

import { useEffect, useMemo, useState } from "react";
import { META_TEMPLATES, readableTemplate, type MetaTemplate } from "@/lib/templates";
import { construirDatos, estadoMotor, segmentar, type Segmento } from "@/lib/motor";
import { getVertical } from "@/lib/verticals";
import { daysSince, fmtDate } from "@/lib/utils";
import type { Activity, Client, Workspace } from "@/lib/types";

type Resultado = {
  cliente_id: string;
  nombre: string;
  ok: boolean;
  error?: string;
  motivo?: string;
};

type Estado = {
  configurado: boolean;
  origen: "cliente" | "servidor" | "ninguno";
  phoneNumberId: string | null;
  tokenEnmascarado: string;
  limite: number;
  usadosHoy: number;
  restantes: number;
};

export default function MotorTab({
  ws,
  clients,
  acts,
  recargar,
}: {
  ws: Workspace | null;
  clients: Client[];
  acts: Activity[];
  recargar: () => Promise<void>;
}) {
  const [estado, setEstado] = useState<Estado | null>(null);
  const [phoneId, setPhoneId] = useState("");
  const [token, setToken] = useState("");
  const [limite, setLimite] = useState("80");
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  const [tplNombre, setTplNombre] = useState(META_TEMPLATES[0].name);
  const [segmento, setSegmento] = useState<Segmento>("dormidos");
  const [maximo, setMaximo] = useState("50");
  const [negocio, setNegocio] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("10:00");
  const [oferta, setOferta] = useState("un 10% en el mantenimiento");
  const [enlace, setEnlace] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [resultados, setResultados] = useState<Resultado[] | null>(null);
  const [resumen, setResumen] = useState<string | null>(null);
  const [telTest, setTelTest] = useState("");
  const [probando, setProbando] = useState(false);

  const tpl = useMemo(() => META_TEMPLATES.find((t) => t.name === tplNombre) ?? META_TEMPLATES[0], [tplNombre]);

  // Estado local (el panel ya tiene los datos: no hace falta pedirlo al servidor)
  useEffect(() => {
    if (!ws) {
      setEstado(null);
      return;
    }
    setEstado(estadoMotor(ws, acts));
    setPhoneId(ws.wa_phone_number_id ?? "");
    setLimite(String(ws.wa_daily_limit ?? 80));
    setNegocio(ws.name ?? "");
  }, [ws, acts]);

  const objetivo = useMemo(() => segmentar(clients, segmento), [clients, segmento]);

  async function guardarCredenciales() {
    if (!ws) return;
    setGuardando(true);
    setAviso(null);
    try {
      const res = await fetch("/api/whatsapp/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: ws.id,
          phoneNumberId: phoneId.trim(),
          token: token.trim(),
          dailyLimit: Number(limite) || 80,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setAviso(json.error ?? "No se pudo guardar");
      } else {
        setToken("");
        setEstado(json.estado);
        setAviso("Credenciales guardadas. Ya puedes probar el envío.");
      }
    } catch {
      setAviso("Error de red al guardar");
    }
    setGuardando(false);
  }

  async function probar() {
    if (!ws) return;
    setProbando(true);
    setAviso(null);
    try {
      const res = await fetch("/api/whatsapp/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: ws.id,
          phone: telTest.trim(),
          templateName: tplNombre,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setAviso(`${json.error ?? "Error"}${json.explicacion ? ` — ${json.explicacion}` : ""}`);
      } else {
        setAviso(`Mensaje de prueba enviado a ${telTest}. Revisa el WhatsApp del cliente.`);
      }
    } catch {
      setAviso("Error de red en el envío de prueba");
    }
    setProbando(false);
  }

  async function enviar(simulacion: boolean) {
    if (!ws) return;
    setEnviando(true);
    setResultados(null);
    setResumen(null);
    try {
      const res = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: ws.id,
          templateName: tplNombre,
          segmento,
          maximo: Number(maximo) || 50,
          simulacion,
          negocio,
          fecha: fecha || undefined,
          hora,
          oferta,
          enlace: enlace || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setAviso(json.error ?? "No se pudo enviar");
      } else {
        setResultados(json.resultados ?? []);
        setResumen(
          `${simulacion ? "Simulación" : "Enviados"}: ${json.enviados} · omitidos: ${json.omitidos} · errores: ${json.errores}`,
        );
      }
    } catch {
      setAviso("Error de red en el envío");
    }
    setEnviando(false);
  }

  if (!ws) {
    return (
      <div className="card p-6">
        <h2 className="text-lg font-bold text-ink">Motor de WhatsApp</h2>
        <p className="mt-2 text-sm text-muted">
          Selecciona un cliente arriba para configurar sus credenciales de WhatsApp Business y lanzar campañas.
        </p>
      </div>
    );
  }

  const vertical = getVertical(ws.vertical);

  return (
    <div className="space-y-6">
      {/* ── ESTADO ───────────────────────────────────────── */}
      <div className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-ink">Motor de WhatsApp Business</h2>
            <p className="text-sm text-muted">
              Cliente: <b className="text-ink">{ws.name}</b> · {vertical.nombre}
            </p>
          </div>
          <span
            className={`pill ${
              estado?.configurado ? "bg-brand-50 text-brand-700" : "bg-amber-50 text-amber-700"
            }`}
          >
            {estado?.configurado
              ? `Conectado (${estado.origen === "cliente" ? "credenciales del cliente" : "credenciales del servidor"})`
              : "Sin credenciales"}
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <div className="rounded-xl bg-soft p-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Enviados hoy</p>
            <p className="mt-1 text-xl font-black text-ink">
              {estado?.usadosHoy ?? 0}
              <span className="text-sm font-semibold text-muted"> / {estado?.limite ?? 80}</span>
            </p>
          </div>
          <div className="rounded-xl bg-soft p-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Restantes hoy</p>
            <p className="mt-1 text-xl font-black text-ink">{estado?.restantes ?? 0}</p>
          </div>
          <div className="rounded-xl bg-soft p-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Phone number ID</p>
            <p className="mt-1 truncate text-xs font-semibold text-ink">
              {estado?.phoneNumberId ?? "—"}
            </p>
          </div>
          <div className="rounded-xl bg-soft p-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Token</p>
            <p className="mt-1 text-xs font-semibold text-ink">{estado?.tokenEnmascarado || "—"}</p>
          </div>
        </div>

        {aviso && (
          <p className="mt-4 rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-700">{aviso}</p>
        )}
      </div>

      {/* ── PASO 1: CREDENCIALES ─────────────────────────── */}
      <div className="card p-5">
        <p className="text-sm font-bold text-ink">Paso 1 · Credenciales del cliente</p>
        <p className="mt-1 text-xs text-muted">
          Cada cliente usa su propio número y su propio token (así el historial y el saldo son suyos). Se guardan
          cifrados en su ficha y no se muestran nunca completas.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div>
            <label className="label">Phone number ID</label>
            <input
              className="field"
              placeholder="123456789012345"
              value={phoneId}
              onChange={(e) => setPhoneId(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Token de acceso permanente</label>
            <input
              className="field"
              type="password"
              placeholder="EAAG... (deja vacío para no cambiarlo)"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Límite de envíos por día</label>
            <input
              className="field"
              type="number"
              min={1}
              max={1000}
              value={limite}
              onChange={(e) => setLimite(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button onClick={guardarCredenciales} disabled={guardando} className="btn btn-primary">
            {guardando ? "Guardando…" : "Guardar credenciales"}
          </button>
          <span className="text-xs text-muted">Guía paso a paso: <code>docs/MOTOR-WHATSAPP.md</code></span>
        </div>

        <div className="mt-5 rounded-xl border border-line p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-muted">Probar el envío</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <input
              className="field max-w-xs"
              placeholder="Tu móvil (600 000 000)"
              value={telTest}
              onChange={(e) => setTelTest(e.target.value)}
            />
            <button onClick={probar} disabled={probando || !telTest} className="btn btn-ghost">
              {probando ? "Enviando…" : "Enviar mensaje de prueba"}
            </button>
          </div>
          <p className="mt-2 text-xs text-muted">
            Se envía la plantilla seleccionada a ese número con datos de ejemplo. Si el número no está en tu cuenta
            de WhatsApp Business, la API lo rechaza.
          </p>
        </div>
      </div>

      {/* ── PASO 2: PLANTILLAS ───────────────────────────── */}
      <div className="card p-5">
        <p className="text-sm font-bold text-ink">Paso 2 · Plantillas aprobadas por Meta</p>
        <p className="mt-1 text-xs text-muted">
          Copia el cuerpo exacto en Meta Business → WhatsApp Manager → Plantillas de mensaje → Crear. Los parámetros
          <code> {"{{1}}"}</code>, <code>{"{{2}}"}</code>… se rellenan solos al enviar.
        </p>
        <div className="mt-4 space-y-3">
          {META_TEMPLATES.map((t) => (
            <PlantillaCard key={t.name} tpl={t} negocio={negocio || ws.name} />
          ))}
        </div>
      </div>

      {/* ── PASO 3: CAMPAÑA ──────────────────────────────── */}
      <div className="card p-5">
        <p className="text-sm font-bold text-ink">Paso 3 · Lanzar campaña</p>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <div>
            <label className="label">Plantilla</label>
            <select className="field" value={tplNombre} onChange={(e) => setTplNombre(e.target.value)}>
              {META_TEMPLATES.map((t) => (
                <option key={t.name} value={t.name}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Segmento</label>
            <select
              className="field"
              value={segmento}
              onChange={(e) => setSegmento(e.target.value as Segmento)}
            >
              <option value="dormidos">Dormidos 180+ días ({segmentar(clients, "dormidos").length})</option>
              <option value="todos">Todos ({clients.length})</option>
            </select>
          </div>
          <div>
            <label className="label">Máximo de envíos</label>
            <input
              className="field"
              type="number"
              min={1}
              max={500}
              value={maximo}
              onChange={(e) => setMaximo(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Nombre comercial</label>
            <input className="field" value={negocio} onChange={(e) => setNegocio(e.target.value)} />
          </div>
          <div>
            <label className="label">Fecha (para confirmaciones)</label>
            <input className="field" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </div>
          <div>
            <label className="label">Hora</label>
            <input className="field" value={hora} onChange={(e) => setHora(e.target.value)} />
          </div>
          <div>
            <label className="label">Incentivo</label>
            <input className="field" value={oferta} onChange={(e) => setOferta(e.target.value)} />
          </div>
          <div>
            <label className="label">Enlace de reseña</label>
            <input
              className="field"
              placeholder="https://g.page/r/tu-negocio"
              value={enlace}
              onChange={(e) => setEnlace(e.target.value)}
            />
          </div>
        </div>

        {tpl.requiere_consentimiento && (
          <p className="mt-3 rounded-lg bg-amber-50 px-4 py-3 text-xs text-amber-800">
            Esta plantilla es de categoría <b>MARKETING</b>: Meta solo permite enviarla a contactos que han dado
            consentimiento. El panel omite automáticamente a quien no lo tenga marcado.
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button onClick={() => enviar(true)} disabled={enviando} className="btn btn-ghost">
            Simular ({objetivo.length})
          </button>
          <button onClick={() => enviar(false)} disabled={enviando || !estado?.configurado} className="btn btn-primary">
            {enviando ? "Enviando…" : `Enviar a ${Math.min(objetivo.length, Number(maximo) || 50)} contactos`}
          </button>
          {resumen && <span className="text-xs font-semibold text-ink">{resumen}</span>}
        </div>

        {resultados && (
          <div className="mt-4 max-h-80 overflow-y-auto rounded-xl border border-line">
            <table className="data">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Resultado</th>
                </tr>
              </thead>
              <tbody>
                {resultados.map((r) => (
                  <tr key={r.cliente_id}>
                    <td className="font-semibold text-ink">{r.nombre}</td>
                    <td className={r.ok ? "text-brand-700" : "text-amber-700"}>
                      {r.ok ? "Enviado ✓" : r.error}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── PASO 4: n8n ──────────────────────────────────── */}
      <div className="card p-5">
        <p className="text-sm font-bold text-ink">Paso 4 · Automatización con n8n (opcional)</p>
        <p className="mt-1 text-xs text-muted">
          Si el cliente prefiere que la campaña viva en su propia infraestructura (su n8n, su número, su saldo),
          se le entrega el flujo ya montado. Descarga, importa y solo tiene que pegar sus credenciales.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {[
            {
              f: "/n8n/reactivacion-clientes.json",
              t: "Reactivación de dormidos",
              d: "Cada mes, filtra los clientes sin actividad, comprueba el consentimiento y envía la plantilla.",
            },
            {
              f: "/n8n/recordatorio-cita.json",
              t: "Recordatorio de cita",
              d: "Se dispara con un webhook (Google Calendar o tu agenda) 24 h antes de la visita.",
            },
            {
              f: "/n8n/solicitud-resena.json",
              t: "Petición de reseña",
              d: "Tras la visita, pide reseña en Google con el enlace del negocio.",
            },
          ].map((w) => (
            <div key={w.f} className="rounded-xl border border-line p-4">
              <p className="text-sm font-bold text-ink">{w.t}</p>
              <p className="mt-1 text-xs text-muted">{w.d}</p>
              <a href={w.f} download className="btn btn-ghost mt-3 px-3 py-2 text-xs">
                Descargar flujo
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* ── CONSENTIMIENTO ──────────────────────────────── */}
      <div className="card p-5">
        <p className="text-sm font-bold text-ink">Consentimiento de marketing (RGPD + Meta)</p>
        <p className="mt-1 text-xs text-muted">
          Marca aquí quién ha autorizado recibir mensajes comerciales. Es lo que te protege ante la AEPD y lo que
          Meta exige para las plantillas MARKETING.
        </p>
        <Consentimiento clients={clients} recargar={recargar} />
      </div>
    </div>
  );
}

/* ───────────────────────── PLANTILLA ───────────────────────── */

function PlantillaCard({ tpl, negocio }: { tpl: MetaTemplate; negocio: string }) {
  const [copiado, setCopiado] = useState(false);
  const ejemplo = useMemo(() => {
    const base: Record<string, string | number> = {
      nombre: "Lucía",
      negocio,
      meses: 8,
      servicio: "la caldera",
      fecha: "12 de junio",
      hora: "10:00",
      oferta: "un 10% en el mantenimiento",
      enlace: "https://g.page/r/tu-negocio",
    };
    return base;
  }, [negocio]);

  async function copiar() {
    await navigator.clipboard?.writeText(tpl.cuerpo);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1800);
  }

  return (
    <div className="rounded-xl border border-line p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-bold text-ink">{tpl.label}</p>
          <span
            className={`pill ${
              tpl.categoria === "UTILITY" ? "bg-slate-100 text-slate-700" : "bg-brand-50 text-brand-700"
            }`}
          >
            {tpl.categoria}
          </span>
          {tpl.requiere_consentimiento && (
            <span className="pill bg-amber-50 text-amber-700">requiere consentimiento</span>
          )}
        </div>
        <button onClick={copiar} className="btn btn-ghost px-3 py-1.5 text-xs">
          {copiado ? "Copiado ✓" : "Copiar cuerpo"}
        </button>
      </div>
      <p className="mt-1 text-xs text-muted">
        Nombre en Meta: <code>{tpl.name}</code> · idioma <code>es</code> · {tpl.descripcion}
      </p>
      <pre className="mt-3 whitespace-pre-wrap rounded-lg bg-soft p-3 font-mono text-xs leading-relaxed text-ink">
        {tpl.cuerpo}
      </pre>
      <p className="mt-2 text-xs text-muted">
        Ejemplo: <span className="text-ink">{readableTemplate(tpl, ejemplo)}</span>
      </p>
      <p className="mt-1 text-[11px] text-muted">
        Parámetros: {tpl.parametros.map((p) => `${p.n}=${p.label}`).join(" · ")}
      </p>
    </div>
  );
}

/* ─────────────────────── CONSENTIMIENTO ────────────────────── */

function Consentimiento({ clients, recargar }: { clients: Client[]; recargar: () => Promise<void> }) {
  const [ids, setIds] = useState<string[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const faltan = clients.filter((c) => !c.wa_consent);
  const yaTienen = clients.filter((c) => c.wa_consent);

  function toggle(id: string) {
    setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function guardar() {
    setGuardando(true);
    setMsg(null);
    try {
      const res = await fetch("/api/whatsapp/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientIds: ids, consent: true, source: "panel" }),
      });
      const json = await res.json();
      if (!res.ok) setMsg(json.error ?? "No se pudo guardar");
      else {
        setMsg(`${ids.length} contactos marcados con consentimiento`);
        setIds([]);
        await recargar();
      }
    } catch {
      setMsg("Error de red");
    }
    setGuardando(false);
  }

  return (
    <div className="mt-4">
      <p className="text-xs text-muted">
        Con consentimiento: <b className="text-ink">{yaTienen.length}</b> · sin consentimiento:{" "}
        <b className="text-ink">{faltan.length}</b>
      </p>
      {faltan.length > 0 && (
        <div className="mt-3 max-h-64 overflow-y-auto rounded-xl border border-line">
          <table className="data">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Última visita</th>
                <th>Marcar</th>
              </tr>
            </thead>
            <tbody>
              {faltan.map((c) => (
                <tr key={c.id}>
                  <td className="font-semibold text-ink">{c.name}</td>
                  <td className="text-xs text-muted">
                    {c.last_visit ? `${fmtDate(c.last_visit)} (${daysSince(c.last_visit)} d)` : "sin fecha"}
                  </td>
                  <td>
                    <input type="checkbox" checked={ids.includes(c.id)} onChange={() => toggle(c.id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-3 flex items-center gap-3">
        <button onClick={guardar} disabled={guardando || ids.length === 0} className="btn btn-primary">
          {guardando ? "Guardando…" : `Marcar ${ids.length} con consentimiento`}
        </button>
        {msg && <span className="text-xs text-muted">{msg}</span>}
      </div>
    </div>
  );
}
