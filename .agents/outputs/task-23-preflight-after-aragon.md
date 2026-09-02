# Scoring pronostici storici

- Modalità: **DRY-RUN — NESSUNA SCRITTURA**
- Lega: **FantaTest** (TEST01)
- Stagione: **2026**

## Perimetro

- Righe sorgente analizzate: **139**
- Prediction storiche uniche: **111**
- Prediction con UUID deterministico dell’import: **94**
- Prediction preesistenti risolte per chiave naturale: **17**
- Prediction già valutate (scored_at valorizzato): **91**
- Prediction che necessitano scoring e hanno risultati completi: **3**
- Prediction non valutabili in questa esecuzione: **0**
- Prediction non supportate dalla RPC per entry QUALIFYING_TIME assente: **17**
- Entry storiche effettivamente presenti: **1094**

## RPC utilizzata

- `public.score_prediction(p_prediction_id uuid)`
- Nessun carry-over, INSERT, UPDATE o DELETE diretto eseguito dallo script; gli aggiornamenti score sono demandati alla RPC.

## Copertura risultati ufficiali

| GP | Prediction | Qualifica | Sprint | Gara | Valutabile |
|---|---:|---|---|---|---|
| THA | 10 | 22 risultati / FINISHED | 22 risultati / FINISHED | 22 risultati / FINISHED | Sì |
| BRA | 10 | 22 risultati / FINISHED | 22 risultati / FINISHED | 22 risultati / FINISHED | Sì |
| USA | 10 | 21 risultati / FINISHED | 21 risultati / FINISHED | 21 risultati / FINISHED | Sì |
| SPA | 8 | 23 risultati / FINISHED | 23 risultati / FINISHED | 23 risultati / FINISHED | Sì |
| FRA | 8 | 22 risultati / FINISHED | 22 risultati / FINISHED | 21 risultati / FINISHED | Sì |
| CAT | 9 | 22 risultati / FINISHED | 22 risultati / FINISHED | 22 risultati / FINISHED | Sì |
| ITA | 10 | 22 risultati / FINISHED | 22 risultati / FINISHED | 22 risultati / FINISHED | Sì |
| HUN | 10 | 22 risultati / FINISHED | 22 risultati / FINISHED | 22 risultati / FINISHED | Sì |
| CZE | 7 | 22 risultati / FINISHED | 21 risultati / FINISHED | 20 risultati / FINISHED | Sì |
| NED | 7 | 22 risultati / FINISHED | 22 risultati / FINISHED | 22 risultati / FINISHED | Sì |
| GER | 7 | 21 risultati / FINISHED | 20 risultati / FINISHED | 20 risultati / FINISHED | Sì |
| GBR | 9 | 23 risultati / FINISHED | 23 risultati / FINISHED | 23 risultati / FINISHED | Sì |
| ARA | 6 | 22 risultati / FINISHED | 22 risultati / FINISHED | 22 risultati / FINISHED | Sì |

## Incompletezze delle prediction

- Prediction con entry mancanti rispetto alla forma completa (1 POLE, 1 QUALIFYING_TIME, 3 SPRINT, 5 RACE, 1 RACE_OUT): **30**
- THA / marino.dilorenzo@gmail.com: 8 entry; mancanti SPRINT
- THA / alandellosbel8@gmail.com: 8 entry; mancanti SPRINT
- BRA / alandellosbel8@gmail.com: 9 entry; mancanti POLE, QUALIFYING_TIME
- BRA / lucifero1966@gmail.com: 9 entry; mancanti POLE, QUALIFYING_TIME
- USA / tommaso.strada95@gmail.com: 5 entry; mancanti RACE, RACE_OUT
- SPA / alandellosbel8@gmail.com: 9 entry; mancanti POLE, QUALIFYING_TIME
- FRA / simo.salva92@gmail.com: 9 entry; mancanti POLE, QUALIFYING_TIME
- FRA / marty.bria1996@gmail.com: 9 entry; mancanti POLE, QUALIFYING_TIME
- FRA / alessandro.cavasso.1995@gmail.com: 10 entry; mancanti QUALIFYING_TIME
- CAT / lucifero1966@gmail.com: 8 entry; mancanti SPRINT
- ITA / alandellosbel8@gmail.com: 9 entry; mancanti POLE, QUALIFYING_TIME
- ITA / dalla.pozza.silvia@gmail.com: 8 entry; mancanti SPRINT
- ITA / marino.dilorenzo@gmail.com: 8 entry; mancanti SPRINT
- ITA / lucifero1966@gmail.com: 9 entry; mancanti POLE, QUALIFYING_TIME
- ITA / alessandro.cavasso.1995@gmail.com: 5 entry; mancanti RACE, RACE_OUT
- HUN / dalla.pozza.silvia@gmail.com: 8 entry; mancanti SPRINT
- HUN / lucifero1966@gmail.com: 9 entry; mancanti POLE, QUALIFYING_TIME
- NED / lucifero1966@gmail.com: 9 entry; mancanti POLE, QUALIFYING_TIME
- NED / dalla.pozza.silvia@gmail.com: 2 entry; mancanti SPRINT, RACE, RACE_OUT
- NED / alessandro.cavasso.1995@gmail.com: 6 entry; mancanti POLE, QUALIFYING_TIME, SPRINT
- GER / lucifero1966@gmail.com: 5 entry; mancanti RACE, RACE_OUT
- GER / alandellosbel8@gmail.com: 3 entry; mancanti POLE, QUALIFYING_TIME, RACE, RACE_OUT
- GBR / alandellosbel8@gmail.com: 6 entry; mancanti POLE, QUALIFYING_TIME, SPRINT
- GBR / ivan23dell@gmail.com: 8 entry; mancanti SPRINT
- GBR / tommaso.strada95@gmail.com: 5 entry; mancanti RACE, RACE_OUT
- GBR / marino.dilorenzo@gmail.com: 3 entry; mancanti POLE, QUALIFYING_TIME, RACE, RACE_OUT
- ARA / tommaso.strada95@gmail.com: 6 entry; mancanti POLE, QUALIFYING_TIME, SPRINT
- ARA / simo.salva92@gmail.com: 5 entry; mancanti RACE, RACE_OUT
- ARA / alessandro.cavasso.1995@gmail.com: 2 entry; mancanti POLE, QUALIFYING_TIME, SPRINT, RACE, RACE_OUT
- ARA / marty.bria1996@gmail.com: 3 entry; mancanti POLE, QUALIFYING_TIME, RACE, RACE_OUT

## Limiti della RPC esistente

- BRA / alandellosbel8@gmail.com: QUALIFYING_TIME assente: score_prediction produce qualifying_points NULL
- BRA / lucifero1966@gmail.com: QUALIFYING_TIME assente: score_prediction produce qualifying_points NULL
- SPA / alandellosbel8@gmail.com: QUALIFYING_TIME assente: score_prediction produce qualifying_points NULL
- FRA / simo.salva92@gmail.com: QUALIFYING_TIME assente: score_prediction produce qualifying_points NULL
- FRA / marty.bria1996@gmail.com: QUALIFYING_TIME assente: score_prediction produce qualifying_points NULL
- FRA / alessandro.cavasso.1995@gmail.com: QUALIFYING_TIME assente: score_prediction produce qualifying_points NULL
- ITA / alandellosbel8@gmail.com: QUALIFYING_TIME assente: score_prediction produce qualifying_points NULL
- ITA / lucifero1966@gmail.com: QUALIFYING_TIME assente: score_prediction produce qualifying_points NULL
- HUN / lucifero1966@gmail.com: QUALIFYING_TIME assente: score_prediction produce qualifying_points NULL
- NED / lucifero1966@gmail.com: QUALIFYING_TIME assente: score_prediction produce qualifying_points NULL
- NED / alessandro.cavasso.1995@gmail.com: QUALIFYING_TIME assente: score_prediction produce qualifying_points NULL
- GER / alandellosbel8@gmail.com: QUALIFYING_TIME assente: score_prediction produce qualifying_points NULL
- GBR / alandellosbel8@gmail.com: QUALIFYING_TIME assente: score_prediction produce qualifying_points NULL
- GBR / marino.dilorenzo@gmail.com: QUALIFYING_TIME assente: score_prediction produce qualifying_points NULL
- ARA / tommaso.strada95@gmail.com: QUALIFYING_TIME assente: score_prediction produce qualifying_points NULL
- ARA / alessandro.cavasso.1995@gmail.com: QUALIFYING_TIME assente: score_prediction produce qualifying_points NULL
- ARA / marty.bria1996@gmail.com: QUALIFYING_TIME assente: score_prediction produce qualifying_points NULL

## Rider non presenti nei risultati ufficiali

- Sono riferimenti presenti nelle prediction_entries ma assenti dal risultato della sessione selezionata; la RPC esistente li gestisce senza inventare risultati.
- Prediction coinvolte: **14**
- THA / marino.dilorenzo@gmail.com: POLE=1
- THA / lucifero1966@gmail.com: RACE=1
- SPA / dalla.pozza.silvia@gmail.com: RACE_OUT=1
- FRA / marino.dilorenzo@gmail.com: RACE=1
- FRA / alessandro.cavasso.1995@gmail.com: RACE=1
- FRA / tommaso.strada95@gmail.com: RACE=1
- FRA / alandellosbel8@gmail.com: RACE=1
- CAT / lucifero1966@gmail.com: RACE=1
- CAT / tommaso.strada95@gmail.com: RACE=1
- CAT / dalla.pozza.silvia@gmail.com: SPRINT=1, RACE=1
- ITA / simo.salva92@gmail.com: SPRINT=1
- HUN / dalla.pozza.silvia@gmail.com: RACE=1
- CZE / ivan23dell@gmail.com: RACE=1
- ARA / ivan23dell@gmail.com: RACE=1

## Esecuzione

- RPC invocate: **0**
- RPC riuscite: **0**
- RPC con errore: **0**
- Prediction con `scored_at` che verrebbe aggiornato: **3**
- Nessun errore RPC

## Totali storici per utente

- Disponibili nella verifica post-apply.

## Verifica finale

- Prediction selezionate ancora nel perimetro: **111**
- Errori di selezione: **0**
- Database modificato: **No**
- Schema, RLS, risultati ufficiali e funzioni di scoring non sono stati modificati dallo script; le prediction_entries sono state solo rilevate.
- La classifica e il totale stagione leggono i campi aggregati delle prediction; dopo l’apply vengono riletti dal database.

