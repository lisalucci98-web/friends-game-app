# Task #22 — Ricostruzione completa storico Google Sheets

> Analisi esclusivamente read-only. Il partecipante è indicato come `TARGET`; l’indirizzo email usato per il filtro non viene salvato nel report.

- Spreadsheet analizzati: **25**
- Tab analizzati: **166**
- Tab con record TARGET: **60**
- GP identificati: **23**
- Pronostici TARGET trovati: **60**
- GP completi: **13**
- GP parziali: **8**
- Duplicati/multiple submissions: **0**
- Conflitti tra riepiloghi aggregate: **2**
- GP con matching certo: **0**
- GP da verificare: **23**
- GP dell’app/database disponibili per il matching: **0**; tutti i match sono `REVIEW` perché la lettura read-only non ha restituito identificativi GP.

## Riepilogo

| GP | Qualifica | Tempo Pole | Sprint | Gara | OUT | Totale | Stato |
|---|---|---|---:|---:|---|---:|---|
| Aragon | — | — | 3 | — | — | 3 | PARTIAL |
| Argentina | Marc Marquez | 01:36.989 | 5 | 15 | Pedro Acosta | 30 | OK |
| Australia | Marco Bezzecchi | 01:25.987 | 4 | 3 | Joan Mir | 9 | OK |
| Austria | — | 88,06 | 4 | 13 | Joan Mir | 17 | PARTIAL |
| Brasile | M. Marquez | 01:20.527 | 6 | 12 | J. Mir | 18 | OK |
| Catalogna | P. Acosta | 01:38.427 | 2 | 0 | J. Mir | 8 | OK |
| FRANCIA | Marc Marquez | 89,634 | 0 | 10 | J. Mir | 10 | PARTIAL |
| Germany | M. Marquez | 01:39.224 | 4 | 8 | J. Mir | 17 | OK |
| Giappone | Marc Marquez | 01:42.940 | 1 | 16 | Jack Miller | 22 | OK |
| Indonesia | — | — | — | 7 | Joan Mir | 7 | PARTIAL |
| Italia | F. Bagnaia | 01:44.658 | 3 | — | — | 3 | PARTIAL |
| Malesia | Pedro Acosta | 01:57.167 | 2 | — | — | 5 | PARTIAL |
| Netherlands | — | — | — | 15 | J. Mir | 15 | PARTIAL |
| Portogallo | Alex Marquez | 01:39.127 | 2 | 21 | Joan Mir | 23 | OK |
| QATAR | Francesco Bagnaia | 01:50.684 | 9 | 13 | Joan Mir | — | AGGREGATE_CONFLICT |
| Repubblica Ceca | M. Bezzecchi | 01:51.347 | 3 | 8 | J. Mir | 14 | OK |
| San Marino | — | — | 1 | 26 | Joan Mir | 27 | PARTIAL |
| SPAGNA | M. Marquez | 01:43.274 | 3 | 11 | J. Mir | 19 | OK |
| Thailandia | M. Bezzecchi | 01:28.245 | 1 | 12 | J. Mir | — | AGGREGATE_CONFLICT |
| UK | M. Bezzecchi | 01:56.128 | 9 | 8 | J. Mir | 22 | OK |
| Ungheria | M. Marquez | 01:35.457 | 1 | 3 | J. Mir | 9 | OK |
| USA | M. Marquez | 01:59.867 | 0 | 12 | J. Mir | 15 | OK |
| Valencia | Marco Bezzecchi | 01:28.564 | 2 | 17 | Joan Mir | 25 | OK |

## Mappatura Google Sheet / Tab → GP → GP app

| Spreadsheet / Tab | GP riconosciuto | GP app | Match |
|---|---|---|---|
| Aragon / Risposte del modulo 2 | Aragon | UNKNOWN | REVIEW |
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
| Indonesia / Risposte del modulo 3 | Indonesia | UNKNOWN | REVIEW |
| Italia / Risposte del modulo 1 | Italia | UNKNOWN | REVIEW |
| Italia / Risposte del modulo 2 | Italia | UNKNOWN | REVIEW |
| Malesia / Risposte del modulo 1 | Malesia | UNKNOWN | REVIEW |
| Malesia / Risposte del modulo 2 | Malesia | UNKNOWN | REVIEW |
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
- Stato ricostruzione: **PARTIAL**
- Qualifica: **MISSING**
- Sprint: **MISSING**
  - Top: A. Marquez / M. Bezzecchi / A. Marquez; OUT: —; Score: 3 · timestamp: 29/08/2026 14.14.19 · origine: Aragon / Risposte del modulo 2 / riga 3
- Gara: **MISSING**
- HISTORICAL_SCORE riepilogo: Q=0, Sprint=3, Gara=0, Totale=3 · origine: CLASSIFICA / ARAGON / riga 8
- HISTORICAL_SCORE riepilogo: Q=0, Sprint=3, Gara=0, Totale=3 · origine: Aragon / CLASSIFICA / riga 8

### Argentina

- GP app: **UNKNOWN**
- MATCH_STATUS: **REVIEW**
- Stato ricostruzione: **OK**
- Qualifica: **OK**
  - Pole: Marc Marquez; Tempo: 01:36.989; Time Conversion: 0,072; Score: 10 · timestamp: 15/03/2025 0.10.44 · origine: Argentina / Risposte del modulo 5 / riga 2
- Sprint: **OK**
  - Top: Marc Marquez / Francesco Bagnaia / Alex Marquez; OUT: —; Score: 5 · timestamp: 15/03/2025 18.59.36 · origine: Argentina / Risposte del modulo 2 / riga 5
- Gara: **OK**
  - Top: Marc Marquez / Alex Marquez / Francesco Bagnaia / Franco Morbidelli / Marco Bezzecchi; OUT: Pedro Acosta; Score: 15 · timestamp: 16/03/2025 18.53.24 · origine: Argentina / Risposte del modulo 3 / riga 5
- HISTORICAL_SCORE riepilogo: Q=10, Sprint=5, Gara=15, Totale=30 · origine: Argentina / CLASSIFICA / riga 9

### Australia

- GP app: **UNKNOWN**
- MATCH_STATUS: **REVIEW**
- Stato ricostruzione: **OK**
- Qualifica: **OK**
  - Pole: Marco Bezzecchi; Tempo: 01:25.987; Time Conversion: 0,478; Score: 2 · timestamp: 17/10/2025 16.44.42 · origine: Australia / Risposte del modulo 1 / riga 5
- Sprint: **OK**
  - Top: Marco Bezzecchi / Pedro Acosta / Fabio Quartararo; OUT: —; Score: 4 · timestamp: 18/10/2025 4.21.39 · origine: Australia / Risposte del modulo 2 / riga 5
- Gara: **OK**
  - Top: Francesco Bagnaia / Alex Marquez / Fermin Aldeguer / Franco Morbidelli / Marco Bezzecchi; OUT: Joan Mir; Score: 3 · timestamp: 26/10/2025 7.53.16 · origine: Australia / Risposte del modulo 3 / riga 10
- HISTORICAL_SCORE riepilogo: Q=—, Sprint=—, Gara=—, Totale=— · origine: CLASSIFICA / Australia / riga 8
- HISTORICAL_SCORE riepilogo: Q=2, Sprint=4, Gara=3, Totale=9 · origine: Australia / CLASSIFICA / riga 8

### Austria

- GP app: **UNKNOWN**
- MATCH_STATUS: **REVIEW**
- Stato ricostruzione: **PARTIAL**
- Qualifica: **MISSING**
  - Pole: —; Tempo: 88,06; Time Conversion: 88,06; Score: 0 · timestamp: 16/08/2025 14.02.57 · origine: Austria / Risposte del modulo 1 / riga 8
- Sprint: **OK**
  - Top: Marc Marquez / Marco Bezzecchi / Alex Marquez; OUT: —; Score: 4 · timestamp: 16/08/2025 14.03.53 · origine: Austria / Risposte del modulo 2 / riga 7
- Gara: **OK**
  - Top: Marc Marquez / Marco Bezzecchi / Francesco Bagnaia / Pedro Acosta / Alex Marquez; OUT: Joan Mir; Score: 13 · timestamp: 17/08/2025 13.44.16 · origine: Austria / Risposte del modulo 3 / riga 9
- HISTORICAL_SCORE riepilogo: Q=—, Sprint=—, Gara=—, Totale=— · origine: CLASSIFICA / Austria / riga 6
- HISTORICAL_SCORE riepilogo: Q=0, Sprint=4, Gara=13, Totale=17 · origine: Austria / CLASSIFICA / riga 6

### Brasile

- GP app: **UNKNOWN**
- MATCH_STATUS: **REVIEW**
- Stato ricostruzione: **OK**
- Qualifica: **OK**
  - Pole: M. Marquez; Tempo: 01:20.527; Time Conversion: 3,117; Score: 0 · timestamp: 21/03/2026 9.09.26 · origine: Brasile / Risposte del modulo 1 / riga 5
- Sprint: **OK**
  - Top: M. Marquez / M. Bezzecchi / J. Martin; OUT: —; Score: 6 · timestamp: 21/03/2026 18.55.37 · origine: Brasile / Risposte del modulo 2 / riga 4
- Gara: **OK**
  - Top: M. Marquez / M. Bezzecchi / F. Di Giannantonio / J. Martin / A. Marquez; OUT: J. Mir; Score: 12 · timestamp: 22/03/2026 18.39.33 · origine: Brasile / Risposte del modulo 3 / riga 10
- HISTORICAL_SCORE riepilogo: Q=0, Sprint=6, Gara=12, Totale=18 · origine: CLASSIFICA / BRASILE / riga 7
- HISTORICAL_SCORE riepilogo: Q=0, Sprint=6, Gara=12, Totale=18 · origine: Brasile / CLASSIFICA / riga 7

### Catalogna

- GP app: **UNKNOWN**
- MATCH_STATUS: **REVIEW**
- Stato ricostruzione: **OK**
- Qualifica: **OK**
  - Pole: P. Acosta; Tempo: 01:38.427; Time Conversion: 0,359; Score: 6 · timestamp: 16/05/2026 10.43.43 · origine: Catalogna / Risposte del modulo 1 / riga 8
- Sprint: **OK**
  - Top: P. Acosta / A. Marquez / R. Fernandez; OUT: —; Score: 2 · timestamp: 16/05/2026 14.37.46 · origine: Catalogna / Risposte del modulo 2 / riga 18
- Gara: **OK**
  - Top: F. Di Giannantonio / A. Marquez / P. Acosta / R. Fernandez / J. Martin; OUT: J. Mir; Score: 0 · timestamp: 17/05/2026 13.30.11 · origine: Catalogna / Risposte del modulo 3 / riga 7
- HISTORICAL_SCORE riepilogo: Q=6, Sprint=2, Gara=0, Totale=8 · origine: CLASSIFICA / Catalogna / riga 8
- HISTORICAL_SCORE riepilogo: Q=6, Sprint=2, Gara=0, Totale=8 · origine: Catalogna / CLASSIFICA / riga 8

### FRANCIA

- GP app: **UNKNOWN**
- MATCH_STATUS: **REVIEW**
- Stato ricostruzione: **PARTIAL**
- Qualifica: **MISSING**
  - Pole: Marc Marquez; Tempo: 89,634; Time Conversion: 89,634; Score: 0 · timestamp: 10/05/2025 10.43.07 · origine: FRANCIA / Risposte del modulo 1 / riga 7
- Sprint: **OK**
  - Top: Marc Marquez / Fabio Quartararo / Alex Marquez; OUT: —; Score: 0 · timestamp: 10/05/2025 11.38.23 · origine: FRANCIA / Risposte del modulo 2 / riga 11
- Gara: **OK**
  - Top: M. Bezzecchi / J. Martin / F. Bagnaia / M. Marquez / F. Di Giannantonio; OUT: J. Mir; Score: 10 · timestamp: 10/05/2026 11.52.07 · origine: FRANCIA / Risposte del modulo 3 / riga 8
- HISTORICAL_SCORE riepilogo: Q=0, Sprint=0, Gara=10, Totale=10 · origine: CLASSIFICA / FRANCIA / riga 7
- HISTORICAL_SCORE riepilogo: Q=0, Sprint=0, Gara=10, Totale=10 · origine: FRANCIA / CLASSIFICA / riga 7

### Germany

- GP app: **UNKNOWN**
- MATCH_STATUS: **REVIEW**
- Stato ricostruzione: **OK**
- Qualifica: **OK**
  - Pole: M. Marquez; Tempo: 01:39.224; Time Conversion: 20,183; Score: 5 · timestamp: 11/07/2026 10.13.22 · origine: Germany / Risposte del modulo 1 / riga 3
- Sprint: **OK**
  - Top: M. Marquez / F. Di Giannantonio / R. Fernandez; OUT: —; Score: 4 · timestamp: 11/07/2026 14.45.01 · origine: Germany / Risposte del modulo 2 / riga 2
- Gara: **OK**
  - Top: M. Marquez / F. Di Giannantonio / A. Marquez / A. Ogura / R. Fernandez; OUT: J. Mir; Score: 8 · timestamp: 13/07/2025 11.05.50 · origine: Germany / Risposte del modulo 3 / riga 4
- HISTORICAL_SCORE riepilogo: Q=5, Sprint=4, Gara=8, Totale=17 · origine: CLASSIFICA / GERMANY / riga 8
- HISTORICAL_SCORE riepilogo: Q=5, Sprint=4, Gara=8, Totale=17 · origine: Germany / CLASSIFICA / riga 8

### Giappone

- GP app: **UNKNOWN**
- MATCH_STATUS: **REVIEW**
- Stato ricostruzione: **OK**
- Qualifica: **OK**
  - Pole: Marc Marquez; Tempo: 01:42.940; Time Conversion: 0,029; Score: 5 · timestamp: — · origine: Giappone / Risposte del modulo 1 / riga 9
- Sprint: **OK**
  - Top: Marc Marquez / Alex Marquez / Marco Bezzecchi; OUT: —; Score: 1 · timestamp: — · origine: Giappone / Risposte del modulo 2 / riga 10
- Gara: **OK**
  - Top: Francesco Bagnaia / Marc Marquez / Pedro Acosta / Franco Morbidelli / Joan Mir; OUT: Jack Miller; Score: 16 · timestamp: 28/09/2025 0.15.57 · origine: Giappone / Risposte del modulo 3 / riga 9
- HISTORICAL_SCORE riepilogo: Q=—, Sprint=—, Gara=—, Totale=— · origine: CLASSIFICA / Giappone / riga 8
- HISTORICAL_SCORE riepilogo: Q=5, Sprint=1, Gara=16, Totale=22 · origine: Giappone / CLASSIFICA / riga 8

### Indonesia

- GP app: **UNKNOWN**
- MATCH_STATUS: **REVIEW**
- Stato ricostruzione: **PARTIAL**
- Qualifica: **MISSING**
- Sprint: **MISSING**
- Gara: **OK**
  - Top: Marco Bezzecchi / Fermin Aldeguer / Pedro Acosta / Raul Fernandez / Marc Marquez; OUT: Joan Mir; Score: 7 · timestamp: 04/10/2025 20.33.07 · origine: Indonesia / Risposte del modulo 3 / riga 6
- HISTORICAL_SCORE riepilogo: Q=—, Sprint=—, Gara=—, Totale=— · origine: CLASSIFICA / Indonesia / riga 8
- HISTORICAL_SCORE riepilogo: Q=0, Sprint=0, Gara=7, Totale=7 · origine: Indonesia / CLASSIFICA / riga 8

### Italia

- GP app: **UNKNOWN**
- MATCH_STATUS: **REVIEW**
- Stato ricostruzione: **PARTIAL**
- Qualifica: **OK**
  - Pole: F. Bagnaia; Tempo: 01:44.658; Time Conversion: 0,737; Score: 0 · timestamp: 30/05/2026 10.32.13 · origine: Italia / Risposte del modulo 1 / riga 7
- Sprint: **OK**
  - Top: M. Bezzecchi / J. Martin / M. Marquez; OUT: —; Score: 3 · timestamp: 30/05/2026 14.47.23 · origine: Italia / Risposte del modulo 2 / riga 2
- Gara: **MISSING**
- HISTORICAL_SCORE riepilogo: Q=0, Sprint=3, Gara=0, Totale=3 · origine: CLASSIFICA / ITALIA / riga 11
- HISTORICAL_SCORE riepilogo: Q=0, Sprint=3, Gara=0, Totale=3 · origine: Italia / CLASSIFICA / riga 11

### Malesia

- GP app: **UNKNOWN**
- MATCH_STATUS: **REVIEW**
- Stato ricostruzione: **PARTIAL**
- Qualifica: **OK**
  - Pole: Pedro Acosta; Tempo: 01:57.167; Time Conversion: 0,166; Score: 3 · timestamp: 24/10/2025 17.25.19 · origine: Malesia / Risposte del modulo 1 / riga 4
- Sprint: **OK**
  - Top: Alex Marquez / Francesco Bagnaia / Maverick Vinales; OUT: —; Score: 2 · timestamp: 25/10/2025 8.01.31 · origine: Malesia / Risposte del modulo 2 / riga 4
- Gara: **MISSING**
- HISTORICAL_SCORE riepilogo: Q=—, Sprint=—, Gara=—, Totale=— · origine: CLASSIFICA / Malesia / riga 8
- HISTORICAL_SCORE riepilogo: Q=3, Sprint=2, Gara=0, Totale=5 · origine: Malesia / CLASSIFICA / riga 8

### Netherlands

- GP app: **UNKNOWN**
- MATCH_STATUS: **REVIEW**
- Stato ricostruzione: **PARTIAL**
- Qualifica: **MISSING**
- Sprint: **MISSING**
- Gara: **OK**
  - Top: M. Bezzecchi / A. Ogura / J. Martin / F. Di Giannantonio / R. Fernandez; OUT: J. Mir; Score: 15 · timestamp: 28/06/2026 10.41.51 · origine: Netherlands / Risposte del modulo 3 / riga 4
- HISTORICAL_SCORE riepilogo: Q=0, Sprint=0, Gara=15, Totale=15 · origine: CLASSIFICA / NETHERLANDS / riga 9
- HISTORICAL_SCORE riepilogo: Q=0, Sprint=0, Gara=15, Totale=15 · origine: Netherlands / CLASSIFICA / riga 9

### Portogallo

- GP app: **UNKNOWN**
- MATCH_STATUS: **REVIEW**
- Stato ricostruzione: **OK**
- Qualifica: **OK**
  - Pole: Alex Marquez; Tempo: 01:39.127; Time Conversion: 1,571; Score: 0 · timestamp: 08/11/2025 11.45.08 · origine: Portogallo / Risposte del modulo 1 / riga 8
- Sprint: **OK**
  - Top: Marco Bezzecchi / Alex Marquez / Pedro Acosta; OUT: —; Score: 2 · timestamp: 08/11/2025 13.37.45 · origine: Portogallo / Risposte del modulo 2 / riga 7
- Gara: **OK**
  - Top: Marco Bezzecchi / Alex Marquez / Pedro Acosta / Fabio Di Giannantonio / Fermin Aldeguer; OUT: Joan Mir; Score: 21 · timestamp: 09/11/2025 13.22.48 · origine: Portogallo / Risposte del modulo 3 / riga 9
- HISTORICAL_SCORE riepilogo: Q=—, Sprint=—, Gara=—, Totale=— · origine: CLASSIFICA / Portogallo / riga 8
- HISTORICAL_SCORE riepilogo: Q=0, Sprint=2, Gara=21, Totale=23 · origine: Portogallo / CLASSIFICA / riga 8

### QATAR

- GP app: **UNKNOWN**
- MATCH_STATUS: **REVIEW**
- Stato ricostruzione: **AGGREGATE_CONFLICT**
- AGGREGATE_CONFLICT: i riepiloghi disponibili riportano valori diversi; nessun riepilogo è stato scelto automaticamente.
- Qualifica: **OK**
  - Pole: Francesco Bagnaia; Tempo: 01:50.684; Time Conversion: 0,185; Score: 3 · timestamp: 12/04/2025 14.39.54 · origine: QATAR / Risposte del modulo 1 / riga 10
- Sprint: **OK**
  - Top: Marc Marquez / Alex Marquez / Franco Morbidelli; OUT: —; Score: 9 · timestamp: 12/04/2025 17.00.06 · origine: QATAR / Risposte del modulo 2 / riga 7
- Gara: **OK**
  - Top: Marc Marquez / Alex Marquez / Franco Morbidelli / Fabio Di Giannantonio / Francesco Bagnaia; OUT: Joan Mir; Score: 13 · timestamp: 13/04/2025 16.50.50 · origine: QATAR / Risposte del modulo 3 / riga 10
- HISTORICAL_SCORE riepilogo: Q=—, Sprint=—, Gara=—, Totale=0 · origine: CLASSIFICA / QATAR / riga 9
- HISTORICAL_SCORE riepilogo: Q=3, Sprint=9, Gara=13, Totale=25 · origine: QATAR / CLASSIFICA / riga 9

### Repubblica Ceca

- GP app: **UNKNOWN**
- MATCH_STATUS: **REVIEW**
- Stato ricostruzione: **OK**
- Qualifica: **OK**
  - Pole: M. Bezzecchi; Tempo: 01:51.347; Time Conversion: 0,208; Score: 3 · timestamp: 20/06/2026 9.57.10 · origine: Repubblica Ceca / Risposte del modulo 1 / riga 9
- Sprint: **OK**
  - Top: M. Bezzecchi / A. Ogura / F. Di Giannantonio; OUT: —; Score: 3 · timestamp: 20/06/2026 14.40.12 · origine: Repubblica Ceca / Risposte del modulo 2 / riga 6
- Gara: **OK**
  - Top: A. Ogura / F. Di Giannantonio / R. Fernandez / F. Bagnaia / M. Marquez; OUT: J. Mir; Score: 8 · timestamp: 21/06/2026 13.58.06 · origine: Repubblica Ceca / Risposte del modulo 3 / riga 6
- HISTORICAL_SCORE riepilogo: Q=3, Sprint=3, Gara=8, Totale=14 · origine: CLASSIFICA / Repubblica Ceca / riga 8
- HISTORICAL_SCORE riepilogo: Q=3, Sprint=3, Gara=8, Totale=14 · origine: Repubblica Ceca / CLASSIFICA / riga 8

### San Marino

- GP app: **UNKNOWN**
- MATCH_STATUS: **REVIEW**
- Stato ricostruzione: **PARTIAL**
- Qualifica: **MISSING**
- Sprint: **OK**
  - Top: Alex Marquez / Marc Marquez / Marco Bezzecchi; OUT: —; Score: 1 · timestamp: — · origine: San Marino / Risposte del modulo 2 / riga 10
- Gara: **OK**
  - Top: Marc Marquez / Marco Bezzecchi / Alex Marquez / Fabio Di Giannantonio / Franco Morbidelli; OUT: Joan Mir; Score: 26 · timestamp: 14/09/2025 13.59.56 · origine: San Marino / Risposte del modulo 3 / riga 9
- HISTORICAL_SCORE riepilogo: Q=—, Sprint=—, Gara=—, Totale=— · origine: CLASSIFICA / San Marino / riga 8
- HISTORICAL_SCORE riepilogo: Q=0, Sprint=1, Gara=26, Totale=27 · origine: San Marino / CLASSIFICA / riga 8

### SPAGNA

- GP app: **UNKNOWN**
- MATCH_STATUS: **REVIEW**
- Stato ricostruzione: **OK**
- Qualifica: **OK**
  - Pole: M. Marquez; Tempo: 01:43.274; Time Conversion: 4,813; Score: 5 · timestamp: 25/04/2026 10.40.17 · origine: SPAGNA / Risposte del modulo 1 / riga 4
- Sprint: **OK**
  - Top: M. Marquez / M. Bezzecchi / F. Di Giannantonio; OUT: —; Score: 3 · timestamp: 25/04/2026 12.04.05 · origine: SPAGNA / Risposte del modulo 2 / riga 7
- Gara: **OK**
  - Top: M. Marquez / A. Marquez / M. Bezzecchi / F. Di Giannantonio / J. Martin; OUT: J. Mir; Score: 11 · timestamp: 26/04/2026 10.52.38 · origine: SPAGNA / Risposte del modulo 3 / riga 7
- HISTORICAL_SCORE riepilogo: Q=5, Sprint=3, Gara=11, Totale=19 · origine: CLASSIFICA / SPAGNA / riga 2
- HISTORICAL_SCORE riepilogo: Q=5, Sprint=3, Gara=11, Totale=19 · origine: SPAGNA / CLASSIFICA / riga 2

### Thailandia

- GP app: **UNKNOWN**
- MATCH_STATUS: **REVIEW**
- Stato ricostruzione: **AGGREGATE_CONFLICT**
- AGGREGATE_CONFLICT: i riepiloghi disponibili riportano valori diversi; nessun riepilogo è stato scelto automaticamente.
- Qualifica: **OK**
  - Pole: M. Bezzecchi; Tempo: 01:28.245; Time Conversion: 0,407; Score: 6 · timestamp: 27/02/2026 14.16.09 · origine: Thailandia / Risposte del modulo 1 / riga 7
- Sprint: **OK**
  - Top: M. Marquez / M. Bezzecchi / F. Di Giannantonio; OUT: —; Score: 1 · timestamp: 28/02/2026 8.12.23 · origine: Thailandia / Risposte del modulo 2 / riga 8
- Gara: **OK**
  - Top: M. Bezzecchi / M. Marquez / P. Acosta / R. Fernandez / F. Di Giannantonio; OUT: J. Mir; Score: 12 · timestamp: 01/03/2026 8.57.51 · origine: Thailandia / Risposte del modulo 3 / riga 11
- HISTORICAL_SCORE riepilogo: Q=6, Sprint=1, Gara=12, Totale=19 · origine: CLASSIFICA / THAILANDIA / riga 7
- HISTORICAL_SCORE riepilogo: Q=6, Sprint=1, Gara=12, Totale=19 · origine: Thailandia / CLASSIFICA / riga 7
- HISTORICAL_SCORE riepilogo: Q=0, Sprint=5, Gara=16, Totale=21 · origine: Foglio di lavoro senza nome / THAILANDIA / riga 9

### UK

- GP app: **UNKNOWN**
- MATCH_STATUS: **REVIEW**
- Stato ricostruzione: **OK**
- Qualifica: **OK**
  - Pole: M. Bezzecchi; Tempo: 01:56.128; Time Conversion: 0,032; Score: 5 · timestamp: 08/08/2026 11.55.36 · origine: UK / Risposte del modulo 1 / riga 4
- Sprint: **OK**
  - Top: J. Martin / A. Ogura / M. Bezzecchi; OUT: —; Score: 9 · timestamp: 08/08/2026 15.31.45 · origine: UK / Risposte del modulo 2 / riga 2
- Gara: **OK**
  - Top: M. Bezzecchi / J. Martin / A. Ogura / F. Di Giannantonio / R. Fernandez; OUT: J. Mir; Score: 8 · timestamp: 09/08/2026 11.16.31 · origine: UK / Risposte del modulo 3 / riga 5
- HISTORICAL_SCORE riepilogo: Q=5, Sprint=9, Gara=8, Totale=22 · origine: CLASSIFICA / UK / riga 2
- HISTORICAL_SCORE riepilogo: Q=5, Sprint=9, Gara=8, Totale=22 · origine: UK / CLASSIFICA / riga 2

### Ungheria

- GP app: **UNKNOWN**
- MATCH_STATUS: **REVIEW**
- Stato ricostruzione: **OK**
- Qualifica: **OK**
  - Pole: M. Marquez; Tempo: 01:35.457; Time Conversion: 1,328; Score: 5 · timestamp: 06/06/2026 7.40.21 · origine: Ungheria / Risposte del modulo 1 / riga 5
- Sprint: **OK**
  - Top: P. Acosta / F. Di Giannantonio / M. Marquez; OUT: —; Score: 1 · timestamp: 06/06/2026 11.58.40 · origine: Ungheria / Risposte del modulo 2 / riga 8
- Gara: **OK**
  - Top: M. Bezzecchi / P. Acosta / M. Marquez / J. Martin / R. Fernandez; OUT: J. Mir; Score: 3 · timestamp: 07/06/2026 7.15.46 · origine: Ungheria / Risposte del modulo 3 / riga 8
- HISTORICAL_SCORE riepilogo: Q=5, Sprint=1, Gara=3, Totale=9 · origine: CLASSIFICA / Ungheria / riga 8
- HISTORICAL_SCORE riepilogo: Q=5, Sprint=1, Gara=3, Totale=9 · origine: Ungheria / CLASSIFICA / riga 10

### USA

- GP app: **UNKNOWN**
- MATCH_STATUS: **REVIEW**
- Stato ricostruzione: **OK**
- Qualifica: **OK**
  - Pole: M. Marquez; Tempo: 01:59.867; Time Conversion: 0,269; Score: 3 · timestamp: 28/03/2026 16.32.44 · origine: USA / Risposte del modulo 1 / riga 7
- Sprint: **OK**
  - Top: M. Bezzecchi / F. Di Giannantonio / M. Marquez; OUT: —; Score: 0 · timestamp: 28/03/2026 18.25.59 · origine: USA / Risposte del modulo 2 / riga 8
- Gara: **OK**
  - Top: M. Bezzecchi / F. Di Giannantonio / F. Bagnaia / M. Marquez / J. Martin; OUT: J. Mir; Score: 12 · timestamp: 29/03/2026 20.06.07 · origine: USA / Risposte del modulo 3 / riga 8
- HISTORICAL_SCORE riepilogo: Q=3, Sprint=0, Gara=12, Totale=15 · origine: CLASSIFICA / USA / riga 7
- HISTORICAL_SCORE riepilogo: Q=3, Sprint=0, Gara=12, Totale=15 · origine: USA / CLASSIFICA / riga 7

### Valencia

- GP app: **UNKNOWN**
- MATCH_STATUS: **REVIEW**
- Stato ricostruzione: **OK**
- Qualifica: **OK**
  - Pole: Marco Bezzecchi; Tempo: 01:28.564; Time Conversion: 0,245; Score: 6 · timestamp: 15/11/2025 10.31.21 · origine: Valencia / Risposte del modulo 1 / riga 9
- Sprint: **OK**
  - Top: Marco Bezzecchi / Alex Marquez / Pedro Acosta; OUT: —; Score: 2 · timestamp: 15/11/2025 11.54.36 · origine: Valencia / Risposte del modulo 2 / riga 4
- Gara: **OK**
  - Top: Marco Bezzecchi / Alex Marquez / Fabio Di Giannantonio / Pedro Acosta / Raul Fernandez; OUT: Joan Mir; Score: 17 · timestamp: 16/11/2025 13.53.33 · origine: Valencia / Risposte del modulo 3 / riga 9
- HISTORICAL_SCORE riepilogo: Q=—, Sprint=—, Gara=—, Totale=— · origine: CLASSIFICA / Valencia / riga 8
- HISTORICAL_SCORE riepilogo: Q=6, Sprint=2, Gara=17, Totale=25 · origine: Valencia / CLASSIFICA / riga 8

## Invii multipli e anomalie

- Nessun MULTIPLE SUBMISSIONS rilevato per le sessioni ricostruite.

## Normalizzazione piloti

| Testo originale | normalized_rider | Stato |
|---|---|---|
| A. Marquez | Alex Marquez | NORMALIZED |
| M. Bezzecchi | Marco Bezzecchi | NORMALIZED |
| M. Marquez | Marc Marquez | NORMALIZED |
| P. Acosta | Pedro Acosta | NORMALIZED |
| F. Di Giannantonio | Fabio Di Giannantonio | NORMALIZED |
| J. Martin | Jorge Martin | NORMALIZED |
| R. Fernandez | Raul Fernandez | NORMALIZED |
| J. Mir | Joan Mir | NORMALIZED |
| A. Ogura | Ai Ogura | NORMALIZED |
| F. Bagnaia | Francesco Bagnaia | NORMALIZED |
| Marc Marquez | Marc Marquez | NORMALIZED |
| Fabio Quartararo | Fabio Quartararo | NORMALIZED |
| Alex Marquez | Alex Marquez | NORMALIZED |
| Marco Bezzecchi | Marco Bezzecchi | NORMALIZED |
| Pedro Acosta | Pedro Acosta | NORMALIZED |
| Fabio Di Giannantonio | Fabio Di Giannantonio | NORMALIZED |
| Fermin Aldeguer | Fermin Aldeguer | UNCHANGED |
| Joan Mir | Joan Mir | NORMALIZED |
| Raul Fernandez | Raul Fernandez | NORMALIZED |
| Francesco Bagnaia | Francesco Bagnaia | NORMALIZED |
| Maverick Vinales | Maverick Vinales | UNCHANGED |
| Franco Morbidelli | Franco Morbidelli | NORMALIZED |
| Jack Miller | Jack Miller | NORMALIZED |
- Il testo originale del foglio non viene modificato.

## Confronto con lo storico locale

| GP | Sessione | Stato | Dettaglio |
|---|---|---|---|
| GP 1 — Gran Bretagna 2026 | Qualifica | DIFFERENCE | valori diversi; verificare il record |
| GP 1 — Gran Bretagna 2026 | Sprint | MATCH | valori presenti e coincidenti |
| GP 1 — Gran Bretagna 2026 | Gara | MATCH | valori presenti e coincidenti |
| GP 2 — 30/31 MAGGIO 2026 | Qualifica | MISSING | non trovata nei Google Sheets |
| GP 2 — 30/31 MAGGIO 2026 | Sprint | MISSING | non trovata nei Google Sheets |
| GP 3 — 5/7 GIUGNO 2026 | Qualifica | MISSING | non trovata nei Google Sheets |
| GP 3 — 5/7 GIUGNO 2026 | Sprint | MISSING | non trovata nei Google Sheets |
| GP 3 — 5/7 GIUGNO 2026 | Gara | MISSING | non trovata nei Google Sheets |
| Aragon | Sprint | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Ungheria | Qualifica | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Ungheria | Sprint | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Ungheria | Gara | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Germany | Qualifica | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Germany | Sprint | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Germany | Gara | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Netherlands | Gara | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Repubblica Ceca | Qualifica | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Repubblica Ceca | Sprint | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Repubblica Ceca | Gara | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Italia | Qualifica | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Italia | Sprint | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
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
| Australia | Qualifica | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Australia | Sprint | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Australia | Gara | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Indonesia | Gara | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Giappone | Qualifica | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Giappone | Sprint | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
| Giappone | Gara | NEW RECORD | presente in Google Sheets ma non nel dataset locale |
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
