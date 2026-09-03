# Task 40 — Redesign mobile-first di FantaMotoGP

## Stato

Completato con modifiche esclusivamente frontend. La logica dati, le query Supabase, l'autenticazione, lo scoring, il database e le API non sono stati modificati.

## Direzione visuale

È stata consolidata una direzione “Pitlane Editorial / Telemetry”:

- canvas caldo tipo carta, pannelli charcoal e rosso segnale per azioni e stati attivi;
- tipografia display condensata per titoli e momenti gara;
- DM Sans per i testi leggibili e Space Mono per metadati, tempi e punteggi;
- card con gerarchia netta, ombre contenute e bordi ad alto contrasto;
- animazioni leggere con fallback `prefers-reduced-motion`.

## Interventi principali

### Shell e navigazione

- Header desktop mantenuto e reso più coerente con il sistema visuale.
- Bottom navigation mobile persistente con cinque sezioni principali:
  Home, Leghe, I miei, Risultati e Profilo.
- Icone Lucide, label, stato attivo, `aria-current`, target touch da almeno 44 px e padding per `safe-area-inset-bottom`.
- Menu mobile secondario per Regolamento e Impostazioni, senza rimuovere le route esistenti.
- Clearance verticale del contenuto per evitare che la bottom navigation copra le card.
- Stato attivo corretto anche nel dettaglio `/leghe/:leagueId`.

### Home

- Card del prossimo Gran Premio con stato del pronostico e sessioni.
- Accessi rapidi a Leghe e race log.
- Stati loading, errore e calendario vuoto mantenuti e coerenti.
- Layout adattato a una colonna su mobile e a griglia su desktop.

### Leghe e risultati personali

- Classifica lega organizzata in righe/card verticali leggibili senza tabella larga.
- Dettaglio partecipante e storico GP mantenuti in sezioni espandibili.
- Breakdown dei punti conservato nella modalità progressiva.
- Matrice GP disponibile su desktop come tabella e su mobile come card per partecipante, così ogni GP resta leggibile senza scroll orizzontale.
- `/miei-risultati` mantiene la distinzione visuale e semantica tra `0`, `—` e `Attesa`.

### Pronostici

- Select, campi e pulsanti con target touch più ampi.
- Sezioni qualifica, Sprint e Gara disposte in una colonna sui viewport stretti.
- Azione di salvataggio a tutta larghezza su mobile.
- Stati disabled, loading ed errore mantenuti.

### Risultati ufficiali e pagine di servizio

- Tab Qualifica/Sprint/Gara scorrevoli e leggibili su mobile.
- Righe risultati mobile dedicate, con posizione, pilota e punti senza overflow.
- Tabelle regolamento adattate a una colonna.
- Pagina 404 riallineata al brand con ritorno funzionante alla Home.

## File modificati

- `artifacts/my-first-app/src/App.tsx`
  - bottom navigation funzionante;
  - accessi rapidi Home;
  - nessuna nuova query o modifica alla gestione dati.
- `artifacts/my-first-app/src/index.css`
  - token visuali Task 40;
  - layout mobile-first e breakpoint per 360–412 px;
  - adattamento tablet/desktop;
  - stati, focus, touch target, safe area e reduced motion.
- `artifacts/my-first-app/src/pages/not-found.tsx`
  - 404 coerente con il nuovo sistema visuale.

## Verifica

- `pnpm --filter @workspace/my-first-app run typecheck` — PASS.
- `PORT=4173 BASE_PATH=/ pnpm --filter @workspace/my-first-app run build` — PASS.
- `git diff --check` — PASS.
- Workflow `artifacts/my-first-app: web` riavviato e operativo.
- Screenshot verificati a:
  - 390×844: welcome e accesso con bottom navigation;
  - 412×915: layout accesso e clearance inferiore;
  - 1366×768: welcome e shell desktop.
- Console browser finale senza errori runtime o warning React.

La build continua a mostrare due warning non bloccanti già presenti nel progetto: sourcemap di `src/components/ui/tooltip.tsx` e bundle principale oltre 500 kB.

## Integrità dati

Durante il redesign non sono stati aggiunti `INSERT`, `UPDATE`, `DELETE`, `UPSERT`, chiamate RPC, query nuove o modifiche al backend/database. I contenuti dinamici e le regole di scoring restano quelli già esistenti.