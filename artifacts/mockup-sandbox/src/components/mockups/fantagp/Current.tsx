import { type ReactNode, useState } from 'react';
import { Home as HomeIcon, Trophy, Target, Flag, UserRound, BookOpen, Settings } from 'lucide-react';
import './_group.css';
function useLocation(): [string, (path:string)=>void] { return useState('/profilo'); }
function AuthStatus() { return <span className="nav-note">Il tuo account</span>; }
function MainPageLayout({
  eyebrow,
  title,
  text,
  className,
  embedded = false,
  children,
}: {
  eyebrow: string;
  title: string;
  text: string;
  className?: string;
  embedded?: boolean;
  children?: ReactNode;
}) {
  const [location, navigate] = useLocation();
  const sections = [
    { path: '/home', label: 'Home', icon: HomeIcon },
    { path: '/leghe', label: 'Leghe', icon: Trophy },
    { path: '/miei-risultati', label: 'I miei risultati', icon: Target },
    { path: '/risultati', label: 'Risultati', icon: Flag },
    { path: '/profilo', label: 'Profilo', icon: UserRound },
    { path: '/regolamento', label: 'Regolamento', icon: BookOpen },
    { path: '/impostazioni', label: 'Impostazioni', icon: Settings },
  ];
  const primarySections = [
    sections[0],
    sections[1],
    { path: '/miei-risultati', label: 'I miei', icon: Target },
    sections[3],
    sections[4],
  ];

  return (
    <main
      className={`welcome-page app-page${className ? ` ${className}` : ''}${embedded ? ' embedded-page' : ''}`}
      data-testid="page-app"
    >
      {!embedded && (
        <header className="welcome-nav">
          <div className="brand-lockup" data-testid="text-brand">
            <span className="brand-mark" aria-hidden="true">FM</span>
            <span>FANTA <b>MOTOGP</b></span>
          </div>
          <nav className="desktop-nav" aria-label="Navigazione principale">
            {sections.map(({ path, label, icon: Icon }) => {
              const isActive = location === path;
              return (
                <button
                  className={`desktop-nav-item${isActive ? ' is-active' : ''}`}
                  key={`${path}-${label}`}
                  type="button"
                  onClick={() => navigate(path)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon size={15} strokeWidth={isActive ? 2.5 : 2} aria-hidden="true" />
                  <span>{label}</span>
                </button>
              );
            })}
          </nav>
          <AuthStatus />
        </header>
      )}

      <section className={`app-content${embedded ? ' embedded-app-content' : ''}`} aria-labelledby="app-page-title">
        {embedded ? children : (
          <div className="app-copy">
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="welcome-title" id="app-page-title">
              {title}
            </h1>
            <p className="welcome-description">{text}</p>
            {children}
          </div>
        )}
      </section>

      {!embedded && (
        <>
          <details className="mobile-nav">
            <summary><span className="mobile-nav-lines" aria-hidden="true"><i /><i /><i /></span> Menu</summary>
            <nav aria-label="Navigazione mobile">
              {sections.map(({ path, label, icon: Icon }) => {
                const isActive = location === path;
                return (
                  <button
                    className={`mobile-nav-item${isActive ? ' is-active' : ''}`}
                    key={path}
                    type="button"
                    data-testid={`nav-${label.toLowerCase()}`}
                    onClick={(event) => {
                      navigate(path);
                      event.currentTarget.closest('details')?.removeAttribute('open');
                    }}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon size={18} aria-hidden="true" /><span>{label}</span>
                  </button>
                );
              })}
            </nav>
          </details>
          <nav className="bottom-nav" aria-label="Navigazione rapida" data-testid="bottom-navigation">
            {primarySections.map(({ path, label, icon: Icon }) => {
              const isActive =
                location === path ||
                (path === '/leghe' && location.startsWith('/leghe/')) ||
                (path === '/profilo' && location === '/profilo');
              return (
                <button
                  className={`bottom-nav-item${isActive ? ' is-active' : ''}`}
                  key={path}
                  type="button"
                  data-testid={`bottom-nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => navigate(path)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.6 : 2} aria-hidden="true" />
                  <span>{label}</span>
                </button>
              );
            })}
          </nav>
        </>
      )}
    </main>
  );
}

export function Current() { return <MainPageLayout eyebrow="La tua identità" title="Il mio profilo" text="Il tuo Fanta MotoGP"><section className="profile-predictions-section"><div className="profile-predictions-heading"><p className="eyebrow">Il tuo Fanta MotoGP</p><h2>Pronostici</h2><p>Scegli i tuoi protagonisti del prossimo Gran Premio.</p></div></section></MainPageLayout>; }
