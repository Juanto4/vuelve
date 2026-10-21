import Link from "next/link";

export default function Privacidad() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="text-3xl font-black tracking-tight text-ink">Política de privacidad</h1>
      <p className="mt-2 text-sm text-muted">Última actualización: pendiente de completar antes de publicar.</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted">
        <div className="card card-soft p-5 text-sm">
          <strong className="text-ink">⚠️ Placeholder.</strong> Antes de cobrar a un cliente real debes completar
          esta política con: responsable del tratamiento, base legal, categorías de datos, destinatarios,
          transferencias, plazos de conservación y derechos (acceso, rectificación, supresión, oposición,
          limitación y portabilidad). La AEPD obliga a que esta página sea real y esté publicada.
        </div>

        <section>
          <h2 className="text-lg font-bold text-ink">Responsable</h2>
          <p>Nombre legal, NIF/CIF, dirección y email de contacto de tu empresa o de ti como autónomo.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink">Datos que tratamos</h2>
          <p>
            Los datos de contacto que nos facilita cada cliente del servicio (nombre, negocio, teléfono, email y
            métricas de su negocio). Como proveedor, actuamos como <strong>encargado del tratamiento</strong> por
            cuenta del cliente final.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink">Base legal</h2>
          <p>
            Para las campañas de WhatsApp que ejecutamos, la base legal debe ser el <strong>interés legítimo</strong>{" "}
            (clientes que ya tuvieron una relación con el negocio) o el <strong>consentimiento</strong> previo. Todos
            los mensajes incluyen una línea de baja. Documenta esta decisión en el informe de diagnóstico de cada
            cliente.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink">Conservación</h2>
          <p>Los leads de esta web se conservan 12 meses. Los datos de clientes finales se eliminan a petición del cliente.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink">Derechos</h2>
          <p>
            Puedes ejercer tus derechos escribiendo a{" "}
            <a className="text-brand-600 underline" href="mailto:hola@vuelve.app">
              hola@vuelve.app
            </a>
            . Si consideras que no hemos atendido correctamente tu solicitud, puedes reclamar ante la AEPD.
          </p>
        </section>
      </div>

      <Link href="/" className="btn btn-ghost mt-10">
        ← Volver al inicio
      </Link>
    </article>
  );
}
