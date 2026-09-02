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

function formatDate(value: string | null | undefined) {
  if (!value) return 'Data non disponibile';
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
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

function sessionLabel(type: string | null) {
  if (type === 'Q') return 'Qualifica';
  if (type === 'SPR') return 'Sprint';
  if (type === 'RAC') return 'Gara';
  return type || 'Sessione';
}

const carryOverEntryTypes: Record<string, string[]> = {
  Q: ['POLE', 'QUALIFYING_TIME'],
  SPR: ['SPRINT'],
  RAC: ['RACE', 'RACE_OUT'],
};

function carryOverSessionsForPrediction(
  prediction: PredictionScore | undefined,
  entries: PredictionEntry[],
  grandPrix: GrandPrix[],
) {
  if (!prediction) return [];

  const sourceBySession = new Map<string, string>();
  for (const [sessionType, entryTypes] of Object.entries(carryOverEntryTypes)) {
    const sourceEntry = entries.find(
      (entry) =>
        entry.prediction_id === prediction.id &&
        entry.source === 'CARRY_OVER' &&
        entry.prediction_type !== null &&
        entryTypes.includes(entry.prediction_type),
    );
    if (sourceEntry?.carried_from_grand_prix_id) {
      sourceBySession.set(sessionType, sourceEntry.carried_from_grand_prix_id);
    }
  }

  return [...sourceBySession.entries()].map(([sessionType, sourceGrandPrixId]) => ({
    sessionType,
    sourceGrandPrix:
      grandPrix.find((item) => item.id === sourceGrandPrixId) ?? null,
  }));
}

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
  const seasonResponse = await supabase
    .from('seasons')
    .select('id, year')
    .eq('year', 2026)
    .maybeSingle();

  if (seasonResponse.error || !seasonResponse.data) {
    throw new Error('Non è stato possibile caricare la stagione.');
  }

  const season = seasonResponse.data as Season;
  const [grandPrixResponse, sessionsResponse] = await Promise.all([
    supabase
      .from('grand_prix')
      .select('id, name, short_name, country, circuit, date_start, date_end')
      .eq('season_id', season.id)
      .eq('is_test', false)
      .order('date_start', { ascending: true }),
    supabase
      .from('sessions')
      .select('id, grand_prix_id, type, status, session_date, number')
      .order('session_date', { ascending: true }),
  ]);

  if (grandPrixResponse.error || sessionsResponse.error) {
    throw new Error('Non è stato possibile caricare il calendario MotoGP.');
  }

  return {
    season,
    grandPrix: (grandPrixResponse.data || []) as GrandPrix[],
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

function ScoreBreakdown({
  prediction,
  compact = false,
}: {
  prediction?: PredictionScore;
  compact?: boolean;
}) {
  const fields = [
    ['Qualifica', prediction?.qualifying_points],
    ['Sprint', prediction?.sprint_points],
    ['Gara', prediction?.race_points],
    ['Bonus', prediction?.bonus_points],
    ['Malus', prediction?.malus_points],
  ] as const;

  return (
    <div className={`task21-score-breakdown${compact ? ' is-compact' : ''}`}>
      {fields.map(([label, value]) => (
        <div className="task21-score-item" key={label}>
          <span>{label}</span>
          <strong>{formatPoints(value)}</strong>
        </div>
      ))}
      <div className="task21-score-item task21-score-item--total">
        <span>Totale</span>
        <strong>{formatTotal(prediction?.total_points)}</strong>
      </div>
    </div>
  );
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
  const predictionRiderMap = useMemo(
    () => new Map(predictionRiders.map((rider) => [rider.id, rider])),
    [predictionRiders],
  );

  const rows = useMemo(
    () =>
      grandPrix.map((grandPrixItem, index) => ({
        grandPrix: grandPrixItem,
        round: index + 1,
        prediction: predictionForGp(visiblePredictions, grandPrixItem.id),
      })),
    [grandPrix, visiblePredictions],
  );

  const scoredPredictions = visiblePredictions.filter(hasScore);
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
  if (!season || grandPrix.length === 0) {
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
      </div>

      <section className="task21-score-hero" aria-labelledby="task21-season-score">
        <div>
          <span className="task21-kicker">Punteggio stagione</span>
          <h2 id="task21-season-score">{seasonTotal}</h2>
          <p>
            {scoredPredictions.length} GP con punteggio disponibile su {grandPrix.length}
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
          {rows.map(({ grandPrix: item, round, prediction }) => {
            const status = statusForPrediction(
              prediction,
              isGpClosed(item.id, sessions),
            );
            const StatusIcon = status.icon;
            const carryOvers = carryOverSessionsForPrediction(
              prediction,
              predictionEntries,
              grandPrix,
            );
            return (
              <article className="task21-gp-row" key={item.id}>
                <div className="task21-gp-identity">
                  <span className="task21-round">GP {String(round).padStart(2, '0')}</span>
                  <strong>{gpName(item)}</strong>
                  <small>{formatShortDate(item.date_start)} — {formatShortDate(item.date_end)}</small>
                </div>
                <div className={`task21-row-status ${status.className}`}>
                  <StatusIcon size={14} aria-hidden="true" />
                  <span>{status.label}</span>
                </div>
                <div className="task21-gp-points">
                  <span>Punteggio</span>
                  <strong>{formatTotal(prediction?.total_points)}</strong>
                </div>
                <div className="task21-gp-out">
                  <span>OUT</span>
                  <strong>
                    {prediction
                      ? riderName(
                        predictionRiderMap.get(
                          predictionEntries.find(
                            (entry) =>
                              entry.prediction_id === prediction.id &&
                              entry.prediction_type === 'RACE_OUT',
                          )?.rider_id || '',
                        ),
                        predictionEntries.find(
                          (entry) =>
                            entry.prediction_id === prediction.id &&
                            entry.prediction_type === 'RACE_OUT',
                        )?.rider_id,
                      )
                      : '—'}
                  </strong>
                </div>
                {carryOvers.length > 0 && (
                  <div className="task21-carry-over-note" role="status">
                    <RefreshCw size={13} aria-hidden="true" />
                    <span>
                      {carryOvers.map(({ sessionType, sourceGrandPrix }, index) => (
                        <span key={sessionType}>
                          {index > 0 ? ' · ' : ''}
                          {sessionLabel(sessionType)} — ereditato dal{' '}
                          {sourceGrandPrix ? gpName(sourceGrandPrix) : 'GP precedente'}
                        </span>
                      ))}
                    </span>
                  </div>
                )}
                <details className="task21-breakdown-details">
                  <summary>Dettaglio</summary>
                  <ScoreBreakdown prediction={prediction} compact />
                </details>
              </article>
            );
          })}
        </div>
        <p className="task21-note">
          I punteggi sono mostrati come restituiti dal sistema. La posizione media in lega non è disponibile nei dati attuali.
        </p>
      </section>
    </div>
  );
}

function riderName(rider: Rider | undefined, riderId: string | null | undefined) {
  if (!riderId) return 'Non indicato';
  if (!rider) return 'Pilota non disponibile';
  return rider.nickname || [rider.name, rider.surname].filter(Boolean).join(' ') || 'Pilota';
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
        <div className="task21-detail-values">
          <p><span>Pole</span><strong>{riderName(riderMap.get(qualifying[0]?.rider_id || ''), qualifying[0]?.rider_id)}</strong></p>
          <p><span>Tempo pole</span><strong>{toNumber(qualifyingTime[0]?.predicted_time ?? prediction.qualifying_pole_time)?.toFixed(3) || '—'} s</strong></p>
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
        <ol className="task21-rider-list">
          {sprint.length > 0 ? sprint.map((entry) => (
            <li key={entry.id}>
              <span>{entry.position || '—'}</span>
              <strong>{riderName(riderMap.get(entry.rider_id || ''), entry.rider_id)}</strong>
            </li>
          )) : <li className="is-muted">Nessun dettaglio disponibile</li>}
        </ol>
      </div>
      <div className="task21-detail-section">
        <div className="task21-detail-title">
          <span>03</span>
          <h4>Gara</h4>
        </div>
        {sourceLabel(carryOverEntryTypes.RAC) && (
          <p className="task21-source-note">{sourceLabel(carryOverEntryTypes.RAC)}</p>
        )}
        <ol className="task21-rider-list">
          {race.length > 0 ? race.map((entry) => (
            <li key={entry.id}>
              <span>{entry.position || '—'}</span>
              <strong>{riderName(riderMap.get(entry.rider_id || ''), entry.rider_id)}</strong>
            </li>
          )) : <li className="is-muted">Nessun dettaglio disponibile</li>}
        </ol>
        <p className="task21-out-value">
          <span>OUT</span>
          <strong>{riderName(riderMap.get(out?.rider_id || ''), out?.rider_id)}</strong>
        </p>
      </div>
      <ScoreBreakdown prediction={prediction} />
    </div>
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
  const [grandPrix, setGrandPrix] = useState<GrandPrix[]>([]);
  const [sessions, setSessions] = useState<RaceSession[]>([]);
  const [predictions, setPredictions] = useState<PredictionScore[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedGpId, setSelectedGpId] = useState('');
  const [detailPrediction, setDetailPrediction] = useState<PredictionScore | undefined>();
  const [detailEntries, setDetailEntries] = useState<PredictionEntry[]>([]);
  const [detailRiders, setDetailRiders] = useState<Rider[]>([]);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
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
      setGrandPrix(seasonData.grandPrix);
      setSessions(seasonData.sessions);
      setPredictions((predictionsResponse.data || []) as PredictionScore[]);
      setSelectedMemberId((current) =>
        current && memberIds.includes(current) ? current : user.id,
      );
      setSelectedGpId((current) =>
        current && seasonData.grandPrix.some((item) => item.id === current)
          ? current
          : seasonData.grandPrix[seasonData.grandPrix.length - 1]?.id || '',
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

  const leaderboard = useMemo(() => {
    const rows = members.map((member, index) => {
      const memberPredictions = predictions.filter(
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
  }, [members, predictions]);

  const selectedMember = members.find((member) => member.user_id === selectedMemberId);
  const selectedGp = grandPrix.find((item) => item.id === selectedGpId);
  const selectedPrediction = predictions.find(
    (prediction) =>
      prediction.user_id === selectedMemberId &&
      prediction.grand_prix_id === selectedGpId,
  );
  const selectedGpIsClosed = selectedGp ? isGpClosed(selectedGp.id, sessions) : false;

  useEffect(() => {
    let isMounted = true;

    async function loadDetails() {
      setDetailPrediction(undefined);
      setDetailEntries([]);
      setDetailRiders([]);
      setDetailError(null);

      if (!selectedPrediction || !selectedGpIsClosed) {
        return;
      }

      setIsDetailLoading(true);
      const predictionResponse = await supabase
        .from('predictions')
        .select(scoreSelect)
        .eq('id', selectedPrediction.id)
        .maybeSingle();

      if (!isMounted) return;
      if (predictionResponse.error || !predictionResponse.data) {
        setDetailError('Il pronostico è chiuso, ma il dettaglio non è disponibile.');
        setIsDetailLoading(false);
        return;
      }

      const prediction = predictionResponse.data as unknown as PredictionScore;
      let entriesResponse = await supabase
        .from('prediction_entries')
        .select(predictionEntrySelect)
        .eq('prediction_id', prediction.id)
        .order('prediction_type', { ascending: true })
        .order('position', { ascending: true });

      if (entriesResponse.error && isMissingCarryOverColumns(entriesResponse.error)) {
        entriesResponse = await supabase
          .from('prediction_entries')
          .select(legacyPredictionEntrySelect)
          .eq('prediction_id', prediction.id)
          .order('prediction_type', { ascending: true })
          .order('position', { ascending: true });
      }

      if (!isMounted) return;
      if (entriesResponse.error) {
        setDetailError('Il pronostico è chiuso, ma il dettaglio non è disponibile.');
        setIsDetailLoading(false);
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
        setDetailError('Il pronostico è chiuso, ma i nomi dei piloti non sono disponibili.');
      } else {
        setDetailPrediction(prediction);
        setDetailEntries(entries);
        setDetailRiders((ridersResponse.data || []) as Rider[]);
      }
      setIsDetailLoading(false);
    }

    void loadDetails();
    return () => {
      isMounted = false;
    };
  }, [selectedGpIsClosed, selectedPrediction]);

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
  if (!league) return null;

  return (
    <div className="task21-league-shell">
      <div className="task21-league-context">
        <div>
          <span className="task21-kicker">Fanta MotoGP · Lega</span>
          <h2>{league.name || 'Lega senza nome'}</h2>
          <p>{members.length} {members.length === 1 ? 'partecipante' : 'partecipanti'} · stagione 2026</p>
        </div>
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
                <span className="task21-kicker">Stagione 2026</span>
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
              </div>
              <Users size={24} aria-hidden="true" className="task21-panel-icon" />
            </div>
            <label className="task21-select-label" htmlFor="task21-participant-gp">
              <span>Gran Premio</span>
              <select
                id="task21-participant-gp"
                value={selectedGpId}
                onChange={(event) => setSelectedGpId(event.target.value)}
              >
                {grandPrix.map((item, index) => (
                  <option key={item.id} value={item.id}>
                    GP {String(index + 1).padStart(2, '0')} · {gpLabel(item)}
                  </option>
                ))}
              </select>
            </label>

            {selectedGp && (
              <div className="task21-detail-gp-heading">
                <div>
                  <span>{gpName(selectedGp)}</span>
                  <small>{formatDate(selectedGp.date_start)}</small>
                </div>
                <StatusBadge prediction={selectedPrediction} gpClosed={selectedGpIsClosed} />
              </div>
            )}

            {!selectedGpIsClosed ? (
              <div className="task21-locked-detail" role="status">
                <LockKeyhole size={23} aria-hidden="true" />
                <strong>Pronostico nascosto fino alla chiusura del GP</strong>
                <span>Qualifica, Sprint, Gara e OUT saranno visibili quando tutte le sessioni rilevanti saranno chiuse.</span>
              </div>
            ) : isDetailLoading ? (
              <div className="task21-detail-loading" role="status">Caricamento dettaglio...</div>
            ) : detailError ? (
              <div className="task21-detail-empty task21-detail-empty--error" role="alert">
                <AlertCircle size={18} aria-hidden="true" />
                <strong>{detailError}</strong>
              </div>
            ) : (
              <PredictionDetail
                prediction={detailPrediction}
                entries={detailEntries}
                riders={detailRiders}
                grandPrix={grandPrix}
              />
            )}
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