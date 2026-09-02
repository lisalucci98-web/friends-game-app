# Task 35 — Visualizzazione punteggi per ogni pronostico

## Stato

Implementazione completata sulle pagine esistenti, senza creare una nuova route di
audit:

- `/leghe/:leagueId`
- `/miei-risultati`

## Pagine e componenti modificati

- `artifacts/my-first-app/src/components/Task21Results.tsx`
  - mantenuta la classifica esistente della lega e la relativa logica di ranking;
  - selezione di ogni partecipante dalla classifica;
  - storico completo dei GP del partecipante selezionato;
  - card espandibile per ogni GP;
  - dettaglio condiviso del pronostico con Qualifica, Sprint, Gara, OUT, Bonus,
    Malus e totale;
  - punti per ogni singola entry letti da `prediction_entries.points`;
  - visualizzazione `—` per prediction, componente o entry assente;
  - avviso visivo quando le componenti disponibili non coincidono con il totale
    memorizzato, senza correggere il totale;
  - nella pagina della lega gli entry vengono caricati solo per GP già chiusi,
    preservando il gate esistente sui pronostici non ancora pubblicabili.
- `artifacts/my-first-app/src/index.css`
  - stili delle card GP, riepilogo delle categorie, dettaglio delle singole
    posizioni e layout responsive desktop/mobile.

Non sono state create nuove pagine o nuove route.

## Query utilizzate

Sono state utilizzate esclusivamente query di lettura Supabase:

- `seasons`: stagione e anno;
- `grand_prix`: calendario completo della stagione;
- `sessions`: stato di chiusura dei GP;
- `league_members`: appartenenza alla lega;
- `get_league_members`: partecipanti della lega;
- `leagues`: nome e codice della lega;
- `predictions`: componenti e totale già memorizzati;
- `prediction_entries`: pole, tempo, Sprint, Gara, OUT e `points`;
- `riders`: nomi dei piloti associati agli entry.

La selezione dei dati usa `prediction_entries.prediction_type` per:

- `POLE`
- `QUALIFYING_TIME`
- `SPRINT`
- `RACE`
- `RACE_OUT`

Non vengono lette colonne inesistenti come
`predictions.qualifying_pole_rider_id` o `predictions.race_out_rider_id`.

## Dati mostrati

Ogni riepilogo GP mostra i valori persistiti per:

- Qualifica;
- Sprint;
- Gara;
- Bonus;
- Malus;
- Totale.

Il dettaglio espandibile mostra inoltre:

- pole e punti Pole;
- tempo pole e punti tempo;
- P1/P2/P3 Sprint e punti per posizione;
- P1/P2/P3/P4/P5 Gara e punti per posizione;
- OUT e punti OUT;
- Bonus, Malus e Totale Gara;
- totale GP memorizzato.

La formula `Qualifica + Sprint + Gara + Bonus + Malus` è mostrata soltanto come
contesto di lettura. Il totale ufficiale visualizzato resta sempre
`predictions.total_points`. Se le componenti non coincidono, l’interfaccia lo
segnala senza ricalcolare o modificare alcun valore.

Sono distinti correttamente:

- prediction presente con punteggio `0` → `0`;
- prediction o componente assente → `—`.

## Verifiche eseguite

- `pnpm --filter @workspace/my-first-app run typecheck` — PASS;
- `PORT=5000 BASE_PATH=/ pnpm --filter @workspace/my-first-app run build` —
  PASS;
- `git diff --check` — PASS;
- workflow web riavviato e Vite avviato correttamente sulla porta configurata;
- preview verificato su `/miei-risultati` a viewport desktop e mobile;
- console browser senza errori applicativi nel controllo preview.

Il preview non autenticato mostra correttamente la pagina di accesso; non è
stata usata alcuna credenziale per simulare un utente.

## Controllo read-only

- RPC `score_prediction`: 0 chiamate;
- INSERT: 0;
- UPDATE: 0;
- DELETE: 0;
- UPSERT: 0;
- prediction modificate: 0;
- prediction entries modificate: 0;
- session results modificate: 0;
- schema modificato: NO;
- RLS modificato: NO;
- scoring modificato: NO.

Nessun punteggio è stato ricalcolato per determinare il valore ufficiale e
nessun dato persistito è stato modificato.