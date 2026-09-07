-- BQI tier check — READ ONLY. Run this as a SEPARATE step, after the update.
-- Two grids: the distribution, and a timestamp so you can tell one run from the
-- next when checking whether the values drift back to F on their own.

select
  'tiers now' as check,
  r.tier,
  count(*) as brands
from public.rankings r
where r.user_id = 'a0eb6cf9-c5ed-4fc9-8ab8-4329fb371405'
group by r.tier
order by array_position(array['S','A','B','C','D','F'], r.tier);

select
  'summary' as check,
  now()                                       as checked_at,
  count(*)                                    as total_rows,
  count(*) filter (where tier <> 'F')         as non_f_rows,
  count(distinct tier)                        as distinct_tiers
from public.rankings
where user_id = 'a0eb6cf9-c5ed-4fc9-8ab8-4329fb371405';
