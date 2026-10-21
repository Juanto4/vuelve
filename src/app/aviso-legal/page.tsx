import Link from "next/link";

export default function AvisoLegal() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="text-3xl font-black tracking-tight text-ink">Aviso legal</h1>
      <p className="mt-2 text-sm text-muted">Última actualización: pendiente de completar antes de publicar.</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted">
        <div className="card card-soft p-5 text-sm">
          <strong className="text-ink">⚠️ Placeholder.</strong> Completa este aviso con los datos reales que exige la
          LSSI: titular, NIF, domicilio, email, teléfono, registro de actividad y condiciones de contratación.
        </div>

        <section>
          <h2 className="text-lg font-bold text-ink">Titular</h2>
          <p>Nombre legal o nombre y apellidos, NIF/CIF, domicilio fiscal, teléfono y email de contacto.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink">Condiciones de contratación</h2>
          <p>
            Servicios de diagnóstico, puesta en marcha y gestión de campañas de recuperación de clientes por
            WhatsApp. Precios, plazos de entrega, forma de pago y garantía indicados en el documento de propuesta
            que se envía a cada cliente.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink">Propiedad intelectual</h2>
          <p>
            El software, las plantillas de mensajes y los materiales entregados permanecen de propiedad de{" "}
            <strong>Vuelve</strong>. El cliente recibe licencia de uso para su negocio durante la contratación.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink">Responsabilidad</h2>
          <p>
            El cliente final es responsable del envío de los mensajes a sus clientes, de contar con base legal
            válida y de cumplir la normativa de WhatsApp. Vuelve no envía mensajes a clientes finales sin la
            autorización expresa del contratante.
          </p>
        </section>
      </div>

      <Link href="/" className="btn btn-ghost mt-10">
        ← Volver al inicio
      </Link>
    </article>
  );
}
