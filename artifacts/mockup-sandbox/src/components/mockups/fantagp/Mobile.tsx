import { useState } from 'react';
import { Flag, Settings, Target, Trophy, BarChart3, BookOpen, Flag as FlagIcon } from 'lucide-react';
import './_group.css';
import '../../../../../my-first-app/src/mobile-redesign.css';

const sections = [
  { path: '/pronostici', label: 'Pronostici', icon: Target },
  { path: '/risultati', label: 'Storico GP', icon: Flag },
  { path: '/leghe', label: 'Lega', icon: Trophy },
  { path: '/statistiche', label: 'Statistiche', icon: BarChart3 },
  { path: '/impostazioni', label: 'Impostazioni', icon: Settings },
];

export function Mobile() {
  const [location, navigate] = useState('/pronostici');
  const [tab, setTab] = useState('attivo');
  return (
    <main className="welcome-page app-page" data-testid="page-app">
      <header className="welcome-nav app-header">
        <button type="button" className="brand-lockup brand-button" onClick={() => navigate('/pronostici')}>
          <span className="brand-mark" aria-hidden="true">FM</span>
          <span>FANTA <b>MOTOGP</b></span>
        </button>
        <nav className="desktop-nav">
          {sections.map(({ path, label, icon: Icon }) => (
            <button key={path} type="button" className={`desktop-nav-item${location === path ? ' is-active' : ''}`} onClick={() => navigate(path)}>
              <Icon size={16} aria-hidden="true" /><span>{label}</span>
            </button>
          ))}
        </nav>
        <button type="button" className="rules-link"><BookOpen size={15} aria-hidden="true" /><span>Regolamento</span></button>
      </header>
      <section className="app-content">
        <div className="app-copy">
          <p className="eyebrow">Anteprima</p>
          <h1 className="welcome-title">Pronostici</h1>
          <p className="welcome-description">Tre piloti, zero scuse. Chiudi la scheda prima del semaforo.</p>
          <div className="paddock-tabs" role="tablist">
            <button type="button" className={tab === 'attivo' ? 'is-active' : ''} onClick={() => setTab('attivo')}>Prossimo GP</button>
            <button type="button" className={tab === 'passati' ? 'is-active' : ''} onClick={() => setTab('passati')}>I miei passati</button>
          </div>
          {tab === 'attivo' ? (
            <div className="predictions-shell">
              <div className="predictions-event-meta">
                <div className="predictions-event-title"><h2>GP di esempio</h2><p>Dati di anteprima</p></div>
              </div>
              <div className="predictions-form">
                <div className="prediction-section">
                  <div className="prediction-section-heading"><span className="prediction-section-icon">01</span><h3>Podio gara</h3></div>
                  <div className="prediction-section-body">
                    <div className="prediction-podium-fields">
                      {['Primo', 'Secondo', 'Terzo'].map((p) => (
                        <label key={p}>{p}<select className="prediction-rider-select"><option>Scegli un pilota</option></select></label>
                      ))}
                    </div>
                    <div className="prediction-section-actions"><button type="button" className="prediction-save-button">Salva pronostico</button></div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="paddock-empty"><FlagIcon size={28} aria-hidden="true" /><strong>Nessun pronostico</strong><span>Anteprima: qui compariranno i tuoi GP passati. Per ora il box e vuoto.</span></div>
          )}
        </div>
      </section>
      <nav className="bottom-nav" style={{ position: 'sticky' }}>
        {sections.map(({ path, label, icon: Icon }) => (
          <button key={path} type="button" className={`bottom-nav-item${location === path ? ' is-active' : ''}`} onClick={() => navigate(path)}>
            <Icon size={20} aria-hidden="true" /><span>{label}</span>
          </button>
        ))}
      </nav>
    </main>
  );
}
