"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { VERTICALES, getVertical } from "@/lib/verticals";
import { daysSince, downloadCsv, fmtDate, fmtMoney, parseClientsText, waLink } from "@/lib/utils";
import type { Activity, Client, Lead, LeadStatus, TemplateId, Vars, Workspace } from "@/lib/types";
import DiagnosticoTab from "./DiagnosticoTab";

const PLAN_PRECIO = 129;
const DORMIDO_DIAS = 90;
const WS_KEY = "vuelve.workspace";

const ESTADOS: { id: LeadStatus; label: string }[] = [
  { id: "nuevo", label: "Nuevo" },
  { id: "contactado", label: "Contactado" },
  { id: "propuesta", label: "Propuesta" },
  { id: "cerrado", label: "Cerrado" },
  { id: "perdido", label: "Perdido" },
];

type Tab = "leads" | "clientes" | "campanas" | "diagnostico" | "metricas";

export default function PanelApp() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("leads");
  const [email, setEmail] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [acts, setActs] = useState<Activity[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [wsId, setWsId] = useState<string | null>(null);
  const [creando, setCreando] = useState(false);

  const cargar = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) {
      setCargando(false);
      return;
    }
    const { data: sesion } = await sb.auth.getSession();
    if (!sesion?.session) {
      router.replace("/entrar");
      return;
    }
    setEmail(sesion.session.user.email ?? null);

    const [l, c, a, w] = await Promise.all([
      sb.from("leads").select("*").order("created_at", { ascending: false }),
      sb.from("clients").select("*").order("name"),
      sb.from("activities").select("*").order("created_at", { ascending: false }).limit(1000),
      sb.from("workspaces").select("*").order("created_at", { ascending: false }),
    ]);

    if (l.error) setError(l.error.message);
    if (c.error) setError(c.error.message);
    if (a.error) setError(a.error.message);
    if (w.error) setError(w.error.message);

    setLeads((l.data ?? []) as Lead[]);
    setClients((c.data ?? []) as Client[]);
    setActs((a.data ?? []) as Activity[]);
    setWorkspaces((w.data ?? []) as Workspace[]);
    setCargando(false);
  }, [router]);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setCargando(false);
      return;
    }
    const guardado = window.localStorage.getItem(WS_KEY);
    if (guardado) setWsId(guardado);
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cargar]);

  function cambiarWs(id: string | null) {
    setWsId(id);
    if (id) window.localStorage.setItem(WS_KEY, id);
    else window.localStorage.removeItem(WS_KEY);
  }

  async function crearWorkspace(datos: {
    name: string;
    contact_name?: string;
    phone?: string;
    email?: string;
    vertical?: string;
    ticket?: number;
  }) {
    const sb = getSupabase();
    if (!sb) return null;
    const { data, error } = await sb
      .from("workspaces")
      .insert({
        name: datos.name,
        contact_name: datos.contact_name || null,
        phone: datos.phone || null,
        email: datos.email || null,
        vertical: datos.vertical ?? "peluqueria",
        ticket: datos.ticket ?? 45,
        status: "activo",
      })
      .select()
      .single();
    if (error) {
      setError(error.message);
      return null;
    }
    await cargar();
    if (data) cambiarWs(data.id);
    return data.id as string;
  }

  async function salir() {
    const sb = getSupabase();
    await sb?.auth.signOut();
    router.push("/entrar");
  }

  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-20">
        <div className="card p-8">
          <h1 className="text-2xl font-black text-ink">Falta configurar Supabase</h1>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-muted">
            <li>
              Crea un proyecto en <b>supabase.com</b> (gratis).
            </li>
            <li>
              Ejecuta el archivo <code>supabase/schema.sql</code> en el SQL Editor.
            </li>
            <li>
              Copia <code>.env.example</code> → <code>.env.local</code> y rellena las claves.
            </li>
            <li>Reinicia <code>npm run dev</code>.</li>
          </ol>
          <a href="/" className="btn btn-ghost mt-6">
            ← Volver a la web
          </a>
        </div>
      </div>
    );
  }

  if (cargando) {
    return <div className="px-5 py-20 text-center text-sm text-muted">Cargando…</div>;
  }

  const wsActivo = wsId ? (workspaces.find((w) => w.id === wsId) ?? null) : null;
  const clientsWs = wsId ? clients.filter((c) => c.workspace_id === wsId) : clients;
  const actsWs = wsId ? acts.filter((a) => a.workspace_id === wsId) : acts;

  return (
    <div className="mx-auto max-w-7xl px-5 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-ink">Panel</h1>
          <p className="text-sm text-muted">{email}</p>
        </div>
        <div className="flex gap-2">
          <a href="/" className="btn btn-ghost">
            Ver web
          </a>
          <button onClick={salir} className="btn btn-ghost">
            Salir
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          Error de base de datos: {error}
        </p>
      )}

      {/* Selector de espacio de trabajo */}
      <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-line bg-soft px-4 py-3">
        <span className="text-xs font-bold uppercase tracking-wide text-muted">Cliente</span>
        <select
          className="field max-w-xs"
          value={wsId ?? ""}
          onChange={(e) => cambiarWs(e.target.value || null)}
        >
          <option value="">Todos los clientes (sin filtrar)</option>
          {workspaces.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name} · {getVertical(w.vertical).nombre}
            </option>
          ))}
        </select>
        <button onClick={() => setCreando((v) => !v)} className="btn btn-ghost px-3 py-2 text-xs">
          {creando ? "Cancelar" : "+ Nuevo cliente"}
        </button>
        {wsActivo && (
          <span className="text-xs text-muted">
            {clientsWs.length} clientes · diagnóstico listo en la pestaña <b>Diagnóstico</b>
          </span>
        )}
      </div>

      {creando && <NuevoWorkspace onCrear={crearWorkspace} onListo={() => setCreando(false)} />}

      <div className="mt-6 flex flex-wrap gap-2 border-b border-line">
        {(
          [
            ["leads", `Leads (${leads.filter((l) => l.status === "nuevo").length} nuevos)`],
            ["clientes", `Clientes (${clientsWs.length})`],
            ["campanas", "Campañas"],
            ["diagnostico", "Diagnóstico PDF"],
            ["metricas", "Métricas"],
          ] as [Tab, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
              tab === id
                ? "border-brand-600 text-brand-700"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "leads" && (
          <LeadsTab leads={leads} recargar={cargar} onCrearWorkspace={crearWorkspace} cambiarWs={cambiarWs} />
        )}
        {tab === "clientes" && (
          <ClientesTab clients={clientsWs} wsId={wsId} recargar={cargar} />
        )}
        {tab === "campanas" && (
          <CampanasTab clients={clientsWs} acts={actsWs} wsId={wsId} recargar={cargar} />
        )}
        {tab === "diagnostico" && (
          <DiagnosticoTab ws={wsActivo} clients={clientsWs} onRefresh={cargar} />
        )}
        {tab === "metricas" && (
          <MetricasTab clients={clientsWs} acts={actsWs} leads={leads} wsActivo={wsActivo} />
        )}
      </div>
    </div>
  );
}

/* ───────────────────── NUEVO ESPACIO DE TRABAJO ───────────────────── */

function NuevoWorkspace({
  onCrear,
  onListo,
}: {
  onCrear: (d: {
    name: string;
    contact_name?: string;
    phone?: string;
    email?: string;
    vertical?: string;
    ticket?: number;
  }) => Promise<string | null>;
  onListo: () => void;
}) {
  const [f, setF] = useState({
    name: "",
    contact_name: "",
    phone: "",
    email: "",
    vertical: "peluqueria",
    ticket: "45",
  });
  const [guardando, setGuardando] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    const id = await onCrear({ ...f, ticket: Number(f.ticket) });
    setGuardando(false);
    if (id) onListo();
  }

  return (
    <form onSubmit={enviar} className="card mt-3 p-5">
      <p className="mb-4 text-sm font-bold text-ink">Nuevo cliente del servicio</p>
      <div className="grid gap-3 md:grid-cols-6">
        <input className="field" required placeholder="Nombre comercial" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <input className="field" placeholder="Contacto" value={f.contact_name} onChange={(e) => setF({ ...f, contact_name: e.target.value })} />
        <input className="field" placeholder="Teléfono" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
        <input className="field" placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <select className="field" value={f.vertical} onChange={(e) => setF({ ...f, vertical: e.target.value })}>
          {VERTICALES.map((v) => (
            <option key={v.id} value={v.id}>
              {v.nombre}
            </option>
          ))}
        </select>
        <input className="field" type="number" placeholder="Ticket medio (€)" value={f.ticket} onChange={(e) => setF({ ...f, ticket: e.target.value })} />
      </div>
      <div className="mt-4 flex gap-2">
        <button type="submit" disabled={guardando} className="btn btn-primary">
          {guardando ? "Creando…" : "Crear espacio de trabajo"}
        </button>
        <button type="button" onClick={onListo} className="btn btn-ghost">
          Cancelar
        </button>
      </div>
    </form>
  );
}

/* ──────────────────────────── LEADS ──────────────────────────── */

function LeadsTab({
  leads,
  recargar,
  onCrearWorkspace,
  cambiarWs,
}: {
  leads: Lead[];
  recargar: () => Promise<void>;
  onCrearWorkspace: (d: {
    name: string;
    contact_name?: string;
    phone?: string;
    email?: string;
    vertical?: string;
    ticket?: number;
  }) => Promise<string | null>;
  cambiarWs: (id: string | null) => void;
}) {
  const sb = getSupabase();
  const [filtro, setFiltro] = useState<LeadStatus | "todos">("todos");
  const [nuevo, setNuevo] = useState({ name: "", business: "", phone: "", email: "", vertical: "peluqueria", clients_count: "" });
  const [guardando, setGuardando] = useState(false);
  const [convertido, setConvertido] = useState<string | null>(null);

  const lista = filtro === "todos" ? leads : leads.filter((l) => l.status === filtro);

  async function addLead(e: React.FormEvent) {
    e.preventDefault();
    if (!sb) return;
    setGuardando(true);
    await sb.from("leads").insert({
      name: nuevo.name,
      business: nuevo.business,
      phone: nuevo.phone,
      email: nuevo.email || null,
      vertical: nuevo.vertical,
      clients_count: nuevo.clients_count ? Number(nuevo.clients_count) : null,
      source: "manual",
      status: "nuevo",
    });
    setNuevo({ name: "", business: "", phone: "", email: "", vertical: "peluqueria", clients_count: "" });
    setGuardando(false);
    recargar();
  }

  async function setStatus(id: string, status: LeadStatus) {
    await sb?.from("leads").update({ status }).eq("id", id);
    recargar();
  }

  async function remove(id: string) {
    await sb?.from("leads").delete().eq("id", id);
    recargar();
  }

  async function convertir(l: Lead) {
    const id = await onCrearWorkspace({
      name: l.business ?? "Cliente",
      contact_name: l.name ?? "",
      phone: l.phone ?? "",
      email: l.email ?? "",
      vertical: l.vertical ?? "peluqueria",
      ticket: l.ticket ?? getVertical(l.vertical).ticket,
    });
    if (id) {
      await sb?.from("leads").update({ status: "cerrado" }).eq("id", l.id);
      setConvertido(l.id);
      cambiarWs(id);
      recargar();
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={addLead} className="card p-5">
        <p className="mb-4 text-sm font-bold text-ink">Añadir lead a mano</p>
        <div className="grid gap-3 md:grid-cols-6">
          <input className="field" placeholder="Nombre" value={nuevo.name} onChange={(e) => setNuevo({ ...nuevo, name: e.target.value })} />
          <input className="field" placeholder="Negocio" value={nuevo.business} onChange={(e) => setNuevo({ ...nuevo, business: e.target.value })} />
          <input className="field" placeholder="Teléfono" value={nuevo.phone} onChange={(e) => setNuevo({ ...nuevo, phone: e.target.value })} />
          <input className="field" placeholder="Email" value={nuevo.email} onChange={(e) => setNuevo({ ...nuevo, email: e.target.value })} />
          <select className="field" value={nuevo.vertical} onChange={(e) => setNuevo({ ...nuevo, vertical: e.target.value })}>
            {VERTICALES.map((v) => (
              <option key={v.id} value={v.id}>
                {v.nombre}
              </option>
            ))}
          </select>
          <input
            className="field"
            type="number"
            placeholder="Nº clientes"
            value={nuevo.clients_count}
            onChange={(e) => setNuevo({ ...nuevo, clients_count: e.target.value })}
          />
        </div>
        <button type="submit" disabled={guardando} className="btn btn-primary mt-4">
          {guardando ? "Guardando…" : "Añadir lead"}
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => setFiltro("todos")} className={`pill ${filtro === "todos" ? "bg-ink text-white" : "bg-soft text-muted"}`}>
          Todos ({leads.length})
        </button>
        {ESTADOS.map((e) => (
          <button
            key={e.id}
            onClick={() => setFiltro(e.id)}
            className={`pill ${filtro === e.id ? "bg-ink text-white" : "bg-soft text-muted"}`}
          >
            {e.label} ({leads.filter((l) => l.status === e.id).length})
          </button>
        ))}
        <button
          className="btn btn-ghost ml-auto"
          onClick={() =>
            downloadCsv("leads.csv", [
              ["nombre", "negocio", "telefono", "email", "sector", "clientes", "estado", "fecha"],
              ...leads.map((l) => [
                l.name,
                l.business,
                l.phone,
                l.email,
                l.vertical,
                l.clients_count,
                l.status,
                l.created_at,
              ]),
            ])
          }
        >
          Exportar CSV
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="data">
          <thead>
            <tr>
              <th>Negocio</th>
              <th>Contacto</th>
              <th>Sector</th>
              <th>Clientes</th>
              <th>Estado</th>
              <th>Recibido</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {lista.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-sm text-muted">
                  No hay leads aquí todavía. Comparte tu web o usa el formulario de la landing.
                </td>
              </tr>
            )}
            {lista.map((l) => (
              <tr key={l.id}>
                <td>
                  <div className="font-semibold text-ink">{l.business ?? "—"}</div>
                  <div className="text-xs text-muted">{l.name ?? ""}</div>
                </td>
                <td>
                  <div className="text-sm">{l.phone ?? "—"}</div>
                  <div className="text-xs text-muted">{l.email ?? ""}</div>
                </td>
                <td className="text-sm text-muted">{getVertical(l.vertical).nombre}</td>
                <td className="text-sm">{l.clients_count ?? "—"}</td>
                <td>
                  <select
                    className="rounded-lg border border-line px-2 py-1 text-xs"
                    value={l.status}
                    onChange={(e) => setStatus(l.id, e.target.value as LeadStatus)}
                  >
                    {ESTADOS.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="text-xs text-muted">{fmtDate(l.created_at)}</td>
                <td>
                  <div className="flex items-center gap-3">
                    <button onClick={() => convertir(l)} className="text-xs font-semibold text-brand-600 underline">
                      {convertido === l.id ? "creado ✓" : "→ espacio"}
                    </button>
                    <button onClick={() => remove(l.id)} className="text-xs text-muted underline hover:text-red-600">
                      borrar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─────────────────────────── CLIENTES ────────────────────────── */

function ClientesTab({
  clients,
  wsId,
  recargar,
}: {
  clients: Client[];
  wsId: string | null;
  recargar: () => Promise<void>;
}) {
  const sb = getSupabase();
  const [filtro, setFiltro] = useState<"todos" | "dormidos" | "recientes">("todos");
  const [nuevo, setNuevo] = useState({ name: "", phone: "", last_visit: "", service: "", ticket: "" });
  const [importar, setImportar] = useState(false);
  const [texto, setTexto] = useState("");
  const [plantilla, setPlantilla] = useState<TemplateId>("reactivar");
  const [negocio, setNegocio] = useState("tu negocio");
  const [cita, setCita] = useState<{ id: string; amount: number } | null>(null);

  const lista = useMemo(() => {
    const base = [...clients].sort((a, b) => daysSince(b.last_visit) - daysSince(a.last_visit));
    if (filtro === "dormidos") return base.filter((c) => daysSince(c.last_visit) >= DORMIDO_DIAS);
    if (filtro === "recientes") return base.filter((c) => daysSince(c.last_visit) < DORMIDO_DIAS);
    return base;
  }, [clients, filtro]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!sb) return;
    await sb.from("clients").insert({
      name: nuevo.name,
      phone: nuevo.phone,
      last_visit: nuevo.last_visit || null,
      service: nuevo.service || null,
      ticket: nuevo.ticket ? Number(nuevo.ticket) : null,
      workspace_id: wsId,
    });
    setNuevo({ name: "", phone: "", last_visit: "", service: "", ticket: "" });
    recargar();
  }

  async function doImport() {
    if (!sb) return;
    const filas = parseClientsText(texto);
    if (filas.length === 0) {
      alert("No he encontrado ninguna fila. Formato esperado: Nombre | Teléfono | dd/mm/aaaa | Precio");
      return;
    }
    await sb.from("clients").insert(filas.map((f) => ({ ...f, workspace_id: wsId })));
    setTexto("");
    setImportar(false);
    recargar();
  }

  function mensaje(c: Client): string {
    const v = getVertical(c.service ?? undefined);
    const tpl = v.plantillas.find((t) => t.id === plantilla) ?? v.plantillas[0];
    const vars: Vars = {
      nombre: c.name.split(" ")[0],
      negocio,
      servicio: c.service ?? v.servicio,
      fecha: c.last_visit ? fmtDate(c.last_visit) : "próxima semana",
      hora: "18:00",
      meses: Math.max(1, Math.round(daysSince(c.last_visit) / 30)),
      oferta: "un 10% en tu próxima cita",
    };
    return tpl.texto(vars);
  }

  async function log(kind: Activity["kind"], c: Client, amount = 0) {
    await sb?.from("activities").insert({
      client_id: c.id,
      workspace_id: wsId,
      kind,
      amount,
      template: plantilla,
      note: c.name,
    });
    recargar();
  }

  async function registrarCita(c: Client, amount: number) {
    await log("cita", c, amount);
    setCita(null);
  }

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <p className="mb-4 text-sm font-bold text-ink">
          Añadir cliente {wsId ? "" : "(sin espacio de trabajo seleccionado)"}
        </p>
        <form onSubmit={add} className="grid gap-3 md:grid-cols-5">
          <input className="field" required placeholder="Nombre" value={nuevo.name} onChange={(e) => setNuevo({ ...nuevo, name: e.target.value })} />
          <input className="field" required placeholder="Teléfono" value={nuevo.phone} onChange={(e) => setNuevo({ ...nuevo, phone: e.target.value })} />
          <input className="field" type="date" value={nuevo.last_visit} onChange={(e) => setNuevo({ ...nuevo, last_visit: e.target.value })} />
          <input className="field" placeholder="Servicio" value={nuevo.service} onChange={(e) => setNuevo({ ...nuevo, service: e.target.value })} />
          <input className="field" type="number" placeholder="Ticket (€)" value={nuevo.ticket} onChange={(e) => setNuevo({ ...nuevo, ticket: e.target.value })} />
          <div className="md:col-span-5">
            <button type="submit" className="btn btn-primary">
              Guardar cliente
            </button>
            <button type="button" onClick={() => setImportar(!importar)} className="btn btn-ghost ml-2">
              {importar ? "Cancelar" : "Importar lista (CSV pegado)"}
            </button>
          </div>
        </form>

        {importar && (
          <div className="mt-4 rounded-xl bg-soft p-4">
            <p className="text-xs text-muted">
              Pega aquí tu lista (nombre, teléfono, última visita, ticket). Se separa por coma, punto y coma o tabulador.
              Ejemplo: <code>Ana Ruiz, 600112233, 12/03/2025, 45</code>
            </p>
            <textarea
              rows={5}
              className="field mt-3 font-mono text-xs"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder={"Ana Ruiz, 600112233, 12/03/2025, 45\nLuis Pérez, 600998877, 05/11/2024, 60"}
            />
            <button onClick={doImport} className="btn btn-primary mt-3">
              Importar
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="label">Plantilla de WhatsApp</label>
          <select className="field" value={plantilla} onChange={(e) => setPlantilla(e.target.value as TemplateId)}>
            {getVertical(undefined).plantillas.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Tu nombre de negocio</label>
          <input className="field" value={negocio} onChange={(e) => setNegocio(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <button onClick={() => setFiltro("todos")} className={`pill ${filtro === "todos" ? "bg-ink text-white" : "bg-soft text-muted"}`}>
            Todos ({clients.length})
          </button>
          <button
            onClick={() => setFiltro("dormidos")}
            className={`pill ${filtro === "dormidos" ? "bg-ink text-white" : "bg-soft text-muted"}`}
          >
            Dormidos 90+ días ({clients.filter((c) => daysSince(c.last_visit) >= DORMIDO_DIAS).length})
          </button>
          <button
            onClick={() => setFiltro("recientes")}
            className={`pill ${filtro === "recientes" ? "bg-ink text-white" : "bg-soft text-muted"}`}
          >
            Activos ({clients.filter((c) => daysSince(c.last_visit) < DORMIDO_DIAS).length})
          </button>
        </div>
        <button
          className="btn btn-ghost ml-auto"
          onClick={() =>
            downloadCsv("clientes.csv", [
              ["nombre", "telefono", "ultima_visita", "servicio", "ticket"],
              ...clients.map((c) => [c.name, c.phone, c.last_visit, c.service, c.ticket]),
            ])
          }
        >
          Exportar CSV
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="data">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Teléfono</th>
              <th>Última visita</th>
              <th>Estado</th>
              <th>Ticket</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {lista.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-muted">
                  Todavía no hay clientes. Añade uno o importa tu lista.
                </td>
              </tr>
            )}
            {lista.map((c) => {
              const d = daysSince(c.last_visit);
              return (
                <tr key={c.id}>
                  <td className="font-semibold text-ink">{c.name}</td>
                  <td className="text-sm">{c.phone}</td>
                  <td className="text-sm text-muted">{c.last_visit ? fmtDate(c.last_visit) : "sin fecha"}</td>
                  <td>
                    <span className={`pill ${d >= DORMIDO_DIAS ? "bg-amber-50 text-amber-700" : "bg-brand-50 text-brand-700"}`}>
                      {d >= 9999 ? "sin datos" : d >= DORMIDO_DIAS ? `dormido ${d} días` : `activo ${d} días`}
                    </span>
                  </td>
                  <td className="text-sm">{c.ticket ? fmtMoney(c.ticket) : "—"}</td>
                  <td>
                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href={waLink(c.phone, mensaje(c))}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-primary px-3 py-1.5 text-xs"
                        onClick={() => log("envio", c, 0)}
                      >
                        WhatsApp
                      </a>
                      <button
                        onClick={() => setCita({ id: c.id, amount: c.ticket ?? 45 })}
                        className="btn btn-ghost px-3 py-1.5 text-xs"
                      >
                        Registrar cita
                      </button>
                      {cita?.id === c.id && (
                        <span className="flex items-center gap-1">
                          <input
                            type="number"
                            className="field w-20 px-2 py-1 text-xs"
                            value={cita.amount}
                            onChange={(e) => setCita({ ...cita, amount: Number(e.target.value) })}
                          />
                          <button onClick={() => registrarCita(c, cita.amount)} className="btn btn-dark px-3 py-1.5 text-xs">
                            OK
                          </button>
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─────────────────────────── CAMPAÑAS ────────────────────────── */

function CampanasTab({
  clients,
  acts,
  wsId,
  recargar,
}: {
  clients: Client[];
  acts: Activity[];
  wsId: string | null;
  recargar: () => Promise<void>;
}) {
  const sb = getSupabase();
  const [vertical, setVertical] = useState(VERTICALES[0].id);
  const [plantilla, setPlantilla] = useState<TemplateId>("reactivar");
  const [negocio, setNegocio] = useState("tu negocio");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("18:00");
  const [oferta, setOferta] = useState("un 10% en tu próxima cita");
  const [segmento, setSegmento] = useState<"dormidos" | "todos">("dormidos");

  const v = getVertical(vertical);
  const tpl = v.plantillas.find((t) => t.id === plantilla) ?? v.plantillas[0];

  const objetivo = useMemo(
    () => clients.filter((c) => (segmento === "dormidos" ? daysSince(c.last_visit) >= DORMIDO_DIAS : true)),
    [clients, segmento],
  );

  function mensaje(c: Client): string {
    const vars: Vars = {
      nombre: c.name.split(" ")[0],
      negocio,
      servicio: c.service ?? v.servicio,
      fecha: fecha || "próxima semana",
      hora,
      meses: Math.max(1, Math.round(daysSince(c.last_visit) / 30)),
      oferta,
    };
    return tpl.texto(vars);
  }

  async function marcarEnviados() {
    if (objetivo.length === 0) return;
    const filas = objetivo.map((c) => ({
      client_id: c.id,
      workspace_id: wsId,
      kind: "envio",
      template: plantilla,
      amount: 0,
      note: c.name,
    }));
    await sb?.from("activities").insert(filas);
    recargar();
  }

  const enviadosMes = acts.filter(
    (a) => a.kind === "envio" && Date.now() - new Date(a.created_at).getTime() < 30 * 86400000,
  ).length;

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <p className="mb-4 text-sm font-bold text-ink">Configurar campaña</p>
        <div className="grid gap-3 md:grid-cols-6">
          <div>
            <label className="label">Sector</label>
            <select
              className="field"
              value={vertical}
              onChange={(e) => {
                setVertical(e.target.value);
                setPlantilla(getVertical(e.target.value).plantillas[0].id);
              }}
            >
              {VERTICALES.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Plantilla</label>
            <select className="field" value={plantilla} onChange={(e) => setPlantilla(e.target.value as TemplateId)}>
              {v.plantillas.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Negocio</label>
            <input className="field" value={negocio} onChange={(e) => setNegocio(e.target.value)} />
          </div>
          <div>
            <label className="label">Fecha</label>
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
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button onClick={() => setSegmento(segmento === "dormidos" ? "todos" : "dormidos")} className="pill bg-soft text-ink">
            Segmento: {segmento === "dormidos" ? `Dormidos 90+ días (${objetivo.length})` : `Todos (${objetivo.length})`}
          </button>
          <button onClick={marcarEnviados} className="btn btn-primary">
            Marcar los {objetivo.length} como enviados
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => {
              const txt = objetivo.map((c) => `${c.name} — ${mensaje(c)}`).join("\n\n");
              navigator.clipboard?.writeText(txt);
              alert("Mensajes copiados al portapapeles. Pégalos uno a uno en WhatsApp.");
            }}
          >
            Copiar todos los mensajes
          </button>
          <span className="text-xs text-muted">{enviadosMes} envíos en los últimos 30 días</span>
        </div>
      </div>

      <div className="card p-5">
        <p className="mb-1 text-sm font-bold text-ink">Vista previa</p>
        <p className="mb-4 text-xs text-muted">{tpl.descripcion}</p>
        <div className="max-w-xl rounded-2xl rounded-tl-sm bg-soft p-4 text-sm leading-relaxed text-ink">
          {objetivo.length > 0 ? mensaje(objetivo[0]) : "Sin clientes en este segmento."}
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="data">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Última visita</th>
              <th>Mensaje</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {objetivo.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-sm text-muted">
                  No hay clientes en este segmento. Añade clientes o cambia el filtro.
                </td>
              </tr>
            )}
            {objetivo.map((c) => (
              <tr key={c.id}>
                <td className="font-semibold text-ink">{c.name}</td>
                <td className="text-sm text-muted">{c.last_visit ? fmtDate(c.last_visit) : "sin fecha"}</td>
                <td className="max-w-md truncate text-xs text-muted">{mensaje(c)}</td>
                <td>
                  <a
                    href={waLink(c.phone, mensaje(c))}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary px-3 py-1.5 text-xs"
                  >
                    Abrir
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─────────────────────────── MÉTRICAS ────────────────────────── */

function MetricasTab({
  clients,
  acts,
  leads,
  wsActivo,
}: {
  clients: Client[];
  acts: Activity[];
  leads: Lead[];
  wsActivo: Workspace | null;
}) {
  const dormidos = clients.filter((c) => daysSince(c.last_visit) >= DORMIDO_DIAS).length;
  const envios = acts.filter((a) => a.kind === "envio").length;
  const citas = acts.filter((a) => a.kind === "cita").length;
  const dinero = acts.filter((a) => a.kind === "cita").reduce((s, a) => s + Number(a.amount ?? 0), 0);
  const cerrados = leads.filter((l) => l.status === "cerrado").length;

  const porMes = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const a of acts) {
      if (a.kind !== "cita") continue;
      const k = a.created_at.slice(0, 7);
      mapa.set(k, (mapa.get(k) ?? 0) + Number(a.amount ?? 0));
    }
    return [...mapa.entries()].sort((a, b) => a[0].localeCompare(b[0])).slice(-6);
  }, [acts]);
  const maxMes = Math.max(1, ...porMes.map(([, v2]) => v2));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { k: "Leads totales", v: String(leads.length), s: `${cerrados} cerrados` },
          { k: "Clientes en cartera", v: String(clients.length), s: `${dormidos} dormidos` },
          { k: "Mensajes enviados", v: String(envios), s: `${citas} citas recuperadas` },
          { k: "Dinero recuperado", v: fmtMoney(dinero), s: `ROI x${(dinero / PLAN_PRECIO).toFixed(1)}` },
        ].map((m) => (
          <div key={m.k} className="card p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-muted">{m.k}</p>
            <p className="mt-1 text-3xl font-black text-ink">{m.v}</p>
            <p className="text-xs text-muted">{m.s}</p>
          </div>
        ))}
      </div>

      {wsActivo && (
        <p className="text-sm text-muted">
          Métricas de <strong className="text-ink">{wsActivo.name}</strong>. Cambia de cliente arriba para ver otro.
        </p>
      )}

      <div className="card p-5">
        <p className="mb-4 text-sm font-bold text-ink">Dinero recuperado por mes</p>
        {porMes.length === 0 ? (
          <p className="text-sm text-muted">Aún no hay citas registradas.</p>
        ) : (
          <div className="flex h-40 items-end gap-4">
            {porMes.map(([k, v2]) => (
              <div key={k} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-xs font-bold text-ink">{fmtMoney(v2)}</span>
                <div className="w-full rounded-t-lg bg-brand-500" style={{ height: `${Math.max(6, (v2 / maxMes) * 120)}px` }} />
                <span className="text-[10px] text-muted">{k}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card overflow-x-auto">
        <table className="data">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Cliente</th>
              <th>Importe</th>
            </tr>
          </thead>
          <tbody>
            {acts.slice(0, 50).map((a) => (
              <tr key={a.id}>
                <td className="text-xs text-muted">{fmtDate(a.created_at)}</td>
                <td className="text-sm">{a.kind}</td>
                <td className="text-sm">{a.note ?? "—"}</td>
                <td className="text-sm font-semibold">{a.amount ? fmtMoney(Number(a.amount)) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
