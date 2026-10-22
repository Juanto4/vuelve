import { NextResponse } from "next/server";
import { getUsuario } from "@/lib/supabase-server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { estadoMotor } from "@/lib/motor";
import type { Activity, Workspace } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * GET /api/whatsapp/status
 *  ?workspaceId=xxx  → estado del motor de ese cliente
 *  (sin workspaceId) → estado de todos tus clientes
 * Nunca devuelve el token: solo los últimos 4 caracteres.
 */
export async function GET(req: Request) {
  const user = await getUsuario();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: "Supabase no configurado" }, { status: 500 });

  const workspaceId = new URL(req.url).searchParams.get("workspaceId");

  const { data, error } = await admin
    .from("workspaces")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const workspaces = (data ?? []) as Workspace[];
  const objetivo = workspaceId ? workspaces.filter((w) => w.id === workspaceId) : workspaces;

  const { data: acts } = await admin
    .from("activities")
    .select("kind, created_at, workspace_id")
    .eq("user_id", user.id)
    .limit(2000);

  const todas = (acts ?? []) as Activity[];

  const resultado = objetivo.map((w) => ({
    id: w.id,
    name: w.name,
    estado: estadoMotor(
      w,
      todas.filter((a) => a.workspace_id === w.id),
    ),
  }));

  return NextResponse.json({ ok: true, resultados: resultado });
}
