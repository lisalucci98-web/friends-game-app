import { type User } from '@supabase/supabase-js';
import { useEffect, useMemo, useState } from 'react';
import { Award, Flag, Target, Timer, Trophy, Zap } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  displayedRacePoints, isGpClosed, loadPredictionEntries, loadSeasonData,
  scoreSelect, toNumber, type GrandPrix, type League, type LeagueMember,
  type PredictionEntry, type PredictionScore, type Season,
} from './Task21Results';
import { bestScores, closestPole, lapSeconds, latestPredictions, outAccuracy } from '@/lib/performance-records';

export function PerformanceRecords({ user }: { user: User }) {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [leagueId, setLeagueId] = useState('');
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [seasonId, setSeasonId] = useState('');
  const [grandPrix, setGrandPrix] = useState<GrandPrix[]>([]);
  const [members, setMembers] = useState<LeagueMember[]>([]);
  const [predictions, setPredictions] = useState<PredictionScore[]>([]);
  const [entries, setEntries] = useState<PredictionEntry[]>([]);
  const [officialTimes, setOfficialTimes] = useState(new Map<string, number>());
  const [scope, setScope] = useState<'personal' | 'league'>('personal');
  const [loading, setLoading] = useState(true);
  const [loadingLeagues, setLoadingLeagues] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let live = true;
    setLoadingLeagues(true); setLoading(true); setError(null);
    async function load() {
      const membership = await supabase.from('league_members').select('league_id').eq('user_id', user.id);
      if (membership.error) throw new Error('Non riusciamo a caricare le tue leghe.');
      const ids = (membership.data ?? []).map(item => item.league_id);
      const response = ids.length ? await supabase.from('leagues').select('id, name, invite_code, created_at').in('id', ids).order('created_at') : { data: [], error: null };
      if (response.error) throw new Error('Non riusciamo a caricare le tue leghe.');
      if (!live) return;
      setLeagues((response.data ?? []) as League[]);
      setLeagueId(current => ids.includes(current) ? current : ids[0] ?? '');
      setLoadingLeagues(false);
      if (!ids.length) setLoading(false);
    }
    void load().catch(error => { if (live) { setError(error.message); setLoading(false); setLoadingLeagues(false); } });
    return () => { live = false; };
  }, [user.id, reload]);

  useEffect(() => {
    let live = true;
    if (!leagueId) return;
    setLoading(true); setError(null);
    setPredictions([]); setEntries([]); setOfficialTimes(new Map());
    async function load() {
      const membership = await supabase.from('league_members').select('league_id').eq('user_id', user.id).eq('league_id', leagueId).maybeSingle();
      if (membership.error || !membership.data) throw new Error('Questa lega non è accessibile al tuo account.');
      const [seasonData, membersResponse] = await Promise.all([
        loadSeasonData(), supabase.rpc('get_league_members', { p_league_id: leagueId }),
      ]);
      if (membersResponse.error) throw new Error('I partecipanti non sono disponibili.');
      const closedGpIds = seasonData.grandPrix.filter(gp => isGpClosed(gp.id, seasonData.sessions)).map(gp => gp.id);
      // Never fetch competitors' prediction entries for an unfinished GP.
      const predictionsResponse = closedGpIds.length
        ? await supabase.from('predictions').select(scoreSelect).eq('league_id', leagueId).in('grand_prix_id', closedGpIds).not('scored_at', 'is', null)
        : { data: [], error: null };
      if (predictionsResponse.error) throw new Error('I punteggi registrati non sono disponibili.');
      const nextPredictions = latestPredictions((predictionsResponse.data ?? []) as unknown as PredictionScore[]);
      const qualifyingSessions = closedGpIds.flatMap(gpId => {
        const sessions = seasonData.sessions.filter(session => session.type === 'Q' && session.grand_prix_id === gpId);
        const q2 = sessions.find(session => String(session.number) === '2');
        return q2 ? [q2] : sessions.length === 1 ? sessions : [];
      });
      const [entriesResponse, officialResponse] = await Promise.all([
        loadPredictionEntries(nextPredictions.map(row => row.id)),
        qualifyingSessions.length ? supabase.from('session_results').select('session_id, total_time, position').in('session_id', qualifyingSessions.map(session => session.id)).eq('position', 1) : Promise.resolve({ data: [], error: null }),
      ]);
      if (entriesResponse.error || officialResponse.error) throw new Error('Non riusciamo a completare i dettagli dei record.');
      const poleResults = (officialResponse.data ?? []) as { session_id: string; total_time: string | number | null; position: number | null }[];
      const times = new Map<string, number>();
      for (const session of qualifyingSessions) {
        const time = lapSeconds(poleResults.find(result => result.session_id === session.id)?.total_time);
        if (time !== null) times.set(session.grand_prix_id, time);
      }
      if (!live) return;
      setMembers((membersResponse.data ?? []) as LeagueMember[]);
      setSeasons(seasonData.seasons);
      setSeasonId(current => seasonData.seasons.some(item => item.id === current) ? current : seasonData.season.id);
      setGrandPrix(seasonData.grandPrix);
      setPredictions(nextPredictions);
      setEntries((entriesResponse.data ?? []) as unknown as PredictionEntry[]);
      setOfficialTimes(times);
      setLoading(false);
    }
    void load().catch(error => { if (live) { setError(error instanceof Error ? error.message : 'Errore durante il caricamento.'); setLoading(false); } });
    return () => { live = false; };
  }, [user.id, leagueId, reload]);

  const visible = useMemo(() => {
    const gpIds = new Set(grandPrix.filter(gp => gp.season_id === seasonId).map(gp => gp.id));
    return predictions.filter(row => gpIds.has(row.grand_prix_id) && (scope === 'league' || row.user_id === user.id));
  }, [grandPrix, seasonId, predictions, scope, user.id]);
  const gpLabel = (id: string) => { const gp = grandPrix.find(item => item.id === id); return gp?.short_name || gp?.name || 'GP'; };
  const name = (id: string) => id === user.id ? 'Tu' : members.find(item => item.user_id === id)?.name || 'Pilota senza nome';
  const describe = (rows: PredictionScore[]) => [...new Set(rows.map(row => `${name(row.user_id)} · ${gpLabel(row.grand_prix_id)}`))].join(' / ');
  const best = bestScores(visible, row => toNumber(row.total_points));
  const qualifying = bestScores(visible, row => toNumber(row.qualifying_points));
  const sprint = bestScores(visible, row => toNumber(row.sprint_points));
  const race = bestScores(visible, row => toNumber(displayedRacePoints(row)));
  const pole = closestPole(visible, entries, officialTimes);
  const out = outAccuracy(visible, entries);
  const awards = [
    { title: 'Il weekend da incorniciare', joke: 'La volta che il divano sembrava il muretto box.', icon: Trophy, result: best },
    { title: 'Prima fila, grazie', joke: 'Il miglior punteggio nelle Qualifiche.', icon: Flag, result: qualifying },
    { title: 'Tre giri di gloria', joke: 'Il miglior punteggio Sprint. Senza scuse.', icon: Zap, result: sprint },
    { title: 'La domenica perfetta', joke: 'Il miglior punteggio Gara, prima di bonus e malus.', icon: Award, result: race },
  ];
  return <div className="performance-records">
    <div className="paddock-tabs" role="group" aria-label="Ambito statistiche">
      <button type="button" aria-pressed={scope === 'personal'} className={scope === 'personal' ? 'is-active' : ''} onClick={() => setScope('personal')}>I tuoi record</button>
      <button type="button" aria-pressed={scope === 'league'} className={scope === 'league' ? 'is-active' : ''} onClick={() => setScope('league')}>I fenomeni della lega</button>
    </div>
    <div className="task21-toolbar">
      <label className="task21-select-label" htmlFor="stats-league"><span>Lega</span><select id="stats-league" value={leagueId} disabled={loadingLeagues || !leagues.length} onChange={event => setLeagueId(event.target.value)}>{!leagues.length && <option value="">Nessuna lega</option>}{leagues.map(league => <option key={league.id} value={league.id}>{league.name || 'Lega senza nome'}</option>)}</select></label>
      <label className="task21-select-label" htmlFor="stats-season"><span>Stagione</span><select id="stats-season" value={seasonId} disabled={loading || !seasons.length} onChange={event => setSeasonId(event.target.value)}>{!seasons.length && <option value="">In attesa dei dati</option>}{seasons.map(season => <option value={season.id} key={season.id}>{season.year}</option>)}</select></label>
    </div>
    {loading ? <p className="paddock-empty" role="status">Stiamo cercando le tue imprese nel paddock…</p> : error ? <div className="paddock-empty" role="alert"><p>{error}</p><button type="button" className="task21-button" onClick={() => setReload(value => value + 1)}>Riprova</button></div> : !leagues.length ? <p className="paddock-empty">Entra in una lega e disputa il primo GP. I record, per ora, li lasciamo agli altri.</p> : <>
      <p className="stats-method">{visible.length} pronostici con punteggio · solo GP conclusi · una sola lega, niente punti contati due volte. I pari merito sono condivisi.</p>
      <div className="stats-grid">
        {awards.map(({ title, joke, icon: Icon, result }) => <article className="stat-card" key={title}><Icon size={22} aria-hidden="true" /><h2>{title}</h2><strong className="stat-number">{result ? `${result.value} pt` : '—'}</strong><p className="stat-copy">{result ? describe(result.rows) : 'Record ancora da scrivere.'}</p><small>{joke}</small></article>)}
        <article className="stat-card"><Timer size={22} aria-hidden="true" /><h2>Il millesimo nel mirino</h2><strong className="stat-number">{pole ? `${pole.value.toFixed(3)} s` : '—'}</strong><p className="stat-copy">{pole ? describe(pole.rows) : 'Servono il tempo pronosticato e quello pole ufficiale.'}</p><small>{pole ? `Scarto assoluto minimo su ${pole.comparisons} tempi confrontabili. Il cronometro non mente.` : 'Niente cronometro ufficiale, niente record inventato.'}</small></article>
        <article className="stat-card"><Target size={22} aria-hidden="true" /><h2>Il gufo del paddock</h2><strong className="stat-number">{out ? `${out.value} OUT` : '—'}</strong><p className="stat-copy">{out ? out.users.map(item => `${name(item.userId)} · ${item.hits}/${item.attempts} scelte corrette`).join(' / ') : 'Serve almeno una scelta OUT con punteggio registrato.'}</p><small>{out?.value === 0 ? 'Per ora nessun OUT indovinato. Meglio per i piloti.' : 'Conta gli OUT indovinati, non i ritiri dei tuoi preferiti.'}</small></article>
      </div>
    </>}
  </div>;
}