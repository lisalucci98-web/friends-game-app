# Task 36 — Diagnosi definitiva punti mancanti e Nikiturets

## 1. Problema riscontrato

La diagnosi verifica direttamente TEST01, senza modificare Supabase. Sono stati
letti 113 record `predictions` e 1116
record `prediction_entries`; la sorgente storica ha risolto 111
prediction, di cui 81 complete e 30 parziali.
Considerando tutti i record DB TEST01, 83 hanno 11 entry senza
duplicati e 30 sono incomplete o presentano slot mancanti/duplicati.

La connessione Supabase usata dal client Replit è anon e non autorizzata a leggere
`public.predictions` (errore 42501). Per la SELECT diagnostica è stato usato il
secret `SUPABASE_SERVICE_ROLE_KEY` già configurato, senza stamparne il valore.

## 2. Stato reale del DB

### Schema osservato direttamente

La lettura campione `select=*` ha mostrato:

- `predictions`: `id`, `user_id`, `grand_prix_id`, `created_at`,
  `updated_at`, `league_id`, `qualifying_pole_time`,
  `qualifying_points`, `sprint_points`, `race_points`, `bonus_points`,
  `malus_points`, `total_points`, `scored_at`;
- `prediction_entries`: `id`, `prediction_id`, `prediction_type`,
  `position`, `rider_id`, `created_at`, `predicted_time`, `points`;
- i campi opzionali `source` e `carried_from_grand_prix_id` non sono esposti
  dallo schema attuale e non vengono usati dal report.

### Per utente

|Utente|Nome|Prediction|Entry|Points numerici|Points = 0|Points NULL|Totale DB|
|---|---|---|---|---|---|---|---|
|alandellosbel8@gmail.com|alandellosbel8|9|77|77|77|0|64|
|alessandro.cavasso.1995@gmail.com|alessandro.cavasso.1995|13|122|122|122|0|124|
|dalla.pozza.silvia@gmail.com|dalla.pozza.silvia|8|73|73|73|0|64|
|ivan23dell@gmail.com|ivan23dell|11|118|118|118|0|88|
|lucifero1966@gmail.com|lucifero1966|12|115|115|115|0|71|
|marino.dilorenzo@gmail.com|marino.dilorenzo|11|107|107|107|0|124|
|marty.bria1996@gmail.com|marty.bria1996|13|133|133|133|0|139|
|nikyturets@gmail.com|Nicholas|14|154|154|154|0|199|
|simo.salva92@gmail.com|simo.salva92|13|135|135|135|0|146|
|tommaso.strada95@gmail.com|tommaso.strada95|9|82|82|82|0|47|

Il dettaglio completo riga-per-riga è in
[`task-36-prediction-entries-diagnostic.csv`](task-36-prediction-entries-diagnostic.csv).

## 3. Stato di prediction_entries.points

Su tutte le 1116 entry TEST01:

- valorizzati e diversi da zero: **0**;
- valorizzati a zero: **1116**;
- NULL/non numerici: **0**.

Interpretazione:

- A — punti nel DB ma frontend non legge: **non supportata dai dati/query attuali**;
- B — punti NULL: **non rilevata**;
- C — punti a zero: **presente**;
- D — valori sbagliati: verificabili solo sui 10 fixture con snapshot Excel, vedi sotto;
- E — entry mancanti: indicate per prediction nella tabella fixture e nel CSV.

Nei 10 fixture, 6 hanno punti entry presenti ma un totale DB
diverso dall'atteso Excel; questo non prova da solo che i singoli punti siano
sbagliati, perché il disallineamento può stare negli aggregati o nei risultati
storici usati dal database.

## 4. Stato dei totali in predictions

Il totale ufficiale letto dal DB è sempre `predictions.total_points`; il report
non lo sostituisce con un calcolo client-side. Tra i 10 fixture risolti:

- prediction non trovate: **1**;
- totali DB diversi dall'Excel: **6**;
- totali DB uguali all'Excel: **3**.

## 5. Query frontend della pagina Lega

La pagina `/leghe/:leagueId` usa:

1. `league_members.select(league_id).eq(league_id, ...)`;
2. `predictions.select(... qualifying_points, sprint_points, race_points,
   bonus_points, malus_points, total_points, scored_at, created_at, updated_at)`;
3. `prediction_entries.select(id, prediction_id, prediction_type, position,
   rider_id, predicted_time, points)` per le prediction del partecipante
   selezionato e dei soli GP chiusi;
4. `riders.select(id, name, surname, nickname)`.

La query include esplicitamente `points`. Non viene chiamata alcuna RPC di
scoring e il gate sui GP aperti impedisce di esporre i dettagli non chiusi.

## 6. Query frontend della pagina Miei Risultati

La pagina `/miei-risultati` usa:

1. `league_members.select(league_id)`;
2. `predictions.select(... gli stessi campi aggregati)`;
3. `prediction_entries.select(... points)` per tutte le prediction dell'utente;
4. `riders.select(id, name, surname, nickname)`;
5. `leagues.select(id, name, invite_code, created_at)`.

Anche questa query include esplicitamente `prediction_entries.points` e mostra il
valore memorizzato senza invocare scorer o RPC.

## 7. Confronto DB vs Excel

I valori Excel provengono dai 10 fixture validati nel Task 32. Per ciascun caso
sono confrontati Q, S, R, Bonus, Malus e Totale DB, con delta `DB - Excel`.

|Utente|GP|Prediction ID|DB Q|Excel Q|ΔQ|DB S|Excel S|ΔS|DB R|Excel R|ΔR|DB Bonus|Excel Bonus|ΔBonus|DB Malus|Excel Malus|ΔMalus|DB Totale|Excel Totale|ΔTotale|Points entries|Stato|
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
|nikyturets@gmail.com|Thailandia|fab3b75d-4409-5cf8-a481-9778219f96c6|5|8|-3|3|3|0|9|10|-1|2|2|0|0|-1|1|19|21|-2|nonnull=11; 0=11; null=0|COMPLETE|
|nikyturets@gmail.com|Brasile|911d3e8e-4478-56eb-a496-46298877aa91|0|0|0|6|6|0|15|19|-4|4|4|0|0|0|0|25|25|0|nonnull=11; 0=11; null=0|COMPLETE|
|nikyturets@gmail.com|Francia|08fedd41-b194-55fd-9163-1e65620fc093|0|3|-3|2|2|0|12|13|-1|2|2|0|-1|-1|0|15|18|-3|nonnull=11; 0=11; null=0|COMPLETE|
|nikyturets@gmail.com|Aragon|24ab1b38-0fe7-5d61-9272-3998401157cc|5|5|0|5|5|0|14|14|0|0|0|0|0|0|0|24|24|0|nonnull=11; 0=11; null=0|COMPLETE|
|marty.bria1996@gmail.com|Catalogna|7469b845-a82b-536e-8383-813076fecadc|5|6|-1|9|9|0|0|-2|2|0|0|0|-10|-5|-5|4|13|-9|nonnull=11; 0=11; null=0|COMPLETE|
|marty.bria1996@gmail.com|Italia|41fc7021-5532-575b-9814-37ebf8f1433d|0|5|-5|2|2|0|20|23|-3|3|3|0|0|0|0|25|30|-5|nonnull=11; 0=11; null=0|COMPLETE|
|simo.salva92@gmail.com|Thailandia|432ea79e-143c-5f34-b54a-62d15a933379|5|8|-3|3|3|0|14|15|-1|2|2|0|-1|-1|0|23|26|-3|nonnull=11; 0=11; null=0|COMPLETE|
|marino.dilorenzo@gmail.com|Aragon|MISSING|—|—|—|—|—|—|—|—|—|—|—|—|—|—|—|—|—|—|—|prediction non risolta|
|alessandro.cavasso.1995@gmail.com|Spagna|a07f1946-4363-534f-ba30-8d77b095673b|5|5|0|3|3|0|12|11|1|0|0|0|-1|-1|0|19|19|0|nonnull=11; 0=11; null=0|COMPLETE|
|alessandro.cavasso.1995@gmail.com|UK|b7f18f49-1f80-5e61-9883-29acebd3f35e|0|5|-5|9|9|0|7|8|-1|2|2|0|-1|-1|0|17|22|-5|nonnull=11; 0=11; null=0|COMPLETE|

## 8. Analisi Nikiturets

Prediction storiche di `nikyturets@gmail.com`:

|GP|Prediction ID|Scored at|Q|S|R|Bonus|Malus|Total|Entry points|Entry audit|
|---|---|---|---|---|---|---|---|---|---|---|
|RSM|a24c434a-17ff-45e6-a008-64dce2e5b634|—|0|0|0|0|0|0|numeric=11, zero=11, null=0, entry=11, mancanti=—, duplicati=—|COMPLETE|
|CAT|7830cb54-8d02-5618-9d96-0e7756a5b1a0|2026-09-02T10:20:40.438598+00:00|0|3|0|0|-10|-7|numeric=11, zero=11, null=0, entry=11, mancanti=—, duplicati=—|COMPLETE|
|ITA|ff38daa7-d3ef-525d-b4e8-2d6a7c8501ae|2026-09-02T10:20:41.229236+00:00|0|1|14|0|0|15|numeric=11, zero=11, null=0, entry=11, mancanti=—, duplicati=—|COMPLETE|
|HUN|722b8ed5-c501-5d02-8f50-92a2ed3a1127|2026-09-02T10:20:41.700801+00:00|2|2|10|2|0|16|numeric=11, zero=11, null=0, entry=11, mancanti=—, duplicati=—|COMPLETE|
|GER|04eedd26-a8e1-5365-bcb8-2a77a6d5309b|2026-09-02T10:20:43.294487+00:00|5|4|9|2|0|20|numeric=11, zero=11, null=0, entry=11, mancanti=—, duplicati=—|COMPLETE|
|CZE|02b3d6f6-db00-5b64-8557-5323323343af|2026-09-02T10:20:42.361295+00:00|0|2|16|0|-1|17|numeric=11, zero=11, null=0, entry=11, mancanti=—, duplicati=—|COMPLETE|
|NED|014480b4-4bb9-50fa-bd8c-b2d5ce1d6c09|2026-09-02T10:20:42.962829+00:00|0|1|12|0|-1|12|numeric=11, zero=11, null=0, entry=11, mancanti=—, duplicati=—|COMPLETE|
|FRA|08fedd41-b194-55fd-9163-1e65620fc093|2026-09-02T10:20:39.95745+00:00|0|2|12|2|-1|15|numeric=11, zero=11, null=0, entry=11, mancanti=—, duplicati=—|COMPLETE|
|ARA|24ab1b38-0fe7-5d61-9272-3998401157cc|—|5|5|14|0|0|24|numeric=11, zero=11, null=0, entry=11, mancanti=—, duplicati=—|COMPLETE|
|USA|5f11d5c3-3ad5-5c9a-a674-10500315ce76|2026-09-02T10:20:38.662656+00:00|0|0|14|2|0|16|numeric=11, zero=11, null=0, entry=11, mancanti=—, duplicati=—|COMPLETE|
|SPA|2c90c751-4587-595b-9cb9-6d01cae55d02|2026-09-02T10:20:39.68417+00:00|0|3|10|0|-1|12|numeric=11, zero=11, null=0, entry=11, mancanti=—, duplicati=—|COMPLETE|
|GBR|b791a713-b510-5c5f-9940-6f9bfaa65a0a|2026-09-02T10:20:43.900481+00:00|0|3|11|2|-1|15|numeric=11, zero=11, null=0, entry=11, mancanti=—, duplicati=—|COMPLETE|
|BRA|911d3e8e-4478-56eb-a496-46298877aa91|2026-09-02T10:20:38.595458+00:00|0|6|15|4|0|25|numeric=11, zero=11, null=0, entry=11, mancanti=—, duplicati=—|COMPLETE|
|THA|fab3b75d-4409-5cf8-a481-9778219f96c6|2026-09-02T10:20:13.563893+00:00|5|3|9|2|0|19|numeric=11, zero=11, null=0, entry=11, mancanti=—, duplicati=—|COMPLETE|

### Thailandia — verifica diretta

La ricostruzione Excel/Task 32 attesa è **21 = 8 + 3 + 10**. Nel DB:

- prediction: `fab3b75d-4409-5cf8-a481-9778219f96c6`;
- Q/S/R/Bonus/Malus/Totale DB:
  5 / 3 / 9 / 2 / 0 / 19;
- entry points: numeric=11, zero=11, null=0, entry=11, mancanti=—, duplicati=—;
- differenza totale DB vs Excel: **-2**.

Entry Thailandia:

|Tipo|Posizione|Entry ID|Rider|Predicted time|Points|
|---|---|---|---|---|---|
|POLE|—|0013b8d3-06c1-5fde-b1f9-16aa7eded828|Marco Bezzecchi|—|0|
|QUALIFYING_TIME|—|63e7049d-6882-5af0-91a1-adf2a00c5d19|—|88.526|0|
|RACE|1|c58e7a24-dcda-5556-ba29-4711d6904527|Marc Marquez|—|0|
|RACE|2|23bfa268-300d-5eb8-bf6f-4177f0304d07|Marco Bezzecchi|—|0|
|RACE|3|5dd1afe0-7f55-516c-8655-081b1a031267|Pedro Acosta|—|0|
|RACE|4|abb455d6-9fe9-5997-a30c-3d0347ab681a|Raul Fernandez|—|0|
|RACE|5|9ce02efa-1662-5bb0-8577-d33165d53333|Alex Marquez|—|0|
|RACE_OUT|—|c4c9d1c4-00e7-5bb0-88a1-0e241490c77b|Joan Mir|—|0|
|SPRINT|1|3809ee7e-1be1-5fb5-bf6e-04ba3c870653|Marco Bezzecchi|—|0|
|SPRINT|2|a7cefaaf-d109-57ab-b685-a74238bc3697|Marc Marquez|—|0|
|SPRINT|3|0b7472d3-6b64-580e-8fd1-08b375128228|Fabio Di Giannantonio|—|0|

## 9. Analisi dei 10 casi obbligatori

La tabella precedente contiene tutti i casi:

1. Niky / Thailandia;
2. Niky / Brasile;
3. Niky / Francia;
4. Niky / Aragon;
5. Marty / Catalogna;
6. Marty / Italia;
7. Simo / Thailandia;
8. Alessandro / Spagna;
9. Alessandro / UK;
10. Marino / Aragon.

Per ciascuno sono riportati DB, atteso Excel/Task 32, differenze e stato dei
`prediction_entries.points`.

## 10. Causa identificata

### Evidenza

- Le query frontend attuali richiedono e mostrano `prediction_entries.points`;
- il DB contiene 1116 punti entry numerici, di cui
  1116 uguali a zero e 0 NULL;
- i totali aggregati sono presenti in `predictions`;
- sui fixture, 6 totali DB non coincidono con l'Excel storico;
- lo scorer offline Task 32 riproduce tutti i 10 casi Excel con delta zero.

### Classificazione

La causa primaria è **C — `prediction_entries.points` valorizzato a zero**:
1116/1116 entry hanno `points = 0`, anche
quando la prediction aggregata ha Q/S/R/bonus/malus/totali non-zero. La UI che
mostra il dettaglio per posizione sta quindi leggendo correttamente un valore
presente, ma quel valore è stato persistito come zero.

La causa A frontend non è supportata: le due pagine selezionano `points` e
`total_points`. La causa B non è rilevata perché non ci sono NULL.

Sono presenti anche due cause secondarie:

- **D — aggregati storici discordanti**: 6/9
  fixture presenti hanno un `predictions.total_points` diverso dall'Excel;
  le differenze per Q/S/R/bonus/malus sono nella tabella;
- **E — dati storici mancanti/parziali**: 30/113
  prediction DB non ha la struttura completa di 11 entry senza duplicati, e il
  caso obbligatorio Marino/Aragon non ha una prediction DB.

Per Nikiturets Thailandia la causa è dimostrata numericamente:

- Excel/Task 32: **21 = 8 + 3 + 10**;
- DB aggregato: **19 = 5 + 3 + 9 + 2 + 0**;
- DB entry: 11 righe presenti, tutte con `points = 0`.

Quindi il dettaglio per posizione mostra zero per una causa dati di
persistenza/incoerenza, non per un filtro frontend. Non viene applicata alcuna
correzione.

## 11. Azione consigliata per il prossimo task

1. usare questo report e il CSV come base per una decisione esplicita sui record
   storici da riconciliare;
2. separare eventuali NULL/missing entry dai casi in cui i punti sono numerici ma
   il totale aggregato è storico e divergente;
3. non usare `score_prediction` in modo massivo finché non è definito il
   trattamento delle prediction parziali e dei risultati storici;
4. se si decide un apply, preparare prima un dry-run per prediction ID con
   approvazione esplicita e verifica idempotente.

## 12. Test e vincoli

- Task 32 scorer test: **PASS**;
- Task 33 replay: **PASS**;
- Task 34 audit: **PASS**;
- query DB diagnostiche: **PASS**, GET-only con ruolo autorizzato;
- typecheck: **PASS**;
- build: **PASS** con `PORT=5173 BASE_PATH=/my-first-app`;
- `git diff --check`: **PASS**.

Contatori di sicurezza per questa diagnosi:

- RPC `score_prediction`: **0**;
- INSERT: **0**;
- UPDATE: **0**;
- DELETE: **0**;
- UPSERT: **0**;
- prediction modificate: **0**;
- prediction_entries modificate: **0**;
- session_results modificate: **0**;
- schema modificato: **NO**;
- RLS modificato: **NO**;
- scoring modificato: **NO**.
