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
  ArrowRight,
  Home as HomeIcon,
  Settings,
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
  children,
}: {
  eyebrow: string;
  title: string;
  text: string;
  children?: ReactNode;
}) {
  const [location, navigate] = useLocation();
  const sections = [
    { path: '/home', label: 'Home', icon: HomeIcon },
    { path: '/leghe', label: 'Leghe', icon: Trophy },
    { path: '/profilo', label: 'Profilo', icon: UserRound },
    { path: '/impostazioni', label: 'Impostazioni', icon: Settings },
  ];

  return (
    <main className="welcome-page app-page" data-testid="page-app">
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
