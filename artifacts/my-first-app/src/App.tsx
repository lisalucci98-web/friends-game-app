import { type User } from '@supabase/supabase-js';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { supabase } from '@/lib/supabase';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Flag,
  Home as HomeIcon,
  LockKeyhole,
  MapPin,
  Medal,
  RefreshCw,
  Save,
  Settings,
  Timer,
  Trophy,
  UserRound,
} from 'lucide-react';
import {
  Route,
  Switch,
  useLocation,
  useParams,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

type AuthContextValue = {
  user: User | null;
  isAuthLoading: boolean;
  authLoadError: string | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthContext.Provider');
  }

  return context;
}

function AuthStatus() {
  const { user, isAuthLoading, authLoadError } = useAuth();
  const [, navigate] = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  async function handleLogout() {
    setLogoutError(null);
    setIsLoggingOut(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      setLogoutError('Non è stato possibile uscire. Riprova.');
    } else {
      navigate('/auth');
    }

    setIsLoggingOut(false);
  }

  if (isAuthLoading) {
    return <span className="nav-note">verifica accesso...</span>;
  }

  if (!user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span className="nav-note">non autenticata</span>
        <button
          type="button"
          onClick={() => navigate('/auth')}
          style={{
            border: 0,
            borderRadius: '999px',
            padding: '8px 13px',
            color: 'hsl(var(--primary-foreground))',
            background: 'hsl(var(--primary))',
            cursor: 'pointer',
            font: 'inherit',
            fontSize: '0.76rem',
            fontWeight: 700,
          }}
        >
          Accedi
        </button>
        {authLoadError && (
          <span role="alert" style={{ color: 'hsl(var(--destructive))' }}>
            {authLoadError}
          </span>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span
        className="nav-note"
        title={user.email ?? 'Utente autenticato'}
        style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis' }}
      >
        {user.email ?? 'utente autenticato'}
      </span>
      <button
        type="button"
        onClick={() => void handleLogout()}
        disabled={isLoggingOut}
        style={{
          border: '1px solid hsl(var(--foreground) / 0.18)',
          borderRadius: '999px',
          padding: '8px 13px',
          color: 'hsl(var(--foreground))',
          background: 'transparent',
          cursor: isLoggingOut ? 'wait' : 'pointer',
          font: 'inherit',
          fontSize: '0.76rem',
          fontWeight: 700,
        }}
      >
        {isLoggingOut ? 'Uscita...' : 'Esci'}
      </button>
      {logoutError && (
        <span role="alert" style={{ color: 'hsl(var(--destructive))' }}>
          {logoutError}
        </span>
      )}
    </div>
  );
}

function WelcomePage() {
  const [, navigate] = useLocation();

  return (
    <main className="welcome-page" data-testid="page-welcome">
      <header className="welcome-nav">
        <div className="brand-lockup" data-testid="text-brand">
          <span className="brand-mark" aria-hidden="true">M</span>
          <span>MyFirstApp</span>
        </div>
        <span className="nav-note">il tuo primo passo · 01</span>
      </header>

      <section className="welcome-content" aria-labelledby="home-title">
        <div className="welcome-copy">
          <p className="eyebrow">Benvenuto qui</p>
          <h1 className="welcome-title" id="home-title">
            My First <em>App</em>
          </h1>
          <p className="welcome-description">
            Ciao, questo è il tuo primo spazio per imparare a programmare.
            Inizia con calma: ogni riga è un passo.
          </p>
          <button
            className="start-button"
            data-testid="button-start"
            type="button"
            onClick={() => navigate('/home')}
          >
            <span>Inizia</span>
            <span className="button-icon" aria-hidden="true">
              <ArrowRight size={16} strokeWidth={2.5} />
            </span>
          </button>
        </div>

        <div className="lesson-card" aria-label="Anteprima del tuo primo esercizio" data-testid="card-first-lesson">
          <div className="card-orbit" aria-hidden="true" />
          <div className="lesson-window">
            <div className="window-top">
              <div className="window-dots" aria-hidden="true">
                <span /><span /><span />
              </div>
              <span className="window-label">primo-esercizio.js</span>
            </div>
            <div className="window-body">
              <p className="lesson-kicker">Esercizio 01 / 01</p>
              <h2 className="lesson-title">Le idee iniziano da una riga.</h2>
              <pre className="code-snippet" aria-label="Esempio di codice"><code><span className="soft">const</span> saluto <span className="soft">=</span> <span className="hot">'ciao, mondo'</span>;<br /><span className="soft">console</span>.log(saluto);</code></pre>
              <p className="window-caption">
                <span className="caption-line" aria-hidden="true" />
                Non serve sapere tutto. Serve solo cominciare.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="welcome-footer">
        <span>imparare facendo</span>
        <span>una riga alla volta</span>
      </footer>
    </main>
  );
}

function MainPageLayout({
  eyebrow,
  title,
  text,
  className,
  children,
}: {
  eyebrow: string;
  title: string;
  text: string;
  className?: string;
  children?: ReactNode;
}) {
  const [location, navigate] = useLocation();
  const sections = [
    { path: '/home', label: 'Home', icon: HomeIcon },
    { path: '/leghe', label: 'Leghe', icon: Trophy },
    { path: '/pronostici', label: 'Pronostici', icon: Medal },
    { path: '/risultati', label: 'Risultati', icon: Flag },
    { path: '/profilo', label: 'Profilo', icon: UserRound },
    { path: '/impostazioni', label: 'Impostazioni', icon: Settings },
  ];

  return (
    <main className={`welcome-page app-page${className ? ` ${className}` : ''}`} data-testid="page-app">
      <header className="welcome-nav">
        <div className="brand-lockup" data-testid="text-brand">
          <span className="brand-mark" aria-hidden="true">M</span>
          <span>MyFirstApp</span>
        </div>
        <AuthStatus />
      </header>

      <section className="app-content" aria-labelledby="app-page-title">
        <div className="app-copy">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="welcome-title" id="app-page-title">
            {title}
          </h1>
          <p className="welcome-description">{text}</p>
          {children}
        </div>
      </section>

      <nav className="bottom-nav" aria-label="Navigazione principale">
        {sections.map(({ path, label, icon: Icon }) => {
          const isActive = location === path;

          return (
            <button
              className={`bottom-nav-item${isActive ? ' is-active' : ''}`}
              key={path}
              type="button"
              data-testid={`nav-${label.toLowerCase()}`}
              onClick={() => navigate(path)}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={19} strokeWidth={isActive ? 2.4 : 1.9} aria-hidden="true" />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>
    </main>
  );
}

function HomePage() {
  return (
    <MainPageLayout
      eyebrow="Il tuo spazio"
      title="Benvenuta!"
      text="Questa è la home della mia prima app."
    />
  );
}

type ResultsSeason = {
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

type RawSessionResult = {
  session_id: string;
  rider_id: string;
  rider_number: number | string | null;
  position: number | string | null;
  points: number | string | null;
  total_time: string | null;
  gap: string | null;
  average_speed: number | string | null;
  status: string | null;
};

type Rider = {
  id: string;
  name: string | null;
  surname: string | null;
  nickname: string | null;
};

type RiderSeason = {
  rider_id: string;
  team_id: string | null;
  number: number | string | null;
};

type Team = {
  id: string;
  name: string | null;
};

type Prediction = {
  id: string;
  grand_prix_id: string;
  created_at: string | null;
  updated_at: string | null;
};

type PredictionEntry = {
  id: string;
  prediction_id: string;
  prediction_type: string;
  position: number | string | null;
  rider_id: string;
  created_at: string | null;
};

type PredictionRider = {
  id: string;
  name: string | null;
  surname: string | null;
  nickname: string | null;
  number: number | string | null;
};

type PredictionRosterRow = {
  rider_id: string;
  number: number | string | null;
};

type DisplayResult = RawSessionResult & {
  rider: Rider | null;
  teamName: string | null;
};

const resultSessionLabels: Record<string, string> = {
  Q: 'Qualifiche',
  SPR: 'Sprint',
  RAC: 'Gara',
};

function resultSessionLabel(type: string | null) {
  return type ? resultSessionLabels[type] ?? type : 'Sessione';
}

function resultStatusLabel(status: string | null, position: number | string | null) {
  const normalized = String(status ?? '').trim().toUpperCase();
  if (!normalized && position !== null && position !== undefined) return 'Classificato';
  if (['FINISHED', 'CLASSIFIED', 'CLASSIFICATO', 'OK'].includes(normalized)) {
    return 'Classificato';
  }
  if (['NOT CLASSIFIED', 'NOT_CLASSIFIED', 'NC'].includes(normalized)) {
    return 'Non classificato';
  }
  return normalized || 'Non disponibile';
}

function isResultClassified(result: RawSessionResult) {
  const position = resultPosition(result.position);
  const normalized = String(result.status ?? '').trim().toUpperCase();
  return (
    position !== null &&
    !['DNF', 'DNS', 'DSQ', 'NC', 'NOT CLASSIFIED', 'NOT_CLASSIFIED', 'RETIRED', 'WITHDRAWN'].includes(
      normalized,
    )
  );
}

const sprintPointsByPosition: Record<number, number> = {
  1: 12,
  2: 9,
  3: 7,
  4: 6,
  5: 5,
  6: 4,
  7: 3,
  8: 2,
  9: 1,
};

const racePointsByPosition: Record<number, number> = {
  1: 25,
  2: 20,
  3: 16,
  4: 13,
  5: 11,
  6: 10,
  7: 9,
  8: 8,
  9: 7,
  10: 6,
  11: 5,
  12: 4,
  13: 3,
  14: 2,
  15: 1,
};

function resultDisplayPoints(result: RawSessionResult, sessionType: string) {
  if (sessionType === 'Q' || !isResultClassified(result)) return 0;
  const position = resultPosition(result.position);
  if (position === null) return 0;
  const points =
    sessionType === 'SPR'
      ? sprintPointsByPosition[position] ?? 0
      : sessionType === 'RAC'
        ? racePointsByPosition[position] ?? 0
        : 0;
  return points;
}

function resultPosition(value: number | string | null) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function resultNumber(value: number | string | null) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? String(parsed) : '—';
}

function resultRiderName(rider: Rider | null) {
  if (!rider) return 'Pilota non disponibile';
  return [rider.name, rider.surname].filter(Boolean).join(' ') || rider.nickname || 'Pilota';
}

function resultDate(value: string | null) {
  if (!value) return 'Data non disponibile';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function predictionRiderName(rider: PredictionRider | null) {
  if (!rider) return 'Pilota non disponibile';
  return [rider.name, rider.surname].filter(Boolean).join(' ') || rider.nickname || 'Pilota';
}

const ITALIAN_TIME_ZONE = 'Europe/Rome';

function parsePredictionDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatItalianDateTime(value: string | null) {
  if (!value) return 'Orario non disponibile';
  const date = parsePredictionDate(value);
  if (!date) return value;
  return new Intl.DateTimeFormat('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: ITALIAN_TIME_ZONE,
  }).format(date);
}

function predictionShortTime(value: string | null) {
  if (!value) return '—';
  const date = parsePredictionDate(value);
  if (!date) return '—';
  return new Intl.DateTimeFormat('it-IT', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: ITALIAN_TIME_ZONE,
  }).format(date);
}

function predictionErrorMessage(error: { message?: string | null } | null) {
  const rawMessage = error?.message ?? '';
  const code = [
    'QUALIFYING_PREDICTION_CLOSED',
    'SPRINT_PREDICTION_CLOSED',
    'RACE_PREDICTION_CLOSED',
    'INVALID_POLE_RIDER',
    'INVALID_SPRINT_RIDER',
    'INVALID_PODIUM_RIDER',
    'DUPLICATE_RACE_PODIUM_RIDER',
    'NOT_AUTHENTICATED',
  ].find((item) => rawMessage.toUpperCase().includes(item));

  const messages: Record<string, string> = {
    QUALIFYING_PREDICTION_CLOSED: 'Il pronostico della Pole è già chiuso.',
    SPRINT_PREDICTION_CLOSED: 'Il pronostico della Sprint è già chiuso.',
    RACE_PREDICTION_CLOSED: 'Il pronostico del podio è già chiuso.',
    INVALID_POLE_RIDER: 'Il pilota scelto per la Pole non è valido.',
    INVALID_SPRINT_RIDER: 'Il pilota scelto per la Sprint non è valido.',
    INVALID_PODIUM_RIDER: 'Uno dei piloti del podio non è valido.',
    DUPLICATE_RACE_PODIUM_RIDER: 'Un pilota può comparire una sola volta sul podio.',
    NOT_AUTHENTICATED: 'Devi effettuare l’accesso per salvare il pronostico.',
  };

  return code ? messages[code] : 'Non è stato possibile salvare il pronostico. Riprova.';
}

function resultTiming(result: RawSessionResult) {
  const gap = result.gap?.trim();
  const totalTime = result.total_time?.trim();
  if (gap) {
    if (gap.startsWith('+') || !/^\d/.test(gap)) return gap;
    return `+${gap}`;
  }
  return totalTime || '—';
}

function resultPrimaryTiming(result: RawSessionResult, sessionType: string) {
  if (sessionType === 'Q') return result.total_time?.trim() || '—';
  return resultTiming(result);
}

function resultSecondaryTiming(result: RawSessionResult, sessionType: string) {
  const gap = result.gap?.trim();
  const totalTime = result.total_time?.trim();
  if (sessionType === 'Q') return gap && gap !== totalTime ? gap : null;
  return gap && totalTime && gap !== totalTime ? totalTime : null;
}

function ResultsSkeleton() {
  return (
    <div className="results-skeleton" aria-label="Caricamento risultati" data-testid="loading-results">
      <span />
      <span />
      <span />
      <span />
    </div>
  );
}

function ResultsRows({
  rows,
  sessionType,
  mobile = false,
}: {
  rows: DisplayResult[];
  sessionType: string;
  mobile?: boolean;
}) {
  return (
    <div className={mobile ? 'results-mobile-list' : 'results-table-wrap'}>
      {rows.map((result, index) => {
        const position = resultPosition(result.position);
        const status = resultStatusLabel(result.status, result.position);
        const isClassified = isResultClassified(result);
        const riderName = resultRiderName(result.rider);
        const rowKey = `${result.session_id}-${result.rider_id}-${index}`;

        if (mobile) {
          return (
            <article
              className={`result-mobile-card${position && position <= 3 ? ` result-mobile-card--top-${position}` : ''}`}
              key={rowKey}
              data-testid={`card-result-${result.rider_id}`}
            >
              <div className="result-mobile-place">
                <span className="result-position">{position ?? '—'}</span>
                <span className="result-number">#{resultNumber(result.rider_number)}</span>
              </div>
              <div className="result-mobile-driver">
                <strong>{riderName}</strong>
                <span>{result.teamName ?? 'Team non disponibile'}</span>
              </div>
              <div className="result-mobile-data">
                <strong>{resultPrimaryTiming(result, sessionType)}</strong>
                {resultSecondaryTiming(result, sessionType) && (
                  <span>{resultSecondaryTiming(result, sessionType)}</span>
                )}
                {sessionType !== 'Q' && <span>{resultDisplayPoints(result, sessionType)} pt</span>}
                <span className={`result-status${isClassified ? '' : ' is-muted'}`}>
                  {isClassified ? <CheckCircle2 size={13} aria-hidden="true" /> : null}
                  {status}
                </span>
              </div>
            </article>
          );
        }

        return (
          <div
            className={`results-table-row${position && position <= 3 ? ` results-table-row--top-${position}` : ''}`}
            key={rowKey}
            data-testid={`row-result-${result.rider_id}`}
          >
            <div className="result-position">{position ?? '—'}</div>
            <div className="result-number">#{resultNumber(result.rider_number)}</div>
            <div className="result-driver">
              <strong>{riderName}</strong>
              <span>{result.rider?.nickname ?? ''}</span>
            </div>
            <div className="result-team">{result.teamName ?? 'Team non disponibile'}</div>
            <div className="result-time">
              <strong>{resultPrimaryTiming(result, sessionType)}</strong>
              {resultSecondaryTiming(result, sessionType) && (
                <span>{resultSecondaryTiming(result, sessionType)}</span>
              )}
            </div>
            {sessionType !== 'Q' && (
              <div className="result-points">{resultDisplayPoints(result, sessionType)}</div>
            )}
            <div className={`result-status${isClassified ? '' : ' is-muted'}`}>
              {isClassified ? <CheckCircle2 size={13} aria-hidden="true" /> : null}
              {status}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ResultsPage() {
  const { user, isAuthLoading } = useAuth();
  const [season, setSeason] = useState<ResultsSeason | null>(null);
  const [grandPrix, setGrandPrix] = useState<GrandPrix[]>([]);
  const [sessions, setSessions] = useState<RaceSession[]>([]);
  const [results, setResults] = useState<RawSessionResult[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [riderSeasons, setRiderSeasons] = useState<RiderSeason[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedGrandPrixId, setSelectedGrandPrixId] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<'Q' | 'SPR' | 'RAC'>('RAC');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadResults() {
      if (isAuthLoading || !user) return;
      setIsLoading(true);
      setErrorMessage(null);

      const seasonResponse = await supabase
        .from('seasons')
        .select('id, year')
        .eq('year', 2026)
        .maybeSingle();

      if (seasonResponse.error || !seasonResponse.data) {
        if (isMounted) {
          setErrorMessage('La stagione 2026 non è disponibile nel database.');
          setIsLoading(false);
        }
        return;
      }

      const seasonRow = seasonResponse.data as ResultsSeason;
      const grandPrixResponse = await supabase
        .from('grand_prix')
        .select('id, name, short_name, country, circuit, date_start, date_end')
        .eq('season_id', seasonRow.id)
        .eq('is_test', false)
        .order('date_start', { ascending: true });

      if (grandPrixResponse.error) {
        if (isMounted) {
          setErrorMessage('Non è stato possibile caricare il calendario MotoGP.');
          setIsLoading(false);
        }
        return;
      }

      const grandPrixRows = (grandPrixResponse.data ?? []) as GrandPrix[];
      const grandPrixIds = grandPrixRows.map((item) => item.id);
      const sessionsResponse = grandPrixIds.length
        ? await supabase
            .from('sessions')
            .select('id, grand_prix_id, type, status, session_date, number')
            .in('grand_prix_id', grandPrixIds)
            .in('type', ['Q', 'SPR', 'RAC'])
            .order('session_date', { ascending: true })
        : { data: [], error: null };

      if (sessionsResponse.error) {
        if (isMounted) {
          setErrorMessage('Non è stato possibile caricare le sessioni del campionato.');
          setIsLoading(false);
        }
        return;
      }

      const sessionRows = (sessionsResponse.data ?? []) as RaceSession[];
      const sessionIds = sessionRows.map((item) => item.id);
      const resultResponse = sessionIds.length
        ? await supabase
            .from('session_results')
            .select(
              'session_id, rider_id, rider_number, position, points, total_time, gap, average_speed, status',
            )
            .in('session_id', sessionIds)
        : { data: [], error: null };

      if (resultResponse.error) {
        if (isMounted) {
          setErrorMessage('Non è stato possibile caricare i risultati ufficiali.');
          setIsLoading(false);
        }
        return;
      }

      const resultRows = (resultResponse.data ?? []) as RawSessionResult[];
      const riderIds = [...new Set(resultRows.map((item) => item.rider_id))];
      const riderResponse = riderIds.length
        ? await supabase
            .from('riders')
            .select('id, name, surname, nickname')
            .in('id', riderIds)
        : { data: [], error: null };
      const riderSeasonResponse = riderIds.length
        ? await supabase
            .from('rider_seasons')
            .select('rider_id, team_id, number')
            .eq('season_id', seasonRow.id)
            .in('rider_id', riderIds)
        : { data: [], error: null };
      const teamResponse = await supabase.from('teams').select('id, name');

      if (riderResponse.error || riderSeasonResponse.error || teamResponse.error) {
        if (isMounted) {
          setErrorMessage('Non è stato possibile completare i dati dei piloti.');
          setIsLoading(false);
        }
        return;
      }

      if (isMounted) {
        setSeason(seasonRow);
        setGrandPrix(grandPrixRows);
        setSessions(sessionRows);
        setResults(resultRows);
        setRiders((riderResponse.data ?? []) as Rider[]);
        setRiderSeasons((riderSeasonResponse.data ?? []) as RiderSeason[]);
        setTeams((teamResponse.data ?? []) as Team[]);
        setSelectedGrandPrixId((current) =>
          current && grandPrixRows.some((item) => item.id === current)
            ? current
            : grandPrixRows[0]?.id ?? null,
        );
        setIsLoading(false);
      }
    }

    void loadResults();
    return () => {
      isMounted = false;
    };
  }, [isAuthLoading, reloadToken, user]);

  const selectedGrandPrix = grandPrix.find((item) => item.id === selectedGrandPrixId) ?? null;
  const selectedGrandPrixSessions = sessions.filter(
    (item) => item.grand_prix_id === selectedGrandPrixId && item.type === activeSession,
  );
  const selectedSession =
    activeSession === 'Q'
      ? selectedGrandPrixSessions.find((item) => String(item.number) === '2') ??
        selectedGrandPrixSessions.find((item) =>
          results.some((result) => result.session_id === item.id),
        ) ??
        null
      : selectedGrandPrixSessions[0] ?? null;
  const teamById = new Map(teams.map((team) => [team.id, team.name ?? 'Team non disponibile']));
  const teamIdByRider = new Map(riderSeasons.map((item) => [item.rider_id, item.team_id]));
  const riderById = new Map(riders.map((rider) => [rider.id, rider]));
  const selectedResults: DisplayResult[] = results
    .filter((item) => item.session_id === selectedSession?.id)
    .map((item) => ({
      ...item,
      rider: riderById.get(item.rider_id) ?? null,
      teamName: teamById.get(teamIdByRider.get(item.rider_id) ?? '') ?? null,
    }))
    .sort((a, b) => {
      const aPosition = resultPosition(a.position);
      const bPosition = resultPosition(b.position);
      if (aPosition === null && bPosition === null) return 0;
      if (aPosition === null) return 1;
      if (bPosition === null) return -1;
      return aPosition - bPosition;
    });
  const classifiedResults = selectedResults.filter(
    (item) => isResultClassified(item),
  );
  const notClassifiedResults = selectedResults.filter(
    (item) => !isResultClassified(item),
  );
  const pole = activeSession === 'Q' ? classifiedResults[0] : null;
  const isRace = activeSession === 'RAC';
  const pageText = isLoading
    ? 'Recupero delle classifiche ufficiali dal database.'
    : errorMessage
      ? errorMessage
      : selectedGrandPrix
        ? `${selectedGrandPrix.name ?? 'Gran Premio'} · ${resultSessionLabel(activeSession)}`
        : 'Seleziona un Gran Premio per iniziare.';

  return (
    <MainPageLayout
      className="results-app-page"
      eyebrow="FantamotoGP · ufficiale"
      title="Risultati MotoGP"
      text={pageText}
    >
      <div className="results-shell" data-testid="results-viewer">
        <div className="results-toolbar">
          <label className="results-select-control" htmlFor="results-season">
            <span>Campionato</span>
            <span className="results-select-wrap">
              <select id="results-season" value={season?.id ?? ''} disabled data-testid="select-season">
                <option value={season?.id ?? ''}>MotoGP {season?.year ?? 2026}</option>
              </select>
              <ChevronDown size={16} aria-hidden="true" />
            </span>
          </label>
          <label className="results-select-control results-select-control--gp" htmlFor="results-gp">
            <span>Gran Premio</span>
            <span className="results-select-wrap">
              <select
                id="results-gp"
                value={selectedGrandPrixId ?? ''}
                onChange={(event) => setSelectedGrandPrixId(event.target.value || null)}
                disabled={isLoading || grandPrix.length === 0}
                data-testid="select-grand-prix"
              >
                <option value="">Seleziona un GP</option>
                {grandPrix.map((item, index) => (
                  <option value={item.id} key={item.id}>
                    {String(index + 1).padStart(2, '0')} · {item.name ?? item.short_name ?? 'Gran Premio'}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} aria-hidden="true" />
            </span>
          </label>
        </div>

        {selectedGrandPrix && (
          <div className="results-event-meta" data-testid="text-event-meta">
            <div className="results-event-title">
              <span className="results-round">GP {String(grandPrix.findIndex((item) => item.id === selectedGrandPrix.id) + 1).padStart(2, '0')}</span>
              <strong>{selectedGrandPrix.name ?? selectedGrandPrix.short_name ?? 'Gran Premio'}</strong>
            </div>
            <div className="results-event-facts">
              <span><MapPin size={15} aria-hidden="true" />{selectedGrandPrix.circuit ?? selectedGrandPrix.country ?? 'Circuito non disponibile'}</span>
              <span><CalendarDays size={15} aria-hidden="true" />{resultDate(selectedSession?.session_date ?? selectedGrandPrix.date_start)}</span>
            </div>
          </div>
        )}

        <div className="results-session-tabs" role="tablist" aria-label="Sessioni del Gran Premio">
          {(['Q', 'SPR', 'RAC'] as const).map((type) => {
            const available = sessions.some(
              (item) => item.grand_prix_id === selectedGrandPrixId && item.type === type,
            );
            return (
              <button
                className={`results-session-tab${activeSession === type ? ' is-active' : ''}`}
                type="button"
                role="tab"
                aria-selected={activeSession === type}
                disabled={isLoading}
                onClick={() => setActiveSession(type)}
                key={type}
                data-testid={`tab-session-${type.toLowerCase()}`}
              >
                <span>{resultSessionLabel(type)}</span>
                <small>{available ? 'disponibile' : 'non disponibile'}</small>
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <ResultsSkeleton />
        ) : errorMessage ? (
          <div className="results-state results-state--error" role="alert" data-testid="error-results">
            <span className="results-state-icon"><AlertCircle size={20} aria-hidden="true" /></span>
            <strong>Non riusciamo a leggere i risultati</strong>
            <p>{errorMessage}</p>
            <button
              className="results-retry-button"
              type="button"
              onClick={() => setReloadToken((value) => value + 1)}
              data-testid="button-retry-results"
            >
              <RefreshCw size={15} aria-hidden="true" /> Riprova
            </button>
          </div>
        ) : grandPrix.length === 0 ? (
          <div className="results-state" data-testid="empty-grand-prix">
            <span className="results-state-icon"><Flag size={20} aria-hidden="true" /></span>
            <strong>Nessun Gran Premio in calendario</strong>
            <p>La stagione 2026 non contiene ancora eventi pubblicati.</p>
          </div>
        ) : !selectedGrandPrix ? (
          <div className="results-state" data-testid="empty-selected-grand-prix">
            <span className="results-state-icon"><MapPin size={20} aria-hidden="true" /></span>
            <strong>Scegli un Gran Premio</strong>
            <p>Seleziona un evento dal calendario per vedere le classifiche.</p>
          </div>
        ) : !selectedSession ? (
          <div className="results-state" data-testid="empty-session">
            <span className="results-state-icon"><Timer size={20} aria-hidden="true" /></span>
            <strong>{resultSessionLabel(activeSession)} non disponibile</strong>
            <p>Per questo Gran Premio la sessione non è ancora presente nel database.</p>
          </div>
        ) : selectedResults.length === 0 ? (
          <div className="results-state" data-testid="empty-session-results">
            <span className="results-state-icon"><Timer size={20} aria-hidden="true" /></span>
            <strong>Nessun risultato registrato</strong>
            <p>La sessione è presente, ma non contiene ancora classifiche ufficiali.</p>
          </div>
        ) : (
          <>
            {pole && (
              <div className="pole-card" data-testid="card-pole-position">
                <div className="pole-badge"><Medal size={17} aria-hidden="true" /><span>Pole position</span></div>
                <div className="pole-rider">
                  <span className="pole-number">#{resultNumber(pole.rider_number)}</span>
                  <strong>{resultRiderName(pole.rider)}</strong>
                  <span>{pole.teamName ?? 'Team non disponibile'}</span>
                </div>
                <div className="pole-time"><span>Tempo pole</span><strong>{pole.total_time ?? resultTiming(pole)}</strong></div>
              </div>
            )}
            <div className="results-heading-row">
              <div>
                <span className="results-kicker"><Flag size={14} aria-hidden="true" /> Classifica ufficiale</span>
                <h2>{resultSessionLabel(activeSession)}</h2>
              </div>
              <span className="results-count">{classifiedResults.length} classificati</span>
            </div>
            <div className={`results-table${activeSession !== 'Q' ? ' results-table--points' : ''}`} data-testid="results-table">
              <div className="results-table-head">
                <span>Pos</span>
                <span>Num</span>
                <span>Pilota</span>
                <span>Team</span>
                <span>Tempo / gap</span>
                {activeSession !== 'Q' && <span>Pt</span>}
                <span>Status</span>
              </div>
              <ResultsRows rows={classifiedResults} sessionType={activeSession} />
            </div>
            <div className="results-mobile-only">
              <ResultsRows rows={classifiedResults} sessionType={activeSession} mobile />
            </div>
            {isRace && notClassifiedResults.length > 0 && (
              <section className="not-classified-section" aria-labelledby="not-classified-title" data-testid="section-not-classified">
                <div className="results-heading-row">
                  <div>
                    <span className="results-kicker results-kicker--muted"><AlertCircle size={14} aria-hidden="true" /> Esito della gara</span>
                    <h2 id="not-classified-title">Not classified</h2>
                  </div>
                  <span className="results-count">{notClassifiedResults.length} piloti</span>
                </div>
                <div className="results-table results-table--nc results-table--points">
                  <div className="results-table-head">
                    <span>Pos</span>
                    <span>Num</span>
                    <span>Pilota</span>
                    <span>Team</span>
                    <span>Tempo / gap</span>
                    <span>Pt</span>
                    <span>Status</span>
                  </div>
                  <ResultsRows rows={notClassifiedResults} sessionType="RAC" />
                </div>
                <div className="results-mobile-only">
                  <ResultsRows rows={notClassifiedResults} sessionType="RAC" mobile />
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </MainPageLayout>
  );
}

type League = {
  id: string;
  name: string;
  invite_code: string;
  created_at: string;
};

type LeagueMember = {
  user_id: string;
  name: string | null;
};

type RpcErrorDetails = {
  message: string;
  code: string;
  details: string;
  hint: string;
};

function formatLeagueDate(value: string) {
  return new Intl.DateTimeFormat('it-IT', {
    dateStyle: 'medium',
  }).format(new Date(value));
}

function LeaguesPage() {
  const { user, isAuthLoading } = useAuth();
  const [, navigate] = useLocation();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [leagueName, setLeagueName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [rpcErrorDetails, setRpcErrorDetails] = useState<RpcErrorDetails | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // — join form state —
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinSuccess, setJoinSuccess] = useState<string | null>(null);

  const loadLeagues = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    if (isAuthLoading) {
      return;
    }

    if (!user) {
      setLeagues([]);
      setErrorMessage('Utente non autenticato.');
      setIsLoading(false);
      return;
    }

    const { data: memberships, error: membershipsError } = await supabase
      .from('league_members')
      .select('league_id')
      .eq('user_id', user.id);

    if (membershipsError) {
      setErrorMessage(
        'Non è stato possibile caricare le tue leghe. Riprova tra poco.',
      );
      setIsLoading(false);
      return;
    }

    const leagueIds = (memberships ?? []).map((membership) => membership.league_id);

    if (leagueIds.length === 0) {
      setLeagues([]);
      setIsLoading(false);
      return;
    }

    const { data: leagueRows, error: leaguesError } = await supabase
      .from('leagues')
      .select('id, name, invite_code, created_at')
      .in('id', leagueIds)
      .order('created_at', { ascending: false });

    if (leaguesError) {
      setErrorMessage(
        'Non è stato possibile caricare i dettagli delle tue leghe. Riprova tra poco.',
      );
      setIsLoading(false);
      return;
    }

    setLeagues((leagueRows ?? []) as League[]);
    setIsLoading(false);
  }, [isAuthLoading, user]);

  useEffect(() => {
    void loadLeagues();
  }, [loadLeagues]);

  async function handleCreateLeague(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = leagueName.trim();
    const normalizedInviteCode = inviteCode.trim().toUpperCase();

    setFormError(null);
    setRpcErrorDetails(null);
    setSuccessMessage(null);

    if (trimmedName.length < 1 || trimmedName.length > 100) {
      setFormError('Il nome della lega deve contenere da 1 a 100 caratteri.');
      return;
    }

    if (normalizedInviteCode.length < 6 || normalizedInviteCode.length > 20) {
      setFormError('Il codice invito deve contenere da 6 a 20 caratteri.');
      return;
    }

    setIsCreating(true);

    const { error } = await supabase.rpc('create_league', {
      p_name: trimmedName,
      p_invite_code: normalizedInviteCode,
    });

    if (error) {
      const details: RpcErrorDetails = {
        message: error.message || '(vuoto)',
        code: error.code || '(vuoto)',
        details: error.details || '(vuoto)',
        hint: error.hint || '(vuoto)',
      };

      console.error('[create_league] Errore RPC Supabase:', details);
      setRpcErrorDetails(details);
      setFormError('La RPC create_league ha restituito un errore Supabase.');
      setIsCreating(false);
      return;
    }

    setLeagueName('');
    setInviteCode('');
    setIsFormOpen(false);
    setSuccessMessage('Lega creata con successo.');
    await loadLeagues();
    setIsCreating(false);
  }

  async function handleJoinLeague(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedCode = joinCode.trim().toUpperCase();

    setJoinError(null);
    setJoinSuccess(null);

    if (normalizedCode.length < 6 || normalizedCode.length > 20) {
      setJoinError('Il codice invito deve contenere da 6 a 20 caratteri.');
      return;
    }

    if (!user) {
      setJoinError('Utente non autenticato.');
      return;
    }

    setIsJoining(true);

    const { data, error } = await supabase.rpc('join_league', {
      p_invite_code: normalizedCode,
    });

    if (error) {
      const msg = error.message ?? '';
      const code = error.code ?? '';

      if (
        msg.toLowerCase().includes('already') ||
        msg.toLowerCase().includes('già') ||
        code === '23505'
      ) {
        setJoinError('Sei già membro di questa lega.');
      } else if (
        msg.toLowerCase().includes('not found') ||
        msg.toLowerCase().includes('non trovata') ||
        msg.toLowerCase().includes('invalid') ||
        code === 'P0002'
      ) {
        setJoinError('Codice invito non trovato. Controlla e riprova.');
      } else {
        setJoinError(
          `Errore Supabase — ${msg || code || 'errore sconosciuto'}`,
        );
      }

      setIsJoining(false);
      return;
    }

    const joinedName =
      typeof data === 'string'
        ? data
        : (data as { name?: string } | null)?.name ?? null;

    setJoinCode('');
    setIsJoinOpen(false);
    setJoinSuccess(
      joinedName
        ? `Sei entrata nella lega "${joinedName}".`
        : 'Sei entrata nella lega con successo.',
    );
    await loadLeagues();
    setIsJoining(false);
  }

  const pageText = isLoading
    ? 'Caricamento delle tue leghe...'
    : errorMessage
      ? errorMessage
      : leagues.length === 0
        ? 'Non appartieni ancora a nessuna lega.'
        : `Partecipi a ${leagues.length} ${leagues.length === 1 ? 'lega' : 'leghe'}.`;

  return (
    <MainPageLayout
      eyebrow="FantamotoGP"
      title="Le mie leghe"
      text={pageText}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          width: '100%',
          maxWidth: '620px',
          margin: '0 auto',
        }}
      >
        {successMessage && (
          <p role="status" style={{ color: 'hsl(var(--primary))' }}>
            {successMessage}
          </p>
        )}

        {joinSuccess && (
          <p role="status" style={{ color: 'hsl(var(--primary))' }}>
            {joinSuccess}
          </p>
        )}

        {!isLoading && !errorMessage && leagues.length > 0 && (
          <div
            style={{
              display: 'grid',
              gap: '12px',
              width: '100%',
              textAlign: 'left',
            }}
          >
            {leagues.map((league) => (
              <article
                key={league.id}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/leghe/${league.id}`)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    navigate(`/leghe/${league.id}`);
                  }
                }}
                aria-label={`Apri dettagli lega ${league.name}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  padding: '16px 18px',
                  border: '1px solid hsl(var(--foreground) / 0.12)',
                  borderRadius: '18px',
                  background: 'hsl(var(--card) / 0.72)',
                  boxShadow: 'var(--shadow-sm)',
                  cursor: 'pointer',
                }}
              >
                <div>
                  <h2
                    style={{
                      margin: 0,
                      color: 'hsl(var(--foreground))',
                      fontFamily: 'var(--app-font-serif)',
                      fontSize: '1.35rem',
                    }}
                  >
                    {league.name}
                  </h2>
                  <p
                    style={{
                      margin: '6px 0 0',
                      color: 'hsl(var(--muted-foreground))',
                      fontSize: '0.88rem',
                    }}
                  >
                    Codice invito: <strong>{league.invite_code}</strong>
                  </p>
                </div>
                <time
                  dateTime={league.created_at}
                  style={{
                    flexShrink: 0,
                    color: 'hsl(var(--muted-foreground))',
                    fontSize: '0.78rem',
                    textAlign: 'right',
                  }}
                >
                  {formatLeagueDate(league.created_at)}
                </time>
              </article>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            className="start-button"
            type="button"
            onClick={() => {
              setIsFormOpen((isOpen) => !isOpen);
              setIsJoinOpen(false);
              setFormError(null);
              setRpcErrorDetails(null);
            }}
            disabled={isCreating || isJoining}
          >
            {isFormOpen ? 'Chiudi' : 'Crea nuova lega'}
          </button>

          <button
            className="start-button"
            type="button"
            onClick={() => {
              setIsJoinOpen((isOpen) => !isOpen);
              setIsFormOpen(false);
              setJoinError(null);
              setJoinSuccess(null);
            }}
            disabled={isCreating || isJoining}
            style={{
              background: 'hsl(var(--accent))',
              borderColor: 'hsl(var(--accent))',
            }}
          >
            {isJoinOpen ? 'Chiudi' : 'Entra in una lega'}
          </button>
        </div>

        {isJoinOpen && (
          <form
            onSubmit={handleJoinLeague}
            aria-label="Entra in una lega tramite codice invito"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              width: '100%',
              maxWidth: '430px',
              textAlign: 'left',
            }}
          >
            <label htmlFor="join-invite-code">Codice invito</label>
            <input
              id="join-invite-code"
              name="join_invite_code"
              type="text"
              required
              minLength={6}
              maxLength={20}
              value={joinCode}
              onChange={(event) => {
                setJoinCode(event.target.value);
                setJoinError(null);
                setJoinSuccess(null);
              }}
              disabled={isJoining}
              placeholder="ABC123"
              style={{
                boxSizing: 'border-box',
                width: '100%',
                padding: '13px 16px',
                border: '1px solid hsl(var(--border))',
                borderRadius: '999px',
                color: 'hsl(var(--foreground))',
                background: 'hsl(var(--card) / 0.8)',
                font: 'inherit',
                textTransform: 'uppercase',
              }}
            />
            <button
              className="start-button"
              type="submit"
              disabled={isJoining}
              style={{
                background: 'hsl(var(--accent))',
                borderColor: 'hsl(var(--accent))',
              }}
            >
              {isJoining ? 'Ingresso...' : 'Entra nella lega'}
            </button>
            {joinError && (
              <p role="alert" style={{ color: 'hsl(var(--destructive))' }}>
                {joinError}
              </p>
            )}
          </form>
        )}

        {isFormOpen && (
          <form
            onSubmit={handleCreateLeague}
            aria-label="Crea nuova lega"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              width: '100%',
              maxWidth: '430px',
              textAlign: 'left',
            }}
          >
            <label htmlFor="league-name">Nome lega</label>
            <input
              id="league-name"
              name="name"
              type="text"
              required
              maxLength={100}
              value={leagueName}
              onChange={(event) => {
                setLeagueName(event.target.value);
                setFormError(null);
                setRpcErrorDetails(null);
              }}
              disabled={isCreating}
              placeholder="Es. FantamotoGP 2026"
              style={{
                boxSizing: 'border-box',
                width: '100%',
                padding: '13px 16px',
                border: '1px solid hsl(var(--border))',
                borderRadius: '999px',
                color: 'hsl(var(--foreground))',
                background: 'hsl(var(--card) / 0.8)',
                font: 'inherit',
              }}
            />
            <label htmlFor="league-invite-code">Codice invito</label>
            <input
              id="league-invite-code"
              name="invite_code"
              type="text"
              required
              minLength={6}
              maxLength={20}
              value={inviteCode}
              onChange={(event) => {
                setInviteCode(event.target.value);
                setFormError(null);
                setRpcErrorDetails(null);
              }}
              disabled={isCreating}
              placeholder="ABC123"
              style={{
                boxSizing: 'border-box',
                width: '100%',
                padding: '13px 16px',
                border: '1px solid hsl(var(--border))',
                borderRadius: '999px',
                color: 'hsl(var(--foreground))',
                background: 'hsl(var(--card) / 0.8)',
                font: 'inherit',
                textTransform: 'uppercase',
              }}
            />
            <button className="start-button" type="submit" disabled={isCreating}>
              {isCreating ? 'Creazione...' : 'Crea lega'}
            </button>
            {formError && (
              <p role="alert" style={{ color: 'hsl(var(--destructive))' }}>
                {formError}
              </p>
            )}
            {rpcErrorDetails && (
              <div
                role="alert"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '14px 16px',
                  border: '1px solid hsl(var(--destructive) / 0.35)',
                  borderRadius: '16px',
                  color: 'hsl(var(--destructive))',
                  background: 'hsl(var(--destructive) / 0.06)',
                  fontFamily: 'var(--app-font-mono)',
                  fontSize: '0.78rem',
                  lineHeight: 1.55,
                  overflowWrap: 'anywhere',
                }}
              >
                <div><strong>error.message:</strong> {rpcErrorDetails.message}</div>
                <div><strong>error.code:</strong> {rpcErrorDetails.code}</div>
                <div><strong>error.details:</strong> {rpcErrorDetails.details}</div>
                <div><strong>error.hint:</strong> {rpcErrorDetails.hint}</div>
              </div>
            )}
          </form>
        )}
      </div>
    </MainPageLayout>
  );
}

function LeagueDetailPage() {
  const { leagueId } = useParams<{ leagueId: string }>();
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const [league, setLeague] = useState<League | null>(null);
  const [members, setMembers] = useState<LeagueMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [leaveError, setLeaveError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!leagueId || !user) {
        setErrorMessage('Utente non autenticato o lega non specificata.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      const { data: leagueData, error: leagueError } = await supabase
        .from('leagues')
        .select('id, name, invite_code, created_at')
        .eq('id', leagueId)
        .maybeSingle();

      if (leagueError) {
        setErrorMessage('Non è stato possibile caricare i dati della lega.');
        setIsLoading(false);
        return;
      }

      if (!leagueData) {
        setErrorMessage('Lega non trovata o non sei membro di questa lega.');
        setIsLoading(false);
        return;
      }

      setLeague(leagueData as League);

      const { data: membersData, error: membersError } = await supabase.rpc(
        'get_league_members',
        { p_league_id: leagueId },
      );

      if (membersError) {
        console.error('[get_league_members] Errore RPC Supabase:', {
          message: membersError.message,
          code: membersError.code,
          details: membersError.details,
          hint: membersError.hint,
        });
        setErrorMessage('Non è stato possibile caricare i partecipanti.');
        setIsLoading(false);
        return;
      }

      setMembers((membersData ?? []) as LeagueMember[]);
      setIsLoading(false);
    }

    void load();
  }, [leagueId, user]);

  async function handleCopyCode() {
    if (!league) return;
    try {
      await navigator.clipboard.writeText(league.invite_code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // clipboard non disponibile, nessuna azione
    }
  }

  async function handleLeave() {
    if (!user || !leagueId) return;
    if (!window.confirm('Sei sicura di voler uscire da questa lega?')) return;

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

    navigate('/leghe');
  }

  const pageTitle = isLoading
    ? 'Caricamento...'
    : league?.name ?? 'Lega non trovata';

  const pageText = isLoading
    ? 'Caricamento dei dettagli della lega...'
    : errorMessage
      ? errorMessage
      : `${members.length} ${members.length === 1 ? 'partecipante' : 'partecipanti'}`;

  return (
    <MainPageLayout eyebrow="FantamotoGP" title={pageTitle} text={pageText}>
      {!isLoading && errorMessage ? (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            className="start-button"
            type="button"
            onClick={() => navigate('/leghe')}
          >
            ← Torna alle leghe
          </button>
        </div>
      ) : !isLoading && league ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
            width: '100%',
            maxWidth: '500px',
            margin: '0 auto',
          }}
        >
          {/* Info card */}
          <div
            style={{
              width: '100%',
              padding: '18px 20px',
              border: '1px solid hsl(var(--foreground) / 0.12)',
              borderRadius: '18px',
              background: 'hsl(var(--card) / 0.72)',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              boxSizing: 'border-box',
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.78rem',
                  color: 'hsl(var(--muted-foreground))',
                }}
              >
                Codice invito
              </p>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginTop: '4px',
                  flexWrap: 'wrap',
                }}
              >
                <strong
                  style={{ fontSize: '1.1rem', letterSpacing: '0.08em' }}
                >
                  {league.invite_code}
                </strong>
                <button
                  type="button"
                  onClick={() => void handleCopyCode()}
                  style={{
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '999px',
                    padding: '5px 12px',
                    background: isCopied
                      ? 'hsl(var(--primary))'
                      : 'transparent',
                    color: isCopied
                      ? 'hsl(var(--primary-foreground))'
                      : 'hsl(var(--foreground))',
                    cursor: 'pointer',
                    font: 'inherit',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    transition: 'background 0.15s, color 0.15s',
                  }}
                >
                  {isCopied ? '✓ Copiato' : 'Copia codice'}
                </button>
              </div>
            </div>
            <p
              style={{
                margin: 0,
                fontSize: '0.84rem',
                color: 'hsl(var(--muted-foreground))',
              }}
            >
              Creata il{' '}
              <time dateTime={league.created_at}>
                {formatLeagueDate(league.created_at)}
              </time>
            </p>
          </div>

          {/* Members list */}
          {members.length > 0 && (
            <div style={{ width: '100%', textAlign: 'left' }}>
              <p
                style={{
                  margin: '0 0 10px',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  color: 'hsl(var(--muted-foreground))',
                }}
              >
                Partecipanti ({members.length})
              </p>
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
              >
                {members.map((member) => (
                  <div
                    key={member.user_id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      border: '1px solid hsl(var(--foreground) / 0.08)',
                      borderRadius: '14px',
                      background: 'hsl(var(--card) / 0.5)',
                    }}
                  >
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        background: 'hsl(var(--primary) / 0.12)',
                        color: 'hsl(var(--primary))',
                        flexShrink: 0,
                      }}
                      aria-hidden="true"
                    >
                      <UserRound size={17} strokeWidth={1.8} />
                    </span>
                    <span style={{ fontSize: '0.95rem' }}>
                      {member.name ?? 'Utente senza nome'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              width: '100%',
            }}
          >
            <button
              className="start-button"
              type="button"
              onClick={() => navigate('/leghe')}
            >
              ← Torna alle leghe
            </button>
            <button
              type="button"
              onClick={() => void handleLeave()}
              disabled={isLeaving}
              style={{
                border: '1px solid hsl(var(--destructive) / 0.4)',
                borderRadius: '999px',
                padding: '13px 28px',
                background: 'transparent',
                color: 'hsl(var(--destructive))',
                cursor: isLeaving ? 'wait' : 'pointer',
                font: 'inherit',
                fontWeight: 700,
              }}
            >
              {isLeaving ? 'Uscita in corso...' : 'Esci dalla lega'}
            </button>
            {leaveError && (
              <p role="alert" style={{ color: 'hsl(var(--destructive))' }}>
                {leaveError}
              </p>
            )}
          </div>
        </div>
      ) : null}
    </MainPageLayout>
  );
}

function AuthPage() {
  const { user, isAuthLoading } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthError(null);
    setAuthMessage(null);
    setIsSubmitting(true);

    const result = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (result.error) {
      setAuthError(result.error.message);
      setIsSubmitting(false);
      return;
    }

    if (mode === 'register') {
      setAuthMessage(
        result.data.session
          ? 'Registrazione completata con successo.'
          : 'Registrazione completata. Controlla la tua email per confermare l’account.',
      );
    } else {
      setAuthMessage('Accesso completato con successo.');
    }

    setPassword('');
    setIsSubmitting(false);
  }

  const authText = isAuthLoading
    ? 'Verifica dello stato di accesso...'
    : user
      ? `Accesso effettuato come ${user.email ?? 'utente autenticato'}.`
      : mode === 'login'
        ? 'Accedi al tuo spazio personale.'
        : 'Crea il tuo accesso personale.';

  return (
    <MainPageLayout
      eyebrow="Il tuo accesso"
      title={user ? 'Sei dentro.' : mode === 'login' ? 'Accedi' : 'Registrati'}
      text={authText}
    >
      {isAuthLoading ? (
        <p role="status">Caricamento...</p>
      ) : user ? (
        <p role="status" style={{ color: 'hsl(var(--primary))' }}>
          {authMessage ?? 'Il tuo account è attivo.'}
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          aria-label={mode === 'login' ? 'Accedi' : 'Registrati'}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            margin: '0 auto',
            maxWidth: '430px',
            textAlign: 'left',
          }}
        >
          <label htmlFor="auth-email">Email</label>
          <input
            id="auth-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={isSubmitting}
            placeholder="nome@esempio.it"
            style={{
              boxSizing: 'border-box',
              width: '100%',
              padding: '13px 16px',
              border: '1px solid hsl(var(--border))',
              borderRadius: '999px',
              color: 'hsl(var(--foreground))',
              background: 'hsl(var(--card) / 0.8)',
              font: 'inherit',
            }}
          />
          <label htmlFor="auth-password">Password</label>
          <input
            id="auth-password"
            name="password"
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isSubmitting}
            placeholder="Almeno 6 caratteri"
            style={{
              boxSizing: 'border-box',
              width: '100%',
              padding: '13px 16px',
              border: '1px solid hsl(var(--border))',
              borderRadius: '999px',
              color: 'hsl(var(--foreground))',
              background: 'hsl(var(--card) / 0.8)',
              font: 'inherit',
            }}
          />
          <button className="start-button" type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? 'Attendi...'
              : mode === 'login'
                ? 'Accedi'
                : 'Registrati'}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setAuthError(null);
              setAuthMessage(null);
            }}
            disabled={isSubmitting}
            style={{
              alignSelf: 'center',
              border: 0,
              color: 'hsl(var(--accent))',
              background: 'transparent',
              cursor: 'pointer',
              font: 'inherit',
              fontWeight: 700,
            }}
          >
            {mode === 'login'
              ? 'Non hai un account? Registrati'
              : 'Hai già un account? Accedi'}
          </button>
          {authMessage && (
            <p role="status" style={{ color: 'hsl(var(--primary))' }}>
              {authMessage}
            </p>
          )}
          {authError && (
            <p role="alert" style={{ color: 'hsl(var(--destructive))' }}>
              {authError}
            </p>
          )}
        </form>
      )}
    </MainPageLayout>
  );
}

function PronosticiPage() {
  const { user, isAuthLoading } = useAuth();
  const [season, setSeason] = useState<ResultsSeason | null>(null);
  const [grandPrix, setGrandPrix] = useState<GrandPrix[]>([]);
  const [sessions, setSessions] = useState<RaceSession[]>([]);
  const [roster, setRoster] = useState<PredictionRider[]>([]);
  const [selectedGrandPrixId, setSelectedGrandPrixId] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [poleRiderId, setPoleRiderId] = useState('');
  const [sprintWinnerRiderId, setSprintWinnerRiderId] = useState('');
  const [podiumRiderIds, setPodiumRiderIds] = useState(['', '', '']);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPrediction, setIsLoadingPrediction] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadPronosticiData() {
      if (isAuthLoading || !user) return;
      setIsLoading(true);
      setErrorMessage(null);

      const seasonResponse = await supabase
        .from('seasons')
        .select('id, year')
        .eq('year', 2026)
        .maybeSingle();

      if (seasonResponse.error || !seasonResponse.data) {
        if (isMounted) {
          setErrorMessage('Non è stato possibile caricare la stagione 2026.');
          setIsLoading(false);
        }
        return;
      }

      const seasonRow = seasonResponse.data as ResultsSeason;
      const grandPrixResponse = await supabase
        .from('grand_prix')
        .select('id, name, short_name, country, circuit, date_start, date_end')
        .eq('season_id', seasonRow.id)
        .eq('is_test', false)
        .order('date_start', { ascending: true });

      if (grandPrixResponse.error) {
        if (isMounted) {
          setErrorMessage('Non è stato possibile caricare i Gran Premi.');
          setIsLoading(false);
        }
        return;
      }

      const grandPrixRows = (grandPrixResponse.data ?? []) as GrandPrix[];
      const grandPrixIds = grandPrixRows.map((item) => item.id);
      const sessionsResponse = grandPrixIds.length
        ? await supabase
            .from('sessions')
            .select('id, grand_prix_id, type, status, session_date, number')
            .in('grand_prix_id', grandPrixIds)
            .in('type', ['Q', 'SPR', 'RAC'])
            .order('session_date', { ascending: true })
        : { data: [], error: null };

      if (sessionsResponse.error) {
        if (isMounted) {
          setErrorMessage('Non è stato possibile caricare le sessioni ufficiali.');
          setIsLoading(false);
        }
        return;
      }

      const rosterResponse = await supabase
        .from('rider_seasons')
        .select('rider_id, number')
        .eq('season_id', seasonRow.id)
        .eq('active', true)
        .order('number', { ascending: true });

      if (rosterResponse.error) {
        if (isMounted) {
          setErrorMessage('Non è stato possibile caricare il roster MotoGP.');
          setIsLoading(false);
        }
        return;
      }

      const rosterRows = (rosterResponse.data ?? []) as PredictionRosterRow[];
      const rosterIds = rosterRows.map((item) => item.rider_id);
      const ridersResponse = rosterIds.length
        ? await supabase
            .from('riders')
            .select('id, name, surname, nickname, number')
            .in('id', rosterIds)
        : { data: [], error: null };

      if (ridersResponse.error) {
        if (isMounted) {
          setErrorMessage('Non è stato possibile caricare i piloti del roster.');
          setIsLoading(false);
        }
        return;
      }

      const riderById = new Map(
        ((ridersResponse.data ?? []) as PredictionRider[]).map((rider) => [rider.id, rider]),
      );
      const roster = rosterRows
        .map((row) => {
          const rider = riderById.get(row.rider_id);
          return rider
            ? { ...rider, number: row.number ?? rider.number }
            : null;
        })
        .filter((rider): rider is PredictionRider => rider !== null);

      if (!isMounted) return;

      const defaultGrandPrix =
        grandPrixRows.find((item) => item.date_start && new Date(item.date_start).getTime() > Date.now()) ??
        grandPrixRows[grandPrixRows.length - 1] ??
        null;

      setSeason(seasonRow);
      setGrandPrix(grandPrixRows);
      setSessions((sessionsResponse.data ?? []) as RaceSession[]);
      setRoster(roster);
      setSelectedGrandPrixId((current) =>
        current && grandPrixRows.some((item) => item.id === current)
          ? current
          : defaultGrandPrix?.id ?? null,
      );
      setIsLoading(false);
    }

    void loadPronosticiData();
    return () => {
      isMounted = false;
    };
  }, [isAuthLoading, user]);

  useEffect(() => {
    let isMounted = true;

    async function loadExistingPrediction() {
      if (!user || !selectedGrandPrixId) return;
      setIsLoadingPrediction(true);
      setSaveError(null);
      setSaveMessage(null);
      setPrediction(null);
      setPoleRiderId('');
      setSprintWinnerRiderId('');
      setPodiumRiderIds(['', '', '']);

      const predictionResponse = await supabase
        .from('predictions')
        .select('id, grand_prix_id, created_at, updated_at')
        .eq('user_id', user.id)
        .eq('grand_prix_id', selectedGrandPrixId)
        .maybeSingle();

      if (predictionResponse.error) {
        if (isMounted) {
          setSaveError('Non è stato possibile caricare il pronostico esistente.');
          setIsLoadingPrediction(false);
        }
        return;
      }

      const predictionRow = predictionResponse.data as Prediction | null;
      if (!predictionRow) {
        if (isMounted) setIsLoadingPrediction(false);
        return;
      }

      const entriesResponse = await supabase
        .from('prediction_entries')
        .select('id, prediction_id, prediction_type, position, rider_id, created_at')
        .eq('prediction_id', predictionRow.id);

      if (entriesResponse.error) {
        if (isMounted) {
          setSaveError('Non è stato possibile caricare i dettagli del pronostico.');
          setIsLoadingPrediction(false);
        }
        return;
      }

      const entries = (entriesResponse.data ?? []) as PredictionEntry[];
      const pole = entries.find((entry) => entry.prediction_type === 'POLE');
      const sprint = entries.find((entry) => entry.prediction_type === 'SPRINT_WINNER');
      const podium = [1, 2, 3].map(
        (position) =>
          entries.find(
            (entry) => entry.prediction_type === 'RACE_PODIUM' && Number(entry.position) === position,
          )?.rider_id ?? '',
      );

      if (isMounted) {
        setPrediction(predictionRow);
        setPoleRiderId(pole?.rider_id ?? '');
        setSprintWinnerRiderId(sprint?.rider_id ?? '');
        setPodiumRiderIds(podium);
        setIsLoadingPrediction(false);
      }
    }

    void loadExistingPrediction();
    return () => {
      isMounted = false;
    };
  }, [selectedGrandPrixId, user]);

  const selectedGrandPrix = grandPrix.find((item) => item.id === selectedGrandPrixId) ?? null;
  const selectedSessions = sessions.filter((item) => item.grand_prix_id === selectedGrandPrixId);
  const qualifyingSession =
    selectedSessions.find((item) => item.type === 'Q' && String(item.number) === '2') ?? null;
  const sprintSession = selectedSessions.find((item) => item.type === 'SPR') ?? null;
  const raceSession =
    selectedSessions.find((item) => item.type === 'RAC' && String(item.number) === '1') ??
    selectedSessions.find((item) => item.type === 'RAC') ??
    null;
  const deadlineState = {
    qualifying: qualifyingSession?.session_date ?? null,
    sprint: sprintSession?.session_date ?? null,
    race: raceSession?.session_date ?? null,
  };
  const isOpen = (deadline: string | null) =>
    Boolean(deadline && new Date(deadline).getTime() > now);
  const qualifyingOpen = isOpen(deadlineState.qualifying);
  const sprintOpen = isOpen(deadlineState.sprint);
  const raceOpen = isOpen(deadlineState.race);
  const hasDuplicatePodium =
    podiumRiderIds.filter(Boolean).length !== new Set(podiumRiderIds.filter(Boolean)).size;
  const canSave =
    Boolean(selectedGrandPrixId) &&
    Boolean(poleRiderId) &&
    Boolean(sprintWinnerRiderId) &&
    podiumRiderIds.every(Boolean) &&
    !hasDuplicatePodium &&
    !isSaving &&
    !isLoadingPrediction;

  function updatePodium(position: number, riderId: string) {
    setPodiumRiderIds((current) =>
      current.map((value, index) => (index === position ? riderId : value)),
    );
    setSaveMessage(null);
    setSaveError(null);
  }

  async function handleSave() {
    setSaveMessage(null);
    setSaveError(null);

    if (!selectedGrandPrixId || !canSave) {
      setSaveError(
        hasDuplicatePodium
          ? 'Un pilota può comparire una sola volta sul podio.'
          : 'Completa tutte le sezioni ancora disponibili prima di salvare.',
      );
      return;
    }

    if (!user) {
      setSaveError('Devi effettuare l’accesso per salvare il pronostico.');
      return;
    }

    setIsSaving(true);
    const { error } = await supabase.rpc('submit_prediction', {
      p_grand_prix_id: selectedGrandPrixId,
      p_pole_rider_id: poleRiderId,
      p_sprint_winner_rider_id: sprintWinnerRiderId,
      p_race_podium_rider_ids: podiumRiderIds,
    });

    if (error) {
      setSaveError(predictionErrorMessage(error));
      setIsSaving(false);
      return;
    }

    setSaveMessage('Pronostico salvato!');
    setPrediction((current) => current);
    setIsSaving(false);
  }

  const riderOptions = roster.length === 0 ? (
    <option value="">Nessun pilota disponibile per questa stagione.</option>
  ) : (
    <>
      <option value="">Seleziona pilota</option>
      {roster.map((rider) => (
        <option value={rider.id} key={rider.id}>
          #{rider.number ?? '—'} {predictionRiderName(rider)}
        </option>
      ))}
    </>
  );

  function predictionSectionStatus(deadline: string | null, open: boolean) {
    if (!deadline) return { label: 'Non disponibile', className: 'is-unavailable' };
    return open
      ? { label: `Aperto · chiude ${predictionShortTime(deadline)}`, className: 'is-open' }
      : { label: 'Chiuso', className: 'is-closed' };
  }

  const qualifyingStatus = predictionSectionStatus(deadlineState.qualifying, qualifyingOpen);
  const sprintStatus = predictionSectionStatus(deadlineState.sprint, sprintOpen);
  const raceStatus = predictionSectionStatus(deadlineState.race, raceOpen);

  return (
    <MainPageLayout
      className="predictions-app-page"
      eyebrow="FantaMotoGP · 2026"
      title="Pronostici"
      text="Scegli i tuoi protagonisti del prossimo Gran Premio."
    >
      <div className="predictions-shell">
        <div className="predictions-toolbar">
          <label className="predictions-select-control" htmlFor="predictions-gp">
            <span>Gran Premio</span>
            <span className="predictions-select-wrap">
              <select
                id="predictions-gp"
                value={selectedGrandPrixId ?? ''}
                onChange={(event) => setSelectedGrandPrixId(event.target.value || null)}
                disabled={isLoading || grandPrix.length === 0}
              >
                <option value="">Seleziona un GP</option>
                {grandPrix.map((item, index) => (
                  <option value={item.id} key={item.id}>
                    {String(index + 1).padStart(2, '0')} · {item.name ?? item.short_name ?? 'Gran Premio'}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} aria-hidden="true" />
            </span>
          </label>
          <span className="predictions-season-label">{season?.year ?? 2026}</span>
        </div>

        {isLoading ? (
          <div className="predictions-state" role="status">Caricamento pronostici...</div>
        ) : errorMessage ? (
          <div className="predictions-state predictions-state--error" role="alert">
            <AlertCircle size={20} aria-hidden="true" />
            <strong>Non è stato possibile caricare i pronostici.</strong>
            <p>{errorMessage}</p>
          </div>
        ) : grandPrix.length === 0 ? (
          <div className="predictions-state" role="status">
            <CalendarDays size={20} aria-hidden="true" />
            <strong>Nessun GP disponibile.</strong>
          </div>
        ) : selectedGrandPrix ? (
          <>
            <div className="predictions-event-meta">
              <div>
                <span className="predictions-round">
                  GP {String(grandPrix.findIndex((item) => item.id === selectedGrandPrix.id) + 1).padStart(2, '0')}
                </span>
                <h2>{selectedGrandPrix.name ?? selectedGrandPrix.short_name}</h2>
                <p>{selectedGrandPrix.circuit ?? selectedGrandPrix.country ?? 'Circuito non disponibile'}</p>
              </div>
              <div className="predictions-event-date">
                <CalendarDays size={16} aria-hidden="true" />
                <span>Data gara</span>
                <strong>{resultDate(selectedGrandPrix.date_start)}</strong>
              </div>
            </div>

            <div className="predictions-deadlines" aria-label="Deadline pronostici">
              {[
                { label: 'Qualifiche', value: deadlineState.qualifying, status: qualifyingStatus },
                { label: 'Sprint', value: deadlineState.sprint, status: sprintStatus },
                { label: 'Gara', value: deadlineState.race, status: raceStatus },
              ].map((item) => (
                <div className={`prediction-deadline ${item.status.className}`} key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.status.label}</strong>
                   <small>
                     {item.value
                       ? `🇮🇹 Ora italiana · ${formatItalianDateTime(item.value)}`
                       : 'Sessione non disponibile'}
                   </small>
                </div>
              ))}
            </div>

            {isLoadingPrediction ? (
              <div className="predictions-state" role="status">Caricamento pronostico...</div>
            ) : roster.length === 0 ? (
              <div className="predictions-state" role="status">
                <Flag size={20} aria-hidden="true" />
                <strong>Nessun pilota disponibile per questa stagione.</strong>
              </div>
            ) : (
              <div className="predictions-form">
                <PredictionSection
                  icon="🏁"
                  title="Pole position"
                  prompt="Chi farà la pole?"
                  deadline={deadlineState.qualifying}
                  open={qualifyingOpen}
                  status={qualifyingStatus}
                >
                  <select
                    className="prediction-rider-select"
                    value={poleRiderId}
                    onChange={(event) => {
                      setPoleRiderId(event.target.value);
                      setSaveMessage(null);
                      setSaveError(null);
                    }}
                    disabled={!qualifyingOpen || isSaving}
                  >
                    {riderOptions}
                  </select>
                </PredictionSection>

                <PredictionSection
                  icon="🏆"
                  title="Vincitore Sprint"
                  prompt="Chi vincerà la Sprint?"
                  deadline={deadlineState.sprint}
                  open={sprintOpen}
                  status={sprintStatus}
                >
                  <select
                    className="prediction-rider-select"
                    value={sprintWinnerRiderId}
                    onChange={(event) => {
                      setSprintWinnerRiderId(event.target.value);
                      setSaveMessage(null);
                      setSaveError(null);
                    }}
                    disabled={!sprintOpen || isSaving}
                  >
                    {riderOptions}
                  </select>
                </PredictionSection>

                <PredictionSection
                  icon="🥇"
                  title="Podio Gara"
                  prompt="Scegli i primi tre classificati."
                  deadline={deadlineState.race}
                  open={raceOpen}
                  status={raceStatus}
                >
                  <div className="prediction-podium-fields">
                    {podiumRiderIds.map((riderId, position) => (
                      <label key={position}>
                        <span>{position + 1}° posto</span>
                        <select
                          className="prediction-rider-select"
                          value={riderId}
                          onChange={(event) => updatePodium(position, event.target.value)}
                          disabled={!raceOpen || isSaving}
                        >
                          {riderOptions}
                        </select>
                      </label>
                    ))}
                  </div>
                  {hasDuplicatePodium && (
                    <p className="prediction-field-error" role="alert">
                      Un pilota può comparire una sola volta sul podio.
                    </p>
                  )}
                </PredictionSection>

                <div className="predictions-actions">
                  {prediction && <span className="prediction-saved-note">Pronostico esistente caricato</span>}
                  {saveMessage && <p className="prediction-success" role="status"><CheckCircle2 size={16} aria-hidden="true" />{saveMessage}</p>}
                  {saveError && <p className="prediction-error" role="alert"><AlertCircle size={16} aria-hidden="true" />{saveError}</p>}
                  <button
                    className="prediction-save-button"
                    type="button"
                    onClick={() => void handleSave()}
                    disabled={!canSave}
                  >
                    {isSaving ? <><Clock3 size={17} aria-hidden="true" /> Salvataggio...</> : <><Save size={17} aria-hidden="true" /> Salva pronostico</>}
                  </button>
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </MainPageLayout>
  );
}

function PredictionSection({
  icon,
  title,
  prompt,
  deadline,
  open,
  status,
  children,
}: {
  icon: string;
  title: string;
  prompt: string;
  deadline: string | null;
  open: boolean;
  status: { label: string; className: string };
  children: ReactNode;
}) {
  return (
    <section className="prediction-section">
      <div className="prediction-section-heading">
        <span className="prediction-section-icon" aria-hidden="true">{icon}</span>
        <div>
          <p>{title}</p>
          <h3>{prompt}</h3>
        </div>
        <span className={`prediction-status ${status.className}`}>
          {open ? <CheckCircle2 size={14} aria-hidden="true" /> : <LockKeyhole size={14} aria-hidden="true" />}
          {deadline ? status.label : 'Non disponibile'}
        </span>
      </div>
      <div className="prediction-section-body">{children}</div>
    </section>
  );
}

function ProtectedPage({ children }: { children: ReactNode }) {
  const { user, isAuthLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isAuthLoading && !user) {
      navigate('/auth');
    }
  }, [isAuthLoading, navigate, user]);

  if (isAuthLoading) {
    return (
      <main
        className="welcome-page app-page"
        style={{ display: 'grid', placeItems: 'center', padding: '24px' }}
      >
        <p role="status">Verifica dell’accesso...</p>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}

function ProtectedHomePage() {
  return (
    <ProtectedPage>
      <HomePage />
    </ProtectedPage>
  );
}

function ProtectedLeaguesPage() {
  return (
    <ProtectedPage>
      <LeaguesPage />
    </ProtectedPage>
  );
}

function ProtectedResultsPage() {
  return (
    <ProtectedPage>
      <ResultsPage />
    </ProtectedPage>
  );
}

function ProtectedPronosticiPage() {
  return (
    <ProtectedPage>
      <PronosticiPage />
    </ProtectedPage>
  );
}

function ProtectedLeagueDetailPage() {
  return (
    <ProtectedPage>
      <LeagueDetailPage />
    </ProtectedPage>
  );
}

function ProtectedProfilePage() {
  return (
    <ProtectedPage>
      <ProfilePage />
    </ProtectedPage>
  );
}

function ProtectedSettingsPage() {
  return (
    <ProtectedPage>
      <SettingsPage />
    </ProtectedPage>
  );
}

function ProfilePage() {
  const { user, isAuthLoading } = useAuth();
  const [profileId, setProfileId] = useState<string | null>(null);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    if (isAuthLoading) {
      return;
    }

    if (!user) {
      setProfileId(null);
      setProfileName(null);
      setHasProfile(false);
      setNameInput('');
      setErrorMessage('Utente non autenticato.');
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, created_at')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      setErrorMessage(
        'Non è stato possibile caricare il profilo. Controlla la connessione o le autorizzazioni Supabase.',
      );
      setIsLoading(false);
      return;
    }

    const profile = data;
    setProfileId(profile?.id ?? null);
    setHasProfile(Boolean(profile));
    setProfileName(profile?.name ?? null);
    setNameInput(profile?.name ?? '');
    setIsLoading(false);
  }, [isAuthLoading, user]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = nameInput.trim();

    setSaveMessage(null);
    setSaveError(null);

    if (!trimmedName) {
      setSaveError('Inserisci un nome prima di salvare.');
      return;
    }

    if (!user) {
      setSaveError('Utente non autenticato.');
      return;
    }

    if (!profileId) {
      setSaveError('Profilo non trovato per questo account.');
      return;
    }

    setIsSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({ name: trimmedName })
      .eq('user_id', user.id);

    if (error) {
      setSaveError(
        'Non è stato possibile salvare il profilo. Controlla la connessione o le autorizzazioni Supabase.',
      );
      setIsSaving(false);
      return;
    }

    setSaveMessage('Profilo salvato con successo.');
    await loadProfile();
    setIsSaving(false);
  }

  async function handleDelete() {
    if (
      !user ||
      !profileId ||
      !window.confirm('Sei sicura di voler eliminare questo profilo?')
    ) {
      return;
    }

    setSaveMessage(null);
    setSaveError(null);
    setIsDeleting(true);

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      setSaveError(
        'Non è stato possibile eliminare il profilo. Controlla la connessione o le autorizzazioni Supabase.',
      );
      setIsDeleting(false);
      return;
    }

    setProfileId(null);
    setProfileName(null);
    setHasProfile(false);
    setNameInput('');
    setSaveMessage('Profilo eliminato con successo.');
    setIsDeleting(false);
  }

  const profileText = isLoading
    ? 'Caricamento del profilo...'
    : errorMessage
      ? errorMessage
      : hasProfile
        ? profileName
          ? `Nome: ${profileName}`
          : 'Profilo trovato, ma il nome non è disponibile.'
          : 'Nessun profilo disponibile per questo account.';

  return (
    <MainPageLayout
      eyebrow="La tua identità"
      title="Il mio profilo"
      text={profileText}
    >
      <form
        onSubmit={handleSave}
        aria-label="Crea un profilo"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          margin: '0 auto',
          maxWidth: '430px',
        }}
      >
        <label htmlFor="profile-name" style={{ alignSelf: 'stretch', textAlign: 'left' }}>
          Nome
        </label>
        <input
          id="profile-name"
          name="name"
          type="text"
          value={nameInput}
          onChange={(event) => {
            setNameInput(event.target.value);
            setSaveMessage(null);
            setSaveError(null);
          }}
          disabled={isSaving || isDeleting}
          placeholder="Inserisci il tuo nome"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '13px 16px',
            border: '1px solid hsl(var(--border))',
            borderRadius: '999px',
            color: 'hsl(var(--foreground))',
            background: 'hsl(var(--card) / 0.8)',
            font: 'inherit',
          }}
        />
        <button
          className="start-button"
          type="submit"
          disabled={isSaving || isDeleting || !profileId}
        >
          {isSaving ? 'Salvataggio...' : 'Salva'}
        </button>
        {profileId && (
          <button
            className="start-button"
            type="button"
            onClick={() => void handleDelete()}
            disabled={isSaving || isDeleting}
          >
            {isDeleting ? 'Eliminazione...' : 'Elimina profilo'}
          </button>
        )}
        {saveMessage && (
          <p role="status" style={{ color: 'hsl(var(--primary))' }}>
            {saveMessage}
          </p>
        )}
        {saveError && (
          <p role="alert" style={{ color: 'hsl(var(--destructive))' }}>
            {saveError}
          </p>
        )}
      </form>
    </MainPageLayout>
  );
}

function SettingsPage() {
  return (
    <MainPageLayout
      eyebrow="Personalizza"
      title="Impostazioni"
      text="Qui in futuro potremo modificare le impostazioni dell'app."
    />
  );
}

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={WelcomePage} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/home" component={ProtectedHomePage} />
        <Route path="/leghe" component={ProtectedLeaguesPage} />
        <Route path="/pronostici" component={ProtectedPronosticiPage} />
        <Route path="/risultati" component={ProtectedResultsPage} />
        <Route path="/leghe/:leagueId" component={ProtectedLeagueDetailPage} />
        <Route path="/profilo" component={ProtectedProfilePage} />
        <Route path="/impostazioni" component={ProtectedSettingsPage} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authLoadError, setAuthLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      const { data, error } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (error) {
        setAuthLoadError('Non è stato possibile verificare l’accesso.');
      }

      setUser(data.session?.user ?? null);
      setIsAuthLoading(false);
    }

    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) {
        return;
      }

      setUser(session?.user ?? null);
      setIsAuthLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthLoading, authLoadError }}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </AuthContext.Provider>
  );
}

export default App;
