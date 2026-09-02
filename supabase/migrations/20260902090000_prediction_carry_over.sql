-- Prediction carry-over metadata and idempotent session-close processing.
-- Existing rows are explicitly treated as manual predictions.

alter table public.prediction_entries
  add column if not exists source text not null default 'MANUAL',
  add column if not exists carried_from_grand_prix_id uuid
    references public.grand_prix(id);

alter table public.prediction_entries
  drop constraint if exists prediction_entries_source_check;

alter table public.prediction_entries
  add constraint prediction_entries_source_check
  check (source in ('MANUAL', 'CARRY_OVER'));

create index if not exists prediction_entries_carry_over_source_idx
  on public.prediction_entries (carried_from_grand_prix_id)
  where source = 'CARRY_OVER';

create or replace function public.apply_prediction_carry_over(
  p_rollout_started_at timestamptz default now()
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_gp record;
  v_previous_gp_id uuid;
  v_session record;
  v_member record;
  v_current_prediction_id uuid;
  v_previous_prediction_id uuid;
  v_has_current_entries boolean;
  v_inserted integer := 0;
begin
  -- Prevent two worker instances from copying the same session concurrently.
  perform pg_advisory_xact_lock(hashtext('fanta-motogp:prediction-carry-over'));

  for v_gp in
    select id, season_id, date_start, date_end
    from public.grand_prix
    where is_test = false
      and date_start is not null
      and date_end is not null
      and date_end >= p_rollout_started_at
  loop
    select previous_gp.id
      into v_previous_gp_id
    from public.grand_prix as previous_gp
    where previous_gp.season_id = v_gp.season_id
      and previous_gp.is_test = false
      and previous_gp.date_start is not null
      and previous_gp.date_start < v_gp.date_start
    order by previous_gp.date_start desc
    limit 1;

    -- The first GP of a season has no fallback by definition.
    if v_previous_gp_id is null then
      continue;
    end if;

    for v_session in
      select id, type, session_date
      from public.sessions
      where grand_prix_id = v_gp.id
        and upper(type) in ('Q', 'SPR', 'RAC')
        and session_date is not null
        and session_date <= v_now
    loop
      for v_member in
        select league_id, user_id
        from public.league_members
      loop
        select id
          into v_current_prediction_id
        from public.predictions
        where user_id = v_member.user_id
          and grand_prix_id = v_gp.id
          and league_id = v_member.league_id
        order by created_at asc
        limit 1;

        select previous_prediction.id
          into v_previous_prediction_id
        from public.predictions as previous_prediction
        where previous_prediction.user_id = v_member.user_id
          and previous_prediction.grand_prix_id = v_previous_gp_id
          and previous_prediction.league_id = v_member.league_id
        order by previous_prediction.created_at desc
        limit 1;

        if v_previous_prediction_id is null then
          continue;
        end if;

        if upper(v_session.type) = 'Q' then
          select exists (
            select 1
            from public.prediction_entries
            where prediction_id = v_current_prediction_id
              and prediction_type in ('POLE', 'QUALIFYING_TIME')
          ) into v_has_current_entries;
        elsif upper(v_session.type) = 'SPR' then
          select exists (
            select 1
            from public.prediction_entries
            where prediction_id = v_current_prediction_id
              and prediction_type = 'SPRINT'
          ) into v_has_current_entries;
        else
          select exists (
            select 1
            from public.prediction_entries
            where prediction_id = v_current_prediction_id
              and prediction_type in ('RACE', 'RACE_OUT')
          ) into v_has_current_entries;
        end if;

        -- Any current entry wins over carry-over, including a partial manual
        -- entry, so a manual choice is never overwritten.
        if coalesce(v_has_current_entries, false) then
          continue;
        end if;

        if upper(v_session.type) = 'Q' then
          if not exists (
            select 1
            from public.prediction_entries
            where prediction_id = v_previous_prediction_id
              and prediction_type in ('POLE', 'QUALIFYING_TIME')
          ) then
            continue;
          end if;
        elsif upper(v_session.type) = 'SPR' then
          if not exists (
            select 1
            from public.prediction_entries
            where prediction_id = v_previous_prediction_id
              and prediction_type = 'SPRINT'
          ) then
            continue;
          end if;
        else
          if not exists (
            select 1
            from public.prediction_entries
            where prediction_id = v_previous_prediction_id
              and prediction_type in ('RACE', 'RACE_OUT')
          ) then
            continue;
          end if;
        end if;

        if v_current_prediction_id is null then
          insert into public.predictions (
            user_id,
            grand_prix_id,
            league_id
          )
          values (
            v_member.user_id,
            v_gp.id,
            v_member.league_id
          )
          returning id into v_current_prediction_id;
        end if;

        insert into public.prediction_entries (
          prediction_id,
          prediction_type,
          position,
          rider_id,
          predicted_time,
          points,
          source,
          carried_from_grand_prix_id
        )
        select
          v_current_prediction_id,
          previous_entry.prediction_type,
          previous_entry.position,
          previous_entry.rider_id,
          previous_entry.predicted_time,
          0,
          'CARRY_OVER',
          v_previous_gp_id
        from public.prediction_entries as previous_entry
        where previous_entry.prediction_id = v_previous_prediction_id
          and (
            (upper(v_session.type) = 'Q' and previous_entry.prediction_type in ('POLE', 'QUALIFYING_TIME'))
            or (upper(v_session.type) = 'SPR' and previous_entry.prediction_type = 'SPRINT')
            or (upper(v_session.type) = 'RAC' and previous_entry.prediction_type in ('RACE', 'RACE_OUT'))
          )
          and not exists (
            select 1
            from public.prediction_entries as existing_entry
            where existing_entry.prediction_id = v_current_prediction_id
              and existing_entry.prediction_type = previous_entry.prediction_type
              and existing_entry.position is not distinct from previous_entry.position
          );

        if found then
          v_inserted := v_inserted + 1;
        end if;
      end loop;
    end loop;
  end loop;

  return v_inserted;
end;
$$;

revoke all on function public.apply_prediction_carry_over(timestamptz) from public;
grant execute on function public.apply_prediction_carry_over(timestamptz) to service_role;