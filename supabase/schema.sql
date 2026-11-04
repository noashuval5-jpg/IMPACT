-- =====================================================================
-- שריקת סיום / صافرة النهاية — database schema
-- Paste this whole file into Supabase → SQL Editor → New query → Run.
-- Safe to run more than once.
-- =====================================================================

-- ---------- coaches ----------
create table if not exists public.coaches (
  id          uuid primary key default gen_random_uuid(),
  full_name   text not null check (length(trim(full_name)) > 0),
  role        text not null default '',
  phone       text not null default '',
  language    text not null default 'he' check (language in ('he', 'ar')),
  token       text not null unique check (length(token) >= 32),
  active      boolean not null default true,
  is_demo     boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ---------- groups ----------
create table if not exists public.groups (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (length(trim(name)) > 0),
  coach_id    uuid not null references public.coaches(id) on delete cascade,
  active      boolean not null default true,
  is_demo     boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists groups_coach_id_idx on public.groups(coach_id);

-- ---------- lessons (one per week, 1..10) ----------
create table if not exists public.lessons (
  week_number   integer primary key check (week_number between 1 and 10),
  title_he      text not null default '',
  title_ar      text not null default '',
  briefing_he   text not null default '',
  briefing_ar   text not null default '',
  message_he    text not null default '',
  message_ar    text not null default '',
  flyer_he_url  text,
  flyer_ar_url  text,
  is_demo       boolean not null default false,
  updated_at    timestamptz not null default now()
);

-- ---------- completions ----------
create table if not exists public.completions (
  id            uuid primary key default gen_random_uuid(),
  group_id      uuid not null references public.groups(id) on delete cascade,
  coach_id      uuid not null references public.coaches(id) on delete cascade,
  week_number   integer not null check (week_number between 1 and 10),
  completed_at  timestamptz not null default now(),
  unique (group_id, week_number)
);
create index if not exists completions_week_idx on public.completions(week_number);
create index if not exists completions_coach_idx on public.completions(coach_id);

-- ---------- settings (single row) ----------
create table if not exists public.settings (
  id                  integer primary key default 1 check (id = 1),
  program_start_date  date check (
    program_start_date is null or extract(dow from program_start_date) = 0
  )
);
insert into public.settings (id) values (1) on conflict (id) do nothing;

-- ---------- Security: RLS on, no policies ----------
-- The browser never touches these tables. Only the server (service-role key)
-- reads and writes them; the service role bypasses RLS.
alter table public.coaches     enable row level security;
alter table public.groups      enable row level security;
alter table public.lessons     enable row level security;
alter table public.completions enable row level security;
alter table public.settings    enable row level security;

revoke all on public.coaches, public.groups, public.lessons,
              public.completions, public.settings
  from anon, authenticated;

-- ---------- Storage: public "flyers" bucket ----------
-- Public read (flyers are shared with parents). Uploads happen only through
-- signed upload URLs created by the server after an admin check.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'flyers', 'flyers', true, 5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
