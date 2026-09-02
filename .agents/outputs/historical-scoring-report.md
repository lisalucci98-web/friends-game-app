# Scoring pronostici storici

- Modalità: **APPLY — RPC eseguite**
- Lega: **FantaTest** (TEST01)
- Stagione: **2026**

## Perimetro

- Righe sorgente analizzate: **139**
- Prediction storiche uniche: **111**
- Prediction con UUID deterministico dell’import: **94**
- Prediction preesistenti risolte per chiave naturale: **17**
- Prediction già valutate (scored_at valorizzato): **14**
- Prediction che necessitano scoring e hanno risultati completi: **91**
- Prediction non valutabili in questa esecuzione: **6**
- Entry storiche effettivamente presenti: **1094**

## RPC utilizzata

- `public.score_prediction(p_prediction_id uuid)`
- Nessun carry-over, INSERT, UPDATE o DELETE eseguito dallo script.

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
| ARA | 6 | nessun risultato | nessun risultato | nessun risultato | No |

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

## Rider non presenti nei risultati ufficiali

- Sono riferimenti presenti nelle prediction_entries ma assenti dal risultato della sessione selezionata; la RPC esistente li gestisce senza inventare risultati.
- Prediction coinvolte: **19**
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
- ARA / lucifero1966@gmail.com: POLE=1, SPRINT=3, RACE=5, RACE_OUT=1
- ARA / ivan23dell@gmail.com: POLE=1, SPRINT=3, RACE=5, RACE_OUT=1
- ARA / tommaso.strada95@gmail.com: RACE=5, RACE_OUT=1
- ARA / simo.salva92@gmail.com: POLE=1, SPRINT=3
- ARA / alessandro.cavasso.1995@gmail.com: SPRINT=2
- ARA / marty.bria1996@gmail.com: SPRINT=3

## Esecuzione

- RPC invocate: **91**
- RPC riuscite: **77**
- RPC con errore: **14**
- Prediction con `scored_at` aggiornato dopo la verifica: **91**
- Errore prediction 009b2b26-e55b-5a70-92c6-3f764bc42481: 400 Bad Request: {"code":"23502","details":"Failing row contains (009b2b26-e55b-5a70-92c6-3f764bc42481, 54e72897-766a-4e07-a039-0bc45f11dff9, 738a8b22-f744-4c75-847b-a2565dce17de, 2026-09-02 09:47:43.639106+00, 2026-09-02 10:20:38.251405+00, 23812cc9-8f11-4854-b0fb-7fe81a9823a5, null, null, 2, 6, 2, 0, null, 2026-09
- Errore prediction 6a1323bd-099a-554c-b971-47ab2966ae9d: 400 Bad Request: {"code":"23502","details":"Failing row contains (6a1323bd-099a-554c-b971-47ab2966ae9d, b72e0388-bd0a-4f4f-af1e-ba07c1f939b7, 738a8b22-f744-4c75-847b-a2565dce17de, 2026-09-02 09:47:43.639106+00, 2026-09-02 10:20:38.392294+00, 23812cc9-8f11-4854-b0fb-7fe81a9823a5, null, null, 3, 10, 2, 0, null, 2026-0
- Errore prediction 5e3e09ea-1f16-5365-b832-af75c75ed56d: 400 Bad Request: {"code":"23502","details":"Failing row contains (5e3e09ea-1f16-5365-b832-af75c75ed56d, 54e72897-766a-4e07-a039-0bc45f11dff9, 506917f4-179d-4e1d-b750-805c15bab8d7, 2026-09-02 09:47:43.639106+00, 2026-09-02 10:20:39.616293+00, 23812cc9-8f11-4854-b0fb-7fe81a9823a5, null, null, 3, 11, 0, -1, null, 2026-
- Errore prediction f211335c-abd2-5889-b214-b556ece4f652: 400 Bad Request: {"code":"23502","details":"Failing row contains (f211335c-abd2-5889-b214-b556ece4f652, c95634d4-fe7e-4c84-bfba-e57a9d3b1112, edcfdba3-7a1f-44f3-8fe8-1f8a6609770c, 2026-09-02 09:47:43.639106+00, 2026-09-02 10:20:40.031158+00, 23812cc9-8f11-4854-b0fb-7fe81a9823a5, null, null, 2, 14, 0, -1, null, 2026-
- Errore prediction 7cd4da5d-d468-5942-a8df-7d6b7e9bdf0b: 400 Bad Request: {"code":"23502","details":"Failing row contains (7cd4da5d-d468-5942-a8df-7d6b7e9bdf0b, b16ef69c-3399-4fe5-bcf3-6d2a76508106, edcfdba3-7a1f-44f3-8fe8-1f8a6609770c, 2026-09-02 09:47:43.639106+00, 2026-09-02 10:20:40.162705+00, 23812cc9-8f11-4854-b0fb-7fe81a9823a5, null, null, 1, 11, 0, -1, null, 2026-
- Errore prediction abe4793a-3b72-583b-8f19-12100587b4a2: 400 Bad Request: {"code":"23502","details":"Failing row contains (abe4793a-3b72-583b-8f19-12100587b4a2, 13f1af08-6dec-4d67-94ee-47bd2a63abb4, edcfdba3-7a1f-44f3-8fe8-1f8a6609770c, 2026-09-02 09:47:43.639106+00, 2026-09-02 10:20:40.22917+00, 23812cc9-8f11-4854-b0fb-7fe81a9823a5, null, null, 0, 9, 2, 0, null, 2026-09-
- Errore prediction 561cd7b4-938a-54f7-b2dd-1927cbc73e89: 400 Bad Request: {"code":"23502","details":"Failing row contains (561cd7b4-938a-54f7-b2dd-1927cbc73e89, 54e72897-766a-4e07-a039-0bc45f11dff9, dd266adb-3930-4099-a3d1-a9807362f048, 2026-09-02 09:47:43.639106+00, 2026-09-02 10:20:41.101441+00, 23812cc9-8f11-4854-b0fb-7fe81a9823a5, null, null, 3, 15, 1, 0, null, 2026-0
- Errore prediction 2b6ef934-cdd8-5c7d-9e12-f9c9d78800a6: 400 Bad Request: {"code":"23502","details":"Failing row contains (2b6ef934-cdd8-5c7d-9e12-f9c9d78800a6, b72e0388-bd0a-4f4f-af1e-ba07c1f939b7, dd266adb-3930-4099-a3d1-a9807362f048, 2026-09-02 09:47:43.639106+00, 2026-09-02 10:20:41.435261+00, 23812cc9-8f11-4854-b0fb-7fe81a9823a5, null, null, 0, 11, 0, 0, null, 2026-0
- Errore prediction f3f72104-6cf8-55b3-9946-081210fce12c: 400 Bad Request: {"code":"23502","details":"Failing row contains (f3f72104-6cf8-55b3-9946-081210fce12c, b72e0388-bd0a-4f4f-af1e-ba07c1f939b7, 4bd780c9-9da4-48c6-a69f-ebfd6bf8a425, 2026-09-02 09:47:43.639106+00, 2026-09-02 10:20:42.15499+00, 23812cc9-8f11-4854-b0fb-7fe81a9823a5, null, null, 9, 3, 0, -1, null, 2026-09
- Errore prediction a0442551-6fc6-5503-b4a3-521cdc4b536b: 400 Bad Request: {"code":"23502","details":"Failing row contains (a0442551-6fc6-5503-b4a3-521cdc4b536b, b72e0388-bd0a-4f4f-af1e-ba07c1f939b7, 83804cb1-a417-4213-b727-37f84b26d36e, 2026-09-02 09:47:43.639106+00, 2026-09-02 10:20:42.892134+00, 23812cc9-8f11-4854-b0fb-7fe81a9823a5, null, null, 3, 6, 0, 0, null, 2026-09
- Errore prediction c897309b-b3d4-5649-85b6-b43f19f2f524: 400 Bad Request: {"code":"23502","details":"Failing row contains (c897309b-b3d4-5649-85b6-b43f19f2f524, 13f1af08-6dec-4d67-94ee-47bd2a63abb4, 83804cb1-a417-4213-b727-37f84b26d36e, 2026-09-02 09:47:43.639106+00, 2026-09-02 10:20:43.101187+00, 23812cc9-8f11-4854-b0fb-7fe81a9823a5, null, null, 0, 14, 2, -1, null, 2026-
- Errore prediction a7cbd148-00e0-5769-8162-0e0b24539827: 400 Bad Request: {"code":"23502","details":"Failing row contains (a7cbd148-00e0-5769-8162-0e0b24539827, 54e72897-766a-4e07-a039-0bc45f11dff9, b26a84f7-2d9b-4cc5-a3e5-3d1abe916d8c, 2026-09-02 09:47:43.639106+00, 2026-09-02 10:20:43.561262+00, 23812cc9-8f11-4854-b0fb-7fe81a9823a5, null, null, 5, 0, 0, 0, null, 2026-09
- Errore prediction 1ce67839-1416-50e4-aec1-06930f99db68: 400 Bad Request: {"code":"23502","details":"Failing row contains (1ce67839-1416-50e4-aec1-06930f99db68, 54e72897-766a-4e07-a039-0bc45f11dff9, 6a16e0cb-ef4b-44b1-92e5-2e958cca0815, 2026-09-02 09:47:43.639106+00, 2026-09-02 10:20:44.104016+00, 23812cc9-8f11-4854-b0fb-7fe81a9823a5, null, null, 0, 7, 2, -1, null, 2026-0
- Errore prediction 70801d3f-a57b-5b92-84d5-f9f804bc7072: 400 Bad Request: {"code":"23502","details":"Failing row contains (70801d3f-a57b-5b92-84d5-f9f804bc7072, 7d39687f-7ad3-4617-831d-b3302aa3fae6, 6a16e0cb-ef4b-44b1-92e5-2e958cca0815, 2026-09-02 09:47:43.639106+00, 2026-09-02 10:20:44.299729+00, 23812cc9-8f11-4854-b0fb-7fe81a9823a5, null, null, 2, 0, 0, 0, null, 2026-09

## Totali storici per utente

| Utente | GP | Qualifica | Sprint | Gara | Bonus | Malus | Totale stagione |
|---|---:|---:|---:|---:|---:|---:|---:|
| nikyturets@gmail.com | 12 | 12 | 30 | 132 | 16 | -15 | 175 |
| simo.salva92@gmail.com | 13 | 14 | 29 | 102 | 12 | -18 | 139 |
| marty.bria1996@gmail.com | 13 | 21 | 36 | 92 | 9 | -19 | 139 |
| marino.dilorenzo@gmail.com | 11 | 7 | 23 | 103 | 5 | -14 | 124 |
| alessandro.cavasso.1995@gmail.com | 13 | 25 | 34 | 71 | 12 | -18 | 124 |
| ivan23dell@gmail.com | 11 | 10 | 16 | 62 | 2 | -12 | 78 |
| dalla.pozza.silvia@gmail.com | 8 | 4 | 10 | 62 | 4 | -16 | 64 |
| alandellosbel8@gmail.com | 9 | 7 | 6 | 40 | 11 | 0 | 64 |
| lucifero1966@gmail.com | 12 | 9 | 16 | 39 | 2 | -11 | 55 |
| tommaso.strada95@gmail.com | 9 | 12 | 12 | 33 | 6 | -16 | 47 |

## Verifica finale

- Prediction selezionate ancora nel perimetro: **111**
- Errori di selezione: **0**
- Database modificato: **Sì, esclusivamente tramite score_prediction**
- Schema, RLS, prediction_entries, risultati ufficiali e funzioni di scoring non sono stati modificati dallo script.
- La classifica e il totale stagione leggono i campi aggregati delle prediction; dopo l’apply vengono riletti dal database.

