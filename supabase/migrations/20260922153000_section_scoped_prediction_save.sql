-- Allow authenticated league members to save Qualifying, Sprint, and Race
-- predictions independently. Each call replaces only the selected section.

create or replace function public.submit_prediction_section(
  p_grand_prix_id uuid,
  p_league_id uuid,
  p_section text,
  p_qualifying_pole_rider_id uuid default null,
  p_qualifying_pole_time numeric default null,
  p_rider_ids uuid[] default null,
  p_race_out_rider_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_user_id uuid := auth.uid();
  v_section text := upper(trim(coalesce(p_section, '')));
  v_prediction_id uuid;
  v_season_id uuid;
  v_deadline timestamptz;
  v_expected_riders integer;
  v_valid_riders integer;
  v_all_rider_ids uuid[];
begin
  if v_user_id is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  if v_section not in ('QUALIFYING', 'SPRINT', 'RACE') then
    raise exception 'INVALID_PREDICTION_SECTION';
  end if;

  if not exists (
    select 1
    from public.league_members
    where league_id = p_league_id
      and user_id = v_user_id
  ) then
    raise exception 'NOT_A_LEAGUE_MEMBER';
  end if;

  select season_id
    into v_season_id
  from public.grand_prix
  where id = p_grand_prix_id;

  if v_season_id is null then
    raise exception 'INVALID_GRAND_PRIX';
  end if;

  -- Share the scoring lock: a submission cannot replace entries after the
  -- importer has closed/scored a section while this transaction was waiting.
  perform pg_advisory_xact_lock(hashtextextended('section-score:' || p_grand_prix_id::text, 0));

  select session_date
    into v_deadline
  from public.sessions
  where grand_prix_id = p_grand_prix_id
    and (
      (v_section = 'QUALIFYING' and upper(type) = 'Q' and coalesce(number, 1) = 1)
      or (v_section = 'SPRINT' and upper(type) = 'SPR')
      or (v_section = 'RACE' and upper(type) = 'RAC')
    )
  order by
    case when v_section = 'RACE' and coalesce(number, 1) = 1 then 0 else 1 end,
    session_date asc
  limit 1;

  if v_deadline is null then
    raise exception 'SESSION_NOT_AVAILABLE';
  end if;

  -- session_date is stored with the official Italian wall-clock value. Match
  -- the frontend deadline rule by comparing that value with the Rome clock.
  if timezone('Europe/Rome', clock_timestamp()) >= timezone('UTC', v_deadline)
     or exists (
       select 1 from public.sessions where grand_prix_id = p_grand_prix_id
         and upper(type) = case v_section when 'QUALIFYING' then 'Q' when 'SPRINT' then 'SPR' else 'RAC' end
         and upper(status) in ('FINISHED','COMPLETED','CLASSIFIED','CLOSED')
     ) then
    raise exception '%_PREDICTION_CLOSED', v_section;
  end if;

  if v_section = 'QUALIFYING' then
    if p_qualifying_pole_rider_id is null
       or p_qualifying_pole_time is null
       or p_qualifying_pole_time <= 0 then
      raise exception 'INVALID_QUALIFYING_TIME';
    end if;
    v_all_rider_ids := array[p_qualifying_pole_rider_id];
  elsif v_section = 'SPRINT' then
    if cardinality(p_rider_ids) <> 3
       or exists (
         select 1
         from unnest(p_rider_ids) as selected(rider_id)
         where selected.rider_id is null
       )
       or (
         select count(distinct selected.rider_id)
         from unnest(p_rider_ids) as selected(rider_id)
       ) <> 3 then
      raise exception 'INVALID_SPRINT_RIDER';
    end if;
    v_all_rider_ids := p_rider_ids;
  else
    if cardinality(p_rider_ids) <> 5
       or p_race_out_rider_id is null
       or exists (
         select 1
         from unnest(p_rider_ids) as selected(rider_id)
         where selected.rider_id is null
       )
       or (
         select count(distinct selected.rider_id)
         from unnest(p_rider_ids) as selected(rider_id)
       ) <> 5 then
      raise exception 'INVALID_RIDER';
    end if;
    if p_race_out_rider_id = any(p_rider_ids) then
      raise exception 'OUT_RIDER_IN_TOP5';
    end if;
    v_all_rider_ids := p_rider_ids || p_race_out_rider_id;
  end if;

  v_expected_riders := cardinality(v_all_rider_ids);
  select count(distinct rider_id)
    into v_valid_riders
  from public.rider_seasons
  where season_id = v_season_id
    and active = true
    and rider_id = any(v_all_rider_ids);

  if v_valid_riders <> v_expected_riders then
    raise exception 'INVALID_RIDER';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(
      v_user_id::text || ':' || p_grand_prix_id::text || ':' || p_league_id::text,
      0
    )
  );

  select id
    into v_prediction_id
  from public.predictions
  where user_id = v_user_id
    and grand_prix_id = p_grand_prix_id
    and league_id = p_league_id
  order by created_at asc
  limit 1
  for update;

  if v_prediction_id is null then
    insert into public.predictions (user_id, grand_prix_id, league_id)
    values (v_user_id, p_grand_prix_id, p_league_id)
    returning id into v_prediction_id;
  end if;

  if v_section = 'QUALIFYING' then
    update public.predictions
    set qualifying_pole_time = p_qualifying_pole_time,
        qualifying_points = 0,
        total_points = sprint_points + race_points + bonus_points + malus_points,
        updated_at = now()
    where id = v_prediction_id;

    delete from public.prediction_entries
    where prediction_id = v_prediction_id
      and prediction_type in ('POLE', 'QUALIFYING_TIME');

    insert into public.prediction_entries (
      prediction_id,
      prediction_type,
      position,
      rider_id,
      predicted_time,
      points
    )
    values
      (
        v_prediction_id,
        'QUALIFYING_TIME',
        null,
        p_qualifying_pole_rider_id,
        p_qualifying_pole_time,
        0
      ),
      (
        v_prediction_id,
        'POLE',
        null,
        p_qualifying_pole_rider_id,
        null,
        0
      );
  elsif v_section = 'SPRINT' then
    update public.predictions
    set sprint_points = 0,
        total_points = qualifying_points + race_points + bonus_points + malus_points,
        updated_at = now()
    where id = v_prediction_id;

    delete from public.prediction_entries
    where prediction_id = v_prediction_id
      and prediction_type = 'SPRINT';

    insert into public.prediction_entries (
      prediction_id,
      prediction_type,
      position,
      rider_id,
      predicted_time,
      points
    )
    select
      v_prediction_id,
      'SPRINT',
      ordinal::integer,
      rider_id,
      null,
      0
    from unnest(p_rider_ids) with ordinality as sprint_rider(rider_id, ordinal);
  else
    update public.predictions
    set race_points = 0,
        bonus_points = 0,
        malus_points = 0,
        total_points = qualifying_points + sprint_points,
        updated_at = now()
    where id = v_prediction_id;

    delete from public.prediction_entries
    where prediction_id = v_prediction_id
      and prediction_type in ('RACE', 'RACE_OUT');

    insert into public.prediction_entries (
      prediction_id,
      prediction_type,
      position,
      rider_id,
      predicted_time,
      points
    )
    select
      v_prediction_id,
      'RACE',
      ordinal::integer,
      rider_id,
      null,
      0
    from unnest(p_rider_ids) with ordinality as race_rider(rider_id, ordinal);

    insert into public.prediction_entries (
      prediction_id,
      prediction_type,
      position,
      rider_id,
      predicted_time,
      points
    )
    values (
      v_prediction_id,
      'RACE_OUT',
      null,
      p_race_out_rider_id,
      null,
      0
    );
  end if;

  return v_prediction_id;
end;
$function$;

revoke all on function public.submit_prediction_section(
  uuid,
  uuid,
  text,
  uuid,
  numeric,
  uuid[],
  uuid
) from public;

grant execute on function public.submit_prediction_section(
  uuid,
  uuid,
  text,
  uuid,
  numeric,
  uuid[],
  uuid
) to authenticated;