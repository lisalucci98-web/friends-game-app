# Task 44 — Audit read-only per migrazione da Replit a GitHub

**Data audit:** 2026-09-08  
**Ambito:** ispezione locale del repository e verifiche non distruttive.  
**Esito sintetico:** il progetto è già collegato a un repository GitHub e può essere portato fuori da Replit, ma non è una sola SPA completamente autosufficiente: il comportamento runtime completo richiede il client Supabase, il server API/worker e le rispettive variabili d'ambiente. La migrazione non è stata eseguita.

## 1. Stato Git attuale

| Voce | Stato |
|---|---|
| Repository Git | Presente |
| Branch corrente | `main` |
| Branch principale remoto | `origin/main` (`origin/HEAD -> origin/main`) |
| Sincronizzazione | `main` è avanti di 1 commit rispetto a `origin/main`; non risultano commit mancanti localmente |
| HEAD | `be6ce4125534717de9b56b55314e5a9ee42288dd` |
| Ultimo commit | `Add audit documentation for migration task 44` |
| Autore/data ultimo commit | Replit Agent, 2026-09-07T11:45:24Z |
| Remote GitHub | `origin` → `https://github.com/lisalucci98-web/friends-game-app` |
| Backup remoto | `gitsafe-backup` |
| Altri remote | 25 remote `subrepl-*` SSH/Replit, oltre a `origin` e `gitsafe-backup` |
| Branch locali | `main`, `replit-agent`, 26 branch `subrepl-*` |
| File tracciati | 388 |
| Working tree | Pulito: nessuna modifica staged/unstaged |
| File untracked | Nessuno nel controllo finale |
| File allegato Task 44 | Tracciato nel commit locale corrente; è documentazione, non runtime |
| File ignorati | Cache, dipendenze, build, TypeScript build info e output temporanei |

`git diff --check` e `git diff --cached --check` non hanno prodotto errori.

Durante questo audit non sono stati eseguiti `git push`, `git reset`, `git clean`, checkout distruttivi, merge o rebase. Il commit locale già presente rende necessario decidere esplicitamente, prima della migrazione, se pubblicarlo su `origin/main`.

## 2. Struttura necessaria del progetto

### Root e workspace

- `package.json`: script root per typecheck e build ricorsiva.
- `pnpm-lock.yaml`: unico lockfile presente.
- `pnpm-workspace.yaml`: workspace `artifacts/*`, `lib/*`, `lib/integrations/*` e `scripts`.
- `tsconfig.json`, `tsconfig.base.json`: configurazione TypeScript condivisa.
- `.replit`, `.replitignore`, `replit.md`: configurazione/istruzioni specifiche dell'ambiente Replit.
- `supabase/migrations/`: migration SQL versionate.
- `supabase/verification/`: query SQL read-only per la verifica delle policy.
- `.agents/outputs/`: report e fixture documentali non necessari al runtime web.

### Artifact web principale

`artifacts/my-first-app/`

- React 19 + Vite.
- `src/App.tsx`: autenticazione, dashboard, inserimento prediction, leghe e dati Supabase.
- `src/components/Task21Results.tsx`: risultati, punteggi personali e classifica.
- `src/lib/supabase.ts`: client Supabase browser.
- `src/main.tsx`, `src/index.css`, `index.html`, `public/`.
- `vite.config.ts`: build Vite, `PORT`, `BASE_PATH`, alias e plugin dev.
- Output build: `dist/public/`.
- Configurazione artifact: `.replit-artifact/artifact.toml`.
- Il servizio web è configurato con SPA fallback verso `index.html`.

### Artifact API

`artifacts/api-server/`

- Express 5.
- `src/index.ts`, `src/app.ts`.
- Endpoint health `/api/healthz`.
- Worker `src/lib/prediction-carry-over.ts`: job process-level che verifica periodicamente il carry-over delle prediction tramite Supabase.
- Build esbuild: output `dist/index.mjs`.
- Configurazione artifact: `.replit-artifact/artifact.toml`.

### Artifact mockup

`artifacts/mockup-sandbox/` è il server di preview del Canvas, con path `/__mockup`. Non è necessario per il deploy dell'app FantaMotoGP in produzione; va mantenuto solo se serve il flusso di prototipazione visuale del workspace.

### Librerie condivise

- `lib/db`: Drizzle/PostgreSQL e configurazione `DATABASE_URL`.
- `lib/api-spec`: specifica OpenAPI e code generation.
- `lib/api-zod`: schemi Zod condivisi.
- `lib/api-client-react`: client React generato.

### Script operativi

Gli script in `scripts/` contengono test, import MotoGP, ricostruzione Google Sheets, audit e scoring storico. Non sono bundle del frontend e non sono necessari per servire la SPA, ma sono necessari per conservare la capacità operativa di audit/import/scoring.

## 3. Dipendenze e toolchain

- Node.js: usato dal workspace; `.replit` richiede il modulo `nodejs-24`.
- pnpm: obbligatorio; lo script `preinstall` rifiuta user agent diversi da pnpm e rimuove eventuali lockfile npm/yarn.
- TypeScript 5.9.
- React/React DOM 19.1.
- Vite 7, plugin React, Tailwind CSS.
- Supabase JS client.
- Wouter, TanStack Query, Zod, Radix UI e Lucide.
- Express 5, CORS, cookie-parser, Pino/Pino HTTP.
- Drizzle ORM, `pg`, Drizzle Kit e `drizzle-zod`.
- esbuild per il server API.
- `@replit/connectors-sdk` per gli script Google Drive/Google Sheets.
- Plugin Vite Replit: cartographer, dev banner e runtime error modal.

Il lockfile è `pnpm-lock.yaml`; non sono presenti `package-lock.json` o `yarn.lock`.

`pnpm-workspace.yaml` imposta `minimumReleaseAge: 1440`, disabilita l'auto-installazione dei peer e contiene esclusioni di pacchetti native per la piattaforma Linux/Replit. Queste impostazioni vanno riesaminate in CI o su macOS/Windows prima di usare il repository fuori da Replit.

## 4. Riferimenti a Replit e portabilità

| File/area | Scopo attuale | Necessario fuori da Replit? | Azione consigliata |
|---|---|---|---|
| `.replit` | Moduli Node/Python, deployment autoscale, workflow, post-merge e stack pnpm | No | Sostituire con CI/CD e configurazione del provider scelto; conservarlo solo se si mantiene anche Replit |
| `.replitignore` | Riduce i file inclusi nel deploy Replit | No | Usare `.gitignore`/ignore del provider esterno |
| `artifacts/*/.replit-artifact/artifact.toml` | Path preview, porte, comandi development/production, static serving e rewrite SPA | No, è metadato Replit | Tradurre build/run/rewrites nel provider esterno |
| `artifacts/my-first-app/vite.config.ts` | Richiede `PORT` e `BASE_PATH`; abilita plugin dev Replit quando `REPL_ID` è presente | `PORT` e base path sono generici; plugin Replit no | Rendere i valori compatibili col provider e rendere opzionali/rimuovere i plugin dev Replit |
| `artifacts/mockup-sandbox/vite.config.ts` | Stessa gestione `PORT`/`BASE_PATH` per il preview Canvas | Solo per il mockup server | Escludere dal deploy di produzione oppure configurare un preview separato |
| `package.json`, `pnpm-workspace.yaml`, lockfile | `@replit/connectors-sdk`, cataloghi/plugin Replit e allowlist | No per la SPA; sì solo per gli import storici attuali | Sostituire i connector con integrazione Google indipendente se gli import devono continuare fuori Replit |
| `scripts/import-historical-google-sheets.mjs`, `reconstruct-google-history.mjs` | Usano OAuth connector Google gestito da Replit | No | Prevedere Google OAuth/service account e secret del nuovo ambiente; non includere dati storici nel bundle |
| `supabase/migrations/20260820122000_fix_qualifying_time_points.sql` | Commento che impedisce di applicare la migration al DB Replit | No | Applicare le migration solo al progetto Supabase target, con preflight esplicito |
| `replit.md` | Istruzioni e contesto per agent/workspace | No per il runtime | Portare solo la documentazione utile al progetto GitHub |
| `.agents/outputs/` e alcuni report storici | Conservano riferimenti a `PORT`, `BASE_PATH` e path Replit come evidenza | No per il runtime | Conservare come audit, senza usarli come configurazione di deploy |
| `pnpm-workspace.yaml` | Commenti e override orientati a pacchetti Replit/Linux | Non necessariamente | Riesaminare le esclusioni di piattaforma prima di installare in ambienti diversi |

Il path applicativo attuale dell'artifact principale è `/`, non `/my-first-app`. I riferimenti `/my-first-app` rimasti nei report sono storici o relativi a precedenti build; non devono essere copiati automaticamente nel nuovo hosting.

## 5. Variabili d'ambiente — nomi soltanto

| Nome | Dove usato | Lato | Necessario |
|---|---|---|---|
| `VITE_SUPABASE_URL` | Client browser, API worker e script Supabase | Client + server/script | Sì per web e server |
| `VITE_SUPABASE_ANON_KEY` | `artifacts/my-first-app/src/lib/supabase.ts` | Client browser | Sì per la SPA |
| `SUPABASE_SERVICE_ROLE_KEY` | API worker e script di audit/import/apply | Solo server/script | Sì per worker e operazioni amministrative; non deve mai finire nel frontend |
| `SUPABASE_URL` | Alias supportato da diversi script CLI | Server/script | Opzionale se si usa `VITE_SUPABASE_URL` |
| `DATABASE_URL` | `lib/db` e configurazione Drizzle | Server | Necessaria se si mantiene il database/API Drizzle |
| `PORT` | Vite e API server | Build/runtime | Necessaria secondo la configurazione attuale |
| `BASE_PATH` | Vite web e mockup | Build/runtime frontend | Necessaria secondo la configurazione attuale |
| `NODE_ENV` | Avvio/build API server | Server | Necessaria per distinguere development/production |
| `REPL_ID` | Attivazione condizionale dei plugin Vite Replit | Development | Replit-only/optional |
| `npm_config_user_agent` | Guard nello script `preinstall` | Installazione | Usata per imporre pnpm |

Non risultano valori di secret stampati o salvati nel report. La ricerca dei file tracciati non ha trovato `.env`, secret, credential, token o key file committati.

## 6. Integrazione Supabase

### Client e autenticazione

Il client browser è creato in `artifacts/my-first-app/src/lib/supabase.ts` con URL e anon key da `import.meta.env`. `App.tsx` usa autenticazione Supabase con:

- `signInWithPassword`;
- `signUp`;
- `signOut`;
- `getSession`;
- `onAuthStateChange`.

### Tabelle lette dal frontend

Il frontend legge principalmente:

- `seasons`;
- `grand_prix`;
- `sessions`;
- `session_results`;
- `riders`;
- `rider_seasons`;
- `teams`;
- `leagues`;
- `league_members`;
- `profiles`;
- `predictions`;
- `prediction_entries`.

Le letture dei risultati e della classifica sono filtrate secondo il contesto utente/lega previsto dal codice e dalle policy.

### RPC utilizzate dal frontend

- `create_league`;
- `join_league`;
- `get_league_members`;
- `submit_prediction`.

### RPC/server-side operative

- `score_prediction` è richiamata dallo script di scoring storico e non dal bundle client.
- `apply_prediction_carry_over` è richiamata dal worker API via REST ogni 60 secondi.

Il corpo SQL reale di `score_prediction` non è incluso nel repository e non è stato recuperato durante questo audit.

### Migration e RLS presenti nel repository

- `supabase/migrations/20260820122000_fix_qualifying_time_points.sql`;
- `supabase/migrations/20260902090000_prediction_carry_over.sql`;
- `supabase/migrations/20260903120000_league_scoped_score_read_access.sql`;
- `supabase/verification/task-41-policy-and-score-audit.sql`.

La migration league-scoped contiene preflight fail-closed, funzione `is_league_score_viewer_2026`, RLS/grant e policy SELECT limitate ai membri della lega. Le write policy sono dichiarate intatte. La verifica RLS disponibile nel repository è una query SQL manuale; non c'è un controllo automatico che la esegua nel deploy.

Non risultano Edge Functions, utilizzo Supabase Storage o canali Realtime nel codice. Il carry-over è un worker process-level del server API, non un cron esterno.

### Limiti e blocchi Supabase

- `DATABASE_URL` identifica il database PostgreSQL usato da Drizzle/Replit, distinto dal progetto Supabase.
- Il worker API corrente richiede la migration carry-over e l'RPC `apply_prediction_carry_over`; nei log disponibili è presente un HTTP 404 quando la funzione non è nello schema cache. Questo deve essere risolto nel target prima di considerare completo il deploy server.
- Il test di compatibilità schema live fallisce con HTTP 400/PostgREST `42703`: il codice seleziona `prediction_entries.source`, ma la colonna non esiste nello schema live osservato. Non sono state applicate correzioni in questo audit.
- Non esiste un canale PostgreSQL autorizzato per leggere direttamente catalogo RLS o corpo delle funzioni; la verifica live completa richiede accesso SQL separato.

## 7. Scoring, import e storico

### Specifica canonica

La specifica canonica è `scripts/historical-scoring-spec.mjs`. È offline e contiene:

- matrici Sprint/Gara;
- parsing dei tempi Excel;
- soglie Qualifica;
- bonus;
- semantica OUT/NC;
- malus cumulativi;
- mapping delle entry;
- aggregazione dei totali;
- funzione `scorePrediction`.

Il report `.agents/outputs/task-32-historical-scoring-spec.md` documenta il replay offline riuscito sui 10 casi obbligatori.

### Script principali

- `scripts/score-historical-predictions.mjs`;
- `scripts/task-37-scoring-apply-dry-run.mjs`;
- `scripts/task-38-excel-db-mapping.mjs`;
- `scripts/task-39-scoring-apply.mjs`;
- `scripts/audit-historical-scoring-task34.mjs`;
- `scripts/diagnose-task36-scoring.mjs`;
- `scripts/task-57-partial-malus-audit.mjs`;
- `scripts/validate-historical-excel-scoring-test01.mjs`;
- `scripts/import-historical-google-sheets.mjs`;
- `scripts/import-approved-google-history.mjs`;
- `scripts/import-historical-predictions-table.mjs`;
- `scripts/reconstruct-google-history.mjs`;
- `scripts/import-motogp-calendar-2026.mjs`;
- `scripts/import-motogp-roster-2026.mjs`;
- `scripts/import-motogp-results-2026.mjs`.

`score-historical-predictions.mjs` è dry-run per default; `--apply` è esplicito. Gli script di import/apply richiedono separazione rigorosa tra runtime web e credenziali amministrative.

### Report storici rilevanti

Sono presenti report per Task 30–39, Task 57, reverse engineering Excel, mapping Excel→DB, dry-run, apply controllato, audit parziali e risultati/import MotoGP. Questi report sono documentazione e non sostituiscono le migration o le credenziali del nuovo ambiente.

## 8. File Excel e Google Drive

- I workbook Excel originali non risultano presenti nel repository.
- I report fanno riferimento a workbook in `/tmp/fantamotogp-*.xlsx` e a materiale Google Drive/Sheets.
- I workbook sono materiale sorgente storico, non dipendenza necessaria al runtime dell'app.
- Gli Excel necessari per riprodurre o verificare gli import storici devono essere conservati separatamente, con accesso controllato.
- Non devono essere copiati o committati automaticamente perché possono contenere dati personali, prediction e dati storici sensibili.
- Gli script Google attuali dipendono dal connector OAuth Replit; fuori da Replit serve una sostituzione esplicita dell'autenticazione.

## 9. Build, typecheck, test e diff

### Typecheck/build

Comando eseguito:

```text
PORT=21367 BASE_PATH=/ pnpm build
```

Esito: **PASS**.

Sono passati:

- typecheck delle librerie;
- typecheck API server;
- typecheck mockup;
- typecheck web;
- typecheck script;
- build mockup;
- build API server;
- build web.

La build web emette solo un warning non bloccante su chunk JavaScript oltre 500 kB. Gli output sono directory ignorate (`dist/`, build info).

### Test offline

Esito **PASS** per:

- `test-historical-scoring-spec.mjs`: casi obbligatori 10/10 e casi speciali;
- `test-score-historical-predictions.mjs`;
- `test-audit-historical-scoring-task34.mjs`;
- `test-task-57-partial-malus-audit.mjs`;
- `test-restarted-race.mjs`;
- `test-results-status.mjs`;
- `test-motogp-results-import-2026.mjs`.

### Test scoring read-only

La suite esistente `test:scoring` ha riportato 11 casi superati, 0 falliti e 1 saltato per assenza di fixture end-to-end. Il test usa la RPC `score_prediction` in modalità read-only per i casi di soglia.

Questo audit non ha eseguito apply, insert, update, delete o upsert. La RPC di scoring non deve essere rieseguita in una fase di migrazione senza autorizzazione esplicita.

### Test schema live

`test:results-schema` **FAIL**:

```text
HTTP 400
code 42703
column prediction_entries.source does not exist
```

Il test è read-only; non ha modificato il database. Il blocco va risolto o documentato prima del deploy fuori da Replit, perché evidenzia una divergenza tra il select frontend e lo schema Supabase live.

### Git diff

`git diff --check` e `git diff --cached --check`: **PASS**.

## 10. Requisiti per il deploy fuori da Replit

| Elemento | Presente | Necessario per deploy | Note |
|---|---:|---:|---|
| Node.js | Sì | Sì | Versione compatibile con Node 24 o versione supportata dal provider |
| pnpm | Sì | Sì | Il repository impone pnpm |
| Vite | Sì | Sì | Build della SPA |
| React | Sì | Sì | Bundle web |
| Supabase | Sì, esterno | Sì | Auth, dati, prediction, risultati e RPC |
| Environment variables | Nomi/config presenti | Sì | Impostare solo nei secret store del provider |
| Build command | `PORT=... BASE_PATH=... pnpm build` | Sì | Il provider deve fornire `PORT` e `BASE_PATH`, oppure la config va resa portabile |
| Output directory | `artifacts/my-first-app/dist/public` | Sì | Servire come directory statica |
| SPA routing | Rewrite `/*` → `/index.html` già descritto | Sì | Configurare fallback nel provider esterno |
| Server functions | API Express presente | Solo per comportamento completo | Servire l'API separatamente o tramite reverse proxy `/api` |
| Cron/job | Worker `setInterval` nel server API | Solo per carry-over | Mantenere un processo sempre attivo o trasferirlo a un job scheduler |
| PostgreSQL/Drizzle | `lib/db` presente | Solo se usato dall'API target | Fornire `DATABASE_URL` compatibile oppure rimuovere/isolaro il percorso non usato |
| Google Drive/Sheets | Script presenti | Solo per import storici | Sostituire connector Replit con OAuth/service account esterno |

### Valutazione SPA vs server-side

La pagina web può essere pubblicata come SPA statica collegata direttamente a Supabase. Per mantenere il comportamento completo attuale servono però:

1. il server API Express;
2. il worker carry-over;
3. la migration/RPC `apply_prediction_carry_over` nel progetto Supabase target;
4. le variabili server-side, inclusa la service role key;
5. eventuale PostgreSQL richiesto dal package `lib/db`;
6. una soluzione esterna per gli script Google Drive/Sheets, se gli import storici devono restare disponibili.

La service role key non deve essere inserita nel bundle Vite o in variabili `VITE_*`.

## 11. Problemi e blocchi

1. `main` è avanti di un commit rispetto a `origin/main`: la pubblicazione del commit non è stata fatta.
2. Sono presenti molti remote e branch `subrepl-*` Replit: serve una decisione su quali mantenere prima di una migrazione organizzativa.
3. `.gitignore` non contiene esplicitamente `.env` e `.env.*`; oggi non sono stati trovati file env tracciati, ma questa è una lacuna preventiva di sicurezza.
4. Il test schema live rileva `prediction_entries.source` mancante.
5. Il worker API dipende da `apply_prediction_carry_over`, che deve esistere nello schema cache del Supabase target.
6. Il corpo reale di `score_prediction` non è nel repository.
7. I connector Google dipendono da Replit e non sono portabili automaticamente.
8. `PORT` e `BASE_PATH` sono obbligatori nei config Vite attuali; un deploy esterno deve fornirli o adattare la configurazione.
9. Il bundle frontend ha un chunk oltre 500 kB; non blocca il deploy, ma può essere ottimizzato con code splitting.
10. Gli Excel storici non sono nel repository e devono restare fuori dal commit salvo decisione separata.
11. Il deployment completo non è certificabile soltanto come static hosting finché non viene definita la destinazione dell'API server e del worker.

## 12. Piano di migrazione consigliato

Il piano seguente è solo raccomandato; non è stato eseguito.

1. Congelare un checkpoint e decidere se il commit locale `be6ce41` deve essere pubblicato su GitHub.
2. Ridurre e documentare i remote/branch Replit senza cancellazioni automatiche.
3. Aggiungere regole preventive per `.env`, `.env.*`, secret locali e file Excel sensibili; farlo in una fase separata con approvazione.
4. Creare una pipeline GitHub Actions che installi con pnpm, esegua typecheck, build e test offline.
5. Scegliere hosting SPA con fallback `index.html` e configurare `artifacts/my-first-app/dist/public`.
6. Scegliere hosting Node per `artifacts/api-server` oppure trasferire il solo carry-over a un job/scheduler esterno.
7. Configurare nel nuovo secret store solo i nomi env necessari, separando rigorosamente client e server.
8. Applicare e verificare le migration Supabase in ordine, incluso carry-over e RLS league-scoped, senza usare la service role key nel client.
9. Risolvere la divergenza `prediction_entries.source` prima di dichiarare compatibile il frontend con lo schema live.
10. Sostituire `@replit/connectors-sdk` per gli import Google oppure dichiarare gli import storici come processo manuale separato.
11. Conservare Excel e report storici in storage privato/versionato separato, non nel bundle pubblico.
12. Eseguire un test autenticato end-to-end in un ambiente isolato solo dopo aver preparato cleanup affidabile e approvazione esplicita.
13. Solo dopo la checklist finale, collegare il remote GitHub al provider e fare il primo deploy controllato.

## 13. Checklist finale pre-migrazione

- [ ] Confermare il commit locale da pubblicare e il branch GitHub di destinazione.
- [ ] Rimuovere o documentare i remote/branch Replit non necessari.
- [ ] Verificare che `.env`, `.env.*`, secret e credenziali non siano tracciati.
- [ ] Separare client env (`VITE_*`) e server env.
- [ ] Definire il provider SPA e il rewrite `/*` → `/index.html`.
- [ ] Definire il provider/processo API e il path `/api`.
- [ ] Definire come viene eseguito il carry-over ogni 60 secondi.
- [ ] Fornire `DATABASE_URL` se l'API continua a usare Drizzle/PostgreSQL.
- [ ] Applicare/verificare le migration Supabase target.
- [ ] Verificare che `apply_prediction_carry_over` sia presente nello schema cache.
- [ ] Risolvere il test `prediction_entries.source`.
- [ ] Recuperare una verifica autorizzata del catalogo RLS e delle funzioni SQL.
- [ ] Decidere la sostituzione dei connector Google.
- [ ] Conservare separatamente workbook Excel e dati storici.
- [ ] Ripetere typecheck, build e test offline in CI.
- [ ] Eseguire test autenticato isolato e verificare il cleanup.
- [ ] Fare deploy soltanto dopo approvazione esplicita.

## Contabilità delle operazioni

- **FILE MODIFICATI:** nessun file di codice/configurazione/dati; creato esclusivamente il report richiesto `.agents/outputs/task-44-replit-to-github-audit.md`.
- **SCRITTURE SUPABASE:** 0.
- **RPC DI SCORING:** 0 scritture/modifiche; la suite read-only esistente ha eseguito verifiche di soglia tramite `score_prediction`, senza modifiche dati.
- **INSERT/UPDATE/DELETE/UPSERT:** 0.
- **GIT PUSH:** 0.
- **DEPLOY:** 0.

La migrazione non è stata eseguita. Si attende l'approvazione esplicita prima di qualsiasi modifica o operazione di pubblicazione.