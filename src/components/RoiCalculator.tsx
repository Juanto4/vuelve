"use client";

import { useMemo, useState } from "react";
import { fmtMoney } from "@/lib/utils";

const PLAN_PRECIO = 129;

export default function RoiCalculator() {
  const [clientes, setClientes] = useState(400);
  const [ticket, setTicket] = useState(45);
  const [noShow, setNoShow] = useState(12);
  const [dormidos, setDormidos] = useState(28);
  const [reactivados, setReactivados] = useState(6);

  const r = useMemo(() => {
    const citasPerdidas = (clientes * noShow) / 100;
    const dineroAusencias = citasPerdidas * ticket;
    const clientesDormidos = (clientes * dormidos) / 100;
    const clientesRecuperados = (clientesDormidos * reactivados) / 100;
    const dineroReactivacion = clientesRecuperados * ticket * 0.7; // el primer servicio suele ser algo más barato
    const totalMes = dineroAusencias + dineroReactivacion;
    const roi = totalMes / PLAN_PRECIO;
    return {
      citasPerdidas: Math.round(citasPerdidas),
      dineroAusencias,
      clientesDormidos: Math.round(clientesDormidos),
      clientesRecuperados: Math.round(clientesRecuperados),
      dineroReactivacion,
      totalMes,
      roi,
      anual: totalMes * 12,
    };
  }, [clientes, ticket, noShow, dormidos, reactivados]);

  const fmt = (v: number) => fmtMoney(v);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="card p-6">
        <p className="mb-5 text-sm font-bold text-muted">1. Tus números</p>

        <div className="space-y-5">
          <div>
            <div className="mb-1 flex items-baseline justify-between">
              <label className="label mb-0">Clientes activos que tienes</label>
              <span className="text-sm font-bold text-ink">{clientes}</span>
            </div>
            <input
              type="range"
              min={50}
              max={5000}
              step={50}
              value={clientes}
              onChange={(e) => setClientes(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <div className="mb-1 flex items-baseline justify-between">
              <label className="label mb-0">Ticket medio por cita</label>
              <span className="text-sm font-bold text-ink">{fmtMoney(ticket)}</span>
            </div>
            <input
              type="range"
              min={15}
              max={400}
              step={5}
              value={ticket}
              onChange={(e) => setTicket(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <div className="mb-1 flex items-baseline justify-between">
              <label className="label mb-0">% de ausencias (no-shows)</label>
              <span className="text-sm font-bold text-ink">{noShow} %</span>
            </div>
            <input
              type="range"
              min={0}
              max={40}
              step={1}
              value={noShow}
              onChange={(e) => setNoShow(Number(e.target.value))}
              className="w-full"
            />
            <p className="mt-1 text-xs text-muted">
              En peluquerías y clínicas suele estar entre el 8 % y el 20 %.
            </p>
          </div>

          <div>
            <div className="mb-1 flex items-baseline justify-between">
              <label className="label mb-0">% de clientes que no han vuelto en 12 meses</label>
              <span className="text-sm font-bold text-ink">{dormidos} %</span>
            </div>
            <input
              type="range"
              min={5}
              max={70}
              step={1}
              value={dormidos}
              onChange={(e) => setDormidos(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <div className="mb-1 flex items-baseline justify-between">
              <label className="label mb-0">% de dormidos que consigues reactivar</label>
              <span className="text-sm font-bold text-ink">{reactivados} %</span>
            </div>
            <input
              type="range"
              min={1}
              max={25}
              step={1}
              value={reactivados}
              onChange={(e) => setReactivados(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div className="card card-soft p-6">
        <p className="mb-5 text-sm font-bold text-muted">2. Lo que estás perdiendo</p>

        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3">
            <span className="text-sm text-muted">
              Ausencias ({r.citasPerdidas} citas/mes)
            </span>
            <span className="text-sm font-bold text-ink">{fmt(r.dineroAusencias)}</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3">
            <span className="text-sm text-muted">
              Clientes que no vuelven ({r.clientesDormidos} dormidos, {r.clientesRecuperados} recuperables)
            </span>
            <span className="text-sm font-bold text-ink">{fmt(r.dineroReactivacion)}</span>
          </div>
        </div>

        <div className="mt-5 rounded-2xl bg-ink p-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
            Puedes recuperar al mes
          </p>
          <p className="mt-1 text-4xl font-black tracking-tight">{fmt(r.totalMes)}</p>
          <p className="mt-2 text-sm text-white/70">
            {fmt(r.anual)} al año, por un plan de {fmtMoney(PLAN_PRECIO)} al mes. Multiplicador:{" "}
            <span className="font-bold text-brand-300">×{r.roi.toFixed(1)}</span>
          </p>
        </div>

        <a href="#contacto" className="btn btn-primary btn-lg mt-5 w-full">
          Quiero recuperar ese dinero
        </a>
        <p className="mt-3 text-center text-xs text-muted">
          Diagnóstico de 149 € con garantía. Si no cuadra, no pagas nada.
        </p>
      </div>
    </div>
  );
}
