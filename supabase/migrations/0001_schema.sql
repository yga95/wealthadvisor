-- =========================================================
-- 0001_schema.sql : types, tables, index (Design Rev. 3, §1)
-- =========================================================

-- 1. Les 3 enums (§1.5)
create type user_role   as enum ('admin', 'advisor', 'client');
create type risk_level  as enum ('cautious', 'balanced', 'dynamic');
create type reco_status as enum ('generating', 'done', 'failed', 'archived');

-- 2. users : un utilisateur par compte Supabase Auth
create table public.users (
  id             uuid primary key references auth.users (id) on delete cascade,
  full_name      text not null
                 check (char_length(btrim(full_name)) >= 1 and char_length(full_name) <= 120),
  role           user_role  not null default 'client',
  age            int check (age between 18 and 120),
  risk_tolerance risk_level not null default 'balanced',
  advisor_id     uuid references public.users (id) on delete set null,
  created_at     timestamptz not null default now()
);

-- 3. assets et income : même forme
create table public.assets (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references public.users (id) on delete cascade,
  label      text not null
             check (char_length(btrim(label)) >= 1 and char_length(label) <= 100),
  amount     numeric(14,2) not null check (amount >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.income (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references public.users (id) on delete cascade,
  source     text not null
             check (char_length(btrim(source)) >= 1 and char_length(source) <= 100),
  amount     numeric(14,2) not null check (amount >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. recommendations
create table public.recommendations (
  id              uuid primary key default gen_random_uuid(),
  client_id       uuid not null references public.users (id) on delete cascade,
  created_by      uuid references public.users (id) on delete set null,
  pct_actions     int check (pct_actions     between 0 and 100),
  pct_obligations int check (pct_obligations between 0 and 100),
  pct_liquidites  int check (pct_liquidites  between 0 and 100),
  explanation     text check (char_length(explanation) <= 4000),
  status          reco_status not null default 'generating',
  created_at      timestamptz not null default now(),
  constraint pct_complete_and_sum_100_when_done check (
    status <> 'done'
    or (    pct_actions     is not null
        and pct_obligations is not null
        and pct_liquidites  is not null
        and pct_actions + pct_obligations + pct_liquidites = 100)
  )
);

-- 5. notes (privées au conseiller)
create table public.notes (
  id         uuid primary key default gen_random_uuid(),
  client_id  uuid not null references public.users (id) on delete cascade,
  author_id  uuid not null references public.users (id) on delete cascade,
  content    text not null
             check (char_length(btrim(content)) >= 1 and char_length(content) <= 2000),
  created_at timestamptz not null default now()
);

-- 6. Index sur les colonnes lues par les politiques (§1.7)
create index users_advisor_id_idx  on public.users (advisor_id);
create index assets_owner_id_idx   on public.assets (owner_id);
create index income_owner_id_idx   on public.income (owner_id);
create index notes_author_id_idx   on public.notes (author_id);
create index notes_client_id_idx   on public.notes (client_id);
create index recommendations_client_id_idx
  on public.recommendations (client_id, created_at desc);

-- 7. RLS activé tout de suite : sans politique, tout est refusé
alter table public.users           enable row level security;
alter table public.assets          enable row level security;
alter table public.income          enable row level security;
alter table public.recommendations enable row level security;
alter table public.notes           enable row level security;