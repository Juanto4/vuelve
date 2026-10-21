"use client";

import { useState } from "react";
import { CONFIG } from "@/lib/site-config";
import { VERTICALES } from "@/lib/verticals";

type Estado = "idle" | "enviando" | "ok" | "error";

export default function LeadForm() {
  const [estado, setEstado] = useState<Estado>("idle");
  const [mensaje, setMensaje] = useState("");
  const [form, setForm] = useState({
    name: "",
    business: "",
    phone: "",
    email: "",
    vertical: VERTICALES[0].id,
    clients_count: "",
    ticket: "",
    message: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEstado("enviando");
    setMensaje("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          clients_count: form.clients_count ? Number(form.clients_count) : null,
          ticket: form.ticket ? Number(form.ticket) : null,
          source: "web",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "No se pudo enviar");
      setEstado("ok");
      setMensaje(data?.stored === false ? "Recibido. Te escribo por WhatsApp en breve." : "Recibido. Te escribo en menos de 24 h.");
    } catch (err) {
      setEstado("error");
      setMensaje(err instanceof Error ? err.message : "Algo ha fallado. Escríbeme por WhatsApp.");
    }
  }

  if (estado === "ok") {
    return (
      <div className="card p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-2xl">
          ✓
        </div>
        <h3 className="text-xl font-bold text-ink">Solicitud recibida</h3>
        <p className="mt-2 text-sm text-muted">{mensaje}</p>
        <p className="mt-4 text-sm text-muted">
          Mientras tanto, mira el{" "}
          <a href="/#calculadora" className="font-semibold text-brand-600 underline">
            cálculo de dinero perdido
          </a>{" "}
          con tus números reales.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="card p-6 md:p-8">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="label" htmlFor="name">
            Tu nombre *
          </label>
          <input id="name" required className="field" value={form.name} onChange={set("name")} placeholder="Ana" />
        </div>
        <div>
          <label className="label" htmlFor="business">
            Nombre del negocio *
          </label>
          <input
            id="business"
            required
            className="field"
            value={form.business}
            onChange={set("business")}
            placeholder="Peluquería María"
          />
        </div>
        <div>
          <label className="label" htmlFor="phone">
            WhatsApp o teléfono *
          </label>
          <input
            id="phone"
            required
            className="field"
            value={form.phone}
            onChange={set("phone")}
            placeholder="600 11 22 33"
          />
        </div>
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="field"
            value={form.email}
            onChange={set("email")}
            placeholder="ana@peluqueriamaria.es"
          />
        </div>
        <div>
          <label className="label" htmlFor="vertical">
            Tu sector
          </label>
          <select id="vertical" className="field" value={form.vertical} onChange={set("vertical")}>
            {VERTICALES.map((v) => (
              <option key={v.id} value={v.id}>
                {v.nombre}
              </option>
            ))}
            <option value="otro">Otro</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="clients_count">
            Nº de clientes activos
          </label>
          <input
            id="clients_count"
            type="number"
            min={0}
            className="field"
            value={form.clients_count}
            onChange={set("clients_count")}
            placeholder="400"
          />
        </div>
        <div className="md:col-span-2">
          <label className="label" htmlFor="message">
            ¿Qué te duele?
          </label>
          <textarea
            id="message"
            rows={3}
            className="field"
            value={form.message}
            onChange={set("message")}
            placeholder="Se me quedan huecos vacíos y nadie vuelve. Tengo la agenda llena en mayo y vacía en febrero."
          />
        </div>
      </div>

      {estado === "error" && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{mensaje}</p>
      )}

      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row">
        <button type="submit" disabled={estado === "enviando"} className="btn btn-primary btn-lg w-full sm:w-auto">
          {estado === "enviando" ? "Enviando…" : "Pedir diagnóstico gratuito"}
        </button>
        <p className="text-xs text-muted sm:text-left">
          Te respondemos en menos de 24 h laborables. Sin spam, sin llamadas automáticas.
        </p>
      </div>

      {CONFIG.whatsapp && (
        <p className="mt-4 text-center text-sm text-muted">
          ¿Prefieres WhatsApp?{" "}
          <a
            className="font-semibold text-brand-600 underline"
            href={`https://wa.me/${CONFIG.whatsapp.replace(/\D/g, "")}`}
            target="_blank"
            rel="noreferrer"
          >
            Escríbenos directamente
          </a>
        </p>
      )}
    </form>
  );
}
