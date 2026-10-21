"use client";

import { useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { getVertical } from "@/lib/verticals";
import { downloadCsv, fmtDate } from "@/lib/utils";
import type { Client, Workspace } from "@/lib/types";
import InformeDiagnostico from "./InformeDiagnostico";

const DORMIDO_DIAS = 90;

type Props = {
  ws: Workspace | null;
  clients: Client[];
  onRefresh: () => Promise<void>;
};

export default function DiagnosticoTab({ ws, clients, onRefresh }: Props) {
  const sb = getSupabase();
  const [guardando, setGuardando] = useState(false);

  if (!ws) {
    return (
      <div className="card p-8 text-center">
        <h2 className="text-xl font-bold text-ink">Elige un espacio de trabajo</h2>
        <p className="mt-2 text-sm text-muted">
          Cada espacio es un cliente tuyo (una peluquería, una clínica). Selecciona uno arriba, créalo con «+ Nuevo
          cliente» o conviértelo desde un lead con el botón «→ espacio».
        </p>
        <a href="/demo/diagnostico" className="btn btn-ghost mt-6">
          Ver un ejemplo del informe →
        </a>
      </div>
    );
  }

  const v = getVertical(ws.vertical);
  const ticket = Number(ws.ticket ?? v.ticket) || 45;
  const noShow = Number(ws.no_show_pct ?? v.noShow) || 12;
  const dormantPct = Number(ws.dormant_pct ?? v.dormidos) || 28;

  const dormidos = clients
    .filter((c) => daysSince(c.last_visit) >= DORMIDO_DIAS)
    .sort((a, b) => daysSince(b.last_visit) - daysSince(a.last_visit));

  async function guardarConfig(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!sb || !ws) return;
    const fd = new FormData(e.currentTarget);
    setGuardando(true);
    await sb
      .from("workspaces")
      .update({
        name: String(fd.get("name") ?? ws.name),
        contact_name: String(fd.get("contact_name") ?? "") || null,
        phone: String(fd.get("phone") ?? "") || null,
        email: String(fd.get("email") ?? "") || null,
        ticket: Number(fd.get("ticket")) || ticket,
        no_show_pct: Number(fd.get("no_show")) || noShow,
        dormant_pct: Number(fd.get("dormidos_pct")) || dormantPct,
        notes: String(fd.get("notes") ?? "") || null,
      })
      .eq("id", ws.id);
    setGuardando(false);
    onRefresh();
  }

  return (
    <div className="space-y-6">
      {/* ── Configuración (no se imprime) ───────────────── */}
      <div className="card no-print p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-bold text-ink">Datos del informe</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(
                  `Hola ${ws.contact_name ?? ""}, te paso el diagnóstico de ${ws.name}: ${window.location.origin}/demo/diagnostico`,
                );
                alert("Mensaje copiado al portapapeles.");
              }}
              className="btn btn-ghost px-3 py-1.5 text-xs"
            >
              Copiar mensaje de entrega
            </button>
            <button
              type="button"
              onClick={() =>
                downloadCsv(
                  `clientes-dormidos-${ws.name.replace(/\s+/g, "-").toLowerCase()}.csv`,
                  [
                    ["nombre", "telefono", "ultima_visita", "dias_sin_venir", "servicio", "ticket"],
                    ...dormidos.slice(0, 50).map((c) => [
                      c.name,
                      c.phone,
                      c.last_visit,
                      daysSince(c.last_visit),
                      c.service ?? "",
                      c.ticket ?? "",
                    ]),
                  ],
                )
              }
              className="btn btn-ghost px-3 py-1.5 text-xs"
            >
              Exportar lista (CSV)
            </button>
            <button type="button" onClick={() => window.print()} className="btn btn-primary px-3 py-1.5 text-xs">
              Guardar como PDF / Imprimir
            </button>
          </div>
        </div>

        <form onSubmit={guardarConfig} className="mt-4 grid gap-3 md:grid-cols-4">
          <div>
            <label className="label">Nombre comercial</label>
            <input name="name" defaultValue={ws.name} className="field" />
          </div>
          <div>
            <label className="label">Persona de contacto</label>
            <input name="contact_name" defaultValue={ws.contact_name ?? ""} className="field" />
          </div>
          <div>
            <label className="label">Teléfono</label>
            <input name="phone" defaultValue={ws.phone ?? ""} className="field" />
          </div>
          <div>
            <label className="label">Email</label>
            <input name="email" defaultValue={ws.email ?? ""} className="field" />
          </div>
          <div>
            <label className="label">Ticket medio (€)</label>
            <input name="ticket" type="number" defaultValue={ticket} className="field" />
          </div>
          <div>
            <label className="label">% de ausencias</label>
            <input name="no_show" type="number" defaultValue={noShow} className="field" />
          </div>
          <div>
            <label className="label">% que no vuelve en 12 meses</label>
            <input name="dormidos_pct" type="number" defaultValue={dormantPct} className="field" />
          </div>
          <div>
            <label className="label">Notas internas (no se imprimen)</label>
            <input name="notes" defaultValue={ws.notes ?? ""} className="field" />
          </div>
          <div className="md:col-span-4">
            <button type="submit" disabled={guardando} className="btn btn-primary">
              {guardando ? "Guardando…" : "Guardar y recalcular"}
            </button>
          </div>
        </form>
      </div>

      <InformeDiagnostico ws={ws} clients={clients} />
    </div>
  );
}

function daysSince(iso?: string | null): number {
  if (!iso) return 9999;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 9999;
  return Math.floor((Date.now() - d.getTime()) / 86400000);
}
