import { useLocation } from 'wouter';
import { ArrowLeft, FlagTriangleRight } from 'lucide-react';

export default function NotFound() {
  const [, navigate] = useLocation();

  return (
    <main className="not-found-page" data-testid="page-not-found">
      <div className="not-found-card">
        <span className="not-found-mark" aria-hidden="true"><FlagTriangleRight size={24} /></span>
        <p className="eyebrow">Fanta MotoGP · fuori pista</p>
        <h1>Questa curva<br /><em>non esiste.</em></h1>
        <p className="not-found-copy">La pagina che cerchi ha lasciato il circuito. Torna al paddock e riparti da lì.</p>
        <button className="start-button" type="button" data-testid="button-not-found-home" onClick={() => navigate('/home')}>
          <ArrowLeft size={17} aria-hidden="true" />
          Torna alla home
        </button>
      </div>
    </main>
  );
}
