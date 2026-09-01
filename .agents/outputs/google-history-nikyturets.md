# Task #22 — Ricostruzione completa storico Google Sheets

> Analisi esclusivamente read-only. Il partecipante è indicato come `TARGET`; l’indirizzo email usato per il filtro non viene salvato nel report.

- Spreadsheet analizzati: **25**
- Tab analizzati: **166**
- Tab con record TARGET: **68**
- GP identificati: **23**
- Pronostici TARGET trovati: **68**
- GP completi: **18**
- GP parziali: **3**
- Duplicati/multiple submissions: **0**
- Conflitti tra riepiloghi aggregate: **2**
- GP con matching certo: **0**
- GP da verificare: **23**
- GP dell’app/database disponibili per il matching: **0**; tutti i match sono `REVIEW` perché la lettura read-only non ha restituito identificativi GP.

## Riepilogo

| GP | Qualifica | Tempo Pole | Sprint | Gara | OUT | Totale | Stato |
|---|---|---|---:|---:|---|---:|---|
| Aragon | M. Marquez | 01:45.128 | 5 | 14 | J. Mir | 24 | OK |
| Argentina | Marc Marquez | 01:37.199 | 9 | 15 | Johann Zarco | 30 | OK |
| Australia | Marco Bezzecchi | 01:26.120 | 4 | 11 | Joan Mir | 18 | OK |
| Austria | Marc Marquez | 01:27.650 | 6 | 11 | Joan Mir | 18 | OK |
| Brasile | M. Marquez | 01:17:850 | 6 | 19 | B. Binder | 25 | PARTIAL |
| Catalogna | A. Marquez | 01:37.628 | 2 | 2 | J. Martin | 5 | OK |
| FRANCIA | F. Di Giannantonio | 01:29.430 | 2 | 13 | J. Mir | 18 | OK |
| Germany | M. Marquez | 01:19.195 | 4 | 10 | J. Mir | 22 | OK |
| Giappone | Marco Bezzecchi | 01:42.902 | 5 | 23 | Joan Mir | 38 | OK |
| Indonesia | Francesco Bagnaia | 01:20.345 | — | 6 | Joan Mir | 6 | PARTIAL |
| Italia | F. Di Giannantonio | 01:44.247 | 1 | 14 | J. Mir | 16 | OK |
| Malesia | Fabio Quartararo | 01:56.500 | 6 | 5 | Pedro Acosta | 12 | OK |
| Netherlands | M. Bezzecchi | 01:30.450 | 1 | 11 | B. Binder | 13 | OK |
| Portogallo | Alex Marquez | 01:37.950 | 2 | 16 | Joan Mir | 19 | OK |
| QATAR | Marc Marquez | 01:50.523 | 9 | 13 | Jack Miller | — | AGGREGATE_CONFLICT |
| Repubblica Ceca | M. Marquez | 01:52.000 | 2 | 15 | J. Mir | 17 | OK |
| San Marino | Marc Marquez | 01:29:939 | 4 | 26 | Pedro Acosta | 33 | PARTIAL |
| SPAGNA | F. Di Giannantonio | 01:35.610 | 3 | 9 | J. Miller | 12 | OK |
| Thailandia | M. Bezzecchi | 01:28.526 | 3 | 10 | J. Mir | — | AGGREGATE_CONFLICT |
| UK | M. Bezzecchi | 01:56.354 | 3 | 12 | J. Mir | 18 | OK |
| Ungheria | P. Acosta | 01:36.500 | 2 | 11 | J. Mir | 16 | OK |
| USA | M. Marquez | 02:00.500 | 0 | 16 | J. Zarco | 17 | OK |
| Valencia | Marco Bezzecchi | 01:28.788 | 2 | 12 | Joan Mir | 24 | OK |

## Mappatura Google Sheet / Tab → GP → GP app

| Spreadsheet / Tab | GP riconosciuto | GP app | Match |
|---|---|---|---|
| Aragon / Risposte del modulo 1 | Aragon | UNKNOWN | REVIEW |
| Aragon / Risposte del modulo 2 | Aragon | UNKNOWN | REVIEW |
| Aragon / Risposte del modulo 3 | Aragon | UNKNOWN | REVIEW |
| Argentina / Risposte del modulo 5 | Argentina | UNKNOWN | REVIEW |
| Argentina / Risposte del modulo 2 | Argentina | UNKNOWN | REVIEW |
| Argentina / Risposte del modulo 3 | Argentina | UNKNOWN | REVIEW |
| Australia / Risposte del modulo 1 | Australia | UNKNOWN | REVIEW |
| Australia / Risposte del modulo 2 | Australia | UNKNOWN | REVIEW |
| Australia / Risposte del modulo 3 | Australia | UNKNOWN | REVIEW |
| Austria / Risposte del modulo 1 | Austria | UNKNOWN | REVIEW |
| Austria / Risposte del modulo 2 | Austria | UNKNOWN | REVIEW |
| Austria / Risposte del modulo 3 | Austria | UNKNOWN | REVIEW |
| Brasile / Risposte del modulo 1 | Brasile | UNKNOWN | REVIEW |
| Brasile / Risposte del modulo 2 | Brasile | UNKNOWN | REVIEW |
| Brasile / Risposte del modulo 3 | Brasile | UNKNOWN | REVIEW |
| Catalogna / Risposte del modulo 1 | Catalogna | UNKNOWN | REVIEW |
| Catalogna / Risposte del modulo 2 | Catalogna | UNKNOWN | REVIEW |
| Catalogna / Risposte del modulo 3 | Catalogna | UNKNOWN | REVIEW |
| FRANCIA / Risposte del modulo 1 | FRANCIA | UNKNOWN | REVIEW |
| FRANCIA / Risposte del modulo 2 | FRANCIA | UNKNOWN | REVIEW |
| FRANCIA / Risposte del modulo 3 | FRANCIA | UNKNOWN | REVIEW |
| Germany / Risposte del modulo 1 | Germany | UNKNOWN | REVIEW |
| Germany / Risposte del modulo 2 | Germany | UNKNOWN | REVIEW |
| Germany / Risposte del modulo 3 | Germany | UNKNOWN | REVIEW |
| Giappone / Risposte del modulo 1 | Giappone | UNKNOWN | REVIEW |
| Giappone / Risposte del modulo 2 | Giappone | UNKNOWN | REVIEW |
| Giappone / Risposte del modulo 3 | Giappone | UNKNOWN | REVIEW |
| Indonesia / Risposte del modulo 1 | Indonesia | UNKNOWN | REVIEW |
| Indonesia / Risposte del modulo 3 | Indonesia | UNKNOWN | REVIEW |
| Italia / Risposte del modulo 1 | Italia | UNKNOWN | REVIEW |
| Italia / Risposte del modulo 2 | Italia | UNKNOWN | REVIEW |
| Italia / Risposte del modulo 3 | Italia | UNKNOWN | REVIEW |
| Malesia / Risposte del modulo 1 | Malesia | UNKNOWN | REVIEW |
| Malesia / Risposte del modulo 2 | Malesia | UNKNOWN | REVIEW |
| Malesia / Risposte del modulo 3 | Malesia | UNKNOWN | REVIEW |
| Netherlands / Risposte del modulo 1 | Netherlands | UNKNOWN | REVIEW |
| Netherlands / Risposte del modulo 2 | Netherlands | UNKNOWN | REVIEW |
| Netherlands / Risposte del modulo 3 | Netherlands | UNKNOWN | REVIEW |
| Portogallo / Risposte del modulo 1 | Portogallo | UNKNOWN | REVIEW |
| Portogallo / Risposte del modulo 2 | Portogallo | UNKNOWN | REVIEW |
| Portogallo / Risposte del modulo 3 | Portogallo | UNKNOWN | REVIEW |
| QATAR / Risposte del modulo 1 | QATAR | UNKNOWN | REVIEW |
| QATAR / Risposte del modulo 2 | QATAR | UNKNOWN | REVIEW |
| QATAR / Risposte del modulo 3 | QATAR | UNKNOWN | REVIEW |
| Repubblica Ceca / Risposte del modulo 1 | Repubblica Ceca | UNKNOWN | REVIEW |
| Repubblica Ceca / Risposte del modulo 2 | Repubblica Ceca | UNKNOWN | REVIEW |
| Repubblica Ceca / Risposte del modulo 3 | Repubblica Ceca | UNKNOWN | REVIEW |
| San Marino / Risposte del modulo 1 | San Marino | UNKNOWN | REVIEW |
| San Marino / Risposte del modulo 2 | San Marino | UNKNOWN | REVIEW |
| San Marino / Risposte del modulo 3 | San Marino | UNKNOWN | REVIEW |
| SPAGNA / Risposte del modulo 1 | SPAGNA | UNKNOWN | REVIEW |
| SPAGNA / Risposte del modulo 2 | SPAGNA | UNKNOWN | REVIEW |
| SPAGNA / Risposte del modulo 3 | SPAGNA | UNKNOWN | REVIEW |
| Thailandia / Risposte del modulo 1 | Thailandia | UNKNOWN | REVIEW |
| Thailandia / Risposte del modulo 2 | Thailandia | UNKNOWN | REVIEW |
| Thailandia / Risposte del modulo 3 | Thailandia | UNKNOWN | REVIEW |
| UK / Risposte del modulo 1 | UK | UNKNOWN | REVIEW |
| UK / Risposte del modulo 2 | UK | UNKNOWN | REVIEW |
| UK / Risposte del modulo 3 | UK | UNKNOWN | REVIEW |
| Ungheria / Risposte del modulo 1 | Ungheria | UNKNOWN | REVIEW |
| Ungheria / Risposte del modulo 2 | Ungheria | UNKNOWN | REVIEW |
| Ungheria / Risposte del modulo 3 | Ungheria | UNKNOWN | REVIEW |
| USA / Risposte del modulo 1 | USA | UNKNOWN | REVIEW |
| USA / Risposte del modulo 2 | USA | UNKNOWN | REVIEW |
| USA / Risposte del modulo 3 | USA | UNKNOWN | REVIEW |
| Valencia / Risposte del modulo 1 | Valencia | UNKNOWN | REVIEW |
| Valencia / Risposte del modulo 2 | Valencia | UNKNOWN | REVIEW |
| Valencia / Risposte del modulo 3 | Valencia | UNKNOWN | REVIEW |

## Dettaglio per GP

### Aragon

- GP app: **UNKNOWN**
- MATCH_STATUS: **REVIEW**
- Stato ricostruzione: **OK**
- Qualifica: **OK**
  - Pole: M. Marquez; Tempo: 01:45.128; Time Conversion: 0,166; Score: 5 · timestamp: 29/08/2026 10.47.32 · origine: Aragon / Risposte del modulo 1 / riga 4
- Sprint: **OK**
  - Top: M. Marquez / M. Bezzecchi / A. Marquez; OUT: —; Score: 5 · timestamp: 29/08/2026 14.06.06 · origine: Aragon / Risposte del modulo 2 / riga 2
- Gara: **OK**
  - Top: M. Marquez / A. Marquez / M. Bezzecchi / J. Martin / F. Di Giannantonio; OUT: J. Mir; Score: 14 · timestamp: 29/08/2026 15.28.55 · origine: Aragon / Risposte del modulo 3 / riga 4
- HISTORICAL_SCORE riepilogo: Q=5, Sprint=5, Gara=14, Totale=24 · origine: CLASSIFICA / ARAGON / riga 3
- HISTORICAL_SCORE riepilogo: Q=5, Sprint=5, Gara=14, Totale=24 · origine: Aragon / CLASSIFICA / riga 3

### Argentina

- GP app: **UNKNOWN**
- MATCH_STATUS: **REVIEW**
- Stato ricostruzione: **OK**
- Qualifica: **OK**
  - Pole: Marc Marquez; Tempo: 01:37.199; Time Conversion: 0,282; Score: 6 · timestamp: 15/03/2025 7.36.27 · origine: Argentina / Risposte del modulo 5 / riga 6
- Sprint: **OK**
  - Top: Marc Marquez / Alex Marquez / Francesco Bagnaia; OUT: —; Score: 9 · timestamp: 15/03/2025 15.36.32 · origine: Argentina / Risposte del modulo 2 / riga 2
- Gara: **OK**
  - Top: Marc Marquez / Alex Marquez / Francesco Bagnaia / Fabio Di Giannantonio / Marco Bezzecchi; OUT: Johann Zarco; Score: 15 · timestamp: 16/03/2025 8.14.58 · origine: Argentina / Risposte del modulo 3 / riga 2
- HISTORICAL_SCORE riepilogo: Q=6, Sprint=9, Gara=15, Totale=30 · origine: Argentina / CLASSIFICA / riga 7

### Australia

- GP app: **UNKNOWN**
- MATCH_STATUS: **REVIEW**
- Stato ricostruzione: **OK**
- Qualifica: **OK**
  - Pole: Marco Bezzecchi; Tempo: 01:26.120; Time Conversion: 0,345; Score: 3 · timestamp: 17/10/2025 20.10.44 · origine: Australia / Risposte del modulo 1 / riga 7
- Sprint: **OK**
  - Top: Marco Bezzecchi / Fabio Quartararo / Raul Fernandez; OUT: —; Score: 4 · timestamp: 18/10/2025 3.01.07 · origine: Australia / Risposte del modulo 2 / riga 7
- Gara: **OK**
  - Top: Marco Bezzecchi / Raul Fernandez / Fabio Di Giannantonio / Pedro Acosta / Jack Miller; OUT: Joan Mir; Score: 11 · timestamp: 18/10/2025 19.31.05 · origine: Australia / Risposte del modulo 3 / riga 4
- HISTORICAL_SCORE riepilogo: Q=—, Sprint=—, Gara=—, Totale=— · origine: CLASSIFICA / Australia / riga 2
- HISTORICAL_SCORE riepilogo: Q=3, Sprint=4, Gara=11, Totale=18 · origine: Australia / CLASSIFICA / riga 2

### Austria

- GP app: **UNKNOWN**
- MATCH_STATUS: **REVIEW**
- Stato ricostruzione: **OK**
- Qualifica: **OK**
  - Pole: Marc Marquez; Tempo: 01:27.650; Time Conversion: 0,41; Score: 1 · timestamp: 16/08/2025 10.47.47 · origine: Austria / Risposte del modulo 1 / riga 4
- Sprint: **OK**
  - Top: Marc Marquez / Marco Bezzecchi / Pedro Acosta; OUT: —; Score: 6 · timestamp: 16/08/2025 12.04.06 · origine: Austria / Risposte del modulo 2 / riga 5
- Gara: **OK**
  - Top: Marc Marquez / Francesco Bagnaia / Alex Marquez / Pedro Acosta / Marco Bezzecchi; OUT: Joan Mir; Score: 11 · timestamp: 17/08/2025 9.14.36 · origine: Austria / Risposte del modulo 3 / riga 4
- HISTORICAL_SCORE riepilogo: Q=—, Sprint=—, Gara=—, Totale=— · origine: CLASSIFICA / Austria / riga 4
- HISTORICAL_SCORE riepilogo: Q=1, Sprint=6, Gara=11, Totale=18 · origine: Austria / CLASSIFICA / riga 4

### Brasile

- GP app: **UNKNOWN**
- MATCH_STATUS: **REVIEW**
- Stato ricostruzione: **PARTIAL**
- Qualifica: **MISSING**
  - Pole: M. Marquez; Tempo: 01:17:850; Time Conversion: 0,44; Score: 0 · timestamp: 20/03/2026 22.45.31 · origine: Brasile / Risposte del modulo 1 / riga 2
- Sprint: **OK**
  - Top: M. Marquez / M. Bezzecchi / J. Martin; OUT: —; Score: 6 · timestamp: 21/03/2026 18.16.07 · origine: Brasile / Risposte del modulo 2 / riga 2
- Gara: **OK**
  - Top: M. Marquez / M. Bezzecchi / F. Di Giannantonio / J. Martin / A. Ogura; OUT: B. Binder; Score: 19 · timestamp: 22/03/2026 12.10.55 · origine: Brasile / Risposte del modulo 3 / riga 2
- HISTORICAL_SCORE riepilogo: Q=0, Sprint=6, Gara=19, Totale=25 · origine: CLASSIFICA / BRASILE / riga 11
- HISTORICAL_SCORE riepilogo: Q=0, Sprint=6, Gara=19, Totale=25 · origine: Brasile / CLASSIFICA / riga 11

### Catalogna

- GP app: **UNKNOWN**
- MATCH_STATUS: **REVIEW**
- Stato ricostruzione: **OK**
- Qualifica: **OK**
  - Pole: A. Marquez; Tempo: 01:37.628; Time Conversion: 0,44; Score: 1 · timestamp: 15/05/2026 20.54.45 · origine: Catalogna / Risposte del modulo 1 / riga 5
- Sprint: **OK**
  - Top: P. Acosta / A. Marquez / R. Fernandez; OUT: —; Score: 2 · timestamp: 16/05/2026 12.08.38 · origine: Catalogna / Risposte del modulo 2 / riga 14
- Gara: **OK**
  - Top: A. Marquez / P. Acosta / F. Di Giannantonio / R. Fernandez / A. Ogura; OUT: J. Martin; Score: 2 · timestamp: 16/05/2026 16.14.39 · origine: Catalogna / Risposte del modulo 3 / riga 3
- HISTORICAL_SCORE riepilogo: Q=1, Sprint=2, Gara=2, Totale=5 · origine: CLASSIFICA / Catalogna / riga 2
- HISTORICAL_SCORE riepilogo: Q=1, Sprint=2, Gara=2, Totale=5 · origine: Catalogna / CLASSIFICA / riga 2

### FRANCIA

- GP app: **UNKNOWN**
- MATCH_STATUS: **REVIEW**
- Stato ricostruzione: **OK**
- Qualifica: **OK**
  - Pole: F. Di Giannantonio; Tempo: 01:29.430; Time Conversion: 0,204; Score: 3 · timestamp: 08/05/2026 21.17.45 · origine: FRANCIA / Risposte del modulo 1 / riga 6
- Sprint: **OK**
  - Top: M. Marquez / M. Bezzecchi / F. Bagnaia; OUT: —; Score: 2 · timestamp: 09/05/2026 14.36.31 · origine: FRANCIA / Risposte del modulo 2 / riga 5
- Gara: **OK**
  - Top: M. Bezzecchi / J. Martin / F. Bagnaia / P. Acosta / F. Di Giannantonio; OUT: J. Mir; Score: 13 · timestamp: 10/05/2026 13.05.11 · origine: FRANCIA / Risposte del modulo 3 / riga 7
- HISTORICAL_SCORE riepilogo: Q=3, Sprint=2, Gara=13, Totale=18 · origine: CLASSIFICA / FRANCIA / riga 3
- HISTORICAL_SCORE riepilogo: Q=3, Sprint=2, Gara=13, Totale=18 · origine: FRANCIA / CLASSIFICA / riga 3

### Germany

- GP app: **UNKNOWN**
- MATCH_STATUS: **REVIEW**
- Stato ricostruzione: **OK**
- Qualifica: **OK**
  - Pole: M. Marquez; Tempo: 01:19.195; Time Conversion: 0,154; Score: 8 · timestamp: 11/07/2026 10.44.55 · origine: Germany / Risposte del modulo 1 / riga 2
- Sprint: **OK**
  - Top: M. Marquez / R. Fernandez / A. Marquez; OUT: —; Score: 4 · timestamp: 11/07/2026 14.44.34 · origine: Germany / Risposte del modulo 2 / riga 5
- Gara: **OK**
  - Top: M. Marquez / F. Di Giannantonio / A. Ogura / A. Marquez / R. Fernandez; OUT: J. Mir; Score: 10 · timestamp: 12/07/2026 8.58.32 · origine: Germany / Risposte del modulo 3 / riga 2
- HISTORICAL_SCORE riepilogo: Q=8, Sprint=4, Gara=10, Totale=22 · origine: CLASSIFICA / GERMANY / riga 2
- HISTORICAL_SCORE riepilogo: Q=8, Sprint=4, Gara=10, Totale=22 · origine: Germany / CLASSIFICA / riga 2

### Giappone

- GP app: **UNKNOWN**
- MATCH_STATUS: **REVIEW**
- Stato ricostruzione: **OK**
- Qualifica: **OK**
  - Pole: Marco Bezzecchi; Tempo: 01:42.902; Time Conversion: 0,009; Score: 10 · timestamp: 26/09/2025 15.21.10 · origine: Giappone / Risposte del modulo 1 / riga 3
- Sprint: **OK**
  - Top: Marc Marquez / Francesco Bagnaia / Pedro Acosta; OUT: —; Score: 5 · timestamp: 27/09/2025 7.46.38 · origine: Giappone / Risposte del modulo 2 / riga 8
- Gara: **OK**
  - Top: Francesco Bagnaia / Marc Marquez / Pedro Acosta / Marco Bezzecchi / Franco Morbidelli; OUT: Joan Mir; Score: 23 · timestamp: 27/09/2025 17.22.00 · origine: Giappone / Risposte del modulo 3 / riga 5
- HISTORICAL_SCORE riepilogo: Q=—, Sprint=—, Gara=—, Totale=— · origine: CLASSIFICA / Giappone / riga 2
- HISTORICAL_SCORE riepilogo: Q=10, Sprint=5, Gara=23, Totale=38 · origine: Giappone / CLASSIFICA / riga 2

### Indonesia

- GP app: **UNKNOWN**
- MATCH_STATUS: **REVIEW**
- Stato ricostruzione: **PARTIAL**
- Qualifica: **OK**
  - Pole: Francesco Bagnaia; Tempo: 01:20.345; Time Conversion: 80,345; Score: 0 · timestamp: 01/10/2025 8.44.53 · origine: Indonesia / Risposte del modulo 1 / riga 3
- Sprint: **MISSING**
- Gara: **OK**
  - Top: Marco Bezzecchi / Fermin Aldeguer / Marc Marquez / Pedro Acosta / Alex Marquez; OUT: Joan Mir; Score: 6 · timestamp: 04/10/2025 20.47.15 · origine: Indonesia / Risposte del modulo 3 / riga 7
- HISTORICAL_SCORE riepilogo: Q=—, Sprint=—, Gara=—, Totale=— · origine: CLASSIFICA / Indonesia / riga 2
- HISTORICAL_SCORE riepilogo: Q=0, Sprint=0, Gara=6, Totale=6 · origine: Indonesia / CLASSIFICA / riga 2

### Italia

- GP app: **UNKNOWN**
- MATCH_STATUS: **REVIEW**
- Stato ricostruzione: **OK**
- Qualifica: **OK**
  - Pole: F. Di Giannantonio; Tempo: 01:44.247; Time Conversion: 0,326; Score: 1 · timestamp: 30/05/2026 10.00.35 · origine: Italia / Risposte del modulo 1 / riga 5
- Sprint: **OK**
  - Top: J. Martin / M. Marquez / F. Bagnaia; OUT: —; Score: 1 · timestamp: 30/05/2026 14.52.05 · origine: Italia / Risposte del modulo 2 / riga 6
- Gara: **OK**
  - Top: M. Bezzecchi / J. Martin / F. Di Giannantonio / R. Fernandez / A. Ogura; OUT: J. Mir; Score: 14 · timestamp: 30/05/2026 15.25.03 · origine: Italia / Risposte del modulo 3 / riga 3
- HISTORICAL_SCORE riepilogo: Q=1, Sprint=1, Gara=14, Totale=16 · origine: CLASSIFICA / ITALIA / riga 5
- HISTORICAL_SCORE riepilogo: Q=1, Sprint=1, Gara=14, Totale=16 · origine: Italia / CLASSIFICA / riga 5

### Malesia

- GP app: **UNKNOWN**
- MATCH_STATUS: **REVIEW**
- Stato ricostruzione: **OK**
- Qualifica: **OK**
  - Pole: Fabio Quartararo; Tempo: 01:56.500; Time Conversion: 0,501; Score: 1 · timestamp: 24/10/2025 14.24.28 · origine: Malesia / Risposte del modulo 1 / riga 3
- Sprint: **OK**
  - Top: Francesco Bagnaia / Alex Marquez / Franco Morbidelli; OUT: —; Score: 6 · timestamp: 25/10/2025 8.56.24 · origine: Malesia / Risposte del modulo 2 / riga 3
- Gara: **OK**
  - Top: Francesco Bagnaia / Alex Marquez / Fermin Aldeguer / Joan Mir / Marco Bezzecchi; OUT: Pedro Acosta; Score: 5 · timestamp: 25/10/2025 11.45.58 · origine: Malesia / Risposte del modulo 3 / riga 4
- HISTORICAL_SCORE riepilogo: Q=—, Sprint=—, Gara=—, Totale=— · origine: CLASSIFICA / Malesia / riga 2
- HISTORICAL_SCORE riepilogo: Q=1, Sprint=6, Gara=5, Totale=12 · origine: Malesia / CLASSIFICA / riga 2

### Netherlands

- GP app: **UNKNOWN**
- MATCH_STATUS: **REVIEW**
- Stato ricostruzione: **OK**
- Qualifica: **OK**
  - Pole: M. Bezzecchi; Tempo: 01:30.450; Time Conversion: 0,362; Score: 1 · timestamp: 27/06/2026 10.47.10 · origine: Netherlands / Risposte del modulo 1 / riga 2
- Sprint: **OK**
  - Top: J. Martin / M. Bezzecchi / A. Ogura; OUT: —; Score: 1 · timestamp: 27/06/2026 13.20.37 · origine: Netherlands / Risposte del modulo 2 / riga 2
- Gara: **OK**
  - Top: M. Bezzecchi / A. Ogura / R. Fernandez / J. Martin / F. Di Giannantonio; OUT: B. Binder; Score: 11 · timestamp: 27/06/2026 15.43.07 · origine: Netherlands / Risposte del modulo 3 / riga 5
- HISTORICAL_SCORE riepilogo: Q=1, Sprint=1, Gara=11, Totale=13 · origine: CLASSIFICA / NETHERLANDS / riga 6
- HISTORICAL_SCORE riepilogo: Q=1, Sprint=1, Gara=11, Totale=13 · origine: Netherlands / CLASSIFICA / riga 6

### Portogallo

- GP app: **UNKNOWN**
- MATCH_STATUS: **REVIEW**
- Stato ricostruzione: **OK**
- Qualifica: **OK**
  - Pole: Alex Marquez; Tempo: 01:37.950; Time Conversion: 0,394; Score: 1 · timestamp: 08/11/2025 11.52.06 · origine: Portogallo / Risposte del modulo 1 / riga 3
- Sprint: **OK**
  - Top: Marco Bezzecchi / Alex Marquez / Pedro Acosta; OUT: —; Score: 2 · timestamp: 08/11/2025 12.35.55 · origine: Portogallo / Risposte del modulo 2 / riga 3
- Gara: **OK**
  - Top: Alex Marquez / Marco Bezzecchi / Pedro Acosta / Fabio Di Giannantonio / Fermin Aldeguer; OUT: Joan Mir; Score: 16 · timestamp: 09/11/2025 12.52.43 · origine: Portogallo / Risposte del modulo 3 / riga 3
- HISTORICAL_SCORE riepilogo: Q=—, Sprint=—, Gara=—, Totale=— · origine: CLASSIFICA / Portogallo / riga 2
- HISTORICAL_SCORE riepilogo: Q=1, Sprint=2, Gara=16, Totale=19 · origine: Portogallo / CLASSIFICA / riga 2

### QATAR

- GP app: **UNKNOWN**
- MATCH_STATUS: **REVIEW**
- Stato ricostruzione: **AGGREGATE_CONFLICT**
- AGGREGATE_CONFLICT: i riepiloghi disponibili riportano valori diversi; nessun riepilogo è stato scelto automaticamente.
- Qualifica: **OK**
  - Pole: Marc Marquez; Tempo: 01:50.523; Time Conversion: 0,024; Score: 10 · timestamp: 10/04/2025 21.33.58 · origine: QATAR / Risposte del modulo 1 / riga 2
- Sprint: **OK**
  - Top: Marc Marquez / Alex Marquez / Franco Morbidelli; OUT: —; Score: 9 · timestamp: 12/04/2025 15.56.18 · origine: QATAR / Risposte del modulo 2 / riga 2
- Gara: **OK**
  - Top: Marc Marquez / Alex Marquez / Francesco Bagnaia / Franco Morbidelli / Fabio Di Giannantonio; OUT: Jack Miller; Score: 13 · timestamp: 13/04/2025 7.05.31 · origine: QATAR / Risposte del modulo 3 / riga 2
- HISTORICAL_SCORE riepilogo: Q=—, Sprint=—, Gara=—, Totale=0 · origine: CLASSIFICA / QATAR / riga 6
- HISTORICAL_SCORE riepilogo: Q=10, Sprint=9, Gara=13, Totale=32 · origine: QATAR / CLASSIFICA / riga 6

### Repubblica Ceca

- GP app: **UNKNOWN**
- MATCH_STATUS: **REVIEW**
- Stato ricostruzione: **OK**
- Qualifica: **OK**
  - Pole: M. Marquez; Tempo: 01:52.000; Time Conversion: 0,861; Score: 0 · timestamp: 18/06/2026 10.14.14 · origine: Repubblica Ceca / Risposte del modulo 1 / riga 2
- Sprint: **OK**
  - Top: A. Ogura / M. Marquez / M. Bezzecchi; OUT: —; Score: 2 · timestamp: 20/06/2026 11.41.19 · origine: Repubblica Ceca / Risposte del modulo 2 / riga 4
- Gara: **OK**
  - Top: A. Ogura / M. Marquez / F. Bagnaia / F. Di Giannantonio / P. Acosta; OUT: J. Mir; Score: 15 · timestamp: 20/06/2026 21.48.39 · origine: Repubblica Ceca / Risposte del modulo 3 / riga 4
- HISTORICAL_SCORE riepilogo: Q=0, Sprint=2, Gara=15, Totale=17 · origine: CLASSIFICA / Repubblica Ceca / riga 2
- HISTORICAL_SCORE riepilogo: Q=0, Sprint=2, Gara=15, Totale=17 · origine: Repubblica Ceca / CLASSIFICA / riga 2

### San Marino

- GP app: **UNKNOWN**
- MATCH_STATUS: **REVIEW**
- Stato ricostruzione: **PARTIAL**
- Qualifica: **MISSING**
  - Pole: Marc Marquez; Tempo: 01:29:939; Time Conversion: 0,195; Score: 3 · timestamp: 13/09/2025 6.50.47 · origine: San Marino / Risposte del modulo 1 / riga 2
- Sprint: **OK**
  - Top: Marco Bezzecchi / Marc Marquez / Alex Marquez; OUT: —; Score: 4 · timestamp: 13/09/2025 12.40.06 · origine: San Marino / Risposte del modulo 2 / riga 6
- Gara: **OK**
  - Top: Marc Marquez / Marco Bezzecchi / Alex Marquez / Fabio Di Giannantonio / Franco Morbidelli; OUT: Pedro Acosta; Score: 26 · timestamp: 13/09/2025 15.34.20 · origine: San Marino / Risposte del modulo 3 / riga 3
- HISTORICAL_SCORE riepilogo: Q=—, Sprint=—, Gara=—, Totale=— · origine: CLASSIFICA / San Marino / riga 2
- HISTORICAL_SCORE riepilogo: Q=3, Sprint=4, Gara=26, Totale=33 · origine: San Marino / CLASSIFICA / riga 2

### SPAGNA

- GP app: **UNKNOWN**
- MATCH_STATUS: **REVIEW**
- Stato ricostruzione: **OK**
- Qualifica: **OK**
  - Pole: F. Di Giannantonio; Tempo: 01:35.610; Time Conversion: 12,477; Score: 0 · timestamp: 24/04/2026 20.25.24 · origine: SPAGNA / Risposte del modulo 1 / riga 8
- Sprint: **OK**
  - Top: M. Marquez / M. Bezzecchi / F. Di Giannantonio; OUT: —; Score: 3 · timestamp: 25/04/2026 13.22.07 · origine: SPAGNA / Risposte del modulo 2 / riga 5
- Gara: **OK**
  - Top: M. Bezzecchi / M. Marquez / A. Marquez / F. Di Giannantonio / J. Martin; OUT: J. Miller; Score: 9 · timestamp: 26/04/2026 11.28.38 · origine: SPAGNA / Risposte del modulo 3 / riga 5
- HISTORICAL_SCORE riepilogo: Q=0, Sprint=3, Gara=9, Totale=12 · origine: CLASSIFICA / SPAGNA / riga 7
- HISTORICAL_SCORE riepilogo: Q=0, Sprint=3, Gara=9, Totale=12 · origine: SPAGNA / CLASSIFICA / riga 7

### Thailandia

- GP app: **UNKNOWN**
- MATCH_STATUS: **REVIEW**
- Stato ricostruzione: **AGGREGATE_CONFLICT**
- AGGREGATE_CONFLICT: i riepiloghi disponibili riportano valori diversi; nessun riepilogo è stato scelto automaticamente.
- Qualifica: **OK**
  - Pole: M. Bezzecchi; Tempo: 01:28.526; Time Conversion: 0,126; Score: 8 · timestamp: 27/02/2026 22.44.06 · origine: Thailandia / Risposte del modulo 1 / riga 11
- Sprint: **OK**
  - Top: M. Bezzecchi / M. Marquez / F. Di Giannantonio; OUT: —; Score: 3 · timestamp: 27/02/2026 22.45.54 · origine: Thailandia / Risposte del modulo 2 / riga 4
- Gara: **OK**
  - Top: M. Marquez / M. Bezzecchi / P. Acosta / R. Fernandez / A. Marquez; OUT: J. Mir; Score: 10 · timestamp: 28/02/2026 22.00.16 · origine: Thailandia / Risposte del modulo 3 / riga 2
- HISTORICAL_SCORE riepilogo: Q=8, Sprint=3, Gara=10, Totale=21 · origine: CLASSIFICA / THAILANDIA / riga 11
- HISTORICAL_SCORE riepilogo: Q=8, Sprint=3, Gara=10, Totale=21 · origine: Thailandia / CLASSIFICA / riga 11
- HISTORICAL_SCORE riepilogo: Q=5, Sprint=5, Gara=16, Totale=26 · origine: Foglio di lavoro senza nome / THAILANDIA / riga 6

### UK

- GP app: **UNKNOWN**
- MATCH_STATUS: **REVIEW**
- Stato ricostruzione: **OK**
- Qualifica: **OK**
  - Pole: M. Bezzecchi; Tempo: 01:56.354; Time Conversion: 0,194; Score: 3 · timestamp: 08/08/2026 12.49.53 · origine: UK / Risposte del modulo 1 / riga 7
- Sprint: **OK**
  - Top: R. Fernandez / A. Ogura / F. Di Giannantonio; OUT: —; Score: 3 · timestamp: 08/08/2026 13.34.51 · origine: UK / Risposte del modulo 2 / riga 5
- Gara: **OK**
  - Top: A. Ogura / J. Martin / M. Bezzecchi / R. Fernandez / F. Di Giannantonio; OUT: J. Mir; Score: 12 · timestamp: 09/08/2026 12.38.04 · origine: UK / Risposte del modulo 3 / riga 2
- HISTORICAL_SCORE riepilogo: Q=3, Sprint=3, Gara=12, Totale=18 · origine: CLASSIFICA / UK / riga 4
- HISTORICAL_SCORE riepilogo: Q=3, Sprint=3, Gara=12, Totale=18 · origine: UK / CLASSIFICA / riga 4

### Ungheria

- GP app: **UNKNOWN**
- MATCH_STATUS: **REVIEW**
- Stato ricostruzione: **OK**
- Qualifica: **OK**
  - Pole: P. Acosta; Tempo: 01:36.500; Time Conversion: 0,285; Score: 3 · timestamp: 05/06/2026 16.19.20 · origine: Ungheria / Risposte del modulo 1 / riga 7
- Sprint: **OK**
  - Top: P. Acosta / M. Marquez / J. Martin; OUT: —; Score: 2 · timestamp: 04/06/2026 9.11.18 · origine: Ungheria / Risposte del modulo 2 / riga 7
- Gara: **OK**
  - Top: M. Marquez / P. Acosta / M. Bezzecchi / J. Martin / F. Di Giannantonio; OUT: J. Mir; Score: 11 · timestamp: 06/06/2026 20.38.09 · origine: Ungheria / Risposte del modulo 3 / riga 2
- HISTORICAL_SCORE riepilogo: Q=3, Sprint=2, Gara=11, Totale=16 · origine: CLASSIFICA / Ungheria / riga 2
- HISTORICAL_SCORE riepilogo: Q=3, Sprint=2, Gara=11, Totale=16 · origine: Ungheria / CLASSIFICA / riga 2

### USA

- GP app: **UNKNOWN**
- MATCH_STATUS: **REVIEW**
- Stato ricostruzione: **OK**
- Qualifica: **OK**
  - Pole: M. Marquez; Tempo: 02:00.500; Time Conversion: 0,364; Score: 1 · timestamp: 28/03/2026 16.14.20 · origine: USA / Risposte del modulo 1 / riga 2
- Sprint: **OK**
  - Top: M. Bezzecchi / F. Di Giannantonio / M. Marquez; OUT: —; Score: 0 · timestamp: 28/03/2026 17.37.52 · origine: USA / Risposte del modulo 2 / riga 2
- Gara: **OK**
  - Top: M. Bezzecchi / J. Martin / F. Di Giannantonio / F. Bagnaia / P. Acosta; OUT: J. Zarco; Score: 16 · timestamp: 29/03/2026 7.45.33 · origine: USA / Risposte del modulo 3 / riga 2
- HISTORICAL_SCORE riepilogo: Q=1, Sprint=0, Gara=16, Totale=17 · origine: CLASSIFICA / USA / riga 2
- HISTORICAL_SCORE riepilogo: Q=1, Sprint=0, Gara=16, Totale=17 · origine: USA / CLASSIFICA / riga 2

### Valencia

- GP app: **UNKNOWN**
- MATCH_STATUS: **REVIEW**
- Stato ricostruzione: **OK**
- Qualifica: **OK**
  - Pole: Marco Bezzecchi; Tempo: 01:28.788; Time Conversion: 0,021; Score: 10 · timestamp: 15/11/2025 10.49.13 · origine: Valencia / Risposte del modulo 1 / riga 4
- Sprint: **OK**
  - Top: Marco Bezzecchi / Alex Marquez / Pedro Acosta; OUT: —; Score: 2 · timestamp: 15/11/2025 14.41.10 · origine: Valencia / Risposte del modulo 2 / riga 9
- Gara: **OK**
  - Top: Marco Bezzecchi / Alex Marquez / Pedro Acosta / Fabio Di Giannantonio / Raul Fernandez; OUT: Joan Mir; Score: 12 · timestamp: 16/11/2025 9.35.17 · origine: Valencia / Risposte del modulo 3 / riga 5
- HISTORICAL_SCORE riepilogo: Q=—, Sprint=—, Gara=—, Totale=— · origine: CLASSIFICA / Valencia / riga 2
- HISTORICAL_SCORE riepilogo: Q=10, Sprint=2, Gara=12, Totale=24 · origine: Valencia / CLASSIFICA / riga 2

## Invii multipli e anomalie

- Nessun MULTIPLE SUBMISSIONS rilevato per le sessioni ricostruite.

## Normalizzazione piloti

| Testo originale | normalized_rider | Stato |
|---|---|---|
| M. Marquez | Marc Marquez | NORMALIZED |
| M. Bezzecchi | Marco Bezzecchi | NORMALIZED |
| A. Marquez | Alex Marquez | NORMALIZED |
| J. Martin | Jorge Martin | NORMALIZED |
| F. Di Giannantonio | Fabio Di Giannantonio | NORMALIZED |
| J. Mir | Joan Mir | NORMALIZED |
| P. Acosta | Pedro Acosta | NORMALIZED |
| R. Fernandez | Raul Fernandez | NORMALIZED |
| A. Ogura | Ai Ogura | NORMALIZED |
| B. Binder | Brad Binder | NORMALIZED |
| F. Bagnaia | Francesco Bagnaia | NORMALIZED |
| J. Miller | Jack Miller | NORMALIZED |
| J. Zarco | Johann Zarco | NORMALIZED |
| Alex Marquez | Alex Marquez | NORMALIZED |
| Marco Bezzecchi | Marco Bezzecchi | NORMALIZED |
| Pedro Acosta | Pedro Acosta | NORMALIZED |
| Fabio Di Giannantonio | Fabio Di Giannantonio | NORMALIZED |
| Fermin Aldeguer | Fermin Aldeguer | UNCHANGED |
| Joan Mir | Joan Mir | NORMALIZED |
| Raul Fernandez | Raul Fernandez | NORMALIZED |
| Fabio Quartararo | Fabio Quartararo | NORMALIZED |
| Francesco Bagnaia | Francesco Bagnaia | NORMALIZED |
| Franco Morbidelli | Franco Morbidelli | NORMALIZED |
| Jack Miller | Jack Miller | NORMALIZED |
| Marc Marquez | Marc Marquez | NORMALIZED |
| Johann Zarco | Johann Zarco | NORMALIZED |
- Il testo originale del foglio non viene modificato.

## Confronto con lo storico locale

| GP | Sessione | Stato | Dettaglio |
|---|---|---|---|
| GP 1 — Gran Bretagna 2026 | Qualifica | DIFFERENCE | valori diversi; verificare il record |
| GP 1 — Gran Bretagna 2026 | Sprint | MATCH | valori presenti e coincidenti |
| GP 1 — Gran Bretagna 2026 | Gara | MATCH | valori presenti e coincidenti |
| GP 2 — 30/31 MAGGIO 2026 | Qualifica | MISSING | non trovata nei Google Sheets |
| GP 2 — 30/31 MAGGIO 2026 | Sprint | MISSING | non trovata nei Google Sheets |
| GP 2 — 30/31 MAGGIO 2026 | Gara | MISSING | non trovata nei Google Sheets |
| GP 3 — 5/7 GIUGNO 2026 | Qualifica | MISSING | non trovata nei Google Sheets |
| GP 3 — 5/7 GIUGNO 2026 | Sprint | MISSING | non trovata nei Google Sheets |
| GP 3 — 5/7 GIUGNO 2026 | Gara | MISSING | non trovata nei Google Sheets |
| Aragon | Qualifica | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Aragon | Sprint | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Aragon | Gara | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Ungheria | Qualifica | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Ungheria | Sprint | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Ungheria | Gara | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Germany | Qualifica | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Germany | Sprint | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Germany | Gara | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Netherlands | Qualifica | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Netherlands | Sprint | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Netherlands | Gara | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Repubblica Ceca | Qualifica | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Repubblica Ceca | Sprint | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Repubblica Ceca | Gara | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Italia | Qualifica | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Italia | Sprint | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Italia | Gara | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Catalogna | Qualifica | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Catalogna | Sprint | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Catalogna | Gara | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| FRANCIA | Qualifica | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| FRANCIA | Sprint | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| FRANCIA | Gara | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| SPAGNA | Qualifica | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| SPAGNA | Sprint | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| SPAGNA | Gara | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| USA | Qualifica | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| USA | Sprint | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| USA | Gara | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Brasile | Qualifica | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Brasile | Sprint | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Brasile | Gara | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Portogallo | Qualifica | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Portogallo | Sprint | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Portogallo | Gara | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Thailandia | Qualifica | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Thailandia | Sprint | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Thailandia | Gara | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Valencia | Qualifica | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Valencia | Sprint | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Valencia | Gara | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Malesia | Qualifica | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Malesia | Sprint | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Malesia | Gara | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Australia | Qualifica | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Australia | Sprint | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Australia | Gara | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Indonesia | Qualifica | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Indonesia | Gara | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Giappone | Qualifica | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Giappone | Sprint | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Giappone | Gara | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| San Marino | Qualifica | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| San Marino | Sprint | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| San Marino | Gara | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Austria | Qualifica | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Austria | Sprint | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Austria | Gara | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| QATAR | Qualifica | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| QATAR | Sprint | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| QATAR | Gara | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Argentina | Qualifica | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Argentina | Sprint | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Argentina | Gara | NEW RECORD | presente in Google Sheets ma non nel dataset locale |

## Controlli di coerenza

- I punteggi riportati sono `HISTORICAL_SCORE` già presenti nei fogli.
- Qualifica: controllati pilota Pole, tempo `MM:SS.mmm` e punteggio.
- Sprint: controllati esattamente tre posizioni, duplicati e punteggio.
- Gara: controllati esattamente cinque posizioni, duplicati, OUT distinto e punteggio.
- Il totale dichiarato non viene corretto; eventuali differenze sono marcate `TOTAL_MISMATCH`.

## Verifiche di sicurezza

- Database modificato: **NO**
- Prediction create: **NO**
- Prediction modificate: **NO**
- RPC modificate: **NO**
- Migration: **NO**
- Scoring modificato: **NO**
- Google Sheets modificato: **NO**
- Dati ufficiali MotoGP modificati: **NO**
- Token/credenziali salvati o stampati: **NO**

Questo task non contiene alcuna procedura di importazione verso Supabase.
