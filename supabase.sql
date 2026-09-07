-- BQI Fashion Tracker — multi-user schema, RLS, and one-time migration.
--
-- ORDER MATTERS: sign in to the app with the magic link FIRST, then run this.
-- The auth user has to exist before the migration can hand your data to it.
-- If it does not, the preflight in section 0 raises an exception and the whole
-- script is rolled back — no schema changes, no data loss, but also no
-- migration. Sign in and run the script again.
--
-- Safe to run repeatedly. When it finishes, section 8 prints a per-account row
-- count; if you do not see that result grid, the script did not complete.

-- ---------------------------------------------------------------------------
-- 0. Preflight guard
--
-- Step 4 assigns every pre-existing row to an account, and anything still
-- unowned afterwards is deleted (an unowned row is invisible under RLS, so it
-- can only be dead weight). If the account does not exist yet, that delete
-- would take the whole existing catalog with it. Refuse to start in that case,
-- before any schema change has been made.
-- ---------------------------------------------------------------------------

do $$
declare
  legacy_count integer := 0;
  target_id uuid;
begin
  if to_regclass('public.brands') is not null then
    if exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'brands' and column_name = 'user_id'
    ) then
      execute 'select count(*) from public.brands where user_id is null' into legacy_count;
    else
      execute 'select count(*) from public.brands' into legacy_count;
    end if;
  end if;

  select id into target_id from auth.users where lower(email) = lower('melellard3@gmail.com') limit 1;

  if legacy_count > 0 and target_id is null then
    raise exception
      E'BQI MIGRATION DID NOT RUN — NO CHANGES WERE MADE.\n'
      '  Found % existing brands, but no auth user exists for melellard3@gmail.com yet.\n'
      '  Migrating now would leave that data unowned and it would be deleted.\n'
      '  Fix: open the app, sign in with the magic link, then run this whole script again.\n'
      '  Your data is untouched. This script is transactional — nothing above was applied.',
      legacy_count;
  end if;

  raise notice 'Preflight OK: % existing brands, target user %.', legacy_count, coalesce(target_id::text, '(none — fresh project)');
end;
$$;

-- ---------------------------------------------------------------------------
-- 1. Base tables (created if this is a fresh project)
-- ---------------------------------------------------------------------------

create table if not exists public.brands (
  id integer not null,
  name text not null,
  notes text not null default '',
  categories text[] not null default array['Clothing']::text[]
);

create table if not exists public.rankings (
  brand_id integer not null,
  tier text not null check (tier in ('S', 'A', 'B', 'C', 'D', 'F')),
  position integer not null
);

create table if not exists public.size_charts (
  brand_id integer not null,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.price_guides (
  brand_id integer not null,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.profile (
  id integer,
  name text not null default '',
  measurements jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.saved_fits (
  id uuid primary key default gen_random_uuid(),
  brand text not null,
  label text not null,
  photo_url text,
  measurements jsonb not null default '{}'::jsonb,
  size text,
  material text,
  fit_verdict text not null,
  confirmed_fit text not null default 'Not yet confirmed',
  fit_reasoning text,
  original_text text not null,
  saved_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 2. Add user ownership to every table
-- ---------------------------------------------------------------------------

alter table public.brands       add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.rankings     add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.size_charts  add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.price_guides add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.profile      add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.saved_fits   add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- Private storage path for a fit photo. photo_url is kept for legacy rows that
-- still hold a public URL from before the bucket became private.
alter table public.saved_fits add column if not exists photo_path text;

alter table public.saved_fits
  drop constraint if exists saved_fits_confirmed_fit_check;
alter table public.saved_fits
  add constraint saved_fits_confirmed_fit_check
  check (confirmed_fit in ('Not yet confirmed', 'Fits', 'Doesn''t fit'));

update public.saved_fits
  set confirmed_fit = 'Not yet confirmed'
  where confirmed_fit is null or confirmed_fit not in ('Not yet confirmed', 'Fits', 'Doesn''t fit');

-- A per-user tracker for onboarding: whether the user has picked a starting
-- catalog yet ("base list" vs "blank").
create table if not exists public.user_setup (
  user_id uuid primary key references auth.users(id) on delete cascade,
  seeded boolean not null default false,
  seed_choice text check (seed_choice in ('base', 'blank')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 3. Re-key everything on (user_id, ...) so brand ids are per-user
-- ---------------------------------------------------------------------------

-- Drop the old single-tenant keys/foreign keys before rebuilding them.
alter table public.rankings     drop constraint if exists rankings_brand_id_fkey;
alter table public.size_charts  drop constraint if exists size_charts_brand_id_fkey;
alter table public.price_guides drop constraint if exists price_guides_brand_id_fkey;

alter table public.brands       drop constraint if exists brands_pkey       cascade;
alter table public.rankings     drop constraint if exists rankings_pkey     cascade;
alter table public.size_charts  drop constraint if exists size_charts_pkey  cascade;
alter table public.price_guides drop constraint if exists price_guides_pkey cascade;
alter table public.profile      drop constraint if exists profile_pkey      cascade;

-- The legacy profile table had a `check (id = 1)` single-row guard and an id
-- column; ownership is now the primary key, so drop both.
alter table public.profile drop constraint if exists profile_id_check;
alter table public.profile drop column if exists id;

-- ---------------------------------------------------------------------------
-- 4. One-time migration: claim all pre-existing rows for an account
-- ---------------------------------------------------------------------------

create or replace function public.claim_legacy_bqi_data(target_email text)
returns text
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  target_id uuid;
  claimed integer := 0;
begin
  select id into target_id from auth.users where lower(email) = lower(target_email) limit 1;
  if target_id is null then
    return format('No auth user for %s yet — log in once with the magic link, then re-run this function.', target_email);
  end if;

  update public.brands       set user_id = target_id where user_id is null;
  get diagnostics claimed = row_count;

  update public.rankings     set user_id = target_id where user_id is null;
  update public.size_charts  set user_id = target_id where user_id is null;
  update public.price_guides set user_id = target_id where user_id is null;
  update public.profile      set user_id = target_id where user_id is null;
  update public.saved_fits   set user_id = target_id where user_id is null;

  -- An account that already owns brands has completed onboarding.
  insert into public.user_setup (user_id, seeded, seed_choice)
  values (target_id, true, 'base')
  on conflict (user_id) do update set seeded = true;

  return format('Claimed legacy data for %s (%s brands).', target_email, claimed);
end;
$$;

do $$
declare
  result text;
begin
  select public.claim_legacy_bqi_data('melellard3@gmail.com') into result;
  raise notice '%', result;
end;
$$;

-- Any row still unowned after the claim cannot be exposed under RLS, so drop it
-- rather than leave invisible orphans behind.
delete from public.rankings     where user_id is null;
delete from public.size_charts  where user_id is null;
delete from public.price_guides where user_id is null;
delete from public.profile      where user_id is null;
delete from public.saved_fits   where user_id is null;
delete from public.brands       where user_id is null;

-- ---------------------------------------------------------------------------
-- 5. Enforce ownership and rebuild keys
-- ---------------------------------------------------------------------------

alter table public.brands       alter column user_id set not null;
alter table public.rankings     alter column user_id set not null;
alter table public.size_charts  alter column user_id set not null;
alter table public.price_guides alter column user_id set not null;
alter table public.profile      alter column user_id set not null;
alter table public.saved_fits   alter column user_id set not null;

alter table public.brands       add primary key (user_id, id);
alter table public.rankings     add primary key (user_id, brand_id);
alter table public.size_charts  add primary key (user_id, brand_id);
alter table public.price_guides add primary key (user_id, brand_id);
alter table public.profile      add primary key (user_id);

-- Deleting a brand now cascades to its ranking, size chart, and price guide,
-- which is what the "remove this brand entirely" action relies on.
-- Dropped by name first so the whole script stays re-runnable.
alter table public.rankings     drop constraint if exists rankings_brand_fkey;
alter table public.size_charts  drop constraint if exists size_charts_brand_fkey;
alter table public.price_guides drop constraint if exists price_guides_brand_fkey;

alter table public.rankings
  add constraint rankings_brand_fkey
  foreign key (user_id, brand_id) references public.brands(user_id, id) on delete cascade;
alter table public.size_charts
  add constraint size_charts_brand_fkey
  foreign key (user_id, brand_id) references public.brands(user_id, id) on delete cascade;
alter table public.price_guides
  add constraint price_guides_brand_fkey
  foreign key (user_id, brand_id) references public.brands(user_id, id) on delete cascade;

create index if not exists brands_user_idx      on public.brands(user_id);
create index if not exists rankings_user_idx    on public.rankings(user_id);
create index if not exists saved_fits_user_idx  on public.saved_fits(user_id, saved_at desc);

-- New brands still get an F-tier ranking by default at the database level; the
-- app overrides this with a researched tier when it has one.
create or replace function public.ensure_brand_ranking()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.rankings (user_id, brand_id, tier, position)
  select new.user_id, new.id, 'F', coalesce(max(position), -1) + 1
  from public.rankings
  where user_id = new.user_id
  on conflict (user_id, brand_id) do nothing;
  return new;
end;
$$;

drop trigger if exists ensure_brand_ranking_on_insert on public.brands;
create trigger ensure_brand_ranking_on_insert
  after insert on public.brands
  for each row execute function public.ensure_brand_ranking();

-- Give every new signup a setup row so the app can show the onboarding choice.
create or replace function public.handle_new_bqi_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_setup (user_id) values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_bqi on auth.users;
create trigger on_auth_user_created_bqi
  after insert on auth.users
  for each row execute function public.handle_new_bqi_user();

-- ---------------------------------------------------------------------------
-- 6. Row Level Security — each user sees only their own rows
-- ---------------------------------------------------------------------------

alter table public.brands       enable row level security;
alter table public.rankings     enable row level security;
alter table public.size_charts  enable row level security;
alter table public.price_guides enable row level security;
alter table public.profile      enable row level security;
alter table public.saved_fits   enable row level security;
alter table public.user_setup   enable row level security;

-- Remove the old anonymous-access policies.
drop policy if exists "Allow public brand reads" on public.brands;
drop policy if exists "Allow public brand writes" on public.brands;
drop policy if exists "Allow public ranking reads" on public.rankings;
drop policy if exists "Allow public ranking writes" on public.rankings;
drop policy if exists "Allow public size chart reads" on public.size_charts;
drop policy if exists "Allow public size chart writes" on public.size_charts;
drop policy if exists "Allow public price guide reads" on public.price_guides;
drop policy if exists "Allow public price guide writes" on public.price_guides;
drop policy if exists "Allow public profile reads" on public.profile;
drop policy if exists "Allow public profile writes" on public.profile;
drop policy if exists "Allow public saved fit reads" on public.saved_fits;
drop policy if exists "Allow public saved fit writes" on public.saved_fits;
drop policy if exists "Allow public fit photo reads" on storage.objects;
drop policy if exists "Allow public fit photo uploads" on storage.objects;
drop policy if exists "Allow public fit photo deletes" on storage.objects;

do $$
declare
  target text;
begin
  foreach target in array array['brands', 'rankings', 'size_charts', 'price_guides', 'profile', 'saved_fits', 'user_setup']
  loop
    execute format('drop policy if exists %I on public.%I', target || '_owner_rw', target);
    execute format(
      'create policy %I on public.%I for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid())',
      target || '_owner_rw', target
    );
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- 7. Fit photo storage — private bucket, one folder per user
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('fit-photos', 'fit-photos', false)
on conflict (id) do update set public = false;

drop policy if exists "Owner fit photo reads" on storage.objects;
drop policy if exists "Owner fit photo uploads" on storage.objects;
drop policy if exists "Owner fit photo updates" on storage.objects;
drop policy if exists "Owner fit photo deletes" on storage.objects;

create policy "Owner fit photo reads" on storage.objects for select to authenticated
  using (bucket_id = 'fit-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Owner fit photo uploads" on storage.objects for insert to authenticated
  with check (bucket_id = 'fit-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Owner fit photo updates" on storage.objects for update to authenticated
  using (bucket_id = 'fit-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Owner fit photo deletes" on storage.objects for delete to authenticated
  using (bucket_id = 'fit-photos' and (storage.foldername(name))[1] = auth.uid()::text);

-- ---------------------------------------------------------------------------
-- 8. Verification report
--
-- The SQL editor shows the last SELECT as a result grid, so success or failure
-- is visible rather than assumed. Every account should show its own counts, and
-- the row for melellard3@gmail.com should carry the full migrated catalog.
-- If this grid does not appear, the script did not finish — scroll up for the
-- error and re-run after fixing it.
-- ---------------------------------------------------------------------------

do $$
declare
  orphan_brands integer;
begin
  select count(*) into orphan_brands from public.brands where user_id is null;
  if orphan_brands > 0 then
    raise warning 'BQI: % brands are still unowned.', orphan_brands;
  else
    raise notice 'BQI migration complete — every row is owned by an account.';
  end if;
end;
$$;

select
  u.email,
  u.id                                                                          as auth_user_id,
  (select count(*) from public.brands      b where b.user_id = u.id)            as brands,
  (select count(*) from public.rankings     r where r.user_id = u.id)           as rankings,
  (select count(*) from public.profile      p where p.user_id = u.id)           as profile_rows,
  (select count(*) from public.saved_fits   f where f.user_id = u.id)           as saved_fits,
  (select s.seeded from public.user_setup   s where s.user_id = u.id)           as onboarded
from auth.users u
order by u.created_at;
