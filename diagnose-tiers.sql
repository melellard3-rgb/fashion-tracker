-- BQI tier-loss diagnostic. READ-ONLY — every statement is a SELECT.
-- Nothing here modifies, deletes, or restores anything.
-- Run the whole file in the Supabase SQL editor and send back all six grids.

-- ---------------------------------------------------------------------------
-- A. CANARY: did Claude's anonymous write probes actually touch anything?
--
-- Those probes attempted UPDATE brands SET notes='ZZ_RLS_PROBE' (all rows) and
-- UPDATE profile SET name='ZZ_RLS_PROBE', alongside DELETE attempts on brands
-- and rankings. PostgREST filters UPDATE and DELETE through the *same* RLS
-- USING predicate, so if these counts are 0 the UPDATEs matched no rows, which
-- means the DELETEs matched no rows either — the probes are cleared.
-- Any non-zero count here means anonymous writes are landing, which is both the
-- cause of this incident and an open security hole.
-- ---------------------------------------------------------------------------
select
  'A. canary'                                                         as check,
  (select count(*) from public.brands  where notes = 'ZZ_RLS_PROBE')  as brands_touched_by_probe,
  (select count(*) from public.profile where name  = 'ZZ_RLS_PROBE')  as profile_touched_by_probe;

-- ---------------------------------------------------------------------------
-- B. Current tier distribution. Expected today: 205 rows, all 'F'.
-- ---------------------------------------------------------------------------
select 'B. tiers now' as check, tier, count(*) as brands
from public.rankings
group by tier
order by array_position(array['S','A','B','C','D','F'], tier);

-- ---------------------------------------------------------------------------
-- C. Does ANY original tier data survive anywhere in the table — under a
-- different user_id, or unowned? If this returns rows, recovery is trivial.
-- ---------------------------------------------------------------------------
select 'C. survivors' as check, user_id, tier, count(*) as rows
from public.rankings
where tier <> 'F'
group by user_id, tier
order by user_id, tier;

-- ---------------------------------------------------------------------------
-- D. Ownership: how much does each account actually hold?
-- Two rows here would mean a second auth user exists and data is split.
-- ---------------------------------------------------------------------------
select
  'D. ownership' as check,
  u.email,
  u.id                                                              as auth_user_id,
  (select count(*) from public.brands   b where b.user_id = u.id)   as brands,
  (select count(*) from public.rankings r where r.user_id = u.id)   as rankings,
  (select count(*) from public.saved_fits f where f.user_id = u.id) as saved_fits
from auth.users u
order by u.created_at;

-- ---------------------------------------------------------------------------
-- E. Timing. `position` is assigned 0..N in the order rows were written.
-- If every row shares one write burst, they were all recreated at once — the
-- signature of the app's auto-repair rather than of the migration.
-- ---------------------------------------------------------------------------
select
  'E. shape' as check,
  count(*)            as ranking_rows,
  min(position)       as min_position,
  max(position)       as max_position,
  count(distinct tier) as distinct_tiers
from public.rankings;

-- ---------------------------------------------------------------------------
-- F. Is a point-in-time restore available? This shows how far back WAL retention
-- currently reaches. Also check Dashboard → Database → Backups.
-- ---------------------------------------------------------------------------
select 'F. recovery' as check,
       current_setting('server_version') as pg_version,
       pg_is_in_recovery()               as in_recovery,
       (select min(saved_at) from public.saved_fits) as oldest_saved_fit;
