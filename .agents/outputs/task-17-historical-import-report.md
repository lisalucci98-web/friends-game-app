# Task #17 — Verifica e completamento import storico TARGET

> Operazione eseguita con preflight read-only, piano documentato prima della scrittura e import idempotente. L’indirizzo dell’account target non è riportato in questo documento.

## Esito

- Account target: **TARGET**
- Profilo Supabase: **id 5**
- Lega target: **FantaTest**
- Stagione app: **2026**
- Prediction target prima dell’import: **11**
- Entry target prima dell’import: **121**
- Prediction storiche deterministiche dopo l’import: **11**
- Prediction storiche nuove create in questo Task: **1**
- Prediction storiche già presenti e saltate: **10**
- Entry storiche dopo l’import: **121**
- GP/sessioni storici complessivi importati: **11 GP / 33 sessioni**
- Punteggio storico aggregato conservato: **178**

Il Task 15 aveva già importato 10 GP storici. Questo Task ha aggiunto soltanto il GP UK, già autorizzato, completo, appartenente al 2026 e non presente prima.

## Verifica preliminare obbligatoria

La verifica read-only ha identificato un solo account target, un solo profilo e una sola lega. Prima della scrittura sono state lette le prediction target, le entry, i GP associati, i punteggi, `scored_at`, `created_at` e la forma delle entry.

### Prediction già presenti prima dell’import

| GP | Prediction ID | Origine verificata | Entry | Q | Sprint | Gara | Totale | Created at | Azione |
|---|---|---|---:|---:|---:|---:|---:|---|---|
| San Marino | `a24c434a-17ff-45e6-a008-64dce2e5b634` | ID non deterministico; nessun marker storico | 11 | 0 | 0 | 0 | 0 | 2026-09-01 11:18:12Z | PRESERVA |
| Aragon | `24ab1b38-0fe7-5d61-9272-3998401157cc` | ID deterministico storico | 11 | 5 | 5 | 14 | 24 | 2026-09-01 12:44:16Z | SALTA |
| Catalogna | `7830cb54-8d02-5618-9d96-0e7756a5b1a0` | ID deterministico storico | 11 | 1 | 2 | 2 | 5 | 2026-09-01 12:44:16Z | SALTA |
| Germania | `04eedd26-a8e1-5365-bcb8-2a77a6d5309b` | ID deterministico storico | 11 | 8 | 4 | 10 | 22 | 2026-09-01 12:44:16Z | SALTA |
| Italia | `ff38daa7-d3ef-525d-b4e8-2d6a7c8501ae` | ID deterministico storico | 11 | 1 | 1 | 14 | 16 | 2026-09-01 12:44:16Z | SALTA |
| Netherlands | `014480b4-4bb9-50fa-bd8c-b2d5ce1d6c09` | ID deterministico storico | 11 | 1 | 1 | 11 | 13 | 2026-09-01 12:44:16Z | SALTA |
| Repubblica Ceca | `02b3d6f6-db00-5b64-8557-5323323343af` | ID deterministico storico | 11 | 0 | 2 | 15 | 17 | 2026-09-01 12:44:16Z | SALTA |
| Spagna | `2c90c751-4587-595b-9cb9-6d01cae55d02` | ID deterministico storico | 11 | 0 | 3 | 9 | 12 | 2026-09-01 12:44:16Z | SALTA |
| Ungheria | `722b8ed5-c501-5d02-8f50-92a2ed3a1127` | ID deterministico storico | 11 | 3 | 2 | 11 | 16 | 2026-09-01 12:44:16Z | SALTA |
| USA | `5f11d5c3-3ad5-5c9a-a674-10500315ce76` | ID deterministico storico | 11 | 1 | 0 | 16 | 17 | 2026-09-01 12:44:16Z | SALTA |
| Francia | `08fedd41-b194-55fd-9163-1e65620fc093` | ID deterministico storico | 11 | 3 | 2 | 13 | 18 | 2026-09-01 12:44:16Z | SALTA |

Ogni prediction storica deterministica già presente aveva 11 entry nella forma:

- 1 `QUALIFYING_TIME`;
- 1 `POLE`;
- 3 `SPRINT`;
- 5 `RACE`;
- 1 `RACE_OUT`.

Le entry avevano `points=0`; i punteggi storici sono stati conservati nei campi aggregati della prediction. Nessun record esistente è stato sovrascritto.

La prediction San Marino è stata lasciata invariata perché condivide il GP ma non possiede l’ID deterministico dell’import storico e non presenta un marker di origine. Non è stata classificata automaticamente come storico Google.

## Piano risultante prima della scrittura

Il preflight ha prodotto 11 record storici con match univoco e 33 sessioni logiche:

- **10 record già presenti**: Aragon, Catalogna, Francia, Germania, Italia, Netherlands, Repubblica Ceca, Spagna, Ungheria e USA — da saltare;
- **1 record mancante e autorizzato**: UK — da creare;
- nessuna modifica a San Marino;
- tutti gli altri GP esclusi o bloccati per i motivi riportati sotto.

Il piano è stato salvato prima della scrittura in `.agents/outputs/task-17-preflight.md`.

## Prediction nuova creata

| GP | App GP ID | Prediction ID | Entry | Q | Sprint | Gara | Totale | Stato |
|---|---|---|---|---:|---:|---:|---:|---|
| UK / Great Britain | `6a16e0cb-ef4b-44b1-92e5-2e958cca0815` | `b791a713-b510-5c5f-9940-6f9bfaa65a0a` | 11 | 3 | 3 | 12 | 18 | CREATA |

Dettaglio verificato dopo la scrittura:

- stagione: `e88b4e43-2209-47aa-8e83-0e0b1cedde6e`;
- tempo Qualifica: **116.354 secondi** (`01:56.354`);
- Pole: Bezzecchi;
- Sprint: Fernandez / Ogura / Di Giannantonio;
- Gara: Ogura / Martin / Bezzecchi / Fernandez / Di Giannantonio;
- `RACE_OUT`: Mir;
- entry: 1 Qualifying Time, 1 Pole, 3 Sprint, 5 Race, 1 Race Out;
- `points` delle entry: **0**;
- `scored_at`: **null**;
- origine: verificata tramite ID deterministico dell’import; non esiste una colonna marker separata.

## Prediction già presenti e saltate

Sono state riconosciute tramite la stessa chiave deterministica e lasciate invariate:

**Aragon, Catalogna, Francia, Germania, Italia, Netherlands, Repubblica Ceca, Spagna, Ungheria e USA.**

La seconda esecuzione idempotente ha confermato che non vengono creati duplicati né modificate le prediction esistenti.

## GP/sessioni esclusi

| GP | Sessioni | Motivo |
|---|---|---|
| Argentina | tutte | Non presente nel calendario 2026 dell’app. |
| Brasile | Qualifica | Tempo Qualifica non valido/mancante nel dato storico. |
| Indonesia | Sprint | Sprint mancante nel dato storico. |
| San Marino | Qualifica | Tempo Qualifica non valido/mancante; la prediction già presente non è stata toccata. |
| Qatar | tutte | Conflitto tra riepiloghi aggregate. |
| Thailandia | tutte | Conflitto tra riepiloghi aggregate. |
| Australia | tutte | Record Google datato 2025; non associato automaticamente al GP app 2026. |
| Austria | tutte | Record Google datato 2025; non associato automaticamente al GP app 2026. |
| Giappone | tutte | Record Google datato 2025; non associato automaticamente al GP app 2026. |
| Malesia | tutte | Record Google datato 2025; non associato automaticamente al GP app 2026. |
| Portogallo | tutte | Record Google datato 2025; non associato automaticamente al GP app 2026. |
| Valencia | tutte | Record Google datato 2025; non associato automaticamente al GP app 2026. |

Questi casi restano disponibili per un eventuale flusso separato con stagione 2025. Non sono stati importati in GP 2026 soltanto per somiglianza del nome.

## Conteggi prima/dopo

| Controllo | Prima | Dopo prima esecuzione | Dopo riesecuzione idempotente |
|---|---:|---:|---:|
| Prediction complessive TARGET | 11 | 12 | 12 |
| Entry complessive TARGET | 121 | 132 | 132 |
| Prediction storiche deterministiche | 10 | 11 | 11 |
| Entry delle prediction storiche | 110 | 121 | 121 |
| Nuove prediction nella riesecuzione | — | — | 0 |
| Nuove entry nella riesecuzione | — | — | 0 |

La verifica delle chiavi naturali `(user_id, grand_prix_id, league_id)` ha restituito **0 duplicati**.

I report operativi intermedi sono:

- `.agents/outputs/task-17-preflight.md`;
- `.agents/outputs/task-17-import-execution.md`;
- `.agents/outputs/task-17-idempotence-check.md`.

## Ambiguità residue

- I nove GP del 2025 con omonimo GP nel calendario 2026 hanno un candidato nominale ma non una corrispondenza certa di stagione.
- La prediction San Marino preesistente non contiene un marker storico esplicito; è stata conservata e separata dall’import.
- I punteggi individuali delle entry restano `0`, come previsto dal modello d’import; i valori `HISTORICAL_SCORE` sono conservati nei campi aggregati Qualifica/Sprint/Gara/Totale senza ricalcolo.

## Vincoli e sicurezza

- Prediction di TARGET create: **1**
- Prediction di TARGET modificate: **0**
- Prediction di altri utenti modificate: **0**
- Prediction esistenti sovrascritte: **0**
- GP modificati: **0**
- Piloti modificati: **0**
- Scoring o RPC modificati/invocati: **0**
- RLS o migration modificate: **0**
- Risultati ufficiali MotoGP modificati: **0**
- Google Sheets modificati: **0**
- Secret/token stampati nei log: **0**

## Validazione finale

- `node --check scripts/import-approved-google-history.mjs`: **PASS**
- `node --check scripts/reconstruct-google-history.mjs`: **PASS**
- parsing e controlli del mapping/report: **PASS**
- `pnpm run typecheck`: **PASS**
- `PORT=5000 BASE_PATH=/mockup-sandbox pnpm run build`: **PASS**
- `git diff --check`: **PASS**
- workflow web, API e mockup: **RUNNING**