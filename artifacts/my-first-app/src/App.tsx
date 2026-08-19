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
  UserRound,
} from 'lucide-react';
import {
  Route,
  Switch,
  useLocation,
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

    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, created_at')
      .limit(1);

    if (error) {
      setErrorMessage(
        'Non è stato possibile caricare il profilo. Controlla la connessione o le autorizzazioni Supabase.',
      );
      setIsLoading(false);
      return;
    }

    const profile = data?.[0];
    setProfileId(profile?.id ?? null);
    setHasProfile(Boolean(profile));
    setProfileName(profile?.name ?? null);
    setNameInput(profile?.name ?? '');
    setIsLoading(false);
  }, []);

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

    setIsSaving(true);

    const { error } = profileId
      ? await supabase
          .from('profiles')
          .update({ name: trimmedName })
          .eq('id', profileId)
      : await supabase
          .from('profiles')
          .insert({ name: trimmedName });

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
    if (!profileId || !window.confirm('Sei sicura di voler eliminare questo profilo?')) {
      return;
    }

    setSaveMessage(null);
    setSaveError(null);
    setIsDeleting(true);

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', profileId);

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
        : 'Nessun profilo disponibile.';

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
        <button className="start-button" type="submit" disabled={isSaving || isDeleting}>
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
