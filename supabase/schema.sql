-- =============================================================
-- Dashboard de prospección · tablas
-- =============================================================
-- Se puede correr más de una vez sin romper nada.
-- Cómo aplicarlo: en Claude Code con /conectar, o pegándolo en el
-- SQL Editor de Supabase y tocando "Run".

-- ---------- Prospectos (lo que trae el scraper) ----------
create table if not exists public.prospectos (
  id         uuid primary key default gen_random_uuid(),
  nombre     text not null,
  telefono   text,
  email      text,
  sitio_web  text,
  direccion  text,
  ciudad     text,
  rubro      text,
  rating     numeric,
  resenas    integer,
  maps_url   text,
  place_id   text unique,          -- id de Google Maps: evita duplicados al buscar de nuevo
  estado     text not null default 'nuevo'
             check (estado in ('nuevo', 'en_cola', 'contactado')),
  creado_en  timestamptz not null default now()
);
create index if not exists prospectos_creado_idx on public.prospectos (creado_en desc);

-- ---------- Plantillas (una por canal) ----------
create table if not exists public.plantillas (
  canal          text primary key check (canal in ('whatsapp', 'mail')),
  asunto         text,
  texto          text not null,
  actualizado_en timestamptz not null default now()
);

-- ---------- Mensajes (la cola de WhatsApp y de mail) ----------
-- Nada sale solo: un mensaje nace 'pendiente' y pasa a 'enviado' recién
-- cuando lo aprobás desde el dashboard.
create table if not exists public.mensajes (
  id           uuid primary key default gen_random_uuid(),
  prospecto_id uuid not null references public.prospectos (id) on delete cascade,
  canal        text not null check (canal in ('whatsapp', 'mail')),
  numero       smallint check (numero between 1 and 3),  -- de qué WhatsApp salió
  asunto       text,
  texto        text not null,
  estado       text not null default 'pendiente'
               check (estado in ('pendiente', 'enviando', 'enviado', 'salteado', 'error')),
  error        text,
  creado_en    timestamptz not null default now(),
  enviado_en   timestamptz
);
create index if not exists mensajes_cola_idx on public.mensajes (canal, estado, creado_en);
create index if not exists mensajes_enviado_idx on public.mensajes (canal, enviado_en);

-- ---------- Llamadas de venta ----------
create table if not exists public.llamadas (
  id        uuid primary key default gen_random_uuid(),
  prospecto text not null,
  fecha     date not null,
  hora      time,
  canal     text,
  nota      text,
  creado_en timestamptz not null default now()
);
create index if not exists llamadas_fecha_idx on public.llamadas (fecha, hora);

-- ---------- Contenido: planillas de métricas ----------
-- Cada planilla tiene columnas propias y una fila por semana.
create table if not exists public.planillas (
  id        uuid primary key default gen_random_uuid(),
  nombre    text not null default 'Nueva planilla',
  posicion  real not null default 0,
  creado_en timestamptz not null default now()
);

create table if not exists public.planilla_columnas (
  id          uuid primary key default gen_random_uuid(),
  planilla_id uuid not null references public.planillas (id) on delete cascade,
  nombre      text not null default 'Columna',
  tipo        text not null default 'number'
              check (tipo in ('number', 'checkbox', 'text', 'date')),
  meta        numeric,             -- meta por semana; solo para columnas de número
  posicion    real not null default 0,
  creado_en   timestamptz not null default now()
);
create index if not exists planilla_columnas_idx on public.planilla_columnas (planilla_id, posicion);

create table if not exists public.planilla_filas (
  id             uuid primary key default gen_random_uuid(),
  planilla_id    uuid not null references public.planillas (id) on delete cascade,
  etiqueta       text not null default '',
  inicio_periodo date,
  valores        jsonb not null default '{}',  -- { [id de columna]: número | true/false | texto }
  creado_en      timestamptz not null default now()
);
create index if not exists planilla_filas_idx on public.planilla_filas (planilla_id, inicio_periodo desc);

-- ---------- Ads: la última foto que trajo Claude desde Meta ----------
create table if not exists public.ads_campanas (
  id             uuid primary key default gen_random_uuid(),
  campana_id     text,
  nombre         text not null,
  estado         text,
  gasto          numeric not null default 0,
  resultados     numeric not null default 0,
  moneda         text,
  desde          date,
  hasta          date,
  actualizado_en timestamptz not null default now()
);

-- ---------- Seguridad ----------
-- Con RLS prendido y sin políticas, la clave pública de Supabase no puede
-- leer ni escribir nada. El dashboard entra con la clave secreta, que vive
-- solo en tu compu (config.local.json).
alter table public.prospectos        enable row level security;
alter table public.plantillas        enable row level security;
alter table public.mensajes          enable row level security;
alter table public.llamadas          enable row level security;
alter table public.planillas         enable row level security;
alter table public.planilla_columnas enable row level security;
alter table public.planilla_filas    enable row level security;
alter table public.ads_campanas      enable row level security;

-- En los proyectos nuevos, Supabase ya no le da permiso a nadie sobre las
-- tablas recién creadas: hay que dárselo a mano. Solo a service_role, que es
-- el rol de la clave secreta. A la clave pública (anon, authenticated) no.
grant select, insert, update, delete on public.prospectos        to service_role;
grant select, insert, update, delete on public.plantillas        to service_role;
grant select, insert, update, delete on public.mensajes          to service_role;
grant select, insert, update, delete on public.llamadas          to service_role;
grant select, insert, update, delete on public.planillas         to service_role;
grant select, insert, update, delete on public.planilla_columnas to service_role;
grant select, insert, update, delete on public.planilla_filas    to service_role;
grant select, insert, update, delete on public.ads_campanas      to service_role;

-- ---------- Plantillas iniciales ----------
insert into public.plantillas (canal, asunto, texto) values
  ('whatsapp', null,
   'Hola, ¿cómo va? Vi [negocio] en Google Maps y quería hacerles una consulta corta. ¿Hablo con la persona encargada?'),
  ('mail', 'Consulta corta para [negocio]',
   E'Hola, ¿cómo va?\n\nVi [negocio] en Google Maps y quería hacerles una consulta corta. ¿Con quién puedo hablar?\n\nGracias.')
on conflict (canal) do nothing;

-- Le avisa a Supabase que hay tablas nuevas, para que el dashboard las vea ya.
notify pgrst, 'reload schema';
