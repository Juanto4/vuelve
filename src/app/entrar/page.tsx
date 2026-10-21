"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

export default function Entrar() {
  const router = useRouter();
  const [modo, setModo] = useState<"entrar" | "crear">("entrar");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);
  const [cargando, setCargando] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    const supabase = getSupabase();
    if (!supabase) {
      setMsg({ tipo: "error", texto: "Supabase no está configurado. Mira el README." });
      return;
    }
    setCargando(true);
    setMsg(null);

    const res =
      modo === "entrar"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setCargando(false);

    if (res.error) {
      setMsg({ tipo: "error", texto: res.error.message });
      return;
    }
    if (modo === "crear" && !res.data.session) {
      setMsg({
        tipo: "ok",
        texto: "Cuenta creada. Revisa tu email para confirmar la cuenta y luego entra.",
      });
      setModo("entrar");
      return;
    }
    router.push("/panel");
  }

  return (
    <div className="mx-auto max-w-md px-5 py-20">
      <div className="card p-8">
        <h1 className="text-2xl font-black tracking-tight text-ink">
          {modo === "entrar" ? "Acceso al panel" : "Crear cuenta"}
        </h1>
        <p className="mt-2 text-sm text-muted">
          Gestiona tus leads, clientes y campañas de WhatsApp desde un solo sitio.
        </p>

        {!isSupabaseConfigured() && (
          <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Supabase no está configurado. Copia <code>.env.example</code> a <code>.env.local</code> y reinicia el
            servidor.
          </p>
        )}

        <form onSubmit={enviar} className="mt-6 space-y-4">
          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              className="field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <label className="label" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              className="field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {msg && (
            <p
              className={`rounded-lg px-4 py-3 text-sm ${
                msg.tipo === "ok" ? "bg-brand-50 text-brand-700" : "bg-red-50 text-red-700"
              }`}
            >
              {msg.texto}
            </p>
          )}

          <button type="submit" disabled={cargando} className="btn btn-primary w-full">
            {cargando ? "Un momento…" : modo === "entrar" ? "Entrar" : "Crear cuenta"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setModo(modo === "entrar" ? "crear" : "entrar");
            setMsg(null);
          }}
          className="mt-5 w-full text-sm text-muted underline"
        >
          {modo === "entrar" ? "¿No tienes cuenta? Crear una" : "¿Ya tienes cuenta? Entrar"}
        </button>
      </div>

      <Link href="/" className="btn btn-ghost mt-6 w-full">
        ← Volver a la web
      </Link>
    </div>
  );
}
