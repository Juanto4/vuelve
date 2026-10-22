import Link from "next/link";
import LeadForm from "@/components/LeadForm";
import RoiCalculator from "@/components/RoiCalculator";
import { CONFIG, FAQ, PRICING } from "@/lib/site-config";
import { VERTICALES } from "@/lib/verticals";

export default function Home() {
  const waNumber = CONFIG.whatsapp.replace(/\D/g, "");
  const waHref = waNumber ? `https://wa.me/${waNumber}` : "#contacto";

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,#e7f8f1_0%,#ffffff_70%)]" />
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <span className="pill bg-brand-100 text-brand-700">
                Para instaladores, calderas, climatización y energía solar en España
              </span>
              <h1 className="mt-5 text-4xl font-black leading-[1.05] tracking-tight text-ink md:text-6xl">
                Que tus clientes
                <br />
                <span className="text-brand-600">vuelvan</span>. Sin pedírselo.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
                Instalaste una caldera, una máquina de aire o una placa solar hace dos años y no volviste a saber de
                ese cliente. Ese trabajo vale entre <strong className="text-ink">500 € y 3.000 €</strong>.{" "}
                <strong className="text-ink">Los contactamos nosotros por WhatsApp</strong> con mensajes que suenan a
                persona, no a robot. Tú solo atiendes las respuestas.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href="#calculadora" className="btn btn-primary btn-lg">
                  Ver cuánto dinero pierdo
                </a>
                <a href={waHref} target="_blank" rel="noreferrer" className="btn btn-ghost btn-lg">
                  Hablar por WhatsApp
                </a>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted">
                <span>✓ Instalación en 5 días</span>
                <span>✓ API oficial de WhatsApp</span>
                <span>✓ Garantía de 30 días</span>
                <span>✓ Sin permanencia</span>
              </div>
            </div>

            {/* Mockup del panel */}
            <div className="card overflow-hidden shadow-xl shadow-brand-900/5">
              <div className="flex items-center gap-2 border-b border-line bg-soft px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-red-300" />
                <span className="h-3 w-3 rounded-full bg-amber-300" />
                <span className="h-3 w-3 rounded-full bg-green-300" />
                <span className="ml-2 text-xs font-semibold text-muted">Panel Vuelve · reactivación</span>
              </div>
              <div className="space-y-4 p-5">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { k: "Trabajos recuperados", v: "9", s: "este mes" },
                    { k: "Dinero recuperado", v: "7.650 €", s: "+22 % vs. mes anterior" },
                    { k: "Respuesta", v: "31 %", s: "104 mensajes" },
                  ].map((m) => (
                    <div key={m.k} className="rounded-xl bg-soft p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-muted">{m.k}</p>
                      <p className="mt-1 text-lg font-black text-ink">{m.v}</p>
                      <p className="text-[10px] text-muted">{m.s}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-line p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-muted">
                    Campaña · Reactivar dormidos
                  </p>
                  <div className="mt-3 space-y-2">
                    {[
                      { n: "Lucía M.", s: "Trabajo recuperado · 850 €", c: "text-brand-700 bg-brand-50" },
                      { n: "Carlos R.", s: "Respondió · falta confirmar", c: "text-amber-700 bg-amber-50" },
                      { n: "Marta P.", s: "Sin respuesta", c: "text-muted bg-soft" },
                      { n: "Javi S.", s: "Trabajo recuperado · 1.400 €", c: "text-brand-700 bg-brand-50" },
                    ].map((r) => (
                      <div key={r.n} className="flex items-center justify-between rounded-lg bg-soft px-3 py-2">
                        <span className="text-sm font-semibold text-ink">{r.n}</span>
                        <span className={`pill ${r.c}`}>{r.s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROBLEMA ─────────────────────────────────────── */}
      <section className="border-y border-line bg-soft">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="max-w-2xl text-3xl font-black tracking-tight text-ink md:text-4xl">
            El dinero no se te va por falta de clientes. Se te va por <span className="text-brand-600">clientes que ya te conocieron</span> y no volvieron.
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              {
                t: "El trabajo que no repite",
                d: "El 40 % de tu base no vuelve en un año. Cada cliente perdido es una instalación de entre 500 € y 3.000 € que ya no se va a repetir, con el coste de captación entero pagado.",
              },
              {
                t: "El presupuesto sin respuesta",
                d: "Nadie te dice que no a un presupuesto. Se queda en un mensaje sin leer y en una caldera que sigue sin instalar.",
              },
              {
                t: "La base en un cajón",
                d: "Tu histórico está en un Excel, en la agenda o en tu cabeza. Sin activar no genera nada: es el activo más dormido que tienes.",
              },
            ].map((c) => (
              <div key={c.t} className="card p-6">
                <h3 className="text-lg font-bold text-ink">{c.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CALCULADORA ──────────────────────────────────── */}
      <section id="calculadora" className="scroll-mt-20">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <p className="text-sm font-bold uppercase tracking-wide text-brand-600">Calculadora</p>
          <h2 className="mt-2 max-w-2xl text-3xl font-black tracking-tight text-ink md:text-4xl">
            ¿Cuánto dinero estás dejando en la mesa?
          </h2>
          <p className="mt-3 max-w-2xl text-muted">
            Mueve los sliders con tus números reales. Es una estimación conservadora: solo cuenta ausencias y
            reactivación básica.
          </p>
          <div className="mt-8">
            <RoiCalculator />
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ────────────────────────────────── */}
      <section id="como" className="scroll-mt-20 border-y border-line bg-soft">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="text-3xl font-black tracking-tight text-ink md:text-4xl">Cómo funciona</h2>
          <p className="mt-3 max-w-2xl text-muted">
            Sin proyecto de meses. Tres pasos y en una semana estás funcionando.
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              {
                n: "01",
                t: "Auditoría (48 h)",
                d: "Revisamos tu base de clientes, tu agenda y tus presupuestos. Te digo cuántos clientes dormidos tienes, cuánto dinero pierdes al mes y te entrego la lista con teléfonos y fechas.",
              },
              {
                n: "02",
                t: "Instalación (5 días)",
                d: "Configuro tu cuenta de WhatsApp Business, las plantillas aprobadas, el consentimiento y las campañas. Te grabo un vídeo de formación para tu equipo.",
              },
              {
                n: "03",
                t: "Campañas y medición",
                d: "Cada mes salen los contactos por WhatsApp con plantillas aprobadas. Tú atiendes las respuestas; yo clasifico los contactos, pido reseñas y te informo del dinero recuperado.",
              },
            ].map((s) => (
              <div key={s.n} className="card p-6">
                <span className="text-sm font-black text-brand-500">{s.n}</span>
                <h3 className="mt-2 text-lg font-bold text-ink">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VERTICALES ───────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="text-3xl font-black tracking-tight text-ink md:text-4xl">Empezamos por un sector: instaladores y energía</h2>
        <p className="mt-3 max-w-2xl text-muted">
          Las agencias de marketing atacan peluquerías y clínicas. En el sector de la instalación y la energía hay
          menos competencia y el ticket es de 500 € a 3.000 €: un solo cliente recuperado paga el mes. Cuando
          dominancemos el sector, abrimos los demás.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {VERTICALES.map((v) => (
            <div key={v.id} className={`card p-5 ${v.id === "instaladores" ? "border-brand-500 ring-2 ring-brand-200" : ""}`}>
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-bold text-ink">{v.nombre}</h3>
                <span className="pill bg-brand-50 text-brand-700">{v.ticket} € ticket</span>
              </div>
              {v.id === "instaladores" && (
                <span className="pill mt-2 bg-brand-600 text-white">Nuestro foco ahora</span>
              )}
              <p className="mt-1 text-sm text-muted">{v.ejemplos}</p>
              <div className="mt-3 flex gap-4 text-xs text-muted">
                <span>Sin volver: <b className="text-ink">{v.dormidos} %</b></span>
                <span>Trabajos al año: <b className="text-ink">{v.ticket} €</b></span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRECIOS ──────────────────────────────────────── */}
      <section id="precios" className="scroll-mt-20 border-y border-line bg-soft">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="text-3xl font-black tracking-tight text-ink md:text-4xl">Precios</h2>
          <p className="mt-3 max-w-2xl text-muted">
            Pagas por el servicio, no por licencia ni por usuario. Y si no funciona, te devolvemos el dinero.
          </p>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {PRICING.map((p) => (
              <div
                key={p.id}
                className={`card relative flex flex-col p-7 ${p.highlight ? "border-brand-500 ring-2 ring-brand-200" : ""}`}
              >
                {p.highlight && (
                  <span className="absolute -top-3 left-7 pill bg-brand-600 text-white">El más elegido</span>
                )}
                <h3 className="text-lg font-bold text-ink">{p.name}</h3>
                <p className="mt-1 text-sm text-muted">{p.pitch}</p>
                <p className="mt-5">
                  <span className="text-4xl font-black tracking-tight text-ink">{p.price}</span>{" "}
                  <span className="text-sm text-muted">{p.priceNote}</span>
                </p>
                <ul className="mt-6 flex-1 space-y-2.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2 text-sm text-muted">
                      <span className="font-bold text-brand-600">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={p.id === "auditoria" && CONFIG.stripeAudit ? CONFIG.stripeAudit : "#contacto"}
                  target={p.id === "auditoria" && CONFIG.stripeAudit ? "_blank" : undefined}
                  rel={p.id === "auditoria" && CONFIG.stripeAudit ? "noreferrer" : undefined}
                  className={`btn btn-lg mt-7 w-full ${p.highlight ? "btn-primary" : "btn-ghost"}`}
                >
                  {p.cta}
                </a>
              </div>
            ))}
          </div>

          <div className="card card-soft mt-8 flex flex-col items-start gap-3 p-6 sm:flex-row sm:items-center">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xl">
              🛡️
            </span>
            <p className="text-sm text-ink">
              <strong>Garantía de 30 días.</strong> Si contratamos la gestión y no recuperas 2 clientes en el
              primer mes, te devolvemos la mensualidad. Sin letra pequeña.
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────── */}
      <section id="faq" className="scroll-mt-20 mx-auto max-w-3xl px-5 py-16">
        <h2 className="text-3xl font-black tracking-tight text-ink md:text-4xl">Preguntas frecuentes</h2>
        <div className="mt-8 space-y-3">
          {FAQ.map((f) => (
            <details key={f.q} className="card group p-5">
              <summary className="cursor-pointer list-none font-bold text-ink marker:hidden">
                <span className="mr-2 text-brand-600">+</span>
                {f.q}
              </summary>
              <p className="mt-3 pl-5 text-sm leading-relaxed text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── CONTACTO ─────────────────────────────────────── */}
      <section id="contacto" className="scroll-mt-20 border-t border-line bg-soft">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-ink md:text-4xl">
              Pide tu auditoría
            </h2>
            <p className="mt-3 text-muted">
              199 € con garantía. En 48 horas sabes cuántos clientes dormidos tienes y cuánto dinero estás
              dejando en la mesa, con tu agenda y tus números reales.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-muted">
              <li>✓ Te lo entrego en PDF y en la hoja que usa mi equipo</li>
              <li>✓ Los 199 € se te descuentan de la instalación si contratas</li>
              <li>✓ Sin permanencia: la gestión se cancela cuando quieras</li>
            </ul>
            {waNumber && (
              <a
                href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                  "Hola, me llamo [nombre] y tengo [mi negocio]. ¿Me contáis lo de la auditoría?",
                )}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-ghost mt-8"
              >
                O escríbeme por WhatsApp
              </a>
            )}
          </div>
          <LeadForm />
        </div>
      </section>
    </>
  );
}
