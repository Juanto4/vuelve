-- =============================================================
--  Vuelve · esquema de base de datos (Supabase)
--  Ejecuta este archivo en: Supabase > SQL Editor > New query > Run
-- =============================================================

-- ─── Tablas ────────────────────────────────────────────────

-- Un espacio de trabajo = un cliente del servicio (una peluquería, una clínica...)
create table if not exists public.workspaces (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade,
  created_at    timestamptz not null default now(),
  name          text not null,
  contact_name  text,
  phone         text,
  email         text,
  vertical      text not null default 'peluqueria',
  ticket        numeric default 45,
  no_show_pct   integer default 12,
  dormant_pct   integer default 28,
  notes         text,
  status        text not null default 'lead'   -- lead | diagnostico | activo | perdido
);

create table if not exists public.leads (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade,
  created_at    timestamptz not null default now(),
  name          text,
  business      text,
  email         text,
  phone         text,
  vertical      text,
  clients_count integer,
  ticket        numeric,
  message       text,
  status        text not null default 'nuevo',
  notes         text,
  source        text default 'web'
);

create table if not exists public.clients (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete set null,
  created_at  timestamptz not null default now(),
  name        text not null,
  phone       text not null,
  last_visit  date,
  service     text,
  ticket      numeric,
  notes       text,
  status      text not null default 'activo'
);

create table if not exists public.activities (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete set null,
  created_at  timestamptz not null default now(),
  client_id   uuid references public.clients(id) on delete set null,
  kind        text not null,           -- envio | respuesta | cita | resena | baja
  template    text,
  amount      numeric default 0,
  note        text
);

-- Si ya habías ejecutado la versión anterior del esquema, esto añade las
-- columnas nuevas sin romper nada (es idempotente).
alter table public.clients    add column if not exists workspace_id uuid references public.workspaces(id) on delete set null;
alter table public.activities add column if not exists workspace_id uuid references public.workspaces(id) on delete set null;

-- ─── Motor de WhatsApp (API oficial de Meta) ─────────────────
-- Las credenciales son POR CLIENTE: cada cliente usa su propio número
-- y su propio token, así no gastas tú su saldo ni pierdes su historial.
-- El token NUNCA se devuelve al navegador: la ruta del panel lo enmascara.
alter table public.workspaces add column if not exists wa_phone_number_id text;
alter table public.workspaces add column if not exists wa_token text;
alter table public.workspaces add column if not exists wa_daily_limit integer not null default 80;
alter table public.workspaces add column if not exists wa_auto boolean not null default false;

-- Consentimiento de marketing (RGPD + políticas de Meta).
-- Sin este flag, las plantillas de categoría MARKETING no se envían.
alter table public.clients add column if not exists wa_consent boolean not null default false;
alter table public.clients add column if not exists wa_consent_at timestamptz;
alter table public.clients add column if not exists wa_consent_source text;

create index if not exists activities_ws_fecha_idx on public.activities(workspace_id, created_at);

create index if not exists workspaces_user_idx on public.workspaces(user_id);
create index if not exists clients_user_idx     on public.clients(user_id);
create index if not exists activities_user_idx  on public.activities(user_id);
create index if not exists activities_client_idx on public.activities(client_id);
create index if not exists leads_user_idx       on public.leads(user_id);

-- ─── Asignar user_id automáticamente al insertar ───────────

create or replace function public.set_user_id() returns trigger as $$
begin
  if new.user_id is null then
    new.user_id = auth.uid();
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_leads_uid on public.leads;
create trigger trg_leads_uid before insert on public.leads
  for each row execute function public.set_user_id();

drop trigger if exists trg_workspaces_uid on public.workspaces;
create trigger trg_workspaces_uid before insert on public.workspaces
  for each row execute function public.set_user_id();

drop trigger if exists trg_clients_uid on public.clients;
create trigger trg_clients_uid before insert on public.clients
  for each row execute function public.set_user_id();

drop trigger if exists trg_activities_uid on public.activities;
create trigger trg_activities_uid before insert on public.activities
  for each row execute function public.set_user_id();

-- ─── Row Level Security ───────────────────────────────────

alter table public.leads      enable row level security;
alter table public.clients    enable row level security;
alter table public.activities enable row level security;
alter table public.workspaces enable row level security;

drop policy if exists workspaces_all on public.workspaces;
create policy workspaces_all on public.workspaces
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Cada usuario ve y edita sus propias filas.
-- Los leads entrantes (user_id = null) son visibles para cualquier
-- cuenta autenticada: así el lead de la web aparece en tu panel.
-- Si en el futuro tienes varias cuentas, ajusta esta regla.

drop policy if exists leads_select on public.leads;
create policy leads_select on public.leads
  for select to authenticated
  using (auth.uid() = user_id or user_id is null);

drop policy if exists leads_write on public.leads;
create policy leads_write on public.leads
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists clients_all on public.clients;
create policy clients_all on public.clients
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists activities_all on public.activities;
create policy activities_all on public.activities
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
