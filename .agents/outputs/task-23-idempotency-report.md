# Task 23 — Import storico Google Sheets

- Modalità: **IMPORT COMPLETATO**
- Account target verificato: **SÌ, match univoco**
- Profilo target verificato: **SÌ** (profilo 6)
- Lega: **FantaTest**

## Riepilogo

- Spreadsheet analizzati: **25**
- Tab analizzati: **166**
- Tab con record TARGET: **60**
- GP identificati: **23**
- Prediction trovate: **60**
- GP completi: **13**
- GP parziali: **8**
- Conflitti: **2**
- GP importabili: **7**
- Prediction già esistenti: **7**
- Prediction nuove importate: **0**
- Entry nuove importate: **0**
- Punti storici caricati: **0**

## Mapping verificato prima della scrittura

| GP Google | Data sorgente | Codice | GP app | Data app | Circuito | Match | Esito |
|---|---|---|---|---|---|---:|---|
| Aragon | 2026-08-29 | ARA | GRAND PRIX OF ARAGON | 2026-08-28 | MotorLand Aragón | 1 | ESCLUSO — sorgente DATE_REVIEW |
| Argentina | 2025-03-15, 2025-03-15, 2025-03-16 | ARG | — | — | — | 0 | ESCLUSO — nessun GP 2025 con date corrispondenti nell’app |
| Australia | 2025-10-17, 2025-10-18, 2025-10-26 | AUS | — | — | — | 0 | ESCLUSO — nessun GP 2025 con date corrispondenti nell’app |
| Austria | 2025-08-16, 2025-08-16, 2025-08-17 | AUT | — | — | — | 0 | ESCLUSO — sorgente PARTIAL |
| Brasile | 2026-03-21, 2026-03-21, 2026-03-22 | BRA | GRAND PRIX OF BRAZIL | 2026-03-20 | Autódromo Internacional de Goiânia - Ayrton Senna | 1 | ALREADY_EXISTS — nessuna scrittura |
| Catalogna | 2026-05-16, 2026-05-16, 2026-05-17 | CAT | GRAND PRIX OF CATALONIA | 2026-05-15 | Circuit de Barcelona-Catalunya | 1 | ALREADY_EXISTS — nessuna scrittura |
| FRANCIA | 2025-05-10, 2025-05-10, 2026-05-10 | FRA | — | — | — | 0 | ESCLUSO — sorgente DATE_REVIEW |
| Germany | 2026-07-11, 2026-07-11, 2025-07-13 | GER | — | — | — | 0 | ESCLUSO — sorgente DATE_REVIEW |
| Giappone | 2025-09-28 | JPN | — | — | — | 0 | ESCLUSO — sorgente DATE_REVIEW |
| Indonesia | 2025-10-04 | INA | — | — | — | 0 | ESCLUSO — sorgente DATE_REVIEW |
| Italia | 2026-05-30, 2026-05-30 | ITA | GRAND PRIX OF ITALY | 2026-05-29 | Autodromo Internazionale del Mugello | 1 | ESCLUSO — sorgente DATE_REVIEW |
| Malesia | 2025-10-24, 2025-10-25 | MAL | — | — | — | 0 | ESCLUSO — sorgente DATE_REVIEW |
| Netherlands | 2026-06-28 | NED | GRAND PRIX OF THE NETHERLANDS | 2026-06-26 | TT Circuit Assen | 1 | ESCLUSO — sorgente DATE_REVIEW |
| Portogallo | 2025-11-08, 2025-11-08, 2025-11-09 | POR | — | — | — | 0 | ESCLUSO — nessun GP 2025 con date corrispondenti nell’app |
| QATAR | 2025-04-12, 2025-04-12, 2025-04-13 | QAT | — | — | — | 0 | ESCLUSO — sorgente AGGREGATE_CONFLICT |
| Repubblica Ceca | 2026-06-20, 2026-06-20, 2026-06-21 | CZE | GRAND PRIX OF CZECHIA | 2026-06-19 | CREDITAS Autodrom Brno | 1 | ALREADY_EXISTS — nessuna scrittura |
| San Marino | 2025-09-14 | RSM | — | — | — | 0 | ESCLUSO — sorgente DATE_REVIEW |
| SPAGNA | 2026-04-25, 2026-04-25, 2026-04-26 | SPA | GRAND PRIX OF SPAIN | 2026-04-24 | Circuito de Jerez - Ángel Nieto | 1 | ALREADY_EXISTS — nessuna scrittura |
| Thailandia | 2026-02-27, 2026-02-28, 2026-03-01 | THA | GRAND PRIX OF THAILAND | 2026-02-27 | Chang International Circuit | 1 | ESCLUSO — sorgente AGGREGATE_CONFLICT |
| UK | 2026-08-08, 2026-08-08, 2026-08-09 | GBR | GRAND PRIX OF GREAT BRITAIN | 2026-08-07 | Silverstone Circuit | 1 | ALREADY_EXISTS — nessuna scrittura |
| Ungheria | 2026-06-06, 2026-06-06, 2026-06-07 | HUN | GRAND PRIX OF HUNGARY | 2026-06-05 | Balaton Park Circuit | 1 | ALREADY_EXISTS — nessuna scrittura |
| USA | 2026-03-28, 2026-03-28, 2026-03-29 | USA | GRAND PRIX OF THE UNITED STATES | 2026-03-27 | Circuit Of The Americas | 1 | ALREADY_EXISTS — nessuna scrittura |
| Valencia | 2025-11-15, 2025-11-15, 2025-11-16 | VAL | — | — | — | 0 | ESCLUSO — nessun GP 2025 con date corrispondenti nell’app |

## GP importati

| GP | Qualifica | Sprint | Gara | Totale | Sessioni | Stato |
|---|---:|---:|---:|---:|---|---|
| Brasile | 0 | 6 | 12 | 18 | Qualifica, Sprint, Gara | ALREADY_EXISTS |
| Catalogna | 6 | 2 | 0 | 8 | Qualifica, Sprint, Gara | ALREADY_EXISTS |
| Repubblica Ceca | 3 | 3 | 8 | 14 | Qualifica, Sprint, Gara | ALREADY_EXISTS |
| SPAGNA | 5 | 3 | 11 | 19 | Qualifica, Sprint, Gara | ALREADY_EXISTS |
| UK | 5 | 9 | 8 | 22 | Qualifica, Sprint, Gara | ALREADY_EXISTS |
| Ungheria | 5 | 1 | 3 | 9 | Qualifica, Sprint, Gara | ALREADY_EXISTS |
| USA | 3 | 0 | 12 | 15 | Qualifica, Sprint, Gara | ALREADY_EXISTS |

## Tabella finale per GP

| GP | GP app ID | Qualifica | Sprint | Gara | OUT | Totale | Stato |
|---|---|---:|---:|---:|---|---:|---|
| Aragon | 23b7a561-17e4-4aa6-9be3-2529a5b69938 | — | — | — | — | — | REVIEW |
| Argentina | — | 10 | 5 | 15 | Pedro Acosta | 30 | EXCLUDED |
| Australia | — | 2 | 4 | 3 | Joan Mir | 9 | EXCLUDED |
| Austria | — | — | — | — | — | — | PARTIAL |
| Brasile | 738a8b22-f744-4c75-847b-a2565dce17de | 0 | 6 | 12 | Joan Mir | 18 | ALREADY_EXISTS |
| Catalogna | a0251657-afe5-4d90-a66f-d4779babd571 | 6 | 2 | 0 | Joan Mir | 8 | ALREADY_EXISTS |
| FRANCIA | — | — | — | — | — | — | REVIEW |
| Germany | — | — | — | — | — | — | REVIEW |
| Giappone | — | — | — | — | — | — | REVIEW |
| Indonesia | — | — | — | — | — | — | REVIEW |
| Italia | dd266adb-3930-4099-a3d1-a9807362f048 | — | — | — | — | — | REVIEW |
| Malesia | — | — | — | — | — | — | REVIEW |
| Netherlands | 83804cb1-a417-4213-b727-37f84b26d36e | — | — | — | — | — | REVIEW |
| Portogallo | — | 0 | 2 | 21 | Joan Mir | 23 | EXCLUDED |
| QATAR | — | — | — | — | — | — | CONFLICT |
| Repubblica Ceca | f9d2e80c-431b-485f-afcf-671950648ad7 | 3 | 3 | 8 | Joan Mir | 14 | ALREADY_EXISTS |
| San Marino | — | — | — | — | — | — | REVIEW |
| SPAGNA | 506917f4-179d-4e1d-b750-805c15bab8d7 | 5 | 3 | 11 | Joan Mir | 19 | ALREADY_EXISTS |
| Thailandia | f3fd8ba7-2966-46bd-8687-b92047f5e733 | — | — | — | — | — | CONFLICT |
| UK | 6a16e0cb-ef4b-44b1-92e5-2e958cca0815 | 5 | 9 | 8 | Joan Mir | 22 | ALREADY_EXISTS |
| Ungheria | 4bd780c9-9da4-48c6-a69f-ebfd6bf8a425 | 5 | 1 | 3 | Joan Mir | 9 | ALREADY_EXISTS |
| USA | 782c929d-faaf-44e2-9d6f-0fde033855be | 3 | 0 | 12 | Joan Mir | 15 | ALREADY_EXISTS |
| Valencia | — | 6 | 2 | 17 | Joan Mir | 25 | EXCLUDED |

## Conteggi

| Controllo | Prima | Dopo |
|---|---:|---:|
| Pronostici complessivi account target | 7 | 7 |
| Pronostici di questo import | 0 | 0 |
| Entry di questo import | 0 | 0 |

- Record prediction nuovi preparati: **0**
- Record prediction_entries nuovi preparati: **0**
- Prediction già presenti riconosciute: **7**
- Punti delle entry individuali: **0**; i punteggi storici approvati sono conservati nei campi aggregati Qualifica/Sprint/Gara/Totale senza inventare una distribuzione.
- Scoring/RPC invocati o modificati: **NO**
- Dati ufficiali MotoGP modificati: **NO**
- Pronostici di altri utenti modificati: **NO**
- Database modificato: **NO**
- Prediction create: **0**
- Prediction modificate: **0**
- Entry create: **0**
- Prediction esistenti sovrascritte: **0**
- RPC modificate: **NO**
- RLS modificate: **NO**
- Scoring modificato: **NO**
- Google Sheets modificato: **NO**
- Token/credenziali salvati o stampati: **NO**

## Esclusi

- **Aragon** — sorgente DATE_REVIEW.
- **Argentina** — nessun GP 2025 con date corrispondenti nell’app.
- **Australia** — nessun GP 2025 con date corrispondenti nell’app.
- **Austria** — sorgente PARTIAL.
- **FRANCIA** — sorgente DATE_REVIEW.
- **Germany** — sorgente DATE_REVIEW.
- **Giappone** — sorgente DATE_REVIEW.
- **Indonesia** — sorgente DATE_REVIEW.
- **Italia** — sorgente DATE_REVIEW.
- **Malesia** — sorgente DATE_REVIEW.
- **Netherlands** — sorgente DATE_REVIEW.
- **Portogallo** — nessun GP 2025 con date corrispondenti nell’app.
- **QATAR** — sorgente AGGREGATE_CONFLICT.
- **San Marino** — sorgente DATE_REVIEW.
- **Thailandia** — sorgente AGGREGATE_CONFLICT.
- **Valencia** — nessun GP 2025 con date corrispondenti nell’app.

