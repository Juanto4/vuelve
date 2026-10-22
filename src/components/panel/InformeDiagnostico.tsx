"use client";

import { useMemo } from "react";
import { CONFIG } from "@/lib/site-config";
import { getVertical } from "@/lib/verticals";
import { daysSince, fmtDate, fmtMoney } from "@/lib/utils";
import type { Client, Workspace } from "@/lib/types";

export const DORMIDO_DIAS = 180;
export const PRECIO_AUDITORIA = 199;
export const PRECIO_INSTALACION = 900;
export const PRECIO_MENSUAL = 299;

export type InformeProps = {
  ws: Workspace;
  clients: Client[];
};

export default function InformeDiagnostico({ ws, clients }: InformeProps) {
  const v = getVertical(ws.vertical);
  const ticket = Number(ws.ticket ?? v.ticket) || 45;
  const noShow = Number(ws.no_show_pct ?? v.noShow) || 12;
  const dormantPct = Number(ws.dormant_pct ?? v.dormidos) || 28;

  const total = clients.length;
  const dormidos = clients
    .filter((c) => daysSince(c.last_visit) >= DORMIDO_DIAS)
    .sort((a, b) => daysSince(b.last_visit) - daysSince(a.last_visit));

  const ausenciasMes = Math.round((total * noShow) / 100);
  const eurosAusencias = ausenciasMes * ticket;
  const dormidosEstimados = Math.max(dormidos.length, Math.round((total * dormantPct) / 100));
  const recuperables = Math.round(dormidosEstimados * 0.06);
  const eurosReactivacion = recuperables * ticket * 0.7;
  const eurosMes = eurosAusencias + eurosReactivacion;
  const potencialAnual = eurosMes * 12;

  const muestra = dormidos.slice(0, 50);

  const plantillas = useMemo(() => {
    const primera = muestra[0] ?? {
      name: "Nombre",
      phone: "600000000",
      last_visit: null,
      service: null,
      ticket,
    };
    const vars = {
      nombre: primera.name.split(" ")[0],
      negocio: ws.name,
      servicio: primera.service ?? v.servicio,
      fecha: "12/06/2025",
      hora: "18:00",
      meses: Math.max(1, Math.round(daysSince(primera.last_visit) / 30)),
      oferta: "un 10% en tu próxima cita",
    };
    return v.plantillas.slice(0, 4).map((t) => ({ ...t, ejemplo: t.texto(vars) }));
  }, [muestra, ws, v, ticket]);

  return (
    <div className="print-area space-y-5">
      {/* Portada */}
      <div className="card p-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-600">
              Diagnóstico de recuperación de clientes
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-ink">{ws.name}</h1>
            <p className="mt-1 text-sm text-muted">
              {ws.contact_name ? `Preparado para ${ws.contact_name}. ` : ""}
              {new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-black text-brand-700">{CONFIG.brand}</p>
            <p className="text-xs text-muted">{CONFIG.email}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-ink p-5 text-white">
            <p className="text-xs font-bold uppercase tracking-wide text-white/60">Dinero que se te escapa</p>
            <p className="mt-1 text-4xl font-black tracking-tight">{fmtMoney(eurosMes)}</p>
            <p className="mt-1 text-xs text-white/70">
              al mes · {fmtMoney(potencialAnual)} al año
            </p>
          </div>
          <div className="rounded-xl border border-line p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-muted">Ausencias al mes</p>
            <p className="mt-1 text-3xl font-black text-ink">{ausenciasMes}</p>
            <p className="mt-1 text-xs text-muted">citas que no se llenaron</p>
          </div>
          <div className="rounded-xl border border-line p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-muted">Clientes dormidos</p>
            <p className="mt-1 text-3xl font-black text-ink">{dormidosEstimados}</p>
            <p className="mt-1 text-xs text-muted">{dormidos.length} identificados en tu base</p>
          </div>
        </div>
      </div>

      {/* Resumen ejecutivo */}
      <div className="card p-7">
        <h2 className="text-xl font-black text-ink">1. Resumen: dónde se te va el dinero</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Hemos analizado {total} clientes de tu base. La pérdida de dinero viene de dos sitios, y los dos tienen
          solución sin gastar un euro en publicidad.
        </p>

        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-line p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-bold text-ink">1.1 · Presupuestos y citas que se pierden porque el cliente no avisa</h3>
              <span className="text-lg font-black text-red-600">{fmtMoney(eurosAusencias)} / mes</span>
            </div>
            <p className="mt-1 text-sm text-muted">
              {total} clientes × {noShow} % de ausencias = {ausenciasMes} huecos vacíos al mes × {fmtMoney(ticket)} de
              ticket medio. Cada hueco sigue costando personal, luz y tiempo.
            </p>
          </div>

          <div className="rounded-xl border border-line p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-bold text-ink">1.2 · Clientes que ya te conocieron y no han vuelto</h3>
              <span className="text-lg font-black text-red-600">{fmtMoney(eurosReactivacion)} / mes</span>
            </div>
            <p className="mt-1 text-sm text-muted">
              Estimados {dormidosEstimados} clientes sin volver en 24 meses ({dormantPct} % de tu base). Si consigues
              reactivar el 6 %, son {recuperables} clientes y {fmtMoney(eurosReactivacion)} al mes.
            </p>
          </div>

          <div className="rounded-xl bg-brand-50 p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-bold text-brand-900">Total recuperable</h3>
              <span className="text-xl font-black text-brand-700">{fmtMoney(eurosMes)} / mes</span>
            </div>
            <p className="mt-1 text-sm text-brand-800">
              Por {fmtMoney(PRECIO_MENSUAL)} al mes. Multiplicador:{" "}
              <strong>×{(eurosMes / PRECIO_MENSUAL).toFixed(1)}</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Lista de dormidos */}
      <div className="card p-7">
        <h2 className="text-xl font-black text-ink">2. Tus clientes dormidos</h2>
        <p className="mt-1 text-sm text-muted">
          {muestra.length} de {dormidos.length} clientes que no vienen desde hace más de {DORMIDO_DIAS} días. Con el
          teléfono listo para contactar.
        </p>

        {muestra.length === 0 ? (
          <p className="mt-6 rounded-xl bg-soft p-5 text-sm text-muted">
            Todavía no hay clientes importados para este espacio de trabajo. Ve a la pestaña <strong>Clientes</strong>,
            selecciona este negocio y pega tu lista (nombre, teléfono, última visita).
          </p>
        ) : (
          <table className="data mt-5">
            <thead>
              <tr>
                <th>#</th>
                <th>Cliente</th>
                <th>Teléfono</th>
                <th>Última visita</th>
                <th>Días sin venir</th>
                <th>Servicio</th>
                <th>Ticket</th>
              </tr>
            </thead>
            <tbody>
              {muestra.map((c, i) => (
                <tr key={c.id}>
                  <td className="text-xs text-muted">{i + 1}</td>
                  <td className="font-semibold text-ink">{c.name}</td>
                  <td>{c.phone}</td>
                  <td>{c.last_visit ? fmtDate(c.last_visit) : "sin fecha"}</td>
                  <td className="font-semibold text-amber-700">{daysSince(c.last_visit)}</td>
                  <td className="text-muted">{c.service ?? "—"}</td>
                  <td>{c.ticket ? fmtMoney(c.ticket) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {dormidos.length > 50 && (
          <p className="mt-3 text-xs text-muted">
            Se muestran los 50 más antiguos. La lista completa (CSV) está disponible en el panel.
          </p>
        )}
      </div>

      {/* Plantillas */}
      <div className="card p-7">
        <h2 className="text-xl font-black text-ink">3. Los mensajes, listos para usar</h2>
        <p className="mt-1 text-sm text-muted">
          Cuatro plantillas adaptadas a tu sector. Solo cambia <code>{"{nombre}"}</code> por el nombre de cada
          cliente. Todos incluyen la línea de baja que exige el RGPD.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {plantillas.map((t) => (
            <div key={t.id} className="rounded-xl border border-line p-4">
              <p className="text-sm font-bold text-ink">{t.label}</p>
              <p className="text-xs text-muted">{t.descripcion}</p>
              <div className="mt-3 rounded-lg bg-soft p-3 text-xs leading-relaxed text-ink">{t.ejemplo}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Plan */}
      <div className="card p-7">
        <h2 className="text-xl font-black text-ink">4. El plan</h2>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            {
              n: "Auditoría (lo que tienes en la mano)",
              p: `${PRECIO_AUDITORIA} €`,
              d: "Esta lista, estas plantillas y este cálculo. Sin coste adicional, y se descuenta de la instalación.",
              estado: true,
            },
            {
              n: "Instalación",
              p: `${PRECIO_INSTALACION} €`,
              d: "Dejamos todo funcionando: WhatsApp Business API con tu número, plantillas aprobadas, campañas y formación de 20 min para tu equipo.",
              estado: false,
            },
            {
              n: "Gestión",
              p: `${PRECIO_MENSUAL} € / mes`,
              d: "Lanzamos las campañas cada mes, tú atiendes las respuestas y te damos el informe del dinero recuperado. Sin permanencia.",
              estado: false,
            },
          ].map((p) => (
            <div key={p.n} className={`rounded-xl border p-5 ${p.estado ? "border-brand-400 bg-brand-50" : "border-line"}`}>
              <p className="text-sm font-bold text-ink">{p.n}</p>
              <p className="mt-1 text-2xl font-black text-brand-700">{p.p}</p>
              <p className="mt-2 text-sm text-muted">{p.d}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-xl bg-ink p-5 text-white">
          <p className="font-bold">Garantía de 30 días</p>
          <p className="mt-1 text-sm text-white/80">
            Si contratamos la gestión y en los primeros 30 días no recuperamos 2 clientes, te devolvemos la
            mensualidad. Sin letra pequeña.
          </p>
        </div>

        <div className="mt-6 border-t border-line pt-5">
          <p className="text-sm font-bold text-ink">Próximos pasos</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-muted">
            <li>Confirmamos la lista de clientes dormidos que quieres recuperar.</li>
            <li>En 48 h tienes las campañas listas con tu tono y tus horarios.</li>
            <li>Lanzamos la primera campaña y medimos clientes recuperados.</li>
          </ol>
          <p className="mt-5 text-sm text-muted">
            {CONFIG.email}
            {CONFIG.whatsapp ? ` · WhatsApp ${CONFIG.whatsapp}` : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
