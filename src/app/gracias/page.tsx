import Link from "next/link";

export default function Gracias() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-20">
      <div className="card p-8 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-2xl">
          ✓
        </div>
        <h1 className="text-3xl font-black tracking-tight text-ink">Solicitud recibida</h1>
        <p className="mt-3 text-muted">
          Te escribo en menos de 24 horas laborables. Mientras tanto, esto es lo que necesito de ti para ir más
          rápido:
        </p>

        <div className="mt-8 space-y-3 text-left">
          {[
            "Número de clientes activos que tienes (aproximado vale).",
            "Una exportación de tu agenda o de tu software de citas (CSV o Excel).",
            "Los horarios y servicios que ofreces.",
            "Una hora de videollamada de 20 minutos para ver cómo reservas.",
          ].map((t, i) => (
            <div key={t} className="flex gap-3 rounded-xl bg-soft px-4 py-3 text-sm text-muted">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-600 text-[11px] font-bold text-white">
                {i + 1}
              </span>
              <span>{t}</span>
            </div>
          ))}
        </div>

        <Link href="/#calculadora" className="btn btn-primary btn-lg mt-8">
          Ver el cálculo con mis números
        </Link>
      </div>
    </div>
  );
}
