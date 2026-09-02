import { type User } from '@supabase/supabase-js';
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Clipboard,
  Clock3,
  Flag,
  LockKeyhole,
  RefreshCw,
  Trophy,
  UserRound,
  Users,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Season = {
  id: string;
  year: number;
};

type GrandPrix = {
  id: string;
  season_id: string | null;
  name: string | null;
  short_name: string | null;
  country: string | null;
  circuit: string | null;
  date_start: string | null;
  date_end: string | null;
};

type RaceSession = {
  id: string;
  grand_prix_id: string;
  type: string | null;
  status: string | null;
  session_date: string | null;
  number: number | string | null;
};

type League = {
  id: string;
  name: string | null;
  invite_code: string;
  created_at: string;
};

type LeagueMember = {
  user_id: string;
  name: string | null;
};

type PredictionScore = {
  id: string;
  user_id: string;
  grand_prix_id: string;
  league_id: string;
  qualifying_pole_time: number | string | null;
  qualifying_points: number | string | null;
  sprint_points: number | string | null;
  race_points: number | string | null;
  bonus_points: number | string | null;
  malus_points: number | string | null;
  total_points: number | string | null;
  scored_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type PredictionEntry = {
  id: string;
  prediction_id: string;
  prediction_type: string | null;
  position: number | string | null;
  rider_id: string | null;
  predicted_time: number | string | null;
  points: number | string | null;
  source: 'MANUAL' | 'CARRY_OVER' | string | null;
  carried_from_grand_prix_id: string | null;
};

type Rider = {
  id: string;
  name: string | null;
  surname: string | null;
  nickname: string | null;
};

const scoreSelect = [
  'id',
  'user_id',
  'grand_prix_id',
  'league_id',
  'qualifying_pole_time',
  'qualifying_points',
  'sprint_points',
  'race_points',
  'bonus_points',
  'malus_points',
  'total_points',
  'scored_at',
  'created_at',
  'updated_at',
].join(',');

const leaderboardSelect = [
  'id',
  'user_id',
  'grand_prix_id',
  'league_id',
  'qualifying_pole_time',
  'qualifying_points',
  'sprint_points',
  'race_points',
  'bonus_points',
  'malus_points',
  'total_points',
  'scored_at',
  'created_at',
  'updated_at',
].join(',');

const predictionEntrySelect = [
  'id',
  'prediction_id',
  'prediction_type',
  'position',
  'rider_id',
  'predicted_time',
  'points',
  'source',
  'carried_from_grand_prix_id',
].join(',');
const legacyPredictionEntrySelect = [
  'id',
  'prediction_id',
  'prediction_type',
  'position',
  'rider_id',
  'predicted_time',
  'points',
].join(',');

function isMissingCarryOverColumns(error: { message?: string | null } | null) {
  const message = error?.message?.toLowerCase() ?? '';
  return (
    message.includes('source') ||
    message.includes('carried_from_grand_prix_id') ||
    message.includes('column') && message.includes('does not exist')
  );
}

async function loadPredictionEntries(predictionIds: string[]) {
  if (!predictionIds.length) return { data: [], error: null };

  const response = await supabase
    .from('prediction_entries')
    .select(predictionEntrySelect)
    .in('prediction_id', predictionIds);

  if (!response.error || !isMissingCarryOverColumns(response.error)) {
    return response;
  }

  return supabase
    .from('prediction_entries')
    .select(legacyPredictionEntrySelect)
    .in('prediction_id', predictionIds);
}

const closedStatuses = new Set([
  'FINISHED',
  'COMPLETED',
  'CLASSIFIED',
  'CLOSED',
]);

const scoringFields: Array<keyof PredictionScore> = [
  'qualifying_points',
  'sprint_points',
  'race_points',
  'bonus_points',
  'malus_points',
  'total_points',
];

function toNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function hasScore(prediction: PredictionScore | undefined) {
  return Boolean(
    prediction &&
      (prediction.scored_at !== null ||
        scoringFields.some((field) => prediction[field] !== null)),
  );
}

function formatPoints(value: number | string | null | undefined, empty = '—') {
  const parsed = toNumber(value);
  if (parsed === null) return empty;
  return parsed > 0 ? `+${parsed}` : `${parsed}`;
}

function formatTotal(value: number | string | null | undefined) {
  const parsed = toNumber(value);
  return parsed === null ? '—' : `${parsed}`;
}

function formatPredictedTime(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === '') return '—';
  const text = String(value).trim();
  if (text.includes(':')) return text;

  const seconds = toNumber(value);
  if (seconds === null) return text || '—';
  const minutes = Math.floor(seconds / 60);
  const remainder = (seconds - minutes * 60).toFixed(3).padStart(6, '0');
  return `${minutes}:${remainder}`;
}

function formatShortDate(value: string | null | undefined) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(value));
}

function gpLabel(grandPrix: GrandPrix) {
  return grandPrix.short_name || grandPrix.name || 'GP senza nome';
}

function gpName(grandPrix: GrandPrix) {
  return grandPrix.name || grandPrix.short_name || 'Gran Premio';
}

const carryOverEntryTypes: Record<string, string[]> = {
  Q: ['POLE', 'QUALIFYING_TIME'],
  SPR: ['SPRINT'],
  RAC: ['RACE', 'RACE_OUT'],
};

function isClosedSession(session: RaceSession) {
  return closedStatuses.has((session.status || '').toUpperCase());
}

function sessionsForGp(grandPrixId: string, sessions: RaceSession[]) {
  return sessions.filter(
    (session) =>
      session.grand_prix_id === grandPrixId &&
      ['Q', 'SPR', 'RAC'].includes((session.type || '').toUpperCase()),
  );
}

function isGpClosed(grandPrixId: string, sessions: RaceSession[]) {
  const relevantSessions = sessionsForGp(grandPrixId, sessions);
  const sessionTypes = new Set(
    relevantSessions.map((session) => (session.type || '').toUpperCase()),
  );

  return (
    ['Q', 'SPR', 'RAC'].every((type) => sessionTypes.has(type)) &&
    relevantSessions.every(isClosedSession)
  );
}

function statusForPrediction(
  prediction: PredictionScore | undefined,
  gpClosed = false,
) {
  if (!prediction) {
    return { label: 'Non compilato', className: 'is-empty', icon: Flag };
  }
  if (hasScore(prediction)) {
    return {
      label: 'Punteggio disponibile',
      className: 'is-scored',
      icon: CheckCircle2,
    };
  }
  return {
    label: gpClosed ? 'In attesa dei risultati' : 'Pronostico salvato',
    className: gpClosed ? 'is-pending' : 'is-saved',
    icon: gpClosed ? Clock3 : CheckCircle2,
  };
}

function predictionForGp(
  predictions: PredictionScore[],
  grandPrixId: string,
) {
  return [...predictions]
    .filter((prediction) => prediction.grand_prix_id === grandPrixId)
    .sort((a, b) => {
      const first = new Date(a.updated_at || a.created_at || 0).getTime();
      const second = new Date(b.updated_at || b.created_at || 0).getTime();
      return second - first;
    })[0];
}

async function loadSeasonData() {
  const [seasonsResponse, grandPrixResponse] = await Promise.all([
    supabase
      .from('seasons')
      .select('id, year')
      .order('year', { ascending: false }),
    supabase
      .from('grand_prix')
      .select('id, season_id, name, short_name, country, circuit, date_start, date_end')
      .eq('is_test', false)
      .order('date_start', { ascending: true }),
  ]);

  if (seasonsResponse.error || grandPrixResponse.error || !seasonsResponse.data?.length) {
    throw new Error('Non è stato possibile caricare la stagione.');
  }

  const seasons = seasonsResponse.data as Season[];
  const grandPrix = (grandPrixResponse.data || []) as GrandPrix[];
  const grandPrixIds = grandPrix.map((item) => item.id);
  const sessionsResponse = grandPrixIds.length
    ? await supabase
        .from('sessions')
        .select('id, grand_prix_id, type, status, session_date, number')
        .in('grand_prix_id', grandPrixIds)
        .order('session_date', { ascending: true })
    : { data: [], error: null };

  if (sessionsResponse.error) {
    throw new Error('Non è stato possibile caricare il calendario MotoGP.');
  }

  return {
    seasons,
    season: seasons[0],
    grandPrix,
    sessions: (sessionsResponse.data || []) as RaceSession[],
  };
}

function ResultsState({
  kind,
  message,
  onRetry,
}: {
  kind: 'loading' | 'error' | 'empty';
  message: string;
  onRetry?: () => void;
}) {
  if (kind === 'loading') {
    return (
      <div className="task21-loading-stack" role="status" aria-live="polite">
        <div className="task21-skeleton task21-skeleton--hero" />
        <div className="task21-skeleton" />
        <div className="task21-skeleton" />
        <div className="task21-skeleton" />
      </div>
    );
  }

  return (
    <div
      className={`task21-state task21-state--${kind}`}
      role={kind === 'error' ? 'alert' : 'status'}
      aria-live="polite"
    >
      {kind === 'error' ? (
        <AlertCircle size={22} aria-hidden="true" />
      ) : (
        <BarChart3 size={22} aria-hidden="true" />
      )}
      <strong>{kind === 'error' ? 'Non riusciamo a caricare i risultati' : message}</strong>
      {kind === 'error' && <p>{message}</p>}
      {kind === 'error' && onRetry && (
        <button className="task21-button task21-button--secondary" type="button" onClick={onRetry}>
          <RefreshCw size={15} aria-hidden="true" />
          Riprova
        </button>
      )}
    </div>
  );
}

function scoreComponentsMatchTotal(prediction: PredictionScore) {
  const values = [
    prediction.qualifying_points,
    prediction.sprint_points,
    prediction.race_points,
    prediction.bonus_points,
    prediction.malus_points,
    prediction.total_points,
  ].map(toNumber);

  if (values.some((value) => value === null)) return null;
  const [qualifying, sprint, race, bonus, malus, total] = values as number[];
  return qualifying + sprint + race + bonus + malus === total;
}

function StatusBadge({
  prediction,
  gpClosed,
}: {
  prediction?: PredictionScore;
  gpClosed?: boolean;
}) {
  const status = statusForPrediction(prediction, gpClosed);
  const Icon = status.icon;

  return (
    <span className={`task21-status ${status.className}`}>
      <Icon size={14} aria-hidden="true" />
      {status.label}
    </span>
  );
}

export function MyResultsContent({
  user,
  onOpenOfficialResults,
}: {
  user: User | null;
  onOpenOfficialResults: () => void;
}) {
  const [season, setSeason] = useState<Season | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [grandPrix, setGrandPrix] = useState<GrandPrix[]>([]);
  const [sessions, setSessions] = useState<RaceSession[]>([]);
  const [predictions, setPredictions] = useState<PredictionScore[]>([]);
  const [predictionEntries, setPredictionEntries] = useState<PredictionEntry[]>([]);
  const [predictionRiders, setPredictionRiders] = useState<Rider[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedLeagueId, setSelectedLeagueId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      setErrorMessage('Accedi per visualizzare i tuoi risultati.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [seasonData, membershipsResponse, predictionsResponse] =
        await Promise.all([
          loadSeasonData(),
          supabase
            .from('league_members')
            .select('league_id')
            .eq('user_id', user.id),
          supabase
            .from('predictions')
            .select(scoreSelect)
            .eq('user_id', user.id),
        ]);

      if (membershipsResponse.error || predictionsResponse.error) {
        throw new Error('Non è stato possibile caricare i tuoi dati personali.');
      }

      const predictionRows = (predictionsResponse.data || []) as unknown as PredictionScore[];
      const predictionIds = predictionRows.map((prediction) => prediction.id);
      const entriesResponse = await loadPredictionEntries(predictionIds);

      if (entriesResponse.error) {
        throw new Error('Non è stato possibile caricare i dettagli dei tuoi pronostici.');
      }

      const nextEntries = (entriesResponse.data || []) as unknown as PredictionEntry[];
      const entryRiderIds = [...new Set(nextEntries.map((entry) => entry.rider_id).filter(Boolean))];
      const ridersResponse = entryRiderIds.length
        ? await supabase
            .from('riders')
            .select('id, name, surname, nickname')
            .in('id', entryRiderIds)
        : { data: [], error: null };

      if (ridersResponse.error) {
        throw new Error('Non è stato possibile caricare i piloti dei tuoi pronostici.');
      }

      const leagueIds = (membershipsResponse.data || []).map(
        (membership) => membership.league_id as string,
      );
      const leaguesResponse = leagueIds.length
        ? await supabase
            .from('leagues')
            .select('id, name, invite_code, created_at')
            .in('id', leagueIds)
            .order('created_at', { ascending: false })
        : { data: [], error: null };

      if (leaguesResponse.error) {
        throw new Error('Non è stato possibile caricare le tue leghe.');
      }

      setSeasons(seasonData.seasons);
      setSeason(seasonData.season);
      setGrandPrix(seasonData.grandPrix);
      setSessions(seasonData.sessions);
      setPredictions(predictionRows);
      setPredictionEntries(nextEntries);
      setPredictionRiders((ridersResponse.data || []) as Rider[]);
      setLeagues((leaguesResponse.data || []) as League[]);
      setSelectedLeagueId((current) =>
        current && leagueIds.includes(current) ? current : leagueIds[0] || '',
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Errore imprevisto durante il caricamento.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  const visiblePredictions = useMemo(
    () =>
      selectedLeagueId
        ? predictions.filter((prediction) => prediction.league_id === selectedLeagueId)
        : predictions,
    [predictions, selectedLeagueId],
  );
  const seasonGrandPrix = useMemo(
    () =>
      grandPrix.filter((grandPrixItem) => grandPrixItem.season_id === season?.id),
    [grandPrix, season?.id],
  );
  const seasonGrandPrixIds = useMemo(
    () => new Set(seasonGrandPrix.map((grandPrixItem) => grandPrixItem.id)),
    [seasonGrandPrix],
  );
  const seasonPredictions = useMemo(
    () =>
      visiblePredictions.filter((prediction) =>
        seasonGrandPrixIds.has(prediction.grand_prix_id),
      ),
    [seasonGrandPrixIds, visiblePredictions],
  );
  const rows = useMemo(
    () =>
      seasonGrandPrix.map((grandPrixItem, index) => ({
        grandPrix: grandPrixItem,
        round: index + 1,
        prediction: predictionForGp(seasonPredictions, grandPrixItem.id),
      })),
    [seasonGrandPrix, seasonPredictions],
  );

  const scoredPredictions = seasonPredictions.filter(hasScore);
  const seasonTotal = scoredPredictions.reduce(
    (total, prediction) => total + (toNumber(prediction.total_points) || 0),
    0,
  );
  const seasonAverage = scoredPredictions.length
    ? seasonTotal / scoredPredictions.length
    : null;
  const bestResult = scoredPredictions.reduce<PredictionScore | undefined>(
    (best, prediction) =>
      !best || (toNumber(prediction.total_points) || 0) > (toNumber(best.total_points) || 0)
        ? prediction
        : best,
    undefined,
  );

  if (isLoading) return <ResultsState kind="loading" message="" />;
  if (errorMessage) {
    return <ResultsState kind="error" message={errorMessage} onRetry={() => void load()} />;
  }
  if (!season) {
    return <ResultsState kind="empty" message="Nessun risultato disponibile" />;
  }

  return (
    <div className="task21-results-shell">
      <div className="task21-toolbar">
        <div>
          <span className="task21-kicker">Stagione {season.year}</span>
          <strong>I tuoi punteggi, GP dopo GP</strong>
        </div>
        {leagues.length > 0 && (
          <label className="task21-select-label" htmlFor="task21-results-league">
            <span>Lega di riferimento</span>
            <select
              id="task21-results-league"
              value={selectedLeagueId}
              onChange={(event) => setSelectedLeagueId(event.target.value)}
            >
              {leagues.map((league) => (
                <option key={league.id} value={league.id}>
                  {league.name || 'Lega senza nome'}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="task21-select-label" htmlFor="task21-results-season">
          <span>Stagione</span>
          <select
            id="task21-results-season"
            name="season"
            value={season.id}
            onChange={(event) => {
              const nextSeason = seasons.find((item) => item.id === event.target.value);
              if (nextSeason) setSeason(nextSeason);
            }}
            disabled={seasons.length < 2}
            data-testid="task21-season-select"
          >
            {seasons.map((item) => (
              <option key={item.id} value={item.id}>
                MotoGP {item.year}
              </option>
            ))}
          </select>
        </label>
      </div>

      <section className="task21-score-hero" aria-labelledby="task21-season-score">
        <div>
          <span className="task21-kicker">Punteggio stagione</span>
          <h2 id="task21-season-score">{seasonTotal}</h2>
          <p>
            {scoredPredictions.length} GP con punteggio disponibile su {seasonGrandPrix.length}
          </p>
        </div>
        <div className="task21-hero-side">
          <span>Media GP</span>
          <strong>{seasonAverage === null ? '—' : seasonAverage.toFixed(1)}</strong>
          <small>{seasonAverage === null ? 'Non disponibile' : 'solo punteggi disponibili'}</small>
        </div>
        <div className="task21-hero-side">
          <span>Miglior GP</span>
          <strong>{bestResult ? formatTotal(bestResult.total_points) : '—'}</strong>
          <small>
            {bestResult
              ? gpLabel(grandPrix.find((item) => item.id === bestResult.grand_prix_id) || grandPrix[0])
              : 'Non disponibile'}
          </small>
        </div>
      </section>

      <section className="task21-panel" aria-labelledby="task21-season-list">
        <div className="task21-panel-heading">
          <div>
            <span className="task21-kicker">Race log</span>
            <h2 id="task21-season-list">Risultati della stagione</h2>
          </div>
          <button
            className="task21-button task21-button--secondary"
            type="button"
            onClick={onOpenOfficialResults}
          >
            Risultati MotoGP
            <ChevronRight size={15} aria-hidden="true" />
          </button>
        </div>

        <div className="task21-gp-list">
          {rows.map(({ grandPrix: item, round, prediction }) => (
            <PredictionHistoryCard
              key={item.id}
              grandPrix={item}
              round={round}
              prediction={prediction}
              entries={predictionEntries}
              riders={predictionRiders}
              allGrandPrix={grandPrix}
              sessions={sessions}
            />
          ))}
        </div>
        <p className="task21-note">
          I punteggi sono mostrati come restituiti dal sistema. La posizione media in lega non è disponibile nei dati attuali.
        </p>
      </section>
    </div>
  );
}

function riderName(rider: Rider | undefined, riderId: string | null | undefined) {
  if (!riderId) return '—';
  if (!rider) return 'Pilota non disponibile';
  return rider.nickname || [rider.name, rider.surname].filter(Boolean).join(' ') || 'Pilota';
}

function EntryLine({
  label,
  entry,
  rider,
  time = false,
}: {
  label: string;
  entry?: PredictionEntry;
  rider?: Rider;
  time?: boolean;
}) {
  const value = time
    ? formatPredictedTime(entry?.predicted_time)
    : riderName(rider, entry?.rider_id);

  return (
    <p className="task35-entry-line">
      <span>{label}</span>
      <strong>{value}</strong>
      <b>{formatPoints(entry?.points)}</b>
    </p>
  );
}

function PredictionDetail({
  prediction,
  entries,
  riders,
  grandPrix,
}: {
  prediction?: PredictionScore;
  entries: PredictionEntry[];
  riders: Rider[];
  grandPrix?: GrandPrix[];
}) {
  const riderMap = new Map(riders.map((rider) => [rider.id, rider]));
  const byType = (type: string) =>
    entries
      .filter((entry) => entry.prediction_type === type)
      .sort((a, b) => (toNumber(a.position) || 0) - (toNumber(b.position) || 0));
  const qualifying = byType('POLE');
  const qualifyingTime = byType('QUALIFYING_TIME');
  const sprint = byType('SPRINT');
  const race = byType('RACE');
  const out = byType('RACE_OUT')[0];
  const scoreConsistency = prediction ? scoreComponentsMatchTotal(prediction) : null;
  const sourceForType = (types: string[]) => {
    const entry = entries.find(
      (candidate) =>
        candidate.source === 'CARRY_OVER' &&
        candidate.prediction_type !== null &&
        types.includes(candidate.prediction_type),
    );
    if (!entry?.carried_from_grand_prix_id) return null;
    return grandPrix?.find((item) => item.id === entry.carried_from_grand_prix_id) ?? null;
  };
  const sourceLabel = (types: string[]) => {
    const source = sourceForType(types);
    return source ? `Ereditato dal ${gpName(source)}` : null;
  };

  if (!prediction) {
    return (
      <div className="task21-detail-empty">
        <Flag size={18} aria-hidden="true" />
        <strong>Pronostico non disponibile</strong>
        <span>Non risultano dati per questo partecipante e GP.</span>
      </div>
    );
  }

  return (
    <div className="task21-prediction-detail">
      <div className="task21-detail-section">
        <div className="task21-detail-title">
          <span>01</span>
          <h4>Qualifica</h4>
        </div>
        {sourceLabel(carryOverEntryTypes.Q) && (
          <p className="task21-source-note">{sourceLabel(carryOverEntryTypes.Q)}</p>
        )}
        <div className="task35-entry-list">
          <EntryLine
            label="Pole"
            entry={qualifying[0]}
            rider={riderMap.get(qualifying[0]?.rider_id || '')}
          />
          <EntryLine
            label="Tempo pole"
            entry={qualifyingTime[0] || {
              id: '',
              prediction_id: prediction.id,
              prediction_type: 'QUALIFYING_TIME',
              position: 1,
              rider_id: null,
              predicted_time: prediction.qualifying_pole_time,
              points: null,
              source: null,
              carried_from_grand_prix_id: null,
            }}
            time
          />
          <div className="task35-section-total">
            <span>Totale Qualifica</span>
            <strong>{formatPoints(prediction.qualifying_points)}</strong>
          </div>
        </div>
      </div>
      <div className="task21-detail-section">
        <div className="task21-detail-title">
          <span>02</span>
          <h4>Sprint</h4>
        </div>
        {sourceLabel(carryOverEntryTypes.SPR) && (
          <p className="task21-source-note">{sourceLabel(carryOverEntryTypes.SPR)}</p>
        )}
        <div className="task35-entry-list">
          {[1, 2, 3].map((position) => {
            const entry = sprint.find((item) => toNumber(item.position) === position);
            return (
              <EntryLine
                key={position}
                label={`P${position}`}
                entry={entry}
                rider={riderMap.get(entry?.rider_id || '')}
              />
            );
          })}
          <div className="task35-section-total">
            <span>Totale Sprint</span>
            <strong>{formatPoints(prediction.sprint_points)}</strong>
          </div>
        </div>
      </div>
      <div className="task21-detail-section">
        <div className="task21-detail-title">
          <span>03</span>
          <h4>Gara</h4>
        </div>
        {sourceLabel(carryOverEntryTypes.RAC) && (
          <p className="task21-source-note">{sourceLabel(carryOverEntryTypes.RAC)}</p>
        )}
        <div className="task35-entry-list">
          {[1, 2, 3, 4, 5].map((position) => {
            const entry = race.find((item) => toNumber(item.position) === position);
            return (
              <EntryLine
                key={position}
                label={`P${position}`}
                entry={entry}
                rider={riderMap.get(entry?.rider_id || '')}
              />
            );
          })}
          <EntryLine
            label="OUT"
            entry={out}
            rider={riderMap.get(out?.rider_id || '')}
          />
          <div className="task35-detail-points">
            <p><span>Bonus</span><strong>{formatPoints(prediction.bonus_points)}</strong></p>
            <p><span>Malus</span><strong>{formatPoints(prediction.malus_points)}</strong></p>
          </div>
          <div className="task35-section-total">
            <span>Totale Gara</span>
            <strong>{formatPoints(prediction.race_points)}</strong>
          </div>
        </div>
      </div>
      <div className="task35-total-block">
        <div>
          <span>Totale GP</span>
          <strong>{formatTotal(prediction.total_points)} punti</strong>
        </div>
        <small>Qualifica + Sprint + Gara + Bonus + Malus</small>
        {scoreConsistency === false && (
          <p className="task35-inconsistency" role="status">
            Le componenti visualizzate non coincidono con il totale memorizzato. Il valore ufficiale resta quello del database.
          </p>
        )}
      </div>
    </div>
  );
}

function PredictionHistoryCard({
  grandPrix,
  round,
  prediction,
  entries,
  riders,
  allGrandPrix,
  sessions,
  isLoading = false,
  errorMessage,
}: {
  grandPrix: GrandPrix;
  round: number;
  prediction?: PredictionScore;
  entries: PredictionEntry[];
  riders: Rider[];
  allGrandPrix: GrandPrix[];
  sessions: RaceSession[];
  isLoading?: boolean;
  errorMessage?: string | null;
}) {
  const gpClosed = isGpClosed(grandPrix.id, sessions);
  const predictionEntries = prediction
    ? entries.filter((entry) => entry.prediction_id === prediction.id)
    : [];
  const status = statusForPrediction(prediction, gpClosed);
  const StatusIcon = status.icon;

  return (
    <details className="task35-gp-card">
      <summary className="task35-gp-summary">
        <span className="task35-gp-summary-identity">
          <span className="task21-round">GP {String(round).padStart(2, '0')}</span>
          <strong>{gpName(grandPrix)}</strong>
          <small>{formatShortDate(grandPrix.date_start)} — {formatShortDate(grandPrix.date_end)}</small>
        </span>
        <span className={`task21-row-status ${status.className}`}>
          <StatusIcon size={14} aria-hidden="true" />
          {status.label}
        </span>
        <span className="task35-summary-scores">
          {[
            ['Qualifica', prediction?.qualifying_points],
            ['Sprint', prediction?.sprint_points],
            ['Gara', prediction?.race_points],
            ['Bonus', prediction?.bonus_points],
            ['Malus', prediction?.malus_points],
          ].map(([label, value]) => (
            <span key={label}>
              <small>{label}</small>
              <strong>{formatPoints(value)}</strong>
            </span>
          ))}
        </span>
        <span className="task35-summary-total">
          <small>Totale</small>
          <strong>{formatTotal(prediction?.total_points)}</strong>
        </span>
        <ChevronRight size={17} aria-hidden="true" className="task35-summary-chevron" />
      </summary>
      <div className="task35-gp-card-content">
        {!gpClosed ? (
          <div className="task21-locked-detail" role="status">
            <LockKeyhole size={23} aria-hidden="true" />
            <strong>Dettaglio nascosto fino alla chiusura del GP</strong>
            <span>Il pronostico e i punti per singola posizione saranno visibili quando il GP sarà chiuso.</span>
          </div>
        ) : isLoading ? (
          <div className="task21-detail-loading" role="status">Caricamento dettaglio...</div>
        ) : errorMessage ? (
          <div className="task21-detail-empty task21-detail-empty--error" role="alert">
            <AlertCircle size={18} aria-hidden="true" />
            <strong>{errorMessage}</strong>
          </div>
        ) : (
          <PredictionDetail
            prediction={prediction}
            entries={predictionEntries}
            riders={riders}
            grandPrix={allGrandPrix}
          />
        )}
      </div>
    </details>
  );
}

export function LeagueResultsContent({
  user,
  leagueId,
  onBack,
}: {
  user: User | null;
  leagueId: string | undefined;
  onBack: () => void;
}) {
  const [league, setLeague] = useState<League | null>(null);
  const [members, setMembers] = useState<LeagueMember[]>([]);
  const [season, setSeason] = useState<Season | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [grandPrix, setGrandPrix] = useState<GrandPrix[]>([]);
  const [sessions, setSessions] = useState<RaceSession[]>([]);
  const [predictions, setPredictions] = useState<PredictionScore[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [memberDetailEntries, setMemberDetailEntries] = useState<PredictionEntry[]>([]);
  const [memberDetailRiders, setMemberDetailRiders] = useState<Rider[]>([]);
  const [isMemberDetailLoading, setIsMemberDetailLoading] = useState(false);
  const [memberDetailError, setMemberDetailError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [leaveError, setLeaveError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user || !leagueId) {
      setErrorMessage('Utente non autenticato o lega non specificata.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const membershipResponse = await supabase
        .from('league_members')
        .select('league_id')
        .eq('league_id', leagueId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (membershipResponse.error || !membershipResponse.data) {
        throw new Error('Lega non trovata o non sei membro di questa lega.');
      }

      const [leagueResponse, membersResponse, seasonData] = await Promise.all([
        supabase
          .from('leagues')
          .select('id, name, invite_code, created_at')
          .eq('id', leagueId)
          .maybeSingle(),
        supabase.rpc('get_league_members', { p_league_id: leagueId }),
        loadSeasonData(),
      ]);

      if (leagueResponse.error || !leagueResponse.data) {
        throw new Error('Lega non trovata o non accessibile.');
      }
      if (membersResponse.error) {
        throw new Error('Non è stato possibile caricare i partecipanti.');
      }

      const nextMembers = (membersResponse.data || []) as LeagueMember[];
      const memberIds = nextMembers.map((member) => member.user_id);
      const predictionsResponse = memberIds.length
        ? await supabase
            .from('predictions')
            .select(leaderboardSelect)
            .eq('league_id', leagueId)
            .in('user_id', memberIds)
        : { data: [], error: null };

      if (predictionsResponse.error) {
        throw new Error('Non è stato possibile caricare i punteggi della lega.');
      }

      setLeague(leagueResponse.data as League);
      setMembers(nextMembers);
      setSeasons(seasonData.seasons);
      setSeason(seasonData.season);
      setGrandPrix(seasonData.grandPrix);
      setSessions(seasonData.sessions);
      setPredictions((predictionsResponse.data || []) as PredictionScore[]);
      setSelectedMemberId((current) =>
        current && memberIds.includes(current) ? current : user.id,
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Errore imprevisto durante il caricamento.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [leagueId, user]);

  useEffect(() => {
    void load();
  }, [load]);

  const seasonGrandPrix = useMemo(
    () =>
      grandPrix.filter((grandPrixItem) => grandPrixItem.season_id === season?.id),
    [grandPrix, season?.id],
  );
  const seasonGrandPrixIds = useMemo(
    () => new Set(seasonGrandPrix.map((grandPrixItem) => grandPrixItem.id)),
    [seasonGrandPrix],
  );
  const seasonPredictions = useMemo(
    () =>
      predictions.filter((prediction) =>
        seasonGrandPrixIds.has(prediction.grand_prix_id),
      ),
    [predictions, seasonGrandPrixIds],
  );

  const leaderboard = useMemo(() => {
    const rows = members.map((member, index) => {
      const memberPredictions = seasonPredictions.filter(
        (prediction) => prediction.user_id === member.user_id,
      );
      const scored = memberPredictions.filter(hasScore);
      return {
        member,
        originalIndex: index,
        predictions: memberPredictions,
        scoredCount: scored.length,
        total: scored.reduce(
          (total, prediction) => total + (toNumber(prediction.total_points) || 0),
          0,
        ),
      };
    });

    const sortedRows = rows.sort((a, b) => {
        if (b.total !== a.total) return b.total - a.total;
        return a.originalIndex - b.originalIndex;
      });
    let previousTotal: number | null = null;
    let previousRank = 0;
    return sortedRows.map((row, index) => {
      if (previousTotal === null || row.total !== previousTotal) {
        previousRank = index + 1;
        previousTotal = row.total;
      }
      return { ...row, rank: previousRank };
    });
  }, [members, seasonPredictions]);

  const selectedMember = members.find((member) => member.user_id === selectedMemberId);
  const selectedMemberPredictions = useMemo(
    () =>
      seasonPredictions.filter(
        (prediction) => prediction.user_id === selectedMemberId,
      ),
    [seasonPredictions, selectedMemberId],
  );

  useEffect(() => {
    let isMounted = true;

    async function loadMemberDetails() {
      setMemberDetailEntries([]);
      setMemberDetailRiders([]);
      setMemberDetailError(null);

      const predictionIds = selectedMemberPredictions
        .filter((prediction) => isGpClosed(prediction.grand_prix_id, sessions))
        .map((prediction) => prediction.id);
      if (!predictionIds.length) {
        setIsMemberDetailLoading(false);
        return;
      }

      setIsMemberDetailLoading(true);
      const entriesResponse = await loadPredictionEntries(predictionIds);
      if (!isMounted) return;
      if (entriesResponse.error) {
        setMemberDetailError('I pronostici sono chiusi, ma il dettaglio non è disponibile.');
        setIsMemberDetailLoading(false);
        return;
      }

      const entries = (entriesResponse.data || []) as unknown as PredictionEntry[];
      const riderIds = [...new Set(entries.map((entry) => entry.rider_id).filter(Boolean))] as string[];

      const ridersResponse = riderIds.length
        ? await supabase
            .from('riders')
            .select('id, name, surname, nickname')
            .in('id', [...new Set(riderIds)])
        : { data: [], error: null };

      if (!isMounted) return;
      if (ridersResponse.error) {
        setMemberDetailError('I nomi dei piloti non sono disponibili.');
      } else {
        setMemberDetailEntries(entries);
        setMemberDetailRiders((ridersResponse.data || []) as Rider[]);
      }
      setIsMemberDetailLoading(false);
    }

    void loadMemberDetails();
    return () => {
      isMounted = false;
    };
  }, [selectedMemberPredictions, sessions]);

  async function handleCopyCode() {
    if (!league) return;
    try {
      await navigator.clipboard.writeText(league.invite_code);
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), 2000);
    } catch {
      setIsCopied(false);
    }
  }

  async function handleLeave() {
    if (!user || !leagueId || !window.confirm('Sei sicura di voler uscire da questa lega?')) return;
    setLeaveError(null);
    setIsLeaving(true);
    const { error } = await supabase
      .from('league_members')
      .delete()
      .eq('league_id', leagueId)
      .eq('user_id', user.id);
    if (error) {
      setLeaveError('Non è stato possibile uscire dalla lega. Riprova.');
      setIsLeaving(false);
      return;
    }
    onBack();
  }

  if (isLoading) return <ResultsState kind="loading" message="" />;
  if (errorMessage) {
    return (
      <div className="task21-error-with-back">
        <ResultsState kind="error" message={errorMessage} onRetry={() => void load()} />
        <button className="task21-button task21-button--secondary" type="button" onClick={onBack}>
          Torna alle leghe
        </button>
      </div>
    );
  }
  if (!league || !season) return null;

  return (
    <div className="task21-league-shell">
      <div className="task21-league-context">
        <div>
          <span className="task21-kicker">Fanta MotoGP · Lega</span>
          <h2>{league.name || 'Lega senza nome'}</h2>
          <p>{members.length} {members.length === 1 ? 'partecipante' : 'partecipanti'} · stagione {season.year}</p>
        </div>
        <label className="task21-select-label task21-select-label--dark" htmlFor="task21-league-season">
          <span>Stagione</span>
          <select
            id="task21-league-season"
            name="season"
            value={season.id}
            onChange={(event) => {
              const nextSeason = seasons.find((item) => item.id === event.target.value);
              if (nextSeason) setSeason(nextSeason);
            }}
            disabled={seasons.length < 2}
            data-testid="task21-league-season-select"
          >
            {seasons.map((item) => (
              <option key={item.id} value={item.id}>
                MotoGP {item.year}
              </option>
            ))}
          </select>
        </label>
        <div className="task21-invite">
          <span>Codice invito</span>
          <strong>{league.invite_code}</strong>
          <button className="task21-button task21-button--light" type="button" onClick={() => void handleCopyCode()}>
            <Clipboard size={14} aria-hidden="true" />
            {isCopied ? 'Codice copiato' : 'Copia codice'}
          </button>
        </div>
      </div>

      {members.length === 0 ? (
        <ResultsState kind="empty" message="Nessun partecipante nella lega" />
      ) : (
        <div className="task21-league-grid">
          <section className="task21-panel" aria-labelledby="task21-leaderboard-title">
            <div className="task21-panel-heading">
              <div>
                <span className="task21-kicker">Stagione {season.year}</span>
                <h2 id="task21-leaderboard-title">Classifica lega</h2>
              </div>
              <Trophy size={25} aria-hidden="true" className="task21-panel-icon" />
            </div>
            <div className="task21-leaderboard" role="list" aria-label="Classifica completa della lega">
              {leaderboard.map((row) => {
                const isCurrentUser = row.member.user_id === user?.id;
                const isSelected = row.member.user_id === selectedMemberId;
                return (
                  <button
                    className={`task21-leader-row${isCurrentUser ? ' is-current' : ''}${isSelected ? ' is-selected' : ''}`}
                    type="button"
                    key={row.member.user_id}
                    onClick={() => setSelectedMemberId(row.member.user_id)}
                    aria-pressed={isSelected}
                    role="listitem"
                  >
                    <span className="task21-rank">{row.rank}</span>
                    <span className="task21-member-avatar" aria-hidden="true"><UserRound size={17} /></span>
                    <span className="task21-member-name">
                      <strong>{row.member.name || 'Utente senza nome'}</strong>
                      {isCurrentUser && <small>Tu</small>}
                    </span>
                    <span className="task21-member-meta">
                      <small>{row.scoredCount} GP disponibili</small>
                      <strong>{row.total}</strong>
                    </span>
                    <ChevronRight size={17} aria-hidden="true" className="task21-row-chevron" />
                  </button>
                );
              })}
            </div>
            <p className="task21-note">
              A parità di punti viene mantenuta la parità; non è disponibile un criterio di spareggio nei dati attuali.
            </p>
          </section>

          <section className="task21-panel task21-participant-panel" aria-labelledby="task21-participant-title">
            <div className="task21-panel-heading">
              <div>
                <span className="task21-kicker">Dettaglio partecipante</span>
                <h2 id="task21-participant-title">{selectedMember?.name || 'Partecipante'}</h2>
                <p className="task35-panel-subtitle">Seleziona un GP per aprire il dettaglio dei punti.</p>
              </div>
              <Users size={24} aria-hidden="true" className="task21-panel-icon" />
            </div>
            <div className="task35-history-list">
              {seasonGrandPrix.map((item, index) => (
                <PredictionHistoryCard
                  key={item.id}
                  grandPrix={item}
                  round={index + 1}
                  prediction={predictionForGp(selectedMemberPredictions, item.id)}
                  entries={memberDetailEntries}
                  riders={memberDetailRiders}
                  allGrandPrix={grandPrix}
                  sessions={sessions}
                  isLoading={isMemberDetailLoading}
                  errorMessage={memberDetailError}
                />
              ))}
            </div>
          </section>
        </div>
      )}

      <div className="task21-league-actions">
        <button className="task21-button task21-button--secondary" type="button" onClick={onBack}>
          Torna alle leghe
        </button>
        <button className="task21-button task21-button--danger" type="button" onClick={() => void handleLeave()} disabled={isLeaving}>
          {isLeaving ? 'Uscita in corso...' : 'Esci dalla lega'}
        </button>
      </div>
      {leaveError && <p className="task21-inline-error" role="alert">{leaveError}</p>}
    </div>
  );
}