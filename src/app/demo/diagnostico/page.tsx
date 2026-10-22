"use client";

import { useMemo } from "react";
import InformeDiagnostico from "@/components/panel/InformeDiagnostico";
import type { Client, Workspace } from "@/lib/types";

const NOMBRES = [
  "Lucía Martín", "Carlos Ruiz", "Marta Pérez", "Javier Sánchez", "Ana López", "Diego Fernández",
  "Elena García", "Pablo Navarro", "Carmen Ortiz", "Sergio Molina", "Nuria Alonso", "Alberto Vázquez",
  "Rocío Iglesias", "Manuel Gutiérrez", "Beatriz Herrero", "Rubén Delgado", "Silvia Cano", "Adrián Lozano",
  "Verónica Peña", "Iván Cortés", "Patricia Rubio", "Óscar Castro", "Mónica Bravo", "Andrés Gil",
  "Cristina Ramos", "Fernando Nieto", "Laura Vargas", "Antonio Campos", "Irene Serrano", "Gonzalo Prieto",
  "Daniel Medina", "Paula Rashid", "Óscar Benavente", "Sofía Lagarde",
];

const SERVICIOS = [
  "Caldera de gas",
  "ACS (agua caliente sanitaria)",
  "Aire acondicionado split",
  "Placa solar",
  "Mantenimiento anual",
];

function fecha(diasAtras: number): string {
  const d = new Date();
  d.setDate(d.getDate() - diasAtras);
  return d.toISOString().slice(0, 10);
}

export default function DemoDiagnostico() {
  const ws = useMemo<Workspace>(
    () => ({
      id: "demo",
      user_id: "demo",
      created_at: new Date().toISOString(),
      name: "Climatización Pérez",
      contact_name: "Pérez",
      phone: "600 11 22 33",
      email: "hola@climatizacionperez.es",
      vertical: "instaladores",
      ticket: 850,
      no_show_pct: 12,
      dormant_pct: 45,
      notes: "Demo",
      status: "activo",
      wa_phone_number_id: null,
      wa_token: null,
      wa_daily_limit: 80,
      wa_auto: false,
    }),
    [],
  );

  const clients = useMemo<Client[]>(
    () =>
      NOMBRES.map((n, i) => {
        const dias = i < 18 ? 200 + i * 14 : 20 + i * 9;
        return {
          id: `demo-${i}`,
          user_id: "demo",
          workspace_id: "demo",
          created_at: new Date().toISOString(),
          name: n,
          phone: `6${String(10000000 + i * 137711).slice(0, 8)}`,
          last_visit: fecha(dias),
          service: SERVICIOS[i % SERVICIOS.length],
          ticket: [650, 1200, 480, 2800, 180][i % 5],
          notes: null,
          status: "activo",
          wa_consent: i % 3 === 0,
          wa_consent_at: i % 3 === 0 ? new Date().toISOString() : null,
          wa_consent_source: i % 3 === 0 ? "presupuesto" : null,
        };
      }),
    [],
  );

  return (
    <div className="mx-auto max-w-4xl px-5 py-8">
      <div className="no-print card mb-6 p-5">
        <p className="text-sm font-bold text-ink">Ejemplo de informe (datos inventados)</p>
        <p className="mt-1 text-sm text-muted">
          Esto es lo que le entregas a tu cliente cuando paga el diagnóstico. Pulsa «Guardar como PDF» y en el
          diálogo elige «Guardar como PDF» como destino. El informe sale con la marca de agua de Vuelve y se puede
          enviar por email tal cual.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={() => window.print()} className="btn btn-primary">
            Guardar como PDF / Imprimir
          </button>
          <a href="/panel" className="btn btn-ghost">
            Ir al panel
          </a>
          <a href="/" className="btn btn-ghost">
            Ver la web
          </a>
        </div>
      </div>

      <InformeDiagnostico ws={ws} clients={clients} />
    </div>
  );
}
