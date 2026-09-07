-- BQI ownership diagnostic. READ-ONLY — every statement is a SELECT.
-- Nothing is modified, deleted, or reassigned. Run it all; send back all grids.
--
-- Why this is needed: rankings has a foreign key
--   rankings (user_id, brand_id) -> brands (user_id, id)
-- so a ranking row CANNOT be owned by an account that does not also own the
-- matching brand. "The rankings have the wrong user_id" therefore cannot be
-- true on its own. Meanwhile the app runs the same .eq("user_id", <id>) filter
-- against both tables and gets 205 brands but 0 rankings. The only shape that
-- fits is more than one account, with the restore having written to one of them
-- and the browser signed in as the other.
--
-- Nothing below filters by email — that is the point. The earlier scripts looked
-- the account up with `where lower(email) = ... limit 1`, which silently picks
-- one row if two exist. These grids show every account instead.

-- ---------------------------------------------------------------------------
-- 1. Every auth user. Look for two rows, or two rows sharing an email.
-- ---------------------------------------------------------------------------
select
  '1. auth users' as check,
  u.id            as auth_user_id,
  u.email,
  u.created_at,
  u.last_sign_in_at,
  u.email_confirmed_at is not null as confirmed,
  u.deleted_at
from auth.users u
order by u.created_at;

-- ---------------------------------------------------------------------------
-- 2. Duplicate emails — the failure mode `limit 1` hides.
-- ---------------------------------------------------------------------------
select '2. duplicate emails' as check, lower(email) as email, count(*) as accounts
from auth.users
group by lower(email)
having count(*) > 1;

-- ---------------------------------------------------------------------------
-- 3. Who actually owns what. Grouped by the raw user_id on the rows themselves,
-- joined out to an email only for readability.
-- ---------------------------------------------------------------------------
select
  '3. ownership' as check,
  o.user_id,
  u.email,
  o.brands,
  o.rankings,
  o.size_charts,
  o.price_guides,
  o.saved_fits,
  o.profile_rows
from (
  select user_id,
         count(*) filter (where src = 'brands')       as brands,
         count(*) filter (where src = 'rankings')     as rankings,
         count(*) filter (where src = 'size_charts')  as size_charts,
         count(*) filter (where src = 'price_guides') as price_guides,
         count(*) filter (where src = 'saved_fits')   as saved_fits,
         count(*) filter (where src = 'profile')      as profile_rows
  from (
    select user_id, 'brands'       as src from public.brands
    union all select user_id, 'rankings'     from public.rankings
    union all select user_id, 'size_charts'  from public.size_charts
    union all select user_id, 'price_guides' from public.price_guides
    union all select user_id, 'saved_fits'   from public.saved_fits
    union all select user_id, 'profile'      from public.profile
  ) all_rows
  group by user_id
) o
left join auth.users u on u.id = o.user_id
order by o.brands desc nulls last;

-- ---------------------------------------------------------------------------
-- 4. Unfiltered totals. If brands is well above 205, the catalog was duplicated
-- under a second account rather than moved.
-- ---------------------------------------------------------------------------
select
  '4. totals' as check,
  (select count(*) from public.brands)                     as brands_total,
  (select count(*) from public.rankings)                   as rankings_total,
  (select count(distinct user_id) from public.brands)      as distinct_brand_owners,
  (select count(distinct user_id) from public.rankings)    as distinct_ranking_owners;

-- ---------------------------------------------------------------------------
-- 5. Tier distribution per owner — shows which account actually holds the
-- restored tiers, and which holds a flat wall of F.
-- ---------------------------------------------------------------------------
select '5. tiers by owner' as check, r.user_id, u.email, r.tier, count(*) as brands
from public.rankings r
left join auth.users u on u.id = r.user_id
group by r.user_id, u.email, r.tier
order by r.user_id, array_position(array['S','A','B','C','D','F'], r.tier);

-- ---------------------------------------------------------------------------
-- 6. Onboarding state per account — a `seeded=false` row is an account that
-- would be offered the "base list / blank" choice on next load.
-- ---------------------------------------------------------------------------
select '6. setup' as check, s.user_id, u.email, s.seeded, s.seed_choice, s.created_at
from public.user_setup s
left join auth.users u on u.id = s.user_id
order by s.created_at;
