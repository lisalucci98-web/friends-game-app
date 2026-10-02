-- Isolated PostgreSQL fixture. NEVER run this file against a project database.
create role anon;
create role authenticated;
create role service_role;
create schema auth;
create function auth.uid() returns uuid language sql stable as
$$ select nullif(current_setting('test.user_id',true),'')::uuid $$;
create table public.seasons(id uuid primary key, year integer);
create table public.grand_prix(id uuid primary key,season_id uuid references seasons(id),short_name text,is_test boolean default false);
create table public.sessions(id uuid primary key,grand_prix_id uuid references grand_prix(id),type text,
  number integer,status text,session_date timestamptz);
create table public.league_members(user_id uuid,league_id uuid);
create table public.rider_seasons(rider_id uuid,season_id uuid,active boolean);
create table public.predictions(id uuid primary key default gen_random_uuid(),user_id uuid not null,
  grand_prix_id uuid not null references grand_prix(id),league_id uuid,
  qualifying_pole_time numeric,qualifying_points integer not null default 0,
  sprint_points integer not null default 0,race_points integer not null default 0,
  bonus_points integer not null default 0,malus_points integer not null default 0,
  total_points integer not null default 0,scored_at timestamptz,created_at timestamptz default now(),updated_at timestamptz default now(),
  unique(user_id,grand_prix_id,league_id));
create table public.prediction_entries(id uuid primary key default gen_random_uuid(),
  prediction_id uuid references predictions(id),prediction_type text not null,
  position integer,rider_id uuid,predicted_time numeric,points integer not null default 0);
create table public.session_results(id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id),rider_id uuid,position integer,status text,total_time text,source_url text,
  points numeric,rider_number integer,gap text,average_speed numeric,unique(session_id,rider_id));

\ir ../migrations/20260922153000_section_scoped_prediction_save.sql
\ir ../migrations/20261002090000_japan_session_scoring.sql

do $test$
declare
  season uuid := gen_random_uuid(); gp uuid := gen_random_uuid(); historical uuid := gen_random_uuid();
  viewer uuid := gen_random_uuid(); league uuid := gen_random_uuid(); partial_user uuid := gen_random_uuid();
  q1 uuid := gen_random_uuid(); q2 uuid := gen_random_uuid(); sprint uuid := gen_random_uuid(); race uuid := gen_random_uuid();
  riders uuid[] := array[gen_random_uuid(),gen_random_uuid(),gen_random_uuid(),gen_random_uuid(),gen_random_uuid(),
    gen_random_uuid(),gen_random_uuid(),gen_random_uuid(),gen_random_uuid(),gen_random_uuid()];
  pred uuid; partial uuid; hist uuid; row public.predictions%rowtype; outcome jsonb; i integer;
begin
  insert into seasons values(season,2026);
  insert into grand_prix values(gp,season,'JPN',false),(historical,season,'AUT',false);
  insert into automatic_scoring_events values(gp,true);
  insert into league_members values(viewer,league),(partial_user,league);
  insert into rider_seasons select unnest(riders),season,true;
  insert into sessions values
    (q1,gp,'Q',1,'NOT-STARTED','2099-10-03 10:50Z'),
    (q2,gp,'Q',2,'NOT-STARTED','2099-10-03 11:15Z'),
    (sprint,gp,'SPR',null,'NOT-STARTED','2099-10-03 15:00Z'),
    (race,gp,'RAC',null,'NOT-STARTED','2099-10-04 14:00Z');
  perform set_config('test.user_id',viewer::text,true);
  -- Save Sprint first without qualifying/race.
  pred := submit_prediction_section(gp,league,'SPRINT',null,null,riders[1:3],null);
  assert (select count(*) from prediction_entries where prediction_id=pred) = 3,'Sprint-only save failed';
  perform submit_prediction_section(gp,league,'QUALIFYING',riders[1],90.010,null,null);
  assert (select count(*) from prediction_entries where prediction_id=pred and prediction_type='SPRINT')=3,'Qualifying erased Sprint';
  perform submit_prediction_section(gp,league,'RACE',null,null,riders[1:5],riders[6]);
  assert (select count(*) from prediction_entries where prediction_id=pred)=11,'Full section preservation failed';
  insert into predictions(user_id,grand_prix_id,league_id,total_points)
    values(viewer,historical,league,123) returning id into hist;
  insert into predictions(user_id,grand_prix_id,league_id)
    values(partial_user,gp,league) returning id into partial;
  insert into prediction_entries(prediction_id,prediction_type,position,rider_id)
    values(partial,'SPRINT',3,riders[4]);
  outcome := score_finished_prediction_section(gp,'Q');
  assert outcome->>'status'='waiting_for_session','Scored open session';
  -- Official classification without FINISHED must remain pending.
  insert into session_results(session_id,rider_id,position,status,total_time,source_url) values
    (q2,riders[1],1,'CLASSIFIED','1''30.000','https://resources.motogp.com/official.pdf'),
    (q2,riders[2],2,'CLASSIFIED','1''30.200','https://resources.motogp.com/official.pdf');
  assert score_finished_prediction_section(gp,'Q')->>'status'='waiting_for_session','Scored before official finish';
  update sessions set status='FINISHED',session_date='2000-01-01' where id in(q1,q2);
  outcome := score_finished_prediction_section(gp,'Q');
  assert outcome->>'status'='scored','Qualifying failed';
  select * into row from predictions where id=pred;
  assert row.qualifying_points=15 and row.total_points=15,'Inclusive +0.010 qualifying boundary failed';
  assert (select qualifying_points from predictions where id=partial)=0,'Missing qualifying must score zero, not NULL';
  assert score_finished_prediction_section(gp,'Q')->>'status'='already_scored','Retry not idempotent';
  begin
    perform submit_prediction_section(gp,league,'QUALIFYING',riders[2],90,null,null);
    raise exception 'Closed qualifying was overwritten';
  exception when others then
    if sqlerrm not like '%QUALIFYING_PREDICTION_CLOSED%' then raise; end if;
  end;
  -- Open Sprint save cannot erase already calculated Q points.
  perform submit_prediction_section(gp,league,'SPRINT',null,null,riders[1:3],null);
  assert (select total_points from predictions where id=pred)=15,'Sprint update erased Q score';
  for i in 1..4 loop
    insert into session_results(session_id,rider_id,position,status,source_url)
      values(sprint,riders[i],i,'CLASSIFIED','https://resources.motogp.com/official.pdf');
  end loop;
  update sessions set status='FINISHED',session_date='2000-01-01' where id=sprint;
  perform score_finished_prediction_section(gp,'SPR');
  assert (select total_points from predictions where id=pred)=24,'Progressive total after Sprint failed';
  assert (select sprint_points from predictions where id=partial)=0,'Official Sprint P4 wrongly scored';
  for i in 1..5 loop
    insert into session_results(session_id,rider_id,position,status,source_url)
      values(race,riders[i],i,'CLASSIFIED','https://resources.motogp.com/official.pdf');
  end loop;
  insert into session_results(session_id,rider_id,status,source_url)
    values(race,riders[6],'NOT_CLASSIFIED','https://resources.motogp.com/official.pdf');
  update sessions set status='FINISHED',session_date='2000-01-01' where id=race;
  perform score_finished_prediction_section(gp,'RAC');
  select * into row from predictions where id=pred;
  assert row.race_points=25 and row.bonus_points=9 and row.malus_points=0 and row.total_points=58,
    'Race scoring or cumulative bonus incorrect';
  assert row.total_points=row.qualifying_points+row.sprint_points+row.race_points+row.bonus_points+row.malus_points,
    'Aggregate sum mismatch';
  assert (select sum(points) from prediction_entries where prediction_id=pred and prediction_type='RACE_OUT')=2,
    'OUT points missing from entry';
  -- Corrections invalidate the fingerprint; repeated polling does not add points.
  update prediction_entries set predicted_time=89.990 where prediction_id=pred and prediction_type='QUALIFYING_TIME';
  assert score_finished_prediction_section(gp,'Q')->>'status'='scored','Changed inputs not picked up';
  assert (select qualifying_points from predictions where id=pred)=15,'Inclusive -0.010 boundary failed';
  assert score_finished_prediction_section(gp,'RAC')->>'status'='already_scored','Race retry added points';
  assert (select total_points from predictions where id=hist)=123,'Historical GP was modified';
  -- Atomic importer must roll back result upserts and FINISHED on score failure.
  update sessions set status='NOT-STARTED' where id=race;
  begin
    perform import_and_score_prediction_section(gp,'RAC',jsonb_build_array(
      jsonb_build_object('session_id',race,'rider_id',riders[1],'position',1,
        'status','CLASSIFIED','source_url','https://resources.motogp.com/official.pdf')
    ));
    raise exception 'Removed official rows were accepted';
  exception when others then
    if sqlerrm not like '%OFFICIAL_RESULT_REMOVAL_REQUIRES_REVIEW%' then raise; end if;
  end;
  assert (select status from sessions where id=race)='NOT-STARTED','Failed import changed session status';
  outcome := import_and_score_prediction_section(gp,'RAC',(
    select jsonb_agg(to_jsonb(r)-'id') from session_results r where session_id=race
  ));
  assert outcome->>'status'='already_scored','Atomic retry not idempotent';
  assert (select status from sessions where id=race)='FINISHED','Atomic importer did not close session';
  assert (select total_points from predictions where id=pred)=58,'Atomic retry changed score';
  assert not has_function_privilege('authenticated','public.score_finished_prediction_section(uuid,text)','EXECUTE'),
    'Authenticated users can invoke scoring';
  assert not has_function_privilege('anon','public.import_and_score_prediction_section(uuid,text,jsonb)','EXECUTE'),
    'Anonymous users can import results';
  -- Test score failure *after* an official write, not only validation failure.
  delete from prediction_section_runs where grand_prix_id=gp and section='Q';
  begin
    perform import_and_score_prediction_section(gp,'Q',(
      select jsonb_agg((to_jsonb(r)-'id') ||
        case when position=1 then jsonb_build_object('total_time','invalid') else '{}'::jsonb end)
      from session_results r where session_id=q2
    ));
    raise exception 'Invalid pole time did not abort transaction';
  exception when others then
    if sqlerrm not like '%SECTION_SCORING_NOT_READY: invalid_official_pole_time%' then raise; end if;
  end;
  assert (select total_time from session_results where session_id=q2 and position=1)='1''30.000',
    'Result write did not roll back on scoring failure';
  assert (select total_points from predictions where id=pred)=58,'Failed scoring changed totals';
  for i in 7..10 loop
    insert into session_results(session_id,rider_id,status,source_url)
      values(race,riders[i],'NOT_CLASSIFIED','https://resources.motogp.com/official.pdf');
  end loop;
  -- Missing qualifying/Sprint entries cannot suppress valid race malus.
  for i in 1..5 loop
    insert into prediction_entries(prediction_id,prediction_type,position,rider_id)
      values(partial,'RACE',i,riders[5+i]);
    perform score_finished_prediction_section(gp,'RAC');
    assert (select malus_points from predictions where id=partial) =
      case when i<=2 then -1 when i<=4 then -5 else -10 end,'NC threshold incorrect for partial prediction';
    assert (select total_points from predictions where id=partial) =
      (select qualifying_points+sprint_points+race_points+bonus_points+malus_points from predictions where id=partial),
      'Partial total sum mismatch';
  end loop;
  insert into prediction_entries(prediction_id,prediction_type,rider_id)
    values(partial,'RACE_OUT',riders[6]);
  perform score_finished_prediction_section(gp,'RAC');
  assert (select malus_points from predictions where id=partial)=-12,'Overlap penalty not cumulative';
  assert (select bonus_points from predictions where id=partial)=2,'OUT bonus missing on partial prediction';
  begin
    perform score_finished_prediction_section(historical,'RAC');
    raise exception 'Historical scoring not blocked';
  exception when others then
    if sqlerrm not like '%AUTOMATION_NOT_ENABLED%' then raise; end if;
  end;
  perform set_config('test.user_id',gen_random_uuid()::text,true);
  begin
    perform submit_prediction_section(gp,league,'SPRINT',null,null,riders[1:3],null);
    raise exception 'Non-member save allowed';
  exception when others then
    if sqlerrm not like '%NOT_A_LEAGUE_MEMBER%' then raise; end if;
  end;
  raise notice 'PASS: separate saves, deadlines, membership, partial predictions, inclusive time boundaries, Sprint Top3, race bonuses, OUT, progressive totals, retries, corrections and historical isolation';
end;
$test$;