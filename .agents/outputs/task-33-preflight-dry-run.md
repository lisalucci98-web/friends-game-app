# Scoring pronostici storici

- Modalità: **DRY-RUN — NESSUNA SCRITTURA**
- Lega: **FantaTest** (TEST01)
- Stagione: **2026**

## Perimetro

- Righe sorgente analizzate: **139**
- Prediction storiche uniche: **111**
- Prediction con UUID deterministico dell’import: **94**
- Prediction preesistenti risolte per chiave naturale: **17**
- Prediction già valutate (scored_at valorizzato): **94**
- Prediction che necessitano scoring e hanno risultati completi: **0**
- Prediction non valutabili in questa esecuzione: **17**
- Prediction non supportate dalla RPC per entry QUALIFYING_TIME assente: **17**
- Entry storiche effettivamente presenti: **1094**

## RPC utilizzata

- `public.score_prediction(p_prediction_id uuid)`
- Nessun carry-over, INSERT, UPDATE o DELETE diretto eseguito dallo script; gli aggiornamenti score sono demandati alla RPC.

## Correzione sicura dei pronostici parziali

- Decisione applicata: **non valutare le prediction prive di `QUALIFYING_TIME` e non modificarle**.
- Non viene inventato un tempo, non viene creata una entry sostitutiva, non viene usato il carry-over e non viene scritto un punteggio parziale diretto.
- Un eventuale trattamento regolamentare del campo mancante deve essere implementato nella RPC autorizzativa, ad esempio mappando esplicitamente il contributo Qualifica assente a zero, lasciando immutate `prediction_entries`; questa attività non lo applica perché il corpo SQL reale non è disponibile in questo workspace.
- Prima di un’eventuale manutenzione RPC servono test su prediction complete e parziali, verifica di idempotenza e una nuova esecuzione mirata sui soli ID bloccati.

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
- THA / marino.dilorenzo@gmail.com (2cd7c3e2-d351-5e80-89cf-ee50a610c399): 8 entry; mancanti SPRINT
- THA / alandellosbel8@gmail.com (448d7329-40ea-52be-a32c-441a495e9d48): 8 entry; mancanti SPRINT
- BRA / alandellosbel8@gmail.com (009b2b26-e55b-5a70-92c6-3f764bc42481): 9 entry; mancanti POLE, QUALIFYING_TIME
- BRA / lucifero1966@gmail.com (6a1323bd-099a-554c-b971-47ab2966ae9d): 9 entry; mancanti POLE, QUALIFYING_TIME
- USA / tommaso.strada95@gmail.com (2282b994-2da0-5ae2-9b23-72a2fa1956b5): 5 entry; mancanti RACE, RACE_OUT
- SPA / alandellosbel8@gmail.com (5e3e09ea-1f16-5365-b832-af75c75ed56d): 9 entry; mancanti POLE, QUALIFYING_TIME
- FRA / simo.salva92@gmail.com (f211335c-abd2-5889-b214-b556ece4f652): 9 entry; mancanti POLE, QUALIFYING_TIME
- FRA / marty.bria1996@gmail.com (7cd4da5d-d468-5942-a8df-7d6b7e9bdf0b): 9 entry; mancanti POLE, QUALIFYING_TIME
- FRA / alessandro.cavasso.1995@gmail.com (abe4793a-3b72-583b-8f19-12100587b4a2): 10 entry; mancanti QUALIFYING_TIME
- CAT / lucifero1966@gmail.com (38c2ce67-9d8f-51ef-a3f1-af58522ae49f): 8 entry; mancanti SPRINT
- ITA / alandellosbel8@gmail.com (561cd7b4-938a-54f7-b2dd-1927cbc73e89): 9 entry; mancanti POLE, QUALIFYING_TIME
- ITA / dalla.pozza.silvia@gmail.com (14d2c15b-9560-5880-ac3d-1e0c22cc7ddc): 8 entry; mancanti SPRINT
- ITA / marino.dilorenzo@gmail.com (a6b55890-6edf-5aab-9a98-2dccf2195fa7): 8 entry; mancanti SPRINT
- ITA / lucifero1966@gmail.com (2b6ef934-cdd8-5c7d-9e12-f9c9d78800a6): 9 entry; mancanti POLE, QUALIFYING_TIME
- ITA / alessandro.cavasso.1995@gmail.com (5dbd6e94-b2ec-5cac-b038-8a25401fc6fd): 5 entry; mancanti RACE, RACE_OUT
- HUN / dalla.pozza.silvia@gmail.com (1eefa24f-5810-5c62-8a06-e8f1be2d166e): 8 entry; mancanti SPRINT
- HUN / lucifero1966@gmail.com (f3f72104-6cf8-55b3-9946-081210fce12c): 9 entry; mancanti POLE, QUALIFYING_TIME
- NED / lucifero1966@gmail.com (a0442551-6fc6-5503-b4a3-521cdc4b536b): 9 entry; mancanti POLE, QUALIFYING_TIME
- NED / dalla.pozza.silvia@gmail.com (8d4c1653-1955-506e-9fb9-342c9f04a359): 2 entry; mancanti SPRINT, RACE, RACE_OUT
- NED / alessandro.cavasso.1995@gmail.com (c897309b-b3d4-5649-85b6-b43f19f2f524): 6 entry; mancanti POLE, QUALIFYING_TIME, SPRINT
- GER / lucifero1966@gmail.com (b87a3cf5-802f-5a76-8024-6481084de7e2): 5 entry; mancanti RACE, RACE_OUT
- GER / alandellosbel8@gmail.com (a7cbd148-00e0-5769-8162-0e0b24539827): 3 entry; mancanti POLE, QUALIFYING_TIME, RACE, RACE_OUT
- GBR / alandellosbel8@gmail.com (1ce67839-1416-50e4-aec1-06930f99db68): 6 entry; mancanti POLE, QUALIFYING_TIME, SPRINT
- GBR / ivan23dell@gmail.com (97b81fc0-d4af-573d-b9e5-c66af0b55c27): 8 entry; mancanti SPRINT
- GBR / tommaso.strada95@gmail.com (36607962-920f-580a-8e08-b9961c74de41): 5 entry; mancanti RACE, RACE_OUT
- GBR / marino.dilorenzo@gmail.com (70801d3f-a57b-5b92-84d5-f9f804bc7072): 3 entry; mancanti POLE, QUALIFYING_TIME, RACE, RACE_OUT
- ARA / tommaso.strada95@gmail.com (1a197edc-54c2-5ffe-bd0a-c37dccd4414a): 6 entry; mancanti POLE, QUALIFYING_TIME, SPRINT
- ARA / simo.salva92@gmail.com (6704f3b1-6d0f-5ed3-97f7-2abfad01f499): 5 entry; mancanti RACE, RACE_OUT
- ARA / alessandro.cavasso.1995@gmail.com (b7545592-7eaf-588a-ab2d-df5225fc4125): 2 entry; mancanti POLE, QUALIFYING_TIME, SPRINT, RACE, RACE_OUT
- ARA / marty.bria1996@gmail.com (d88bfd72-f680-559d-ba42-0d54dd703d56): 3 entry; mancanti POLE, QUALIFYING_TIME, RACE, RACE_OUT

## Limiti della RPC esistente

- BRA / alandellosbel8@gmail.com (009b2b26-e55b-5a70-92c6-3f764bc42481): QUALIFYING_TIME assente: score_prediction produce qualifying_points NULL
- BRA / lucifero1966@gmail.com (6a1323bd-099a-554c-b971-47ab2966ae9d): QUALIFYING_TIME assente: score_prediction produce qualifying_points NULL
- SPA / alandellosbel8@gmail.com (5e3e09ea-1f16-5365-b832-af75c75ed56d): QUALIFYING_TIME assente: score_prediction produce qualifying_points NULL
- FRA / simo.salva92@gmail.com (f211335c-abd2-5889-b214-b556ece4f652): QUALIFYING_TIME assente: score_prediction produce qualifying_points NULL
- FRA / marty.bria1996@gmail.com (7cd4da5d-d468-5942-a8df-7d6b7e9bdf0b): QUALIFYING_TIME assente: score_prediction produce qualifying_points NULL
- FRA / alessandro.cavasso.1995@gmail.com (abe4793a-3b72-583b-8f19-12100587b4a2): QUALIFYING_TIME assente: score_prediction produce qualifying_points NULL
- ITA / alandellosbel8@gmail.com (561cd7b4-938a-54f7-b2dd-1927cbc73e89): QUALIFYING_TIME assente: score_prediction produce qualifying_points NULL
- ITA / lucifero1966@gmail.com (2b6ef934-cdd8-5c7d-9e12-f9c9d78800a6): QUALIFYING_TIME assente: score_prediction produce qualifying_points NULL
- HUN / lucifero1966@gmail.com (f3f72104-6cf8-55b3-9946-081210fce12c): QUALIFYING_TIME assente: score_prediction produce qualifying_points NULL
- NED / lucifero1966@gmail.com (a0442551-6fc6-5503-b4a3-521cdc4b536b): QUALIFYING_TIME assente: score_prediction produce qualifying_points NULL
- NED / alessandro.cavasso.1995@gmail.com (c897309b-b3d4-5649-85b6-b43f19f2f524): QUALIFYING_TIME assente: score_prediction produce qualifying_points NULL
- GER / alandellosbel8@gmail.com (a7cbd148-00e0-5769-8162-0e0b24539827): QUALIFYING_TIME assente: score_prediction produce qualifying_points NULL
- GBR / alandellosbel8@gmail.com (1ce67839-1416-50e4-aec1-06930f99db68): QUALIFYING_TIME assente: score_prediction produce qualifying_points NULL
- GBR / marino.dilorenzo@gmail.com (70801d3f-a57b-5b92-84d5-f9f804bc7072): QUALIFYING_TIME assente: score_prediction produce qualifying_points NULL
- ARA / tommaso.strada95@gmail.com (1a197edc-54c2-5ffe-bd0a-c37dccd4414a): QUALIFYING_TIME assente: score_prediction produce qualifying_points NULL
- ARA / alessandro.cavasso.1995@gmail.com (b7545592-7eaf-588a-ab2d-df5225fc4125): QUALIFYING_TIME assente: score_prediction produce qualifying_points NULL
- ARA / marty.bria1996@gmail.com (d88bfd72-f680-559d-ba42-0d54dd703d56): QUALIFYING_TIME assente: score_prediction produce qualifying_points NULL

## Rider non presenti nei risultati ufficiali

- Sono riferimenti presenti nelle prediction_entries ma assenti dal risultato della sessione selezionata; la RPC esistente li gestisce senza inventare risultati.
- Prediction coinvolte: **14**
- THA / marino.dilorenzo@gmail.com (2cd7c3e2-d351-5e80-89cf-ee50a610c399): POLE=1
- THA / lucifero1966@gmail.com (526db0a3-d08c-5c4d-a148-08d38cb9828c): RACE=1
- SPA / dalla.pozza.silvia@gmail.com (45921e31-65c3-51d2-abcd-1785c59d8e70): RACE_OUT=1
- FRA / marino.dilorenzo@gmail.com (8ba5e5cf-560b-5e92-96ea-d5fb6d37b38f): RACE=1
- FRA / alessandro.cavasso.1995@gmail.com (abe4793a-3b72-583b-8f19-12100587b4a2): RACE=1
- FRA / tommaso.strada95@gmail.com (66320ba5-f9c3-593b-8a70-ff1b0c923753): RACE=1
- FRA / alandellosbel8@gmail.com (2d169a63-1f23-5ef7-aee0-85cb39e4d5f8): RACE=1
- CAT / lucifero1966@gmail.com (38c2ce67-9d8f-51ef-a3f1-af58522ae49f): RACE=1
- CAT / tommaso.strada95@gmail.com (bbc97158-67e6-5bc2-95f1-38d847ce6438): RACE=1
- CAT / dalla.pozza.silvia@gmail.com (a80d6fac-140e-532b-9e1e-e6b75afea429): SPRINT=1, RACE=1
- ITA / simo.salva92@gmail.com (fd21a338-370d-53ed-9397-e2dca9e4de18): SPRINT=1
- HUN / dalla.pozza.silvia@gmail.com (1eefa24f-5810-5c62-8a06-e8f1be2d166e): RACE=1
- CZE / ivan23dell@gmail.com (53c8ee16-dd4d-5d27-a426-5c298fa39c12): RACE=1
- ARA / ivan23dell@gmail.com (394de24c-79cb-587e-981b-e73ddd1d42a9): RACE=1

## Esecuzione

- RPC invocate: **0**
- RPC riuscite: **0**
- RPC con errore: **0**
- Prediction con `scored_at` che verrebbe aggiornato: **0**
- Nessun errore RPC

## Totali storici per utente

- Disponibili nella verifica post-apply.

## Verifica finale

- Prediction selezionate ancora nel perimetro: **111**
- Errori di selezione: **0**
- Database modificato: **No**
- Schema, RLS, risultati ufficiali e funzioni di scoring non sono stati modificati dallo script; le prediction_entries sono state solo rilevate.
- La classifica e il totale stagione leggono i campi aggregati delle prediction; dopo l’apply vengono riletti dal database.

