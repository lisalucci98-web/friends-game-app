# Task 38 — Mappatura Excel → Prediction DB per scoring storico

- Modalità: **100% READ-ONLY — nessuna scrittura**
- Lega: **FantaTest** (TEST01); stagione **2026**
- Accesso Supabase: **solo GET REST/Auth**
- INSERT/UPDATE/DELETE/UPSERT: **0**
- RPC `score_prediction`: **0**
- Database, workbook, workflow, schema e RLS: **invariati**

## Esito sintetico

- Prediction complete analizzate: **81**
- VERIFIED: **81**
- AMBIGUOUS: **0**
- NOT_FOUND: **0**
- INCOMPLETE_SOURCE: **0**
- MISSING_DATA: **0**
- PARTIAL_EXCLUDED: **30**
- EXTRA_NOT_IN_HISTORICAL_SOURCE: **2**
- Confronti scoring prodotti: **81**

La certezza della mappatura deriva dalla corrispondenza email/utente, GP/file e contenuto completo del pronostico. Gli attuali `prediction_entries.points` pari a zero non sono usati per decidere se una riga è verificata.

## Inventario dei workbook usati

|GP|Codice|File|Fogli|Foglio risultati|Riga risultati|
|---|---|---|---|---|---|
|Thailandia|THA|/tmp/fantamotogp-thailandia.xlsx|Risposte del modulo 1, Risposte del modulo 2, Risposte del modulo 3, Risposte del modulo 4, CLASSIFICA, Grafici|Risposte del modulo 4|2|
|Brasile|BRA|/tmp/fantamotogp-brasile.xlsx|Risposte del modulo 1, Risposte del modulo 2, Risposte del modulo 3, Risposte del modulo 4, CLASSIFICA, Grafici|Risposte del modulo 4|2|
|USA|USA|/tmp/fantamotogp-usa.xlsx|Risposte del modulo 1, Risposte del modulo 2, Risposte del modulo 3, Risposte del modulo 4, CLASSIFICA, Grafici|Risposte del modulo 4|2|
|Qatar|QAT|/tmp/fantamotogp-qatar.xlsx|Risposte del modulo 1, Risposte del modulo 2, Risposte del modulo 3, Risposte del modulo 4, CLASSIFICA, Grafici|Risposte del modulo 4|2|
|Spagna|SPA|/tmp/fantamotogp-spagna.xlsx|Risposte del modulo 1, Risposte del modulo 2, Risposte del modulo 3, Risposte del modulo 4, CLASSIFICA, Grafici|Risposte del modulo 4|2|
|Francia|FRA|/tmp/fantamotogp-francia.xlsx|Risposte del modulo 1, Risposte del modulo 2, Risposte del modulo 3, Risposte del modulo 4, CLASSIFICA, Grafici|Risposte del modulo 4|2|
|Catalogna|CAT|/tmp/fantamotogp-catalogna.xlsx|Risposte del modulo 1, Risposte del modulo 2, Risposte del modulo 3, Risposte del modulo 4, CLASSIFICA, Grafici|Risposte del modulo 4|2|
|Italia|ITA|/tmp/fantamotogp-italia.xlsx|Risposte del modulo 1, Risposte del modulo 2, Risposte del modulo 3, Risposte del modulo 4, CLASSIFICA, Grafici|Risposte del modulo 4|2|
|Ungheria|HUN|/tmp/fantamotogp-ungheria.xlsx|Risposte del modulo 1, Risposte del modulo 2, Risposte del modulo 3, Risposte del modulo 4, CLASSIFICA, Grafici|Risposte del modulo 4|2|
|Repubblica Ceca|CZE|/tmp/fantamotogp-repubblica-ceca.xlsx|Risposte del modulo 1, Risposte del modulo 2, Risposte del modulo 3, Risposte del modulo 4, CLASSIFICA, Grafici|Risposte del modulo 4|2|
|Netherlands|NED|/tmp/fantamotogp-netherlands.xlsx|Risposte del modulo 1, Risposte del modulo 2, Risposte del modulo 3, Risposte del modulo 4, CLASSIFICA, Grafici|Risposte del modulo 4|2|
|Germania|GER|/tmp/fantamotogp-germany.xlsx|Risposte del modulo 1, Risposte del modulo 2, Risposte del modulo 3, Risposte del modulo 4, CLASSIFICA, Grafici|Risposte del modulo 4|2|
|UK|GBR|/tmp/fantamotogp-uk.xlsx|Risposte del modulo 1, Risposte del modulo 2, Risposte del modulo 3, Risposte del modulo 4, CLASSIFICA, Grafici|Risposte del modulo 4|2|
|Aragon|ARA|/tmp/fantamotogp-aragon.xlsx|Risposte del modulo 1, Risposte del modulo 2, Risposte del modulo 3, Risposte del modulo 4, CLASSIFICA, Grafici|Risposte del modulo 4|2|

## Mappatura di tutte le prediction complete

|Utente|GP|Prediction DB ID|Excel file|Excel sheet|Excel row|Match utente|Match GP|Match pronostico|Scoring deterministico|Stato|
|---|---|---|---|---|---|---|---|---|---|---|
|Nicholas|CAT|7830cb54-8d02-5618-9d96-0e7756a5b1a0|/tmp/fantamotogp-catalogna.xlsx|Risposte del modulo 1|5|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|Nicholas|ITA|ff38daa7-d3ef-525d-b4e8-2d6a7c8501ae|/tmp/fantamotogp-italia.xlsx|Risposte del modulo 1|5|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|Nicholas|HUN|722b8ed5-c501-5d02-8f50-92a2ed3a1127|/tmp/fantamotogp-ungheria.xlsx|Risposte del modulo 1|7|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|Nicholas|GER|04eedd26-a8e1-5365-bcb8-2a77a6d5309b|/tmp/fantamotogp-germany.xlsx|Risposte del modulo 1|2|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|Nicholas|CZE|02b3d6f6-db00-5b64-8557-5323323343af|/tmp/fantamotogp-repubblica-ceca.xlsx|Risposte del modulo 1|2|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|Nicholas|NED|014480b4-4bb9-50fa-bd8c-b2d5ce1d6c09|/tmp/fantamotogp-netherlands.xlsx|Risposte del modulo 1|2|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|Nicholas|FRA|08fedd41-b194-55fd-9163-1e65620fc093|/tmp/fantamotogp-francia.xlsx|Risposte del modulo 1|6|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|Nicholas|USA|5f11d5c3-3ad5-5c9a-a674-10500315ce76|/tmp/fantamotogp-usa.xlsx|Risposte del modulo 1|2|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|Nicholas|SPA|2c90c751-4587-595b-9cb9-6d01cae55d02|/tmp/fantamotogp-spagna.xlsx|Risposte del modulo 1|8|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|Nicholas|GBR|b791a713-b510-5c5f-9940-6f9bfaa65a0a|/tmp/fantamotogp-uk.xlsx|Risposte del modulo 1|7|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|alessandro.cavasso.1995|USA|720df8c6-0369-5339-a00a-da6174e45164|/tmp/fantamotogp-usa.xlsx|Risposte del modulo 1|7|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|alessandro.cavasso.1995|HUN|39c6ed23-b794-5e63-8202-2cc08b384c5f|/tmp/fantamotogp-ungheria.xlsx|Risposte del modulo 1|5|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|alessandro.cavasso.1995|SPA|a07f1946-4363-534f-ba30-8d77b095673b|/tmp/fantamotogp-spagna.xlsx|Risposte del modulo 1|4|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|alessandro.cavasso.1995|CZE|89a0489c-a9b3-57ff-b65a-cab4151296eb|/tmp/fantamotogp-repubblica-ceca.xlsx|Risposte del modulo 1|9|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|alessandro.cavasso.1995|BRA|c8b2f9a7-e7f6-5bad-8bde-015ed67cfa1d|/tmp/fantamotogp-brasile.xlsx|Risposte del modulo 1|5|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|alessandro.cavasso.1995|CAT|143313aa-fe16-533b-9ba9-d0e477618007|/tmp/fantamotogp-catalogna.xlsx|Risposte del modulo 1|8|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|alessandro.cavasso.1995|GBR|b7f18f49-1f80-5e61-9883-29acebd3f35e|/tmp/fantamotogp-uk.xlsx|Risposte del modulo 1|4|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|marty.bria1996|BRA|07b30444-e140-557f-acd6-6ce07eaaadb0|/tmp/fantamotogp-brasile.xlsx|Risposte del modulo 1|9|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|Nicholas|BRA|911d3e8e-4478-56eb-a496-46298877aa91|/tmp/fantamotogp-brasile.xlsx|Risposte del modulo 1|2|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|ivan23dell|USA|4a055cc2-00f7-549c-aa19-dee4e21dbe14|/tmp/fantamotogp-usa.xlsx|Risposte del modulo 1|4|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|alandellosbel8|USA|5d42622c-45f8-54e3-94c5-862d0c513982|/tmp/fantamotogp-usa.xlsx|Risposte del modulo 1|10|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|marino.dilorenzo|USA|5a55b2e0-2e55-536d-acca-0e76bb711c8c|/tmp/fantamotogp-usa.xlsx|Risposte del modulo 1|9|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|dalla.pozza.silvia|USA|508822d0-a548-5f89-9d97-3fae293309f5|/tmp/fantamotogp-usa.xlsx|Risposte del modulo 1|6|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|lucifero1966|USA|48ac4094-c3cd-5be4-8fc5-840ea80965ba|/tmp/fantamotogp-usa.xlsx|Risposte del modulo 1|3|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|simo.salva92|USA|916b868f-9dc6-54c7-b298-3422566dd325|/tmp/fantamotogp-usa.xlsx|Risposte del modulo 1|13|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|marty.bria1996|USA|ada70f36-e9fb-5b28-a129-f0d7cc63a4f1|/tmp/fantamotogp-usa.xlsx|Risposte del modulo 1|12|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|simo.salva92|SPA|1eabe6fb-a2f5-589f-8dfd-a2f94635289a|/tmp/fantamotogp-spagna.xlsx|Risposte del modulo 1|3|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|marty.bria1996|SPA|51824f4f-6501-5a8f-b013-48342a40257c|/tmp/fantamotogp-spagna.xlsx|Risposte del modulo 1|2|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|ivan23dell|SPA|80eff41b-c0c4-5483-9eec-e93b6b603eeb|/tmp/fantamotogp-spagna.xlsx|Risposte del modulo 1|7|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|lucifero1966|SPA|e2df7316-a5aa-566e-ae95-4491ea4e70b9|/tmp/fantamotogp-spagna.xlsx|Risposte del modulo 1|9|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|dalla.pozza.silvia|SPA|45921e31-65c3-51d2-abcd-1785c59d8e70|/tmp/fantamotogp-spagna.xlsx|Risposte del modulo 1|6|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|marino.dilorenzo|FRA|8ba5e5cf-560b-5e92-96ea-d5fb6d37b38f|/tmp/fantamotogp-francia.xlsx|Risposte del modulo 1|2|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|tommaso.strada95|FRA|66320ba5-f9c3-593b-8a70-ff1b0c923753|/tmp/fantamotogp-francia.xlsx|Risposte del modulo 1|3|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|alandellosbel8|FRA|2d169a63-1f23-5ef7-aee0-85cb39e4d5f8|/tmp/fantamotogp-francia.xlsx|Risposte del modulo 1|5|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|tommaso.strada95|CAT|bbc97158-67e6-5bc2-95f1-38d847ce6438|/tmp/fantamotogp-catalogna.xlsx|Risposte del modulo 1|9|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|dalla.pozza.silvia|CAT|a80d6fac-140e-532b-9e1e-e6b75afea429|/tmp/fantamotogp-catalogna.xlsx|Risposte del modulo 1|3|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|marino.dilorenzo|CAT|3c763d2d-7544-5a60-a020-b43041031190|/tmp/fantamotogp-catalogna.xlsx|Risposte del modulo 1|7|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|ivan23dell|CAT|508e4bf7-a0b4-5d90-a2be-b17297d9ee34|/tmp/fantamotogp-catalogna.xlsx|Risposte del modulo 1|2|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|marty.bria1996|CAT|7469b845-a82b-536e-8383-813076fecadc|/tmp/fantamotogp-catalogna.xlsx|Risposte del modulo 1|10|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|simo.salva92|CAT|714a658f-8444-5349-8652-0926d97752e5|/tmp/fantamotogp-catalogna.xlsx|Risposte del modulo 1|11|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|marty.bria1996|ITA|41fc7021-5532-575b-9814-37ebf8f1433d|/tmp/fantamotogp-italia.xlsx|Risposte del modulo 1|3|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|simo.salva92|ITA|fd21a338-370d-53ed-9397-e2dca9e4de18|/tmp/fantamotogp-italia.xlsx|Risposte del modulo 1|2|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|ivan23dell|ITA|172c1292-20d9-5752-b3d4-4e1714399c83|/tmp/fantamotogp-italia.xlsx|Risposte del modulo 1|9|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|tommaso.strada95|ITA|fd13442f-c8ed-52b2-b4c0-775127f03b57|/tmp/fantamotogp-italia.xlsx|Risposte del modulo 1|6|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|marino.dilorenzo|HUN|0014ec76-bca0-549a-96c0-a29e19de94d1|/tmp/fantamotogp-ungheria.xlsx|Risposte del modulo 1|8|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|alandellosbel8|HUN|e0ec1ef5-b6a5-5eb0-af61-a4fef358a379|/tmp/fantamotogp-ungheria.xlsx|Risposte del modulo 1|11|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|tommaso.strada95|HUN|5712b709-a7bd-59b6-90f9-755f8fa74867|/tmp/fantamotogp-ungheria.xlsx|Risposte del modulo 1|2|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|marty.bria1996|HUN|8336da4e-8667-5600-9b5d-6862dc2186c9|/tmp/fantamotogp-ungheria.xlsx|Risposte del modulo 1|9|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|simo.salva92|HUN|48e6098f-7fc2-5054-bc44-3af0f5e61097|/tmp/fantamotogp-ungheria.xlsx|Risposte del modulo 1|6|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|ivan23dell|HUN|17096295-2e54-5f4e-a6b8-1a88d3294407|/tmp/fantamotogp-ungheria.xlsx|Risposte del modulo 1|3|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|lucifero1966|CZE|425a1555-a95f-59ff-8692-9b2a2a2c79e2|/tmp/fantamotogp-repubblica-ceca.xlsx|Risposte del modulo 1|8|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|ivan23dell|CZE|53c8ee16-dd4d-5d27-a426-5c298fa39c12|/tmp/fantamotogp-repubblica-ceca.xlsx|Risposte del modulo 1|4|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|marty.bria1996|CZE|f14b1914-2be9-5500-ba2d-caeef9e08740|/tmp/fantamotogp-repubblica-ceca.xlsx|Risposte del modulo 1|11|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|simo.salva92|CZE|62e85bd7-3494-5be1-8a42-6dfd6a7ddc22|/tmp/fantamotogp-repubblica-ceca.xlsx|Risposte del modulo 1|10|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|marino.dilorenzo|NED|4098ed9c-8810-5fdc-872a-56f87991891d|/tmp/fantamotogp-netherlands.xlsx|Risposte del modulo 1|8|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|simo.salva92|BRA|8db2ad27-5bb1-5162-b627-0fc84ec25aad|/tmp/fantamotogp-brasile.xlsx|Risposte del modulo 1|8|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|ivan23dell|FRA|fa025129-9fb7-57d6-a42c-a8db79a8b260|/tmp/fantamotogp-francia.xlsx|Risposte del modulo 1|4|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|marino.dilorenzo|CZE|f8ef9830-5b7e-5268-bbd0-c2d43c6101e5|/tmp/fantamotogp-repubblica-ceca.xlsx|Risposte del modulo 1|7|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|simo.salva92|NED|24f6473a-1e64-5faf-94f7-a931e8d043b1|/tmp/fantamotogp-netherlands.xlsx|Risposte del modulo 1|12|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|marty.bria1996|NED|697368a0-0652-57c0-a2e9-bb028efe3520|/tmp/fantamotogp-netherlands.xlsx|Risposte del modulo 1|13|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|marino.dilorenzo|GER|4dc0b9f8-a5b7-5e6c-a2e1-17c7f5d31d8b|/tmp/fantamotogp-germany.xlsx|Risposte del modulo 1|7|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|alessandro.cavasso.1995|GER|15a33dc8-050f-5e2f-8906-8bb0c39a7d3a|/tmp/fantamotogp-germany.xlsx|Risposte del modulo 1|3|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|simo.salva92|GER|321fb3ac-a5c1-570f-8f34-63b374869cac|/tmp/fantamotogp-germany.xlsx|Risposte del modulo 1|11|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|marty.bria1996|GER|3370161c-d8df-5297-a081-626a50d7bbd2|/tmp/fantamotogp-germany.xlsx|Risposte del modulo 1|12|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|simo.salva92|GBR|185690e7-f5aa-5b17-9fec-5f39b80f4814|/tmp/fantamotogp-uk.xlsx|Risposte del modulo 1|6|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|marty.bria1996|GBR|391520e5-1953-59fd-97dd-675d4bb67fcd|/tmp/fantamotogp-uk.xlsx|Risposte del modulo 1|5|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|lucifero1966|GBR|887d7439-11aa-538d-9a2b-a2788085f793|/tmp/fantamotogp-uk.xlsx|Risposte del modulo 1|2|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|lucifero1966|ARA|62893502-8b02-5fd9-af57-dbd55fdf650c|/tmp/fantamotogp-aragon.xlsx|Risposte del modulo 1|6|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|ivan23dell|ARA|394de24c-79cb-587e-981b-e73ddd1d42a9|/tmp/fantamotogp-aragon.xlsx|Risposte del modulo 1|2|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|dalla.pozza.silvia|THA|1a21c835-02f0-5d59-8423-858e67404bbe|/tmp/fantamotogp-thailandia.xlsx|Risposte del modulo 1|4|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|tommaso.strada95|THA|e6d60b63-c043-5256-bc4e-a4d8d45b3bfc|/tmp/fantamotogp-thailandia.xlsx|Risposte del modulo 1|11|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|ivan23dell|THA|144011fd-73f4-590a-a201-8056b2f9ade0|/tmp/fantamotogp-thailandia.xlsx|Risposte del modulo 1|5|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|alessandro.cavasso.1995|THA|31ab9ae6-ad91-51d6-99cc-afe1aabe8964|/tmp/fantamotogp-thailandia.xlsx|Risposte del modulo 1|3|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|lucifero1966|THA|526db0a3-d08c-5c4d-a148-08d38cb9828c|/tmp/fantamotogp-thailandia.xlsx|Risposte del modulo 1|6|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|simo.salva92|THA|432ea79e-143c-5f34-b54a-62d15a933379|/tmp/fantamotogp-thailandia.xlsx|Risposte del modulo 1|10|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|marty.bria1996|THA|45cc290b-0221-52b6-9138-7dabd5808b66|/tmp/fantamotogp-thailandia.xlsx|Risposte del modulo 1|8|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|Nicholas|THA|fab3b75d-4409-5cf8-a481-9778219f96c6|/tmp/fantamotogp-thailandia.xlsx|Risposte del modulo 1|9|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|dalla.pozza.silvia|BRA|5403b20f-b7ac-5722-b2c2-fe4ef053cf67|/tmp/fantamotogp-brasile.xlsx|Risposte del modulo 1|6|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|tommaso.strada95|BRA|6fe907e4-ef7b-5743-938c-af9d35dd5cb6|/tmp/fantamotogp-brasile.xlsx|Risposte del modulo 1|4|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|marino.dilorenzo|BRA|c1f0c3da-0faa-50b3-9ccc-99a0e6c3c835|/tmp/fantamotogp-brasile.xlsx|Risposte del modulo 1|7|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|
|ivan23dell|BRA|88254d4e-677f-5cce-ab97-1f2be28a4805|/tmp/fantamotogp-brasile.xlsx|Risposte del modulo 1|3|YES (email)|YES (file/GP)|YES (all fields)|DETERMINISTIC|VERIFIED|

## Prediction partial escluse

|Utente|GP|Prediction DB ID|Entry mancanti|
|---|---|---|---|
|marty.bria1996|FRA|7cd4da5d-d468-5942-a8df-7d6b7e9bdf0b|POLE, QUALIFYING_TIME|
|alessandro.cavasso.1995|FRA|abe4793a-3b72-583b-8f19-12100587b4a2|QUALIFYING_TIME|
|alandellosbel8|ITA|561cd7b4-938a-54f7-b2dd-1927cbc73e89|POLE, QUALIFYING_TIME|
|lucifero1966|ITA|2b6ef934-cdd8-5c7d-9e12-f9c9d78800a6|POLE, QUALIFYING_TIME|
|lucifero1966|HUN|f3f72104-6cf8-55b3-9946-081210fce12c|POLE, QUALIFYING_TIME|
|lucifero1966|NED|a0442551-6fc6-5503-b4a3-521cdc4b536b|POLE, QUALIFYING_TIME|
|alessandro.cavasso.1995|NED|c897309b-b3d4-5649-85b6-b43f19f2f524|POLE, QUALIFYING_TIME, SPRINT|
|lucifero1966|CAT|38c2ce67-9d8f-51ef-a3f1-af58522ae49f|SPRINT|
|marino.dilorenzo|ITA|a6b55890-6edf-5aab-9a98-2dccf2195fa7|SPRINT|
|alessandro.cavasso.1995|ITA|5dbd6e94-b2ec-5cac-b038-8a25401fc6fd|RACE, RACE_OUT|
|dalla.pozza.silvia|HUN|1eefa24f-5810-5c62-8a06-e8f1be2d166e|SPRINT|
|dalla.pozza.silvia|NED|8d4c1653-1955-506e-9fb9-342c9f04a359|SPRINT, RACE, RACE_OUT|
|alandellosbel8|GER|a7cbd148-00e0-5769-8162-0e0b24539827|POLE, QUALIFYING_TIME, RACE, RACE_OUT|
|alandellosbel8|GBR|1ce67839-1416-50e4-aec1-06930f99db68|POLE, QUALIFYING_TIME, SPRINT|
|marino.dilorenzo|GBR|70801d3f-a57b-5b92-84d5-f9f804bc7072|POLE, QUALIFYING_TIME, RACE, RACE_OUT|
|tommaso.strada95|ARA|1a197edc-54c2-5ffe-bd0a-c37dccd4414a|POLE, QUALIFYING_TIME, SPRINT|
|alessandro.cavasso.1995|ARA|b7545592-7eaf-588a-ab2d-df5225fc4125|POLE, QUALIFYING_TIME, SPRINT, RACE, RACE_OUT|
|marty.bria1996|ARA|d88bfd72-f680-559d-ba42-0d54dd703d56|POLE, QUALIFYING_TIME, RACE, RACE_OUT|
|tommaso.strada95|USA|2282b994-2da0-5ae2-9b23-72a2fa1956b5|RACE, RACE_OUT|
|dalla.pozza.silvia|ITA|14d2c15b-9560-5880-ac3d-1e0c22cc7ddc|SPRINT|
|lucifero1966|GER|b87a3cf5-802f-5a76-8024-6481084de7e2|RACE, RACE_OUT|
|ivan23dell|GBR|97b81fc0-d4af-573d-b9e5-c66af0b55c27|SPRINT|
|tommaso.strada95|GBR|36607962-920f-580a-8e08-b9961c74de41|RACE, RACE_OUT|
|simo.salva92|ARA|6704f3b1-6d0f-5ed3-97f7-2abfad01f499|RACE, RACE_OUT|
|marino.dilorenzo|THA|2cd7c3e2-d351-5e80-89cf-ee50a610c399|SPRINT|
|alandellosbel8|THA|448d7329-40ea-52be-a32c-441a495e9d48|SPRINT|
|alandellosbel8|BRA|009b2b26-e55b-5a70-92c6-3f764bc42481|POLE, QUALIFYING_TIME|
|lucifero1966|BRA|6a1323bd-099a-554c-b971-47ab2966ae9d|POLE, QUALIFYING_TIME|
|alandellosbel8|SPA|5e3e09ea-1f16-5365-b832-af75c75ed56d|POLE, QUALIFYING_TIME|
|simo.salva92|FRA|f211335c-abd2-5889-b214-b556ece4f652|POLE, QUALIFYING_TIME|

## Prediction extra fuori dalla sorgente storica

|Utente|GP|Prediction DB ID|Stato|Motivo|
|---|---|---|---|---|
|Nicholas|RSM|a24c434a-17ff-45e6-a008-64dce2e5b634|EXTRA_NOT_IN_HISTORICAL_SOURCE|Non usata per il replay storico|
|Nicholas|ARA|24ab1b38-0fe7-5d61-9272-3998401157cc|EXTRA_NOT_IN_HISTORICAL_SOURCE|Non usata per il replay storico|

## Confronto per le VERIFIED

|Utente|GP|Prediction ID|DB Total|Excel Total|Δ|Entry DB points|Entry proposed points|Stato|
|---|---|---|---|---|---|---|---|---|
|Nicholas|CAT|7830cb54-8d02-5618-9d96-0e7756a5b1a0|-7|5|12|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=0, QUALIFYING_TIME:—=1, RACE:1=0, RACE:2=0, RACE:3=1, RACE:4=0, RACE:5=0, RACE_OUT:—=2, SPRINT:1=1, SPRINT:2=1, SPRINT:3=0|DIFF|
|Nicholas|ITA|ff38daa7-d3ef-525d-b4e8-2d6a7c8501ae|15|16|1|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=0, QUALIFYING_TIME:—=1, RACE:1=5, RACE:2=5, RACE:3=1, RACE:4=0, RACE:5=3, RACE_OUT:—=0, SPRINT:1=1, SPRINT:2=0, SPRINT:3=0|DIFF|
|Nicholas|HUN|722b8ed5-c501-5d02-8f50-92a2ed3a1127|16|16|0|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=2, QUALIFYING_TIME:—=1, RACE:1=5, RACE:2=5, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=2, SPRINT:1=1, SPRINT:2=1, SPRINT:3=0|DIFF|
|Nicholas|GER|04eedd26-a8e1-5365-bcb8-2a77a6d5309b|20|22|2|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=5, QUALIFYING_TIME:—=3, RACE:1=5, RACE:2=0, RACE:3=3, RACE:4=0, RACE:5=1, RACE_OUT:—=2, SPRINT:1=3, SPRINT:2=0, SPRINT:3=1|DIFF|
|Nicholas|CZE|02b3d6f6-db00-5b64-8557-5323323343af|17|17|0|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=3, RACE:2=3, RACE:3=5, RACE:4=5, RACE:5=0, RACE_OUT:—=0, SPRINT:1=1, SPRINT:2=1, SPRINT:3=0|DIFF|
|Nicholas|NED|014480b4-4bb9-50fa-bd8c-b2d5ce1d6c09|12|13|1|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=0, QUALIFYING_TIME:—=1, RACE:1=0, RACE:2=3, RACE:3=3, RACE:4=3, RACE:5=3, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=1|DIFF|
|Nicholas|FRA|08fedd41-b194-55fd-9163-1e65620fc093|15|18|3|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=0, QUALIFYING_TIME:—=3, RACE:1=3, RACE:2=3, RACE:3=0, RACE:4=3, RACE:5=3, RACE_OUT:—=2, SPRINT:1=0, SPRINT:2=1, SPRINT:3=1|DIFF|
|Nicholas|USA|5f11d5c3-3ad5-5c9a-a674-10500315ce76|16|17|1|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=0, QUALIFYING_TIME:—=1, RACE:1=5, RACE:2=5, RACE:3=3, RACE:4=0, RACE:5=1, RACE_OUT:—=2, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|DIFF|
|Nicholas|SPA|2c90c751-4587-595b-9cb9-6d01cae55d02|12|12|0|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=3, RACE:2=0, RACE:3=1, RACE:4=3, RACE:5=3, RACE_OUT:—=0, SPRINT:1=3, SPRINT:2=0, SPRINT:3=0|DIFF|
|Nicholas|GBR|b791a713-b510-5c5f-9940-6f9bfaa65a0a|15|18|3|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=0, QUALIFYING_TIME:—=3, RACE:1=0, RACE:2=5, RACE:3=5, RACE:4=1, RACE:5=0, RACE_OUT:—=2, SPRINT:1=0, SPRINT:2=3, SPRINT:3=0|DIFF|
|alessandro.cavasso.1995|USA|720df8c6-0369-5339-a00a-da6174e45164|12|15|3|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=0, QUALIFYING_TIME:—=3, RACE:1=5, RACE:2=1, RACE:3=0, RACE:4=3, RACE:5=1, RACE_OUT:—=2, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|DIFF|
|alessandro.cavasso.1995|HUN|39c6ed23-b794-5e63-8202-2cc08b384c5f|9|9|0|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=5, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=5, RACE:3=1, RACE:4=0, RACE:5=0, RACE_OUT:—=2, SPRINT:1=1, SPRINT:2=0, SPRINT:3=0|DIFF|
|alessandro.cavasso.1995|SPA|a07f1946-4363-534f-ba30-8d77b095673b|19|19|0|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=5, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=3, RACE:3=3, RACE:4=3, RACE:5=3, RACE_OUT:—=0, SPRINT:1=3, SPRINT:2=0, SPRINT:3=0|DIFF|
|alessandro.cavasso.1995|CZE|89a0489c-a9b3-57ff-b65a-cab4151296eb|12|14|2|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=0, QUALIFYING_TIME:—=3, RACE:1=3, RACE:2=1, RACE:3=0, RACE:4=3, RACE:5=1, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=3, SPRINT:3=0|DIFF|
|alessandro.cavasso.1995|BRA|c8b2f9a7-e7f6-5bad-8bde-015ed67cfa1d|18|18|0|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=1, RACE:2=3, RACE:3=5, RACE:4=1, RACE:5=0, RACE_OUT:—=2, SPRINT:1=3, SPRINT:2=0, SPRINT:3=3|DIFF|
|alessandro.cavasso.1995|CAT|143313aa-fe16-533b-9ba9-d0e477618007|-2|8|10|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=5, QUALIFYING_TIME:—=1, RACE:1=5, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=1, SPRINT:2=1, SPRINT:3=0|DIFF|
|alessandro.cavasso.1995|GBR|b7f18f49-1f80-5e61-9883-29acebd3f35e|17|22|5|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=0, QUALIFYING_TIME:—=5, RACE:1=1, RACE:2=5, RACE:3=0, RACE:4=0, RACE:5=1, RACE_OUT:—=2, SPRINT:1=3, SPRINT:2=3, SPRINT:3=3|DIFF|
|marty.bria1996|BRA|07b30444-e140-557f-acd6-6ce07eaaadb0|12|13|1|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=0, QUALIFYING_TIME:—=1, RACE:1=1, RACE:2=3, RACE:3=3, RACE:4=1, RACE:5=0, RACE_OUT:—=2, SPRINT:1=0, SPRINT:2=1, SPRINT:3=1|DIFF|
|Nicholas|BRA|911d3e8e-4478-56eb-a496-46298877aa91|25|25|0|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=1, RACE:2=3, RACE:3=5, RACE:4=1, RACE:5=5, RACE_OUT:—=2, SPRINT:1=3, SPRINT:2=0, SPRINT:3=3|DIFF|
|ivan23dell|USA|4a055cc2-00f7-549c-aa19-dee4e21dbe14|18|21|3|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=0, QUALIFYING_TIME:—=3, RACE:1=3, RACE:2=3, RACE:3=0, RACE:4=5, RACE:5=5, RACE_OUT:—=2, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|DIFF|
|alandellosbel8|USA|5d42622c-45f8-54e3-94c5-862d0c513982|17|22|5|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=2, QUALIFYING_TIME:—=5, RACE:1=5, RACE:2=1, RACE:3=3, RACE:4=1, RACE:5=1, RACE_OUT:—=2, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|DIFF|
|marino.dilorenzo|USA|5a55b2e0-2e55-536d-acca-0e76bb711c8c|12|13|1|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=0, QUALIFYING_TIME:—=1, RACE:1=5, RACE:2=1, RACE:3=0, RACE:4=1, RACE:5=5, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|DIFF|
|dalla.pozza.silvia|USA|508822d0-a548-5f89-9d97-3fae293309f5|16|16|0|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=3, RACE:2=3, RACE:3=5, RACE:4=3, RACE:5=0, RACE_OUT:—=2, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|DIFF|
|lucifero1966|USA|48ac4094-c3cd-5be4-8fc5-840ea80965ba|12|12|0|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=1, RACE:2=3, RACE:3=0, RACE:4=5, RACE:5=0, RACE_OUT:—=2, SPRINT:1=0, SPRINT:2=0, SPRINT:3=1|DIFF|
|simo.salva92|USA|916b868f-9dc6-54c7-b298-3422566dd325|10|10|0|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=2, QUALIFYING_TIME:—=0, RACE:1=5, RACE:2=1, RACE:3=0, RACE:4=1, RACE:5=1, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|DIFF|
|marty.bria1996|USA|ada70f36-e9fb-5b28-a129-f0d7cc63a4f1|9|9|0|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=2, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=1, RACE:3=3, RACE:4=1, RACE:5=0, RACE_OUT:—=2, SPRINT:1=0, SPRINT:2=0, SPRINT:3=1|DIFF|
|simo.salva92|SPA|1eabe6fb-a2f5-589f-8dfd-a2f94635289a|13|16|3|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=0, QUALIFYING_TIME:—=3, RACE:1=0, RACE:2=5, RACE:3=5, RACE:4=1, RACE:5=0, RACE_OUT:—=0, SPRINT:1=3, SPRINT:2=0, SPRINT:3=0|DIFF|
|marty.bria1996|SPA|51824f4f-6501-5a8f-b013-48342a40257c|9|14|5|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=0, QUALIFYING_TIME:—=5, RACE:1=0, RACE:2=3, RACE:3=3, RACE:4=0, RACE:5=1, RACE_OUT:—=0, SPRINT:1=3, SPRINT:2=0, SPRINT:3=0|DIFF|
|ivan23dell|SPA|80eff41b-c0c4-5483-9eec-e93b6b603eeb|14|14|0|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=5, QUALIFYING_TIME:—=0, RACE:1=3, RACE:2=0, RACE:3=0, RACE:4=1, RACE:5=3, RACE_OUT:—=0, SPRINT:1=3, SPRINT:2=0, SPRINT:3=0|DIFF|
|lucifero1966|SPA|e2df7316-a5aa-566e-ae95-4491ea4e70b9|11|10|-1|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=5, RACE:2=0, RACE:3=0, RACE:4=1, RACE:5=1, RACE_OUT:—=0, SPRINT:1=3, SPRINT:2=0, SPRINT:3=1|DIFF|
|dalla.pozza.silvia|SPA|45921e31-65c3-51d2-abcd-1785c59d8e70|17|7|-10|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=3, RACE:2=0, RACE:3=5, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|DIFF|
|marino.dilorenzo|FRA|8ba5e5cf-560b-5e92-96ea-d5fb6d37b38f|16|18|2|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=0, QUALIFYING_TIME:—=3, RACE:1=3, RACE:2=3, RACE:3=0, RACE:4=5, RACE:5=0, RACE_OUT:—=2, SPRINT:1=0, SPRINT:2=3, SPRINT:3=0|DIFF|
|tommaso.strada95|FRA|66320ba5-f9c3-593b-8a70-ff1b0c923753|4|8|4|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=5, QUALIFYING_TIME:—=1, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=1, SPRINT:3=1|DIFF|
|alandellosbel8|FRA|2d169a63-1f23-5ef7-aee0-85cb39e4d5f8|8|7|-1|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=3, RACE:2=0, RACE:3=0, RACE:4=1, RACE:5=0, RACE_OUT:—=2, SPRINT:1=0, SPRINT:2=1, SPRINT:3=1|DIFF|
|tommaso.strada95|CAT|bbc97158-67e6-5bc2-95f1-38d847ce6438|-6|4|10|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=1, SPRINT:3=3|DIFF|
|dalla.pozza.silvia|CAT|a80d6fac-140e-532b-9e1e-e6b75afea429|-10|0|10|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|DIFF|
|marino.dilorenzo|CAT|3c763d2d-7544-5a60-a020-b43041031190|-7|5|12|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=0, QUALIFYING_TIME:—=5, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=1, RACE:5=0, RACE_OUT:—=2, SPRINT:1=1, SPRINT:2=1, SPRINT:3=0|DIFF|
|ivan23dell|CAT|508e4bf7-a0b4-5d90-a2be-b17297d9ee34|-9|12|21|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=0, QUALIFYING_TIME:—=3, RACE:1=0, RACE:2=0, RACE:3=3, RACE:4=1, RACE:5=5, RACE_OUT:—=0, SPRINT:1=1, SPRINT:2=0, SPRINT:3=0|DIFF|
|marty.bria1996|CAT|7469b845-a82b-536e-8383-813076fecadc|4|13|9|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=5, QUALIFYING_TIME:—=1, RACE:1=0, RACE:2=3, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=3, SPRINT:2=3, SPRINT:3=3|DIFF|
|simo.salva92|CAT|714a658f-8444-5349-8652-0926d97752e5|-7|1|8|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=0, QUALIFYING_TIME:—=1, RACE:1=0, RACE:2=3, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=1, SPRINT:2=1, SPRINT:3=0|DIFF|
|marty.bria1996|ITA|41fc7021-5532-575b-9814-37ebf8f1433d|25|30|5|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=0, QUALIFYING_TIME:—=5, RACE:1=5, RACE:2=5, RACE:3=5, RACE:4=0, RACE:5=5, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=1, SPRINT:3=1|DIFF|
|simo.salva92|ITA|fd21a338-370d-53ed-9397-e2dca9e4de18|12|17|5|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=0, QUALIFYING_TIME:—=5, RACE:1=5, RACE:2=1, RACE:3=3, RACE:4=3, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|DIFF|
|ivan23dell|ITA|172c1292-20d9-5752-b3d4-4e1714399c83|9|9|0|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=3, RACE:2=3, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=3, SPRINT:3=0|DIFF|
|tommaso.strada95|ITA|fd13442f-c8ed-52b2-b4c0-775127f03b57|7|8|1|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=0, QUALIFYING_TIME:—=1, RACE:1=3, RACE:2=3, RACE:3=1, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|DIFF|
|marino.dilorenzo|HUN|0014ec76-bca0-549a-96c0-a29e19de94d1|16|16|0|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=2, QUALIFYING_TIME:—=1, RACE:1=5, RACE:2=5, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=3, SPRINT:2=0, SPRINT:3=1|DIFF|
|alandellosbel8|HUN|e0ec1ef5-b6a5-5eb0-af61-a4fef358a379|16|15|-1|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=5, RACE:2=5, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=2, SPRINT:1=3, SPRINT:2=0, SPRINT:3=1|DIFF|
|tommaso.strada95|HUN|5712b709-a7bd-59b6-90f9-755f8fa74867|14|14|0|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=5, QUALIFYING_TIME:—=1, RACE:1=5, RACE:2=0, RACE:3=0, RACE:4=1, RACE:5=0, RACE_OUT:—=2, SPRINT:1=0, SPRINT:2=1, SPRINT:3=0|DIFF|
|marty.bria1996|HUN|8336da4e-8667-5600-9b5d-6862dc2186c9|13|14|1|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=2, QUALIFYING_TIME:—=1, RACE:1=5, RACE:2=5, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=3, SPRINT:2=3, SPRINT:3=0|DIFF|
|simo.salva92|HUN|48e6098f-7fc2-5054-bc44-3af0f5e61097|9|12|3|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=2, QUALIFYING_TIME:—=3, RACE:1=5, RACE:2=0, RACE:3=3, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=3, SPRINT:2=0, SPRINT:3=1|DIFF|
|ivan23dell|HUN|17096295-2e54-5f4e-a6b8-1a88d3294407|3|3|0|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=0, QUALIFYING_TIME:—=5, RACE:1=0, RACE:2=0, RACE:3=3, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|DIFF|
|lucifero1966|CZE|425a1555-a95f-59ff-8692-9b2a2a2c79e2|16|19|3|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=0, QUALIFYING_TIME:—=3, RACE:1=1, RACE:2=3, RACE:3=3, RACE:4=5, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=1, SPRINT:3=3|DIFF|
|ivan23dell|CZE|53c8ee16-dd4d-5d27-a426-5c298fa39c12|5|14|9|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=0, QUALIFYING_TIME:—=10, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=1, RACE:5=1, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=3|DIFF|
|marty.bria1996|CZE|f14b1914-2be9-5500-ba2d-caeef9e08740|15|16|1|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=0, QUALIFYING_TIME:—=1, RACE:1=1, RACE:2=3, RACE:3=3, RACE:4=5, RACE:5=0, RACE_OUT:—=2, SPRINT:1=0, SPRINT:2=0, SPRINT:3=1|DIFF|
|simo.salva92|CZE|62e85bd7-3494-5be1-8a42-6dfd6a7ddc22|16|17|1|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=0, QUALIFYING_TIME:—=1, RACE:1=1, RACE:2=3, RACE:3=3, RACE:4=5, RACE:5=0, RACE_OUT:—=0, SPRINT:1=3, SPRINT:2=0, SPRINT:3=1|DIFF|
|marino.dilorenzo|NED|4098ed9c-8810-5fdc-872a-56f87991891d|12|13|1|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=0, QUALIFYING_TIME:—=1, RACE:1=0, RACE:2=3, RACE:3=3, RACE:4=3, RACE:5=3, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=1, SPRINT:3=0|DIFF|
|simo.salva92|BRA|8db2ad27-5bb1-5162-b627-0fc84ec25aad|18|18|0|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=1, RACE:2=3, RACE:3=3, RACE:4=1, RACE:5=5, RACE_OUT:—=2, SPRINT:1=0, SPRINT:2=0, SPRINT:3=1|DIFF|
|ivan23dell|FRA|fa025129-9fb7-57d6-a42c-a8db79a8b260|9|11|2|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=0, QUALIFYING_TIME:—=3, RACE:1=3, RACE:2=3, RACE:3=1, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=1, SPRINT:3=1|DIFF|
|marino.dilorenzo|CZE|f8ef9830-5b7e-5268-bbd0-c2d43c6101e5|13|18|5|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=0, QUALIFYING_TIME:—=5, RACE:1=3, RACE:2=3, RACE:3=3, RACE:4=1, RACE:5=0, RACE_OUT:—=0, SPRINT:1=1, SPRINT:2=0, SPRINT:3=3|DIFF|
|simo.salva92|NED|24f6473a-1e64-5faf-94f7-a931e8d043b1|9|11|2|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=0, QUALIFYING_TIME:—=3, RACE:1=0, RACE:2=3, RACE:3=3, RACE:4=0, RACE:5=1, RACE_OUT:—=2, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|DIFF|
|marty.bria1996|NED|697368a0-0652-57c0-a2e9-bb028efe3520|8|12|4|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=0, QUALIFYING_TIME:—=5, RACE:1=3, RACE:2=0, RACE:3=0, RACE:4=1, RACE:5=3, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=1|DIFF|
|marino.dilorenzo|GER|4dc0b9f8-a5b7-5e6c-a2e1-17c7f5d31d8b|20|24|4|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=5, QUALIFYING_TIME:—=5, RACE:1=5, RACE:2=0, RACE:3=0, RACE:4=1, RACE:5=5, RACE_OUT:—=0, SPRINT:1=3, SPRINT:2=1, SPRINT:3=0|DIFF|
|alessandro.cavasso.1995|GER|15a33dc8-050f-5e2f-8906-8bb0c39a7d3a|18|17|-1|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=5, QUALIFYING_TIME:—=0, RACE:1=5, RACE:2=0, RACE:3=0, RACE:4=1, RACE:5=1, RACE_OUT:—=2, SPRINT:1=3, SPRINT:2=1, SPRINT:3=0|DIFF|
|simo.salva92|GER|321fb3ac-a5c1-570f-8f34-63b374869cac|19|19|0|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=5, QUALIFYING_TIME:—=1, RACE:1=0, RACE:2=3, RACE:3=3, RACE:4=0, RACE:5=1, RACE_OUT:—=2, SPRINT:1=3, SPRINT:2=1, SPRINT:3=1|DIFF|
|marty.bria1996|GER|3370161c-d8df-5297-a081-626a50d7bbd2|16|18|2|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=5, QUALIFYING_TIME:—=3, RACE:1=5, RACE:2=0, RACE:3=0, RACE:4=1, RACE:5=1, RACE_OUT:—=0, SPRINT:1=3, SPRINT:2=1, SPRINT:3=0|DIFF|
|simo.salva92|GBR|185690e7-f5aa-5b17-9fec-5f39b80f4814|17|22|5|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=0, QUALIFYING_TIME:—=5, RACE:1=3, RACE:2=0, RACE:3=1, RACE:4=3, RACE:5=3, RACE_OUT:—=2, SPRINT:1=3, SPRINT:2=3, SPRINT:3=0|DIFF|
|marty.bria1996|GBR|391520e5-1953-59fd-97dd-675d4bb67fcd|12|15|3|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=2, QUALIFYING_TIME:—=3, RACE:1=3, RACE:2=0, RACE:3=1, RACE:4=3, RACE:5=0, RACE_OUT:—=0, SPRINT:1=3, SPRINT:2=0, SPRINT:3=1|DIFF|
|lucifero1966|GBR|887d7439-11aa-538d-9a2b-a2788085f793|5|10|5|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=2, QUALIFYING_TIME:—=5, RACE:1=3, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=1, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|DIFF|
|lucifero1966|ARA|62893502-8b02-5fd9-af57-dbd55fdf650c|16|17|1|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=0, QUALIFYING_TIME:—=1, RACE:1=5, RACE:2=1, RACE:3=5, RACE:4=3, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=3, SPRINT:3=0|DIFF|
|ivan23dell|ARA|394de24c-79cb-587e-981b-e73ddd1d42a9|10|14|4|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=5, QUALIFYING_TIME:—=3, RACE:1=1, RACE:2=3, RACE:3=0, RACE:4=1, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=1, SPRINT:3=0|DIFF|
|dalla.pozza.silvia|THA|1a21c835-02f0-5d59-8423-858e67404bbe|11|11|0|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=2, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=3, RACE:3=3, RACE:4=3, RACE:5=0, RACE_OUT:—=0, SPRINT:1=1, SPRINT:2=0, SPRINT:3=0|DIFF|
|tommaso.strada95|THA|e6d60b63-c043-5256-bc4e-a4d8d45b3bfc|11|11|0|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=2, QUALIFYING_TIME:—=0, RACE:1=5, RACE:2=0, RACE:3=3, RACE:4=0, RACE:5=1, RACE_OUT:—=0, SPRINT:1=1, SPRINT:2=0, SPRINT:3=0|DIFF|
|ivan23dell|THA|144011fd-73f4-590a-a201-8056b2f9ade0|13|12|-1|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=5, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=3, RACE:3=3, RACE:4=0, RACE:5=1, RACE_OUT:—=0, SPRINT:1=1, SPRINT:2=0, SPRINT:3=0|DIFF|
|alessandro.cavasso.1995|THA|31ab9ae6-ad91-51d6-99cc-afe1aabe8964|18|19|1|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=5, QUALIFYING_TIME:—=1, RACE:1=5, RACE:2=0, RACE:3=3, RACE:4=3, RACE:5=0, RACE_OUT:—=2, SPRINT:1=1, SPRINT:2=0, SPRINT:3=0|DIFF|
|lucifero1966|THA|526db0a3-d08c-5c4d-a148-08d38cb9828c|10|12|2|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=2, QUALIFYING_TIME:—=3, RACE:1=0, RACE:2=3, RACE:3=3, RACE:4=0, RACE:5=1, RACE_OUT:—=0, SPRINT:1=1, SPRINT:2=0, SPRINT:3=0|DIFF|
|simo.salva92|THA|432ea79e-143c-5f34-b54a-62d15a933379|23|26|3|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=5, QUALIFYING_TIME:—=3, RACE:1=0, RACE:2=3, RACE:3=3, RACE:4=3, RACE:5=5, RACE_OUT:—=2, SPRINT:1=0, SPRINT:2=3, SPRINT:3=0|DIFF|
|marty.bria1996|THA|45cc290b-0221-52b6-9138-7dabd5808b66|16|19|3|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=5, QUALIFYING_TIME:—=3, RACE:1=0, RACE:2=3, RACE:3=3, RACE:4=3, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=3, SPRINT:3=0|DIFF|
|Nicholas|THA|fab3b75d-4409-5cf8-a481-9778219f96c6|19|21|2|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=5, QUALIFYING_TIME:—=3, RACE:1=0, RACE:2=3, RACE:3=3, RACE:4=3, RACE:5=0, RACE_OUT:—=2, SPRINT:1=0, SPRINT:2=3, SPRINT:3=0|DIFF|
|dalla.pozza.silvia|BRA|5403b20f-b7ac-5722-b2c2-fe4ef053cf67|9|9|0|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=1, RACE:2=3, RACE:3=5, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|DIFF|
|tommaso.strada95|BRA|6fe907e4-ef7b-5743-938c-af9d35dd5cb6|15|15|0|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=5, RACE:2=1, RACE:3=5, RACE:4=0, RACE:5=0, RACE_OUT:—=2, SPRINT:1=0, SPRINT:2=1, SPRINT:3=1|DIFF|
|marino.dilorenzo|BRA|c1f0c3da-0faa-50b3-9ccc-99a0e6c3c835|15|15|0|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=1, RACE:2=3, RACE:3=3, RACE:4=3, RACE:5=0, RACE_OUT:—=2, SPRINT:1=3, SPRINT:2=0, SPRINT:3=1|DIFF|
|ivan23dell|BRA|88254d4e-677f-5cce-ab97-1f2be28a4805|10|10|0|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=0, RACE:2=0, RACE:3=0, RACE:4=0, RACE:5=0, RACE_OUT:—=0, SPRINT:1=0, SPRINT:2=0, SPRINT:3=0|POLE:—=0, QUALIFYING_TIME:—=0, RACE:1=5, RACE:2=1, RACE:3=0, RACE:4=1, RACE:5=0, RACE_OUT:—=0, SPRINT:1=3, SPRINT:2=0, SPRINT:3=0|DIFF|

- Fixture obbligatorio: **Niky / Thailandia: 8 + 3 + 10 = 21**
- Le componenti bonus/malus restano nel calcolo aggregato canonico; non vengono attribuite artificialmente a una singola entry.

## Dettaglio riga-per-riga delle VERIFIED

### Nicholas / GRAND PRIX OF CATALONIA

- Prediction DB: `7830cb54-8d02-5618-9d96-0e7756a5b1a0`
- Excel: `/tmp/fantamotogp-catalogna.xlsx`
- Righe: Q `Risposte del modulo 1!5`, Sprint `Risposte del modulo 2!14`, Gara `Risposte del modulo 3!3`
- Riferimenti: Pole `Risposte del modulo 1!C5`, tempo `Risposte del modulo 1!D5`, Sprint `Risposte del modulo 2!C14, Risposte del modulo 2!D14, Risposte del modulo 2!E14`, Gara `Risposte del modulo 3!C3, Risposte del modulo 3!D3, Risposte del modulo 3!E3, Risposte del modulo 3!F3, Risposte del modulo 3!G3, Risposte del modulo 3!H3`
- Valori Excel: pole=A. Marquez; tempo=01:37.628; sprint=P. Acosta / A. Marquez / R. Fernandez; gara=A. Marquez / P. Acosta / F. Di Giannantonio / R. Fernandez / A. Ogura; out=J. Martin

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|7198f64d-5479-5899-b425-3fae3878ad0a|POLE|—|Alex Marquez|A. Marquez|0|0|
|6b87d5e8-6efd-5508-9ca3-f33c007d0f71|QUALIFYING_TIME|—|97.628|01:37.628|0|1|
|96503def-d411-5e45-9d99-8aa592bbcf3b|RACE|1|Alex Marquez|A. Marquez|0|0|
|74b4dc9e-e75a-525d-834c-8e7d080a30d6|RACE|2|Pedro Acosta|P. Acosta|0|0|
|7e941c83-593c-5bb1-a8a1-99c8ed1fb5cd|RACE|3|Fabio Di Giannantonio|F. Di Giannantonio|0|1|
|70234758-b62d-5274-92e4-8fcf75773cbb|RACE|4|Raul Fernandez|R. Fernandez|0|0|
|705c28b3-a422-509a-aeee-82e465eaf9a3|RACE|5|Ai Ogura|A. Ogura|0|0|
|b105be46-9eef-5c80-a49e-df3251694544|RACE_OUT|—|Jorge Martin|J. Martin|0|2|
|be12f7f7-a94b-5d04-833b-a8e3fd53b126|SPRINT|1|Pedro Acosta|P. Acosta|0|1|
|304b3b36-5bda-554b-a548-e1ad7c6859d3|SPRINT|2|Alex Marquez|A. Marquez|0|1|
|0b013c27-6e6d-5a9e-9a35-accb37fc6793|SPRINT|3|Raul Fernandez|R. Fernandez|0|0|

- Scoring canonico: Qualifica **1** (pole 0 + tempo 1); Sprint **2** [1, 1, 0]; Gara **2** [posizioni 1; bonus 2; malus -1; OUT 2]
- Totale storico ricostruito: **5** = 1 + 2 + 2.

### Nicholas / GRAND PRIX OF ITALY

- Prediction DB: `ff38daa7-d3ef-525d-b4e8-2d6a7c8501ae`
- Excel: `/tmp/fantamotogp-italia.xlsx`
- Righe: Q `Risposte del modulo 1!5`, Sprint `Risposte del modulo 2!6`, Gara `Risposte del modulo 3!3`
- Riferimenti: Pole `Risposte del modulo 1!C5`, tempo `Risposte del modulo 1!D5`, Sprint `Risposte del modulo 2!C6, Risposte del modulo 2!D6, Risposte del modulo 2!E6`, Gara `Risposte del modulo 3!C3, Risposte del modulo 3!D3, Risposte del modulo 3!E3, Risposte del modulo 3!F3, Risposte del modulo 3!G3, Risposte del modulo 3!H3`
- Valori Excel: pole=F. Di Giannantonio; tempo=01:44.247; sprint=J. Martin / M. Marquez / F. Bagnaia; gara=M. Bezzecchi / J. Martin / F. Di Giannantonio / R. Fernandez / A. Ogura; out=J. Mir

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|ee236b60-dbb0-5e24-9416-83702364d9cc|POLE|—|Fabio Di Giannantonio|F. Di Giannantonio|0|0|
|cb377eea-50a2-5d08-a5f5-20fe1be557bf|QUALIFYING_TIME|—|104.247|01:44.247|0|1|
|8a884c18-9d29-5c7c-b6e9-80b84f54ce94|RACE|1|Marco Bezzecchi|M. Bezzecchi|0|5|
|6de63ba9-e3c1-5d5f-9bd9-689ba668e5c2|RACE|2|Jorge Martin|J. Martin|0|5|
|28d91f2c-0b52-5a16-b29c-cb3e119593a5|RACE|3|Fabio Di Giannantonio|F. Di Giannantonio|0|1|
|2d576045-5744-5ed5-93c4-db036ed99a3e|RACE|4|Raul Fernandez|R. Fernandez|0|0|
|ae231ea8-bcf0-5117-b81d-4cf760c85015|RACE|5|Ai Ogura|A. Ogura|0|3|
|e9ee6fa1-d150-57ab-b20c-9f905f1b73e4|RACE_OUT|—|Joan Mir|J. Mir|0|0|
|050b9f9e-3b64-5825-bca6-60314cb94780|SPRINT|1|Jorge Martin|J. Martin|0|1|
|db0ab768-cc57-5f47-9907-ad5be5e693b3|SPRINT|2|Marc Marquez|M. Marquez|0|0|
|4675f211-0211-57fb-b3db-59eeaa49f8db|SPRINT|3|Francesco Bagnaia|F. Bagnaia|0|0|

- Scoring canonico: Qualifica **1** (pole 0 + tempo 1); Sprint **1** [1, 0, 0]; Gara **14** [posizioni 14; bonus 0; malus 0; OUT 0]
- Totale storico ricostruito: **16** = 1 + 1 + 14.

### Nicholas / GRAND PRIX OF HUNGARY

- Prediction DB: `722b8ed5-c501-5d02-8f50-92a2ed3a1127`
- Excel: `/tmp/fantamotogp-ungheria.xlsx`
- Righe: Q `Risposte del modulo 1!7`, Sprint `Risposte del modulo 2!7`, Gara `Risposte del modulo 3!2`
- Riferimenti: Pole `Risposte del modulo 1!C7`, tempo `Risposte del modulo 1!D7`, Sprint `Risposte del modulo 2!C7, Risposte del modulo 2!D7, Risposte del modulo 2!E7`, Gara `Risposte del modulo 3!C2, Risposte del modulo 3!D2, Risposte del modulo 3!E2, Risposte del modulo 3!F2, Risposte del modulo 3!G2, Risposte del modulo 3!H2`
- Valori Excel: pole=P. Acosta; tempo=01:36.500; sprint=P. Acosta / M. Marquez / J. Martin; gara=M. Marquez / P. Acosta / M. Bezzecchi / J. Martin / F. Di Giannantonio; out=J. Mir

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|002558e3-84fa-5c1f-96aa-b0085127644e|POLE|—|Pedro Acosta|P. Acosta|0|2|
|60f84f8f-076f-5ef8-b927-b83e2b8d1175|QUALIFYING_TIME|—|96.5|01:36.500|0|1|
|6fe66596-58cc-561b-981a-132c3ef0b7ca|RACE|1|Marc Marquez|M. Marquez|0|5|
|abe8fdba-bf64-55d3-9c46-94cdb93aaca8|RACE|2|Pedro Acosta|P. Acosta|0|5|
|6a18d493-21bc-57c8-8432-bb6618d2f39b|RACE|3|Marco Bezzecchi|M. Bezzecchi|0|0|
|b64fd304-bc4f-549d-a742-da126486fd31|RACE|4|Jorge Martin|J. Martin|0|0|
|b9da221e-5000-59fd-89f6-472dc8e04c00|RACE|5|Fabio Di Giannantonio|F. Di Giannantonio|0|0|
|218dc1d5-e693-5d22-b4e1-5a3c1a16b1f3|RACE_OUT|—|Joan Mir|J. Mir|0|2|
|c84dab92-bbfb-5127-a65d-abdc9aa6dfeb|SPRINT|1|Pedro Acosta|P. Acosta|0|1|
|cc3a7e67-126b-559f-b0d7-275452ebeb33|SPRINT|2|Marc Marquez|M. Marquez|0|1|
|a5c7fadf-66e6-500f-b5a3-acd62f2cb371|SPRINT|3|Jorge Martin|J. Martin|0|0|

- Scoring canonico: Qualifica **3** (pole 2 + tempo 1); Sprint **2** [1, 1, 0]; Gara **11** [posizioni 10; bonus 2; malus -1; OUT 2]
- Totale storico ricostruito: **16** = 3 + 2 + 11.

### Nicholas / GRAND PRIX OF GERMANY

- Prediction DB: `04eedd26-a8e1-5365-bcb8-2a77a6d5309b`
- Excel: `/tmp/fantamotogp-germany.xlsx`
- Righe: Q `Risposte del modulo 1!2`, Sprint `Risposte del modulo 2!5`, Gara `Risposte del modulo 3!2`
- Riferimenti: Pole `Risposte del modulo 1!C2`, tempo `Risposte del modulo 1!D2`, Sprint `Risposte del modulo 2!C5, Risposte del modulo 2!D5, Risposte del modulo 2!E5`, Gara `Risposte del modulo 3!C2, Risposte del modulo 3!D2, Risposte del modulo 3!E2, Risposte del modulo 3!F2, Risposte del modulo 3!G2, Risposte del modulo 3!H2`
- Valori Excel: pole=M. Marquez; tempo=01:19.195; sprint=M. Marquez / R. Fernandez / A. Marquez; gara=M. Marquez / F. Di Giannantonio / A. Ogura / A. Marquez / R. Fernandez; out=J. Mir

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|7fc4a2da-1da1-5fc9-b033-1d950d5469f0|POLE|—|Marc Marquez|M. Marquez|0|5|
|7df4c277-1172-5a23-bfc8-dfa4b39ab77a|QUALIFYING_TIME|—|79.195|01:19.195|0|3|
|7110b198-c80b-549a-943c-7e897596f357|RACE|1|Marc Marquez|M. Marquez|0|5|
|f475e038-c4a6-5552-b385-3c81610c4017|RACE|2|Fabio Di Giannantonio|F. Di Giannantonio|0|0|
|fbf3e247-69a9-5b6d-97b4-8354a373381a|RACE|3|Ai Ogura|A. Ogura|0|3|
|e3f78c11-0d06-5ca8-99b9-003f30e7a23d|RACE|4|Alex Marquez|A. Marquez|0|0|
|54c08a5b-d458-50a4-aa83-2f3d7d194486|RACE|5|Raul Fernandez|R. Fernandez|0|1|
|c6d3388a-3161-5beb-bfcc-7edc3ae6d739|RACE_OUT|—|Joan Mir|J. Mir|0|2|
|e8132a5d-9eb8-551f-8bdd-4e222d20d513|SPRINT|1|Marc Marquez|M. Marquez|0|3|
|75291759-daec-5642-9c95-c8095869950e|SPRINT|2|Raul Fernandez|R. Fernandez|0|0|
|63beb06d-353b-50d1-b972-1c07127517a7|SPRINT|3|Alex Marquez|A. Marquez|0|1|

- Scoring canonico: Qualifica **8** (pole 5 + tempo 3); Sprint **4** [3, 0, 1]; Gara **10** [posizioni 9; bonus 2; malus -1; OUT 2]
- Totale storico ricostruito: **22** = 8 + 4 + 10.

### Nicholas / GRAND PRIX OF CZECHIA

- Prediction DB: `02b3d6f6-db00-5b64-8557-5323323343af`
- Excel: `/tmp/fantamotogp-repubblica-ceca.xlsx`
- Righe: Q `Risposte del modulo 1!2`, Sprint `Risposte del modulo 2!4`, Gara `Risposte del modulo 3!4`
- Riferimenti: Pole `Risposte del modulo 1!C2`, tempo `Risposte del modulo 1!D2`, Sprint `Risposte del modulo 2!C4, Risposte del modulo 2!D4, Risposte del modulo 2!E4`, Gara `Risposte del modulo 3!C4, Risposte del modulo 3!D4, Risposte del modulo 3!E4, Risposte del modulo 3!F4, Risposte del modulo 3!G4, Risposte del modulo 3!H4`
- Valori Excel: pole=M. Marquez; tempo=01:52.000; sprint=A. Ogura / M. Marquez / M. Bezzecchi; gara=A. Ogura / M. Marquez / F. Bagnaia / F. Di Giannantonio / P. Acosta; out=J. Mir

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|673eb3dd-f2bd-5cb1-8211-601df4c07e40|POLE|—|Marc Marquez|M. Marquez|0|0|
|e50ba681-421d-5e01-a426-10c686ee5b53|QUALIFYING_TIME|—|112|01:52.000|0|0|
|b4c01b90-9f5e-5a6d-b471-4a358cdef626|RACE|1|Ai Ogura|A. Ogura|0|3|
|65a158a3-dd10-5d99-9615-036acec08c89|RACE|2|Marc Marquez|M. Marquez|0|3|
|a2dc272d-4f51-5689-83b6-671804420d76|RACE|3|Francesco Bagnaia|F. Bagnaia|0|5|
|3f8d1ee6-9474-525a-a577-277302f7c62c|RACE|4|Fabio Di Giannantonio|F. Di Giannantonio|0|5|
|97ca267b-eefb-5278-bd98-1a082bb4ed57|RACE|5|Pedro Acosta|P. Acosta|0|0|
|8dede5f0-2b19-5ca9-a607-aca583a4e783|RACE_OUT|—|Joan Mir|J. Mir|0|0|
|1635e8ec-c5ce-52ce-93ef-4d8ae06ad112|SPRINT|1|Ai Ogura|A. Ogura|0|1|
|c4feba72-3b45-54da-a871-9656af73577e|SPRINT|2|Marc Marquez|M. Marquez|0|1|
|97afe8ff-0d71-53e5-89d2-78ac7fd10921|SPRINT|3|Marco Bezzecchi|M. Bezzecchi|0|0|

- Scoring canonico: Qualifica **0** (pole 0 + tempo 0); Sprint **2** [1, 1, 0]; Gara **15** [posizioni 16; bonus 0; malus -1; OUT 0]
- Totale storico ricostruito: **17** = 0 + 2 + 15.

### Nicholas / GRAND PRIX OF THE NETHERLANDS

- Prediction DB: `014480b4-4bb9-50fa-bd8c-b2d5ce1d6c09`
- Excel: `/tmp/fantamotogp-netherlands.xlsx`
- Righe: Q `Risposte del modulo 1!2`, Sprint `Risposte del modulo 2!2`, Gara `Risposte del modulo 3!5`
- Riferimenti: Pole `Risposte del modulo 1!C2`, tempo `Risposte del modulo 1!D2`, Sprint `Risposte del modulo 2!C2, Risposte del modulo 2!D2, Risposte del modulo 2!E2`, Gara `Risposte del modulo 3!C5, Risposte del modulo 3!D5, Risposte del modulo 3!E5, Risposte del modulo 3!F5, Risposte del modulo 3!G5, Risposte del modulo 3!H5`
- Valori Excel: pole=M. Bezzecchi; tempo=01:30.450; sprint=J. Martin / M. Bezzecchi / A. Ogura; gara=M. Bezzecchi / A. Ogura / R. Fernandez / J. Martin / F. Di Giannantonio; out=B. Binder

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|47e163b5-0edd-501b-a382-149e17825092|POLE|—|Marco Bezzecchi|M. Bezzecchi|0|0|
|0cc779ea-414d-54a9-b91d-0fefacecb29e|QUALIFYING_TIME|—|90.45|01:30.450|0|1|
|1f1136ea-7801-5fdb-96f2-f69a961815e1|RACE|1|Marco Bezzecchi|M. Bezzecchi|0|0|
|4937b856-ffab-5e11-8093-e3fe6eef6c7e|RACE|2|Ai Ogura|A. Ogura|0|3|
|6abaf80b-6961-5ba3-a224-fbf472200bcd|RACE|3|Raul Fernandez|R. Fernandez|0|3|
|e4a34c2c-3c86-5d22-b3f6-3127b257b925|RACE|4|Jorge Martin|J. Martin|0|3|
|31c4d71c-fc74-5faa-ad4e-8ca93cec3a69|RACE|5|Fabio Di Giannantonio|F. Di Giannantonio|0|3|
|ece32ef3-c770-5053-8df3-a7f25132c909|RACE_OUT|—|Brad Binder|B. Binder|0|0|
|11503f0a-2ddc-557a-b471-923572580acd|SPRINT|1|Jorge Martin|J. Martin|0|0|
|0b55f784-3765-5400-81a7-5562214b8abd|SPRINT|2|Marco Bezzecchi|M. Bezzecchi|0|0|
|ee31a5d3-5b8a-543a-a5c2-9e9f0c7a9570|SPRINT|3|Ai Ogura|A. Ogura|0|1|

- Scoring canonico: Qualifica **1** (pole 0 + tempo 1); Sprint **1** [0, 0, 1]; Gara **11** [posizioni 12; bonus 0; malus -1; OUT 0]
- Totale storico ricostruito: **13** = 1 + 1 + 11.

### Nicholas / GRAND PRIX DE FRANCE

- Prediction DB: `08fedd41-b194-55fd-9163-1e65620fc093`
- Excel: `/tmp/fantamotogp-francia.xlsx`
- Righe: Q `Risposte del modulo 1!6`, Sprint `Risposte del modulo 2!5`, Gara `Risposte del modulo 3!7`
- Riferimenti: Pole `Risposte del modulo 1!C6`, tempo `Risposte del modulo 1!D6`, Sprint `Risposte del modulo 2!C5, Risposte del modulo 2!D5, Risposte del modulo 2!E5`, Gara `Risposte del modulo 3!C7, Risposte del modulo 3!D7, Risposte del modulo 3!E7, Risposte del modulo 3!F7, Risposte del modulo 3!G7, Risposte del modulo 3!H7`
- Valori Excel: pole=F. Di Giannantonio; tempo=01:29.430; sprint=M. Marquez / M. Bezzecchi / F. Bagnaia; gara=M. Bezzecchi / J. Martin / F. Bagnaia / P. Acosta / F. Di Giannantonio; out=J. Mir

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|fc32bc96-00da-5d1b-8c69-2083b2f72812|POLE|—|Fabio Di Giannantonio|F. Di Giannantonio|0|0|
|db8ccd36-7fc2-5015-8696-001b77f99a37|QUALIFYING_TIME|—|89.43|01:29.430|0|3|
|2fcac1ce-f422-59e6-ae9e-2afadeb7df67|RACE|1|Marco Bezzecchi|M. Bezzecchi|0|3|
|d5130787-4434-5a3b-9c05-238a8ba8a99d|RACE|2|Jorge Martin|J. Martin|0|3|
|a72c03b2-fc13-5861-b256-c6f5100c4ab8|RACE|3|Francesco Bagnaia|F. Bagnaia|0|0|
|e59b7200-d7ba-557b-b72e-0a3f5c521bb3|RACE|4|Pedro Acosta|P. Acosta|0|3|
|084d3c95-bc29-500a-820b-7e314c95b2de|RACE|5|Fabio Di Giannantonio|F. Di Giannantonio|0|3|
|fb906e7f-0c37-59d8-8d06-5062b0502c92|RACE_OUT|—|Joan Mir|J. Mir|0|2|
|6e35c496-78d2-52b9-93bf-a6f2885940bf|SPRINT|1|Marc Marquez|M. Marquez|0|0|
|d9320090-06d5-5452-8387-7988335e007b|SPRINT|2|Marco Bezzecchi|M. Bezzecchi|0|1|
|5c7b367c-a564-5e35-baa3-73a1aabcc087|SPRINT|3|Francesco Bagnaia|F. Bagnaia|0|1|

- Scoring canonico: Qualifica **3** (pole 0 + tempo 3); Sprint **2** [0, 1, 1]; Gara **13** [posizioni 12; bonus 2; malus -1; OUT 2]
- Totale storico ricostruito: **18** = 3 + 2 + 13.

### Nicholas / GRAND PRIX OF THE UNITED STATES

- Prediction DB: `5f11d5c3-3ad5-5c9a-a674-10500315ce76`
- Excel: `/tmp/fantamotogp-usa.xlsx`
- Righe: Q `Risposte del modulo 1!2`, Sprint `Risposte del modulo 2!2`, Gara `Risposte del modulo 3!2`
- Riferimenti: Pole `Risposte del modulo 1!C2`, tempo `Risposte del modulo 1!D2`, Sprint `Risposte del modulo 2!C2, Risposte del modulo 2!D2, Risposte del modulo 2!E2`, Gara `Risposte del modulo 3!C2, Risposte del modulo 3!D2, Risposte del modulo 3!E2, Risposte del modulo 3!F2, Risposte del modulo 3!G2, Risposte del modulo 3!H2`
- Valori Excel: pole=M. Marquez; tempo=02:00.500; sprint=M. Bezzecchi / F. Di Giannantonio / M. Marquez; gara=M. Bezzecchi / J. Martin / F. Di Giannantonio / F. Bagnaia / P. Acosta; out=J. Zarco

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|5876fd7d-ff26-598b-8b64-d16bde0f7a74|POLE|—|Marc Marquez|M. Marquez|0|0|
|ee220dfd-6efe-5dab-9b41-e862a0fe7d57|QUALIFYING_TIME|—|120.5|02:00.500|0|1|
|877c34a9-10d0-5b48-a7e9-d5865645d26a|RACE|1|Marco Bezzecchi|M. Bezzecchi|0|5|
|f0187887-6665-5916-b18b-942666174030|RACE|2|Jorge Martin|J. Martin|0|5|
|e3533eeb-8d9c-5707-a9a6-b50265f61673|RACE|3|Fabio Di Giannantonio|F. Di Giannantonio|0|3|
|0f641a22-10c8-5f6d-bb0f-d0ac2be49116|RACE|4|Francesco Bagnaia|F. Bagnaia|0|0|
|b5dfceee-2292-5ddc-8dba-96e3e2dbf448|RACE|5|Pedro Acosta|P. Acosta|0|1|
|c5f0ef3e-13cd-5500-858f-6c8d6ea1b3c0|RACE_OUT|—|Johann Zarco|J. Zarco|0|2|
|c0d492c1-c707-5a64-bf09-54901efac6c8|SPRINT|1|Marco Bezzecchi|M. Bezzecchi|0|0|
|2463e255-8a5a-5d5a-ba01-118af023b835|SPRINT|2|Fabio Di Giannantonio|F. Di Giannantonio|0|0|
|e7451ec9-56b6-572a-8a0b-3521ad6e7374|SPRINT|3|Marc Marquez|M. Marquez|0|0|

- Scoring canonico: Qualifica **1** (pole 0 + tempo 1); Sprint **0** [0, 0, 0]; Gara **16** [posizioni 14; bonus 2; malus 0; OUT 2]
- Totale storico ricostruito: **17** = 1 + 0 + 16.

### Nicholas / GRAND PRIX OF SPAIN

- Prediction DB: `2c90c751-4587-595b-9cb9-6d01cae55d02`
- Excel: `/tmp/fantamotogp-spagna.xlsx`
- Righe: Q `Risposte del modulo 1!8`, Sprint `Risposte del modulo 2!5`, Gara `Risposte del modulo 3!5`
- Riferimenti: Pole `Risposte del modulo 1!C8`, tempo `Risposte del modulo 1!D8`, Sprint `Risposte del modulo 2!C5, Risposte del modulo 2!D5, Risposte del modulo 2!E5`, Gara `Risposte del modulo 3!C5, Risposte del modulo 3!D5, Risposte del modulo 3!E5, Risposte del modulo 3!F5, Risposte del modulo 3!G5, Risposte del modulo 3!H5`
- Valori Excel: pole=F. Di Giannantonio; tempo=01:35.610; sprint=M. Marquez / M. Bezzecchi / F. Di Giannantonio; gara=M. Bezzecchi / M. Marquez / A. Marquez / F. Di Giannantonio / J. Martin; out=J. Miller

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|177473f6-7e7e-55bd-8915-ab562db11d52|POLE|—|Fabio Di Giannantonio|F. Di Giannantonio|0|0|
|1cab2a99-50a4-5d47-8701-60738b556c9e|QUALIFYING_TIME|—|95.61|01:35.610|0|0|
|b3b2db11-d0c3-5575-bcdb-db8bfa285357|RACE|1|Marco Bezzecchi|M. Bezzecchi|0|3|
|496e2c86-c033-5529-83b0-9f465ced5ab2|RACE|2|Marc Marquez|M. Marquez|0|0|
|196e499c-b7ba-5ef6-8930-5a66a7ae55e6|RACE|3|Alex Marquez|A. Marquez|0|1|
|52b91a0d-947d-5761-b520-9701346cdfbe|RACE|4|Fabio Di Giannantonio|F. Di Giannantonio|0|3|
|2a539302-aba7-5440-b50c-b20dd1ba5c09|RACE|5|Jorge Martin|J. Martin|0|3|
|29a97b92-9642-5521-972a-9433cbe080b4|RACE_OUT|—|Jack Miller|J. Miller|0|0|
|deb3861f-e113-53aa-a8c4-c120a6742d87|SPRINT|1|Marc Marquez|M. Marquez|0|3|
|57ae4c4b-6ab2-531f-8d16-55c40864b699|SPRINT|2|Marco Bezzecchi|M. Bezzecchi|0|0|
|70481586-01b0-5778-8013-85869ef3b1b9|SPRINT|3|Fabio Di Giannantonio|F. Di Giannantonio|0|0|

- Scoring canonico: Qualifica **0** (pole 0 + tempo 0); Sprint **3** [3, 0, 0]; Gara **9** [posizioni 10; bonus 0; malus -1; OUT 0]
- Totale storico ricostruito: **12** = 0 + 3 + 9.

### Nicholas / GRAND PRIX OF GREAT BRITAIN

- Prediction DB: `b791a713-b510-5c5f-9940-6f9bfaa65a0a`
- Excel: `/tmp/fantamotogp-uk.xlsx`
- Righe: Q `Risposte del modulo 1!7`, Sprint `Risposte del modulo 2!5`, Gara `Risposte del modulo 3!2`
- Riferimenti: Pole `Risposte del modulo 1!C7`, tempo `Risposte del modulo 1!D7`, Sprint `Risposte del modulo 2!C5, Risposte del modulo 2!D5, Risposte del modulo 2!E5`, Gara `Risposte del modulo 3!C2, Risposte del modulo 3!D2, Risposte del modulo 3!E2, Risposte del modulo 3!F2, Risposte del modulo 3!G2, Risposte del modulo 3!H2`
- Valori Excel: pole=M. Bezzecchi; tempo=01:56.354; sprint=R. Fernandez / A. Ogura / F. Di Giannantonio; gara=A. Ogura / J. Martin / M. Bezzecchi / R. Fernandez / F. Di Giannantonio; out=J. Mir

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|815b5755-4599-557c-9f7b-cea4cca7f5d7|POLE|—|Marco Bezzecchi|M. Bezzecchi|0|0|
|1602f217-b059-5975-b0d4-049f2b67b316|QUALIFYING_TIME|—|116.354|01:56.354|0|3|
|7717bf97-ca58-53c2-97c6-2425cd1148a6|RACE|1|Ai Ogura|A. Ogura|0|0|
|6f54d672-d11c-53d7-a6da-52a179f96b12|RACE|2|Jorge Martin|J. Martin|0|5|
|b2d83fdc-1064-5b4f-b913-dd71327633f5|RACE|3|Marco Bezzecchi|M. Bezzecchi|0|5|
|fe7d829a-41e5-5c88-8054-cf1578fd5bec|RACE|4|Raul Fernandez|R. Fernandez|0|1|
|d81bc4b7-28a3-5cbb-bb33-d4aeaa8b6362|RACE|5|Fabio Di Giannantonio|F. Di Giannantonio|0|0|
|79866207-3324-57fa-b1b9-66a3560d1d70|RACE_OUT|—|Joan Mir|J. Mir|0|2|
|9ae84b1f-8909-5d43-8ead-4938beb36bc1|SPRINT|1|Raul Fernandez|R. Fernandez|0|0|
|a32ec9ee-32c0-5bed-b3ca-f406bed25c6b|SPRINT|2|Ai Ogura|A. Ogura|0|3|
|eb8733e6-79ee-5abd-b89a-ca4a6e6d5c95|SPRINT|3|Fabio Di Giannantonio|F. Di Giannantonio|0|0|

- Scoring canonico: Qualifica **3** (pole 0 + tempo 3); Sprint **3** [0, 3, 0]; Gara **12** [posizioni 11; bonus 2; malus -1; OUT 2]
- Totale storico ricostruito: **18** = 3 + 3 + 12.

### alessandro.cavasso.1995 / GRAND PRIX OF THE UNITED STATES

- Prediction DB: `720df8c6-0369-5339-a00a-da6174e45164`
- Excel: `/tmp/fantamotogp-usa.xlsx`
- Righe: Q `Risposte del modulo 1!7`, Sprint `Risposte del modulo 2!8`, Gara `Risposte del modulo 3!8`
- Riferimenti: Pole `Risposte del modulo 1!C7`, tempo `Risposte del modulo 1!D7`, Sprint `Risposte del modulo 2!C8, Risposte del modulo 2!D8, Risposte del modulo 2!E8`, Gara `Risposte del modulo 3!C8, Risposte del modulo 3!D8, Risposte del modulo 3!E8, Risposte del modulo 3!F8, Risposte del modulo 3!G8, Risposte del modulo 3!H8`
- Valori Excel: pole=M. Marquez; tempo=01:59.867; sprint=M. Bezzecchi / F. Di Giannantonio / M. Marquez; gara=M. Bezzecchi / F. Di Giannantonio / F. Bagnaia / M. Marquez / J. Martin; out=J. Mir

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|d4069e13-043d-597d-9666-060e136eef79|POLE|—|Marc Marquez|M. Marquez|0|0|
|e0918036-a54d-5471-bbeb-a82ed0d72811|QUALIFYING_TIME|—|119.867|01:59.867|0|3|
|bf47f8cc-1ed6-5ff7-8b27-7c6253d96715|RACE|1|Marco Bezzecchi|M. Bezzecchi|0|5|
|471996c9-c700-53b2-8d5c-fdfbc00d84aa|RACE|2|Fabio Di Giannantonio|F. Di Giannantonio|0|1|
|c8a64a2d-7c0f-5144-85ad-0c0c5c78e0d4|RACE|3|Francesco Bagnaia|F. Bagnaia|0|0|
|aa81fc5b-da35-595c-a4c6-60e5b6fb9e97|RACE|4|Marc Marquez|M. Marquez|0|3|
|9984b793-4328-5b7e-b5ed-3fdc1a29e3bb|RACE|5|Jorge Martin|J. Martin|0|1|
|a4fb917d-451c-57a7-8194-7ba1b4a4b2cd|RACE_OUT|—|Joan Mir|J. Mir|0|2|
|7d4774b7-51e7-5cfd-83d7-d562e6992c1d|SPRINT|1|Marco Bezzecchi|M. Bezzecchi|0|0|
|a1fd9762-6025-55ff-97fe-e83c6fecb185|SPRINT|2|Fabio Di Giannantonio|F. Di Giannantonio|0|0|
|d4e35cf2-ca35-5272-aea8-339205250646|SPRINT|3|Marc Marquez|M. Marquez|0|0|

- Scoring canonico: Qualifica **3** (pole 0 + tempo 3); Sprint **0** [0, 0, 0]; Gara **12** [posizioni 10; bonus 2; malus 0; OUT 2]
- Totale storico ricostruito: **15** = 3 + 0 + 12.

### alessandro.cavasso.1995 / GRAND PRIX OF HUNGARY

- Prediction DB: `39c6ed23-b794-5e63-8202-2cc08b384c5f`
- Excel: `/tmp/fantamotogp-ungheria.xlsx`
- Righe: Q `Risposte del modulo 1!5`, Sprint `Risposte del modulo 2!8`, Gara `Risposte del modulo 3!8`
- Riferimenti: Pole `Risposte del modulo 1!C5`, tempo `Risposte del modulo 1!D5`, Sprint `Risposte del modulo 2!C8, Risposte del modulo 2!D8, Risposte del modulo 2!E8`, Gara `Risposte del modulo 3!C8, Risposte del modulo 3!D8, Risposte del modulo 3!E8, Risposte del modulo 3!F8, Risposte del modulo 3!G8, Risposte del modulo 3!H8`
- Valori Excel: pole=M. Marquez; tempo=01:35.457; sprint=P. Acosta / F. Di Giannantonio / M. Marquez; gara=M. Bezzecchi / P. Acosta / M. Marquez / J. Martin / R. Fernandez; out=J. Mir

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|b574a9be-dcf9-521d-8132-268e8d37f8be|POLE|—|Marc Marquez|M. Marquez|0|5|
|6fa64687-82b1-5e48-99d4-7aadf01037db|QUALIFYING_TIME|—|95.457|01:35.457|0|0|
|2b986588-e42c-54b9-8929-bd45dddd5907|RACE|1|Marco Bezzecchi|M. Bezzecchi|0|0|
|cf4f0020-6120-5fc1-b3de-022bc444a6e9|RACE|2|Pedro Acosta|P. Acosta|0|5|
|b3ef2ed7-634a-5606-a081-72d4cd481a64|RACE|3|Marc Marquez|M. Marquez|0|1|
|27025e51-94af-5df3-b1bd-c07ff585cd53|RACE|4|Jorge Martin|J. Martin|0|0|
|7a9bd987-adb4-5ad1-be94-a5b27a88a670|RACE|5|Raul Fernandez|R. Fernandez|0|0|
|0ac09be1-4239-58b3-bbc4-a4578af6f372|RACE_OUT|—|Joan Mir|J. Mir|0|2|
|93d6f4f9-85c1-52bd-82b7-6ab205fe65d8|SPRINT|1|Pedro Acosta|P. Acosta|0|1|
|6e58c4e0-6215-57ab-9e15-d00f3ac13a64|SPRINT|2|Fabio Di Giannantonio|F. Di Giannantonio|0|0|
|1db2fae5-2878-5ca9-8960-0cb14004dd02|SPRINT|3|Marc Marquez|M. Marquez|0|0|

- Scoring canonico: Qualifica **5** (pole 5 + tempo 0); Sprint **1** [1, 0, 0]; Gara **3** [posizioni 6; bonus 2; malus -5; OUT 2]
- Totale storico ricostruito: **9** = 5 + 1 + 3.

### alessandro.cavasso.1995 / GRAND PRIX OF SPAIN

- Prediction DB: `a07f1946-4363-534f-ba30-8d77b095673b`
- Excel: `/tmp/fantamotogp-spagna.xlsx`
- Righe: Q `Risposte del modulo 1!4`, Sprint `Risposte del modulo 2!7`, Gara `Risposte del modulo 3!7`
- Riferimenti: Pole `Risposte del modulo 1!C4`, tempo `Risposte del modulo 1!D4`, Sprint `Risposte del modulo 2!C7, Risposte del modulo 2!D7, Risposte del modulo 2!E7`, Gara `Risposte del modulo 3!C7, Risposte del modulo 3!D7, Risposte del modulo 3!E7, Risposte del modulo 3!F7, Risposte del modulo 3!G7, Risposte del modulo 3!H7`
- Valori Excel: pole=M. Marquez; tempo=01:43.274; sprint=M. Marquez / M. Bezzecchi / F. Di Giannantonio; gara=M. Marquez / A. Marquez / M. Bezzecchi / F. Di Giannantonio / J. Martin; out=J. Mir

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|49a5910f-86cb-5180-95c7-db121a9a1d47|POLE|—|Marc Marquez|M. Marquez|0|5|
|4cd8f91f-8cea-5081-a39f-5e5feb477a38|QUALIFYING_TIME|—|103.274|01:43.274|0|0|
|7a2435ba-991f-5433-b1bf-b41dde10da33|RACE|1|Marc Marquez|M. Marquez|0|0|
|6c7037a9-84af-59f6-b26a-4f44c5478f6f|RACE|2|Alex Marquez|A. Marquez|0|3|
|86028990-8fea-58a3-b82b-2124c61c8fc5|RACE|3|Marco Bezzecchi|M. Bezzecchi|0|3|
|8a184196-dada-565e-b261-35e6281bad67|RACE|4|Fabio Di Giannantonio|F. Di Giannantonio|0|3|
|2c6014fd-e145-5739-9db6-617185902383|RACE|5|Jorge Martin|J. Martin|0|3|
|fe1dafa2-d1e0-5ab4-98f9-37094adeae84|RACE_OUT|—|Joan Mir|J. Mir|0|0|
|15656bad-a29d-5540-a209-d7b54f457510|SPRINT|1|Marc Marquez|M. Marquez|0|3|
|70566f40-34f4-5c50-96df-55a212dffafa|SPRINT|2|Marco Bezzecchi|M. Bezzecchi|0|0|
|bf3c677b-7c52-5fb4-a435-2a2686c746aa|SPRINT|3|Fabio Di Giannantonio|F. Di Giannantonio|0|0|

- Scoring canonico: Qualifica **5** (pole 5 + tempo 0); Sprint **3** [3, 0, 0]; Gara **11** [posizioni 12; bonus 0; malus -1; OUT 0]
- Totale storico ricostruito: **19** = 5 + 3 + 11.

### alessandro.cavasso.1995 / GRAND PRIX OF CZECHIA

- Prediction DB: `89a0489c-a9b3-57ff-b65a-cab4151296eb`
- Excel: `/tmp/fantamotogp-repubblica-ceca.xlsx`
- Righe: Q `Risposte del modulo 1!9`, Sprint `Risposte del modulo 2!6`, Gara `Risposte del modulo 3!6`
- Riferimenti: Pole `Risposte del modulo 1!C9`, tempo `Risposte del modulo 1!D9`, Sprint `Risposte del modulo 2!C6, Risposte del modulo 2!D6, Risposte del modulo 2!E6`, Gara `Risposte del modulo 3!C6, Risposte del modulo 3!D6, Risposte del modulo 3!E6, Risposte del modulo 3!F6, Risposte del modulo 3!G6, Risposte del modulo 3!H6`
- Valori Excel: pole=M. Bezzecchi; tempo=01:51.347; sprint=M. Bezzecchi / A. Ogura / F. Di Giannantonio; gara=A. Ogura / F. Di Giannantonio / R. Fernandez / F. Bagnaia / M. Marquez; out=J. Mir

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|fcce9761-f5e6-5676-8d60-6cf8de1bd61e|POLE|—|Marco Bezzecchi|M. Bezzecchi|0|0|
|179a938c-09f1-5771-9232-3da9352105e4|QUALIFYING_TIME|—|111.347|01:51.347|0|3|
|c889f4ee-5160-5251-a548-fa93525a18ca|RACE|1|Ai Ogura|A. Ogura|0|3|
|4c279506-0566-57c3-a0c1-63e190f75cb6|RACE|2|Fabio Di Giannantonio|F. Di Giannantonio|0|1|
|b49831bb-79cc-5881-86cf-f501f965d0cf|RACE|3|Raul Fernandez|R. Fernandez|0|0|
|50874b20-cf4f-5e07-a9a1-fabd84c9b070|RACE|4|Francesco Bagnaia|F. Bagnaia|0|3|
|9938c42d-2965-55a7-882a-bb2139e6b5b1|RACE|5|Marc Marquez|M. Marquez|0|1|
|9684c656-d26f-562e-8f6b-81a176bc84ac|RACE_OUT|—|Joan Mir|J. Mir|0|0|
|b6850bee-3127-5b16-83c2-de91e6890c73|SPRINT|1|Marco Bezzecchi|M. Bezzecchi|0|0|
|a7ae4ced-4e09-59f4-b500-14f1f346ea94|SPRINT|2|Ai Ogura|A. Ogura|0|3|
|66800f94-6bca-5516-86f0-a8eb6b21591d|SPRINT|3|Fabio Di Giannantonio|F. Di Giannantonio|0|0|

- Scoring canonico: Qualifica **3** (pole 0 + tempo 3); Sprint **3** [0, 3, 0]; Gara **8** [posizioni 8; bonus 0; malus 0; OUT 0]
- Totale storico ricostruito: **14** = 3 + 3 + 8.

### alessandro.cavasso.1995 / GRAND PRIX OF BRAZIL

- Prediction DB: `c8b2f9a7-e7f6-5bad-8bde-015ed67cfa1d`
- Excel: `/tmp/fantamotogp-brasile.xlsx`
- Righe: Q `Risposte del modulo 1!5`, Sprint `Risposte del modulo 2!4`, Gara `Risposte del modulo 3!10`
- Riferimenti: Pole `Risposte del modulo 1!C5`, tempo `Risposte del modulo 1!D5`, Sprint `Risposte del modulo 2!C4, Risposte del modulo 2!D4, Risposte del modulo 2!E4`, Gara `Risposte del modulo 3!C10, Risposte del modulo 3!D10, Risposte del modulo 3!E10, Risposte del modulo 3!F10, Risposte del modulo 3!G10, Risposte del modulo 3!H10`
- Valori Excel: pole=M. Marquez; tempo=01:20.527; sprint=M. Marquez / M. Bezzecchi / J. Martin; gara=M. Marquez / M. Bezzecchi / F. Di Giannantonio / J. Martin / A. Marquez; out=J. Mir

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|8fe2161d-4c1a-592a-9a93-1c9390c8ca57|POLE|—|Marc Marquez|M. Marquez|0|0|
|15fd4e3a-491a-51c1-8029-2dc8b282a471|QUALIFYING_TIME|—|80.527|01:20.527|0|0|
|7e3c4bf7-f5ee-5bb9-a5de-ed43e502ec45|RACE|1|Marc Marquez|M. Marquez|0|1|
|45e9ad09-e0f2-5907-915e-e061e92f7a3a|RACE|2|Marco Bezzecchi|M. Bezzecchi|0|3|
|fa7620a1-c642-53b1-aab4-5238b8864271|RACE|3|Fabio Di Giannantonio|F. Di Giannantonio|0|5|
|e553954c-8c25-5590-a6bb-982032ece224|RACE|4|Jorge Martin|J. Martin|0|1|
|df00577e-130b-5fff-ae78-69b9b96a1629|RACE|5|Alex Marquez|A. Marquez|0|0|
|af7046bd-79bc-50db-a3bf-6e4ff9f54d05|RACE_OUT|—|Joan Mir|J. Mir|0|2|
|e1c0af8b-c96a-5d07-8264-5706e2ddad06|SPRINT|1|Marc Marquez|M. Marquez|0|3|
|1b431d8d-98b8-5d01-8536-9587e049a18f|SPRINT|2|Marco Bezzecchi|M. Bezzecchi|0|0|
|da19835b-d462-5e2f-9670-d9d7155d5988|SPRINT|3|Jorge Martin|J. Martin|0|3|

- Scoring canonico: Qualifica **0** (pole 0 + tempo 0); Sprint **6** [3, 0, 3]; Gara **12** [posizioni 10; bonus 2; malus 0; OUT 2]
- Totale storico ricostruito: **18** = 0 + 6 + 12.

### alessandro.cavasso.1995 / GRAND PRIX OF CATALONIA

- Prediction DB: `143313aa-fe16-533b-9ba9-d0e477618007`
- Excel: `/tmp/fantamotogp-catalogna.xlsx`
- Righe: Q `Risposte del modulo 1!8`, Sprint `Risposte del modulo 2!18`, Gara `Risposte del modulo 3!7`
- Riferimenti: Pole `Risposte del modulo 1!C8`, tempo `Risposte del modulo 1!D8`, Sprint `Risposte del modulo 2!C18, Risposte del modulo 2!D18, Risposte del modulo 2!E18`, Gara `Risposte del modulo 3!C7, Risposte del modulo 3!D7, Risposte del modulo 3!E7, Risposte del modulo 3!F7, Risposte del modulo 3!G7, Risposte del modulo 3!H7`
- Valori Excel: pole=P. Acosta; tempo=01:38.427; sprint=P. Acosta / A. Marquez / R. Fernandez; gara=F. Di Giannantonio / A. Marquez / P. Acosta / R. Fernandez / J. Martin; out=J. Mir

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|610bc0e3-19c7-5115-86ec-f87eb5bc5a40|POLE|—|Pedro Acosta|P. Acosta|0|5|
|dc2ec871-2471-5e07-ade8-afc01728d73f|QUALIFYING_TIME|—|98.427|01:38.427|0|1|
|f75fcca2-fbb3-5968-85b6-37f8c715b215|RACE|1|Fabio Di Giannantonio|F. Di Giannantonio|0|5|
|9cb523be-bb16-503d-b0f8-4aba1a01b72a|RACE|2|Alex Marquez|A. Marquez|0|0|
|58142c8c-8ee8-5625-9cc8-4f6ef86720b3|RACE|3|Pedro Acosta|P. Acosta|0|0|
|e47453f5-e14f-5be9-b5d0-82c9efa5f8f9|RACE|4|Raul Fernandez|R. Fernandez|0|0|
|53263f7b-9693-5bd8-a693-81df144a4b2f|RACE|5|Jorge Martin|J. Martin|0|0|
|a30dfea9-71f3-5b29-9eb3-32efbd37606f|RACE_OUT|—|Joan Mir|J. Mir|0|0|
|0605c601-6ba5-5ad8-85cf-fd1421bb368d|SPRINT|1|Pedro Acosta|P. Acosta|0|1|
|a729710c-7995-512e-9a6a-dd7e7043e3db|SPRINT|2|Alex Marquez|A. Marquez|0|1|
|b09a44a7-4136-5f15-9694-7bf193c5ecb6|SPRINT|3|Raul Fernandez|R. Fernandez|0|0|

- Scoring canonico: Qualifica **6** (pole 5 + tempo 1); Sprint **2** [1, 1, 0]; Gara **0** [posizioni 5; bonus 0; malus -5; OUT 0]
- Totale storico ricostruito: **8** = 6 + 2 + 0.

### alessandro.cavasso.1995 / GRAND PRIX OF GREAT BRITAIN

- Prediction DB: `b7f18f49-1f80-5e61-9883-29acebd3f35e`
- Excel: `/tmp/fantamotogp-uk.xlsx`
- Righe: Q `Risposte del modulo 1!4`, Sprint `Risposte del modulo 2!2`, Gara `Risposte del modulo 3!5`
- Riferimenti: Pole `Risposte del modulo 1!C4`, tempo `Risposte del modulo 1!D4`, Sprint `Risposte del modulo 2!C2, Risposte del modulo 2!D2, Risposte del modulo 2!E2`, Gara `Risposte del modulo 3!C5, Risposte del modulo 3!D5, Risposte del modulo 3!E5, Risposte del modulo 3!F5, Risposte del modulo 3!G5, Risposte del modulo 3!H5`
- Valori Excel: pole=M. Bezzecchi; tempo=01:56.128; sprint=J. Martin / A. Ogura / M. Bezzecchi; gara=M. Bezzecchi / J. Martin / A. Ogura / F. Di Giannantonio / R. Fernandez; out=J. Mir

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|5eb935a2-0e17-5509-bcc4-920295ffa95c|POLE|—|Marco Bezzecchi|M. Bezzecchi|0|0|
|8f847e27-44ec-51dd-ae75-d51c566708cf|QUALIFYING_TIME|—|116.128|01:56.128|0|5|
|9025caaa-3ee8-509d-b910-d1e73f5e4a8d|RACE|1|Marco Bezzecchi|M. Bezzecchi|0|1|
|4c605ce7-4f8e-5c65-b474-4d4dd743b87a|RACE|2|Jorge Martin|J. Martin|0|5|
|9964ef77-d1ce-51e9-85d8-f79f5aa9370a|RACE|3|Ai Ogura|A. Ogura|0|0|
|7d1f05ca-1fe5-54d3-a636-2ac278f28b86|RACE|4|Fabio Di Giannantonio|F. Di Giannantonio|0|0|
|f3656f75-c6d2-5bf6-9e50-259ab7e72c9b|RACE|5|Raul Fernandez|R. Fernandez|0|1|
|cde9b429-a9bc-5b0c-a9d0-376e85348403|RACE_OUT|—|Joan Mir|J. Mir|0|2|
|9277ea16-72c3-562b-ae64-7cbda44de2d5|SPRINT|1|Jorge Martin|J. Martin|0|3|
|6b124489-14cc-5c6c-ae0d-06215a40c4c4|SPRINT|2|Ai Ogura|A. Ogura|0|3|
|6567d9a5-76c0-508b-a253-1672d9795f58|SPRINT|3|Marco Bezzecchi|M. Bezzecchi|0|3|

- Scoring canonico: Qualifica **5** (pole 0 + tempo 5); Sprint **9** [3, 3, 3]; Gara **8** [posizioni 7; bonus 2; malus -1; OUT 2]
- Totale storico ricostruito: **22** = 5 + 9 + 8.

### marty.bria1996 / GRAND PRIX OF BRAZIL

- Prediction DB: `07b30444-e140-557f-acd6-6ce07eaaadb0`
- Excel: `/tmp/fantamotogp-brasile.xlsx`
- Righe: Q `Risposte del modulo 1!9`, Sprint `Risposte del modulo 2!8`, Gara `Risposte del modulo 3!7`
- Riferimenti: Pole `Risposte del modulo 1!C9`, tempo `Risposte del modulo 1!D9`, Sprint `Risposte del modulo 2!C8, Risposte del modulo 2!D8, Risposte del modulo 2!E8`, Gara `Risposte del modulo 3!C7, Risposte del modulo 3!D7, Risposte del modulo 3!E7, Risposte del modulo 3!F7, Risposte del modulo 3!G7, Risposte del modulo 3!H7`
- Valori Excel: pole=J. Martin; tempo=01:17.789; sprint=M. Bezzecchi / M. Marquez / F. Di Giannantonio; gara=M. Marquez / F. Di Giannantonio / J. Martin / M. Bezzecchi / F. Quartararo; out=J. Mir

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|67846b9f-6e35-54b9-8652-b13e5c05ee9d|POLE|—|Jorge Martin|J. Martin|0|0|
|a322b366-a658-5214-a3fa-e1e3d9397ee1|QUALIFYING_TIME|—|77.789|01:17.789|0|1|
|d0bb13f5-2768-56a6-8676-2e85d6e3c047|RACE|1|Marc Marquez|M. Marquez|0|1|
|ab056241-1e48-5840-8f18-baf867437333|RACE|2|Fabio Di Giannantonio|F. Di Giannantonio|0|3|
|763942bf-da08-5825-b13c-a5912616a23a|RACE|3|Jorge Martin|J. Martin|0|3|
|c53bcd5b-7f5a-5128-9cde-8fabdafb2b3b|RACE|4|Marco Bezzecchi|M. Bezzecchi|0|1|
|0ed22d0b-ab7a-56b5-903b-ff72c5c1e7a4|RACE|5|Fabio Quartararo|F. Quartararo|0|0|
|7df39d2e-9c63-54d2-9eef-aca524ff26b4|RACE_OUT|—|Joan Mir|J. Mir|0|2|
|9b12a7f9-7db4-5131-a9f4-5f887ce120a4|SPRINT|1|Marco Bezzecchi|M. Bezzecchi|0|0|
|1fa387d0-4f0f-5cb3-840e-a7da0007d8a6|SPRINT|2|Marc Marquez|M. Marquez|0|1|
|be7a29f7-40b7-544e-ad8b-926e503d1482|SPRINT|3|Fabio Di Giannantonio|F. Di Giannantonio|0|1|

- Scoring canonico: Qualifica **1** (pole 0 + tempo 1); Sprint **2** [0, 1, 1]; Gara **10** [posizioni 8; bonus 2; malus 0; OUT 2]
- Totale storico ricostruito: **13** = 1 + 2 + 10.

### Nicholas / GRAND PRIX OF BRAZIL

- Prediction DB: `911d3e8e-4478-56eb-a496-46298877aa91`
- Excel: `/tmp/fantamotogp-brasile.xlsx`
- Righe: Q `Risposte del modulo 1!2`, Sprint `Risposte del modulo 2!2`, Gara `Risposte del modulo 3!2`
- Riferimenti: Pole `Risposte del modulo 1!C2`, tempo `Risposte del modulo 1!D2`, Sprint `Risposte del modulo 2!C2, Risposte del modulo 2!D2, Risposte del modulo 2!E2`, Gara `Risposte del modulo 3!C2, Risposte del modulo 3!D2, Risposte del modulo 3!E2, Risposte del modulo 3!F2, Risposte del modulo 3!G2, Risposte del modulo 3!H2`
- Valori Excel: pole=M. Marquez; tempo=01:17:850; sprint=M. Marquez / M. Bezzecchi / J. Martin; gara=M. Marquez / M. Bezzecchi / F. Di Giannantonio / J. Martin / A. Ogura; out=B. Binder

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|02c6088b-415f-5a51-a73c-a0c65a459276|POLE|—|Marc Marquez|M. Marquez|0|0|
|d31d9565-7ee8-5373-a56f-cd6d1dcdc421|QUALIFYING_TIME|—|77.85|01:17:850|0|0|
|c6307761-e363-5f0b-b0b3-e2cceae1e852|RACE|1|Marc Marquez|M. Marquez|0|1|
|69c4d0cb-3a5d-57f5-ba42-04c443735bf9|RACE|2|Marco Bezzecchi|M. Bezzecchi|0|3|
|d586bedb-b814-5792-b266-12be74d164c7|RACE|3|Fabio Di Giannantonio|F. Di Giannantonio|0|5|
|760f3ac5-4225-51be-9b7d-0fbe4078bde2|RACE|4|Jorge Martin|J. Martin|0|1|
|5188238d-3a42-5df9-b71b-5867bf0fd8da|RACE|5|Ai Ogura|A. Ogura|0|5|
|4b30b706-ed57-5975-b90e-b16ea455cb76|RACE_OUT|—|Brad Binder|B. Binder|0|2|
|511b0596-45fc-56d3-8860-58cd54d67d0c|SPRINT|1|Marc Marquez|M. Marquez|0|3|
|57c75bc7-6131-5f85-ba2e-be73527e3fda|SPRINT|2|Marco Bezzecchi|M. Bezzecchi|0|0|
|f14a0a9c-7b2a-57dc-bc81-fe6b6a51befd|SPRINT|3|Jorge Martin|J. Martin|0|3|

- Scoring canonico: Qualifica **0** (pole 0 + tempo 0); Sprint **6** [3, 0, 3]; Gara **19** [posizioni 15; bonus 4; malus 0; OUT 2]
- Totale storico ricostruito: **25** = 0 + 6 + 19.

### ivan23dell / GRAND PRIX OF THE UNITED STATES

- Prediction DB: `4a055cc2-00f7-549c-aa19-dee4e21dbe14`
- Excel: `/tmp/fantamotogp-usa.xlsx`
- Righe: Q `Risposte del modulo 1!4`, Sprint `Risposte del modulo 2!3`, Gara `Risposte del modulo 3!3`
- Riferimenti: Pole `Risposte del modulo 1!C4`, tempo `Risposte del modulo 1!D4`, Sprint `Risposte del modulo 2!C3, Risposte del modulo 2!D3, Risposte del modulo 2!E3`, Gara `Risposte del modulo 3!C3, Risposte del modulo 3!D3, Risposte del modulo 3!E3, Risposte del modulo 3!F3, Risposte del modulo 3!G3, Risposte del modulo 3!H3`
- Valori Excel: pole=M. Marquez; tempo=02:00.367; sprint=F. Di Giannantonio / M. Bezzecchi / P. Acosta; gara=J. Martin / M. Bezzecchi / F. Bagnaia / F. Di Giannantonio / M. Marquez; out=J. Mir

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|04d7a483-85e7-590a-8e69-bc1c0f29d92a|POLE|—|Marc Marquez|M. Marquez|0|0|
|9e09d496-a698-5d5e-82a5-d12f294ee971|QUALIFYING_TIME|—|120.367|02:00.367|0|3|
|95ab643f-7465-568e-b277-b58765cb72b4|RACE|1|Jorge Martin|J. Martin|0|3|
|8c7b16bd-a335-5409-8566-33d1f1baf8cc|RACE|2|Marco Bezzecchi|M. Bezzecchi|0|3|
|613e550f-46df-5e62-b7cc-4188668eeff7|RACE|3|Francesco Bagnaia|F. Bagnaia|0|0|
|ce1be5cf-84e7-5c5c-ac30-8e5cfa3f5ba1|RACE|4|Fabio Di Giannantonio|F. Di Giannantonio|0|5|
|0eb21462-a427-5999-be93-b2cb10ab799d|RACE|5|Marc Marquez|M. Marquez|0|5|
|179c3bd1-e43a-5dde-bc1d-b3116c713ac9|RACE_OUT|—|Joan Mir|J. Mir|0|2|
|a2f24d46-fd1c-530e-a829-08e1947ce9c8|SPRINT|1|Fabio Di Giannantonio|F. Di Giannantonio|0|0|
|2c72a345-5efd-59c4-a960-cd48600d6362|SPRINT|2|Marco Bezzecchi|M. Bezzecchi|0|0|
|5e5ade3e-95c1-5d33-a0d5-c586d4913532|SPRINT|3|Pedro Acosta|P. Acosta|0|0|

- Scoring canonico: Qualifica **3** (pole 0 + tempo 3); Sprint **0** [0, 0, 0]; Gara **18** [posizioni 16; bonus 2; malus 0; OUT 2]
- Totale storico ricostruito: **21** = 3 + 0 + 18.

### alandellosbel8 / GRAND PRIX OF THE UNITED STATES

- Prediction DB: `5d42622c-45f8-54e3-94c5-862d0c513982`
- Excel: `/tmp/fantamotogp-usa.xlsx`
- Righe: Q `Risposte del modulo 1!10`, Sprint `Risposte del modulo 2!6`, Gara `Risposte del modulo 3!4`
- Riferimenti: Pole `Risposte del modulo 1!C10`, tempo `Risposte del modulo 1!D10`, Sprint `Risposte del modulo 2!C6, Risposte del modulo 2!D6, Risposte del modulo 2!E6`, Gara `Risposte del modulo 3!C4, Risposte del modulo 3!D4, Risposte del modulo 3!E4, Risposte del modulo 3!F4, Risposte del modulo 3!G4, Risposte del modulo 3!H4`
- Valori Excel: pole=M. Bezzecchi; tempo=02:00:100; sprint=M. Bezzecchi / M. Marquez / F. Di Giannantonio; gara=M. Bezzecchi / M. Marquez / F. Di Giannantonio / J. Martin / P. Acosta; out=J. Mir

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|d5e4b57e-98c5-574d-a420-b2cd5bf9fc2a|POLE|—|Marco Bezzecchi|M. Bezzecchi|0|2|
|47a9d21e-f125-5ee3-b3a7-915ad4f8332b|QUALIFYING_TIME|—|120.1|02:00:100|0|5|
|29db91b0-62ac-5b5a-80cd-aaf06598cd65|RACE|1|Marco Bezzecchi|M. Bezzecchi|0|5|
|44a82388-5969-51af-90fa-6ebd1b472fcf|RACE|2|Marc Marquez|M. Marquez|0|1|
|53f861fe-37b6-5331-a2f4-a9404f21bf07|RACE|3|Fabio Di Giannantonio|F. Di Giannantonio|0|3|
|d18d46fd-7b1c-5094-8675-23a4a6eb0e23|RACE|4|Jorge Martin|J. Martin|0|1|
|98edd138-c7eb-5496-811d-8837088f5efc|RACE|5|Pedro Acosta|P. Acosta|0|1|
|9e15ee5d-8a83-5d61-a622-7801fb3a6c16|RACE_OUT|—|Joan Mir|J. Mir|0|2|
|bdae61a9-9d5e-5019-8491-72b11bf93dcc|SPRINT|1|Marco Bezzecchi|M. Bezzecchi|0|0|
|f8865cbb-a833-500f-b72e-b3605f744a95|SPRINT|2|Marc Marquez|M. Marquez|0|0|
|c8bfdb23-474b-5e2a-8202-d5ba3f905c05|SPRINT|3|Fabio Di Giannantonio|F. Di Giannantonio|0|0|

- Scoring canonico: Qualifica **7** (pole 2 + tempo 5); Sprint **0** [0, 0, 0]; Gara **15** [posizioni 11; bonus 4; malus 0; OUT 2]
- Totale storico ricostruito: **22** = 7 + 0 + 15.

### marino.dilorenzo / GRAND PRIX OF THE UNITED STATES

- Prediction DB: `5a55b2e0-2e55-536d-acca-0e76bb711c8c`
- Excel: `/tmp/fantamotogp-usa.xlsx`
- Righe: Q `Risposte del modulo 1!9`, Sprint `Risposte del modulo 2!11`, Gara `Risposte del modulo 3!6`
- Riferimenti: Pole `Risposte del modulo 1!C9`, tempo `Risposte del modulo 1!D9`, Sprint `Risposte del modulo 2!C11, Risposte del modulo 2!D11, Risposte del modulo 2!E11`, Gara `Risposte del modulo 3!C6, Risposte del modulo 3!D6, Risposte del modulo 3!E6, Risposte del modulo 3!F6, Risposte del modulo 3!G6, Risposte del modulo 3!H6`
- Valori Excel: pole=M. Marquez; tempo=02:00.440; sprint=F. Di Giannantonio / M. Bezzecchi / M. Marquez; gara=M. Bezzecchi / F. Di Giannantonio / F. Bagnaia / J. Martin / M. Marquez; out=F. Quartararo

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|3e99f3af-824f-5c44-96c7-4ecba3cc36fe|POLE|—|Marc Marquez|M. Marquez|0|0|
|c5ec1919-c2eb-54f4-94fe-9b78fa1afee7|QUALIFYING_TIME|—|120.44|02:00.440|0|1|
|006f480d-4015-5216-9e3a-46e5fd6c4fcd|RACE|1|Marco Bezzecchi|M. Bezzecchi|0|5|
|600163db-c923-5028-9c45-b8fbe99bc44c|RACE|2|Fabio Di Giannantonio|F. Di Giannantonio|0|1|
|c5544c76-7d3d-5e40-8dd0-4fec3c157304|RACE|3|Francesco Bagnaia|F. Bagnaia|0|0|
|477d60bf-d128-5337-9dac-11ff2c56dbea|RACE|4|Jorge Martin|J. Martin|0|1|
|b01dec30-7c51-58ea-840b-4a63f229ecbf|RACE|5|Marc Marquez|M. Marquez|0|5|
|2e8fce20-8c71-5acf-8ec4-6a45268b301f|RACE_OUT|—|Fabio Quartararo|F. Quartararo|0|0|
|2de3dfda-1846-573d-a11f-93d1a4526c40|SPRINT|1|Fabio Di Giannantonio|F. Di Giannantonio|0|0|
|eb599531-51d8-535c-9bcd-c6a944a1fa9b|SPRINT|2|Marco Bezzecchi|M. Bezzecchi|0|0|
|781dfde3-cf85-579e-a889-053496daa0c5|SPRINT|3|Marc Marquez|M. Marquez|0|0|

- Scoring canonico: Qualifica **1** (pole 0 + tempo 1); Sprint **0** [0, 0, 0]; Gara **12** [posizioni 12; bonus 0; malus 0; OUT 0]
- Totale storico ricostruito: **13** = 1 + 0 + 12.

### dalla.pozza.silvia / GRAND PRIX OF THE UNITED STATES

- Prediction DB: `508822d0-a548-5f89-9d97-3fae293309f5`
- Excel: `/tmp/fantamotogp-usa.xlsx`
- Righe: Q `Risposte del modulo 1!6`, Sprint `Risposte del modulo 2!4`, Gara `Risposte del modulo 3!9`
- Riferimenti: Pole `Risposte del modulo 1!C6`, tempo `Risposte del modulo 1!D6`, Sprint `Risposte del modulo 2!C4, Risposte del modulo 2!D4, Risposte del modulo 2!E4`, Gara `Risposte del modulo 3!C9, Risposte del modulo 3!D9, Risposte del modulo 3!E9, Risposte del modulo 3!F9, Risposte del modulo 3!G9, Risposte del modulo 3!H9`
- Valori Excel: pole=M. Marquez; tempo=01:45.100; sprint=M. Bezzecchi / M. Marquez / P. Acosta; gara=J. Martin / M. Bezzecchi / P. Acosta / M. Marquez / R. Fernandez; out=J. Mir

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|c421bb8f-105b-5134-b7ad-d2a82aa1e005|POLE|—|Marc Marquez|M. Marquez|0|0|
|497a0d45-9442-59f2-8e0c-554108cba71b|QUALIFYING_TIME|—|105.1|01:45.100|0|0|
|c0dcaa9e-e6e9-5e95-aa3e-5f71192fd485|RACE|1|Jorge Martin|J. Martin|0|3|
|482b5b1b-79e7-5a3d-bd5d-1a0ae35ec35f|RACE|2|Marco Bezzecchi|M. Bezzecchi|0|3|
|55c96811-e37b-54fc-a08d-037b2de5f614|RACE|3|Pedro Acosta|P. Acosta|0|5|
|79fbeb92-d0e4-5a89-98ac-5c2c0517c1cd|RACE|4|Marc Marquez|M. Marquez|0|3|
|e4a0909c-9201-590b-9749-b026dfcf6f73|RACE|5|Raul Fernandez|R. Fernandez|0|0|
|f0e81e5e-dfdc-5cf8-b081-59a805bf4247|RACE_OUT|—|Joan Mir|J. Mir|0|2|
|cf6141e3-3837-5e7c-8689-f9249175d019|SPRINT|1|Marco Bezzecchi|M. Bezzecchi|0|0|
|ed40c7e8-cd3e-5f8c-bc6d-3ac062a44840|SPRINT|2|Marc Marquez|M. Marquez|0|0|
|fc8abe3c-b373-5cfb-897c-bc55b1d0fc09|SPRINT|3|Pedro Acosta|P. Acosta|0|0|

- Scoring canonico: Qualifica **0** (pole 0 + tempo 0); Sprint **0** [0, 0, 0]; Gara **16** [posizioni 14; bonus 2; malus 0; OUT 2]
- Totale storico ricostruito: **16** = 0 + 0 + 16.

### lucifero1966 / GRAND PRIX OF THE UNITED STATES

- Prediction DB: `48ac4094-c3cd-5be4-8fc5-840ea80965ba`
- Excel: `/tmp/fantamotogp-usa.xlsx`
- Righe: Q `Risposte del modulo 1!3`, Sprint `Risposte del modulo 2!9`, Gara `Risposte del modulo 3!10`
- Riferimenti: Pole `Risposte del modulo 1!C3`, tempo `Risposte del modulo 1!D3`, Sprint `Risposte del modulo 2!C9, Risposte del modulo 2!D9, Risposte del modulo 2!E9`, Gara `Risposte del modulo 3!C10, Risposte del modulo 3!D10, Risposte del modulo 3!E10, Risposte del modulo 3!F10, Risposte del modulo 3!G10, Risposte del modulo 3!H10`
- Valori Excel: pole=M. Marquez; tempo=02:00:764; sprint=M. Bezzecchi / F. Di Giannantonio / F. Bagnaia; gara=M. Marquez / M. Bezzecchi / F. Bagnaia / F. Di Giannantonio / F. Aldeguer; out=J. Zarco

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|d0111f30-cb17-5426-98fd-96c3c9bc6bbc|POLE|—|Marc Marquez|M. Marquez|0|0|
|94b24137-3319-531e-9c25-aface7a881c7|QUALIFYING_TIME|—|120.764|02:00:764|0|0|
|c06619c2-d87a-5be4-90c6-503afc2ff41a|RACE|1|Marc Marquez|M. Marquez|0|1|
|e061d46d-6b49-54c1-8b5c-6c1ab1092e78|RACE|2|Marco Bezzecchi|M. Bezzecchi|0|3|
|050b06d0-1b49-5a1f-80a4-d01286f9227a|RACE|3|Francesco Bagnaia|F. Bagnaia|0|0|
|170649e4-983c-5208-aa41-2dd2740b840b|RACE|4|Fabio Di Giannantonio|F. Di Giannantonio|0|5|
|eea46e34-9698-5d9b-a3c9-abdc9764d486|RACE|5|Fermin Aldeguer|F. Aldeguer|0|0|
|02128a0a-69c7-5910-a0b8-5cd5143ca10c|RACE_OUT|—|Johann Zarco|J. Zarco|0|2|
|b6dc0fb4-b542-5ddc-8632-b32d349ed41d|SPRINT|1|Marco Bezzecchi|M. Bezzecchi|0|0|
|5b24705b-af94-51a6-bec1-43882e250de1|SPRINT|2|Fabio Di Giannantonio|F. Di Giannantonio|0|0|
|163b45ea-4546-5381-9ee7-2e7bd4078304|SPRINT|3|Francesco Bagnaia|F. Bagnaia|0|1|

- Scoring canonico: Qualifica **0** (pole 0 + tempo 0); Sprint **1** [0, 0, 1]; Gara **11** [posizioni 9; bonus 2; malus 0; OUT 2]
- Totale storico ricostruito: **12** = 0 + 1 + 11.

### simo.salva92 / GRAND PRIX OF THE UNITED STATES

- Prediction DB: `916b868f-9dc6-54c7-b298-3422566dd325`
- Excel: `/tmp/fantamotogp-usa.xlsx`
- Righe: Q `Risposte del modulo 1!13`, Sprint `Risposte del modulo 2!13`, Gara `Risposte del modulo 3!12`
- Riferimenti: Pole `Risposte del modulo 1!C13`, tempo `Risposte del modulo 1!D13`, Sprint `Risposte del modulo 2!C13, Risposte del modulo 2!D13, Risposte del modulo 2!E13`, Gara `Risposte del modulo 3!C12, Risposte del modulo 3!D12, Risposte del modulo 3!E12, Risposte del modulo 3!F12, Risposte del modulo 3!G12, Risposte del modulo 3!H12`
- Valori Excel: pole=M. Bezzecchi; tempo=02:01.050; sprint=M. Bezzecchi / F. Di Giannantonio / P. Acosta; gara=M. Bezzecchi / F. Di Giannantonio / F. Bagnaia / J. Martin / P. Acosta; out=T. Razgatlioglu

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|d9b6719f-fe4f-5a80-8cd6-ef413d0ac487|POLE|—|Marco Bezzecchi|M. Bezzecchi|0|2|
|6306e82b-10e4-584a-987f-83a12e8f746a|QUALIFYING_TIME|—|121.05|02:01.050|0|0|
|a9d576d3-070b-590a-86cb-371b5731214d|RACE|1|Marco Bezzecchi|M. Bezzecchi|0|5|
|6a9b80b5-ad55-58fd-8683-397f4b5c09fb|RACE|2|Fabio Di Giannantonio|F. Di Giannantonio|0|1|
|ba68a1a7-b50d-5ed0-94be-e732f5f09fc3|RACE|3|Francesco Bagnaia|F. Bagnaia|0|0|
|4cb9f590-80f4-5fa7-8418-7c76713838af|RACE|4|Jorge Martin|J. Martin|0|1|
|e1437309-0c74-5779-9c77-d6d3caf2c55a|RACE|5|Pedro Acosta|P. Acosta|0|1|
|2b8c08f0-e0e3-5d48-92ba-007a7486caf9|RACE_OUT|—|Toprak Razgatlioglu|T. Razgatlioglu|0|0|
|36241da6-292b-5e3e-93a0-402eafc0ebb1|SPRINT|1|Marco Bezzecchi|M. Bezzecchi|0|0|
|ece0bb1f-5e55-52a5-9b83-d9f291f2aca4|SPRINT|2|Fabio Di Giannantonio|F. Di Giannantonio|0|0|
|36a623cd-ce12-53cd-bbfd-71a894343a99|SPRINT|3|Pedro Acosta|P. Acosta|0|0|

- Scoring canonico: Qualifica **2** (pole 2 + tempo 0); Sprint **0** [0, 0, 0]; Gara **8** [posizioni 8; bonus 0; malus 0; OUT 0]
- Totale storico ricostruito: **10** = 2 + 0 + 8.

### marty.bria1996 / GRAND PRIX OF THE UNITED STATES

- Prediction DB: `ada70f36-e9fb-5b28-a129-f0d7cc63a4f1`
- Excel: `/tmp/fantamotogp-usa.xlsx`
- Righe: Q `Risposte del modulo 1!12`, Sprint `Risposte del modulo 2!12`, Gara `Risposte del modulo 3!13`
- Riferimenti: Pole `Risposte del modulo 1!C12`, tempo `Risposte del modulo 1!D12`, Sprint `Risposte del modulo 2!C12, Risposte del modulo 2!D12, Risposte del modulo 2!E12`, Gara `Risposte del modulo 3!C13, Risposte del modulo 3!D13, Risposte del modulo 3!E13, Risposte del modulo 3!F13, Risposte del modulo 3!G13, Risposte del modulo 3!H13`
- Valori Excel: pole=M. Bezzecchi; tempo=02:00.980; sprint=F. Di Giannantonio / M. Bezzecchi / F. Bagnaia; gara=F. Bagnaia / F. Di Giannantonio / J. Martin / M. Bezzecchi / J. Mir; out=J. Zarco

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|94352477-1f94-50a4-814c-787a41dd9e14|POLE|—|Marco Bezzecchi|M. Bezzecchi|0|2|
|fcaaff68-37ec-543f-ac24-189ad2b2e38e|QUALIFYING_TIME|—|120.98|02:00.980|0|0|
|dc3dad0e-f643-531a-83b1-207039a24431|RACE|1|Francesco Bagnaia|F. Bagnaia|0|0|
|c454458a-037d-54d8-b509-2615b785adde|RACE|2|Fabio Di Giannantonio|F. Di Giannantonio|0|1|
|fbfa23df-6739-59e5-946b-1f67d342ddf5|RACE|3|Jorge Martin|J. Martin|0|3|
|a0719d5a-df2b-502c-bc4d-9c8ece422637|RACE|4|Marco Bezzecchi|M. Bezzecchi|0|1|
|f6ab3a3b-9106-591b-9955-40edd739798f|RACE|5|Joan Mir|J. Mir|0|0|
|4089862d-5399-5b9b-9a6e-6cbecb5dc9f8|RACE_OUT|—|Johann Zarco|J. Zarco|0|2|
|0d4a11a6-9988-52fc-beb4-f6c22aa711c0|SPRINT|1|Fabio Di Giannantonio|F. Di Giannantonio|0|0|
|3b1c6c00-af29-5f8c-a0f8-85f3cb9cc906|SPRINT|2|Marco Bezzecchi|M. Bezzecchi|0|0|
|ccfa7449-9893-5fc6-87e9-d3fd46b8178d|SPRINT|3|Francesco Bagnaia|F. Bagnaia|0|1|

- Scoring canonico: Qualifica **2** (pole 2 + tempo 0); Sprint **1** [0, 0, 1]; Gara **6** [posizioni 5; bonus 2; malus -1; OUT 2]
- Totale storico ricostruito: **9** = 2 + 1 + 6.

### simo.salva92 / GRAND PRIX OF SPAIN

- Prediction DB: `1eabe6fb-a2f5-589f-8dfd-a2f94635289a`
- Excel: `/tmp/fantamotogp-spagna.xlsx`
- Righe: Q `Risposte del modulo 1!3`, Sprint `Risposte del modulo 2!3`, Gara `Risposte del modulo 3!3`
- Riferimenti: Pole `Risposte del modulo 1!C3`, tempo `Risposte del modulo 1!D3`, Sprint `Risposte del modulo 2!C3, Risposte del modulo 2!D3, Risposte del modulo 2!E3`, Gara `Risposte del modulo 3!C3, Risposte del modulo 3!D3, Risposte del modulo 3!E3, Risposte del modulo 3!F3, Risposte del modulo 3!G3, Risposte del modulo 3!H3`
- Valori Excel: pole=P. Acosta; tempo=01:48.300; sprint=M. Marquez / M. Bezzecchi / F. Di Giannantonio; gara=M. Marquez / M. Bezzecchi / F. Di Giannantonio / A. Marquez / P. Acosta; out=J. Mir

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|c7ac7523-51d4-57cc-807c-4a042b4b95a3|POLE|—|Pedro Acosta|P. Acosta|0|0|
|ecdda551-8e7e-595e-9d90-c12ff89db7c2|QUALIFYING_TIME|—|108.3|01:48.300|0|3|
|e715fdb7-6560-5ae5-912a-30570c478fa8|RACE|1|Marc Marquez|M. Marquez|0|0|
|208adef1-45ee-5ecf-a9bf-41c918a3526c|RACE|2|Marco Bezzecchi|M. Bezzecchi|0|5|
|eb495ed8-99e3-5aae-982d-4aa2fb2ebe36|RACE|3|Fabio Di Giannantonio|F. Di Giannantonio|0|5|
|388a07d9-bd76-5ddc-9451-eb0592204eff|RACE|4|Alex Marquez|A. Marquez|0|1|
|4e96a07f-cae1-53b2-a0b0-1cdb7f4d6d12|RACE|5|Pedro Acosta|P. Acosta|0|0|
|7183eb40-24e3-5284-8377-057b32b2a35b|RACE_OUT|—|Joan Mir|J. Mir|0|0|
|97d344a5-a431-5ef0-9183-83cd9f38020d|SPRINT|1|Marc Marquez|M. Marquez|0|3|
|8a5e4155-8cd2-577b-9384-3bc5002cda79|SPRINT|2|Marco Bezzecchi|M. Bezzecchi|0|0|
|367c44bf-245e-58ed-a37b-eb3ecb005d08|SPRINT|3|Fabio Di Giannantonio|F. Di Giannantonio|0|0|

- Scoring canonico: Qualifica **3** (pole 0 + tempo 3); Sprint **3** [3, 0, 0]; Gara **10** [posizioni 11; bonus 0; malus -1; OUT 0]
- Totale storico ricostruito: **16** = 3 + 3 + 10.

### marty.bria1996 / GRAND PRIX OF SPAIN

- Prediction DB: `51824f4f-6501-5a8f-b013-48342a40257c`
- Excel: `/tmp/fantamotogp-spagna.xlsx`
- Righe: Q `Risposte del modulo 1!2`, Sprint `Risposte del modulo 2!2`, Gara `Risposte del modulo 3!2`
- Riferimenti: Pole `Risposte del modulo 1!C2`, tempo `Risposte del modulo 1!D2`, Sprint `Risposte del modulo 2!C2, Risposte del modulo 2!D2, Risposte del modulo 2!E2`, Gara `Risposte del modulo 3!C2, Risposte del modulo 3!D2, Risposte del modulo 3!E2, Risposte del modulo 3!F2, Risposte del modulo 3!G2, Risposte del modulo 3!H2`
- Valori Excel: pole=P. Acosta; tempo=01:47.980; sprint=M. Marquez / F. Di Giannantonio / M. Bezzecchi; gara=M. Marquez / F. Di Giannantonio / M. Bezzecchi / P. Acosta / A. Marquez; out=J. Mir

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|014749c5-ff5b-5720-9c08-99fd1505a267|POLE|—|Pedro Acosta|P. Acosta|0|0|
|a5f31ea2-a02a-5e1b-ab8f-9d9af443d606|QUALIFYING_TIME|—|107.98|01:47.980|0|5|
|614aa118-aa0f-5edc-b3cf-46cd28c90f52|RACE|1|Marc Marquez|M. Marquez|0|0|
|34a501cb-ecf2-5c2f-99af-930ee5e691e3|RACE|2|Fabio Di Giannantonio|F. Di Giannantonio|0|3|
|6e15cc6b-88d1-5102-ad3e-e9d97a747d12|RACE|3|Marco Bezzecchi|M. Bezzecchi|0|3|
|5d5932ff-d1f3-55a4-ae19-5df6bd073651|RACE|4|Pedro Acosta|P. Acosta|0|0|
|66dc9ad4-c17a-5a58-bca7-5f211d3cacca|RACE|5|Alex Marquez|A. Marquez|0|1|
|b446d483-14dd-5fa9-95b2-8b19f783d7b7|RACE_OUT|—|Joan Mir|J. Mir|0|0|
|c0b568eb-4af2-5a09-8e25-da42f786b16f|SPRINT|1|Marc Marquez|M. Marquez|0|3|
|a8a0af61-6293-5df5-84c5-3606ae9e15c4|SPRINT|2|Fabio Di Giannantonio|F. Di Giannantonio|0|0|
|58d4f88e-4fdc-5bcf-aed4-725919b073bf|SPRINT|3|Marco Bezzecchi|M. Bezzecchi|0|0|

- Scoring canonico: Qualifica **5** (pole 0 + tempo 5); Sprint **3** [3, 0, 0]; Gara **6** [posizioni 7; bonus 0; malus -1; OUT 0]
- Totale storico ricostruito: **14** = 5 + 3 + 6.

### ivan23dell / GRAND PRIX OF SPAIN

- Prediction DB: `80eff41b-c0c4-5483-9eec-e93b6b603eeb`
- Excel: `/tmp/fantamotogp-spagna.xlsx`
- Righe: Q `Risposte del modulo 1!7`, Sprint `Risposte del modulo 2!4`, Gara `Risposte del modulo 3!9`
- Riferimenti: Pole `Risposte del modulo 1!C7`, tempo `Risposte del modulo 1!D7`, Sprint `Risposte del modulo 2!C4, Risposte del modulo 2!D4, Risposte del modulo 2!E4`, Gara `Risposte del modulo 3!C9, Risposte del modulo 3!D9, Risposte del modulo 3!E9, Risposte del modulo 3!F9, Risposte del modulo 3!G9, Risposte del modulo 3!H9`
- Valori Excel: pole=M. Marquez; tempo=01:35.267; sprint=M. Marquez / M. Bezzecchi / A. Marquez; gara=M. Bezzecchi / M. Marquez / P. Acosta / A. Marquez / J. Martin; out=R. Fernandez

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|10513070-a38b-59b6-8d1d-f7cdde4bfcfe|POLE|—|Marc Marquez|M. Marquez|0|5|
|34a60e6f-bf65-5c98-982e-6d935ea1b467|QUALIFYING_TIME|—|95.267|01:35.267|0|0|
|7c127286-5461-5147-ba1a-d5813c1d4f2c|RACE|1|Marco Bezzecchi|M. Bezzecchi|0|3|
|1a6df94f-554b-512e-8f95-cd7c03eb31e2|RACE|2|Marc Marquez|M. Marquez|0|0|
|3e1a1548-5be1-594a-9eaf-10ee5d98d962|RACE|3|Pedro Acosta|P. Acosta|0|0|
|23684a8f-8473-5be4-bf62-a8883fdbc142|RACE|4|Alex Marquez|A. Marquez|0|1|
|5a9d6f33-d681-51ca-84d2-c094eb721b63|RACE|5|Jorge Martin|J. Martin|0|3|
|d05fd03d-2866-56b2-86e8-44ea633621af|RACE_OUT|—|Raul Fernandez|R. Fernandez|0|0|
|1b2e9da0-dd33-52bf-8f87-f9530b557593|SPRINT|1|Marc Marquez|M. Marquez|0|3|
|d878d1b9-b091-5984-9bf9-0b9aac34b791|SPRINT|2|Marco Bezzecchi|M. Bezzecchi|0|0|
|c1d497f8-b0bd-5a91-8945-5fc1c9d2a7eb|SPRINT|3|Alex Marquez|A. Marquez|0|0|

- Scoring canonico: Qualifica **5** (pole 5 + tempo 0); Sprint **3** [3, 0, 0]; Gara **6** [posizioni 7; bonus 0; malus -1; OUT 0]
- Totale storico ricostruito: **14** = 5 + 3 + 6.

### lucifero1966 / GRAND PRIX OF SPAIN

- Prediction DB: `e2df7316-a5aa-566e-ae95-4491ea4e70b9`
- Excel: `/tmp/fantamotogp-spagna.xlsx`
- Righe: Q `Risposte del modulo 1!9`, Sprint `Risposte del modulo 2!8`, Gara `Risposte del modulo 3!4`
- Riferimenti: Pole `Risposte del modulo 1!C9`, tempo `Risposte del modulo 1!D9`, Sprint `Risposte del modulo 2!C8, Risposte del modulo 2!D8, Risposte del modulo 2!E8`, Gara `Risposte del modulo 3!C4, Risposte del modulo 3!D4, Risposte del modulo 3!E4, Risposte del modulo 3!F4, Risposte del modulo 3!G4, Risposte del modulo 3!H4`
- Valori Excel: pole=M. Bezzecchi; tempo=01:37:159; sprint=M. Marquez / M. Bezzecchi / F. Bagnaia; gara=A. Marquez / M. Marquez / F. Bagnaia / M. Bezzecchi / F. Di Giannantonio; out=A. Ogura

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|82472de2-0722-59a2-b063-39745a879dcb|POLE|—|Marco Bezzecchi|M. Bezzecchi|0|0|
|6ecf6789-a025-5356-b74c-700ee2ab651a|QUALIFYING_TIME|—|97.159|01:37:159|0|0|
|3a76bc90-7c38-5885-8336-6a40352ef814|RACE|1|Alex Marquez|A. Marquez|0|5|
|286b0b46-5bb4-5242-9a13-2059f44f721e|RACE|2|Marc Marquez|M. Marquez|0|0|
|72755967-6ad7-543e-9b57-8a8d4e644fc5|RACE|3|Francesco Bagnaia|F. Bagnaia|0|0|
|73964511-a0d4-59ea-b62a-bac25feb53ef|RACE|4|Marco Bezzecchi|M. Bezzecchi|0|1|
|f96dc6c6-6c84-5e8b-a0e6-5a6080e09ed7|RACE|5|Fabio Di Giannantonio|F. Di Giannantonio|0|1|
|88abc5a6-f182-528f-8d10-a1b2faa99c96|RACE_OUT|—|Ai Ogura|A. Ogura|0|0|
|f9ae54e0-0a62-5ca6-aad3-121983819ca6|SPRINT|1|Marc Marquez|M. Marquez|0|3|
|b778abf3-9cc5-544f-b836-b71de4ed09f3|SPRINT|2|Marco Bezzecchi|M. Bezzecchi|0|0|
|96b334cb-abc6-59f6-b14c-142c9507dcbe|SPRINT|3|Francesco Bagnaia|F. Bagnaia|0|1|

- Scoring canonico: Qualifica **0** (pole 0 + tempo 0); Sprint **4** [3, 0, 1]; Gara **6** [posizioni 7; bonus 0; malus -1; OUT 0]
- Totale storico ricostruito: **10** = 0 + 4 + 6.

### dalla.pozza.silvia / GRAND PRIX OF SPAIN

- Prediction DB: `45921e31-65c3-51d2-abcd-1785c59d8e70`
- Excel: `/tmp/fantamotogp-spagna.xlsx`
- Righe: Q `Risposte del modulo 1!6`, Sprint `Risposte del modulo 2!12`, Gara `Risposte del modulo 3!8`
- Riferimenti: Pole `Risposte del modulo 1!C6`, tempo `Risposte del modulo 1!D6`, Sprint `Risposte del modulo 2!C12, Risposte del modulo 2!D12, Risposte del modulo 2!E12`, Gara `Risposte del modulo 3!C8, Risposte del modulo 3!D8, Risposte del modulo 3!E8, Risposte del modulo 3!F8, Risposte del modulo 3!G8, Risposte del modulo 3!H8`
- Valori Excel: pole=M. Bezzecchi; tempo=01:36.900; sprint=Marc Marquez / Francesco Bagnaia / Franco Morbidelli; gara=M. Bezzecchi / M. Marquez / F. Di Giannantonio / P. Acosta / F. Bagnaia; out=P. Espargaro

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|b08feef0-569d-51b8-aa3e-313879989d84|POLE|—|Marco Bezzecchi|M. Bezzecchi|0|0|
|cecf0ca2-eef9-5631-969b-613148ae2070|QUALIFYING_TIME|—|96.9|01:36.900|0|0|
|84299616-3d9c-5622-9af0-3c4bf77bd734|RACE|1|Marco Bezzecchi|M. Bezzecchi|0|3|
|f0205019-35c6-50c0-bace-0865ef5feda2|RACE|2|Marc Marquez|M. Marquez|0|0|
|fbc036cf-f597-5fd9-bf54-5f21dcd1be27|RACE|3|Fabio Di Giannantonio|F. Di Giannantonio|0|5|
|e99144fd-541c-5f71-9e12-745f198bc375|RACE|4|Pedro Acosta|P. Acosta|0|0|
|6efaf5cc-0c86-5044-b018-077daef7959d|RACE|5|Francesco Bagnaia|F. Bagnaia|0|0|
|aafae7cf-2393-57b4-83f8-c7cfe604187a|RACE_OUT|—|Pol Espargaro|P. Espargaro|0|0|
|7bba3758-3a3b-599c-836f-b6c430c0da15|SPRINT|1|Marc Marquez|Marc Marquez|0|0|
|1a60d6d2-6fbe-51e9-ad01-6255b2f5d31c|SPRINT|2|Francesco Bagnaia|Francesco Bagnaia|0|0|
|d6187a2f-aa67-59be-b42b-2aaacf7fc798|SPRINT|3|Franco Morbidelli|Franco Morbidelli|0|0|

- Scoring canonico: Qualifica **0** (pole 0 + tempo 0); Sprint **0** [0, 0, 0]; Gara **7** [posizioni 8; bonus 0; malus -1; OUT 0]
- Totale storico ricostruito: **7** = 0 + 0 + 7.

### marino.dilorenzo / GRAND PRIX DE FRANCE

- Prediction DB: `8ba5e5cf-560b-5e92-96ea-d5fb6d37b38f`
- Excel: `/tmp/fantamotogp-francia.xlsx`
- Righe: Q `Risposte del modulo 1!2`, Sprint `Risposte del modulo 2!2`, Gara `Risposte del modulo 3!2`
- Riferimenti: Pole `Risposte del modulo 1!C2`, tempo `Risposte del modulo 1!D2`, Sprint `Risposte del modulo 2!C2, Risposte del modulo 2!D2, Risposte del modulo 2!E2`, Gara `Risposte del modulo 3!C2, Risposte del modulo 3!D2, Risposte del modulo 3!E2, Risposte del modulo 3!F2, Risposte del modulo 3!G2, Risposte del modulo 3!H2`
- Valori Excel: pole=F. Di Giannantonio; tempo=01:29.450; sprint=M. Marquez / F. Bagnaia / F. Di Giannantonio; gara=M. Bezzecchi / J. Martin / F. Bagnaia / F. Di Giannantonio / M. Marquez; out=J. Mir

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|02f64b63-6757-519f-ae87-41b136ff43cd|POLE|—|Fabio Di Giannantonio|F. Di Giannantonio|0|0|
|5fdafeda-634e-5fa9-bb79-fff61915cef3|QUALIFYING_TIME|—|89.45|01:29.450|0|3|
|cbf2b2dd-5e6e-5683-be5f-b0ae48de221c|RACE|1|Marco Bezzecchi|M. Bezzecchi|0|3|
|c60f4c58-19f8-57cf-9d57-3426147d4013|RACE|2|Jorge Martin|J. Martin|0|3|
|10aff3e5-3c7a-5d3c-8be5-a303d5ce1e10|RACE|3|Francesco Bagnaia|F. Bagnaia|0|0|
|c5159171-b368-514e-b11c-4e0020132f55|RACE|4|Fabio Di Giannantonio|F. Di Giannantonio|0|5|
|9257912d-4761-5180-96b2-4d3dcb6b6860|RACE|5|Marc Marquez|M. Marquez|0|0|
|b899f616-3eb8-5aa5-8bc3-16fc52a571e6|RACE_OUT|—|Joan Mir|J. Mir|0|2|
|8648e4df-8204-557f-84b1-de8bb8cbefc0|SPRINT|1|Marc Marquez|M. Marquez|0|0|
|0c3c21d3-e52b-54e1-8bf0-22a0907b9818|SPRINT|2|Francesco Bagnaia|F. Bagnaia|0|3|
|86a98e80-2e98-5a6a-a350-29b6dc588796|SPRINT|3|Fabio Di Giannantonio|F. Di Giannantonio|0|0|

- Scoring canonico: Qualifica **3** (pole 0 + tempo 3); Sprint **3** [0, 3, 0]; Gara **12** [posizioni 11; bonus 2; malus -1; OUT 2]
- Totale storico ricostruito: **18** = 3 + 3 + 12.

### tommaso.strada95 / GRAND PRIX DE FRANCE

- Prediction DB: `66320ba5-f9c3-593b-8a70-ff1b0c923753`
- Excel: `/tmp/fantamotogp-francia.xlsx`
- Righe: Q `Risposte del modulo 1!3`, Sprint `Risposte del modulo 2!8`, Gara `Risposte del modulo 3!10`
- Riferimenti: Pole `Risposte del modulo 1!C3`, tempo `Risposte del modulo 1!D3`, Sprint `Risposte del modulo 2!C8, Risposte del modulo 2!D8, Risposte del modulo 2!E8`, Gara `Risposte del modulo 3!C10, Risposte del modulo 3!D10, Risposte del modulo 3!E10, Risposte del modulo 3!F10, Risposte del modulo 3!G10, Risposte del modulo 3!H10`
- Valori Excel: pole=F. Bagnaia; tempo=01:29.200; sprint=M. Marquez / M. Bezzecchi / F. Bagnaia; gara=Marc Marquez / Alex Marquez / Francesco Bagnaia / Fabio Quartararo / Fermin Aldeguer; out=Joan Mir

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|5f30770b-9d91-5db8-b2e7-7694efc043e7|POLE|—|Francesco Bagnaia|F. Bagnaia|0|5|
|d8548abd-cb82-5060-ac7f-8e0bef081e62|QUALIFYING_TIME|—|89.2|01:29.200|0|1|
|9b27dfa8-550d-5cfa-be48-0f4a9a318ba2|RACE|1|Marc Marquez|Marc Marquez|0|0|
|63c1d27a-e4d4-5f69-a8be-583bf4a04895|RACE|2|Alex Marquez|Alex Marquez|0|0|
|5ddc0e9c-ad8e-5407-9f72-954e38c83bc6|RACE|3|Francesco Bagnaia|Francesco Bagnaia|0|0|
|e994e6f9-9aab-568b-a48d-57c61796dde1|RACE|4|Fabio Quartararo|Fabio Quartararo|0|0|
|9ff78796-061f-5314-8288-f09ea5dc934c|RACE|5|Fermin Aldeguer|Fermin Aldeguer|0|0|
|e278b126-ee02-5512-8551-9bfa6a54dc5c|RACE_OUT|—|Joan Mir|Joan Mir|0|0|
|ccd3f01c-8197-5c8a-b16d-3028cc5375b7|SPRINT|1|Marc Marquez|M. Marquez|0|0|
|fcb74944-efe8-54df-a160-ca9abde7aa6f|SPRINT|2|Marco Bezzecchi|M. Bezzecchi|0|1|
|5c6603e6-83d0-5b5c-984d-629339d120e6|SPRINT|3|Francesco Bagnaia|F. Bagnaia|0|1|

- Scoring canonico: Qualifica **6** (pole 5 + tempo 1); Sprint **2** [0, 1, 1]; Gara **0** [posizioni 0; bonus 0; malus 0; OUT 0]
- Totale storico ricostruito: **8** = 6 + 2 + 0.

### alandellosbel8 / GRAND PRIX DE FRANCE

- Prediction DB: `2d169a63-1f23-5ef7-aee0-85cb39e4d5f8`
- Excel: `/tmp/fantamotogp-francia.xlsx`
- Righe: Q `Risposte del modulo 1!5`, Sprint `Risposte del modulo 2!6`, Gara `Risposte del modulo 3!5`
- Riferimenti: Pole `Risposte del modulo 1!C5`, tempo `Risposte del modulo 1!D5`, Sprint `Risposte del modulo 2!C6, Risposte del modulo 2!D6, Risposte del modulo 2!E6`, Gara `Risposte del modulo 3!C5, Risposte del modulo 3!D5, Risposte del modulo 3!E5, Risposte del modulo 3!F5, Risposte del modulo 3!G5, Risposte del modulo 3!H5`
- Valori Excel: pole=F. Di Giannantonio; tempo=01:28.231; sprint=M. Marquez / M. Bezzecchi / F. Bagnaia; gara=M. Bezzecchi / M. Marquez / F. Bagnaia / J. Martin / J. Zarco; out=J. Mir

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|4f76a27b-b830-5467-a41d-07c6a24f2b18|POLE|—|Fabio Di Giannantonio|F. Di Giannantonio|0|0|
|05f652d5-0590-5071-b0c9-92a7a784964c|QUALIFYING_TIME|—|88.231|01:28.231|0|0|
|a986d9f3-6af5-5fc1-bf12-4ffd4131883a|RACE|1|Marco Bezzecchi|M. Bezzecchi|0|3|
|3588dd5a-20f9-5747-9309-4aaf71a7e19d|RACE|2|Marc Marquez|M. Marquez|0|0|
|8d5fbfbd-a9be-5d32-aa69-28127e7c23b4|RACE|3|Francesco Bagnaia|F. Bagnaia|0|0|
|0aa4686c-7c15-5b94-b638-90a4d7126ab4|RACE|4|Jorge Martin|J. Martin|0|1|
|87af8178-e1c6-53b1-a23d-c12e8f55ab7b|RACE|5|Johann Zarco|J. Zarco|0|0|
|3c27e6b8-6c35-5e8a-adbc-8193fb516e2e|RACE_OUT|—|Joan Mir|J. Mir|0|2|
|cc44eddc-a68c-587a-a5e8-62693fe28794|SPRINT|1|Marc Marquez|M. Marquez|0|0|
|cd5d4abf-5d05-5602-a4a5-f21ee9018872|SPRINT|2|Marco Bezzecchi|M. Bezzecchi|0|1|
|6239ed5f-e637-5068-b06e-577edb398d1d|SPRINT|3|Francesco Bagnaia|F. Bagnaia|0|1|

- Scoring canonico: Qualifica **0** (pole 0 + tempo 0); Sprint **2** [0, 1, 1]; Gara **5** [posizioni 4; bonus 2; malus -1; OUT 2]
- Totale storico ricostruito: **7** = 0 + 2 + 5.

### tommaso.strada95 / GRAND PRIX OF CATALONIA

- Prediction DB: `bbc97158-67e6-5bc2-95f1-38d847ce6438`
- Excel: `/tmp/fantamotogp-catalogna.xlsx`
- Righe: Q `Risposte del modulo 1!9`, Sprint `Risposte del modulo 2!16`, Gara `Risposte del modulo 3!8`
- Riferimenti: Pole `Risposte del modulo 1!C9`, tempo `Risposte del modulo 1!D9`, Sprint `Risposte del modulo 2!C16, Risposte del modulo 2!D16, Risposte del modulo 2!E16`, Gara `Risposte del modulo 3!C8, Risposte del modulo 3!D8, Risposte del modulo 3!E8, Risposte del modulo 3!F8, Risposte del modulo 3!G8, Risposte del modulo 3!H8`
- Valori Excel: pole=A. Marquez; tempo=01:37:400; sprint=M. Bezzecchi / A. Marquez / F. Di Giannantonio; gara=Marc Marquez / Alex Marquez / Fabio Quartararo / Pedro Acosta / Johann Zarco; out=Joan Mir

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|5187aba2-e094-5b14-b44a-511c2c06d17d|POLE|—|Alex Marquez|A. Marquez|0|0|
|27baa335-cfbd-5d3b-aefb-467426624892|QUALIFYING_TIME|—|97.4|01:37:400|0|0|
|eb9e7972-9fe4-5bce-a07d-f7aa3235c256|RACE|1|Marc Marquez|Marc Marquez|0|0|
|24e6277b-5350-5adb-a79e-f495605f53ba|RACE|2|Alex Marquez|Alex Marquez|0|0|
|2adfa244-478f-50c9-ba21-069a0008074d|RACE|3|Fabio Quartararo|Fabio Quartararo|0|0|
|11edc134-1ea0-50e9-928e-482543e705d4|RACE|4|Pedro Acosta|Pedro Acosta|0|0|
|e5cedd86-b9d3-5049-9966-fd0075d77c04|RACE|5|Johann Zarco|Johann Zarco|0|0|
|8df88715-cb61-5f49-b619-aee109b73396|RACE_OUT|—|Joan Mir|Joan Mir|0|0|
|875d68ec-d208-57e2-8075-97b8d5be6377|SPRINT|1|Marco Bezzecchi|M. Bezzecchi|0|0|
|d61999ee-3c02-5b9c-978e-a253a77eade3|SPRINT|2|Alex Marquez|A. Marquez|0|1|
|e632929a-06bf-5ce5-aac7-c1287b7b680e|SPRINT|3|Fabio Di Giannantonio|F. Di Giannantonio|0|3|

- Scoring canonico: Qualifica **0** (pole 0 + tempo 0); Sprint **4** [0, 1, 3]; Gara **0** [posizioni 0; bonus 0; malus 0; OUT 0]
- Totale storico ricostruito: **4** = 0 + 4 + 0.

### dalla.pozza.silvia / GRAND PRIX OF CATALONIA

- Prediction DB: `a80d6fac-140e-532b-9e1e-e6b75afea429`
- Excel: `/tmp/fantamotogp-catalogna.xlsx`
- Righe: Q `Risposte del modulo 1!3`, Sprint `Risposte del modulo 2!13`, Gara `Risposte del modulo 3!6`
- Riferimenti: Pole `Risposte del modulo 1!C3`, tempo `Risposte del modulo 1!D3`, Sprint `Risposte del modulo 2!C13, Risposte del modulo 2!D13, Risposte del modulo 2!E13`, Gara `Risposte del modulo 3!C6, Risposte del modulo 3!D6, Risposte del modulo 3!E6, Risposte del modulo 3!F6, Risposte del modulo 3!G6, Risposte del modulo 3!H6`
- Valori Excel: pole=M. Bezzecchi; tempo=01:38.600; sprint=Marc Marquez / Marco Bezzecchi / Jorge Martin; gara=Marc Marquez / Pedro Acosta / Alex Marquez / Fabio Di Giannantonio / Fabio Quartararo; out=Francesco Bagnaia

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|47e527d0-a9bb-533b-b84d-d43b6d835854|POLE|—|Marco Bezzecchi|M. Bezzecchi|0|0|
|67f954e0-6d33-5e33-9782-c79a55171789|QUALIFYING_TIME|—|98.6|01:38.600|0|0|
|4b531234-fa4c-597f-8866-d4fc94981eb7|RACE|1|Marc Marquez|Marc Marquez|0|0|
|d0a0fe54-d453-5376-b832-316b07c4130c|RACE|2|Pedro Acosta|Pedro Acosta|0|0|
|4af61d70-fc78-51f8-9ff9-30e268248530|RACE|3|Alex Marquez|Alex Marquez|0|0|
|9c2e9a4c-2193-519f-bc67-f19784848e64|RACE|4|Fabio Di Giannantonio|Fabio Di Giannantonio|0|0|
|a142e895-5e97-55ad-a895-8a35fada38d1|RACE|5|Fabio Quartararo|Fabio Quartararo|0|0|
|7023f2e7-8d35-50d6-92f7-9af33a30e621|RACE_OUT|—|Francesco Bagnaia|Francesco Bagnaia|0|0|
|01e9b50c-94b5-5ff9-a675-4864d4209c5a|SPRINT|1|Marc Marquez|Marc Marquez|0|0|
|f5b22e2b-b6dc-5b80-a33d-fd9438f080aa|SPRINT|2|Marco Bezzecchi|Marco Bezzecchi|0|0|
|bebc8e54-b8d6-5518-b5fa-4884bb914b5c|SPRINT|3|Jorge Martin|Jorge Martin|0|0|

- Scoring canonico: Qualifica **0** (pole 0 + tempo 0); Sprint **0** [0, 0, 0]; Gara **0** [posizioni 0; bonus 0; malus 0; OUT 0]
- Totale storico ricostruito: **0** = 0 + 0 + 0.

### marino.dilorenzo / GRAND PRIX OF CATALONIA

- Prediction DB: `3c763d2d-7544-5a60-a020-b43041031190`
- Excel: `/tmp/fantamotogp-catalogna.xlsx`
- Righe: Q `Risposte del modulo 1!7`, Sprint `Risposte del modulo 2!19`, Gara `Risposte del modulo 3!9`
- Riferimenti: Pole `Risposte del modulo 1!C7`, tempo `Risposte del modulo 1!D7`, Sprint `Risposte del modulo 2!C19, Risposte del modulo 2!D19, Risposte del modulo 2!E19`, Gara `Risposte del modulo 3!C9, Risposte del modulo 3!D9, Risposte del modulo 3!E9, Risposte del modulo 3!F9, Risposte del modulo 3!G9, Risposte del modulo 3!H9`
- Valori Excel: pole=A. Marquez; tempo=01:38.150; sprint=P. Acosta / A. Marquez / R. Fernandez; gara=P. Acosta / A. Marquez / J. Martin / F. Di Giannantonio / R. Fernandez; out=J. Zarco

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|7e5734e1-8a01-55b6-9493-ee1821d59085|POLE|—|Alex Marquez|A. Marquez|0|0|
|cd0fbf1f-a596-5888-a9c3-358327d05694|QUALIFYING_TIME|—|98.15|01:38.150|0|5|
|55899c56-fb56-5b0f-b3d8-24ed3ba6a571|RACE|1|Pedro Acosta|P. Acosta|0|0|
|177a3488-53b7-5a35-9c94-41d572e2eeef|RACE|2|Alex Marquez|A. Marquez|0|0|
|c445bc85-b369-56d8-bb19-a14b53d8972b|RACE|3|Jorge Martin|J. Martin|0|0|
|b4981bbb-f550-5578-a6ee-1df1b2433bb7|RACE|4|Fabio Di Giannantonio|F. Di Giannantonio|0|1|
|5dfb9a3b-8100-501f-a188-ef1a378e99ac|RACE|5|Raul Fernandez|R. Fernandez|0|0|
|4c45fcbe-57f9-55ce-bf8e-c39b3c817a28|RACE_OUT|—|Johann Zarco|J. Zarco|0|2|
|62ea577b-56fe-54b8-9ebf-7c6d98886a93|SPRINT|1|Pedro Acosta|P. Acosta|0|1|
|188df6db-81aa-59dc-aebc-acf09cf5e91b|SPRINT|2|Alex Marquez|A. Marquez|0|1|
|34f6f96d-bb5d-5787-ba03-bf266e6ef876|SPRINT|3|Raul Fernandez|R. Fernandez|0|0|

- Scoring canonico: Qualifica **5** (pole 0 + tempo 5); Sprint **2** [1, 1, 0]; Gara **-2** [posizioni 1; bonus 2; malus -5; OUT 2]
- Totale storico ricostruito: **5** = 5 + 2 + -2.

### ivan23dell / GRAND PRIX OF CATALONIA

- Prediction DB: `508e4bf7-a0b4-5d90-a2be-b17297d9ee34`
- Excel: `/tmp/fantamotogp-catalogna.xlsx`
- Righe: Q `Risposte del modulo 1!2`, Sprint `Risposte del modulo 2!12`, Gara `Risposte del modulo 3!2`
- Riferimenti: Pole `Risposte del modulo 1!C2`, tempo `Risposte del modulo 1!D2`, Sprint `Risposte del modulo 2!C12, Risposte del modulo 2!D12, Risposte del modulo 2!E12`, Gara `Risposte del modulo 3!C2, Risposte del modulo 3!D2, Risposte del modulo 3!E2, Risposte del modulo 3!F2, Risposte del modulo 3!G2, Risposte del modulo 3!H2`
- Valori Excel: pole=M. Bezzecchi; tempo=01:38.221; sprint=P. Acosta / R. Fernandez / A. Marquez; gara=J. Martin / R. Fernandez / M. Bezzecchi / F. Di Giannantonio / F. Quartararo; out=B. Binder

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|6ac67b1d-d525-5cc9-8907-96598fe5c4eb|POLE|—|Marco Bezzecchi|M. Bezzecchi|0|0|
|f9d01b33-793b-5ba8-9d04-e8a7b0991499|QUALIFYING_TIME|—|98.221|01:38.221|0|3|
|9a4f7929-5af8-5dc7-95a0-7e777f63c01d|RACE|1|Jorge Martin|J. Martin|0|0|
|97eb1c60-3056-594d-8e9d-9074b884df04|RACE|2|Raul Fernandez|R. Fernandez|0|0|
|9fe87eff-cfb8-5032-9c00-d26eebce121f|RACE|3|Marco Bezzecchi|M. Bezzecchi|0|3|
|90504891-d19e-5fbe-a94b-e2783edbf100|RACE|4|Fabio Di Giannantonio|F. Di Giannantonio|0|1|
|ed4b2caa-b4e6-59a1-9d57-d262e00e132f|RACE|5|Fabio Quartararo|F. Quartararo|0|5|
|241fe168-b263-583b-8385-f3b2509ed569|RACE_OUT|—|Brad Binder|B. Binder|0|0|
|5b18cf5d-2dc2-5746-bc9e-87ed5bf59d6c|SPRINT|1|Pedro Acosta|P. Acosta|0|1|
|fa7dc904-c7d4-5878-a779-68f92258d9e5|SPRINT|2|Raul Fernandez|R. Fernandez|0|0|
|ebe2b334-5285-5c19-af2c-61145896fdcb|SPRINT|3|Alex Marquez|A. Marquez|0|0|

- Scoring canonico: Qualifica **3** (pole 0 + tempo 3); Sprint **1** [1, 0, 0]; Gara **8** [posizioni 9; bonus 0; malus -1; OUT 0]
- Totale storico ricostruito: **12** = 3 + 1 + 8.

### marty.bria1996 / GRAND PRIX OF CATALONIA

- Prediction DB: `7469b845-a82b-536e-8383-813076fecadc`
- Excel: `/tmp/fantamotogp-catalogna.xlsx`
- Righe: Q `Risposte del modulo 1!10`, Sprint `Risposte del modulo 2!21`, Gara `Risposte del modulo 3!10`
- Riferimenti: Pole `Risposte del modulo 1!C10`, tempo `Risposte del modulo 1!D10`, Sprint `Risposte del modulo 2!C21, Risposte del modulo 2!D21, Risposte del modulo 2!E21`, Gara `Risposte del modulo 3!C10, Risposte del modulo 3!D10, Risposte del modulo 3!E10, Risposte del modulo 3!F10, Risposte del modulo 3!G10, Risposte del modulo 3!H10`
- Valori Excel: pole=P. Acosta; tempo=01:37.589; sprint=A. Marquez / P. Acosta / F. Di Giannantonio; gara=A. Marquez / F. Di Giannantonio / J. Martin / R. Fernandez / P. Acosta; out=B. Binder

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|482be463-8311-57e7-b236-df91797c0f36|POLE|—|Pedro Acosta|P. Acosta|0|5|
|75aafef2-295c-5624-9bf0-112f6273cf8a|QUALIFYING_TIME|—|97.589|01:37.589|0|1|
|35dabf99-74fa-5ab5-b440-9348049dd148|RACE|1|Alex Marquez|A. Marquez|0|0|
|80947950-7211-5e37-bacf-b35c7818a12f|RACE|2|Fabio Di Giannantonio|F. Di Giannantonio|0|3|
|19578ef9-fa3a-58ac-90d1-550979f4f0fd|RACE|3|Jorge Martin|J. Martin|0|0|
|3c83d2ef-76d1-5959-bf24-687852121522|RACE|4|Raul Fernandez|R. Fernandez|0|0|
|5da30f88-3389-59e2-9f42-6c0d6c3142e6|RACE|5|Pedro Acosta|P. Acosta|0|0|
|5505d90a-81a6-545f-8392-fc2a0fff1416|RACE_OUT|—|Brad Binder|B. Binder|0|0|
|597e648a-88f4-5037-8dec-259cd816dbbc|SPRINT|1|Alex Marquez|A. Marquez|0|3|
|74dc17fe-24af-56f6-a9e3-7a4bc98a2568|SPRINT|2|Pedro Acosta|P. Acosta|0|3|
|d00267f6-e04b-5cac-8223-1da479f7e0d2|SPRINT|3|Fabio Di Giannantonio|F. Di Giannantonio|0|3|

- Scoring canonico: Qualifica **6** (pole 5 + tempo 1); Sprint **9** [3, 3, 3]; Gara **-2** [posizioni 3; bonus 0; malus -5; OUT 0]
- Totale storico ricostruito: **13** = 6 + 9 + -2.

### simo.salva92 / GRAND PRIX OF CATALONIA

- Prediction DB: `714a658f-8444-5349-8652-0926d97752e5`
- Excel: `/tmp/fantamotogp-catalogna.xlsx`
- Righe: Q `Risposte del modulo 1!11`, Sprint `Risposte del modulo 2!20`, Gara `Risposte del modulo 3!11`
- Riferimenti: Pole `Risposte del modulo 1!C11`, tempo `Risposte del modulo 1!D11`, Sprint `Risposte del modulo 2!C20, Risposte del modulo 2!D20, Risposte del modulo 2!E20`, Gara `Risposte del modulo 3!C11, Risposte del modulo 3!D11, Risposte del modulo 3!E11, Risposte del modulo 3!F11, Risposte del modulo 3!G11, Risposte del modulo 3!H11`
- Valori Excel: pole=A. Marquez; tempo=01:37.700; sprint=P. Acosta / A. Marquez / R. Fernandez; gara=A. Marquez / F. Di Giannantonio / J. Martin / P. Acosta / R. Fernandez; out=J. Mir

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|d2ca99a7-3b7f-5733-92d3-90ab0485ce62|POLE|—|Alex Marquez|A. Marquez|0|0|
|b8179e0e-7b4b-5eb5-a9ca-79e1a2edaf5b|QUALIFYING_TIME|—|97.7|01:37.700|0|1|
|73e6d73a-6cd3-5a72-889e-d9536de84aa3|RACE|1|Alex Marquez|A. Marquez|0|0|
|53338207-6316-52ad-aff7-648232eb0c83|RACE|2|Fabio Di Giannantonio|F. Di Giannantonio|0|3|
|9dd7082a-57ee-5190-a236-0963935f5dc5|RACE|3|Jorge Martin|J. Martin|0|0|
|8caebddc-0804-58e7-b8e6-31d8f880d874|RACE|4|Pedro Acosta|P. Acosta|0|0|
|b006c557-e8ae-5d68-b259-a71183802911|RACE|5|Raul Fernandez|R. Fernandez|0|0|
|e2e808eb-7659-58f0-b5bc-476211da6e63|RACE_OUT|—|Joan Mir|J. Mir|0|0|
|e7dcf1bd-cd77-53c6-9a90-22b1ac2a8d4a|SPRINT|1|Pedro Acosta|P. Acosta|0|1|
|2d4249b0-0bfe-5241-9eb8-c19ae92b771d|SPRINT|2|Alex Marquez|A. Marquez|0|1|
|c4ef3e17-3303-5e0d-8172-d645b195e240|SPRINT|3|Raul Fernandez|R. Fernandez|0|0|

- Scoring canonico: Qualifica **1** (pole 0 + tempo 1); Sprint **2** [1, 1, 0]; Gara **-2** [posizioni 3; bonus 0; malus -5; OUT 0]
- Totale storico ricostruito: **1** = 1 + 2 + -2.

### marty.bria1996 / GRAND PRIX OF ITALY

- Prediction DB: `41fc7021-5532-575b-9814-37ebf8f1433d`
- Excel: `/tmp/fantamotogp-italia.xlsx`
- Righe: Q `Risposte del modulo 1!3`, Sprint `Risposte del modulo 2!5`, Gara `Risposte del modulo 3!9`
- Riferimenti: Pole `Risposte del modulo 1!C3`, tempo `Risposte del modulo 1!D3`, Sprint `Risposte del modulo 2!C5, Risposte del modulo 2!D5, Risposte del modulo 2!E5`, Gara `Risposte del modulo 3!C9, Risposte del modulo 3!D9, Risposte del modulo 3!E9, Risposte del modulo 3!F9, Risposte del modulo 3!G9, Risposte del modulo 3!H9`
- Valori Excel: pole=F. Di Giannantonio; tempo=01:44:000; sprint=M. Bezzecchi / R. Fernandez / J. Martin; gara=M. Bezzecchi / J. Martin / F. Bagnaia / R. Fernandez / F. Di Giannantonio; out=M. Marquez

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|af62e815-8028-5906-8712-b7415b6345fc|POLE|—|Fabio Di Giannantonio|F. Di Giannantonio|0|0|
|10325669-8b55-5e7e-8d4a-67b8546c0c4c|QUALIFYING_TIME|—|104|01:44:000|0|5|
|8e821646-a253-57b5-ba0b-e54edd23f965|RACE|1|Marco Bezzecchi|M. Bezzecchi|0|5|
|800661db-dd7c-5bac-868a-17c8f1beedf1|RACE|2|Jorge Martin|J. Martin|0|5|
|a0d19103-5621-5c4d-a996-f48110de0e77|RACE|3|Francesco Bagnaia|F. Bagnaia|0|5|
|ea588db2-b523-58a0-9bfa-a821ba243171|RACE|4|Raul Fernandez|R. Fernandez|0|0|
|4a98da78-70ab-5308-8457-732e20bab5f6|RACE|5|Fabio Di Giannantonio|F. Di Giannantonio|0|5|
|3a10ffc3-14a4-5c26-90e4-f70944073ff5|RACE_OUT|—|Marc Marquez|M. Marquez|0|0|
|3ac56878-8641-5eda-bbb8-ba0933b1a324|SPRINT|1|Marco Bezzecchi|M. Bezzecchi|0|0|
|e6221406-c456-5594-b998-774ff5b2fa7e|SPRINT|2|Raul Fernandez|R. Fernandez|0|1|
|320330d1-77d4-5cfa-82b1-b4689c0cb2ff|SPRINT|3|Jorge Martin|J. Martin|0|1|

- Scoring canonico: Qualifica **5** (pole 0 + tempo 5); Sprint **2** [0, 1, 1]; Gara **23** [posizioni 20; bonus 3; malus 0; OUT 0]
- Totale storico ricostruito: **30** = 5 + 2 + 23.

### simo.salva92 / GRAND PRIX OF ITALY

- Prediction DB: `fd21a338-370d-53ed-9397-e2dca9e4de18`
- Excel: `/tmp/fantamotogp-italia.xlsx`
- Righe: Q `Risposte del modulo 1!2`, Sprint `Risposte del modulo 2!7`, Gara `Risposte del modulo 3!10`
- Riferimenti: Pole `Risposte del modulo 1!C2`, tempo `Risposte del modulo 1!D2`, Sprint `Risposte del modulo 2!C7, Risposte del modulo 2!D7, Risposte del modulo 2!E7`, Gara `Risposte del modulo 3!C10, Risposte del modulo 3!D10, Risposte del modulo 3!E10, Risposte del modulo 3!F10, Risposte del modulo 3!G10, Risposte del modulo 3!H10`
- Valori Excel: pole=F. Di Giannantonio; tempo=01:43.970; sprint=M. Bezzecchi / A. Marquez / R. Fernandez; gara=M. Bezzecchi / F. Di Giannantonio / J. Martin / F. Bagnaia / R. Fernandez; out=P. Acosta

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|880037ba-a408-5b65-abfe-e053fe2053a5|POLE|—|Fabio Di Giannantonio|F. Di Giannantonio|0|0|
|b33f2828-c462-5780-8dc5-d1f2b1c285ec|QUALIFYING_TIME|—|103.97|01:43.970|0|5|
|60147768-c0b7-563a-a70c-5d5be5e6ca3a|RACE|1|Marco Bezzecchi|M. Bezzecchi|0|5|
|b2733e69-b687-5c5a-85b5-a54e9099d697|RACE|2|Fabio Di Giannantonio|F. Di Giannantonio|0|1|
|f42857e9-2db5-5b7e-b991-794d02ae001c|RACE|3|Jorge Martin|J. Martin|0|3|
|1a91f43a-245e-5503-af4e-33e56f053ffa|RACE|4|Francesco Bagnaia|F. Bagnaia|0|3|
|ea782f8f-78c8-5eb5-bf87-2077dea1bf5b|RACE|5|Raul Fernandez|R. Fernandez|0|0|
|227733da-ced1-569b-84d9-3e3fa3f77c6c|RACE_OUT|—|Pedro Acosta|P. Acosta|0|0|
|3fcfc629-b3a9-596e-8572-0fd9b3b2a537|SPRINT|1|Marco Bezzecchi|M. Bezzecchi|0|0|
|22c41f1f-81f2-5ef8-90c9-8373ccbf1de3|SPRINT|2|Alex Marquez|A. Marquez|0|0|
|114ce452-6126-5726-8ac7-1e6a2146d0b4|SPRINT|3|Raul Fernandez|R. Fernandez|0|0|

- Scoring canonico: Qualifica **5** (pole 0 + tempo 5); Sprint **0** [0, 0, 0]; Gara **12** [posizioni 12; bonus 0; malus 0; OUT 0]
- Totale storico ricostruito: **17** = 5 + 0 + 12.

### ivan23dell / GRAND PRIX OF ITALY

- Prediction DB: `172c1292-20d9-5752-b3d4-4e1714399c83`
- Excel: `/tmp/fantamotogp-italia.xlsx`
- Righe: Q `Risposte del modulo 1!9`, Sprint `Risposte del modulo 2!3`, Gara `Risposte del modulo 3!2`
- Riferimenti: Pole `Risposte del modulo 1!C9`, tempo `Risposte del modulo 1!D9`, Sprint `Risposte del modulo 2!C3, Risposte del modulo 2!D3, Risposte del modulo 2!E3`, Gara `Risposte del modulo 3!C2, Risposte del modulo 3!D2, Risposte del modulo 3!E2, Risposte del modulo 3!F2, Risposte del modulo 3!G2, Risposte del modulo 3!H2`
- Valori Excel: pole=F. Di Giannantonio; tempo=01:44.473; sprint=M. Bezzecchi / J. Martin / M. Marquez; gara=J. Martin / M. Bezzecchi / R. Fernandez / M. Marquez / P. Acosta; out=F. Aldeguer

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|a5966504-45d3-5f86-bca4-d4f2a02bde23|POLE|—|Fabio Di Giannantonio|F. Di Giannantonio|0|0|
|cc347d68-7d17-570f-b0a3-2bcca3414854|QUALIFYING_TIME|—|104.473|01:44.473|0|0|
|b572d944-6aca-54ab-89fd-481865e29d5a|RACE|1|Jorge Martin|J. Martin|0|3|
|9b31837f-4673-551b-ae17-03c1a8d91015|RACE|2|Marco Bezzecchi|M. Bezzecchi|0|3|
|31596218-1c38-5b4c-bfaa-addec923c665|RACE|3|Raul Fernandez|R. Fernandez|0|0|
|99616355-c296-53b8-b271-191e049a99e5|RACE|4|Marc Marquez|M. Marquez|0|0|
|cc182a89-2b63-55d6-b3b5-e749b76bac80|RACE|5|Pedro Acosta|P. Acosta|0|0|
|aa47c1c7-0c5d-5469-8c6a-4b1842e1ef34|RACE_OUT|—|Fermin Aldeguer|F. Aldeguer|0|0|
|fc607cf9-f9a4-56b8-b8e6-5da7805f33ea|SPRINT|1|Marco Bezzecchi|M. Bezzecchi|0|0|
|2e7bc06b-4959-53e7-9e1a-ee57821ea14c|SPRINT|2|Jorge Martin|J. Martin|0|3|
|6effaa05-79a0-51d0-a2aa-704dde4add79|SPRINT|3|Marc Marquez|M. Marquez|0|0|

- Scoring canonico: Qualifica **0** (pole 0 + tempo 0); Sprint **3** [0, 3, 0]; Gara **6** [posizioni 6; bonus 0; malus 0; OUT 0]
- Totale storico ricostruito: **9** = 0 + 3 + 6.

### tommaso.strada95 / GRAND PRIX OF ITALY

- Prediction DB: `fd13442f-c8ed-52b2-b4c0-775127f03b57`
- Excel: `/tmp/fantamotogp-italia.xlsx`
- Righe: Q `Risposte del modulo 1!6`, Sprint `Risposte del modulo 2!9`, Gara `Risposte del modulo 3!8`
- Riferimenti: Pole `Risposte del modulo 1!C6`, tempo `Risposte del modulo 1!D6`, Sprint `Risposte del modulo 2!C9, Risposte del modulo 2!D9, Risposte del modulo 2!E9`, Gara `Risposte del modulo 3!C8, Risposte del modulo 3!D8, Risposte del modulo 3!E8, Risposte del modulo 3!F8, Risposte del modulo 3!G8, Risposte del modulo 3!H8`
- Valori Excel: pole=F. Bagnaia; tempo=01:44.200; sprint=F. Di Giannantonio / M. Bezzecchi / F. Bagnaia; gara=J. Martin / M. Bezzecchi / F. Di Giannantonio / R. Fernandez / M. Marquez; out=J. Mir

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|b47fb168-f561-53e3-bd4b-402a8a06e8f4|POLE|—|Francesco Bagnaia|F. Bagnaia|0|0|
|659be2dc-9650-5239-a7e5-2ff95910275a|QUALIFYING_TIME|—|104.2|01:44.200|0|1|
|303617b7-0af7-52df-a8c7-f41d64f20ecb|RACE|1|Jorge Martin|J. Martin|0|3|
|f6c5844e-ebe9-57c7-8675-6dfc46ce52b4|RACE|2|Marco Bezzecchi|M. Bezzecchi|0|3|
|a7f3b77a-c681-55b5-93d6-de5cc121a4bf|RACE|3|Fabio Di Giannantonio|F. Di Giannantonio|0|1|
|8749b6ae-6d5c-5b76-bb70-1fbbcf738f06|RACE|4|Raul Fernandez|R. Fernandez|0|0|
|369bc9a2-7172-525f-823a-16b2ab871d0b|RACE|5|Marc Marquez|M. Marquez|0|0|
|799f45bc-1aa5-51c8-9dd6-6fe7e600207e|RACE_OUT|—|Joan Mir|J. Mir|0|0|
|bb7da9dc-9901-5da3-8e17-35cad800cf88|SPRINT|1|Fabio Di Giannantonio|F. Di Giannantonio|0|0|
|56cbff34-04b3-5648-9bb7-407c1c385ca2|SPRINT|2|Marco Bezzecchi|M. Bezzecchi|0|0|
|10d8f9bb-9a9a-5182-ad6a-68917152f1f9|SPRINT|3|Francesco Bagnaia|F. Bagnaia|0|0|

- Scoring canonico: Qualifica **1** (pole 0 + tempo 1); Sprint **0** [0, 0, 0]; Gara **7** [posizioni 7; bonus 0; malus 0; OUT 0]
- Totale storico ricostruito: **8** = 1 + 0 + 7.

### marino.dilorenzo / GRAND PRIX OF HUNGARY

- Prediction DB: `0014ec76-bca0-549a-96c0-a29e19de94d1`
- Excel: `/tmp/fantamotogp-ungheria.xlsx`
- Righe: Q `Risposte del modulo 1!8`, Sprint `Risposte del modulo 2!5`, Gara `Risposte del modulo 3!4`
- Riferimenti: Pole `Risposte del modulo 1!C8`, tempo `Risposte del modulo 1!D8`, Sprint `Risposte del modulo 2!C5, Risposte del modulo 2!D5, Risposte del modulo 2!E5`, Gara `Risposte del modulo 3!C4, Risposte del modulo 3!D4, Risposte del modulo 3!E4, Risposte del modulo 3!F4, Risposte del modulo 3!G4, Risposte del modulo 3!H4`
- Valori Excel: pole=P. Acosta; tempo=01:36.380; sprint=M. Marquez / F. Di Giannantonio / P. Acosta; gara=M. Marquez / P. Acosta / F. Aldeguer / M. Bezzecchi / F. Di Giannantonio; out=D. Moreira

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|ce9d060f-0e9e-5bff-9b6d-922d32755df5|POLE|—|Pedro Acosta|P. Acosta|0|2|
|739019f5-252f-553a-aaf1-2d14042dbfd2|QUALIFYING_TIME|—|96.38|01:36.380|0|1|
|be293bda-6b3c-5d6b-b953-5ae6268802c0|RACE|1|Marc Marquez|M. Marquez|0|5|
|9f8dc5e0-ad5d-5edb-a71b-8a96f5eb45e2|RACE|2|Pedro Acosta|P. Acosta|0|5|
|710c0424-b76a-5c67-8627-a918fc72a99d|RACE|3|Fermin Aldeguer|F. Aldeguer|0|0|
|596845cd-2f36-5e26-a6c1-19b236782485|RACE|4|Marco Bezzecchi|M. Bezzecchi|0|0|
|ffad4753-49c4-5d71-a767-a8de2356d149|RACE|5|Fabio Di Giannantonio|F. Di Giannantonio|0|0|
|e1b076f9-05d9-50ce-9016-40b37d3ef820|RACE_OUT|—|Diogo Moreira|D. Moreira|0|0|
|fbc6ea67-56ae-507d-8d81-322773320dea|SPRINT|1|Marc Marquez|M. Marquez|0|3|
|47811c4e-1654-5847-a827-956e2b941920|SPRINT|2|Fabio Di Giannantonio|F. Di Giannantonio|0|0|
|b0ba678c-991b-58e1-aaa9-e8d7cf759c17|SPRINT|3|Pedro Acosta|P. Acosta|0|1|

- Scoring canonico: Qualifica **3** (pole 2 + tempo 1); Sprint **4** [3, 0, 1]; Gara **9** [posizioni 10; bonus 0; malus -1; OUT 0]
- Totale storico ricostruito: **16** = 3 + 4 + 9.

### alandellosbel8 / GRAND PRIX OF HUNGARY

- Prediction DB: `e0ec1ef5-b6a5-5eb0-af61-a4fef358a379`
- Excel: `/tmp/fantamotogp-ungheria.xlsx`
- Righe: Q `Risposte del modulo 1!11`, Sprint `Risposte del modulo 2!4`, Gara `Risposte del modulo 3!3`
- Riferimenti: Pole `Risposte del modulo 1!C11`, tempo `Risposte del modulo 1!D11`, Sprint `Risposte del modulo 2!C4, Risposte del modulo 2!D4, Risposte del modulo 2!E4`, Gara `Risposte del modulo 3!C3, Risposte del modulo 3!D3, Risposte del modulo 3!E3, Risposte del modulo 3!F3, Risposte del modulo 3!G3, Risposte del modulo 3!H3`
- Valori Excel: pole=F. Di Giannantonio; tempo=01:36.154; sprint=M. Marquez / F. Di Giannantonio / P. Acosta; gara=M. Marquez / P. Acosta / M. Bezzecchi / F. Di Giannantonio / F. Aldeguer; out=J. Mir

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|eeabbf10-19ce-52ac-bc55-6f2c97815fde|POLE|—|Fabio Di Giannantonio|F. Di Giannantonio|0|0|
|6ffd8d1e-55b3-5f96-a46e-f7660b8a769b|QUALIFYING_TIME|—|96.154|01:36.154|0|0|
|2e992f65-33b3-591b-946b-82cbeac41db1|RACE|1|Marc Marquez|M. Marquez|0|5|
|fa6a3cbf-a608-52a6-a029-ed72b174a7aa|RACE|2|Pedro Acosta|P. Acosta|0|5|
|d9746ccb-1b85-5ec0-be3d-ac7e66967c49|RACE|3|Marco Bezzecchi|M. Bezzecchi|0|0|
|74eb8ef3-5c19-5ca4-86d1-2278dea523bb|RACE|4|Fabio Di Giannantonio|F. Di Giannantonio|0|0|
|e2a4cb0a-e491-5366-843b-9ea42041c8e3|RACE|5|Fermin Aldeguer|F. Aldeguer|0|0|
|14ca5fde-dd32-533f-b5a5-fa3631b829aa|RACE_OUT|—|Joan Mir|J. Mir|0|2|
|9a0f2a30-b109-536d-a5d8-e55b31dae012|SPRINT|1|Marc Marquez|M. Marquez|0|3|
|0205ac41-482b-5bdf-a045-ccfaf748b41d|SPRINT|2|Fabio Di Giannantonio|F. Di Giannantonio|0|0|
|8bc0ec67-3717-5c06-aa0d-ef6c63ff5267|SPRINT|3|Pedro Acosta|P. Acosta|0|1|

- Scoring canonico: Qualifica **0** (pole 0 + tempo 0); Sprint **4** [3, 0, 1]; Gara **11** [posizioni 10; bonus 2; malus -1; OUT 2]
- Totale storico ricostruito: **15** = 0 + 4 + 11.

### tommaso.strada95 / GRAND PRIX OF HUNGARY

- Prediction DB: `5712b709-a7bd-59b6-90f9-755f8fa74867`
- Excel: `/tmp/fantamotogp-ungheria.xlsx`
- Righe: Q `Risposte del modulo 1!2`, Sprint `Risposte del modulo 2!9`, Gara `Risposte del modulo 3!6`
- Riferimenti: Pole `Risposte del modulo 1!C2`, tempo `Risposte del modulo 1!D2`, Sprint `Risposte del modulo 2!C9, Risposte del modulo 2!D9, Risposte del modulo 2!E9`, Gara `Risposte del modulo 3!C6, Risposte del modulo 3!D6, Risposte del modulo 3!E6, Risposte del modulo 3!F6, Risposte del modulo 3!G6, Risposte del modulo 3!H6`
- Valori Excel: pole=M. Marquez; tempo=01:36.450; sprint=M. Bezzecchi / M. Marquez / J. Martin; gara=M. Marquez / M. Bezzecchi / F. Di Giannantonio / P. Acosta / J. Martin; out=J. Mir

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|a7ab9e5e-0c71-5505-b1cb-9cb901d0e1e2|POLE|—|Marc Marquez|M. Marquez|0|5|
|d83be2b3-c574-5742-a913-00617aba5536|QUALIFYING_TIME|—|96.45|01:36.450|0|1|
|4f6d613b-81d0-5068-9511-5c7fb07889d8|RACE|1|Marc Marquez|M. Marquez|0|5|
|16216326-93f8-5afe-8a4c-61ae4fd0975f|RACE|2|Marco Bezzecchi|M. Bezzecchi|0|0|
|38a02568-3d74-522e-b053-5b21945e8ea6|RACE|3|Fabio Di Giannantonio|F. Di Giannantonio|0|0|
|acb7e14f-c239-5cb8-a4bf-2d98c3ffb86b|RACE|4|Pedro Acosta|P. Acosta|0|1|
|117647a6-1744-5cf5-a695-73aa0225a60e|RACE|5|Jorge Martin|J. Martin|0|0|
|9b15b675-e473-53bc-b19d-a34cdce57d6b|RACE_OUT|—|Joan Mir|J. Mir|0|2|
|f4ea1462-158e-5692-8289-f9555b0c091c|SPRINT|1|Marco Bezzecchi|M. Bezzecchi|0|0|
|d1a759a7-b192-55d8-9513-eb7e93c055b5|SPRINT|2|Marc Marquez|M. Marquez|0|1|
|6330d6a5-caa7-58ee-813a-34c19603311d|SPRINT|3|Jorge Martin|J. Martin|0|0|

- Scoring canonico: Qualifica **6** (pole 5 + tempo 1); Sprint **1** [0, 1, 0]; Gara **7** [posizioni 6; bonus 2; malus -1; OUT 2]
- Totale storico ricostruito: **14** = 6 + 1 + 7.

### marty.bria1996 / GRAND PRIX OF HUNGARY

- Prediction DB: `8336da4e-8667-5600-9b5d-6862dc2186c9`
- Excel: `/tmp/fantamotogp-ungheria.xlsx`
- Righe: Q `Risposte del modulo 1!9`, Sprint `Risposte del modulo 2!3`, Gara `Risposte del modulo 3!7`
- Riferimenti: Pole `Risposte del modulo 1!C9`, tempo `Risposte del modulo 1!D9`, Sprint `Risposte del modulo 2!C3, Risposte del modulo 2!D3, Risposte del modulo 2!E3`, Gara `Risposte del modulo 3!C7, Risposte del modulo 3!D7, Risposte del modulo 3!E7, Risposte del modulo 3!F7, Risposte del modulo 3!G7, Risposte del modulo 3!H7`
- Valori Excel: pole=P. Acosta; tempo=01:36.489; sprint=M. Marquez / P. Acosta / F. Di Giannantonio; gara=M. Marquez / P. Acosta / M. Bezzecchi / F. Aldeguer / R. Fernandez; out=J. Miller

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|e7061e52-554e-5e76-9a24-7fd88f4449db|POLE|—|Pedro Acosta|P. Acosta|0|2|
|411b1ebc-472f-5b9d-a35e-64c6cea93f30|QUALIFYING_TIME|—|96.489|01:36.489|0|1|
|60d9f0e3-3339-53a9-961d-f9d5601b08e0|RACE|1|Marc Marquez|M. Marquez|0|5|
|307b3cb8-def6-50ae-91d0-4ddfe7ec13ed|RACE|2|Pedro Acosta|P. Acosta|0|5|
|a63f61f1-a40a-5734-b922-d4954ff772bc|RACE|3|Marco Bezzecchi|M. Bezzecchi|0|0|
|8a158a75-4e98-5e56-97e0-0811670170f2|RACE|4|Fermin Aldeguer|F. Aldeguer|0|0|
|b2f3f352-546a-51e5-b195-9bfe28d25526|RACE|5|Raul Fernandez|R. Fernandez|0|0|
|99403457-9f30-5eb8-bea8-04c0681b527a|RACE_OUT|—|Jack Miller|J. Miller|0|0|
|7c22f3c8-1eb8-5f16-a95d-2a3477ec1e54|SPRINT|1|Marc Marquez|M. Marquez|0|3|
|ee06b5e9-d82b-504d-896a-981ae8f3d6bf|SPRINT|2|Pedro Acosta|P. Acosta|0|3|
|620418d9-c2db-5a62-8990-bdcd2f530825|SPRINT|3|Fabio Di Giannantonio|F. Di Giannantonio|0|0|

- Scoring canonico: Qualifica **3** (pole 2 + tempo 1); Sprint **6** [3, 3, 0]; Gara **5** [posizioni 10; bonus 0; malus -5; OUT 0]
- Totale storico ricostruito: **14** = 3 + 6 + 5.

### simo.salva92 / GRAND PRIX OF HUNGARY

- Prediction DB: `48e6098f-7fc2-5054-bc44-3af0f5e61097`
- Excel: `/tmp/fantamotogp-ungheria.xlsx`
- Righe: Q `Risposte del modulo 1!6`, Sprint `Risposte del modulo 2!6`, Gara `Risposte del modulo 3!9`
- Riferimenti: Pole `Risposte del modulo 1!C6`, tempo `Risposte del modulo 1!D6`, Sprint `Risposte del modulo 2!C6, Risposte del modulo 2!D6, Risposte del modulo 2!E6`, Gara `Risposte del modulo 3!C9, Risposte del modulo 3!D9, Risposte del modulo 3!E9, Risposte del modulo 3!F9, Risposte del modulo 3!G9, Risposte del modulo 3!H9`
- Valori Excel: pole=P. Acosta; tempo=01:36.640; sprint=M. Marquez / F. Di Giannantonio / P. Acosta; gara=M. Marquez / M. Bezzecchi / P. Acosta / J. Martin / F. Aldeguer; out=B. Binder

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|13cd298c-92db-5620-a2e9-ccadfb925dec|POLE|—|Pedro Acosta|P. Acosta|0|2|
|8322a571-4904-56e0-b48e-c0a2ab6e0600|QUALIFYING_TIME|—|96.64|01:36.640|0|3|
|035021f0-7cd5-53eb-9841-15097c92765c|RACE|1|Marc Marquez|M. Marquez|0|5|
|4027e60b-724d-5d52-9ce0-bc56e9767641|RACE|2|Marco Bezzecchi|M. Bezzecchi|0|0|
|2702ff09-2272-5040-94f5-4f06c271e81d|RACE|3|Pedro Acosta|P. Acosta|0|3|
|f114c34a-16c6-5b29-bcc2-1341be6aee57|RACE|4|Jorge Martin|J. Martin|0|0|
|3f0bcbc4-e70b-59f0-bdbc-ca2d80a42ce3|RACE|5|Fermin Aldeguer|F. Aldeguer|0|0|
|8bc527a9-9056-529e-9a6e-fea5a4eda3dd|RACE_OUT|—|Brad Binder|B. Binder|0|0|
|8d28385f-c16e-555d-8cc6-67600656e637|SPRINT|1|Marc Marquez|M. Marquez|0|3|
|ad8816b2-4029-5a6e-a332-75d4e9f86a5d|SPRINT|2|Fabio Di Giannantonio|F. Di Giannantonio|0|0|
|9e91213c-d83d-5afb-987b-a75b85965a58|SPRINT|3|Pedro Acosta|P. Acosta|0|1|

- Scoring canonico: Qualifica **5** (pole 2 + tempo 3); Sprint **4** [3, 0, 1]; Gara **3** [posizioni 8; bonus 0; malus -5; OUT 0]
- Totale storico ricostruito: **12** = 5 + 4 + 3.

### ivan23dell / GRAND PRIX OF HUNGARY

- Prediction DB: `17096295-2e54-5f4e-a6b8-1a88d3294407`
- Excel: `/tmp/fantamotogp-ungheria.xlsx`
- Righe: Q `Risposte del modulo 1!3`, Sprint `Risposte del modulo 2!12`, Gara `Risposte del modulo 3!11`
- Riferimenti: Pole `Risposte del modulo 1!C3`, tempo `Risposte del modulo 1!D3`, Sprint `Risposte del modulo 2!C12, Risposte del modulo 2!D12, Risposte del modulo 2!E12`, Gara `Risposte del modulo 3!C11, Risposte del modulo 3!D11, Risposte del modulo 3!E11, Risposte del modulo 3!F11, Risposte del modulo 3!G11, Risposte del modulo 3!H11`
- Valori Excel: pole=F. Di Giannantonio; tempo=01:36.837; sprint=M. Bezzecchi / J. Martin / F. Di Giannantonio; gara=M. Bezzecchi / J. Martin / P. Acosta / F. Aldeguer / R. Fernandez; out=M. Marquez

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|618ac797-ec07-5051-884f-3f042d775ab4|POLE|—|Fabio Di Giannantonio|F. Di Giannantonio|0|0|
|f01b3a6a-28b2-5e86-b50c-4ea06745a970|QUALIFYING_TIME|—|96.837|01:36.837|0|5|
|09e52d7f-b577-5517-bb55-11e12bfafd11|RACE|1|Marco Bezzecchi|M. Bezzecchi|0|0|
|ba518057-e543-5e66-9434-55d0cd56aaff|RACE|2|Jorge Martin|J. Martin|0|0|
|8f707527-78c8-5299-87fa-698f1392d29a|RACE|3|Pedro Acosta|P. Acosta|0|3|
|d12f0015-874a-5e77-adc7-1af6768e297e|RACE|4|Fermin Aldeguer|F. Aldeguer|0|0|
|537e0ada-18a8-599c-93e2-7152d593b368|RACE|5|Raul Fernandez|R. Fernandez|0|0|
|dfe13a07-ef86-55f9-ad85-d106166625fd|RACE_OUT|—|Marc Marquez|M. Marquez|0|0|
|38f4d287-5eba-51ef-823c-9926719c55f1|SPRINT|1|Marco Bezzecchi|M. Bezzecchi|0|0|
|5e714439-1b17-5ddf-963a-deccd22eafd6|SPRINT|2|Jorge Martin|J. Martin|0|0|
|7b29f786-0704-57f0-beb1-ebb76d993b5a|SPRINT|3|Fabio Di Giannantonio|F. Di Giannantonio|0|0|

- Scoring canonico: Qualifica **5** (pole 0 + tempo 5); Sprint **0** [0, 0, 0]; Gara **-2** [posizioni 3; bonus 0; malus -5; OUT 0]
- Totale storico ricostruito: **3** = 5 + 0 + -2.

### lucifero1966 / GRAND PRIX OF CZECHIA

- Prediction DB: `425a1555-a95f-59ff-8692-9b2a2a2c79e2`
- Excel: `/tmp/fantamotogp-repubblica-ceca.xlsx`
- Righe: Q `Risposte del modulo 1!8`, Sprint `Risposte del modulo 2!9`, Gara `Risposte del modulo 3!8`
- Riferimenti: Pole `Risposte del modulo 1!C8`, tempo `Risposte del modulo 1!D8`, Sprint `Risposte del modulo 2!C9, Risposte del modulo 2!D9, Risposte del modulo 2!E9`, Gara `Risposte del modulo 3!C8, Risposte del modulo 3!D8, Risposte del modulo 3!E8, Risposte del modulo 3!F8, Risposte del modulo 3!G8, Risposte del modulo 3!H8`
- Valori Excel: pole=M. Bezzecchi; tempo=01:51:353; sprint=M. Bezzecchi / F. Bagnaia / M. Marquez; gara=F. Bagnaia / M. Marquez / A. Ogura / F. Di Giannantonio / R. Fernandez; out=J. Mir

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|54b0acb5-2dca-5e22-9509-bdd2780a8a25|POLE|—|Marco Bezzecchi|M. Bezzecchi|0|0|
|93805521-819f-56ac-bf1d-86b765074196|QUALIFYING_TIME|—|111.353|01:51:353|0|3|
|a2808e03-aab2-58d9-8872-d3178a1d1894|RACE|1|Francesco Bagnaia|F. Bagnaia|0|1|
|7c508974-68f8-5ef5-82a1-7d231fbc675a|RACE|2|Marc Marquez|M. Marquez|0|3|
|ebab9bdd-9ce8-5763-a014-2d8e7c59832a|RACE|3|Ai Ogura|A. Ogura|0|3|
|bf69d3d1-c1a7-5dab-90c2-ee302f0a3b17|RACE|4|Fabio Di Giannantonio|F. Di Giannantonio|0|5|
|ca528aa0-e550-50ae-8afe-825eea578ce4|RACE|5|Raul Fernandez|R. Fernandez|0|0|
|f7f22193-8a8c-525a-ac20-8946545067ab|RACE_OUT|—|Joan Mir|J. Mir|0|0|
|e962913b-58ee-50d1-b80c-1f7740f0222c|SPRINT|1|Marco Bezzecchi|M. Bezzecchi|0|0|
|04cf0c48-b553-5eea-8a5c-71fb096f2050|SPRINT|2|Francesco Bagnaia|F. Bagnaia|0|1|
|a69e0d6a-e8ae-5aa1-ba15-e11a9711b9d2|SPRINT|3|Marc Marquez|M. Marquez|0|3|

- Scoring canonico: Qualifica **3** (pole 0 + tempo 3); Sprint **4** [0, 1, 3]; Gara **12** [posizioni 12; bonus 0; malus 0; OUT 0]
- Totale storico ricostruito: **19** = 3 + 4 + 12.

### ivan23dell / GRAND PRIX OF CZECHIA

- Prediction DB: `53c8ee16-dd4d-5d27-a426-5c298fa39c12`
- Excel: `/tmp/fantamotogp-repubblica-ceca.xlsx`
- Righe: Q `Risposte del modulo 1!4`, Sprint `Risposte del modulo 2!3`, Gara `Risposte del modulo 3!2`
- Riferimenti: Pole `Risposte del modulo 1!C4`, tempo `Risposte del modulo 1!D4`, Sprint `Risposte del modulo 2!C3, Risposte del modulo 2!D3, Risposte del modulo 2!E3`, Gara `Risposte del modulo 3!C2, Risposte del modulo 3!D2, Risposte del modulo 3!E2, Risposte del modulo 3!F2, Risposte del modulo 3!G2, Risposte del modulo 3!H2`
- Valori Excel: pole=M. Bezzecchi; tempo=01:51:134; sprint=M. Bezzecchi / F. Di Giannantonio / M. Marquez; gara=M. Bezzecchi / J. Martin / P. Acosta / M. Marquez / A. Ogura; out=F. Aldeguer

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|ebff41d2-e68f-549c-85a8-9c3506b5b0c6|POLE|—|Marco Bezzecchi|M. Bezzecchi|0|0|
|6eb64b4c-b934-58ad-80ef-da6a92fc3a55|QUALIFYING_TIME|—|111.134|01:51:134|0|10|
|44df00d2-c2d0-5fb1-abc3-254c360d3995|RACE|1|Marco Bezzecchi|M. Bezzecchi|0|0|
|23e74708-705f-5f15-b113-e3c5893feef9|RACE|2|Jorge Martin|J. Martin|0|0|
|fe6800d1-0960-5879-a917-63b213cbbcf7|RACE|3|Pedro Acosta|P. Acosta|0|0|
|2e3abe5c-b40f-5c73-84e2-c70a3bcefb3b|RACE|4|Marc Marquez|M. Marquez|0|1|
|302e8ce7-6dca-56fb-97d9-66c87ed458ad|RACE|5|Ai Ogura|A. Ogura|0|1|
|f3a43afa-d690-5c97-b2c0-5f67f6d94abe|RACE_OUT|—|Fermin Aldeguer|F. Aldeguer|0|0|
|6cf8b5b8-8a33-56ad-aa13-1702031bdd87|SPRINT|1|Marco Bezzecchi|M. Bezzecchi|0|0|
|5ea0d55b-4b9d-5edf-b877-344f2cfaa2d1|SPRINT|2|Fabio Di Giannantonio|F. Di Giannantonio|0|0|
|b3a7f0e5-ecfb-530d-af82-cd0f5aa22cf7|SPRINT|3|Marc Marquez|M. Marquez|0|3|

- Scoring canonico: Qualifica **10** (pole 0 + tempo 10); Sprint **3** [0, 0, 3]; Gara **1** [posizioni 2; bonus 0; malus -1; OUT 0]
- Totale storico ricostruito: **14** = 10 + 3 + 1.

### marty.bria1996 / GRAND PRIX OF CZECHIA

- Prediction DB: `f14b1914-2be9-5500-ba2d-caeef9e08740`
- Excel: `/tmp/fantamotogp-repubblica-ceca.xlsx`
- Righe: Q `Risposte del modulo 1!11`, Sprint `Risposte del modulo 2!11`, Gara `Risposte del modulo 3!10`
- Riferimenti: Pole `Risposte del modulo 1!C11`, tempo `Risposte del modulo 1!D11`, Sprint `Risposte del modulo 2!C11, Risposte del modulo 2!D11, Risposte del modulo 2!E11`, Gara `Risposte del modulo 3!C10, Risposte del modulo 3!D10, Risposte del modulo 3!E10, Risposte del modulo 3!F10, Risposte del modulo 3!G10, Risposte del modulo 3!H10`
- Valori Excel: pole=M. Bezzecchi; tempo=01:51.689; sprint=M. Bezzecchi / F. Di Giannantonio / A. Ogura; gara=F. Bagnaia / M. Marquez / A. Ogura / F. Di Giannantonio / R. Fernandez; out=P. Acosta

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|24cbd4fb-7597-5a51-a6ec-54c74b3c5bae|POLE|—|Marco Bezzecchi|M. Bezzecchi|0|0|
|47d9a0d8-dec1-5f40-b273-c956066ad935|QUALIFYING_TIME|—|111.689|01:51.689|0|1|
|70cb0bf1-e9ee-5775-98b8-c72d2cfc92d9|RACE|1|Francesco Bagnaia|F. Bagnaia|0|1|
|0199a3b5-6c69-5adc-82c6-f4286cf07e9f|RACE|2|Marc Marquez|M. Marquez|0|3|
|1ff268cd-4c16-51a3-9ddc-c35339c21b9a|RACE|3|Ai Ogura|A. Ogura|0|3|
|9a59fcb8-2fcd-54ce-8dc1-9254ede51acb|RACE|4|Fabio Di Giannantonio|F. Di Giannantonio|0|5|
|5bc4dc7d-9170-5743-9be1-35fc3188d830|RACE|5|Raul Fernandez|R. Fernandez|0|0|
|b4dee285-4371-5e31-9346-331a85c37c44|RACE_OUT|—|Pedro Acosta|P. Acosta|0|2|
|82657b10-6361-594b-a38a-ecb86b7dde3f|SPRINT|1|Marco Bezzecchi|M. Bezzecchi|0|0|
|2cfa0981-18aa-501b-aeef-57d09da8a068|SPRINT|2|Fabio Di Giannantonio|F. Di Giannantonio|0|0|
|0a1d8cc8-4bfe-5222-818b-eff53c88b96d|SPRINT|3|Ai Ogura|A. Ogura|0|1|

- Scoring canonico: Qualifica **1** (pole 0 + tempo 1); Sprint **1** [0, 0, 1]; Gara **14** [posizioni 12; bonus 2; malus 0; OUT 2]
- Totale storico ricostruito: **16** = 1 + 1 + 14.

### simo.salva92 / GRAND PRIX OF CZECHIA

- Prediction DB: `62e85bd7-3494-5be1-8a42-6dfd6a7ddc22`
- Excel: `/tmp/fantamotogp-repubblica-ceca.xlsx`
- Righe: Q `Risposte del modulo 1!10`, Sprint `Risposte del modulo 2!10`, Gara `Risposte del modulo 3!9`
- Riferimenti: Pole `Risposte del modulo 1!C10`, tempo `Risposte del modulo 1!D10`, Sprint `Risposte del modulo 2!C10, Risposte del modulo 2!D10, Risposte del modulo 2!E10`, Gara `Risposte del modulo 3!C9, Risposte del modulo 3!D9, Risposte del modulo 3!E9, Risposte del modulo 3!F9, Risposte del modulo 3!G9, Risposte del modulo 3!H9`
- Valori Excel: pole=M. Bezzecchi; tempo=01:51.640; sprint=F. Bagnaia / F. Di Giannantonio / A. Ogura; gara=F. Bagnaia / M. Marquez / A. Ogura / F. Di Giannantonio / D. Moreira; out=M. Viñales

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|3585c6ce-f715-5426-b161-f00c69224518|POLE|—|Marco Bezzecchi|M. Bezzecchi|0|0|
|4d26e356-9457-55d3-a6bb-b873a66678a7|QUALIFYING_TIME|—|111.64|01:51.640|0|1|
|4c8047d3-5026-5004-9bfc-7962658d0c26|RACE|1|Francesco Bagnaia|F. Bagnaia|0|1|
|aa57810f-c5d7-5c91-ba1b-607b4b44f06b|RACE|2|Marc Marquez|M. Marquez|0|3|
|cea16521-5132-5e6b-966e-e032380505a1|RACE|3|Ai Ogura|A. Ogura|0|3|
|76de5002-2f4e-566a-a10e-a9e3fa462998|RACE|4|Fabio Di Giannantonio|F. Di Giannantonio|0|5|
|5f7281c9-8b75-579c-94d1-76c7cc836e3e|RACE|5|Diogo Moreira|D. Moreira|0|0|
|b4f81994-1ebd-5840-ae4c-8780024d1f2f|RACE_OUT|—|Maverick Viñales|M. Viñales|0|0|
|805c99a5-e064-5930-8c98-7f6aeeae1a56|SPRINT|1|Francesco Bagnaia|F. Bagnaia|0|3|
|a8969e42-20cc-5856-89dc-b2be4931a69b|SPRINT|2|Fabio Di Giannantonio|F. Di Giannantonio|0|0|
|80275a40-ffbe-5302-9776-ee8869867a4b|SPRINT|3|Ai Ogura|A. Ogura|0|1|

- Scoring canonico: Qualifica **1** (pole 0 + tempo 1); Sprint **4** [3, 0, 1]; Gara **12** [posizioni 12; bonus 0; malus 0; OUT 0]
- Totale storico ricostruito: **17** = 1 + 4 + 12.

### marino.dilorenzo / GRAND PRIX OF THE NETHERLANDS

- Prediction DB: `4098ed9c-8810-5fdc-872a-56f87991891d`
- Excel: `/tmp/fantamotogp-netherlands.xlsx`
- Righe: Q `Risposte del modulo 1!8`, Sprint `Risposte del modulo 2!9`, Gara `Risposte del modulo 3!10`
- Riferimenti: Pole `Risposte del modulo 1!C8`, tempo `Risposte del modulo 1!D8`, Sprint `Risposte del modulo 2!C9, Risposte del modulo 2!D9, Risposte del modulo 2!E9`, Gara `Risposte del modulo 3!C10, Risposte del modulo 3!D10, Risposte del modulo 3!E10, Risposte del modulo 3!F10, Risposte del modulo 3!G10, Risposte del modulo 3!H10`
- Valori Excel: pole=M. Bezzecchi; tempo=01:30.580; sprint=M. Bezzecchi / R. Fernandez / J. Martin; gara=M. Bezzecchi / A. Ogura / R. Fernandez / J. Martin / F. Di Giannantonio; out=E. Bastianini

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|369f18ff-3bea-5f1a-810d-68b5943e0db6|POLE|—|Marco Bezzecchi|M. Bezzecchi|0|0|
|68dd9eab-ad6c-53fa-a878-50c059c64bbc|QUALIFYING_TIME|—|90.58|01:30.580|0|1|
|7a365ebd-806f-59f8-bc17-92d74c44c99c|RACE|1|Marco Bezzecchi|M. Bezzecchi|0|0|
|2e7c627b-5ade-517f-b433-dfe6aee4b43b|RACE|2|Ai Ogura|A. Ogura|0|3|
|913cc921-a5fe-5585-b7eb-b15c2034c71e|RACE|3|Raul Fernandez|R. Fernandez|0|3|
|b8236d11-3c99-5294-a1c7-3f93a0a7f08c|RACE|4|Jorge Martin|J. Martin|0|3|
|fb4916b6-cebe-53cb-92ee-e00d3b02b62f|RACE|5|Fabio Di Giannantonio|F. Di Giannantonio|0|3|
|c07188af-1110-52f7-be91-303cde3fa74c|RACE_OUT|—|Enea Bastianini|E. Bastianini|0|0|
|adf18b0e-52cf-590d-b731-afad97b6f30c|SPRINT|1|Marco Bezzecchi|M. Bezzecchi|0|0|
|846496f6-9f6c-5cdb-8c05-f69186f49189|SPRINT|2|Raul Fernandez|R. Fernandez|0|1|
|97650548-73fa-5ecb-8025-300565c9cf29|SPRINT|3|Jorge Martin|J. Martin|0|0|

- Scoring canonico: Qualifica **1** (pole 0 + tempo 1); Sprint **1** [0, 1, 0]; Gara **11** [posizioni 12; bonus 0; malus -1; OUT 0]
- Totale storico ricostruito: **13** = 1 + 1 + 11.

### simo.salva92 / GRAND PRIX OF BRAZIL

- Prediction DB: `8db2ad27-5bb1-5162-b627-0fc84ec25aad`
- Excel: `/tmp/fantamotogp-brasile.xlsx`
- Righe: Q `Risposte del modulo 1!8`, Sprint `Risposte del modulo 2!7`, Gara `Risposte del modulo 3!8`
- Riferimenti: Pole `Risposte del modulo 1!C8`, tempo `Risposte del modulo 1!D8`, Sprint `Risposte del modulo 2!C7, Risposte del modulo 2!D7, Risposte del modulo 2!E7`, Gara `Risposte del modulo 3!C8, Risposte del modulo 3!D8, Risposte del modulo 3!E8, Risposte del modulo 3!F8, Risposte del modulo 3!G8, Risposte del modulo 3!H8`
- Valori Excel: pole=F. Bagnaia; tempo=01:17.920; sprint=A. Marquez / M. Bezzecchi / F. Di Giannantonio; gara=M. Marquez / F. Di Giannantonio / J. Martin / M. Bezzecchi / A. Ogura; out=J. Mir

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|4b83b1f4-3c83-5052-94ef-bf07304b432c|POLE|—|Francesco Bagnaia|F. Bagnaia|0|0|
|dd7d089c-d77c-59ef-9c29-85f62d7c3f58|QUALIFYING_TIME|—|77.92|01:17.920|0|0|
|bb20f4e5-eb56-5456-9cc6-802f1145b268|RACE|1|Marc Marquez|M. Marquez|0|1|
|66f651b7-a930-55d9-9711-f9bab1e9263b|RACE|2|Fabio Di Giannantonio|F. Di Giannantonio|0|3|
|ebfb4044-e01b-58b5-a57f-620fb8fcd073|RACE|3|Jorge Martin|J. Martin|0|3|
|7feedb0d-f8cb-5844-bfd7-420885d78e43|RACE|4|Marco Bezzecchi|M. Bezzecchi|0|1|
|35e9c683-00e5-5ce2-abce-5ec9d7d7de6e|RACE|5|Ai Ogura|A. Ogura|0|5|
|af1da6e8-4898-5cb1-856a-03ca1f396069|RACE_OUT|—|Joan Mir|J. Mir|0|2|
|c77ccfd4-30c9-5847-a550-4cef1335dde2|SPRINT|1|Alex Marquez|A. Marquez|0|0|
|57911259-210c-5131-8805-22955676d64c|SPRINT|2|Marco Bezzecchi|M. Bezzecchi|0|0|
|4cebb4a6-db62-5dd5-9f18-2b04a69912c0|SPRINT|3|Fabio Di Giannantonio|F. Di Giannantonio|0|1|

- Scoring canonico: Qualifica **0** (pole 0 + tempo 0); Sprint **1** [0, 0, 1]; Gara **17** [posizioni 13; bonus 4; malus 0; OUT 2]
- Totale storico ricostruito: **18** = 0 + 1 + 17.

### ivan23dell / GRAND PRIX DE FRANCE

- Prediction DB: `fa025129-9fb7-57d6-a42c-a8db79a8b260`
- Excel: `/tmp/fantamotogp-francia.xlsx`
- Righe: Q `Risposte del modulo 1!4`, Sprint `Risposte del modulo 2!7`, Gara `Risposte del modulo 3!6`
- Riferimenti: Pole `Risposte del modulo 1!C4`, tempo `Risposte del modulo 1!D4`, Sprint `Risposte del modulo 2!C7, Risposte del modulo 2!D7, Risposte del modulo 2!E7`, Gara `Risposte del modulo 3!C6, Risposte del modulo 3!D6, Risposte del modulo 3!E6, Risposte del modulo 3!F6, Risposte del modulo 3!G6, Risposte del modulo 3!H6`
- Valori Excel: pole=F. Di Giannantonio; tempo=01:29.526; sprint=M. Marquez / M. Bezzecchi / F. Bagnaia; gara=M. Bezzecchi / J. Martin / P. Acosta / A. Marquez / F. Bagnaia; out=F. Di Giannantonio

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|8aa3020c-7e9e-5911-a2de-7065f8667368|POLE|—|Fabio Di Giannantonio|F. Di Giannantonio|0|0|
|e66deafd-5ee2-5426-b426-46d0a4faed49|QUALIFYING_TIME|—|89.526|01:29.526|0|3|
|bf227943-470d-58fd-be98-f6e826f52712|RACE|1|Marco Bezzecchi|M. Bezzecchi|0|3|
|009553c9-efd6-5fdf-9b89-ff3cd868fe1b|RACE|2|Jorge Martin|J. Martin|0|3|
|1828a281-73c9-529d-8df6-f53ca82d5731|RACE|3|Pedro Acosta|P. Acosta|0|1|
|da9e4334-59f4-5701-8cb7-2411dfdcb264|RACE|4|Alex Marquez|A. Marquez|0|0|
|3d169752-a576-5f65-8c06-54eee8df162f|RACE|5|Francesco Bagnaia|F. Bagnaia|0|0|
|767b27a4-533e-570c-8bee-993a6c56c1c3|RACE_OUT|—|Fabio Di Giannantonio|F. Di Giannantonio|0|0|
|ecab6127-67e2-5c46-96f9-f836c9077da3|SPRINT|1|Marc Marquez|M. Marquez|0|0|
|1e8f4091-3fb8-58a5-b99c-0bec5ce2a82d|SPRINT|2|Marco Bezzecchi|M. Bezzecchi|0|1|
|0b7d7082-cc49-5db8-ac72-2962dafc624f|SPRINT|3|Francesco Bagnaia|F. Bagnaia|0|1|

- Scoring canonico: Qualifica **3** (pole 0 + tempo 3); Sprint **2** [0, 1, 1]; Gara **6** [posizioni 7; bonus 0; malus -1; OUT 0]
- Totale storico ricostruito: **11** = 3 + 2 + 6.

### marino.dilorenzo / GRAND PRIX OF CZECHIA

- Prediction DB: `f8ef9830-5b7e-5268-bbd0-c2d43c6101e5`
- Excel: `/tmp/fantamotogp-repubblica-ceca.xlsx`
- Righe: Q `Risposte del modulo 1!7`, Sprint `Risposte del modulo 2!7`, Gara `Risposte del modulo 3!7`
- Riferimenti: Pole `Risposte del modulo 1!C7`, tempo `Risposte del modulo 1!D7`, Sprint `Risposte del modulo 2!C7, Risposte del modulo 2!D7, Risposte del modulo 2!E7`, Gara `Risposte del modulo 3!C7, Risposte del modulo 3!D7, Risposte del modulo 3!E7, Risposte del modulo 3!F7, Risposte del modulo 3!G7, Risposte del modulo 3!H7`
- Valori Excel: pole=M. Bezzecchi; tempo=01:51.100; sprint=A. Ogura / F. Di Giannantonio / M. Marquez; gara=A. Ogura / F. Bagnaia / F. Di Giannantonio / M. Marquez / P. Acosta; out=J. Mir

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|78b0bc69-d2c2-563e-875c-470890629249|POLE|—|Marco Bezzecchi|M. Bezzecchi|0|0|
|430efcd0-0126-540f-b52f-7427be6719e4|QUALIFYING_TIME|—|111.1|01:51.100|0|5|
|61e9accc-1842-54d9-a375-3e78d006f3b1|RACE|1|Ai Ogura|A. Ogura|0|3|
|f554acca-7624-5642-825f-beb09d4684d3|RACE|2|Francesco Bagnaia|F. Bagnaia|0|3|
|0a8998e5-93ab-5362-8b35-0367271ca364|RACE|3|Fabio Di Giannantonio|F. Di Giannantonio|0|3|
|7ce6bab6-9203-5827-b6e0-ab54ba744d8c|RACE|4|Marc Marquez|M. Marquez|0|1|
|7dac5bf2-61c0-57a2-925e-a6b87cb8ba97|RACE|5|Pedro Acosta|P. Acosta|0|0|
|a1952baf-f020-51d1-a609-74f82aad3439|RACE_OUT|—|Joan Mir|J. Mir|0|0|
|f9bf639a-9781-53a1-af73-f9ca1d8e4a8b|SPRINT|1|Ai Ogura|A. Ogura|0|1|
|b728245d-933d-5d19-b1f9-e306703538a1|SPRINT|2|Fabio Di Giannantonio|F. Di Giannantonio|0|0|
|e9a02289-c8f6-5195-97eb-ac68c173096d|SPRINT|3|Marc Marquez|M. Marquez|0|3|

- Scoring canonico: Qualifica **5** (pole 0 + tempo 5); Sprint **4** [1, 0, 3]; Gara **9** [posizioni 10; bonus 0; malus -1; OUT 0]
- Totale storico ricostruito: **18** = 5 + 4 + 9.

### simo.salva92 / GRAND PRIX OF THE NETHERLANDS

- Prediction DB: `24f6473a-1e64-5faf-94f7-a931e8d043b1`
- Excel: `/tmp/fantamotogp-netherlands.xlsx`
- Righe: Q `Risposte del modulo 1!12`, Sprint `Risposte del modulo 2!12`, Gara `Risposte del modulo 3!11`
- Riferimenti: Pole `Risposte del modulo 1!C12`, tempo `Risposte del modulo 1!D12`, Sprint `Risposte del modulo 2!C12, Risposte del modulo 2!D12, Risposte del modulo 2!E12`, Gara `Risposte del modulo 3!C11, Risposte del modulo 3!D11, Risposte del modulo 3!E11, Risposte del modulo 3!F11, Risposte del modulo 3!G11, Risposte del modulo 3!H11`
- Valori Excel: pole=M. Bezzecchi; tempo=01:30.945; sprint=M. Bezzecchi / J. Martin / F. Bagnaia; gara=M. Bezzecchi / A. Ogura / R. Fernandez / F. Bagnaia / J. Martin; out=J. Mir

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|06faa1c1-1449-5970-b063-5efdb968ec75|POLE|—|Marco Bezzecchi|M. Bezzecchi|0|0|
|121f04a0-f4aa-5c2b-af2d-9887554fd639|QUALIFYING_TIME|—|90.945|01:30.945|0|3|
|8e44dd44-d907-59a0-90da-f6fac65f5fda|RACE|1|Marco Bezzecchi|M. Bezzecchi|0|0|
|8f713a03-3639-5d96-92cb-a92948bcebb0|RACE|2|Ai Ogura|A. Ogura|0|3|
|d0af44ee-da62-5534-b740-9d1d8c171a11|RACE|3|Raul Fernandez|R. Fernandez|0|3|
|366428bb-64e2-57b5-a8f7-92fabc4fa2d8|RACE|4|Francesco Bagnaia|F. Bagnaia|0|0|
|1c669b44-a847-5120-a09c-848fb52628cb|RACE|5|Jorge Martin|J. Martin|0|1|
|ca687a85-f4d7-54c5-860d-3eed70f7b88a|RACE_OUT|—|Joan Mir|J. Mir|0|2|
|5de33c20-c668-522f-b9c5-ec89c9f298a2|SPRINT|1|Marco Bezzecchi|M. Bezzecchi|0|0|
|f1e91d4e-a97a-5980-b07c-979fd14c91aa|SPRINT|2|Jorge Martin|J. Martin|0|0|
|dab06c3f-0409-5d6c-b6db-cad243b33423|SPRINT|3|Francesco Bagnaia|F. Bagnaia|0|0|

- Scoring canonico: Qualifica **3** (pole 0 + tempo 3); Sprint **0** [0, 0, 0]; Gara **8** [posizioni 7; bonus 2; malus -1; OUT 2]
- Totale storico ricostruito: **11** = 3 + 0 + 8.

### marty.bria1996 / GRAND PRIX OF THE NETHERLANDS

- Prediction DB: `697368a0-0652-57c0-a2e9-bb028efe3520`
- Excel: `/tmp/fantamotogp-netherlands.xlsx`
- Righe: Q `Risposte del modulo 1!13`, Sprint `Risposte del modulo 2!11`, Gara `Risposte del modulo 3!12`
- Riferimenti: Pole `Risposte del modulo 1!C13`, tempo `Risposte del modulo 1!D13`, Sprint `Risposte del modulo 2!C11, Risposte del modulo 2!D11, Risposte del modulo 2!E11`, Gara `Risposte del modulo 3!C12, Risposte del modulo 3!D12, Risposte del modulo 3!E12, Risposte del modulo 3!F12, Risposte del modulo 3!G12, Risposte del modulo 3!H12`
- Valori Excel: pole=M. Bezzecchi; tempo=01:30.790; sprint=M. Bezzecchi / J. Martin / A. Ogura; gara=R. Fernandez / M. Bezzecchi / F. Bagnaia / A. Ogura / F. Di Giannantonio; out=F. Quartararo

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|501d6ce9-7ff1-59e7-8389-1a1ab39e4a67|POLE|—|Marco Bezzecchi|M. Bezzecchi|0|0|
|6e111d87-51e6-5c4d-9955-86dadcf8f163|QUALIFYING_TIME|—|90.79|01:30.790|0|5|
|ffdd6fc1-9b66-5dcb-b2df-ed3eecd17739|RACE|1|Raul Fernandez|R. Fernandez|0|3|
|ff33a35e-42ab-5815-9ac6-86029f9f27a5|RACE|2|Marco Bezzecchi|M. Bezzecchi|0|0|
|e96f5778-e57b-53eb-92ff-0075b4998d14|RACE|3|Francesco Bagnaia|F. Bagnaia|0|0|
|2c1ad8a6-f581-5a71-afe7-9b550fd1e40f|RACE|4|Ai Ogura|A. Ogura|0|1|
|6bd990ff-50fe-56b0-b63a-fdca099bb0e0|RACE|5|Fabio Di Giannantonio|F. Di Giannantonio|0|3|
|20476728-c53c-5f88-a3b4-1ce1e6a7e8c5|RACE_OUT|—|Fabio Quartararo|F. Quartararo|0|0|
|e9ff65ea-f100-5b77-8864-39ea0fca165c|SPRINT|1|Marco Bezzecchi|M. Bezzecchi|0|0|
|68792f85-c027-5cb1-a51e-df035449ca05|SPRINT|2|Jorge Martin|J. Martin|0|0|
|aa706ec2-15a7-532b-86ef-34f3265c9268|SPRINT|3|Ai Ogura|A. Ogura|0|1|

- Scoring canonico: Qualifica **5** (pole 0 + tempo 5); Sprint **1** [0, 0, 1]; Gara **6** [posizioni 7; bonus 0; malus -1; OUT 0]
- Totale storico ricostruito: **12** = 5 + 1 + 6.

### marino.dilorenzo / GRAND PRIX OF GERMANY

- Prediction DB: `4dc0b9f8-a5b7-5e6c-a2e1-17c7f5d31d8b`
- Excel: `/tmp/fantamotogp-germany.xlsx`
- Righe: Q `Risposte del modulo 1!7`, Sprint `Risposte del modulo 2!6`, Gara `Risposte del modulo 3!5`
- Riferimenti: Pole `Risposte del modulo 1!C7`, tempo `Risposte del modulo 1!D7`, Sprint `Risposte del modulo 2!C6, Risposte del modulo 2!D6, Risposte del modulo 2!E6`, Gara `Risposte del modulo 3!C5, Risposte del modulo 3!D5, Risposte del modulo 3!E5, Risposte del modulo 3!F5, Risposte del modulo 3!G5, Risposte del modulo 3!H5`
- Valori Excel: pole=M. Marquez; tempo=01:18.980; sprint=M. Marquez / F. Di Giannantonio / R. Fernandez; gara=M. Marquez / A. Marquez / F. Di Giannantonio / A. Ogura / J. Martin; out=D. Moreira

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|c62e4f06-98ff-52ee-bac2-9930d50e2a99|POLE|—|Marc Marquez|M. Marquez|0|5|
|ee09e3ea-b019-56b2-bb3b-6ce0387112a7|QUALIFYING_TIME|—|78.98|01:18.980|0|5|
|75ee8459-eb9d-577a-ac06-b4950f6055d9|RACE|1|Marc Marquez|M. Marquez|0|5|
|84907147-1d2f-5162-b774-4390901a2d9e|RACE|2|Alex Marquez|A. Marquez|0|0|
|0fbb7330-9dbc-507c-81eb-0074c64d0ea1|RACE|3|Fabio Di Giannantonio|F. Di Giannantonio|0|0|
|97db210d-6d9c-55c8-88fe-16bf60c4ee6a|RACE|4|Ai Ogura|A. Ogura|0|1|
|244f6d61-373b-54b8-a57b-02f88b79322a|RACE|5|Jorge Martin|J. Martin|0|5|
|f51b59ed-8c44-5e62-bbce-199afacee593|RACE_OUT|—|Diogo Moreira|D. Moreira|0|0|
|94dca014-1409-5ffa-b176-8e360d578860|SPRINT|1|Marc Marquez|M. Marquez|0|3|
|8d07792a-0d0a-5abe-9e74-b68bfa885133|SPRINT|2|Fabio Di Giannantonio|F. Di Giannantonio|0|1|
|eab92c39-7a21-5305-9da6-5c2470b387ee|SPRINT|3|Raul Fernandez|R. Fernandez|0|0|

- Scoring canonico: Qualifica **10** (pole 5 + tempo 5); Sprint **4** [3, 1, 0]; Gara **10** [posizioni 11; bonus 0; malus -1; OUT 0]
- Totale storico ricostruito: **24** = 10 + 4 + 10.

### alessandro.cavasso.1995 / GRAND PRIX OF GERMANY

- Prediction DB: `15a33dc8-050f-5e2f-8906-8bb0c39a7d3a`
- Excel: `/tmp/fantamotogp-germany.xlsx`
- Righe: Q `Risposte del modulo 1!3`, Sprint `Risposte del modulo 2!2`, Gara `Risposte del modulo 3!4`
- Riferimenti: Pole `Risposte del modulo 1!C3`, tempo `Risposte del modulo 1!D3`, Sprint `Risposte del modulo 2!C2, Risposte del modulo 2!D2, Risposte del modulo 2!E2`, Gara `Risposte del modulo 3!C4, Risposte del modulo 3!D4, Risposte del modulo 3!E4, Risposte del modulo 3!F4, Risposte del modulo 3!G4, Risposte del modulo 3!H4`
- Valori Excel: pole=M. Marquez; tempo=01:39.224; sprint=M. Marquez / F. Di Giannantonio / R. Fernandez; gara=M. Marquez / F. Di Giannantonio / A. Marquez / A. Ogura / R. Fernandez; out=J. Mir

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|00f1df56-2c33-5efa-bf22-6df6f2de0f56|POLE|—|Marc Marquez|M. Marquez|0|5|
|37c0addf-1f7b-5c98-828d-103c9da4c0a1|QUALIFYING_TIME|—|99.224|01:39.224|0|0|
|a26e51f2-64de-5f15-9d5a-3f0408aa9d2c|RACE|1|Marc Marquez|M. Marquez|0|5|
|06af4902-132c-5b47-9c31-995466fbd2ff|RACE|2|Fabio Di Giannantonio|F. Di Giannantonio|0|0|
|1d5d9339-c136-5b43-8a14-afd37dca256a|RACE|3|Alex Marquez|A. Marquez|0|0|
|e13408f5-d3e8-5efe-ba77-e1f00cf3ac8d|RACE|4|Ai Ogura|A. Ogura|0|1|
|8ab1b8c0-ca31-56da-9f0b-4ec3974ccb0b|RACE|5|Raul Fernandez|R. Fernandez|0|1|
|e9822a1d-3023-5c0c-96dc-5d6aaf4cb645|RACE_OUT|—|Joan Mir|J. Mir|0|2|
|19bc52d1-98c9-561f-b898-87ed6b88244b|SPRINT|1|Marc Marquez|M. Marquez|0|3|
|1ab69c4f-3f23-5a5b-99ce-42c254366323|SPRINT|2|Fabio Di Giannantonio|F. Di Giannantonio|0|1|
|ef9587c2-5b2a-5983-a9d7-62e6f582f5f8|SPRINT|3|Raul Fernandez|R. Fernandez|0|0|

- Scoring canonico: Qualifica **5** (pole 5 + tempo 0); Sprint **4** [3, 1, 0]; Gara **8** [posizioni 7; bonus 2; malus -1; OUT 2]
- Totale storico ricostruito: **17** = 5 + 4 + 8.

### simo.salva92 / GRAND PRIX OF GERMANY

- Prediction DB: `321fb3ac-a5c1-570f-8f34-63b374869cac`
- Excel: `/tmp/fantamotogp-germany.xlsx`
- Righe: Q `Risposte del modulo 1!11`, Sprint `Risposte del modulo 2!8`, Gara `Risposte del modulo 3!6`
- Riferimenti: Pole `Risposte del modulo 1!C11`, tempo `Risposte del modulo 1!D11`, Sprint `Risposte del modulo 2!C8, Risposte del modulo 2!D8, Risposte del modulo 2!E8`, Gara `Risposte del modulo 3!C6, Risposte del modulo 3!D6, Risposte del modulo 3!E6, Risposte del modulo 3!F6, Risposte del modulo 3!G6, Risposte del modulo 3!H6`
- Valori Excel: pole=M. Marquez; tempo=01:19.240; sprint=M. Marquez / F. Di Giannantonio / A. Marquez; gara=A. Marquez / M. Marquez / A. Ogura / F. Di Giannantonio / R. Fernandez; out=J. Mir

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|6ed9698a-79eb-5008-944d-93451a29b24a|POLE|—|Marc Marquez|M. Marquez|0|5|
|7eb374d4-9d4e-5884-8724-cd9252faa6d8|QUALIFYING_TIME|—|79.24|01:19.240|0|1|
|251a51f6-8bc5-5d81-9d34-8466c7bcb9a5|RACE|1|Alex Marquez|A. Marquez|0|0|
|243b96d1-707b-5e6b-90e2-bad1b5b1a7a5|RACE|2|Marc Marquez|M. Marquez|0|3|
|3765141c-cb41-5d0b-bb6e-e8b0cb3dff69|RACE|3|Ai Ogura|A. Ogura|0|3|
|e0af5ad5-c724-5439-a875-bfbef3739507|RACE|4|Fabio Di Giannantonio|F. Di Giannantonio|0|0|
|10d826a0-6f98-55ec-972f-5db8fb8a7cf5|RACE|5|Raul Fernandez|R. Fernandez|0|1|
|a497e166-be0a-52dd-9f66-8b1c57d83668|RACE_OUT|—|Joan Mir|J. Mir|0|2|
|93b3607e-f3eb-59fb-9fa1-4472aa984fa0|SPRINT|1|Marc Marquez|M. Marquez|0|3|
|cf892be7-385f-5106-97d6-4865248b7ff4|SPRINT|2|Fabio Di Giannantonio|F. Di Giannantonio|0|1|
|058bc708-266e-5eae-a559-b799a8d20933|SPRINT|3|Alex Marquez|A. Marquez|0|1|

- Scoring canonico: Qualifica **6** (pole 5 + tempo 1); Sprint **5** [3, 1, 1]; Gara **8** [posizioni 7; bonus 2; malus -1; OUT 2]
- Totale storico ricostruito: **19** = 6 + 5 + 8.

### marty.bria1996 / GRAND PRIX OF GERMANY

- Prediction DB: `3370161c-d8df-5297-a081-626a50d7bbd2`
- Excel: `/tmp/fantamotogp-germany.xlsx`
- Righe: Q `Risposte del modulo 1!12`, Sprint `Risposte del modulo 2!7`, Gara `Risposte del modulo 3!7`
- Riferimenti: Pole `Risposte del modulo 1!C12`, tempo `Risposte del modulo 1!D12`, Sprint `Risposte del modulo 2!C7, Risposte del modulo 2!D7, Risposte del modulo 2!E7`, Gara `Risposte del modulo 3!C7, Risposte del modulo 3!D7, Risposte del modulo 3!E7, Risposte del modulo 3!F7, Risposte del modulo 3!G7, Risposte del modulo 3!H7`
- Valori Excel: pole=M. Marquez; tempo=01:19.167; sprint=M. Marquez / F. Di Giannantonio / R. Fernandez; gara=M. Marquez / A. Marquez / F. Di Giannantonio / A. Ogura / R. Fernandez; out=E. Bastianini

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|777a879e-769d-54f0-979b-c49648b4abbe|POLE|—|Marc Marquez|M. Marquez|0|5|
|e18706ce-3b5a-5f67-99bb-db112be106c9|QUALIFYING_TIME|—|79.167|01:19.167|0|3|
|b8bfee71-efbe-52ea-b982-11cc150719f6|RACE|1|Marc Marquez|M. Marquez|0|5|
|a5f0dadb-ec29-5812-93ae-d544d0635ad2|RACE|2|Alex Marquez|A. Marquez|0|0|
|1f0a8607-239b-5aca-a9d3-0d83e0510008|RACE|3|Fabio Di Giannantonio|F. Di Giannantonio|0|0|
|6f4a1f3a-e5e4-5ed5-ad2f-ca3630679faa|RACE|4|Ai Ogura|A. Ogura|0|1|
|b6b13614-ccfc-52fc-89fc-976627c77ac3|RACE|5|Raul Fernandez|R. Fernandez|0|1|
|ed94e990-e873-59cd-83bd-879a841c97c2|RACE_OUT|—|Enea Bastianini|E. Bastianini|0|0|
|6d8bee89-c5e3-5e56-800a-2da0638f753b|SPRINT|1|Marc Marquez|M. Marquez|0|3|
|46c09cdd-399c-5dcf-a691-cd10e22beb8f|SPRINT|2|Fabio Di Giannantonio|F. Di Giannantonio|0|1|
|d8546d8e-ebaf-5aad-9996-b4819f4ed782|SPRINT|3|Raul Fernandez|R. Fernandez|0|0|

- Scoring canonico: Qualifica **8** (pole 5 + tempo 3); Sprint **4** [3, 1, 0]; Gara **6** [posizioni 7; bonus 0; malus -1; OUT 0]
- Totale storico ricostruito: **18** = 8 + 4 + 6.

### simo.salva92 / GRAND PRIX OF GREAT BRITAIN

- Prediction DB: `185690e7-f5aa-5b17-9fec-5f39b80f4814`
- Excel: `/tmp/fantamotogp-uk.xlsx`
- Righe: Q `Risposte del modulo 1!6`, Sprint `Risposte del modulo 2!3`, Gara `Risposte del modulo 3!3`
- Riferimenti: Pole `Risposte del modulo 1!C6`, tempo `Risposte del modulo 1!D6`, Sprint `Risposte del modulo 2!C3, Risposte del modulo 2!D3, Risposte del modulo 2!E3`, Gara `Risposte del modulo 3!C3, Risposte del modulo 3!D3, Risposte del modulo 3!E3, Risposte del modulo 3!F3, Risposte del modulo 3!G3, Risposte del modulo 3!H3`
- Valori Excel: pole=M. Bezzecchi; tempo=01:56.250; sprint=J. Martin / A. Ogura / R. Fernandez; gara=J. Martin / A. Ogura / R. Fernandez / M. Bezzecchi / A. Marquez; out=J. Mir

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|1221208c-fc10-5ddf-8a44-113ec9bb6267|POLE|—|Marco Bezzecchi|M. Bezzecchi|0|0|
|d9ef94d6-635b-53e6-acd0-5fb91b09c0eb|QUALIFYING_TIME|—|116.25|01:56.250|0|5|
|c986abcf-c883-5589-89d0-4c8f2e6ad5c1|RACE|1|Jorge Martin|J. Martin|0|3|
|4174c469-5d6e-5319-a0bd-cfe0f1927736|RACE|2|Ai Ogura|A. Ogura|0|0|
|dea8aec4-e15a-573e-9826-8af51eada0de|RACE|3|Raul Fernandez|R. Fernandez|0|1|
|a0062a68-c693-5a5b-b0dd-41074e9f258a|RACE|4|Marco Bezzecchi|M. Bezzecchi|0|3|
|30aa71a5-82d8-5bba-bb56-7b97df14454b|RACE|5|Alex Marquez|A. Marquez|0|3|
|81aeb8ed-bea3-5e3d-aca0-a3ed6e8f7a78|RACE_OUT|—|Joan Mir|J. Mir|0|2|
|2fd8b2ba-6876-5970-aa12-ecdc6727e9fd|SPRINT|1|Jorge Martin|J. Martin|0|3|
|7e571228-3bf2-558c-870a-6396eb8ca90b|SPRINT|2|Ai Ogura|A. Ogura|0|3|
|3a14ca62-7409-5327-b399-b4c4f37d933f|SPRINT|3|Raul Fernandez|R. Fernandez|0|0|

- Scoring canonico: Qualifica **5** (pole 0 + tempo 5); Sprint **6** [3, 3, 0]; Gara **11** [posizioni 10; bonus 2; malus -1; OUT 2]
- Totale storico ricostruito: **22** = 5 + 6 + 11.

### marty.bria1996 / GRAND PRIX OF GREAT BRITAIN

- Prediction DB: `391520e5-1953-59fd-97dd-675d4bb67fcd`
- Excel: `/tmp/fantamotogp-uk.xlsx`
- Righe: Q `Risposte del modulo 1!5`, Sprint `Risposte del modulo 2!4`, Gara `Risposte del modulo 3!6`
- Riferimenti: Pole `Risposte del modulo 1!C5`, tempo `Risposte del modulo 1!D5`, Sprint `Risposte del modulo 2!C4, Risposte del modulo 2!D4, Risposte del modulo 2!E4`, Gara `Risposte del modulo 3!C6, Risposte del modulo 3!D6, Risposte del modulo 3!E6, Risposte del modulo 3!F6, Risposte del modulo 3!G6, Risposte del modulo 3!H6`
- Valori Excel: pole=R. Fernandez; tempo=01:56.020; sprint=J. Martin / R. Fernandez / A. Ogura; gara=J. Martin / A. Ogura / R. Fernandez / M. Bezzecchi / F. Di Giannantonio; out=P. Acosta

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|c0e5dc66-4b76-5dcd-8672-dcfd8126a55f|POLE|—|Raul Fernandez|R. Fernandez|0|2|
|d21c43ed-9e75-5ca8-bbca-a59fbb7823e2|QUALIFYING_TIME|—|116.02|01:56.020|0|3|
|a8a3c511-47bc-5d2c-a46c-c820c070182a|RACE|1|Jorge Martin|J. Martin|0|3|
|f4f008aa-1db5-59ca-b460-58505bc4241c|RACE|2|Ai Ogura|A. Ogura|0|0|
|2c093b7e-af3a-5a0b-8d9c-100a16598ca6|RACE|3|Raul Fernandez|R. Fernandez|0|1|
|4d7072e8-c192-58de-b1e6-0be2afb2fb7a|RACE|4|Marco Bezzecchi|M. Bezzecchi|0|3|
|1a9aac29-ebd9-55a9-9137-2c1eef678c4e|RACE|5|Fabio Di Giannantonio|F. Di Giannantonio|0|0|
|3598ebcd-2e74-590d-af61-f0dffb3b1a8d|RACE_OUT|—|Pedro Acosta|P. Acosta|0|0|
|bb102f6b-c6cc-5515-b68d-aadb2a5fbd1b|SPRINT|1|Jorge Martin|J. Martin|0|3|
|79a85f1d-f2c4-5a57-9262-ec7517ac3251|SPRINT|2|Raul Fernandez|R. Fernandez|0|0|
|e8e7c004-d98d-57de-ae13-6e0e33fc513b|SPRINT|3|Ai Ogura|A. Ogura|0|1|

- Scoring canonico: Qualifica **5** (pole 2 + tempo 3); Sprint **4** [3, 0, 1]; Gara **6** [posizioni 7; bonus 0; malus -1; OUT 0]
- Totale storico ricostruito: **15** = 5 + 4 + 6.

### lucifero1966 / GRAND PRIX OF GREAT BRITAIN

- Prediction DB: `887d7439-11aa-538d-9a2b-a2788085f793`
- Excel: `/tmp/fantamotogp-uk.xlsx`
- Righe: Q `Risposte del modulo 1!2`, Sprint `Risposte del modulo 2!8`, Gara `Risposte del modulo 3!8`
- Riferimenti: Pole `Risposte del modulo 1!C2`, tempo `Risposte del modulo 1!D2`, Sprint `Risposte del modulo 2!C8, Risposte del modulo 2!D8, Risposte del modulo 2!E8`, Gara `Risposte del modulo 3!C8, Risposte del modulo 3!D8, Risposte del modulo 3!E8, Risposte del modulo 3!F8, Risposte del modulo 3!G8, Risposte del modulo 3!H8`
- Valori Excel: pole=R. Fernandez; tempo=01:56:148; sprint=R. Fernandez / M. Marquez / J. Martin; gara=J. Martin / A. Ogura / M. Marquez / F. Di Giannantonio / M. Bezzecchi; out=F. Morbidelli

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|05324748-611b-5233-8094-31d106636012|POLE|—|Raul Fernandez|R. Fernandez|0|2|
|e710e9c1-0daa-50b8-ba8c-209fd2f32510|QUALIFYING_TIME|—|116.148|01:56:148|0|5|
|aa435a3d-3aa1-56c9-9e0a-9ce443e90ec8|RACE|1|Jorge Martin|J. Martin|0|3|
|b528cee5-48c2-569e-87dc-94705a1d8aaa|RACE|2|Ai Ogura|A. Ogura|0|0|
|0128b389-eaa4-510e-bca8-7d2ff85c2344|RACE|3|Marc Marquez|M. Marquez|0|0|
|06caf2a6-aa30-501e-88e5-81b939b1c20f|RACE|4|Fabio Di Giannantonio|F. Di Giannantonio|0|0|
|7515f625-1927-578f-a13d-deebcf570f57|RACE|5|Marco Bezzecchi|M. Bezzecchi|0|1|
|2d9f8c34-1b0b-5650-b4ea-4609cfbe4aee|RACE_OUT|—|Franco Morbidelli|F. Morbidelli|0|0|
|ee6a62f8-714d-557e-8725-6b3589d4b830|SPRINT|1|Raul Fernandez|R. Fernandez|0|0|
|5f972210-3cae-52a1-b930-daf315922cd8|SPRINT|2|Marc Marquez|M. Marquez|0|0|
|c158d124-879c-5603-8b26-4ddfe4dcd436|SPRINT|3|Jorge Martin|J. Martin|0|0|

- Scoring canonico: Qualifica **7** (pole 2 + tempo 5); Sprint **0** [0, 0, 0]; Gara **3** [posizioni 4; bonus 0; malus -1; OUT 0]
- Totale storico ricostruito: **10** = 7 + 0 + 3.

### lucifero1966 / GRAND PRIX OF ARAGON

- Prediction DB: `62893502-8b02-5fd9-af57-dbd55fdf650c`
- Excel: `/tmp/fantamotogp-aragon.xlsx`
- Righe: Q `Risposte del modulo 1!6`, Sprint `Risposte del modulo 2!4`, Gara `Risposte del modulo 3!6`
- Riferimenti: Pole `Risposte del modulo 1!C6`, tempo `Risposte del modulo 1!D6`, Sprint `Risposte del modulo 2!C4, Risposte del modulo 2!D4, Risposte del modulo 2!E4`, Gara `Risposte del modulo 3!C6, Risposte del modulo 3!D6, Risposte del modulo 3!E6, Risposte del modulo 3!F6, Risposte del modulo 3!G6, Risposte del modulo 3!H6`
- Valori Excel: pole=R. Fernandez; tempo=01:45:324; sprint=M. Bezzecchi / A. Marquez / M. Marquez; gara=M. Marquez / A. Marquez / M. Bezzecchi / J. Martin / F. Bagnaia; out=J. Zarco

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|83925045-aca0-5bd2-b423-e7e012a7d568|POLE|—|Raul Fernandez|R. Fernandez|0|0|
|6e99a940-61cd-551c-ab1a-421920747a24|QUALIFYING_TIME|—|105.324|01:45:324|0|1|
|be160adb-e41c-5c72-b3c4-11d8d37e7217|RACE|1|Marc Marquez|M. Marquez|0|5|
|05af2f54-4b28-5d79-93d9-d47136e6c570|RACE|2|Alex Marquez|A. Marquez|0|1|
|4a4f80ef-fa86-597c-967a-2ae120fd54b4|RACE|3|Marco Bezzecchi|M. Bezzecchi|0|5|
|bbb3209f-a9cc-5849-89e6-5fb664260191|RACE|4|Jorge Martin|J. Martin|0|3|
|a762d44b-4bb1-5743-963d-2a74fd486f6e|RACE|5|Francesco Bagnaia|F. Bagnaia|0|0|
|46604936-8c4c-5597-9f3b-953e4a756174|RACE_OUT|—|Johann Zarco|J. Zarco|0|0|
|e2cfee23-01db-5d51-883c-67d06f201481|SPRINT|1|Marco Bezzecchi|M. Bezzecchi|0|0|
|5a7cdc47-c6ea-5384-be65-b7d0d6dd7a85|SPRINT|2|Alex Marquez|A. Marquez|0|3|
|49090af1-1acc-5ca3-8f65-b25b28c90ac9|SPRINT|3|Marc Marquez|M. Marquez|0|0|

- Scoring canonico: Qualifica **1** (pole 0 + tempo 1); Sprint **3** [0, 3, 0]; Gara **13** [posizioni 14; bonus 0; malus -1; OUT 0]
- Totale storico ricostruito: **17** = 1 + 3 + 13.

### ivan23dell / GRAND PRIX OF ARAGON

- Prediction DB: `394de24c-79cb-587e-981b-e73ddd1d42a9`
- Excel: `/tmp/fantamotogp-aragon.xlsx`
- Righe: Q `Risposte del modulo 1!2`, Sprint `Risposte del modulo 2!8`, Gara `Risposte del modulo 3!5`
- Riferimenti: Pole `Risposte del modulo 1!C2`, tempo `Risposte del modulo 1!D2`, Sprint `Risposte del modulo 2!C8, Risposte del modulo 2!D8, Risposte del modulo 2!E8`, Gara `Risposte del modulo 3!C5, Risposte del modulo 3!D5, Risposte del modulo 3!E5, Risposte del modulo 3!F5, Risposte del modulo 3!G5, Risposte del modulo 3!H5`
- Valori Excel: pole=M. Bezzecchi; tempo=01:45.145; sprint=M. Bezzecchi / M. Marquez / J. Martin; gara=J. Martin / M. Bezzecchi / A. Ogura / P. Acosta / F. Aldeguer; out=F. Quartararo

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|08e44ed1-4323-5f23-9191-702a8a015149|POLE|—|Marco Bezzecchi|M. Bezzecchi|0|5|
|e0cd0307-fa3f-5ce6-a2ea-af0f5cdfd2b9|QUALIFYING_TIME|—|105.145|01:45.145|0|3|
|751b671a-85ae-55b6-91ad-a5acd6921fd5|RACE|1|Jorge Martin|J. Martin|0|1|
|a67d33b5-4e0d-585e-94f8-9c4b1a4647bd|RACE|2|Marco Bezzecchi|M. Bezzecchi|0|3|
|6847bef1-751d-5cf0-8ca2-35d50ed6961d|RACE|3|Ai Ogura|A. Ogura|0|0|
|ed3cdfdc-fc0f-5ce0-96b8-1600eced3403|RACE|4|Pedro Acosta|P. Acosta|0|1|
|6f1e2fef-e6b0-56bd-accf-06d6f4367f4a|RACE|5|Fermin Aldeguer|F. Aldeguer|0|0|
|0591c37f-7927-5940-aab1-859a05b22c42|RACE_OUT|—|Fabio Quartararo|F. Quartararo|0|0|
|9c4a5181-d1c8-51a0-ade0-8ffa610f9203|SPRINT|1|Marco Bezzecchi|M. Bezzecchi|0|0|
|55dd3cf2-9692-5202-8ab6-677a88b679e3|SPRINT|2|Marc Marquez|M. Marquez|0|1|
|fc669746-6e41-544b-bb9f-86cbd1e8d86e|SPRINT|3|Jorge Martin|J. Martin|0|0|

- Scoring canonico: Qualifica **8** (pole 5 + tempo 3); Sprint **1** [0, 1, 0]; Gara **5** [posizioni 5; bonus 0; malus 0; OUT 0]
- Totale storico ricostruito: **14** = 8 + 1 + 5.

### dalla.pozza.silvia / GRAND PRIX OF THAILAND

- Prediction DB: `1a21c835-02f0-5d59-8423-858e67404bbe`
- Excel: `/tmp/fantamotogp-thailandia.xlsx`
- Righe: Q `Risposte del modulo 1!4`, Sprint `Risposte del modulo 2!3`, Gara `Risposte del modulo 3!4`
- Riferimenti: Pole `Risposte del modulo 1!C4`, tempo `Risposte del modulo 1!D4`, Sprint `Risposte del modulo 2!C3, Risposte del modulo 2!D3, Risposte del modulo 2!E3`, Gara `Risposte del modulo 3!C4, Risposte del modulo 3!D4, Risposte del modulo 3!E4, Risposte del modulo 3!F4, Risposte del modulo 3!G4, Risposte del modulo 3!H4`
- Valori Excel: pole=M. Marquez; tempo=01:40.600; sprint=M. Marquez / A. Marquez / F. Di Giannantonio; gara=M. Marquez / M. Bezzecchi / P. Acosta / R. Fernandez / F. Di Giannantonio; out=F. Quartararo

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|35aac791-ce53-5cfa-a7a1-cc793ff9b753|POLE|—|Marc Marquez|M. Marquez|0|2|
|d9f28b38-9c24-5d84-a9f2-d0dac2a4db4f|QUALIFYING_TIME|—|100.6|01:40.600|0|0|
|15bd5239-8176-502c-a361-200cc316c333|RACE|1|Marc Marquez|M. Marquez|0|0|
|db57a4b9-dc92-5089-861d-fae016bac366|RACE|2|Marco Bezzecchi|M. Bezzecchi|0|3|
|474783cb-c4db-56e8-8852-4957d6525127|RACE|3|Pedro Acosta|P. Acosta|0|3|
|545d8dae-0564-553c-ab32-a12c37e7177d|RACE|4|Raul Fernandez|R. Fernandez|0|3|
|8df9cb32-cdee-525e-8aaa-1ddf076cfd45|RACE|5|Fabio Di Giannantonio|F. Di Giannantonio|0|0|
|880b7727-4ea3-5ebb-9cbc-4a715625a22b|RACE_OUT|—|Fabio Quartararo|F. Quartararo|0|0|
|7a4b1d9c-2adf-51e1-b919-5b995b57b917|SPRINT|1|Marc Marquez|M. Marquez|0|1|
|c01bb1cf-2ac7-5baf-bfdb-aa0f8f69ca45|SPRINT|2|Alex Marquez|A. Marquez|0|0|
|365c61c3-dbf2-5286-a5dc-3f7f14db8393|SPRINT|3|Fabio Di Giannantonio|F. Di Giannantonio|0|0|

- Scoring canonico: Qualifica **2** (pole 2 + tempo 0); Sprint **1** [1, 0, 0]; Gara **8** [posizioni 9; bonus 0; malus -1; OUT 0]
- Totale storico ricostruito: **11** = 2 + 1 + 8.

### tommaso.strada95 / GRAND PRIX OF THAILAND

- Prediction DB: `e6d60b63-c043-5256-bc4e-a4d8d45b3bfc`
- Excel: `/tmp/fantamotogp-thailandia.xlsx`
- Righe: Q `Risposte del modulo 1!11`, Sprint `Risposte del modulo 2!9`, Gara `Risposte del modulo 3!11`
- Riferimenti: Pole `Risposte del modulo 1!C11`, tempo `Risposte del modulo 1!D11`, Sprint `Risposte del modulo 2!C9, Risposte del modulo 2!D9, Risposte del modulo 2!E9`, Gara `Risposte del modulo 3!C11, Risposte del modulo 3!D11, Risposte del modulo 3!E11, Risposte del modulo 3!F11, Risposte del modulo 3!G11, Risposte del modulo 3!H11`
- Valori Excel: pole=M. Marquez; tempo=01:39.800; sprint=M. Marquez / F. Di Giannantonio / J. Martin; gara=M. Bezzecchi / M. Marquez / P. Acosta / F. Di Giannantonio / R. Fernandez; out=A. Ogura

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|804d5ef8-0178-5915-9fb0-97d449b74c74|POLE|—|Marc Marquez|M. Marquez|0|2|
|95dd5d92-0bf9-5755-a2f4-aa600f83c51d|QUALIFYING_TIME|—|99.8|01:39.800|0|0|
|f4625678-ec89-52a6-8b03-ae7239f73357|RACE|1|Marco Bezzecchi|M. Bezzecchi|0|5|
|3948d4d8-e7b0-5655-a572-81a85e0c1c36|RACE|2|Marc Marquez|M. Marquez|0|0|
|ec4a08b4-e52d-58d4-b89e-7f3b9d661575|RACE|3|Pedro Acosta|P. Acosta|0|3|
|05fcc0ee-ecfb-515b-a12e-27876d8891a8|RACE|4|Fabio Di Giannantonio|F. Di Giannantonio|0|0|
|ed757e11-bf75-5cf2-ac90-3fbb48efd827|RACE|5|Raul Fernandez|R. Fernandez|0|1|
|67db2658-7b89-53c4-9c8f-32b594a46dda|RACE_OUT|—|Ai Ogura|A. Ogura|0|0|
|72004dad-8e5b-5c99-8e6e-74a5e83aee36|SPRINT|1|Marc Marquez|M. Marquez|0|1|
|028d3a41-9a19-5d77-b0bb-f42edf1f2442|SPRINT|2|Fabio Di Giannantonio|F. Di Giannantonio|0|0|
|14130240-a305-5364-995d-bcc52d0bb898|SPRINT|3|Jorge Martin|J. Martin|0|0|

- Scoring canonico: Qualifica **2** (pole 2 + tempo 0); Sprint **1** [1, 0, 0]; Gara **8** [posizioni 9; bonus 0; malus -1; OUT 0]
- Totale storico ricostruito: **11** = 2 + 1 + 8.

### ivan23dell / GRAND PRIX OF THAILAND

- Prediction DB: `144011fd-73f4-590a-a201-8056b2f9ade0`
- Excel: `/tmp/fantamotogp-thailandia.xlsx`
- Righe: Q `Risposte del modulo 1!5`, Sprint `Risposte del modulo 2!4`, Gara `Risposte del modulo 3!5`
- Riferimenti: Pole `Risposte del modulo 1!C5`, tempo `Risposte del modulo 1!D5`, Sprint `Risposte del modulo 2!C4, Risposte del modulo 2!D4, Risposte del modulo 2!E4`, Gara `Risposte del modulo 3!C5, Risposte del modulo 3!D5, Risposte del modulo 3!E5, Risposte del modulo 3!F5, Risposte del modulo 3!G5, Risposte del modulo 3!H5`
- Valori Excel: pole=M. Bezzecchi; tempo=01:28.035; sprint=M. Marquez / M. Bezzecchi / J. Martin; gara=M. Marquez / M. Bezzecchi / J. Martin / A. Marquez / P. Acosta; out=R. Fernandez

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|e7451873-b5c5-597a-aac2-70b91dd6c0a3|POLE|—|Marco Bezzecchi|M. Bezzecchi|0|5|
|87dcc1eb-ea5b-5caf-a303-762ce8dbe4e3|QUALIFYING_TIME|—|88.035|01:28.035|0|0|
|86a53c11-ec6b-5e9e-8a4b-de07148c2201|RACE|1|Marc Marquez|M. Marquez|0|0|
|66c38d8f-514e-5805-9ccd-b41481c9b9f2|RACE|2|Marco Bezzecchi|M. Bezzecchi|0|3|
|4ce1686f-8428-5f20-b92b-98055024cf5e|RACE|3|Jorge Martin|J. Martin|0|3|
|93cd06f3-26b2-581b-a2d8-975e4022366b|RACE|4|Alex Marquez|A. Marquez|0|0|
|d69b3e6b-da0e-510b-9724-e1e891b23120|RACE|5|Pedro Acosta|P. Acosta|0|1|
|14501399-41d2-59e8-8cb9-0f301774c3a4|RACE_OUT|—|Raul Fernandez|R. Fernandez|0|0|
|051dc52c-57c6-5c27-ba17-9f0e88237745|SPRINT|1|Marc Marquez|M. Marquez|0|1|
|4f914299-2ecd-5fe4-aa93-f39fbe4f6b96|SPRINT|2|Marco Bezzecchi|M. Bezzecchi|0|0|
|7888fff9-8bce-5a82-92f1-ff7c4351c14a|SPRINT|3|Jorge Martin|J. Martin|0|0|

- Scoring canonico: Qualifica **5** (pole 5 + tempo 0); Sprint **1** [1, 0, 0]; Gara **6** [posizioni 7; bonus 0; malus -1; OUT 0]
- Totale storico ricostruito: **12** = 5 + 1 + 6.

### alessandro.cavasso.1995 / GRAND PRIX OF THAILAND

- Prediction DB: `31ab9ae6-ad91-51d6-99cc-afe1aabe8964`
- Excel: `/tmp/fantamotogp-thailandia.xlsx`
- Righe: Q `Risposte del modulo 1!3`, Sprint `Risposte del modulo 2!2`, Gara `Risposte del modulo 3!3`
- Riferimenti: Pole `Risposte del modulo 1!C3`, tempo `Risposte del modulo 1!D3`, Sprint `Risposte del modulo 2!C2, Risposte del modulo 2!D2, Risposte del modulo 2!E2`, Gara `Risposte del modulo 3!C3, Risposte del modulo 3!D3, Risposte del modulo 3!E3, Risposte del modulo 3!F3, Risposte del modulo 3!G3, Risposte del modulo 3!H3`
- Valori Excel: pole=M. Bezzecchi; tempo=01:28.245; sprint=M. Marquez / M. Bezzecchi / F. Di Giannantonio; gara=M. Bezzecchi / M. Marquez / P. Acosta / R. Fernandez / F. Di Giannantonio; out=J. Mir

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|40d06fb5-33d0-5153-b694-86e2f546ed52|POLE|—|Marco Bezzecchi|M. Bezzecchi|0|5|
|6f285947-7f3c-51c4-bd89-3d815250b513|QUALIFYING_TIME|—|88.245|01:28.245|0|1|
|8db4fa78-d46f-5355-a126-fba8447a4b0a|RACE|1|Marco Bezzecchi|M. Bezzecchi|0|5|
|4c089610-1b05-5a3e-9c92-3c724f4e6668|RACE|2|Marc Marquez|M. Marquez|0|0|
|68c4d0ac-64ba-50d1-9d57-2070a815d610|RACE|3|Pedro Acosta|P. Acosta|0|3|
|bebab3d8-3eb3-55a2-af14-09a3be46eb4f|RACE|4|Raul Fernandez|R. Fernandez|0|3|
|78c39482-5d03-57fc-8344-45baf750c543|RACE|5|Fabio Di Giannantonio|F. Di Giannantonio|0|0|
|fb95bbcf-32e7-5454-8732-fbc37f41fa0b|RACE_OUT|—|Joan Mir|J. Mir|0|2|
|c41a0544-bcdd-58f9-8d31-8ed2a528ae6c|SPRINT|1|Marc Marquez|M. Marquez|0|1|
|41718cd1-2a02-5286-9f30-553a225d41b0|SPRINT|2|Marco Bezzecchi|M. Bezzecchi|0|0|
|8144624d-20bd-58c2-881b-1ba72938302f|SPRINT|3|Fabio Di Giannantonio|F. Di Giannantonio|0|0|

- Scoring canonico: Qualifica **6** (pole 5 + tempo 1); Sprint **1** [1, 0, 0]; Gara **12** [posizioni 11; bonus 2; malus -1; OUT 2]
- Totale storico ricostruito: **19** = 6 + 1 + 12.

### lucifero1966 / GRAND PRIX OF THAILAND

- Prediction DB: `526db0a3-d08c-5c4d-a148-08d38cb9828c`
- Excel: `/tmp/fantamotogp-thailandia.xlsx`
- Righe: Q `Risposte del modulo 1!6`, Sprint `Risposte del modulo 2!5`, Gara `Risposte del modulo 3!6`
- Riferimenti: Pole `Risposte del modulo 1!C6`, tempo `Risposte del modulo 1!D6`, Sprint `Risposte del modulo 2!C5, Risposte del modulo 2!D5, Risposte del modulo 2!E5`, Gara `Risposte del modulo 3!C6, Risposte del modulo 3!D6, Risposte del modulo 3!E6, Risposte del modulo 3!F6, Risposte del modulo 3!G6, Risposte del modulo 3!H6`
- Valori Excel: pole=M. Marquez; tempo=01:28:459; sprint=M. Marquez / M. Bezzecchi / P. Acosta; gara=M. Marquez / M. Bezzecchi / P. Acosta / F. Aldeguer / R. Fernandez; out=B. Binder

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|b091e265-e283-5268-a584-dd7e856809ed|POLE|—|Marc Marquez|M. Marquez|0|2|
|ac5297b1-01f6-5f71-a75f-fbb26687a496|QUALIFYING_TIME|—|88.459|01:28:459|0|3|
|ce66cdff-5857-55f4-9a39-409fba1ad3c5|RACE|1|Marc Marquez|M. Marquez|0|0|
|10b6aaa9-1c72-5dbe-9f96-ecd2b4426202|RACE|2|Marco Bezzecchi|M. Bezzecchi|0|3|
|f191c5eb-7c82-5a1e-81e5-4d425c21169f|RACE|3|Pedro Acosta|P. Acosta|0|3|
|4e2b8855-ecb6-52ae-8f99-6473e97f04d4|RACE|4|Fermin Aldeguer|F. Aldeguer|0|0|
|2d96c1ac-30b5-52f6-8043-60d0a60a0e6f|RACE|5|Raul Fernandez|R. Fernandez|0|1|
|5b96c7b9-f1e7-5f0b-88b2-fe60db3a65b0|RACE_OUT|—|Brad Binder|B. Binder|0|0|
|2370917a-e101-5870-891b-19b0587f3806|SPRINT|1|Marc Marquez|M. Marquez|0|1|
|72c3a841-38ba-5007-a308-f37e273c077e|SPRINT|2|Marco Bezzecchi|M. Bezzecchi|0|0|
|abc7a9df-a621-5841-b914-ce9e7daf31f6|SPRINT|3|Pedro Acosta|P. Acosta|0|0|

- Scoring canonico: Qualifica **5** (pole 2 + tempo 3); Sprint **1** [1, 0, 0]; Gara **6** [posizioni 7; bonus 0; malus -1; OUT 0]
- Totale storico ricostruito: **12** = 5 + 1 + 6.

### simo.salva92 / GRAND PRIX OF THAILAND

- Prediction DB: `432ea79e-143c-5f34-b54a-62d15a933379`
- Excel: `/tmp/fantamotogp-thailandia.xlsx`
- Righe: Q `Risposte del modulo 1!10`, Sprint `Risposte del modulo 2!8`, Gara `Risposte del modulo 3!10`
- Riferimenti: Pole `Risposte del modulo 1!C10`, tempo `Risposte del modulo 1!D10`, Sprint `Risposte del modulo 2!C8, Risposte del modulo 2!D8, Risposte del modulo 2!E8`, Gara `Risposte del modulo 3!C10, Risposte del modulo 3!D10, Risposte del modulo 3!E10, Risposte del modulo 3!F10, Risposte del modulo 3!G10, Risposte del modulo 3!H10`
- Valori Excel: pole=M. Bezzecchi; tempo=01:28.467; sprint=M. Bezzecchi / M. Marquez / J. Martin; gara=M. Marquez / M. Bezzecchi / P. Acosta / R. Fernandez / A. Ogura; out=J. Mir

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|33fb4a6d-660c-58da-9422-88b263f54d7c|POLE|—|Marco Bezzecchi|M. Bezzecchi|0|5|
|34473575-8498-5a43-94de-ac4b2ea62738|QUALIFYING_TIME|—|88.467|01:28.467|0|3|
|a0edf200-7101-5f79-a8d9-9497123a37fd|RACE|1|Marc Marquez|M. Marquez|0|0|
|7755ad13-12f7-5369-acf5-a4be2e43caae|RACE|2|Marco Bezzecchi|M. Bezzecchi|0|3|
|f253f6f6-8e63-5aa7-963d-5525a945c943|RACE|3|Pedro Acosta|P. Acosta|0|3|
|9830772e-0d1d-5506-9aa2-e2d0c3bb4fd7|RACE|4|Raul Fernandez|R. Fernandez|0|3|
|b0a915c2-78c9-53d9-b408-65f0a6ae2d79|RACE|5|Ai Ogura|A. Ogura|0|5|
|09230aad-1db7-5dcb-827d-259f72dee1fc|RACE_OUT|—|Joan Mir|J. Mir|0|2|
|9422e2ec-bd98-5093-b7aa-bce700380dbd|SPRINT|1|Marco Bezzecchi|M. Bezzecchi|0|0|
|b6ba641b-3c00-5cbb-a6dc-50d7d51533f3|SPRINT|2|Marc Marquez|M. Marquez|0|3|
|843afd48-e90e-56e4-b8f9-ba5ce6759f37|SPRINT|3|Jorge Martin|J. Martin|0|0|

- Scoring canonico: Qualifica **8** (pole 5 + tempo 3); Sprint **3** [0, 3, 0]; Gara **15** [posizioni 14; bonus 2; malus -1; OUT 2]
- Totale storico ricostruito: **26** = 8 + 3 + 15.

### marty.bria1996 / GRAND PRIX OF THAILAND

- Prediction DB: `45cc290b-0221-52b6-9138-7dabd5808b66`
- Excel: `/tmp/fantamotogp-thailandia.xlsx`
- Righe: Q `Risposte del modulo 1!8`, Sprint `Risposte del modulo 2!6`, Gara `Risposte del modulo 3!8`
- Riferimenti: Pole `Risposte del modulo 1!C8`, tempo `Risposte del modulo 1!D8`, Sprint `Risposte del modulo 2!C6, Risposte del modulo 2!D6, Risposte del modulo 2!E6`, Gara `Risposte del modulo 3!C8, Risposte del modulo 3!D8, Risposte del modulo 3!E8, Risposte del modulo 3!F8, Risposte del modulo 3!G8, Risposte del modulo 3!H8`
- Valori Excel: pole=M. Bezzecchi; tempo=01:28:489; sprint=M. Bezzecchi / M. Marquez / J. Martin; gara=M. Marquez / M. Bezzecchi / P. Acosta / R. Fernandez / F. Di Giannantonio; out=T. Razgatlioglu

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|99c1a342-a8d3-5bdc-a0f8-6a6d676ed98e|POLE|—|Marco Bezzecchi|M. Bezzecchi|0|5|
|874ae6cf-c654-5e95-a389-72d5183e9034|QUALIFYING_TIME|—|88.489|01:28:489|0|3|
|64cae478-08ee-53f4-86bc-4466146a63bf|RACE|1|Marc Marquez|M. Marquez|0|0|
|432754e1-5aaa-59f1-a8d4-1f14747fd68f|RACE|2|Marco Bezzecchi|M. Bezzecchi|0|3|
|67fdf291-9753-5f01-9699-2bd5534d9717|RACE|3|Pedro Acosta|P. Acosta|0|3|
|6c0ca66e-a817-5bd1-8a38-b658cab6bd1c|RACE|4|Raul Fernandez|R. Fernandez|0|3|
|956490f9-b197-5c40-8790-c661c50ce038|RACE|5|Fabio Di Giannantonio|F. Di Giannantonio|0|0|
|c98e61ea-608f-504f-b68d-c9ccaa1153b3|RACE_OUT|—|Toprak Razgatlioglu|T. Razgatlioglu|0|0|
|6395ed8f-08c2-5de6-9301-4ed5ab1e3f20|SPRINT|1|Marco Bezzecchi|M. Bezzecchi|0|0|
|91275e3d-c5fa-59ca-8701-7fd863f3befc|SPRINT|2|Marc Marquez|M. Marquez|0|3|
|d9f41932-5923-5509-a0f7-53b3c3ad8963|SPRINT|3|Jorge Martin|J. Martin|0|0|

- Scoring canonico: Qualifica **8** (pole 5 + tempo 3); Sprint **3** [0, 3, 0]; Gara **8** [posizioni 9; bonus 0; malus -1; OUT 0]
- Totale storico ricostruito: **19** = 8 + 3 + 8.

### Nicholas / GRAND PRIX OF THAILAND

- Prediction DB: `fab3b75d-4409-5cf8-a481-9778219f96c6`
- Excel: `/tmp/fantamotogp-thailandia.xlsx`
- Righe: Q `Risposte del modulo 1!9`, Sprint `Risposte del modulo 2!7`, Gara `Risposte del modulo 3!9`
- Riferimenti: Pole `Risposte del modulo 1!C9`, tempo `Risposte del modulo 1!D9`, Sprint `Risposte del modulo 2!C7, Risposte del modulo 2!D7, Risposte del modulo 2!E7`, Gara `Risposte del modulo 3!C9, Risposte del modulo 3!D9, Risposte del modulo 3!E9, Risposte del modulo 3!F9, Risposte del modulo 3!G9, Risposte del modulo 3!H9`
- Valori Excel: pole=M. Bezzecchi; tempo=01:28.526; sprint=M. Bezzecchi / M. Marquez / F. Di Giannantonio; gara=M. Marquez / M. Bezzecchi / P. Acosta / R. Fernandez / A. Marquez; out=J. Mir

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|0013b8d3-06c1-5fde-b1f9-16aa7eded828|POLE|—|Marco Bezzecchi|M. Bezzecchi|0|5|
|63e7049d-6882-5af0-91a1-adf2a00c5d19|QUALIFYING_TIME|—|88.526|01:28.526|0|3|
|c58e7a24-dcda-5556-ba29-4711d6904527|RACE|1|Marc Marquez|M. Marquez|0|0|
|23bfa268-300d-5eb8-bf6f-4177f0304d07|RACE|2|Marco Bezzecchi|M. Bezzecchi|0|3|
|5dd1afe0-7f55-516c-8655-081b1a031267|RACE|3|Pedro Acosta|P. Acosta|0|3|
|abb455d6-9fe9-5997-a30c-3d0347ab681a|RACE|4|Raul Fernandez|R. Fernandez|0|3|
|9ce02efa-1662-5bb0-8577-d33165d53333|RACE|5|Alex Marquez|A. Marquez|0|0|
|c4c9d1c4-00e7-5bb0-88a1-0e241490c77b|RACE_OUT|—|Joan Mir|J. Mir|0|2|
|3809ee7e-1be1-5fb5-bf6e-04ba3c870653|SPRINT|1|Marco Bezzecchi|M. Bezzecchi|0|0|
|a7cefaaf-d109-57ab-b685-a74238bc3697|SPRINT|2|Marc Marquez|M. Marquez|0|3|
|0b7472d3-6b64-580e-8fd1-08b375128228|SPRINT|3|Fabio Di Giannantonio|F. Di Giannantonio|0|0|

- Scoring canonico: Qualifica **8** (pole 5 + tempo 3); Sprint **3** [0, 3, 0]; Gara **10** [posizioni 9; bonus 2; malus -1; OUT 2]
- Totale storico ricostruito: **21** = 8 + 3 + 10.

### dalla.pozza.silvia / GRAND PRIX OF BRAZIL

- Prediction DB: `5403b20f-b7ac-5722-b2c2-fe4ef053cf67`
- Excel: `/tmp/fantamotogp-brasile.xlsx`
- Righe: Q `Risposte del modulo 1!6`, Sprint `Risposte del modulo 2!5`, Gara `Risposte del modulo 3!6`
- Riferimenti: Pole `Risposte del modulo 1!C6`, tempo `Risposte del modulo 1!D6`, Sprint `Risposte del modulo 2!C5, Risposte del modulo 2!D5, Risposte del modulo 2!E5`, Gara `Risposte del modulo 3!C6, Risposte del modulo 3!D6, Risposte del modulo 3!E6, Risposte del modulo 3!F6, Risposte del modulo 3!G6, Risposte del modulo 3!H6`
- Valori Excel: pole=M. Marquez; tempo=01:47.600; sprint=M. Bezzecchi / P. Acosta / A. Marquez; gara=M. Marquez / M. Bezzecchi / F. Di Giannantonio / P. Acosta / F. Quartararo; out=M. Viñales

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|98cd7b1e-5fe3-54fc-a8ca-215e9131c258|POLE|—|Marc Marquez|M. Marquez|0|0|
|80e5ed7b-f0a2-56a0-994f-fb0305ce3624|QUALIFYING_TIME|—|107.6|01:47.600|0|0|
|d3c4e148-818c-5021-a32d-c34a3defec8d|RACE|1|Marc Marquez|M. Marquez|0|1|
|508b27bf-ed19-5a3f-beb2-1efa099bd1e1|RACE|2|Marco Bezzecchi|M. Bezzecchi|0|3|
|3efab603-9267-52f8-bf94-67795c2f9978|RACE|3|Fabio Di Giannantonio|F. Di Giannantonio|0|5|
|d0a272f7-395f-5e38-88bd-87d924676f3b|RACE|4|Pedro Acosta|P. Acosta|0|0|
|2aa0a10c-27c5-55db-abbb-ab6b6446468d|RACE|5|Fabio Quartararo|F. Quartararo|0|0|
|8b5aa1d4-f551-5075-93bd-9d474de59f74|RACE_OUT|—|Maverick Viñales|M. Viñales|0|0|
|28ace7a5-8079-5aed-aa89-960399ea59a0|SPRINT|1|Marco Bezzecchi|M. Bezzecchi|0|0|
|eb6be53a-2f3d-5320-aef0-3347ebb18bd3|SPRINT|2|Pedro Acosta|P. Acosta|0|0|
|53ce047a-d7bd-545a-82d0-2f08686911b4|SPRINT|3|Alex Marquez|A. Marquez|0|0|

- Scoring canonico: Qualifica **0** (pole 0 + tempo 0); Sprint **0** [0, 0, 0]; Gara **9** [posizioni 9; bonus 0; malus 0; OUT 0]
- Totale storico ricostruito: **9** = 0 + 0 + 9.

### tommaso.strada95 / GRAND PRIX OF BRAZIL

- Prediction DB: `6fe907e4-ef7b-5743-938c-af9d35dd5cb6`
- Excel: `/tmp/fantamotogp-brasile.xlsx`
- Righe: Q `Risposte del modulo 1!4`, Sprint `Risposte del modulo 2!6`, Gara `Risposte del modulo 3!5`
- Riferimenti: Pole `Risposte del modulo 1!C4`, tempo `Risposte del modulo 1!D4`, Sprint `Risposte del modulo 2!C6, Risposte del modulo 2!D6, Risposte del modulo 2!E6`, Gara `Risposte del modulo 3!C5, Risposte del modulo 3!D5, Risposte del modulo 3!E5, Risposte del modulo 3!F5, Risposte del modulo 3!G5, Risposte del modulo 3!H5`
- Valori Excel: pole=M. Marquez; tempo=01:20.500; sprint=M. Bezzecchi / M. Marquez / F. Di Giannantonio; gara=M. Bezzecchi / M. Marquez / F. Di Giannantonio / P. Acosta / F. Quartararo; out=J. Mir

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|b33cce62-54d6-5fca-be6a-bea6aceecbe4|POLE|—|Marc Marquez|M. Marquez|0|0|
|8358fee9-e64e-5567-abd0-d576fafb2ec4|QUALIFYING_TIME|—|80.5|01:20.500|0|0|
|e9593b2f-93b5-59e8-a95c-9f65f7f4cb2c|RACE|1|Marco Bezzecchi|M. Bezzecchi|0|5|
|b2f3bd66-1c6e-59b9-a585-9d8bf42496c2|RACE|2|Marc Marquez|M. Marquez|0|1|
|f75d6284-57a6-5f69-a259-6675186ef217|RACE|3|Fabio Di Giannantonio|F. Di Giannantonio|0|5|
|099574be-f43e-506e-82ae-2b131d2cab0d|RACE|4|Pedro Acosta|P. Acosta|0|0|
|9b0f892f-74a4-57ac-83c2-122613376013|RACE|5|Fabio Quartararo|F. Quartararo|0|0|
|f328950c-0b11-5622-8d53-4750a5b08d5c|RACE_OUT|—|Joan Mir|J. Mir|0|2|
|45863385-8698-5e53-a522-3d7613d36212|SPRINT|1|Marco Bezzecchi|M. Bezzecchi|0|0|
|eaee7caf-24bf-55db-9db8-e91dbbcc7db9|SPRINT|2|Marc Marquez|M. Marquez|0|1|
|c23b855a-715b-593e-b532-44ac32c2239d|SPRINT|3|Fabio Di Giannantonio|F. Di Giannantonio|0|1|

- Scoring canonico: Qualifica **0** (pole 0 + tempo 0); Sprint **2** [0, 1, 1]; Gara **13** [posizioni 11; bonus 2; malus 0; OUT 2]
- Totale storico ricostruito: **15** = 0 + 2 + 13.

### marino.dilorenzo / GRAND PRIX OF BRAZIL

- Prediction DB: `c1f0c3da-0faa-50b3-9ccc-99a0e6c3c835`
- Excel: `/tmp/fantamotogp-brasile.xlsx`
- Righe: Q `Risposte del modulo 1!7`, Sprint `Risposte del modulo 2!11`, Gara `Risposte del modulo 3!11`
- Riferimenti: Pole `Risposte del modulo 1!C7`, tempo `Risposte del modulo 1!D7`, Sprint `Risposte del modulo 2!C11, Risposte del modulo 2!D11, Risposte del modulo 2!E11`, Gara `Risposte del modulo 3!C11, Risposte del modulo 3!D11, Risposte del modulo 3!E11, Risposte del modulo 3!F11, Risposte del modulo 3!G11, Risposte del modulo 3!H11`
- Valori Excel: pole=M. Marquez; tempo=01:20:000; sprint=M. Marquez / M. Bezzecchi / F. Di Giannantonio; gara=M. Marquez / M. Bezzecchi / J. Martin / F. Di Giannantonio / F. Bagnaia; out=J. Mir

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|30411a9c-4a52-516c-9531-3e7c35341dae|POLE|—|Marc Marquez|M. Marquez|0|0|
|5f8de3b9-2fa9-5ae5-8ecf-ebfb90606f8d|QUALIFYING_TIME|—|80|01:20:000|0|0|
|fcf34b49-5bd0-5d81-8eb0-683b5d584a46|RACE|1|Marc Marquez|M. Marquez|0|1|
|9050f898-6b37-5fc9-9f33-65ac7f5e01dc|RACE|2|Marco Bezzecchi|M. Bezzecchi|0|3|
|ad565115-0771-5e1b-995a-56895f37191e|RACE|3|Jorge Martin|J. Martin|0|3|
|26837d44-499f-559b-af3e-2f60da0fe712|RACE|4|Fabio Di Giannantonio|F. Di Giannantonio|0|3|
|b77b1c35-dc76-50b9-8334-e26b9edb9eb0|RACE|5|Francesco Bagnaia|F. Bagnaia|0|0|
|0b6122fb-166b-5abe-8e46-b38cc31319dc|RACE_OUT|—|Joan Mir|J. Mir|0|2|
|f7a9900b-8ef4-5e8a-8b8f-50ce5e57bbe9|SPRINT|1|Marc Marquez|M. Marquez|0|3|
|0247903a-aef2-5ada-a05c-573d058407a3|SPRINT|2|Marco Bezzecchi|M. Bezzecchi|0|0|
|520c0124-84cb-5aaa-8022-b9f9cdf0d26f|SPRINT|3|Fabio Di Giannantonio|F. Di Giannantonio|0|1|

- Scoring canonico: Qualifica **0** (pole 0 + tempo 0); Sprint **4** [3, 0, 1]; Gara **11** [posizioni 10; bonus 2; malus -1; OUT 2]
- Totale storico ricostruito: **15** = 0 + 4 + 11.

### ivan23dell / GRAND PRIX OF BRAZIL

- Prediction DB: `88254d4e-677f-5cce-ab97-1f2be28a4805`
- Excel: `/tmp/fantamotogp-brasile.xlsx`
- Righe: Q `Risposte del modulo 1!3`, Sprint `Risposte del modulo 2!3`, Gara `Risposte del modulo 3!3`
- Riferimenti: Pole `Risposte del modulo 1!C3`, tempo `Risposte del modulo 1!D3`, Sprint `Risposte del modulo 2!C3, Risposte del modulo 2!D3, Risposte del modulo 2!E3`, Gara `Risposte del modulo 3!C3, Risposte del modulo 3!D3, Risposte del modulo 3!E3, Risposte del modulo 3!F3, Risposte del modulo 3!G3, Risposte del modulo 3!H3`
- Valori Excel: pole=M. Marquez; tempo=01:20.936; sprint=M. Marquez / M. Bezzecchi / P. Acosta; gara=M. Bezzecchi / M. Marquez / P. Acosta / J. Martin / J. Zarco; out=F. Quartararo

|Entry DB|Tipo|Pos.|Valore DB|Valore Excel|Punti DB|Punti proposti|
|---|---|---|---|---|---|---|
|cf80b10d-9309-53d7-897e-2bf2eb7ea4ab|POLE|—|Marc Marquez|M. Marquez|0|0|
|2e9489f1-ace8-5f4f-b58e-682fcab49fc2|QUALIFYING_TIME|—|80.936|01:20.936|0|0|
|153617fc-e031-534b-8186-0abb3b9b3ff9|RACE|1|Marco Bezzecchi|M. Bezzecchi|0|5|
|9bbbf9cc-15dc-571d-8e19-7eccdf54c799|RACE|2|Marc Marquez|M. Marquez|0|1|
|9e1b2d3e-7ede-50d9-86eb-efcf68208336|RACE|3|Pedro Acosta|P. Acosta|0|0|
|c4fb9d45-b3f1-5573-bdb2-95fb289611f9|RACE|4|Jorge Martin|J. Martin|0|1|
|98c274ca-5438-5a1e-939f-976d9c7ef4a3|RACE|5|Johann Zarco|J. Zarco|0|0|
|03f011e6-0bae-569b-b20b-4b49b3bff18b|RACE_OUT|—|Fabio Quartararo|F. Quartararo|0|0|
|dbc5ecc4-f75d-578c-825c-029bd69e3f8e|SPRINT|1|Marc Marquez|M. Marquez|0|3|
|d93a3262-f700-56ed-8a0d-e80e377485aa|SPRINT|2|Marco Bezzecchi|M. Bezzecchi|0|0|
|1695180d-dc75-57b1-988a-525809643032|SPRINT|3|Pedro Acosta|P. Acosta|0|0|

- Scoring canonico: Qualifica **0** (pole 0 + tempo 0); Sprint **3** [3, 0, 0]; Gara **7** [posizioni 7; bonus 0; malus 0; OUT 0]
- Totale storico ricostruito: **10** = 0 + 3 + 7.

## Casi speciali richiesti

- **Niky / Thailandia**: verificato sopra con righe Excel, entry DB e ricostruzione 8 + 3 + 10 = 21 quando disponibile.
- **Nicholas / RSM** e **Nicholas / Aragon**: una prediction non presente nei workbook storici viene lasciata fuori dalla sorgente e non modificata.
- **Marino / Aragon**: la mappatura di una prediction DB mancante non crea alcun record; stato `MISSING_DB_PREDICTION` nel perimetro storico precedente.
- **Qatar**: se i risultati ufficiali del workbook non sono completi, lo scoring è `MISSING_DATA` e non viene inventato alcun valore.

## Decisione di sicurezza

Questo report non autorizza alcun apply. Anche le righe VERIFIED mostrano solo candidati read-only; partial, ambiguous, not found, incomplete, extra e missing-data restano invariati.
