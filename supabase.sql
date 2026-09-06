create table if not exists public.brands (
  id integer primary key,
  name text not null,
  notes text not null default '',
  categories text[] not null default array['Clothing']::text[]
);

alter table public.brands add column if not exists categories text[] not null default array['Clothing']::text[];
update public.brands set categories = array['Clothing']::text[] where categories is null or cardinality(categories) = 0;
update public.brands set categories = array['Clothing', 'Shoes']::text[] where name in ('Steve Madden', 'Vince Camuto', 'Gianni Bini');
update public.brands set categories = array['Clothing', 'Handbags', 'Accessories']::text[] where name in ('Fendi', 'Pinko');
update public.brands set categories = array['Clothing', 'Accessories']::text[] where name in ('Calvin Klein', 'Ted Baker', 'Red Carter');

create table if not exists public.rankings (
  brand_id integer primary key references public.brands(id) on delete cascade,
  tier text not null check (tier in ('S', 'A', 'B', 'C', 'D', 'F')),
  position integer not null
);

create or replace function public.ensure_brand_ranking()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.rankings (brand_id, tier, position)
  select new.id, 'F', coalesce(max(position), -1) + 1
  from public.rankings
  where not exists (
    select 1 from public.rankings where brand_id = new.id
  );
  return new;
end;
$$;

drop trigger if exists ensure_brand_ranking_on_insert on public.brands;
create trigger ensure_brand_ranking_on_insert
  after insert on public.brands
  for each row execute function public.ensure_brand_ranking();

create table if not exists public.size_charts (
  brand_id integer primary key references public.brands(id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.price_guides (
  brand_id integer primary key references public.brands(id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.profile (
  id integer primary key check (id = 1),
  name text not null default '',
  measurements jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

update public.profile set name = 'Mel' where id = 1 and (name is null or name = '');

create table if not exists public.saved_fits (
  id uuid primary key default gen_random_uuid(),
  brand text not null,
  label text not null,
  photo_url text,
  measurements jsonb not null default '{}'::jsonb,
  size text,
  material text,
  fit_verdict text not null,
  confirmed_fit text not null default 'Not yet confirmed' check (confirmed_fit in ('Not yet confirmed', 'Fits', 'Doesn''t fit')),
  fit_reasoning text,
  original_text text not null,
  saved_at timestamptz not null default now()
);

alter table public.saved_fits add column if not exists confirmed_fit text not null default 'Not yet confirmed';
update public.saved_fits set confirmed_fit = 'Not yet confirmed' where confirmed_fit is null or confirmed_fit not in ('Not yet confirmed', 'Fits', 'Doesn''t fit');

insert into storage.buckets (id, name, public)
values ('fit-photos', 'fit-photos', true)
on conflict (id) do update set public = true;

alter table public.brands enable row level security;
alter table public.rankings enable row level security;
alter table public.size_charts enable row level security;
alter table public.price_guides enable row level security;
alter table public.profile enable row level security;
alter table public.saved_fits enable row level security;

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

create policy "Allow public brand reads"
  on public.brands for select to anon using (true);
create policy "Allow public brand writes"
  on public.brands for all to anon using (true) with check (true);

create policy "Allow public ranking reads"
  on public.rankings for select to anon using (true);
create policy "Allow public ranking writes"
  on public.rankings for all to anon using (true) with check (true);

create policy "Allow public size chart reads"
  on public.size_charts for select to anon using (true);
create policy "Allow public size chart writes"
  on public.size_charts for all to anon using (true) with check (true);

create policy "Allow public price guide reads"
  on public.price_guides for select to anon using (true);
create policy "Allow public price guide writes"
  on public.price_guides for all to anon using (true) with check (true);

create policy "Allow public profile reads"
  on public.profile for select to anon using (true);
create policy "Allow public profile writes"
  on public.profile for all to anon using (true) with check (true);

create policy "Allow public saved fit reads"
  on public.saved_fits for select to anon using (true);
create policy "Allow public saved fit writes"
  on public.saved_fits for all to anon using (true) with check (true);

create policy "Allow public fit photo reads"
  on storage.objects for select to anon using (bucket_id = 'fit-photos');
create policy "Allow public fit photo uploads"
  on storage.objects for insert to anon with check (bucket_id = 'fit-photos');
create policy "Allow public fit photo deletes"
  on storage.objects for delete to anon using (bucket_id = 'fit-photos');
