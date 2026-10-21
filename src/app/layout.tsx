import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { CONFIG } from "@/lib/site-config";
import "./globals.css";

export const metadata: Metadata = {
  title: `${CONFIG.brand} · ${CONFIG.claim}`,
  description:
    "Recuperamos por WhatsApp los clientes que ya te conocieron y no han vuelto, y reducimos las ausencias. Para peluquerías, clínicas, fisios y talleres en España.",
  keywords: [
    "recuperar clientes",
    "WhatsApp empresas",
    "no shows citas",
    "retención clientes",
    "reactivación clientes",
  ],
  openGraph: {
    title: `${CONFIG.brand} · ${CONFIG.claim}`,
    description:
      "Instalación en 5 días. Garantía de 30 días: si no recuperas 3 citas, te devolvemos el dinero.",
    type: "website",
    locale: "es_ES",
  },
};

export const viewport: Viewport = {
  themeColor: "#12896c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <header className="sticky top-0 z-50 border-b border-line bg-white/85 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
            <Link href="/" className="flex items-center gap-2 no-underline">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-black text-white">
                V
              </span>
              <span className="text-lg font-bold tracking-tight text-ink">{CONFIG.brand}</span>
            </Link>
            <nav className="hidden items-center gap-6 text-sm font-medium text-muted md:flex">
              <a href="/#calculadora" className="hover:text-ink">
                Calculadora
              </a>
              <a href="/#como" className="hover:text-ink">
                Cómo funciona
              </a>
              <a href="/#precios" className="hover:text-ink">
                Precios
              </a>
              <a href="/#faq" className="hover:text-ink">
                FAQ
              </a>
            </nav>
            <div className="flex items-center gap-2">
              <a href="/panel" className="btn btn-ghost hidden sm:inline-flex">
                Panel
              </a>
              <a href="/#contacto" className="btn btn-primary">
                Pide tu diagnóstico
              </a>
            </div>
          </div>
        </header>

        <main>{children}</main>

        <footer className="mt-24 border-t border-line bg-soft">
          <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-black text-white">
                  V
                </span>
                <span className="text-lg font-bold text-ink">{CONFIG.brand}</span>
              </div>
              <p className="mt-3 max-w-xs text-sm text-muted">
                Recuperación de clientes por WhatsApp para negocios de servicios en España.
              </p>
            </div>
            <div className="text-sm">
              <p className="mb-3 font-bold text-ink">Producto</p>
              <ul className="space-y-2 text-muted">
                <li>
                  <a href="/#calculadora" className="hover:text-ink">
                    Calculadora de dinero perdido
                  </a>
                </li>
                <li>
                  <a href="/#precios" className="hover:text-ink">
                    Precios
                  </a>
                </li>
                <li>
                  <a href="/#faq" className="hover:text-ink">
                    Preguntas frecuentes
                  </a>
                </li>
                <li>
                  <a href="/entrar" className="hover:text-ink">
                    Acceso al panel
                  </a>
                </li>
              </ul>
            </div>
            <div className="text-sm">
              <p className="mb-3 font-bold text-ink">Legal</p>
              <ul className="space-y-2 text-muted">
                <li>
                  <Link href="/aviso-legal" className="hover:text-ink">
                    Aviso legal
                  </Link>
                </li>
                <li>
                  <Link href="/privacidad" className="hover:text-ink">
                    Política de privacidad
                  </Link>
                </li>
                <li>
                  <a href={`mailto:${CONFIG.email}`} className="hover:text-ink">
                    {CONFIG.email}
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-line px-5 py-5 text-center text-xs text-muted">
            © {new Date().getFullYear()} {CONFIG.brand}. Hecho en España.
          </div>
        </footer>
      </body>
    </html>
  );
}
