export function fmtMoney(n: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Math.round(n || 0));
}

export function fmtDate(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "2-digit" });
}

export function daysSince(iso?: string | null): number {
  if (!iso) return 9999;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 9999;
  return Math.floor((Date.now() - d.getTime()) / 86400000);
}

/** Enlace de WhatsApp con mensaje prellenado (no requiere API ni aprobación). */
export function waLink(phone: string, text: string): string {
  const clean = (phone || "").replace(/[^\d]/g, "");
  return `https://wa.me/${clean}?text=${encodeURIComponent(text || "")}`;
}

/** Sustituye {variables} dentro de una plantilla. */
export function fillTemplate(tpl: string, vars: Record<string, string | number>): string {
  return tpl.replace(/\{(\w+)\}/g, (_, k: string) => {
    const v = vars[k];
    return v === undefined || v === null ? "" : String(v);
  });
}

export function slug(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Convierte texto pegado (CSV / Excel / listas de WhatsApp) en clientes.
 * Acepta separadores coma, punto y coma o tabulador, e ignora la cabecera.
 * Formatos de fecha aceptados: dd/mm/aaaa, aaaa-mm-dd, dd-mm-aaaa.
 */
export function parseClientsText(raw: string): {
  name: string;
  phone: string;
  last_visit: string | null;
  service: string | null;
  ticket: number | null;
}[] {
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const out: { name: string; phone: string; last_visit: string | null; service: string | null; ticket: number | null }[] = [];

  for (const line of lines) {
    const parts = line.split(/\s*[;,]\s*|\t+/).filter((p) => p.length > 0);
    if (parts.length < 2) continue;
    const phoneIdx = parts.findIndex((p) => /\d{7,}/.test(p.replace(/\s/g, "")));
    if (phoneIdx === -1) continue;

    const name = parts.slice(0, phoneIdx).join(" ").trim() || parts[phoneIdx].trim();
    const phone = parts[phoneIdx].replace(/[^\d+]/g, "");
    if (parts[0].toLowerCase() === "nombre" || parts[1]?.toLowerCase() === "telefono") continue;

    let last_visit: string | null = null;
    for (const p of parts.slice(phoneIdx + 1)) {
      const iso = parseDate(p);
      if (iso) {
        last_visit = iso;
        break;
      }
    }
    const ticketPart = parts.slice(phoneIdx + 1).find((p) => /^\d+([.,]\d+)?$/.test(p) && parseFloat(p.replace(",", ".")) > 5);
    const ticket = ticketPart ? parseFloat(ticketPart.replace(",", ".")) : null;

    out.push({ name, phone, last_visit, service: null, ticket });
  }
  return out;
}

export function parseDate(s: string): string | null {
  const t = s.trim();
  if (!t) return null;
  let m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) return `${m[1]}-${String(m[2]).padStart(2, "0")}-${String(m[3]).padStart(2, "0")}`;
  m = t.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})$/);
  if (m) {
    const y = m[3].length === 2 ? `20${m[3]}` : m[3];
    return `${y}-${String(m[2]).padStart(2, "0")}-${String(m[1]).padStart(2, "0")}`;
  }
  return null;
}

export function csvEscape(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function downloadCsv(filename: string, rows: (string | number | null)[][]) {
  const content = rows.map((r) => r.map(csvEscape).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
