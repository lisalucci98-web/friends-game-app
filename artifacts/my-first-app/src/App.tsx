import { type ReactNode, useCallback, useEffect, useState } from 'react';
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
        <span className="nav-note">il tuo spazio · 02</span>
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

function ProfilePage() {
  const [profileName, setProfileName] = useState<string | null>(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
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
    setHasProfile(Boolean(profile));
    setProfileName(profile?.name ?? null);
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

    const { error } = await supabase
      .from('profiles')
      .insert({ name: trimmedName });

    if (error) {
      setSaveError(
        'Non è stato possibile salvare il profilo. Controlla la connessione o le autorizzazioni Supabase.',
      );
      setIsSaving(false);
      return;
    }

    setNameInput('');
    setSaveMessage('Profilo salvato con successo.');
    await loadProfile();
    setIsSaving(false);
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
          disabled={isSaving}
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
        <button className="start-button" type="submit" disabled={isSaving}>
          {isSaving ? 'Salvataggio...' : 'Salva'}
        </button>
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
        <Route path="/home" component={HomePage} />
        <Route path="/profilo" component={ProfilePage} />
        <Route path="/impostazioni" component={SettingsPage} />
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
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
