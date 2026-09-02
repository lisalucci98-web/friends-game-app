# Task 23 — Verifica finale risultati e punteggi Aragon

## Risultati ufficiali importati

- GP: **GRAND PRIX OF ARAGON (ARA)**
- Qualifica: **22** risultati, sessione finale Q2
- Sprint: **22** risultati
- Gara: **22** risultati
- Sessioni Q1/Q2, Sprint e Gara: **FINISHED**
- Validazioni: **0** PDF mancanti, **0** rider non trovati, **0** duplicati, **0** righe orfane
- Verifica post-import: **66** righe rileggibili
- Scritture: solo upsert dei risultati ufficiali e allineamento dello stato delle sessioni; nessuna cancellazione

## Scoring storico

- Prediction ARA nella sorgente storica: **6**
- Prediction ARA valutate con `public.score_prediction`: **3**
- RPC riuscite: **3**
- Errori RPC: **0**
- Prediction ARA storiche rimaste non valutabili: **3**
- Motivo delle 3 escluse: `QUALIFYING_TIME` mancante; la RPC live rifiuta il salvataggio del punteggio Qualifica con errore `23502`
- Non sono state aggiunte o alterate entry mancanti e non è stata modificata la funzione di scoring

### Punteggi ARA applicati

| Utente | Qualifica | Sprint | Gara | Bonus | Malus | Totale | Stato |
|---|---:|---:|---:|---:|---:|---:|---|
| simo.salva92@gmail.com | 5 | 2 | 0 | 0 | 0 | 7 | Valutato |
| lucifero1966@gmail.com | 0 | 3 | 14 | 0 | -1 | 16 | Valutato |
| ivan23dell@gmail.com | 5 | 1 | 5 | 0 | -1 | 10 | Valutato |
| marty.bria1996@gmail.com | 0 | 0 | 0 | 0 | 0 | 0 | Non valutabile |
| alessandro.cavasso.1995@gmail.com | 0 | 0 | 0 | 0 | 0 | 0 | Non valutabile |
| tommaso.strada95@gmail.com | 0 | 0 | 0 | 0 | 0 | 0 | Non valutabile |

Nel database è presente anche una prediction ARA preesistente di `nikyturets@gmail.com`, non inclusa nelle 6 righe storiche e quindi non modificata.

## Classifica live FantaTest

La classifica seguente replica la logica di `LeagueResultsContent`: somma i `total_points` delle prediction con punteggio disponibile e mantiene l’ordine di ingresso della lega in caso di pari merito.

| Posizione | Utente | GP con punteggio | Totale stagione |
|---:|---|---:|---:|
| 1 | nikyturets@gmail.com | 14 | 199 |
| 2 | simo.salva92@gmail.com | 13 | 146 |
| 3 | marty.bria1996@gmail.com | 13 | 139 |
| 4 | alessandro.cavasso.1995@gmail.com | 13 | 124 |
| 4 | marino.dilorenzo@gmail.com | 11 | 124 |
| 6 | ivan23dell@gmail.com | 11 | 88 |
| 7 | lucifero1966@gmail.com | 12 | 71 |
| 8 | alandellosbel8@gmail.com | 9 | 64 |
| 8 | dalla.pozza.silvia@gmail.com | 8 | 64 |
| 10 | tommaso.strada95@gmail.com | 9 | 47 |
| 11 | lisalucci98@gmail.com | 0 | 0 |

Il database live contiene **11** membri FantaTest. I pari merito mantengono la stessa posizione nella UI; la tabella mostra l’ordine visuale corrente.

## Riferimenti

- Report scoring completo: `.agents/outputs/historical-scoring-report.md`
- Preflight dopo l’import ARA: `.agents/outputs/task-23-preflight-after-aragon.md`
- Importatore mirato: `node scripts/import-motogp-results-2026.mjs --gp ARA [--import]`