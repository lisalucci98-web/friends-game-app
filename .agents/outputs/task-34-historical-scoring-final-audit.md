# Task 34 — Audit finale e riconciliazione scoring storico FantaMotoGP

## 1. Executive summary

- Audit **100% read-only** completato sulla lega **TEST01**.
- Prediction storiche risolte: **111**.
- Complete valutate: **81**.
- Partial escluse dal confronto numerico: **30**.
- Extra DB fuori sorgente storica: **2**.
- MATCH: **0**.
- DATA_DIFFERENCE: **8**.
- SCORING_DIFFERENCE: **0**.
- MISSING_DATA: **0**.
- HISTORICAL_UNCERTAIN: **73**.

Interpretazione prudente: una differenza non viene attribuita alla logica database senza una snapshot Excel comparabile. I casi noti Task 32 sono gli unici usati per distinguere in modo dimostrabile dati storici diversi da scoring diverso.

## 2. Dataset analizzato

- Righe sorgente analizzate: **139**.
- Prediction nella lega TEST01: **113**.
- Prediction storiche risolte: **111**.
- Entry storiche lette: **1094**.
- Complete già marcate scored_at: **81**.
- Complete senza scored_at: **0**.
- Partial già marcate scored_at: **13**.
- Partial senza scored_at: **17**.
- Errori di selezione: **0**.

## 3. Metodo di scoring utilizzato

- Scorer: **identico alla specifica offline validata nel Task 32**.
- Input prediction: `prediction_entries` storiche lette via GET.
- Input ufficiale: `session_results` live chiusi per Q, Sprint e Gara.
- `QUALIFYING_TIME` numerico nel DB convertito solo nel confine del replay in `MM:SS.mmm`.
- Breakdown slot calcolato con le stesse matrici Excel, senza una nuova interpretazione.
- Qatar non viene ricostruito se manca una copertura ufficiale sufficiente.

## 4. Tabella completa delle prediction COMPLETE

| Utente | GP | Prediction ID | DB Q | Calc Q | ΔQ | DB S | Calc S | ΔS | DB R | Calc R | ΔR | DB Bonus | Calc Bonus | DB Malus | Calc Malus | DB Totale | Calc Totale | ΔTotale | Classificazione |
|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| dalla.pozza.silvia | THA | 1a21c835-02f0-5d59-8423-858e67404bbe | 2 | 2 | 0 | 1 | 0 | 1 | 9 | 2 | 7 | 0 | 0 | -1 | -1 | 11 | 4 | 7 | HISTORICAL_UNCERTAIN |
| tommaso.strada95 | THA | e6d60b63-c043-5256-bc4e-a4d8d45b3bfc | 2 | 2 | 0 | 1 | 0 | 1 | 9 | 4 | 5 | 0 | 0 | -1 | -1 | 11 | 6 | 5 | HISTORICAL_UNCERTAIN |
| ivan23dell | THA | 144011fd-73f4-590a-a201-8056b2f9ade0 | 5 | 5 | 0 | 1 | 1 | 0 | 7 | 7 | 0 | 0 | 0 | 0 | -1 | 13 | 13 | 0 | HISTORICAL_UNCERTAIN |
| alessandro.cavasso.1995 | THA | 31ab9ae6-ad91-51d6-99cc-afe1aabe8964 | 5 | 6 | -1 | 1 | 1 | 0 | 11 | 6 | 5 | 2 | 2 | -1 | -1 | 18 | 13 | 5 | HISTORICAL_UNCERTAIN |
| lucifero1966 | THA | 526db0a3-d08c-5c4d-a148-08d38cb9828c | 2 | 5 | -3 | 1 | 2 | -1 | 7 | 2 | 5 | 0 | 0 | 0 | -1 | 10 | 9 | 1 | HISTORICAL_UNCERTAIN |
| simo.salva92 | THA | 432ea79e-143c-5f34-b54a-62d15a933379 | 5 | 8 | -3 | 3 | 4 | -1 | 14 | 4 | 10 | 2 | 2 | -1 | -1 | 23 | 16 | 7 | DATA_DIFFERENCE |
| marty.bria1996 | THA | 45cc290b-0221-52b6-9138-7dabd5808b66 | 5 | 8 | -3 | 3 | 4 | -1 | 9 | 2 | 7 | 0 | 0 | -1 | -1 | 16 | 14 | 2 | HISTORICAL_UNCERTAIN |
| Nicholas | THA | fab3b75d-4409-5cf8-a481-9778219f96c6 | 5 | 8 | -3 | 3 | 4 | -1 | 9 | 5 | 4 | 2 | 2 | 0 | -1 | 19 | 17 | 2 | DATA_DIFFERENCE |
| dalla.pozza.silvia | BRA | 5403b20f-b7ac-5722-b2c2-fe4ef053cf67 | 0 | 0 | 0 | 0 | 0 | 0 | 9 | 1 | 8 | 0 | 0 | 0 | 0 | 9 | 1 | 8 | HISTORICAL_UNCERTAIN |
| tommaso.strada95 | BRA | 6fe907e4-ef7b-5743-938c-af9d35dd5cb6 | 0 | 0 | 0 | 2 | 0 | 2 | 11 | 3 | 8 | 2 | 2 | 0 | 0 | 15 | 3 | 12 | HISTORICAL_UNCERTAIN |
| marino.dilorenzo | BRA | c1f0c3da-0faa-50b3-9ccc-99a0e6c3c835 | 0 | 0 | 0 | 4 | 0 | 4 | 10 | 3 | 7 | 2 | 2 | -1 | -1 | 15 | 3 | 12 | HISTORICAL_UNCERTAIN |
| ivan23dell | BRA | 88254d4e-677f-5cce-ab97-1f2be28a4805 | 0 | 0 | 0 | 3 | 0 | 3 | 7 | 1 | 6 | 0 | 0 | 0 | 0 | 10 | 1 | 9 | HISTORICAL_UNCERTAIN |
| alessandro.cavasso.1995 | BRA | c8b2f9a7-e7f6-5bad-8bde-015ed67cfa1d | 0 | 0 | 0 | 6 | 0 | 6 | 10 | 3 | 7 | 2 | 2 | 0 | 0 | 18 | 3 | 15 | HISTORICAL_UNCERTAIN |
| simo.salva92 | BRA | 8db2ad27-5bb1-5162-b627-0fc84ec25aad | 0 | 0 | 0 | 1 | 0 | 1 | 13 | 5 | 8 | 4 | 2 | 0 | 0 | 18 | 5 | 13 | HISTORICAL_UNCERTAIN |
| marty.bria1996 | BRA | 07b30444-e140-557f-acd6-6ce07eaaadb0 | 0 | 1 | -1 | 2 | 0 | 2 | 8 | 5 | 3 | 2 | 2 | 0 | 0 | 12 | 6 | 6 | HISTORICAL_UNCERTAIN |
| Nicholas | BRA | 911d3e8e-4478-56eb-a496-46298877aa91 | 0 | 0 | 0 | 6 | 0 | 6 | 15 | 3 | 12 | 4 | 2 | 0 | 0 | 25 | 3 | 22 | DATA_DIFFERENCE |
| Nicholas | USA | 5f11d5c3-3ad5-5c9a-a674-10500315ce76 | 0 | 1 | -1 | 0 | 4 | -4 | 14 | 4 | 10 | 2 | 2 | 0 | 0 | 16 | 9 | 7 | HISTORICAL_UNCERTAIN |
| ivan23dell | USA | 4a055cc2-00f7-549c-aa19-dee4e21dbe14 | 0 | 3 | -3 | 0 | 1 | -1 | 16 | 4 | 12 | 2 | 2 | 0 | 0 | 18 | 8 | 10 | HISTORICAL_UNCERTAIN |
| alandellosbel8 | USA | 5d42622c-45f8-54e3-94c5-862d0c513982 | 2 | 7 | -5 | 0 | 6 | -6 | 11 | 6 | 5 | 4 | 2 | 0 | 0 | 17 | 19 | -2 | HISTORICAL_UNCERTAIN |
| marino.dilorenzo | USA | 5a55b2e0-2e55-536d-acca-0e76bb711c8c | 0 | 1 | -1 | 0 | 1 | -1 | 12 | 4 | 8 | 0 | 0 | 0 | 0 | 12 | 6 | 6 | HISTORICAL_UNCERTAIN |
| alessandro.cavasso.1995 | USA | 720df8c6-0369-5339-a00a-da6174e45164 | 0 | 3 | -3 | 0 | 4 | -4 | 10 | 8 | 2 | 2 | 2 | 0 | 0 | 12 | 15 | -3 | HISTORICAL_UNCERTAIN |
| dalla.pozza.silvia | USA | 508822d0-a548-5f89-9d97-3fae293309f5 | 0 | 0 | 0 | 0 | 3 | -3 | 14 | 4 | 10 | 2 | 2 | 0 | 0 | 16 | 7 | 9 | HISTORICAL_UNCERTAIN |
| lucifero1966 | USA | 48ac4094-c3cd-5be4-8fc5-840ea80965ba | 0 | 0 | 0 | 1 | 4 | -3 | 9 | 3 | 6 | 2 | 2 | 0 | 0 | 12 | 7 | 5 | HISTORICAL_UNCERTAIN |
| simo.salva92 | USA | 916b868f-9dc6-54c7-b298-3422566dd325 | 2 | 2 | 0 | 0 | 4 | -4 | 8 | 4 | 4 | 0 | 0 | 0 | 0 | 10 | 10 | 0 | HISTORICAL_UNCERTAIN |
| marty.bria1996 | USA | ada70f36-e9fb-5b28-a129-f0d7cc63a4f1 | 2 | 2 | 0 | 1 | 1 | 0 | 5 | 8 | -3 | 2 | 2 | -1 | -1 | 9 | 11 | -2 | HISTORICAL_UNCERTAIN |
| alessandro.cavasso.1995 | SPA | a07f1946-4363-534f-ba30-8d77b095673b | 5 | 5 | 0 | 3 | 3 | 0 | 12 | 2 | 10 | 0 | 0 | -1 | -1 | 19 | 10 | 9 | DATA_DIFFERENCE |
| simo.salva92 | SPA | 1eabe6fb-a2f5-589f-8dfd-a2f94635289a | 0 | 3 | -3 | 3 | 3 | 0 | 11 | 6 | 5 | 0 | 0 | -1 | -1 | 13 | 12 | 1 | HISTORICAL_UNCERTAIN |
| marty.bria1996 | SPA | 51824f4f-6501-5a8f-b013-48342a40257c | 0 | 5 | -5 | 3 | 1 | 2 | 7 | 4 | 3 | 0 | 0 | -1 | -1 | 9 | 10 | -1 | HISTORICAL_UNCERTAIN |
| ivan23dell | SPA | 80eff41b-c0c4-5483-9eec-e93b6b603eeb | 5 | 5 | 0 | 3 | 6 | -3 | 7 | 8 | -1 | 0 | 0 | -1 | -1 | 14 | 19 | -5 | HISTORICAL_UNCERTAIN |
| Nicholas | SPA | 2c90c751-4587-595b-9cb9-6d01cae55d02 | 0 | 0 | 0 | 3 | 3 | 0 | 10 | 6 | 4 | 0 | 0 | -1 | -1 | 12 | 9 | 3 | HISTORICAL_UNCERTAIN |
| lucifero1966 | SPA | e2df7316-a5aa-566e-ae95-4491ea4e70b9 | 0 | 0 | 0 | 4 | 3 | 1 | 7 | 7 | 0 | 0 | 0 | 0 | -1 | 11 | 10 | 1 | HISTORICAL_UNCERTAIN |
| dalla.pozza.silvia | SPA | 45921e31-65c3-51d2-abcd-1785c59d8e70 | 0 | 0 | 0 | 9 | 0 | 9 | 8 | 4 | 4 | 0 | 0 | 0 | -1 | 17 | 4 | 13 | HISTORICAL_UNCERTAIN |
| marino.dilorenzo | FRA | 8ba5e5cf-560b-5e92-96ea-d5fb6d37b38f | 0 | 3 | -3 | 3 | 3 | 0 | 11 | 6 | 5 | 2 | 2 | 0 | -1 | 16 | 12 | 4 | HISTORICAL_UNCERTAIN |
| Nicholas | FRA | 08fedd41-b194-55fd-9163-1e65620fc093 | 0 | 3 | -3 | 2 | 3 | -1 | 12 | 6 | 6 | 2 | 2 | -1 | -1 | 15 | 12 | 3 | DATA_DIFFERENCE |
| ivan23dell | FRA | fa025129-9fb7-57d6-a42c-a8db79a8b260 | 0 | 3 | -3 | 2 | 3 | -1 | 7 | 3 | 4 | 0 | 0 | 0 | -1 | 9 | 9 | 0 | HISTORICAL_UNCERTAIN |
| tommaso.strada95 | FRA | 66320ba5-f9c3-593b-8a70-ff1b0c923753 | 5 | 6 | -1 | 2 | 3 | -1 | 0 | 7 | -7 | 2 | 2 | -5 | -1 | 4 | 16 | -12 | HISTORICAL_UNCERTAIN |
| alandellosbel8 | FRA | 2d169a63-1f23-5ef7-aee0-85cb39e4d5f8 | 0 | 0 | 0 | 2 | 3 | -1 | 4 | 6 | -2 | 2 | 2 | 0 | -1 | 8 | 9 | -1 | HISTORICAL_UNCERTAIN |
| Nicholas | CAT | 7830cb54-8d02-5618-9d96-0e7756a5b1a0 | 0 | 1 | -1 | 3 | 0 | 3 | 0 | 12 | -12 | 0 | 0 | -10 | -1 | -7 | 13 | -20 | HISTORICAL_UNCERTAIN |
| tommaso.strada95 | CAT | bbc97158-67e6-5bc2-95f1-38d847ce6438 | 0 | 0 | 0 | 4 | 0 | 4 | 0 | 5 | -5 | 0 | 0 | -10 | -1 | -6 | 5 | -11 | HISTORICAL_UNCERTAIN |
| dalla.pozza.silvia | CAT | a80d6fac-140e-532b-9e1e-e6b75afea429 | 0 | 0 | 0 | 0 | 1 | -1 | 0 | 3 | -3 | 0 | 0 | -10 | -1 | -10 | 4 | -14 | HISTORICAL_UNCERTAIN |
| marino.dilorenzo | CAT | 3c763d2d-7544-5a60-a020-b43041031190 | 0 | 5 | -5 | 3 | 0 | 3 | 0 | 7 | -7 | 0 | 0 | -10 | -1 | -7 | 12 | -19 | HISTORICAL_UNCERTAIN |
| alessandro.cavasso.1995 | CAT | 143313aa-fe16-533b-9ba9-d0e477618007 | 5 | 6 | -1 | 3 | 0 | 3 | 0 | 18 | -18 | 0 | 1 | -10 | -1 | -2 | 24 | -26 | HISTORICAL_UNCERTAIN |
| ivan23dell | CAT | 508e4bf7-a0b4-5d90-a2be-b17297d9ee34 | 0 | 3 | -3 | 1 | 0 | 1 | 0 | 2 | -2 | 0 | 0 | -10 | 0 | -9 | 5 | -14 | HISTORICAL_UNCERTAIN |
| marty.bria1996 | CAT | 7469b845-a82b-536e-8383-813076fecadc | 5 | 6 | -1 | 9 | 0 | 9 | 0 | 11 | -11 | 0 | 0 | -10 | -1 | 4 | 17 | -13 | DATA_DIFFERENCE |
| simo.salva92 | CAT | 714a658f-8444-5349-8652-0926d97752e5 | 0 | 1 | -1 | 3 | 0 | 3 | 0 | 11 | -11 | 0 | 0 | -10 | -1 | -7 | 12 | -19 | HISTORICAL_UNCERTAIN |
| marty.bria1996 | ITA | 41fc7021-5532-575b-9814-37ebf8f1433d | 0 | 5 | -5 | 2 | 0 | 2 | 20 | 2 | 18 | 3 | 0 | 0 | 0 | 25 | 7 | 18 | DATA_DIFFERENCE |
| simo.salva92 | ITA | fd21a338-370d-53ed-9397-e2dca9e4de18 | 0 | 5 | -5 | 0 | 0 | 0 | 12 | 2 | 10 | 0 | 0 | 0 | 0 | 12 | 7 | 5 | HISTORICAL_UNCERTAIN |
| Nicholas | ITA | ff38daa7-d3ef-525d-b4e8-2d6a7c8501ae | 0 | 1 | -1 | 1 | 0 | 1 | 14 | 2 | 12 | 0 | 0 | 0 | 0 | 15 | 3 | 12 | HISTORICAL_UNCERTAIN |
| ivan23dell | ITA | 172c1292-20d9-5752-b3d4-4e1714399c83 | 0 | 0 | 0 | 3 | 0 | 3 | 6 | 2 | 4 | 0 | 0 | 0 | 0 | 9 | 2 | 7 | HISTORICAL_UNCERTAIN |
| tommaso.strada95 | ITA | fd13442f-c8ed-52b2-b4c0-775127f03b57 | 0 | 1 | -1 | 0 | 0 | 0 | 7 | 2 | 5 | 0 | 0 | 0 | 0 | 7 | 3 | 4 | HISTORICAL_UNCERTAIN |
| Nicholas | HUN | 722b8ed5-c501-5d02-8f50-92a2ed3a1127 | 2 | 3 | -1 | 2 | 2 | 0 | 10 | 2 | 8 | 2 | 2 | 0 | -1 | 16 | 7 | 9 | HISTORICAL_UNCERTAIN |
| marino.dilorenzo | HUN | 0014ec76-bca0-549a-96c0-a29e19de94d1 | 2 | 3 | -1 | 4 | 4 | 0 | 10 | 0 | 10 | 0 | 0 | 0 | -1 | 16 | 7 | 9 | HISTORICAL_UNCERTAIN |
| alandellosbel8 | HUN | e0ec1ef5-b6a5-5eb0-af61-a4fef358a379 | 0 | 0 | 0 | 4 | 4 | 0 | 10 | 6 | 4 | 2 | 2 | 0 | -1 | 16 | 10 | 6 | HISTORICAL_UNCERTAIN |
| tommaso.strada95 | HUN | 5712b709-a7bd-59b6-90f9-755f8fa74867 | 5 | 6 | -1 | 1 | 1 | 0 | 6 | 2 | 4 | 2 | 2 | 0 | -1 | 14 | 9 | 5 | HISTORICAL_UNCERTAIN |
| marty.bria1996 | HUN | 8336da4e-8667-5600-9b5d-6862dc2186c9 | 2 | 3 | -1 | 6 | 6 | 0 | 10 | -1 | 11 | 0 | 0 | -5 | -5 | 13 | 8 | 5 | HISTORICAL_UNCERTAIN |
| simo.salva92 | HUN | 48e6098f-7fc2-5054-bc44-3af0f5e61097 | 2 | 5 | -3 | 4 | 4 | 0 | 8 | 1 | 7 | 0 | 0 | -5 | -5 | 9 | 10 | -1 | HISTORICAL_UNCERTAIN |
| alessandro.cavasso.1995 | HUN | 39c6ed23-b794-5e63-8202-2cc08b384c5f | 5 | 5 | 0 | 1 | 1 | 0 | 6 | -1 | 7 | 2 | 2 | -5 | -5 | 9 | 5 | 4 | HISTORICAL_UNCERTAIN |
| ivan23dell | HUN | 17096295-2e54-5f4e-a6b8-1a88d3294407 | 0 | 5 | -5 | 0 | 0 | 0 | 3 | 4 | -1 | 0 | 0 | 0 | -5 | 3 | 9 | -6 | HISTORICAL_UNCERTAIN |
| Nicholas | CZE | 02b3d6f6-db00-5b64-8557-5323323343af | 0 | 0 | 0 | 2 | 1 | 1 | 16 | 2 | 14 | 0 | 0 | -1 | -1 | 17 | 3 | 14 | HISTORICAL_UNCERTAIN |
| lucifero1966 | CZE | 425a1555-a95f-59ff-8692-9b2a2a2c79e2 | 0 | 3 | -3 | 4 | 1 | 3 | 12 | 2 | 10 | 0 | 0 | 0 | 0 | 16 | 6 | 10 | HISTORICAL_UNCERTAIN |
| marino.dilorenzo | CZE | f8ef9830-5b7e-5268-bbd0-c2d43c6101e5 | 0 | 5 | -5 | 4 | 0 | 4 | 10 | 6 | 4 | 0 | 0 | -1 | -1 | 13 | 11 | 2 | HISTORICAL_UNCERTAIN |
| alessandro.cavasso.1995 | CZE | 89a0489c-a9b3-57ff-b65a-cab4151296eb | 0 | 3 | -3 | 4 | 1 | 3 | 8 | 4 | 4 | 0 | 0 | 0 | 0 | 12 | 8 | 4 | HISTORICAL_UNCERTAIN |
| ivan23dell | CZE | 53c8ee16-dd4d-5d27-a426-5c298fa39c12 | 0 | 10 | -10 | 3 | 1 | 2 | 2 | 10 | -8 | 0 | 0 | 0 | -1 | 5 | 21 | -16 | HISTORICAL_UNCERTAIN |
| marty.bria1996 | CZE | f14b1914-2be9-5500-ba2d-caeef9e08740 | 0 | 1 | -1 | 1 | 1 | 0 | 12 | 4 | 8 | 2 | 2 | 0 | 0 | 15 | 6 | 9 | HISTORICAL_UNCERTAIN |
| simo.salva92 | CZE | 62e85bd7-3494-5be1-8a42-6dfd6a7ddc22 | 0 | 1 | -1 | 4 | 0 | 4 | 12 | 2 | 10 | 0 | 0 | 0 | 0 | 16 | 3 | 13 | HISTORICAL_UNCERTAIN |
| marino.dilorenzo | NED | 4098ed9c-8810-5fdc-872a-56f87991891d | 0 | 1 | -1 | 1 | 0 | 1 | 12 | 0 | 12 | 0 | 0 | -1 | -1 | 12 | 1 | 11 | HISTORICAL_UNCERTAIN |
| Nicholas | NED | 014480b4-4bb9-50fa-bd8c-b2d5ce1d6c09 | 0 | 1 | -1 | 1 | 0 | 1 | 12 | 0 | 12 | 0 | 0 | -1 | -1 | 12 | 1 | 11 | HISTORICAL_UNCERTAIN |
| simo.salva92 | NED | 24f6473a-1e64-5faf-94f7-a931e8d043b1 | 0 | 3 | -3 | 0 | 0 | 0 | 7 | 3 | 4 | 2 | 2 | 0 | -1 | 9 | 6 | 3 | HISTORICAL_UNCERTAIN |
| marty.bria1996 | NED | 697368a0-0652-57c0-a2e9-bb028efe3520 | 0 | 5 | -5 | 1 | 0 | 1 | 7 | 1 | 6 | 0 | 0 | 0 | -1 | 8 | 6 | 2 | HISTORICAL_UNCERTAIN |
| Nicholas | GER | 04eedd26-a8e1-5365-bcb8-2a77a6d5309b | 5 | 8 | -3 | 4 | 4 | 0 | 9 | 5 | 4 | 2 | 2 | 0 | -1 | 20 | 17 | 3 | HISTORICAL_UNCERTAIN |
| marino.dilorenzo | GER | 4dc0b9f8-a5b7-5e6c-a2e1-17c7f5d31d8b | 5 | 10 | -5 | 4 | 1 | 3 | 11 | 3 | 8 | 0 | 0 | 0 | -1 | 20 | 14 | 6 | HISTORICAL_UNCERTAIN |
| alessandro.cavasso.1995 | GER | 15a33dc8-050f-5e2f-8906-8bb0c39a7d3a | 5 | 5 | 0 | 4 | 1 | 3 | 7 | 7 | 0 | 2 | 2 | 0 | -1 | 18 | 13 | 5 | HISTORICAL_UNCERTAIN |
| simo.salva92 | GER | 321fb3ac-a5c1-570f-8f34-63b374869cac | 5 | 6 | -1 | 5 | 4 | 1 | 7 | 5 | 2 | 2 | 2 | 0 | -1 | 19 | 15 | 4 | HISTORICAL_UNCERTAIN |
| marty.bria1996 | GER | 3370161c-d8df-5297-a081-626a50d7bbd2 | 5 | 8 | -3 | 4 | 1 | 3 | 7 | 3 | 4 | 0 | 0 | 0 | -1 | 16 | 12 | 4 | HISTORICAL_UNCERTAIN |
| alessandro.cavasso.1995 | GBR | b7f18f49-1f80-5e61-9883-29acebd3f35e | 0 | 5 | -5 | 9 | 0 | 9 | 7 | 2 | 5 | 2 | 2 | -1 | -1 | 17 | 7 | 10 | DATA_DIFFERENCE |
| simo.salva92 | GBR | 185690e7-f5aa-5b17-9fec-5f39b80f4814 | 0 | 5 | -5 | 6 | 0 | 6 | 10 | 4 | 6 | 2 | 2 | -1 | -1 | 17 | 9 | 8 | HISTORICAL_UNCERTAIN |
| Nicholas | GBR | b791a713-b510-5c5f-9940-6f9bfaa65a0a | 0 | 3 | -3 | 3 | 3 | 0 | 11 | 6 | 5 | 2 | 2 | -1 | -1 | 15 | 12 | 3 | HISTORICAL_UNCERTAIN |
| marty.bria1996 | GBR | 391520e5-1953-59fd-97dd-675d4bb67fcd | 2 | 5 | -3 | 4 | 1 | 3 | 7 | 2 | 5 | 0 | 0 | -1 | -1 | 12 | 8 | 4 | HISTORICAL_UNCERTAIN |
| lucifero1966 | GBR | 887d7439-11aa-538d-9a2b-a2788085f793 | 2 | 7 | -5 | 0 | 3 | -3 | 4 | 2 | 2 | 0 | 0 | -1 | -1 | 5 | 12 | -7 | HISTORICAL_UNCERTAIN |
| lucifero1966 | ARA | 62893502-8b02-5fd9-af57-dbd55fdf650c | 0 | 1 | -1 | 3 | 0 | 3 | 14 | 1 | 13 | 0 | 0 | -1 | -1 | 16 | 2 | 14 | HISTORICAL_UNCERTAIN |
| ivan23dell | ARA | 394de24c-79cb-587e-981b-e73ddd1d42a9 | 5 | 8 | -3 | 1 | 0 | 1 | 5 | 0 | 5 | 0 | 0 | -1 | 0 | 10 | 8 | 2 | HISTORICAL_UNCERTAIN |

## 5. Dettaglio delle discrepanze

Prediction con discrepanza Qualifica: **54**.
Prediction con discrepanza Sprint: **59**.
Prediction con discrepanza Gara: **78**.
Prediction con discrepanza Bonus: **5**.
Prediction con discrepanza Malus: **31**.
Prediction con discrepanza Totale: **78**.

### SCORING_DIFFERENCE

- Nessuna prediction classificata SCORING_DIFFERENCE.

### DATA_DIFFERENCE e HISTORICAL_UNCERTAIN

- **dalla.pozza.silvia@gmail.com / THA** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **tommaso.strada95@gmail.com / THA** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **ivan23dell@gmail.com / THA** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **alessandro.cavasso.1995@gmail.com / THA** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **lucifero1966@gmail.com / THA** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **simo.salva92@gmail.com / THA** → **DATA_DIFFERENCE**: Il replay con gli attuali risultati live non riproduce il valore Excel del caso noto; la snapshot ufficiale storica è diversa o non più disponibile.
- **marty.bria1996@gmail.com / THA** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **nikyturets@gmail.com / THA** → **DATA_DIFFERENCE**: Il replay con gli attuali risultati live non riproduce il valore Excel del caso noto; la snapshot ufficiale storica è diversa o non più disponibile.
- **dalla.pozza.silvia@gmail.com / BRA** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **tommaso.strada95@gmail.com / BRA** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **marino.dilorenzo@gmail.com / BRA** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **ivan23dell@gmail.com / BRA** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **alessandro.cavasso.1995@gmail.com / BRA** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **simo.salva92@gmail.com / BRA** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **marty.bria1996@gmail.com / BRA** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **nikyturets@gmail.com / BRA** → **DATA_DIFFERENCE**: Il replay con gli attuali risultati live non riproduce il valore Excel del caso noto; la snapshot ufficiale storica è diversa o non più disponibile.
- **nikyturets@gmail.com / USA** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **ivan23dell@gmail.com / USA** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **alandellosbel8@gmail.com / USA** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **marino.dilorenzo@gmail.com / USA** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **alessandro.cavasso.1995@gmail.com / USA** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **dalla.pozza.silvia@gmail.com / USA** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **lucifero1966@gmail.com / USA** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **simo.salva92@gmail.com / USA** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **marty.bria1996@gmail.com / USA** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **alessandro.cavasso.1995@gmail.com / SPA** → **DATA_DIFFERENCE**: Il replay con gli attuali risultati live non riproduce il valore Excel del caso noto; la snapshot ufficiale storica è diversa o non più disponibile.
- **simo.salva92@gmail.com / SPA** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **marty.bria1996@gmail.com / SPA** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **ivan23dell@gmail.com / SPA** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **nikyturets@gmail.com / SPA** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **lucifero1966@gmail.com / SPA** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **dalla.pozza.silvia@gmail.com / SPA** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **marino.dilorenzo@gmail.com / FRA** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **nikyturets@gmail.com / FRA** → **DATA_DIFFERENCE**: Il replay con gli attuali risultati live non riproduce il valore Excel del caso noto; la snapshot ufficiale storica è diversa o non più disponibile.
- **ivan23dell@gmail.com / FRA** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **tommaso.strada95@gmail.com / FRA** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **alandellosbel8@gmail.com / FRA** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **nikyturets@gmail.com / CAT** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **tommaso.strada95@gmail.com / CAT** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **dalla.pozza.silvia@gmail.com / CAT** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **marino.dilorenzo@gmail.com / CAT** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **alessandro.cavasso.1995@gmail.com / CAT** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **ivan23dell@gmail.com / CAT** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **marty.bria1996@gmail.com / CAT** → **DATA_DIFFERENCE**: Il replay con gli attuali risultati live non riproduce il valore Excel del caso noto; la snapshot ufficiale storica è diversa o non più disponibile.
- **simo.salva92@gmail.com / CAT** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **marty.bria1996@gmail.com / ITA** → **DATA_DIFFERENCE**: Il replay con gli attuali risultati live non riproduce il valore Excel del caso noto; la snapshot ufficiale storica è diversa o non più disponibile.
- **simo.salva92@gmail.com / ITA** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **nikyturets@gmail.com / ITA** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **ivan23dell@gmail.com / ITA** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **tommaso.strada95@gmail.com / ITA** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **nikyturets@gmail.com / HUN** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **marino.dilorenzo@gmail.com / HUN** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **alandellosbel8@gmail.com / HUN** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **tommaso.strada95@gmail.com / HUN** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **marty.bria1996@gmail.com / HUN** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **simo.salva92@gmail.com / HUN** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **alessandro.cavasso.1995@gmail.com / HUN** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **ivan23dell@gmail.com / HUN** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **nikyturets@gmail.com / CZE** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **lucifero1966@gmail.com / CZE** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **marino.dilorenzo@gmail.com / CZE** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **alessandro.cavasso.1995@gmail.com / CZE** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **ivan23dell@gmail.com / CZE** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **marty.bria1996@gmail.com / CZE** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **simo.salva92@gmail.com / CZE** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **marino.dilorenzo@gmail.com / NED** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **nikyturets@gmail.com / NED** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **simo.salva92@gmail.com / NED** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **marty.bria1996@gmail.com / NED** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **nikyturets@gmail.com / GER** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **marino.dilorenzo@gmail.com / GER** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **alessandro.cavasso.1995@gmail.com / GER** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **simo.salva92@gmail.com / GER** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **marty.bria1996@gmail.com / GER** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **alessandro.cavasso.1995@gmail.com / GBR** → **DATA_DIFFERENCE**: Il replay con gli attuali risultati live non riproduce il valore Excel del caso noto; la snapshot ufficiale storica è diversa o non più disponibile.
- **simo.salva92@gmail.com / GBR** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **nikyturets@gmail.com / GBR** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **marty.bria1996@gmail.com / GBR** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **lucifero1966@gmail.com / GBR** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **lucifero1966@gmail.com / ARA** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.
- **ivan23dell@gmail.com / ARA** → **HISTORICAL_UNCERTAIN**: Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.

## 6. Analisi per GP

| GP | Complete | Match | Data diff | Scoring diff | Missing data | Historical uncertain | Totale DB | Totale ricalcolato |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| ARA | 2 | 0 | 0 | 0 | 0 | 2 | 26 | 10 |
| HUN | 8 | 0 | 0 | 0 | 0 | 8 | 96 | 65 |
| SPA | 7 | 0 | 1 | 0 | 0 | 6 | 95 | 74 |
| GBR | 5 | 0 | 1 | 0 | 0 | 4 | 66 | 48 |
| BRA | 8 | 0 | 1 | 0 | 0 | 7 | 122 | 25 |
| USA | 9 | 0 | 0 | 0 | 0 | 9 | 122 | 92 |
| NED | 4 | 0 | 0 | 0 | 0 | 4 | 41 | 14 |
| CAT | 8 | 0 | 1 | 0 | 0 | 7 | -44 | 92 |
| GER | 5 | 0 | 0 | 0 | 0 | 5 | 93 | 71 |
| ITA | 5 | 0 | 1 | 0 | 0 | 4 | 68 | 22 |
| FRA | 5 | 0 | 1 | 0 | 0 | 4 | 52 | 58 |
| THA | 8 | 0 | 2 | 0 | 0 | 6 | 121 | 92 |
| CZE | 7 | 0 | 0 | 0 | 0 | 7 | 94 | 58 |

## 7. Analisi per utente

| Utente | Prediction complete | Match | Discrepanze | Punti DB | Punti ricalcolati | Δ |
|---|---:|---:|---:|---:|---:|---:|
| alandellosbel8 | 3 | 0 | 3 | 41 | 38 | 3 |
| alessandro.cavasso.1995 | 9 | 0 | 9 | 121 | 98 | 23 |
| dalla.pozza.silvia | 5 | 0 | 5 | 43 | 20 | 23 |
| ivan23dell | 10 | 0 | 10 | 82 | 95 | -13 |
| lucifero1966 | 6 | 0 | 6 | 70 | 46 | 24 |
| marino.dilorenzo | 8 | 0 | 8 | 97 | 66 | 31 |
| marty.bria1996 | 11 | 0 | 11 | 139 | 105 | 34 |
| Nicholas | 12 | 0 | 12 | 175 | 106 | 69 |
| simo.salva92 | 11 | 0 | 11 | 139 | 105 | 34 |
| tommaso.strada95 | 6 | 0 | 6 | 45 | 42 | 3 |

## 8. Casi speciali già noti

- **simo.salva92@gmail.com / GRAND PRIX OF THAILAND**: DATA_DIFFERENCE; fixture Task 32 divergente: atteso 26, replay 16.
- **nikyturets@gmail.com / GRAND PRIX OF THAILAND**: DATA_DIFFERENCE; fixture Task 32 divergente: atteso 21, replay 17.
- **nikyturets@gmail.com / GRAND PRIX OF BRAZIL**: DATA_DIFFERENCE; fixture Task 32 divergente: atteso 25, replay 3.
- **alessandro.cavasso.1995@gmail.com / GRAND PRIX OF SPAIN**: DATA_DIFFERENCE; fixture Task 32 divergente: atteso 19, replay 10.
- **nikyturets@gmail.com / GRAND PRIX DE FRANCE**: DATA_DIFFERENCE; fixture Task 32 divergente: atteso 18, replay 12.
- **marty.bria1996@gmail.com / GRAND PRIX OF CATALONIA**: DATA_DIFFERENCE; fixture Task 32 divergente: atteso 13, replay 17.
- **marty.bria1996@gmail.com / GRAND PRIX OF ITALY**: DATA_DIFFERENCE; fixture Task 32 divergente: atteso 30, replay 7.
- **alessandro.cavasso.1995@gmail.com / GRAND PRIX OF GREAT BRITAIN**: DATA_DIFFERENCE; fixture Task 32 divergente: atteso 22, replay 7.

- Niky / Thailandia: il fixture Task 32 deve produrre **21**.
- Marty / Catalogna: il fixture Task 32 deve produrre **13 = 6 + 9 - 2**.
- Marty / Italia: il fixture Task 32 deve produrre **30** con Bonus A.
- Marino / Aragon: fixture Task 32 verificato offline a **28**; se la prediction DB non è presente, non viene inventata.

## 9. Qatar

- Righe sorgente non vuote: **0**.
- Prediction storiche risolte in TEST01: **0**.
- Copertura live: **nessuna prediction selezionata**.
- Nessun punteggio Qatar viene inventato o ricostruito artificialmente.

## 10. Prediction extra

- **EXTRA_NOT_IN_HISTORICAL_SOURCE** — nikyturets@gmail.com / RSM / a24c434a-17ff-45e6-a008-64dce2e5b634
- **EXTRA_NOT_IN_HISTORICAL_SOURCE** — nikyturets@gmail.com / ARA / 24ab1b38-0fe7-5d61-9272-3998401157cc

## 11. Partial escluse

- Criterio: 1 POLE, 1 QUALIFYING_TIME, 3 SPRINT, 5 RACE, 1 RACE_OUT; nessuna entry viene inventata.

| Utente | GP | Prediction ID | Entry | Mancanti | Slot duplicati | scored_at | Stato |
|---|---|---|---:|---|---|---|---|
| marino.dilorenzo@gmail.com | THA | 2cd7c3e2-d351-5e80-89cf-ee50a610c399 | 8 | SPRINT | — | valorizzato | PARTIAL |
| alandellosbel8@gmail.com | THA | 448d7329-40ea-52be-a32c-441a495e9d48 | 8 | SPRINT | — | valorizzato | PARTIAL |
| alandellosbel8@gmail.com | BRA | 009b2b26-e55b-5a70-92c6-3f764bc42481 | 9 | POLE, QUALIFYING_TIME | — | vuoto | PARTIAL |
| lucifero1966@gmail.com | BRA | 6a1323bd-099a-554c-b971-47ab2966ae9d | 9 | POLE, QUALIFYING_TIME | — | vuoto | PARTIAL |
| tommaso.strada95@gmail.com | USA | 2282b994-2da0-5ae2-9b23-72a2fa1956b5 | 5 | RACE, RACE_OUT | — | valorizzato | PARTIAL |
| alandellosbel8@gmail.com | SPA | 5e3e09ea-1f16-5365-b832-af75c75ed56d | 9 | POLE, QUALIFYING_TIME | — | vuoto | PARTIAL |
| simo.salva92@gmail.com | FRA | f211335c-abd2-5889-b214-b556ece4f652 | 9 | POLE, QUALIFYING_TIME | — | vuoto | PARTIAL |
| marty.bria1996@gmail.com | FRA | 7cd4da5d-d468-5942-a8df-7d6b7e9bdf0b | 9 | POLE, QUALIFYING_TIME | — | vuoto | PARTIAL |
| alessandro.cavasso.1995@gmail.com | FRA | abe4793a-3b72-583b-8f19-12100587b4a2 | 10 | QUALIFYING_TIME | — | vuoto | PARTIAL |
| lucifero1966@gmail.com | CAT | 38c2ce67-9d8f-51ef-a3f1-af58522ae49f | 8 | SPRINT | — | valorizzato | PARTIAL |
| alandellosbel8@gmail.com | ITA | 561cd7b4-938a-54f7-b2dd-1927cbc73e89 | 9 | POLE, QUALIFYING_TIME | — | vuoto | PARTIAL |
| dalla.pozza.silvia@gmail.com | ITA | 14d2c15b-9560-5880-ac3d-1e0c22cc7ddc | 8 | SPRINT | — | valorizzato | PARTIAL |
| marino.dilorenzo@gmail.com | ITA | a6b55890-6edf-5aab-9a98-2dccf2195fa7 | 8 | SPRINT | — | valorizzato | PARTIAL |
| lucifero1966@gmail.com | ITA | 2b6ef934-cdd8-5c7d-9e12-f9c9d78800a6 | 9 | POLE, QUALIFYING_TIME | — | vuoto | PARTIAL |
| alessandro.cavasso.1995@gmail.com | ITA | 5dbd6e94-b2ec-5cac-b038-8a25401fc6fd | 5 | RACE, RACE_OUT | — | valorizzato | PARTIAL |
| dalla.pozza.silvia@gmail.com | HUN | 1eefa24f-5810-5c62-8a06-e8f1be2d166e | 8 | SPRINT | — | valorizzato | PARTIAL |
| lucifero1966@gmail.com | HUN | f3f72104-6cf8-55b3-9946-081210fce12c | 9 | POLE, QUALIFYING_TIME | — | vuoto | PARTIAL |
| lucifero1966@gmail.com | NED | a0442551-6fc6-5503-b4a3-521cdc4b536b | 9 | POLE, QUALIFYING_TIME | — | vuoto | PARTIAL |
| dalla.pozza.silvia@gmail.com | NED | 8d4c1653-1955-506e-9fb9-342c9f04a359 | 2 | SPRINT, RACE, RACE_OUT | — | valorizzato | PARTIAL |
| alessandro.cavasso.1995@gmail.com | NED | c897309b-b3d4-5649-85b6-b43f19f2f524 | 6 | POLE, QUALIFYING_TIME, SPRINT | — | vuoto | PARTIAL |
| lucifero1966@gmail.com | GER | b87a3cf5-802f-5a76-8024-6481084de7e2 | 5 | RACE, RACE_OUT | — | valorizzato | PARTIAL |
| alandellosbel8@gmail.com | GER | a7cbd148-00e0-5769-8162-0e0b24539827 | 3 | POLE, QUALIFYING_TIME, RACE, RACE_OUT | — | vuoto | PARTIAL |
| alandellosbel8@gmail.com | GBR | 1ce67839-1416-50e4-aec1-06930f99db68 | 6 | POLE, QUALIFYING_TIME, SPRINT | — | vuoto | PARTIAL |
| ivan23dell@gmail.com | GBR | 97b81fc0-d4af-573d-b9e5-c66af0b55c27 | 8 | SPRINT | — | valorizzato | PARTIAL |
| tommaso.strada95@gmail.com | GBR | 36607962-920f-580a-8e08-b9961c74de41 | 5 | RACE, RACE_OUT | — | valorizzato | PARTIAL |
| marino.dilorenzo@gmail.com | GBR | 70801d3f-a57b-5b92-84d5-f9f804bc7072 | 3 | POLE, QUALIFYING_TIME, RACE, RACE_OUT | — | vuoto | PARTIAL |
| tommaso.strada95@gmail.com | ARA | 1a197edc-54c2-5ffe-bd0a-c37dccd4414a | 6 | POLE, QUALIFYING_TIME, SPRINT | — | vuoto | PARTIAL |
| simo.salva92@gmail.com | ARA | 6704f3b1-6d0f-5ed3-97f7-2abfad01f499 | 5 | RACE, RACE_OUT | — | valorizzato | PARTIAL |
| alessandro.cavasso.1995@gmail.com | ARA | b7545592-7eaf-588a-ab2d-df5225fc4125 | 2 | POLE, QUALIFYING_TIME, SPRINT, RACE, RACE_OUT | — | vuoto | PARTIAL |
| marty.bria1996@gmail.com | ARA | d88bfd72-f680-559d-ba42-0d54dd703d56 | 3 | POLE, QUALIFYING_TIME, RACE, RACE_OUT | — | vuoto | PARTIAL |

## 12. Sicurezza e verifica finale

- Modalità: **DRY-RUN read-only**.
- RPC `score_prediction`: **0**.
- INSERT: **0**.
- UPDATE: **0**.
- DELETE: **0**.
- UPSERT: **0**.
- Prediction modificate: **0**.
- Prediction entries modificate: **0**.
- Session results modificati: **0**.
- Leagues/league_members modificati: **0**.
- Schema modificato: **NO**.
- RLS modificato: **NO**.
- RPC modificate: **NO**.
- Workflow modificati: **NO**.
- Report scritto: **.agents/outputs/task-34-historical-scoring-final-audit.md**.

## 13. Conclusioni e raccomandazione

- Il database contiene punteggi già valorizzati per le prediction complete, ma il replay storico non coincide integralmente con gli aggregati attuali.
- I casi noti dimostrano che i risultati live possono differire dalla snapshot ufficiale usata dai workbook Excel; questi casi sono classificati DATA_DIFFERENCE quando il fixture è comparabile.
- Le altre discrepanze restano HISTORICAL_UNCERTAIN e non vengono attribuite senza una snapshot storica verificabile.
- Non esiste alcuna base read-only per correggere ora i punteggi o aggiornare la classifica.
- Raccomandazione: mantenere invariati i dati e decidere in un task successivo, con approvazione esplicita, se conservare i punteggi storici Excel separati dagli aggregati applicativi oppure riconciliare solo dopo aver definito la snapshot ufficiale.

