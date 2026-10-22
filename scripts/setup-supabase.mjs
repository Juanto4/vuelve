/**
 * Setup de Supabase para Vuelve · script idempotente y re-ejecutable.
 *
 * Qué hace, en una sola pasada:
 *   1. Crea (o reutiliza) la organización.
 *   2. Crea (o reutiliza) el proyecto "vuelve" en la región que elijas.
 *   3. Espera a que el proyecto esté listo.
 *   4. Ejecuta supabase/schema.sql (idempotente: se puede volver a lanzar).
 *   5. Saca las claves (anon / service_role) y escribe .env.local.
 *   6. Verifica que las tablas existen.
 *
 * Uso (PowerShell):
 *   npm run supabase:setup
 *   (lee SUPABASE_ACCESS_TOKEN del entorno o de .env.local)
 *
 * Variables opcionales:
 *   SUPABASE_ORG_SLUG     organización donde crear el proyecto
 *   SUPABASE_PROJECT_NAME nombre del proyecto (por defecto: vuelve)
 *   SUPABASE_REGION       región (por defecto: eu-central-1, la más cercana a España)
 */

import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const API = "https://api.supabase.com";
const ROOT = process.cwd();
const ENV_FILE = path.join(ROOT, ".env.local");
const PROJECT_NAME = process.env.SUPABASE_PROJECT_NAME ?? "vuelve";
const REGION = process.env.SUPABASE_REGION ?? "eu-central-1";

/** El token puede venir del entorno o de .env.local (para no pegarlo cada vez). */
async function obtenerToken() {
  if (process.env.SUPABASE_ACCESS_TOKEN) return process.env.SUPABASE_ACCESS_TOKEN;
  if (process.argv[2]) return process.argv[2];
  if (existsSync(ENV_FILE)) {
    const contenido = await readFile(ENV_FILE, "utf8");
    const linea = contenido.match(/^SUPABASE_ACCESS_TOKEN=(.+)$/m);
    if (linea) return linea[1].trim();
  }
  return "";
}

const TOKEN = await obtenerToken();

if (!TOKEN) {
  console.error(
    "\nFalta el token.\n" +
      "  1. Entra en https://supabase.com/dashboard/account/tokens\n" +
      "  2. Crea un token (Personal Access Token) con permisos de proyectos y base de datos\n" +
      "  3. Guárdalo en .env.local como SUPABASE_ACCESS_TOKEN=sbp_xxx\n" +
      "     (o pásalo por entorno: $env:SUPABASE_ACCESS_TOKEN=\"sbp_xxx\")\n",
  );
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(method, endpoint, body) {
  const res = await fetch(`${API}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const texto = await res.text();
  let datos;
  try {
    datos = texto ? JSON.parse(texto) : null;
  } catch {
    datos = texto;
  }
  if (!res.ok) {
    const detalle =
      typeof datos === "object" && datos
        ? datos.message ?? datos.error ?? JSON.stringify(datos)
        : datos;
    throw new Error(`${method} ${endpoint} → ${res.status}: ${detalle}`);
  }
  return datos;
}

/* ── 1. Organización ─────────────────────────────────────────── */

async function obtenerOrganizacion() {
  let orgs = await api("GET", "/v1/organizations");
  if (!orgs?.length) {
    const nombre = process.env.SUPABASE_ORG_NAME ?? "Vuelve";
    console.log(`· Tu cuenta no tiene organización. Creo "${nombre}"...`);
    const creada = await api("POST", "/v1/organizations", { name: nombre });
    orgs = [creada];
  }
  const slug = process.env.SUPABASE_ORG_SLUG;
  const org = slug ? orgs.find((o) => o.slug === slug || o.name === slug) : orgs[0];
  if (!org) {
    throw new Error(
      `No encontré la organización "${slug}". Tienes: ${orgs.map((o) => o.slug).join(", ")}`,
    );
  }
  return org;
}

/* ── 2. Proyecto ─────────────────────────────────────────────── */

async function obtenerOCrearProyecto(org) {
  const existentes = await api("GET", `/v1/projects?organization_id=${org.id}`);
  const suyo = existentes?.find((p) => p.name === PROJECT_NAME);
  if (suyo) {
    console.log(`· Proyecto "${PROJECT_NAME}" ya existe (${suyo.ref}, ${suyo.region}).`);
    return suyo;
  }
  console.log(`· Creando proyecto "${PROJECT_NAME}" en ${REGION}...`);
  const db_pass = crypto.randomBytes(18).toString("base64url");
  const creado = await api("POST", "/v1/projects", {
    organization_slug: org.slug,
    name: PROJECT_NAME,
    db_pass,
    region_selection: { type: "specific", code: REGION },
    desired_instance_size: "nano",
  });
  return { ...creado, db_pass };
}

async function esperarListo(ref, intentos = 60) {
  for (let i = 0; i < intentos; i++) {
    const p = await api("GET", `/v1/projects/${ref}`);
    const estado = p.status ?? "";
    if (["ACTIVE_HEALTHY", "ACTIVE"].includes(estado)) {
      console.log(`· Proyecto listo (${estado}).`);
      return p;
    }
    if (["INACTIVE", "PAUSED"].includes(estado) && i > 2) {
      // Inactive al principio es normal mientras se aprovisiona.
    }
    process.stdout.write(`  … ${estado} (${i + 1}/${intentos})\n`);
    await sleep(5000);
  }
  throw new Error("El proyecto no llegó a estado ACTIVE a tiempo.");
}

/* ── 3. Esquema ──────────────────────────────────────────────── */

/** Divide SQL en sentencias respetando bloques $$ … $$ y literales '…'. */
function dividirSql(sql) {
  const sentencias = [];
  let actual = "";
  let i = 0;
  while (i < sql.length) {
    const ch = sql[i];
    const dos = sql.slice(i, i + 2);
    if (dos === "$$") {
      const fin = sql.indexOf("$$", i + 2);
      const bloque = fin === -1 ? sql.slice(i) : sql.slice(i, fin + 2);
      actual += bloque;
      i += bloque.length;
      continue;
    }
    if (ch === "'") {
      let j = i + 1;
      while (j < sql.length) {
        if (sql[j] === "'" && sql[j + 1] === "'") {
          j += 2;
          continue;
        }
        if (sql[j] === "'") break;
        j++;
      }
      actual += sql.slice(i, j + 1);
      i = j + 1;
      continue;
    }
    if (ch === "-" && sql[i + 1] === "-") {
      const fin = sql.indexOf("\n", i);
      i = fin === -1 ? sql.length : fin + 1;
      continue;
    }
    if (ch === ";") {
      if (actual.trim()) sentencias.push(actual.trim());
      actual = "";
      i++;
      continue;
    }
    actual += ch;
    i++;
  }
  if (actual.trim()) sentencias.push(actual.trim());
  return sentencias;
}

async function ejecutarEsquema(ref) {
  const ruta = path.join(ROOT, "supabase", "schema.sql");
  const sql = await readFile(ruta, "utf8");

  // Intento 1: el archivo entero de una vez.
  try {
    await api("POST", `/v1/projects/${ref}/database/query`, { query: sql });
    console.log("· Esquema aplicado (archivo completo).");
    return;
  } catch (e) {
    console.log(`· El archivo completo no se pudo aplicar (${e.message.split("→")[1]?.trim()}). Voy sentencia a sentencia.`);
  }

  // Intento 2: sentencia a sentencia.
  const sentencias = dividirSql(sql);
  console.log(`· Aplicando ${sentencias.length} sentencias...`);
  for (const [n, s] of sentencias.entries()) {
    await api("POST", `/v1/projects/${ref}/database/query`, { query: s });
    process.stdout.write(`  ${n + 1}/${sentencias.length} ✓\n`);
  }
  console.log("· Esquema aplicado (sentencia a sentencia).");
}

/* ── 3b. Autenticación ───────────────────────────────────────── */

async function configurarAuth(ref, urlBase) {
  try {
    await api("PATCH", `/v1/projects/${ref}/config/auth`, {
      external_email_enabled: true,
      mailer_autoconfirm: true,
      disable_signup: false,
      site_url: urlBase,
    });
    console.log("· Auth: email habilitado y sin confirmación (entrada directa).");
  } catch (e) {
    console.log(`· No he podido ajustar Auth (${e.message.split("→")[1]?.trim()}).`);
  }
}

/* ── 4. Claves ───────────────────────────────────────────────── */

async function obtenerClaves(ref) {
  let anon = null;
  let service = null;
  let nuevas = [];

  try {
    const legacy = await api("GET", `/v1/projects/${ref}/api-keys/legacy`);
    anon = legacy?.anon_key ?? null;
    service = legacy?.service_role_key ?? null;
  } catch {
    /* proyectos sin claves legacy */
  }

  try {
    nuevas = await api("GET", `/v1/projects/${ref}/api-keys`);
  } catch {
    nuevas = [];
  }

  if (!anon) {
    anon = nuevas.find((k) => /publishable|anon/i.test(`${k.name} ${k.type}`))?.api_key ?? null;
  }
  if (!service) {
    service =
      nuevas.find((k) => /secret|service/i.test(`${k.name} ${k.type}`))?.api_key ?? null;
  }
  if (!anon || !service) {
    throw new Error(
      "No he podido obtener las claves del proyecto. Míralas en Project Settings → API y ponlas a mano en .env.local.",
    );
  }
  return { anon, service };
}

/* ── 5. .env.local ───────────────────────────────────────────── */

async function escribirEnv({ url, anon, service, dbPass }) {
  let actual = existsSync(ENV_FILE) ? await readFile(ENV_FILE, "utf8") : "";
  const valores = {
    NEXT_PUBLIC_SUPABASE_URL: url,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: anon,
    SUPABASE_SERVICE_ROLE_KEY: service,
    SUPABASE_DB_PASSWORD: dbPass ?? "",
  };
  for (const [clave, valor] of Object.entries(valores)) {
    if (!valor) continue;
    const re = new RegExp(`^${clave}=.*$`, "m");
    actual = re.test(actual)
      ? actual.replace(re, `${clave}=${valor}`)
      : `${actual.trimEnd()}\n${clave}=${valor}`.trimStart();
  }
  if (!actual.includes("NEXT_PUBLIC_BASE_URL")) {
    actual += `\nNEXT_PUBLIC_BASE_URL=http://localhost:3000\n`;
  }
  await writeFile(ENV_FILE, actual.trimEnd() + "\n", "utf8");
  console.log(`· .env.local actualizado.`);
}

/* ── 6. Verificación ─────────────────────────────────────────── */

async function verificar(ref) {
  const r = await api("POST", `/v1/projects/${ref}/database/query`, {
    query: `select table_name from information_schema.tables where table_schema = 'public' order by table_name;`,
  });
  const tablas = Array.isArray(r) ? r.map((x) => x.table_name) : [];
  console.log(`· Tablas en public: ${tablas.join(", ") || "(ninguna)"}`);
  const necesarias = ["activities", "clients", "leads", "workspaces"];
  const faltan = necesarias.filter((t) => !tablas.includes(t));
  if (faltan.length) throw new Error(`Faltan tablas: ${faltan.join(", ")}`);

  const cols = await api("POST", `/v1/projects/${ref}/database/query`, {
    query: `select column_name from information_schema.columns where table_name = 'workspaces' and column_name like 'wa_%' order by column_name;`,
  });
  const nombres = Array.isArray(cols) ? cols.map((c) => c.column_name) : [];
  console.log(`· Columnas del motor en workspaces: ${nombres.join(", ") || "(ninguna)"}`);
}

/* ── main ────────────────────────────────────────────────────── */

async function main() {
  console.log("\n▸ Setup de Supabase para Vuelve\n");

  const org = await obtenerOrganizacion();
  console.log(`· Organización: ${org.name} (${org.slug})`);

  const proyecto = await obtenerOCrearProyecto(org);
  const listo = await esperarListo(proyecto.ref);

  await ejecutarEsquema(listo.ref);
  await verificar(listo.ref);

  const urlBase = `https://${listo.ref}.supabase.co`;
  await configurarAuth(listo.ref, urlBase);

  const { anon, service } = await obtenerClaves(listo.ref);
  await escribirEnv({
    url: urlBase,
    anon,
    service,
    dbPass: proyecto.db_pass,
  });

  console.log(`\n✅ Listo.`);
  console.log(`   URL:      ${urlBase}`);
  console.log(`   Panel:    https://supabase.com/dashboard/project/${listo.ref}`);
  console.log(`   .env.local ya tiene las claves.\n`);
  console.log(`   Siguiente paso: npm run dev y entra en /entrar (crea la cuenta la primera vez).\n`);
}

main().catch((e) => {
  console.error(`\n❌ ${e.message}\n`);
  process.exit(1);
});
