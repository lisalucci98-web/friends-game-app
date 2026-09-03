-- Task 41 read-only audit queries.
--
-- Run these statements in the Supabase SQL editor or another authorized SQL
-- channel. They do not change policies, data, scores, or session state.

-- 1) Inspect the current SELECT policies before applying the migration.
select
  n.nspname as schema_name,
  c.relname as table_name,
  p.polname as policy_name,
  p.polroles as roles,
  p.polcmd as command,
  p.polpermissive as permissive,
  pg_get_expr(p.polqual, p.polrelid) as using_expression,
  pg_get_expr(p.polwithcheck, p.polrelid) as check_expression
from pg_policy as p
join pg_class as c on c.oid = p.polrelid
join pg_namespace as n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('league_members', 'predictions', 'prediction_entries')
order by c.relname, p.polname;

-- 2) Confirm the exact grants and RLS flags after applying the migration.
select
  c.relname as table_name,
  c.relrowsecurity as row_level_security_enabled,
  c.relforcerowsecurity as row_level_security_forced,
  has_table_privilege('authenticated', c.oid, 'select') as authenticated_can_select
from pg_class as c
join pg_namespace as n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('league_members', 'predictions', 'prediction_entries')
order by c.relname;

-- 3) Register the score counts for TEST01 without recalculating or updating
--    total_points. The query intentionally reports stored values only.
with target_league as (
  select id
  from public.leagues
  where invite_code = 'TEST01'
),
score_rows as (
  select
    p.user_id,
    p.grand_prix_id,
    p.total_points
  from public.predictions as p
  join target_league as l on l.id = p.league_id
)
select
  user_id,
  grand_prix_id,
  count(*) as prediction_count,
  count(*) filter (where total_points is not null) as gp_with_total_points,
  sum(total_points) as total_points
from score_rows
group by user_id, grand_prix_id
order by user_id, grand_prix_id;

-- 4) Authenticated positive check. Run once while signed in as each of
--    Nicholas, Alessandro, and a third TEST01 participant. The returned rows
--    must contain only TEST01 records for that viewer.
select
  p.user_id,
  p.grand_prix_id,
  p.league_id,
  p.total_points
from public.predictions as p
join public.leagues as l on l.id = p.league_id
where l.invite_code = 'TEST01'
order by p.user_id, p.grand_prix_id;

-- 5) Authenticated negative check. Replace the UUID with a prediction from a
-- different league. Run as a TEST01 member; this must return zero rows.
select
  p.id,
  p.user_id,
  p.grand_prix_id,
  p.league_id,
  p.total_points
from public.predictions as p
where p.id = '<OTHER_LEAGUE_PREDICTION_UUID>'::uuid;

-- 6) Repeat the negative check for its entries; this must also return zero.
select
  e.id,
  e.prediction_id,
  e.prediction_type,
  e.position,
  e.points
from public.prediction_entries as e
where e.prediction_id = '<OTHER_LEAGUE_PREDICTION_UUID>'::uuid;