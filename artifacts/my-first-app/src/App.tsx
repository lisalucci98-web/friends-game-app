import { type ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { ArrowRight, Check } from 'lucide-react';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

function Home() {
  const [hasStarted, setHasStarted] = useState(false);

  return (
    <main className="welcome-page" data-testid="page-home">
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
            className={`start-button${hasStarted ? ' is-started' : ''}`}
            data-testid="button-start"
            type="button"
            onClick={() => setHasStarted(true)}
            aria-describedby={hasStarted ? 'start-feedback' : undefined}
          >
            <span>{hasStarted ? 'Hai iniziato' : 'Inizia'}</span>
            <span className="button-icon" aria-hidden="true">
              {hasStarted ? <Check size={16} strokeWidth={2.5} /> : <ArrowRight size={16} strokeWidth={2.5} />}
            </span>
          </button>
          {hasStarted && (
            <p className="welcome-feedback" id="start-feedback" role="status" data-testid="status-started">
              <span className="feedback-dot" aria-hidden="true" />
              Primo passo completato. Ben fatto.
            </p>
          )}
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

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
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
