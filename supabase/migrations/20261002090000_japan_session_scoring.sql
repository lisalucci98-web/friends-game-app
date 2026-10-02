-- Enable ONLY Japan 2026. No historical predictions are recalculated.
-- Apply after the section-scoped submission migration.
begin;

create table if not exists public.automatic_scoring_events (
  grand_prix_id uuid primary key references public.grand_prix(id),
  enabled boolean not null default true
);
create table if not exists public.prediction_section_runs (
  grand_prix_id uuid not null references public.grand_prix(id),
  section text not null check (section in ('Q', 'SPR', 'RAC')),
  fingerprint text not null,
  scored_at timestamptz not null default now(),
  predictions_scored integer not null,
  primary key (grand_prix_id, section)
);
alter table public.automatic_scoring_events enable row level security;
alter table public.prediction_section_runs enable row level security;
revoke all on public.automatic_scoring_events, public.prediction_section_runs from public, anon, authenticated;
grant all on public.automatic_scoring_events, public.prediction_section_runs to service_role;
insert into public.automatic_scoring_events (grand_prix_id)
select gp.id from public.grand_prix gp join public.seasons s on s.id = gp.season_id
where gp.short_name = 'JPN' and s.year = 2026 and gp.is_test = false
on conflict (grand_prix_id) do nothing;

-- Narrow server-only RPC: one section, one explicitly enabled GP, one transaction.
create or replace function public.score_finished_prediction_section(
  p_grand_prix_id uuid,
  p_section text
) returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_session public.sessions%rowtype;
  v_prediction public.predictions%rowtype;
  v_entry public.prediction_entries%rowtype;
  v_fingerprint text;
  v_official integer;
  v_points integer;
  v_sum integer;
  v_exact integer;
  v_hits integer;
  v_nc integer;
  v_bonus integer;
  v_malus integer;
  v_out uuid;
  v_out_ids uuid[];
  v_time numeric;
  v_predicted numeric;
  v_error numeric;
  v_time_text text;
  v_count integer := 0;
  v_session_ids uuid[];
  v_types text[];
begin
  if p_section not in ('Q', 'SPR', 'RAC') then raise exception 'INVALID_SECTION'; end if;
  if not exists (
    select 1 from public.automatic_scoring_events
    where grand_prix_id = p_grand_prix_id and enabled
  ) then raise exception 'AUTOMATION_NOT_ENABLED'; end if;
  perform pg_advisory_xact_lock(hashtextextended('section-score:' || p_grand_prix_id::text, 0));
  -- Q2 determines the pole. For restarted races, final classification wins;
  -- OUTs are collected from all parts and every part must be finished.
  select * into v_session from public.sessions
  where grand_prix_id = p_grand_prix_id
    and (type = p_section or (p_section = 'RAC' and type = 'RAC2'))
  order by coalesce(number, 0) desc, session_date desc
  limit 1;
  if v_session.id is null or coalesce(upper(v_session.status),'') not in ('FINISHED','COMPLETED','CLASSIFIED','CLOSED') then
    return jsonb_build_object('status','waiting_for_session');
  end if;
  select array_agg(id) into v_session_ids from public.sessions
  where grand_prix_id = p_grand_prix_id
    and (id = v_session.id or (p_section = 'RAC' and type in ('RAC','RAC2')));
  if exists (
    select 1 from public.sessions where id = any(v_session_ids)
    and coalesce(upper(status),'') not in ('FINISHED','COMPLETED','CLASSIFIED','CLOSED')
  ) then return jsonb_build_object('status','waiting_for_session'); end if;
  if (select count(distinct position) from public.session_results
      where session_id = v_session.id and status = 'CLASSIFIED'
      and position between 1 and case p_section when 'Q' then 2 when 'SPR' then 3 else 5 end)
     <> (case p_section when 'Q' then 2 when 'SPR' then 3 else 5 end)
     or exists (
       select 1 from public.session_results
       where session_id = v_session.id and status = 'CLASSIFIED' and position is not null
       group by position having count(*) > 1
     )
     or exists (
       select 1 from unnest(v_session_ids) as part(id)
       where not exists (select 1 from public.session_results where session_id = part.id)
     ) then
    return jsonb_build_object('status','waiting_for_verified_results');
  end if;
  if exists (select 1 from public.session_results where session_id = any(v_session_ids)
             and (source_url is null or source_url = '')) then
    return jsonb_build_object('status','waiting_for_verified_results');
  end if;
  v_types := case p_section when 'Q' then array['POLE','QUALIFYING_TIME']
             when 'SPR' then array['SPRINT'] else array['RACE','RACE_OUT'] end;
  -- Exclude calculated points/timestamps so our own writes don't change the hash.
  select md5(
    coalesce((select jsonb_agg(jsonb_build_array(session_id,rider_id,position,status,total_time,source_url)
      order by session_id,rider_id)::text from public.session_results
      where session_id = any(v_session_ids)), '[]')
    || coalesce((select jsonb_agg(jsonb_build_array(p.id,p.qualifying_pole_time,e.id,e.prediction_type,
          e.position,e.rider_id,e.predicted_time) order by p.id,e.id)::text
      from public.predictions p left join public.prediction_entries e
      on e.prediction_id = p.id and e.prediction_type = any(v_types)
      where p.grand_prix_id = p_grand_prix_id), '[]')
  ) into v_fingerprint;
  if exists (select 1 from public.prediction_section_runs where grand_prix_id = p_grand_prix_id
             and section = p_section and fingerprint = v_fingerprint) then
    return jsonb_build_object('status','already_scored');
  end if;
  if p_section = 'Q' then
    select total_time into v_time_text from public.session_results
    where session_id = v_session.id and position = 1 and status = 'CLASSIFIED';
    v_time_text := replace(replace(v_time_text, '''', ':'), ',', '.');
    if v_time_text ~ '^[0-9]+:[0-9]{1,2}[.][0-9]+$' then
      v_time := split_part(v_time_text, ':', 1)::numeric * 60
                + split_part(v_time_text, ':', 2)::numeric;
    elsif v_time_text ~ '^[0-9]+[.][0-9]+$' then v_time := v_time_text::numeric;
    else return jsonb_build_object('status','invalid_official_pole_time'); end if;
    if v_time <= 0 then return jsonb_build_object('status','invalid_official_pole_time'); end if;
  end if;
  select coalesce(array_agg(distinct rider_id), '{}'::uuid[]) into v_out_ids
  from public.session_results where session_id = any(v_session_ids)
    and upper(status) in ('NC','NOT CLASSIFIED','NOT_CLASSIFIED','NOT ON RESTART GRID',
      'NOT_ON_RESTART_GRID','DNF','DNS','DSQ','RETIRED','WITHDRAWN');
  for v_prediction in select * from public.predictions
    where grand_prix_id = p_grand_prix_id for update
  loop
    v_sum := 0; v_exact := 0; v_hits := 0; v_nc := 0; v_bonus := 0; v_malus := 0;
    for v_entry in select * from public.prediction_entries
      where prediction_id = v_prediction.id and prediction_type = any(v_types)
    loop
      v_points := 0;
      select position into v_official from public.session_results
      where session_id = v_session.id and rider_id = v_entry.rider_id and status = 'CLASSIFIED';
      if p_section = 'Q' then
        if v_entry.prediction_type = 'POLE' then
          v_points := case v_official when 1 then 5 when 2 then 2 else 0 end;
        else
          v_predicted := coalesce(v_entry.predicted_time, v_prediction.qualifying_pole_time);
          v_error := abs(v_predicted - v_time);
          v_points := case when v_predicted is null or v_predicted <= 0 then 0
            when v_error <= 0.010 then 10 when v_error <= v_time * 0.001 then 5
            when v_error <= v_time * 0.0025 then 3 when v_error <= v_time * 0.005 then 1 else 0 end;
        end if;
      elsif p_section = 'SPR' and v_entry.position between 1 and 3 and v_official between 1 and 3 then
        v_points := case abs(v_entry.position - v_official) when 0 then 3 when 1 then 1 else 0 end;
      elsif p_section = 'RAC' then
        if v_entry.prediction_type = 'RACE_OUT' then
          if v_entry.rider_id = any(v_out_ids) then v_points := 2; end if;
          v_bonus := v_bonus + v_points;
        elsif v_entry.position between 1 and 5 then
          if v_official between 1 and 5 then
            v_points := case abs(v_entry.position - v_official) when 0 then 5 when 1 then 3 else 1 end;
            v_hits := v_hits + 1;
            if v_entry.position = v_official then v_exact := v_exact + 1; end if;
          end if;
          if v_entry.rider_id = any(v_out_ids) then v_nc := v_nc + 1; end if;
        end if;
      end if;
      update public.prediction_entries set points = v_points where id = v_entry.id;
      if v_entry.prediction_type <> 'RACE_OUT' then v_sum := v_sum + v_points; end if;
    end loop;
    if p_section = 'Q' then
      update public.predictions set qualifying_points = v_sum where id = v_prediction.id;
    elsif p_section = 'SPR' then
      update public.predictions set sprint_points = v_sum where id = v_prediction.id;
    else
      v_bonus := v_bonus + case v_exact when 5 then 5 when 4 then 3 when 3 then 1 else 0 end
                 + case when v_hits = 5 then 2 else 0 end;
      v_malus := case when v_nc >= 5 then -10 when v_nc >= 3 then -5 when v_nc >= 1 then -1 else 0 end;
      select rider_id into v_out from public.prediction_entries
      where prediction_id = v_prediction.id and prediction_type = 'RACE_OUT' limit 1;
      if exists (select 1 from public.prediction_entries where prediction_id = v_prediction.id
                 and prediction_type = 'RACE' and rider_id = v_out) then v_malus := v_malus - 2; end if;
      update public.predictions set race_points = v_sum, bonus_points = v_bonus, malus_points = v_malus
      where id = v_prediction.id;
    end if;
    update public.predictions set
      total_points = qualifying_points + sprint_points + race_points + bonus_points + malus_points,
      scored_at = now(), updated_at = now()
    where id = v_prediction.id;
    v_count := v_count + 1;
  end loop;
  insert into public.prediction_section_runs(grand_prix_id,section,fingerprint,predictions_scored)
  values(p_grand_prix_id,p_section,v_fingerprint,v_count)
  on conflict(grand_prix_id,section) do update set fingerprint = excluded.fingerprint,
    predictions_scored = excluded.predictions_scored, scored_at = now();
  return jsonb_build_object('status','scored','predictions_scored',v_count);
end;
$$;
revoke all on function public.score_finished_prediction_section(uuid,text) from public, anon, authenticated;
grant execute on function public.score_finished_prediction_section(uuid,text) to service_role;

-- Official importer uses this RPC rather than separate REST writes. Result
-- rows, closing the section and scoring commit together or all roll back.
create or replace function public.import_and_score_prediction_section(
  p_grand_prix_id uuid, p_section text, p_results jsonb
) returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_ids uuid[];
  v_close_ids uuid[];
  v_score jsonb;
begin
  if p_section not in ('Q','SPR','RAC') or jsonb_typeof(p_results) <> 'array'
     or coalesce(jsonb_array_length(p_results),0) = 0 then raise exception 'INVALID_RESULT_PAYLOAD'; end if;
  if not exists (select 1 from public.automatic_scoring_events
                 where grand_prix_id = p_grand_prix_id and enabled) then
    raise exception 'AUTOMATION_NOT_ENABLED';
  end if;
  perform pg_advisory_xact_lock(hashtextextended('section-score:' || p_grand_prix_id::text, 0));
  select array_agg(distinct (r->>'session_id')::uuid) into v_ids
  from jsonb_array_elements(p_results) r;
  if exists (
    select 1 from jsonb_array_elements(p_results) r left join public.sessions s
      on s.id = (r->>'session_id')::uuid
    where s.id is null or s.grand_prix_id <> p_grand_prix_id
      or not (s.type = p_section or (p_section = 'RAC' and s.type = 'RAC2'))
      or (r->>'rider_id') is null
      or coalesce(r->>'source_url','') not like 'https://resources.motogp.com/%.pdf'
      or coalesce(r->>'status','') not in ('CLASSIFIED','NOT_CLASSIFIED','NOT_ON_RESTART_GRID','DNF','DNS','DSQ')
  ) then raise exception 'INVALID_OFFICIAL_RESULTS'; end if;
  if exists (select 1 from jsonb_array_elements(p_results) r
    group by r->>'session_id',r->>'rider_id' having count(*) > 1) then
    raise exception 'DUPLICATE_OFFICIAL_RIDER';
  end if;
  -- Do not leave old rows behind if a corrected PDF removes a rider.
  -- Fail explicitly; a reviewer must reconcile removed rows before retrying.
  if exists (select 1 from public.session_results old where session_id = any(v_ids)
    and not exists (select 1 from jsonb_array_elements(p_results) r
      where (r->>'session_id')::uuid = old.session_id and (r->>'rider_id')::uuid = old.rider_id)) then
    raise exception 'OFFICIAL_RESULT_REMOVAL_REQUIRES_REVIEW';
  end if;
  insert into public.session_results(
    session_id,rider_id,position,points,rider_number,total_time,gap,average_speed,status,source_url
  ) select x.session_id,x.rider_id,x.position,x.points,x.rider_number,x.total_time,x.gap,x.average_speed,x.status,x.source_url
    from jsonb_to_recordset(p_results) as x(
      session_id uuid,rider_id uuid,position integer,points numeric,rider_number integer,
      total_time text,gap text,average_speed numeric,status text,source_url text
    )
  on conflict(session_id,rider_id) do update set
    position = excluded.position, points = excluded.points, rider_number = excluded.rider_number,
    total_time = excluded.total_time,gap = excluded.gap,average_speed = excluded.average_speed,
    status = excluded.status,source_url = excluded.source_url;
  select array_agg(id) into v_close_ids from public.sessions where grand_prix_id = p_grand_prix_id
    and (id = any(v_ids) or (p_section = 'Q' and type = 'Q'));
  update public.sessions set status = 'FINISHED' where id = any(v_close_ids);
  v_score := public.score_finished_prediction_section(p_grand_prix_id,p_section);
  if v_score->>'status' not in ('scored','already_scored') then
    raise exception 'SECTION_SCORING_NOT_READY: %', v_score->>'status';
  end if;
  return v_score;
end;
$$;
revoke all on function public.import_and_score_prediction_section(uuid,text,jsonb) from public, anon, authenticated;
grant execute on function public.import_and_score_prediction_section(uuid,text,jsonb) to service_role;
notify pgrst, 'reload schema';
commit;