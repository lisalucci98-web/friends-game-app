# Task 37 — Dry-run correzione controllata dello scoring storico

## Esito del gate

- Dry-run read-only: **completato**.
- Scritture Supabase eseguite: **0**.
- RPC di scoring invocate: **0**.
- Apply autorizzabile: **NO — BLOCCATO**.

L’apply è bloccato automaticamente: restano partial, dati storici senza fixture verificabile o risultati ufficiali insufficienti. Non viene eseguito alcun UPDATE e non viene usato score_prediction.

## Perimetro letto

- Righe sorgente: **139**.
- Prediction nella lega TEST01: **113**.
- Prediction risolte nella sorgente storica: **111**.
- Prediction complete: **81**.
- Prediction partial: **30**.
- Prediction extra fuori sorgente: **2**.
- Errori di selezione: **0**.

La selezione storica usa la chiave utente + GP + lega. Le prediction fuori sorgente non sono candidabili anche se hanno risultati replayabili.

## Classificazione dei 10 fixture obbligatori

|Caso|Stato|Prediction ID|DB Q/S/R/T|Proposto Q/S/R/T|Replay live Q/S/R/T|Entry Sprint / Gara|Motivo|
|---|---|---|---|---|---|---|---|
|Niky / Thailandia|FIXTURE_RECONSTRUCTIBLE|fab3b75d-4409-5cf8-a481-9778219f96c6|5/3/9/19|8/3/10/21|8/4/5/17|0,3,0 / 0,3,3,3,0|Entry e replay sulla fotografia ufficiale storica coincidono esattamente con Excel.|
|Niky / Brasile|FIXTURE_RECONSTRUCTIBLE|911d3e8e-4478-56eb-a496-46298877aa91|0/6/15/25|0/6/19/25|0/0/3/3|3,0,3 / 1,3,5,1,5|Entry e replay sulla fotografia ufficiale storica coincidono esattamente con Excel.|
|Niky / Francia|FIXTURE_RECONSTRUCTIBLE|08fedd41-b194-55fd-9163-1e65620fc093|0/2/12/15|3/2/13/18|3/3/6/12|0,1,1 / 5,1,0,5,1|Entry e replay sulla fotografia ufficiale storica coincidono esattamente con Excel.|
|Niky / Aragon|EXTRA_PREDICTION|24ab1b38-0fe7-5d61-9272-3998401157cc|—|—|—|—|Prediction presente nel DB ma fuori dalla sorgente storica: lasciata inalterata.|
|Marty / Catalogna|FIXTURE_RECONSTRUCTIBLE|7469b845-a82b-536e-8383-813076fecadc|5/9/0/4|6/9/-2/13|6/0/11/17|3,3,3 / 0,3,0,0,0|Entry e replay sulla fotografia ufficiale storica coincidono esattamente con Excel.|
|Marty / Italia|FIXTURE_RECONSTRUCTIBLE|41fc7021-5532-575b-9814-37ebf8f1433d|0/2/20/25|5/2/23/30|5/0/2/7|0,1,1 / 5,5,5,0,5|Entry e replay sulla fotografia ufficiale storica coincidono esattamente con Excel.|
|Simo / Thailandia|FIXTURE_RECONSTRUCTIBLE|432ea79e-143c-5f34-b54a-62d15a933379|5/3/14/23|8/3/15/26|8/4/4/16|0,3,0 / 0,3,3,3,5|Entry e replay sulla fotografia ufficiale storica coincidono esattamente con Excel.|
|Marino / Aragon|MISSING_DB_PREDICTION|—|—|—|—|—|Prediction DB non risolta per il caso storico richiesto; nessun record viene creato.|
|Alessandro / Spagna|FIXTURE_RECONSTRUCTIBLE|a07f1946-4363-534f-ba30-8d77b095673b|5/3/12/19|5/3/11/19|5/3/2/10|3,0,0 / 0,3,3,3,3|Entry e replay sulla fotografia ufficiale storica coincidono esattamente con Excel.|
|Alessandro / UK|FIXTURE_RECONSTRUCTIBLE|b7f18f49-1f80-5e61-9883-29acebd3f35e|0/9/7/17|5/9/8/22|5/0/2/7|3,3,3 / 1,5,0,0,1|Entry e replay sulla fotografia ufficiale storica coincidono esattamente con Excel.|

Distribuzione fixture: FIXTURE_RECONSTRUCTIBLE=8, EXTRA_PREDICTION=1, MISSING_DB_PREDICTION=1.

Regole speciali applicate:
- Marino / Aragon è classificato `MISSING_DB_PREDICTION`; nessun record viene creato.
- Nicholas / Aragon e Nicholas / RSM, se fuori dalla sorgente, sono `EXTRA_PREDICTION` e restano inalterati.
- Qatar resta bloccato se la copertura ufficiale non è sufficiente.
- Le prediction partial restano inalterate.

### Extra DB fuori sorgente

|Utente|GP|Prediction ID|Azione|Motivo|
|---|---|---|---|---|
|nikyturets@gmail.com|RSM|a24c434a-17ff-45e6-a008-64dce2e5b634|INALTERATA|Fuori dalla sorgente storica|
|nikyturets@gmail.com|ARA|24ab1b38-0fe7-5d61-9272-3998401157cc|INALTERATA|Fuori dalla sorgente storica|

## Record che verrebbero aggiornati se il gate fosse sbloccato

- Prediction candidate: **8**.
- Prediction aggregate candidate con almeno una differenza: **8**.
- Entry candidate con differenza punti: **40**.

|Utente|GP|Prediction ID|Entry Δ|Entry già a 0|DB Q/S/R/B/M/T|Proposto Q/S/R/B/M/T|Totale replay|
|---|---|---|---|---|---|---|---|
|simo.salva92|THA|432ea79e-143c-5f34-b54a-62d15a933379|8|8|5/3/14/2/-1/23|8/3/15/2/-1/26|26|
|Nicholas|THA|fab3b75d-4409-5cf8-a481-9778219f96c6|9|9|5/3/9/2/0/19|8/3/10/2/-1/21|21|
|Nicholas|BRA|911d3e8e-4478-56eb-a496-46298877aa91|2|2|0/6/15/4/0/25|0/6/19/4/0/25|25|
|alessandro.cavasso.1995|SPA|a07f1946-4363-534f-ba30-8d77b095673b|5|5|5/3/12/0/-1/19|5/3/11/0/-1/19|19|
|Nicholas|FRA|08fedd41-b194-55fd-9163-1e65620fc093|4|4|0/2/12/2/-1/15|3/2/13/2/-1/18|18|
|marty.bria1996|CAT|7469b845-a82b-536e-8383-813076fecadc|6|6|5/9/0/0/-10/4|6/9/-2/0/-5/13|13|
|marty.bria1996|ITA|41fc7021-5532-575b-9814-37ebf8f1433d|3|3|0/2/20/3/0/25|5/2/23/3/0/30|30|
|alessandro.cavasso.1995|GBR|b7f18f49-1f80-5e61-9883-29acebd3f35e|3|3|0/9/7/2/-1/17|5/9/8/2/-1/22|22|

I punti delle entry sono assegnati solo alla relativa previsione: Pole, tempo Qualifica, Sprint P1–P3, Gara P1–P5 e bonus OUT. Bonus top-five/exact-order, penalty OUT e malus L restano componenti aggregate della Gara e non vengono attribuiti artificialmente a un’altra entry.

|Utente|GP|Prediction ID|Tipo|Posizione|Entry ID|DB points|Proposed points|
|---|---|---|---|---|---|---|---|
|simo.salva92|THA|432ea79e-143c-5f34-b54a-62d15a933379|POLE|—|33fb4a6d-660c-58da-9422-88b263f54d7c|0|5|
|simo.salva92|THA|432ea79e-143c-5f34-b54a-62d15a933379|QUALIFYING_TIME|—|34473575-8498-5a43-94de-ac4b2ea62738|0|3|
|simo.salva92|THA|432ea79e-143c-5f34-b54a-62d15a933379|RACE|1|a0edf200-7101-5f79-a8d9-9497123a37fd|0|1|
|simo.salva92|THA|432ea79e-143c-5f34-b54a-62d15a933379|RACE|2|7755ad13-12f7-5369-acf5-a4be2e43caae|0|1|
|simo.salva92|THA|432ea79e-143c-5f34-b54a-62d15a933379|RACE|3|f253f6f6-8e63-5aa7-963d-5525a945c943|0|1|
|simo.salva92|THA|432ea79e-143c-5f34-b54a-62d15a933379|RACE_OUT|—|09230aad-1db7-5dcb-827d-259f72dee1fc|0|2|
|simo.salva92|THA|432ea79e-143c-5f34-b54a-62d15a933379|SPRINT|1|9422e2ec-bd98-5093-b7aa-bce700380dbd|0|3|
|simo.salva92|THA|432ea79e-143c-5f34-b54a-62d15a933379|SPRINT|2|b6ba641b-3c00-5cbb-a6dc-50d7d51533f3|0|1|
|Nicholas|THA|fab3b75d-4409-5cf8-a481-9778219f96c6|POLE|—|0013b8d3-06c1-5fde-b1f9-16aa7eded828|0|5|
|Nicholas|THA|fab3b75d-4409-5cf8-a481-9778219f96c6|QUALIFYING_TIME|—|63e7049d-6882-5af0-91a1-adf2a00c5d19|0|3|
|Nicholas|THA|fab3b75d-4409-5cf8-a481-9778219f96c6|RACE|1|c58e7a24-dcda-5556-ba29-4711d6904527|0|1|
|Nicholas|THA|fab3b75d-4409-5cf8-a481-9778219f96c6|RACE|2|23bfa268-300d-5eb8-bf6f-4177f0304d07|0|1|
|Nicholas|THA|fab3b75d-4409-5cf8-a481-9778219f96c6|RACE|3|5dd1afe0-7f55-516c-8655-081b1a031267|0|1|
|Nicholas|THA|fab3b75d-4409-5cf8-a481-9778219f96c6|RACE|5|9ce02efa-1662-5bb0-8577-d33165d53333|0|1|
|Nicholas|THA|fab3b75d-4409-5cf8-a481-9778219f96c6|RACE_OUT|—|c4c9d1c4-00e7-5bb0-88a1-0e241490c77b|0|2|
|Nicholas|THA|fab3b75d-4409-5cf8-a481-9778219f96c6|SPRINT|1|3809ee7e-1be1-5fb5-bf6e-04ba3c870653|0|3|
|Nicholas|THA|fab3b75d-4409-5cf8-a481-9778219f96c6|SPRINT|2|a7cefaaf-d109-57ab-b685-a74238bc3697|0|1|
|Nicholas|BRA|911d3e8e-4478-56eb-a496-46298877aa91|RACE|2|69c4d0cb-3a5d-57f5-ba42-04c443735bf9|0|1|
|Nicholas|BRA|911d3e8e-4478-56eb-a496-46298877aa91|RACE_OUT|—|4b30b706-ed57-5975-b90e-b16ea455cb76|0|2|
|alessandro.cavasso.1995|SPA|a07f1946-4363-534f-ba30-8d77b095673b|POLE|—|49a5910f-86cb-5180-95c7-db121a9a1d47|0|5|
|alessandro.cavasso.1995|SPA|a07f1946-4363-534f-ba30-8d77b095673b|RACE|1|7a2435ba-991f-5433-b1bf-b41dde10da33|0|1|
|alessandro.cavasso.1995|SPA|a07f1946-4363-534f-ba30-8d77b095673b|RACE|2|6c7037a9-84af-59f6-b26a-4f44c5478f6f|0|1|
|alessandro.cavasso.1995|SPA|a07f1946-4363-534f-ba30-8d77b095673b|RACE|3|86028990-8fea-58a3-b82b-2124c61c8fc5|0|1|
|alessandro.cavasso.1995|SPA|a07f1946-4363-534f-ba30-8d77b095673b|SPRINT|2|70566f40-34f4-5c50-96df-55a212dffafa|0|3|
|Nicholas|FRA|08fedd41-b194-55fd-9163-1e65620fc093|QUALIFYING_TIME|—|db8ccd36-7fc2-5015-8696-001b77f99a37|0|3|
|Nicholas|FRA|08fedd41-b194-55fd-9163-1e65620fc093|RACE|3|a72c03b2-fc13-5861-b256-c6f5100c4ab8|0|5|
|Nicholas|FRA|08fedd41-b194-55fd-9163-1e65620fc093|RACE_OUT|—|fb906e7f-0c37-59d8-8d06-5062b0502c92|0|2|
|Nicholas|FRA|08fedd41-b194-55fd-9163-1e65620fc093|SPRINT|1|6e35c496-78d2-52b9-93bf-a6f2885940bf|0|3|
|marty.bria1996|CAT|7469b845-a82b-536e-8383-813076fecadc|POLE|—|482be463-8311-57e7-b236-df91797c0f36|0|5|
|marty.bria1996|CAT|7469b845-a82b-536e-8383-813076fecadc|QUALIFYING_TIME|—|75aafef2-295c-5624-9bf0-112f6273cf8a|0|1|
|marty.bria1996|CAT|7469b845-a82b-536e-8383-813076fecadc|RACE|1|35dabf99-74fa-5ab5-b440-9348049dd148|0|5|
|marty.bria1996|CAT|7469b845-a82b-536e-8383-813076fecadc|RACE|3|19578ef9-fa3a-58ac-90d1-550979f4f0fd|0|1|
|marty.bria1996|CAT|7469b845-a82b-536e-8383-813076fecadc|RACE|4|3c83d2ef-76d1-5959-bf24-687852121522|0|5|
|marty.bria1996|CAT|7469b845-a82b-536e-8383-813076fecadc|RACE|5|5da30f88-3389-59e2-9f42-6c0d6c3142e6|0|1|
|marty.bria1996|ITA|41fc7021-5532-575b-9814-37ebf8f1433d|QUALIFYING_TIME|—|10325669-8b55-5e7e-8d4a-67b8546c0c4c|0|5|
|marty.bria1996|ITA|41fc7021-5532-575b-9814-37ebf8f1433d|RACE|1|8e821646-a253-57b5-ba0b-e54edd23f965|0|1|
|marty.bria1996|ITA|41fc7021-5532-575b-9814-37ebf8f1433d|RACE|2|800661db-dd7c-5bac-868a-17c8f1beedf1|0|1|
|alessandro.cavasso.1995|GBR|b7f18f49-1f80-5e61-9883-29acebd3f35e|QUALIFYING_TIME|—|8f847e27-44ec-51dd-ae75-d51c566708cf|0|5|
|alessandro.cavasso.1995|GBR|b7f18f49-1f80-5e61-9883-29acebd3f35e|RACE|3|9964ef77-d1ce-51e9-85d8-f79f5aa9370a|0|1|
|alessandro.cavasso.1995|GBR|b7f18f49-1f80-5e61-9883-29acebd3f35e|RACE_OUT|—|cde9b429-a9bc-5b0c-a9d0-376e85348403|0|2|

## Prediction complete senza prova storica sufficiente

- Complete senza fixture Excel canonico utilizzabile: **73**.
- Qatar con copertura insufficiente: **0**.
|Utente|GP|Prediction ID|Motivo|
|---|---|---|---|
|dalla.pozza.silvia|THA|1a21c835-02f0-5d59-8423-858e67404bbe|—|
|tommaso.strada95|THA|e6d60b63-c043-5256-bc4e-a4d8d45b3bfc|—|
|ivan23dell|THA|144011fd-73f4-590a-a201-8056b2f9ade0|—|
|alessandro.cavasso.1995|THA|31ab9ae6-ad91-51d6-99cc-afe1aabe8964|—|
|lucifero1966|THA|526db0a3-d08c-5c4d-a148-08d38cb9828c|—|
|marty.bria1996|THA|45cc290b-0221-52b6-9138-7dabd5808b66|—|
|dalla.pozza.silvia|BRA|5403b20f-b7ac-5722-b2c2-fe4ef053cf67|—|
|tommaso.strada95|BRA|6fe907e4-ef7b-5743-938c-af9d35dd5cb6|—|
|marino.dilorenzo|BRA|c1f0c3da-0faa-50b3-9ccc-99a0e6c3c835|—|
|ivan23dell|BRA|88254d4e-677f-5cce-ab97-1f2be28a4805|—|
|alessandro.cavasso.1995|BRA|c8b2f9a7-e7f6-5bad-8bde-015ed67cfa1d|—|
|simo.salva92|BRA|8db2ad27-5bb1-5162-b627-0fc84ec25aad|—|

Il fatto che un replay corrente sia calcolabile non è sufficiente per applicare quel valore allo storico: per questi record manca una prova Excel comparabile oppure il confronto è condizionato da dati storici non verificabili.

## Blocker del gate

- prediction partial presenti: 30
- prediction complete senza replay Excel canonico verificabile: 73
- fixture obbligatori non tutti ricostruibili: 2

## Decisione

- Fase B non eseguita. Prima di qualunque apply serve risolvere i blocker e ripetere questo dry-run.
- Non sono stati modificati score_prediction, dati dei pronostici, rider, GP, utenti, timestamp o risultati ufficiali.
- La classifica non è stata ricalcolata né alterata.

