-- Allow authenticated members to read scores and entries from their own league.
--
-- This migration is intentionally scoped to SELECT on predictions and
-- prediction_entries. It does not change league_members policies, score
-- columns, scoring functions, or any data rows.
--
-- The preflight runs before any DDL and fails closed when an existing SELECT
-- policy is restrictive or unconditionally allows every row. This prevents a
-- new permissive policy from being mistaken for a safe league boundary.

do $preflight$
declare
  v_policy record;
begin
  for v_policy in
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
      and p.polcmd in ('r', '*')
    order by c.relname, p.polname
  loop
    raise notice
      'Existing SELECT policy %.%: name=%, roles=%, permissive=%, using=%, with_check=%',
      v_policy.schema_name,
      v_policy.table_name,
      v_policy.policy_name,
      v_policy.roles,
      v_policy.permissive,
      v_policy.using_expression,
      v_policy.check_expression;
  end loop;

  if exists (
    select 1
    from pg_policy as p
    join pg_class as c on c.oid = p.polrelid
    join pg_namespace as n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname in ('predictions', 'prediction_entries')
      and p.polcmd in ('r', '*')
      and not p.polpermissive
  ) then
    raise exception
      'Refusing league-scoped score policy: an existing restrictive SELECT policy was found on predictions or prediction_entries';
  end if;

  if exists (
    select 1
    from pg_policy as p
    join pg_class as c on c.oid = p.polrelid
    join pg_namespace as n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname in ('predictions', 'prediction_entries')
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
      'Refusing league-scoped score policy: an existing unconditionally readable SELECT policy was found on predictions or prediction_entries';
  end if;
end;
$preflight$;

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

alter table public.predictions enable row level security;
alter table public.prediction_entries enable row level security;

grant select on table public.predictions, public.prediction_entries to authenticated;

create policy "league members can read league-scoped prediction scores 2026"
on public.predictions
as permissive
for select
to authenticated
using (public.is_league_score_viewer_2026(league_id));

create policy "league members can read league-scoped prediction entries 2026"
on public.prediction_entries
as permissive
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