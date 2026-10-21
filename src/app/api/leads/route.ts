import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Datos no válidos" }, { status: 400 });
  }

  const nombre = String(body.name ?? "").trim();
  const negocio = String(body.business ?? "").trim();
  const telefono = String(body.phone ?? "").trim();

  if (!nombre || !negocio || !telefono) {
    return NextResponse.json({ error: "Faltan nombre, negocio y teléfono" }, { status: 400 });
  }

  const payload = {
    name: nombre,
    business: negocio,
    phone: telefono,
    email: String(body.email ?? "").trim() || null,
    vertical: String(body.vertical ?? "otro"),
    clients_count: body.clients_count ? Number(body.clients_count) : null,
    ticket: body.ticket ? Number(body.ticket) : null,
    message: String(body.message ?? "").trim() || null,
    source: String(body.source ?? "web"),
    status: "nuevo",
  };

  const admin = getSupabaseAdmin();

  if (!admin) {
    // Sin Supabase configurado: no perdemos el lead, pero avisamos al frontend.
    console.warn("[leads] Sin SUPABASE_SERVICE_ROLE_KEY. Lead no guardado:", payload);
    return NextResponse.json({ ok: true, stored: false });
  }

  const { error } = await admin.from("leads").insert(payload);

  if (error) {
    console.error("[leads] Error guardando lead:", error.message);
    return NextResponse.json({ error: "No se pudo guardar. Escríbenos por WhatsApp." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, stored: true });
}
