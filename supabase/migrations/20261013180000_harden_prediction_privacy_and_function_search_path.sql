-- Tighten the exposed function surface and make security-sensitive function
-- resolution deterministic. The prediction SELECT policies remain unchanged:
-- users can read their own predictions; league members can read others after
-- the race session is FINISHED.

revoke execute on function public.create_league(text, text) from public, anon;
grant execute on function public.create_league(text, text) to authenticated;

revoke execute on function public.get_league_members(uuid) from public, anon;
grant execute on function public.get_league_members(uuid) to authenticated;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

revoke execute on function public.is_member_of_league(uuid, uuid) from public, anon;
grant execute on function public.is_member_of_league(uuid, uuid) to authenticated;

revoke execute on function public.is_valid_prediction_rider(uuid, uuid) from public, anon;
grant execute on function public.is_valid_prediction_rider(uuid, uuid) to authenticated;

revoke execute on function public.join_league(text) from public, anon;
grant execute on function public.join_league(text) to authenticated;

create or replace function public.is_member_of_league(
  p_league_id uuid,
  p_user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog
as $function$
  select case
    when auth.uid() is null or p_user_id is distinct from auth.uid() then false
    else exists (
      select 1
      from public.league_members as lm
      where lm.league_id = p_league_id
        and lm.user_id = auth.uid()
    )
  end;
$function$;

alter function public.update_prediction_updated_at() set search_path = pg_catalog;
alter function public.calculate_qualifying_time_points(numeric, numeric) set search_path = pg_catalog;
