-- Allow authenticated members to read only the members, predictions, and
-- prediction entries belonging to leagues in which they participate.
--
-- This migration changes SELECT access only. It does not change score values,
-- prediction rows, the schema, scoring functions, or INSERT/UPDATE/DELETE
-- policies.

-- Fail closed before changing policies when the expected schema or the
-- prediction_entries -> predictions relationship is not present.
do $preflight$
begin
  if to_regclass('public.leagues') is null
     or to_regclass('public.league_members') is null
     or to_regclass('public.predictions') is null
     or to_regclass('public.prediction_entries') is null then
    raise exception
      'Refusing league-scoped score policy: one or more expected public tables are missing';
  end if;

  if not exists (
    select 1
    from pg_attribute
    where attrelid = 'public.leagues'::regclass
      and attname = 'id'
      and not attisdropped
  )
  or not exists (
    select 1
    from pg_attribute
    where attrelid = 'public.league_members'::regclass
      and attname in ('league_id', 'user_id')
      and not attisdropped
    group by attrelid
    having count(*) = 2
  )
  or not exists (
    select 1
    from pg_attribute
    where attrelid = 'public.predictions'::regclass
      and attname in ('id', 'league_id', 'user_id')
      and not attisdropped
    group by attrelid
    having count(*) = 3
  )
  or not exists (
    select 1
    from pg_attribute
    where attrelid = 'public.prediction_entries'::regclass
      and attname in ('id', 'prediction_id')
      and not attisdropped
    group by attrelid
    having count(*) = 2
  ) then
    raise exception
      'Refusing league-scoped score policy: expected access-control columns are missing';
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.prediction_entries'::regclass
      and confrelid = 'public.predictions'::regclass
      and contype = 'f'
      and pg_get_constraintdef(oid) ilike '%prediction_id%'
  ) then
    raise exception
      'Refusing league-scoped score policy: prediction_entries prediction_id foreign key is missing';
  end if;

  if exists (
    select 1
    from pg_policy as p
    join pg_class as c on c.oid = p.polrelid
    join pg_namespace as n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname in ('league_members', 'predictions', 'prediction_entries')
      and p.polcmd in ('r', '*')
      and not p.polpermissive
  ) then
    raise exception
      'Refusing league-scoped score policy: a restrictive SELECT policy exists on an affected table';
  end if;

  if exists (
    select 1
    from pg_policy as p
    join pg_class as c on c.oid = p.polrelid
    join pg_namespace as n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname in ('league_members', 'predictions', 'prediction_entries')
      and p.polcmd in ('r', '*')
      and (
        p.polqual is null
        or regexp_replace(
          lower(pg_get_expr(p.polqual, p.polrelid)),
          '\s+',
          '',
          'g'
        ) in ('true', '(true)')
      )
  ) then
    raise exception
      'Refusing league-scoped score policy: an unconditionally readable SELECT policy exists on an affected table';
  end if;
end;
$preflight$;

-- SECURITY DEFINER avoids recursive evaluation when the league_members SELECT
-- policy checks whether the viewer belongs to the row's league.
create or replace function public.is_league_score_viewer_2026(
  p_league_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $function$
  select
    p_league_id is not null
    and auth.uid() is not null
    and exists (
      select 1
      from public.league_members as viewer_membership
      where viewer_membership.league_id = p_league_id
        and viewer_membership.user_id = auth.uid()
    );
$function$;

revoke all on function public.is_league_score_viewer_2026(uuid) from public;
grant execute on function public.is_league_score_viewer_2026(uuid) to authenticated;

alter table public.league_members enable row level security;
alter table public.predictions enable row level security;
alter table public.prediction_entries enable row level security;

grant select on table
  public.league_members,
  public.predictions,
  public.prediction_entries
to authenticated;

-- Remove only the known owner-only SELECT policies and the policy names from
-- the earlier repository migration. Write policies are intentionally untouched.
drop policy if exists "Users can view their own memberships"
  on public.league_members;
drop policy if exists "Users can view own memberships"
  on public.league_members;

drop policy if exists "Users can view own predictions"
  on public.predictions;
drop policy if exists "predictions_select_own"
  on public.predictions;
drop policy if exists "league members can read league-scoped prediction scores 2026"
  on public.predictions;

drop policy if exists "Users can view own prediction entries"
  on public.prediction_entries;
drop policy if exists "prediction_entries_select_own"
  on public.prediction_entries;
drop policy if exists "league members can read league-scoped prediction entries 2026"
  on public.prediction_entries;

create policy "Members can view members of their leagues"
on public.league_members
for select
to authenticated
using (public.is_league_score_viewer_2026(league_id));

create policy "Members can view predictions in their leagues"
on public.predictions
for select
to authenticated
using (public.is_league_score_viewer_2026(league_id));

create policy "Members can view prediction entries in their leagues"
on public.prediction_entries
for select
to authenticated
using (
  exists (
    select 1
    from public.predictions as score_prediction
    where score_prediction.id = prediction_entries.prediction_id
      and public.is_league_score_viewer_2026(score_prediction.league_id)
  )
);