# Task 39 — Apply scoring storico finale

- Data/ora avvio apply: **2026-09-07T07:54:30.841Z**
- Data/ora fine apply: **2026-09-07T07:54:49.719Z**
- Lega: **FantaTest (TEST01)**
- Fonte autorizzativa: **.agents/outputs/task-38-excel-db-mapping.md**
- RPC `score_prediction`: **0**
- Stato rollback: **NON NECESSARIO**
- Preflight completato prima delle scritture: **SI**

## Riepilogo

- Prediction candidate: **81**
- Prediction aggiornate: **56**
- Prediction già corrette: **25**
- Entry aggiornate: **71**
- Entry obsolete escluse: **22**
- Record esclusi dal perimetro: **33**
- Prediction partial escluse: **30**
- Errori: **0**
- PATCH aggregate pianificate: **56**
- PATCH entry pianificate: **71**
- Record saltati dopo recheck: **0**

## Entry obsolete escluse dal preflight

|Prediction ID|Utente|GP|Entry ID|Tipo|Punti proposti|Motivo|
|---|---|---|---|---|---|---|
|62893502-8b02-5fd9-af57-dbd55fdf650c|lucifero1966|GRAND PRIX OF ARAGON|83925045-aca0-5bd2-b423-e7e012a7d568|POLE|0|missing-from-preflight|
|62893502-8b02-5fd9-af57-dbd55fdf650c|lucifero1966|GRAND PRIX OF ARAGON|6e99a940-61cd-551c-ab1a-421920747a24|QUALIFYING_TIME|1|missing-from-preflight|
|62893502-8b02-5fd9-af57-dbd55fdf650c|lucifero1966|GRAND PRIX OF ARAGON|be160adb-e41c-5c72-b3c4-11d8d37e7217|RACE|5|missing-from-preflight|
|62893502-8b02-5fd9-af57-dbd55fdf650c|lucifero1966|GRAND PRIX OF ARAGON|05af2f54-4b28-5d79-93d9-d47136e6c570|RACE|1|missing-from-preflight|
|62893502-8b02-5fd9-af57-dbd55fdf650c|lucifero1966|GRAND PRIX OF ARAGON|4a4f80ef-fa86-597c-967a-2ae120fd54b4|RACE|5|missing-from-preflight|
|62893502-8b02-5fd9-af57-dbd55fdf650c|lucifero1966|GRAND PRIX OF ARAGON|bbb3209f-a9cc-5849-89e6-5fb664260191|RACE|3|missing-from-preflight|
|62893502-8b02-5fd9-af57-dbd55fdf650c|lucifero1966|GRAND PRIX OF ARAGON|a762d44b-4bb1-5743-963d-2a74fd486f6e|RACE|0|missing-from-preflight|
|62893502-8b02-5fd9-af57-dbd55fdf650c|lucifero1966|GRAND PRIX OF ARAGON|46604936-8c4c-5597-9f3b-953e4a756174|RACE_OUT|0|missing-from-preflight|
|62893502-8b02-5fd9-af57-dbd55fdf650c|lucifero1966|GRAND PRIX OF ARAGON|e2cfee23-01db-5d51-883c-67d06f201481|SPRINT|0|missing-from-preflight|
|62893502-8b02-5fd9-af57-dbd55fdf650c|lucifero1966|GRAND PRIX OF ARAGON|5a7cdc47-c6ea-5384-be65-b7d0d6dd7a85|SPRINT|3|missing-from-preflight|
|62893502-8b02-5fd9-af57-dbd55fdf650c|lucifero1966|GRAND PRIX OF ARAGON|49090af1-1acc-5ca3-8f65-b25b28c90ac9|SPRINT|0|missing-from-preflight|
|394de24c-79cb-587e-981b-e73ddd1d42a9|ivan23dell|GRAND PRIX OF ARAGON|08e44ed1-4323-5f23-9191-702a8a015149|POLE|5|missing-from-preflight|
|394de24c-79cb-587e-981b-e73ddd1d42a9|ivan23dell|GRAND PRIX OF ARAGON|e0cd0307-fa3f-5ce6-a2ea-af0f5cdfd2b9|QUALIFYING_TIME|3|missing-from-preflight|
|394de24c-79cb-587e-981b-e73ddd1d42a9|ivan23dell|GRAND PRIX OF ARAGON|751b671a-85ae-55b6-91ad-a5acd6921fd5|RACE|1|missing-from-preflight|
|394de24c-79cb-587e-981b-e73ddd1d42a9|ivan23dell|GRAND PRIX OF ARAGON|a67d33b5-4e0d-585e-94f8-9c4b1a4647bd|RACE|3|missing-from-preflight|
|394de24c-79cb-587e-981b-e73ddd1d42a9|ivan23dell|GRAND PRIX OF ARAGON|6847bef1-751d-5cf0-8ca2-35d50ed6961d|RACE|0|missing-from-preflight|
|394de24c-79cb-587e-981b-e73ddd1d42a9|ivan23dell|GRAND PRIX OF ARAGON|ed3cdfdc-fc0f-5ce0-96b8-1600eced3403|RACE|1|missing-from-preflight|
|394de24c-79cb-587e-981b-e73ddd1d42a9|ivan23dell|GRAND PRIX OF ARAGON|6f1e2fef-e6b0-56bd-accf-06d6f4367f4a|RACE|0|missing-from-preflight|
|394de24c-79cb-587e-981b-e73ddd1d42a9|ivan23dell|GRAND PRIX OF ARAGON|0591c37f-7927-5940-aab1-859a05b22c42|RACE_OUT|0|missing-from-preflight|
|394de24c-79cb-587e-981b-e73ddd1d42a9|ivan23dell|GRAND PRIX OF ARAGON|9c4a5181-d1c8-51a0-ade0-8ffa610f9203|SPRINT|0|missing-from-preflight|
|394de24c-79cb-587e-981b-e73ddd1d42a9|ivan23dell|GRAND PRIX OF ARAGON|55dd3cf2-9692-5202-8ab6-677a88b679e3|SPRINT|1|missing-from-preflight|
|394de24c-79cb-587e-981b-e73ddd1d42a9|ivan23dell|GRAND PRIX OF ARAGON|fc669746-6e41-544b-bb9f-86cbd1e8d86e|SPRINT|0|missing-from-preflight|

## Tabella completa delle modifiche

|Prediction ID|Utente|GP|Record|Campo|Valore precedente|Valore nuovo|
|---|---|---|---|---|---|---|
|722b8ed5-c501-5d02-8f50-92a2ed3a1127|Nicholas|GRAND PRIX OF HUNGARY|prediction|malus_points|0|-1|
|722b8ed5-c501-5d02-8f50-92a2ed3a1127|Nicholas|GRAND PRIX OF HUNGARY|prediction|total_points|17|16|
|722b8ed5-c501-5d02-8f50-92a2ed3a1127|Nicholas|GRAND PRIX OF HUNGARY|entry:218dc1d5-e693-5d22-b4e1-5a3c1a16b1f3|points|0|2|
|04eedd26-a8e1-5365-bcb8-2a77a6d5309b|Nicholas|GRAND PRIX OF GERMANY|prediction|malus_points|0|-1|
|04eedd26-a8e1-5365-bcb8-2a77a6d5309b|Nicholas|GRAND PRIX OF GERMANY|prediction|total_points|23|22|
|04eedd26-a8e1-5365-bcb8-2a77a6d5309b|Nicholas|GRAND PRIX OF GERMANY|entry:c6d3388a-3161-5beb-bfcc-7edc3ae6d739|points|0|2|
|02b3d6f6-db00-5b64-8557-5323323343af|Nicholas|GRAND PRIX OF CZECHIA|prediction|malus_points|0|-1|
|02b3d6f6-db00-5b64-8557-5323323343af|Nicholas|GRAND PRIX OF CZECHIA|prediction|total_points|18|17|
|014480b4-4bb9-50fa-bd8c-b2d5ce1d6c09|Nicholas|GRAND PRIX OF THE NETHERLANDS|prediction|malus_points|0|-1|
|014480b4-4bb9-50fa-bd8c-b2d5ce1d6c09|Nicholas|GRAND PRIX OF THE NETHERLANDS|prediction|total_points|14|13|
|08fedd41-b194-55fd-9163-1e65620fc093|Nicholas|GRAND PRIX DE FRANCE|prediction|malus_points|0|-1|
|08fedd41-b194-55fd-9163-1e65620fc093|Nicholas|GRAND PRIX DE FRANCE|prediction|total_points|19|18|
|08fedd41-b194-55fd-9163-1e65620fc093|Nicholas|GRAND PRIX DE FRANCE|entry:fb906e7f-0c37-59d8-8d06-5062b0502c92|points|0|2|
|5f11d5c3-3ad5-5c9a-a674-10500315ce76|Nicholas|GRAND PRIX OF THE UNITED STATES|entry:c5f0ef3e-13cd-5500-858f-6c8d6ea1b3c0|points|0|2|
|2c90c751-4587-595b-9cb9-6d01cae55d02|Nicholas|GRAND PRIX OF SPAIN|prediction|malus_points|0|-1|
|2c90c751-4587-595b-9cb9-6d01cae55d02|Nicholas|GRAND PRIX OF SPAIN|prediction|total_points|13|12|
|b791a713-b510-5c5f-9940-6f9bfaa65a0a|Nicholas|GRAND PRIX OF GREAT BRITAIN|prediction|malus_points|0|-1|
|b791a713-b510-5c5f-9940-6f9bfaa65a0a|Nicholas|GRAND PRIX OF GREAT BRITAIN|prediction|total_points|19|18|
|b791a713-b510-5c5f-9940-6f9bfaa65a0a|Nicholas|GRAND PRIX OF GREAT BRITAIN|entry:d81bc4b7-28a3-5cbb-bb33-d4aeaa8b6362|points|3|0|
|b791a713-b510-5c5f-9940-6f9bfaa65a0a|Nicholas|GRAND PRIX OF GREAT BRITAIN|entry:79866207-3324-57fa-b1b9-66a3560d1d70|points|0|2|
|720df8c6-0369-5339-a00a-da6174e45164|alessandro.cavasso.1995|GRAND PRIX OF THE UNITED STATES|entry:a4fb917d-451c-57a7-8194-7ba1b4a4b2cd|points|0|2|
|39c6ed23-b794-5e63-8202-2cc08b384c5f|alessandro.cavasso.1995|GRAND PRIX OF HUNGARY|prediction|malus_points|0|-5|
|39c6ed23-b794-5e63-8202-2cc08b384c5f|alessandro.cavasso.1995|GRAND PRIX OF HUNGARY|prediction|total_points|14|9|
|39c6ed23-b794-5e63-8202-2cc08b384c5f|alessandro.cavasso.1995|GRAND PRIX OF HUNGARY|entry:0ac09be1-4239-58b3-bbc4-a4578af6f372|points|0|2|
|a07f1946-4363-534f-ba30-8d77b095673b|alessandro.cavasso.1995|GRAND PRIX OF SPAIN|prediction|malus_points|0|-1|
|a07f1946-4363-534f-ba30-8d77b095673b|alessandro.cavasso.1995|GRAND PRIX OF SPAIN|prediction|total_points|20|19|
|89a0489c-a9b3-57ff-b65a-cab4151296eb|alessandro.cavasso.1995|GRAND PRIX OF CZECHIA|prediction|sprint_points|4|3|
|89a0489c-a9b3-57ff-b65a-cab4151296eb|alessandro.cavasso.1995|GRAND PRIX OF CZECHIA|prediction|total_points|15|14|
|89a0489c-a9b3-57ff-b65a-cab4151296eb|alessandro.cavasso.1995|GRAND PRIX OF CZECHIA|entry:66800f94-6bca-5516-86f0-a8eb6b21591d|points|1|0|
|c8b2f9a7-e7f6-5bad-8bde-015ed67cfa1d|alessandro.cavasso.1995|GRAND PRIX OF BRAZIL|entry:df00577e-130b-5fff-ae78-69b9b96a1629|points|3|0|
|c8b2f9a7-e7f6-5bad-8bde-015ed67cfa1d|alessandro.cavasso.1995|GRAND PRIX OF BRAZIL|entry:af7046bd-79bc-50db-a3bf-6e4ff9f54d05|points|0|2|
|143313aa-fe16-533b-9ba9-d0e477618007|alessandro.cavasso.1995|GRAND PRIX OF CATALONIA|prediction|sprint_points|3|2|
|143313aa-fe16-533b-9ba9-d0e477618007|alessandro.cavasso.1995|GRAND PRIX OF CATALONIA|prediction|race_points|4|5|
|143313aa-fe16-533b-9ba9-d0e477618007|alessandro.cavasso.1995|GRAND PRIX OF CATALONIA|prediction|malus_points|0|-5|
|143313aa-fe16-533b-9ba9-d0e477618007|alessandro.cavasso.1995|GRAND PRIX OF CATALONIA|prediction|total_points|13|8|
|143313aa-fe16-533b-9ba9-d0e477618007|alessandro.cavasso.1995|GRAND PRIX OF CATALONIA|entry:f75fcca2-fbb3-5968-85b6-37f8c715b215|points|1|5|
|143313aa-fe16-533b-9ba9-d0e477618007|alessandro.cavasso.1995|GRAND PRIX OF CATALONIA|entry:58142c8c-8ee8-5625-9cc8-4f6ef86720b3|points|1|0|
|143313aa-fe16-533b-9ba9-d0e477618007|alessandro.cavasso.1995|GRAND PRIX OF CATALONIA|entry:e47453f5-e14f-5be9-b5d0-82c9efa5f8f9|points|1|0|
|143313aa-fe16-533b-9ba9-d0e477618007|alessandro.cavasso.1995|GRAND PRIX OF CATALONIA|entry:53263f7b-9693-5bd8-a693-81df144a4b2f|points|1|0|
|143313aa-fe16-533b-9ba9-d0e477618007|alessandro.cavasso.1995|GRAND PRIX OF CATALONIA|entry:b09a44a7-4136-5f15-9694-7bf193c5ecb6|points|1|0|
|b7f18f49-1f80-5e61-9883-29acebd3f35e|alessandro.cavasso.1995|GRAND PRIX OF GREAT BRITAIN|prediction|malus_points|0|-1|
|b7f18f49-1f80-5e61-9883-29acebd3f35e|alessandro.cavasso.1995|GRAND PRIX OF GREAT BRITAIN|prediction|total_points|23|22|
|b7f18f49-1f80-5e61-9883-29acebd3f35e|alessandro.cavasso.1995|GRAND PRIX OF GREAT BRITAIN|entry:cde9b429-a9bc-5b0c-a9d0-376e85348403|points|0|2|
|07b30444-e140-557f-acd6-6ce07eaaadb0|marty.bria1996|GRAND PRIX OF BRAZIL|entry:7df39d2e-9c63-54d2-9eef-aca524ff26b4|points|0|2|
|911d3e8e-4478-56eb-a496-46298877aa91|Nicholas|GRAND PRIX OF BRAZIL|entry:4b30b706-ed57-5975-b90e-b16ea455cb76|points|0|2|
|4a055cc2-00f7-549c-aa19-dee4e21dbe14|ivan23dell|GRAND PRIX OF THE UNITED STATES|entry:179c3bd1-e43a-5dde-bc1d-b3116c713ac9|points|0|2|
|5d42622c-45f8-54e3-94c5-862d0c513982|alandellosbel8|GRAND PRIX OF THE UNITED STATES|entry:9e15ee5d-8a83-5d61-a622-7801fb3a6c16|points|0|2|
|508822d0-a548-5f89-9d97-3fae293309f5|dalla.pozza.silvia|GRAND PRIX OF THE UNITED STATES|entry:f0e81e5e-dfdc-5cf8-b081-59a805bf4247|points|0|2|
|48ac4094-c3cd-5be4-8fc5-840ea80965ba|lucifero1966|GRAND PRIX OF THE UNITED STATES|entry:02128a0a-69c7-5910-a0b8-5cd5143ca10c|points|0|2|
|ada70f36-e9fb-5b28-a129-f0d7cc63a4f1|marty.bria1996|GRAND PRIX OF THE UNITED STATES|prediction|malus_points|0|-1|
|ada70f36-e9fb-5b28-a129-f0d7cc63a4f1|marty.bria1996|GRAND PRIX OF THE UNITED STATES|prediction|total_points|10|9|
|ada70f36-e9fb-5b28-a129-f0d7cc63a4f1|marty.bria1996|GRAND PRIX OF THE UNITED STATES|entry:4089862d-5399-5b9b-9a6e-6cbecb5dc9f8|points|0|2|
|1eabe6fb-a2f5-589f-8dfd-a2f94635289a|simo.salva92|GRAND PRIX OF SPAIN|prediction|malus_points|0|-1|
|1eabe6fb-a2f5-589f-8dfd-a2f94635289a|simo.salva92|GRAND PRIX OF SPAIN|prediction|total_points|17|16|
|51824f4f-6501-5a8f-b013-48342a40257c|marty.bria1996|GRAND PRIX OF SPAIN|prediction|malus_points|0|-1|
|51824f4f-6501-5a8f-b013-48342a40257c|marty.bria1996|GRAND PRIX OF SPAIN|prediction|total_points|15|14|
|80eff41b-c0c4-5483-9eec-e93b6b603eeb|ivan23dell|GRAND PRIX OF SPAIN|prediction|malus_points|0|-1|
|80eff41b-c0c4-5483-9eec-e93b6b603eeb|ivan23dell|GRAND PRIX OF SPAIN|prediction|total_points|15|14|
|e2df7316-a5aa-566e-ae95-4491ea4e70b9|lucifero1966|GRAND PRIX OF SPAIN|prediction|malus_points|0|-1|
|e2df7316-a5aa-566e-ae95-4491ea4e70b9|lucifero1966|GRAND PRIX OF SPAIN|prediction|total_points|11|10|
|45921e31-65c3-51d2-abcd-1785c59d8e70|dalla.pozza.silvia|GRAND PRIX OF SPAIN|prediction|sprint_points|9|0|
|45921e31-65c3-51d2-abcd-1785c59d8e70|dalla.pozza.silvia|GRAND PRIX OF SPAIN|prediction|malus_points|0|-1|
|45921e31-65c3-51d2-abcd-1785c59d8e70|dalla.pozza.silvia|GRAND PRIX OF SPAIN|prediction|total_points|17|7|
|45921e31-65c3-51d2-abcd-1785c59d8e70|dalla.pozza.silvia|GRAND PRIX OF SPAIN|entry:7bba3758-3a3b-599c-836f-b6c430c0da15|points|3|0|
|45921e31-65c3-51d2-abcd-1785c59d8e70|dalla.pozza.silvia|GRAND PRIX OF SPAIN|entry:1a60d6d2-6fbe-51e9-ad01-6255b2f5d31c|points|3|0|
|45921e31-65c3-51d2-abcd-1785c59d8e70|dalla.pozza.silvia|GRAND PRIX OF SPAIN|entry:d6187a2f-aa67-59be-b42b-2aaacf7fc798|points|3|0|
|8ba5e5cf-560b-5e92-96ea-d5fb6d37b38f|marino.dilorenzo|GRAND PRIX DE FRANCE|prediction|malus_points|0|-1|
|8ba5e5cf-560b-5e92-96ea-d5fb6d37b38f|marino.dilorenzo|GRAND PRIX DE FRANCE|prediction|total_points|19|18|
|8ba5e5cf-560b-5e92-96ea-d5fb6d37b38f|marino.dilorenzo|GRAND PRIX DE FRANCE|entry:b899f616-3eb8-5aa5-8bc3-16fc52a571e6|points|0|2|
|66320ba5-f9c3-593b-8a70-ff1b0c923753|tommaso.strada95|GRAND PRIX DE FRANCE|prediction|bonus_points|2|0|
|66320ba5-f9c3-593b-8a70-ff1b0c923753|tommaso.strada95|GRAND PRIX DE FRANCE|prediction|total_points|10|8|
|2d169a63-1f23-5ef7-aee0-85cb39e4d5f8|alandellosbel8|GRAND PRIX DE FRANCE|prediction|malus_points|0|-1|
|2d169a63-1f23-5ef7-aee0-85cb39e4d5f8|alandellosbel8|GRAND PRIX DE FRANCE|prediction|total_points|8|7|
|2d169a63-1f23-5ef7-aee0-85cb39e4d5f8|alandellosbel8|GRAND PRIX DE FRANCE|entry:3c27e6b8-6c35-5e8a-adbc-8193fb516e2e|points|0|2|
|bbc97158-67e6-5bc2-95f1-38d847ce6438|tommaso.strada95|GRAND PRIX OF CATALONIA|prediction|race_points|6|0|
|bbc97158-67e6-5bc2-95f1-38d847ce6438|tommaso.strada95|GRAND PRIX OF CATALONIA|prediction|total_points|10|4|
|bbc97158-67e6-5bc2-95f1-38d847ce6438|tommaso.strada95|GRAND PRIX OF CATALONIA|entry:11edc134-1ea0-50e9-928e-482543e705d4|points|1|0|
|bbc97158-67e6-5bc2-95f1-38d847ce6438|tommaso.strada95|GRAND PRIX OF CATALONIA|entry:e5cedd86-b9d3-5049-9966-fd0075d77c04|points|5|0|
|a80d6fac-140e-532b-9e1e-e6b75afea429|dalla.pozza.silvia|GRAND PRIX OF CATALONIA|prediction|race_points|8|0|
|a80d6fac-140e-532b-9e1e-e6b75afea429|dalla.pozza.silvia|GRAND PRIX OF CATALONIA|prediction|total_points|8|0|
|a80d6fac-140e-532b-9e1e-e6b75afea429|dalla.pozza.silvia|GRAND PRIX OF CATALONIA|entry:d0a0fe54-d453-5376-b832-316b07c4130c|points|3|0|
|a80d6fac-140e-532b-9e1e-e6b75afea429|dalla.pozza.silvia|GRAND PRIX OF CATALONIA|entry:9c2e9a4c-2193-519f-bc67-f19784848e64|points|5|0|
|3c763d2d-7544-5a60-a020-b43041031190|marino.dilorenzo|GRAND PRIX OF CATALONIA|prediction|sprint_points|3|2|
|3c763d2d-7544-5a60-a020-b43041031190|marino.dilorenzo|GRAND PRIX OF CATALONIA|prediction|race_points|16|1|
|3c763d2d-7544-5a60-a020-b43041031190|marino.dilorenzo|GRAND PRIX OF CATALONIA|prediction|bonus_points|1|2|
|3c763d2d-7544-5a60-a020-b43041031190|marino.dilorenzo|GRAND PRIX OF CATALONIA|prediction|malus_points|0|-5|
|3c763d2d-7544-5a60-a020-b43041031190|marino.dilorenzo|GRAND PRIX OF CATALONIA|prediction|total_points|25|5|
|3c763d2d-7544-5a60-a020-b43041031190|marino.dilorenzo|GRAND PRIX OF CATALONIA|entry:55899c56-fb56-5b0f-b3d8-24ed3ba6a571|points|5|0|
|3c763d2d-7544-5a60-a020-b43041031190|marino.dilorenzo|GRAND PRIX OF CATALONIA|entry:c445bc85-b369-56d8-bb19-a14b53d8972b|points|5|0|
|3c763d2d-7544-5a60-a020-b43041031190|marino.dilorenzo|GRAND PRIX OF CATALONIA|entry:b4981bbb-f550-5578-a6ee-1df1b2433bb7|points|5|1|
|3c763d2d-7544-5a60-a020-b43041031190|marino.dilorenzo|GRAND PRIX OF CATALONIA|entry:5dfb9a3b-8100-501f-a188-ef1a378e99ac|points|1|0|
|3c763d2d-7544-5a60-a020-b43041031190|marino.dilorenzo|GRAND PRIX OF CATALONIA|entry:4c45fcbe-57f9-55ce-bf8e-c39b3c817a28|points|0|2|
|3c763d2d-7544-5a60-a020-b43041031190|marino.dilorenzo|GRAND PRIX OF CATALONIA|entry:34f6f96d-bb5d-5787-ba03-bf266e6ef876|points|1|0|
|508e4bf7-a0b4-5d90-a2be-b17297d9ee34|ivan23dell|GRAND PRIX OF CATALONIA|prediction|race_points|11|9|
|508e4bf7-a0b4-5d90-a2be-b17297d9ee34|ivan23dell|GRAND PRIX OF CATALONIA|prediction|malus_points|0|-1|
|508e4bf7-a0b4-5d90-a2be-b17297d9ee34|ivan23dell|GRAND PRIX OF CATALONIA|prediction|total_points|15|12|
|508e4bf7-a0b4-5d90-a2be-b17297d9ee34|ivan23dell|GRAND PRIX OF CATALONIA|entry:9a4f7929-5af8-5dc7-95a0-7e777f63c01d|points|1|0|
|508e4bf7-a0b4-5d90-a2be-b17297d9ee34|ivan23dell|GRAND PRIX OF CATALONIA|entry:97eb1c60-3056-594d-8e9d-9074b884df04|points|5|0|
|508e4bf7-a0b4-5d90-a2be-b17297d9ee34|ivan23dell|GRAND PRIX OF CATALONIA|entry:9fe87eff-cfb8-5032-9c00-d26eebce121f|points|0|3|
|508e4bf7-a0b4-5d90-a2be-b17297d9ee34|ivan23dell|GRAND PRIX OF CATALONIA|entry:90504891-d19e-5fbe-a94b-e2783edbf100|points|5|1|
|508e4bf7-a0b4-5d90-a2be-b17297d9ee34|ivan23dell|GRAND PRIX OF CATALONIA|entry:ed4b2caa-b4e6-59a1-9d57-d262e00e132f|points|0|5|
|7469b845-a82b-536e-8383-813076fecadc|marty.bria1996|GRAND PRIX OF CATALONIA|prediction|race_points|8|3|
|7469b845-a82b-536e-8383-813076fecadc|marty.bria1996|GRAND PRIX OF CATALONIA|prediction|malus_points|0|-5|
|7469b845-a82b-536e-8383-813076fecadc|marty.bria1996|GRAND PRIX OF CATALONIA|prediction|total_points|23|13|
|7469b845-a82b-536e-8383-813076fecadc|marty.bria1996|GRAND PRIX OF CATALONIA|entry:80947950-7211-5e37-bacf-b35c7818a12f|points|1|3|
|7469b845-a82b-536e-8383-813076fecadc|marty.bria1996|GRAND PRIX OF CATALONIA|entry:19578ef9-fa3a-58ac-90d1-550979f4f0fd|points|5|0|
|7469b845-a82b-536e-8383-813076fecadc|marty.bria1996|GRAND PRIX OF CATALONIA|entry:3c83d2ef-76d1-5959-bf24-687852121522|points|1|0|
|7469b845-a82b-536e-8383-813076fecadc|marty.bria1996|GRAND PRIX OF CATALONIA|entry:5da30f88-3389-59e2-9f42-6c0d6c3142e6|points|1|0|
|714a658f-8444-5349-8652-0926d97752e5|simo.salva92|GRAND PRIX OF CATALONIA|prediction|sprint_points|3|2|
|714a658f-8444-5349-8652-0926d97752e5|simo.salva92|GRAND PRIX OF CATALONIA|prediction|race_points|8|3|
|714a658f-8444-5349-8652-0926d97752e5|simo.salva92|GRAND PRIX OF CATALONIA|prediction|malus_points|0|-5|
|714a658f-8444-5349-8652-0926d97752e5|simo.salva92|GRAND PRIX OF CATALONIA|prediction|total_points|12|1|
|714a658f-8444-5349-8652-0926d97752e5|simo.salva92|GRAND PRIX OF CATALONIA|entry:53338207-6316-52ad-aff7-648232eb0c83|points|1|3|
|714a658f-8444-5349-8652-0926d97752e5|simo.salva92|GRAND PRIX OF CATALONIA|entry:9dd7082a-57ee-5190-a236-0963935f5dc5|points|5|0|
|714a658f-8444-5349-8652-0926d97752e5|simo.salva92|GRAND PRIX OF CATALONIA|entry:8caebddc-0804-58e7-b8e6-31d8f880d874|points|1|0|
|714a658f-8444-5349-8652-0926d97752e5|simo.salva92|GRAND PRIX OF CATALONIA|entry:b006c557-e8ae-5d68-b259-a71183802911|points|1|0|
|714a658f-8444-5349-8652-0926d97752e5|simo.salva92|GRAND PRIX OF CATALONIA|entry:c4ef3e17-3303-5e0d-8172-d645b195e240|points|1|0|
|172c1292-20d9-5752-b3d4-4e1714399c83|ivan23dell|GRAND PRIX OF ITALY|entry:cc182a89-2b63-55d6-b3b5-e749b76bac80|points|3|0|
|0014ec76-bca0-549a-96c0-a29e19de94d1|marino.dilorenzo|GRAND PRIX OF HUNGARY|prediction|malus_points|0|-1|
|0014ec76-bca0-549a-96c0-a29e19de94d1|marino.dilorenzo|GRAND PRIX OF HUNGARY|prediction|total_points|17|16|
|e0ec1ef5-b6a5-5eb0-af61-a4fef358a379|alandellosbel8|GRAND PRIX OF HUNGARY|prediction|malus_points|0|-1|
|e0ec1ef5-b6a5-5eb0-af61-a4fef358a379|alandellosbel8|GRAND PRIX OF HUNGARY|prediction|total_points|16|15|
|e0ec1ef5-b6a5-5eb0-af61-a4fef358a379|alandellosbel8|GRAND PRIX OF HUNGARY|entry:14ca5fde-dd32-533f-b5a5-fa3631b829aa|points|0|2|
|5712b709-a7bd-59b6-90f9-755f8fa74867|tommaso.strada95|GRAND PRIX OF HUNGARY|prediction|malus_points|0|-1|
|5712b709-a7bd-59b6-90f9-755f8fa74867|tommaso.strada95|GRAND PRIX OF HUNGARY|prediction|total_points|15|14|
|5712b709-a7bd-59b6-90f9-755f8fa74867|tommaso.strada95|GRAND PRIX OF HUNGARY|entry:9b15b675-e473-53bc-b19d-a34cdce57d6b|points|0|2|
|8336da4e-8667-5600-9b5d-6862dc2186c9|marty.bria1996|GRAND PRIX OF HUNGARY|prediction|malus_points|0|-5|
|8336da4e-8667-5600-9b5d-6862dc2186c9|marty.bria1996|GRAND PRIX OF HUNGARY|prediction|total_points|19|14|
|48e6098f-7fc2-5054-bc44-3af0f5e61097|simo.salva92|GRAND PRIX OF HUNGARY|prediction|malus_points|0|-5|
|48e6098f-7fc2-5054-bc44-3af0f5e61097|simo.salva92|GRAND PRIX OF HUNGARY|prediction|total_points|17|12|
|17096295-2e54-5f4e-a6b8-1a88d3294407|ivan23dell|GRAND PRIX OF HUNGARY|prediction|malus_points|0|-5|
|17096295-2e54-5f4e-a6b8-1a88d3294407|ivan23dell|GRAND PRIX OF HUNGARY|prediction|total_points|8|3|
|53c8ee16-dd4d-5d27-a426-5c298fa39c12|ivan23dell|GRAND PRIX OF CZECHIA|prediction|malus_points|0|-1|
|53c8ee16-dd4d-5d27-a426-5c298fa39c12|ivan23dell|GRAND PRIX OF CZECHIA|prediction|total_points|15|14|
|f14b1914-2be9-5500-ba2d-caeef9e08740|marty.bria1996|GRAND PRIX OF CZECHIA|entry:b4dee285-4371-5e31-9346-331a85c37c44|points|0|2|
|4098ed9c-8810-5fdc-872a-56f87991891d|marino.dilorenzo|GRAND PRIX OF THE NETHERLANDS|prediction|malus_points|0|-1|
|4098ed9c-8810-5fdc-872a-56f87991891d|marino.dilorenzo|GRAND PRIX OF THE NETHERLANDS|prediction|total_points|14|13|
|8db2ad27-5bb1-5162-b627-0fc84ec25aad|simo.salva92|GRAND PRIX OF BRAZIL|entry:af1da6e8-4898-5cb1-856a-03ca1f396069|points|0|2|
|fa025129-9fb7-57d6-a42c-a8db79a8b260|ivan23dell|GRAND PRIX DE FRANCE|prediction|malus_points|0|-1|
|fa025129-9fb7-57d6-a42c-a8db79a8b260|ivan23dell|GRAND PRIX DE FRANCE|prediction|total_points|12|11|
|f8ef9830-5b7e-5268-bbd0-c2d43c6101e5|marino.dilorenzo|GRAND PRIX OF CZECHIA|prediction|malus_points|0|-1|
|f8ef9830-5b7e-5268-bbd0-c2d43c6101e5|marino.dilorenzo|GRAND PRIX OF CZECHIA|prediction|total_points|19|18|
|24f6473a-1e64-5faf-94f7-a931e8d043b1|simo.salva92|GRAND PRIX OF THE NETHERLANDS|prediction|malus_points|0|-1|
|24f6473a-1e64-5faf-94f7-a931e8d043b1|simo.salva92|GRAND PRIX OF THE NETHERLANDS|prediction|total_points|12|11|
|24f6473a-1e64-5faf-94f7-a931e8d043b1|simo.salva92|GRAND PRIX OF THE NETHERLANDS|entry:ca687a85-f4d7-54c5-860d-3eed70f7b88a|points|0|2|
|697368a0-0652-57c0-a2e9-bb028efe3520|marty.bria1996|GRAND PRIX OF THE NETHERLANDS|prediction|malus_points|0|-1|
|697368a0-0652-57c0-a2e9-bb028efe3520|marty.bria1996|GRAND PRIX OF THE NETHERLANDS|prediction|total_points|13|12|
|4dc0b9f8-a5b7-5e6c-a2e1-17c7f5d31d8b|marino.dilorenzo|GRAND PRIX OF GERMANY|prediction|malus_points|0|-1|
|4dc0b9f8-a5b7-5e6c-a2e1-17c7f5d31d8b|marino.dilorenzo|GRAND PRIX OF GERMANY|prediction|total_points|25|24|
|15a33dc8-050f-5e2f-8906-8bb0c39a7d3a|alessandro.cavasso.1995|GRAND PRIX OF GERMANY|prediction|malus_points|0|-1|
|15a33dc8-050f-5e2f-8906-8bb0c39a7d3a|alessandro.cavasso.1995|GRAND PRIX OF GERMANY|prediction|total_points|18|17|
|15a33dc8-050f-5e2f-8906-8bb0c39a7d3a|alessandro.cavasso.1995|GRAND PRIX OF GERMANY|entry:e9822a1d-3023-5c0c-96dc-5d6aaf4cb645|points|0|2|
|321fb3ac-a5c1-570f-8f34-63b374869cac|simo.salva92|GRAND PRIX OF GERMANY|prediction|malus_points|0|-1|
|321fb3ac-a5c1-570f-8f34-63b374869cac|simo.salva92|GRAND PRIX OF GERMANY|prediction|total_points|20|19|
|321fb3ac-a5c1-570f-8f34-63b374869cac|simo.salva92|GRAND PRIX OF GERMANY|entry:a497e166-be0a-52dd-9f66-8b1c57d83668|points|0|2|
|3370161c-d8df-5297-a081-626a50d7bbd2|marty.bria1996|GRAND PRIX OF GERMANY|prediction|malus_points|0|-1|
|3370161c-d8df-5297-a081-626a50d7bbd2|marty.bria1996|GRAND PRIX OF GERMANY|prediction|total_points|19|18|
|185690e7-f5aa-5b17-9fec-5f39b80f4814|simo.salva92|GRAND PRIX OF GREAT BRITAIN|prediction|malus_points|0|-1|
|185690e7-f5aa-5b17-9fec-5f39b80f4814|simo.salva92|GRAND PRIX OF GREAT BRITAIN|prediction|total_points|23|22|
|185690e7-f5aa-5b17-9fec-5f39b80f4814|simo.salva92|GRAND PRIX OF GREAT BRITAIN|entry:81aeb8ed-bea3-5e3d-aca0-a3ed6e8f7a78|points|0|2|
|391520e5-1953-59fd-97dd-675d4bb67fcd|marty.bria1996|GRAND PRIX OF GREAT BRITAIN|prediction|malus_points|0|-1|
|391520e5-1953-59fd-97dd-675d4bb67fcd|marty.bria1996|GRAND PRIX OF GREAT BRITAIN|prediction|total_points|16|15|
|391520e5-1953-59fd-97dd-675d4bb67fcd|marty.bria1996|GRAND PRIX OF GREAT BRITAIN|entry:1a9aac29-ebd9-55a9-9137-2c1eef678c4e|points|3|0|
|887d7439-11aa-538d-9a2b-a2788085f793|lucifero1966|GRAND PRIX OF GREAT BRITAIN|prediction|malus_points|0|-1|
|887d7439-11aa-538d-9a2b-a2788085f793|lucifero1966|GRAND PRIX OF GREAT BRITAIN|prediction|total_points|11|10|
|62893502-8b02-5fd9-af57-dbd55fdf650c|lucifero1966|GRAND PRIX OF ARAGON|prediction|malus_points|0|-1|
|62893502-8b02-5fd9-af57-dbd55fdf650c|lucifero1966|GRAND PRIX OF ARAGON|prediction|total_points|18|17|
|1a21c835-02f0-5d59-8423-858e67404bbe|dalla.pozza.silvia|GRAND PRIX OF THAILAND|prediction|malus_points|0|-1|
|1a21c835-02f0-5d59-8423-858e67404bbe|dalla.pozza.silvia|GRAND PRIX OF THAILAND|prediction|total_points|12|11|
|1a21c835-02f0-5d59-8423-858e67404bbe|dalla.pozza.silvia|GRAND PRIX OF THAILAND|entry:8df9cb32-cdee-525e-8aaa-1ddf076cfd45|points|3|0|
|e6d60b63-c043-5256-bc4e-a4d8d45b3bfc|tommaso.strada95|GRAND PRIX OF THAILAND|prediction|malus_points|0|-1|
|e6d60b63-c043-5256-bc4e-a4d8d45b3bfc|tommaso.strada95|GRAND PRIX OF THAILAND|prediction|total_points|12|11|
|144011fd-73f4-590a-a201-8056b2f9ade0|ivan23dell|GRAND PRIX OF THAILAND|prediction|malus_points|0|-1|
|144011fd-73f4-590a-a201-8056b2f9ade0|ivan23dell|GRAND PRIX OF THAILAND|prediction|total_points|13|12|
|31ab9ae6-ad91-51d6-99cc-afe1aabe8964|alessandro.cavasso.1995|GRAND PRIX OF THAILAND|prediction|malus_points|0|-1|
|31ab9ae6-ad91-51d6-99cc-afe1aabe8964|alessandro.cavasso.1995|GRAND PRIX OF THAILAND|prediction|total_points|20|19|
|31ab9ae6-ad91-51d6-99cc-afe1aabe8964|alessandro.cavasso.1995|GRAND PRIX OF THAILAND|entry:78c39482-5d03-57fc-8344-45baf750c543|points|3|0|
|31ab9ae6-ad91-51d6-99cc-afe1aabe8964|alessandro.cavasso.1995|GRAND PRIX OF THAILAND|entry:fb95bbcf-32e7-5454-8732-fbc37f41fa0b|points|0|2|
|526db0a3-d08c-5c4d-a148-08d38cb9828c|lucifero1966|GRAND PRIX OF THAILAND|prediction|malus_points|0|-1|
|526db0a3-d08c-5c4d-a148-08d38cb9828c|lucifero1966|GRAND PRIX OF THAILAND|prediction|total_points|13|12|
|432ea79e-143c-5f34-b54a-62d15a933379|simo.salva92|GRAND PRIX OF THAILAND|prediction|malus_points|0|-1|
|432ea79e-143c-5f34-b54a-62d15a933379|simo.salva92|GRAND PRIX OF THAILAND|prediction|total_points|27|26|
|432ea79e-143c-5f34-b54a-62d15a933379|simo.salva92|GRAND PRIX OF THAILAND|entry:09230aad-1db7-5dcb-827d-259f72dee1fc|points|0|2|
|45cc290b-0221-52b6-9138-7dabd5808b66|marty.bria1996|GRAND PRIX OF THAILAND|prediction|malus_points|0|-1|
|45cc290b-0221-52b6-9138-7dabd5808b66|marty.bria1996|GRAND PRIX OF THAILAND|prediction|total_points|20|19|
|45cc290b-0221-52b6-9138-7dabd5808b66|marty.bria1996|GRAND PRIX OF THAILAND|entry:956490f9-b197-5c40-8790-c661c50ce038|points|3|0|
|fab3b75d-4409-5cf8-a481-9778219f96c6|Nicholas|GRAND PRIX OF THAILAND|prediction|malus_points|0|-1|
|fab3b75d-4409-5cf8-a481-9778219f96c6|Nicholas|GRAND PRIX OF THAILAND|prediction|total_points|22|21|
|fab3b75d-4409-5cf8-a481-9778219f96c6|Nicholas|GRAND PRIX OF THAILAND|entry:c4c9d1c4-00e7-5bb0-88a1-0e241490c77b|points|0|2|
|6fe907e4-ef7b-5743-938c-af9d35dd5cb6|tommaso.strada95|GRAND PRIX OF BRAZIL|entry:f328950c-0b11-5622-8d53-4750a5b08d5c|points|0|2|
|c1f0c3da-0faa-50b3-9ccc-99a0e6c3c835|marino.dilorenzo|GRAND PRIX OF BRAZIL|prediction|malus_points|0|-1|
|c1f0c3da-0faa-50b3-9ccc-99a0e6c3c835|marino.dilorenzo|GRAND PRIX OF BRAZIL|prediction|total_points|16|15|
|c1f0c3da-0faa-50b3-9ccc-99a0e6c3c835|marino.dilorenzo|GRAND PRIX OF BRAZIL|entry:0b6122fb-166b-5abe-8e46-b38cc31319dc|points|0|2|

## Confronto DB pre/post e Task 38

|Utente|GP|Prediction ID|DB pre Q/S/R/B/M/T|DB post Q/S/R/B/M/T|Task 38 atteso Q/S/R/B/M/T|Esito|
|---|---|---|---|---|---|---|
|Nicholas|GRAND PRIX OF CATALONIA|7830cb54-8d02-5618-9d96-0e7756a5b1a0|1/2/1/2/-1/5|1/2/1/2/-1/5|1/2/1/2/-1/5|PASS|
|Nicholas|GRAND PRIX OF ITALY|ff38daa7-d3ef-525d-b4e8-2d6a7c8501ae|1/1/14/0/0/16|1/1/14/0/0/16|1/1/14/0/0/16|PASS|
|Nicholas|GRAND PRIX OF HUNGARY|722b8ed5-c501-5d02-8f50-92a2ed3a1127|3/2/10/2/0/17|3/2/10/2/-1/16|3/2/10/2/-1/16|PASS|
|Nicholas|GRAND PRIX OF GERMANY|04eedd26-a8e1-5365-bcb8-2a77a6d5309b|8/4/9/2/0/23|8/4/9/2/-1/22|8/4/9/2/-1/22|PASS|
|Nicholas|GRAND PRIX OF CZECHIA|02b3d6f6-db00-5b64-8557-5323323343af|0/2/16/0/0/18|0/2/16/0/-1/17|0/2/16/0/-1/17|PASS|
|Nicholas|GRAND PRIX OF THE NETHERLANDS|014480b4-4bb9-50fa-bd8c-b2d5ce1d6c09|1/1/12/0/0/14|1/1/12/0/-1/13|1/1/12/0/-1/13|PASS|
|Nicholas|GRAND PRIX DE FRANCE|08fedd41-b194-55fd-9163-1e65620fc093|3/2/12/2/0/19|3/2/12/2/-1/18|3/2/12/2/-1/18|PASS|
|Nicholas|GRAND PRIX OF THE UNITED STATES|5f11d5c3-3ad5-5c9a-a674-10500315ce76|1/0/14/2/0/17|1/0/14/2/0/17|1/0/14/2/0/17|PASS|
|Nicholas|GRAND PRIX OF SPAIN|2c90c751-4587-595b-9cb9-6d01cae55d02|0/3/10/0/0/13|0/3/10/0/-1/12|0/3/10/0/-1/12|PASS|
|Nicholas|GRAND PRIX OF GREAT BRITAIN|b791a713-b510-5c5f-9940-6f9bfaa65a0a|3/3/11/2/0/19|3/3/11/2/-1/18|3/3/11/2/-1/18|PASS|
|alessandro.cavasso.1995|GRAND PRIX OF THE UNITED STATES|720df8c6-0369-5339-a00a-da6174e45164|3/0/10/2/0/15|3/0/10/2/0/15|3/0/10/2/0/15|PASS|
|alessandro.cavasso.1995|GRAND PRIX OF HUNGARY|39c6ed23-b794-5e63-8202-2cc08b384c5f|5/1/6/2/0/14|5/1/6/2/-5/9|5/1/6/2/-5/9|PASS|
|alessandro.cavasso.1995|GRAND PRIX OF SPAIN|a07f1946-4363-534f-ba30-8d77b095673b|5/3/12/0/0/20|5/3/12/0/-1/19|5/3/12/0/-1/19|PASS|
|alessandro.cavasso.1995|GRAND PRIX OF CZECHIA|89a0489c-a9b3-57ff-b65a-cab4151296eb|3/4/8/0/0/15|3/3/8/0/0/14|3/3/8/0/0/14|PASS|
|alessandro.cavasso.1995|GRAND PRIX OF BRAZIL|c8b2f9a7-e7f6-5bad-8bde-015ed67cfa1d|0/6/10/2/0/18|0/6/10/2/0/18|0/6/10/2/0/18|PASS|
|alessandro.cavasso.1995|GRAND PRIX OF CATALONIA|143313aa-fe16-533b-9ba9-d0e477618007|6/3/4/0/0/13|6/2/5/0/-5/8|6/2/5/0/-5/8|PASS|
|alessandro.cavasso.1995|GRAND PRIX OF GREAT BRITAIN|b7f18f49-1f80-5e61-9883-29acebd3f35e|5/9/7/2/0/23|5/9/7/2/-1/22|5/9/7/2/-1/22|PASS|
|marty.bria1996|GRAND PRIX OF BRAZIL|07b30444-e140-557f-acd6-6ce07eaaadb0|1/2/8/2/0/13|1/2/8/2/0/13|1/2/8/2/0/13|PASS|
|Nicholas|GRAND PRIX OF BRAZIL|911d3e8e-4478-56eb-a496-46298877aa91|0/6/15/4/0/25|0/6/15/4/0/25|0/6/15/4/0/25|PASS|
|ivan23dell|GRAND PRIX OF THE UNITED STATES|4a055cc2-00f7-549c-aa19-dee4e21dbe14|3/0/16/2/0/21|3/0/16/2/0/21|3/0/16/2/0/21|PASS|
|alandellosbel8|GRAND PRIX OF THE UNITED STATES|5d42622c-45f8-54e3-94c5-862d0c513982|7/0/11/4/0/22|7/0/11/4/0/22|7/0/11/4/0/22|PASS|
|marino.dilorenzo|GRAND PRIX OF THE UNITED STATES|5a55b2e0-2e55-536d-acca-0e76bb711c8c|1/0/12/0/0/13|1/0/12/0/0/13|1/0/12/0/0/13|PASS|
|dalla.pozza.silvia|GRAND PRIX OF THE UNITED STATES|508822d0-a548-5f89-9d97-3fae293309f5|0/0/14/2/0/16|0/0/14/2/0/16|0/0/14/2/0/16|PASS|
|lucifero1966|GRAND PRIX OF THE UNITED STATES|48ac4094-c3cd-5be4-8fc5-840ea80965ba|0/1/9/2/0/12|0/1/9/2/0/12|0/1/9/2/0/12|PASS|
|simo.salva92|GRAND PRIX OF THE UNITED STATES|916b868f-9dc6-54c7-b298-3422566dd325|2/0/8/0/0/10|2/0/8/0/0/10|2/0/8/0/0/10|PASS|
|marty.bria1996|GRAND PRIX OF THE UNITED STATES|ada70f36-e9fb-5b28-a129-f0d7cc63a4f1|2/1/5/2/0/10|2/1/5/2/-1/9|2/1/5/2/-1/9|PASS|
|simo.salva92|GRAND PRIX OF SPAIN|1eabe6fb-a2f5-589f-8dfd-a2f94635289a|3/3/11/0/0/17|3/3/11/0/-1/16|3/3/11/0/-1/16|PASS|
|marty.bria1996|GRAND PRIX OF SPAIN|51824f4f-6501-5a8f-b013-48342a40257c|5/3/7/0/0/15|5/3/7/0/-1/14|5/3/7/0/-1/14|PASS|
|ivan23dell|GRAND PRIX OF SPAIN|80eff41b-c0c4-5483-9eec-e93b6b603eeb|5/3/7/0/0/15|5/3/7/0/-1/14|5/3/7/0/-1/14|PASS|
|lucifero1966|GRAND PRIX OF SPAIN|e2df7316-a5aa-566e-ae95-4491ea4e70b9|0/4/7/0/0/11|0/4/7/0/-1/10|0/4/7/0/-1/10|PASS|
|dalla.pozza.silvia|GRAND PRIX OF SPAIN|45921e31-65c3-51d2-abcd-1785c59d8e70|0/9/8/0/0/17|0/0/8/0/-1/7|0/0/8/0/-1/7|PASS|
|marino.dilorenzo|GRAND PRIX DE FRANCE|8ba5e5cf-560b-5e92-96ea-d5fb6d37b38f|3/3/11/2/0/19|3/3/11/2/-1/18|3/3/11/2/-1/18|PASS|
|tommaso.strada95|GRAND PRIX DE FRANCE|66320ba5-f9c3-593b-8a70-ff1b0c923753|6/2/0/2/0/10|6/2/0/0/0/8|6/2/0/0/0/8|PASS|
|alandellosbel8|GRAND PRIX DE FRANCE|2d169a63-1f23-5ef7-aee0-85cb39e4d5f8|0/2/4/2/0/8|0/2/4/2/-1/7|0/2/4/2/-1/7|PASS|
|tommaso.strada95|GRAND PRIX OF CATALONIA|bbc97158-67e6-5bc2-95f1-38d847ce6438|0/4/6/0/0/10|0/4/0/0/0/4|0/4/0/0/0/4|PASS|
|dalla.pozza.silvia|GRAND PRIX OF CATALONIA|a80d6fac-140e-532b-9e1e-e6b75afea429|0/0/8/0/0/8|0/0/0/0/0/0|0/0/0/0/0/0|PASS|
|marino.dilorenzo|GRAND PRIX OF CATALONIA|3c763d2d-7544-5a60-a020-b43041031190|5/3/16/1/0/25|5/2/1/2/-5/5|5/2/1/2/-5/5|PASS|
|ivan23dell|GRAND PRIX OF CATALONIA|508e4bf7-a0b4-5d90-a2be-b17297d9ee34|3/1/11/0/0/15|3/1/9/0/-1/12|3/1/9/0/-1/12|PASS|
|marty.bria1996|GRAND PRIX OF CATALONIA|7469b845-a82b-536e-8383-813076fecadc|6/9/8/0/0/23|6/9/3/0/-5/13|6/9/3/0/-5/13|PASS|
|simo.salva92|GRAND PRIX OF CATALONIA|714a658f-8444-5349-8652-0926d97752e5|1/3/8/0/0/12|1/2/3/0/-5/1|1/2/3/0/-5/1|PASS|
|marty.bria1996|GRAND PRIX OF ITALY|41fc7021-5532-575b-9814-37ebf8f1433d|5/2/20/3/0/30|5/2/20/3/0/30|5/2/20/3/0/30|PASS|
|simo.salva92|GRAND PRIX OF ITALY|fd21a338-370d-53ed-9397-e2dca9e4de18|5/0/12/0/0/17|5/0/12/0/0/17|5/0/12/0/0/17|PASS|
|ivan23dell|GRAND PRIX OF ITALY|172c1292-20d9-5752-b3d4-4e1714399c83|0/3/6/0/0/9|0/3/6/0/0/9|0/3/6/0/0/9|PASS|
|tommaso.strada95|GRAND PRIX OF ITALY|fd13442f-c8ed-52b2-b4c0-775127f03b57|1/0/7/0/0/8|1/0/7/0/0/8|1/0/7/0/0/8|PASS|
|marino.dilorenzo|GRAND PRIX OF HUNGARY|0014ec76-bca0-549a-96c0-a29e19de94d1|3/4/10/0/0/17|3/4/10/0/-1/16|3/4/10/0/-1/16|PASS|
|alandellosbel8|GRAND PRIX OF HUNGARY|e0ec1ef5-b6a5-5eb0-af61-a4fef358a379|0/4/10/2/0/16|0/4/10/2/-1/15|0/4/10/2/-1/15|PASS|
|tommaso.strada95|GRAND PRIX OF HUNGARY|5712b709-a7bd-59b6-90f9-755f8fa74867|6/1/6/2/0/15|6/1/6/2/-1/14|6/1/6/2/-1/14|PASS|
|marty.bria1996|GRAND PRIX OF HUNGARY|8336da4e-8667-5600-9b5d-6862dc2186c9|3/6/10/0/0/19|3/6/10/0/-5/14|3/6/10/0/-5/14|PASS|
|simo.salva92|GRAND PRIX OF HUNGARY|48e6098f-7fc2-5054-bc44-3af0f5e61097|5/4/8/0/0/17|5/4/8/0/-5/12|5/4/8/0/-5/12|PASS|
|ivan23dell|GRAND PRIX OF HUNGARY|17096295-2e54-5f4e-a6b8-1a88d3294407|5/0/3/0/0/8|5/0/3/0/-5/3|5/0/3/0/-5/3|PASS|
|lucifero1966|GRAND PRIX OF CZECHIA|425a1555-a95f-59ff-8692-9b2a2a2c79e2|3/4/12/0/0/19|3/4/12/0/0/19|3/4/12/0/0/19|PASS|
|ivan23dell|GRAND PRIX OF CZECHIA|53c8ee16-dd4d-5d27-a426-5c298fa39c12|10/3/2/0/0/15|10/3/2/0/-1/14|10/3/2/0/-1/14|PASS|
|marty.bria1996|GRAND PRIX OF CZECHIA|f14b1914-2be9-5500-ba2d-caeef9e08740|1/1/12/2/0/16|1/1/12/2/0/16|1/1/12/2/0/16|PASS|
|simo.salva92|GRAND PRIX OF CZECHIA|62e85bd7-3494-5be1-8a42-6dfd6a7ddc22|1/4/12/0/0/17|1/4/12/0/0/17|1/4/12/0/0/17|PASS|
|marino.dilorenzo|GRAND PRIX OF THE NETHERLANDS|4098ed9c-8810-5fdc-872a-56f87991891d|1/1/12/0/0/14|1/1/12/0/-1/13|1/1/12/0/-1/13|PASS|
|simo.salva92|GRAND PRIX OF BRAZIL|8db2ad27-5bb1-5162-b627-0fc84ec25aad|0/1/13/4/0/18|0/1/13/4/0/18|0/1/13/4/0/18|PASS|
|ivan23dell|GRAND PRIX DE FRANCE|fa025129-9fb7-57d6-a42c-a8db79a8b260|3/2/7/0/0/12|3/2/7/0/-1/11|3/2/7/0/-1/11|PASS|
|marino.dilorenzo|GRAND PRIX OF CZECHIA|f8ef9830-5b7e-5268-bbd0-c2d43c6101e5|5/4/10/0/0/19|5/4/10/0/-1/18|5/4/10/0/-1/18|PASS|
|simo.salva92|GRAND PRIX OF THE NETHERLANDS|24f6473a-1e64-5faf-94f7-a931e8d043b1|3/0/7/2/0/12|3/0/7/2/-1/11|3/0/7/2/-1/11|PASS|
|marty.bria1996|GRAND PRIX OF THE NETHERLANDS|697368a0-0652-57c0-a2e9-bb028efe3520|5/1/7/0/0/13|5/1/7/0/-1/12|5/1/7/0/-1/12|PASS|
|marino.dilorenzo|GRAND PRIX OF GERMANY|4dc0b9f8-a5b7-5e6c-a2e1-17c7f5d31d8b|10/4/11/0/0/25|10/4/11/0/-1/24|10/4/11/0/-1/24|PASS|
|alessandro.cavasso.1995|GRAND PRIX OF GERMANY|15a33dc8-050f-5e2f-8906-8bb0c39a7d3a|5/4/7/2/0/18|5/4/7/2/-1/17|5/4/7/2/-1/17|PASS|
|simo.salva92|GRAND PRIX OF GERMANY|321fb3ac-a5c1-570f-8f34-63b374869cac|6/5/7/2/0/20|6/5/7/2/-1/19|6/5/7/2/-1/19|PASS|
|marty.bria1996|GRAND PRIX OF GERMANY|3370161c-d8df-5297-a081-626a50d7bbd2|8/4/7/0/0/19|8/4/7/0/-1/18|8/4/7/0/-1/18|PASS|
|simo.salva92|GRAND PRIX OF GREAT BRITAIN|185690e7-f5aa-5b17-9fec-5f39b80f4814|5/6/10/2/0/23|5/6/10/2/-1/22|5/6/10/2/-1/22|PASS|
|marty.bria1996|GRAND PRIX OF GREAT BRITAIN|391520e5-1953-59fd-97dd-675d4bb67fcd|5/4/7/0/0/16|5/4/7/0/-1/15|5/4/7/0/-1/15|PASS|
|lucifero1966|GRAND PRIX OF GREAT BRITAIN|887d7439-11aa-538d-9a2b-a2788085f793|7/0/4/0/0/11|7/0/4/0/-1/10|7/0/4/0/-1/10|PASS|
|lucifero1966|GRAND PRIX OF ARAGON|62893502-8b02-5fd9-af57-dbd55fdf650c|1/3/14/0/0/18|1/3/14/0/-1/17|1/3/14/0/-1/17|PASS|
|ivan23dell|GRAND PRIX OF ARAGON|394de24c-79cb-587e-981b-e73ddd1d42a9|8/1/5/0/0/14|8/1/5/0/0/14|8/1/5/0/0/14|PASS|
|dalla.pozza.silvia|GRAND PRIX OF THAILAND|1a21c835-02f0-5d59-8423-858e67404bbe|2/1/9/0/0/12|2/1/9/0/-1/11|2/1/9/0/-1/11|PASS|
|tommaso.strada95|GRAND PRIX OF THAILAND|e6d60b63-c043-5256-bc4e-a4d8d45b3bfc|2/1/9/0/0/12|2/1/9/0/-1/11|2/1/9/0/-1/11|PASS|
|ivan23dell|GRAND PRIX OF THAILAND|144011fd-73f4-590a-a201-8056b2f9ade0|5/1/7/0/0/13|5/1/7/0/-1/12|5/1/7/0/-1/12|PASS|
|alessandro.cavasso.1995|GRAND PRIX OF THAILAND|31ab9ae6-ad91-51d6-99cc-afe1aabe8964|6/1/11/2/0/20|6/1/11/2/-1/19|6/1/11/2/-1/19|PASS|
|lucifero1966|GRAND PRIX OF THAILAND|526db0a3-d08c-5c4d-a148-08d38cb9828c|5/1/7/0/0/13|5/1/7/0/-1/12|5/1/7/0/-1/12|PASS|
|simo.salva92|GRAND PRIX OF THAILAND|432ea79e-143c-5f34-b54a-62d15a933379|8/3/14/2/0/27|8/3/14/2/-1/26|8/3/14/2/-1/26|PASS|
|marty.bria1996|GRAND PRIX OF THAILAND|45cc290b-0221-52b6-9138-7dabd5808b66|8/3/9/0/0/20|8/3/9/0/-1/19|8/3/9/0/-1/19|PASS|
|Nicholas|GRAND PRIX OF THAILAND|fab3b75d-4409-5cf8-a481-9778219f96c6|8/3/9/2/0/22|8/3/9/2/-1/21|8/3/9/2/-1/21|PASS|
|dalla.pozza.silvia|GRAND PRIX OF BRAZIL|5403b20f-b7ac-5722-b2c2-fe4ef053cf67|0/0/9/0/0/9|0/0/9/0/0/9|0/0/9/0/0/9|PASS|
|tommaso.strada95|GRAND PRIX OF BRAZIL|6fe907e4-ef7b-5743-938c-af9d35dd5cb6|0/2/11/2/0/15|0/2/11/2/0/15|0/2/11/2/0/15|PASS|
|marino.dilorenzo|GRAND PRIX OF BRAZIL|c1f0c3da-0faa-50b3-9ccc-99a0e6c3c835|0/4/10/2/0/16|0/4/10/2/-1/15|0/4/10/2/-1/15|PASS|
|ivan23dell|GRAND PRIX OF BRAZIL|88254d4e-677f-5cce-ab97-1f2be28a4805|0/3/7/0/0/10|0/3/7/0/0/10|0/3/7/0/0/10|PASS|

## Casi obbligatori

|Caso|Prediction ID|Componenti attese|Totale atteso|Totale DB|Esito|
|---|---|---|---|---|---|
|Niky / THAILAND|fab3b75d-4409-5cf8-a481-9778219f96c6|8 + 3 + 10|21|21|FAIL|
|Niky / BRAZIL|911d3e8e-4478-56eb-a496-46298877aa91|—|25|25|PASS|
|Niky / FRANCE|08fedd41-b194-55fd-9163-1e65620fc093|—|18|18|PASS|
|Marty / ITALY|41fc7021-5532-575b-9814-37ebf8f1433d|—|30|30|PASS|
|Marty / CATALONIA|7469b845-a82b-536e-8383-813076fecadc|—|13|13|PASS|
|Simo / THAILAND|432ea79e-143c-5f34-b54a-62d15a933379|—|26|26|PASS|
|Alessandro / SPAIN|a07f1946-4363-534f-ba30-8d77b095673b|—|19|19|PASS|
|Alessandro / GREAT BRITAIN|b7f18f49-1f80-5e61-9883-29acebd3f35e|—|22|22|PASS|

## Controllo Malus Gara per NC

La classificazione NC e il malus corretto sono riletti dalla tabella dry-run del Task 38; non è stata introdotta una nuova interpretazione.
|Prediction ID|NC Task 38|Malus Task 38|Malus DB post|Malus da soglia|Esito|
|---|---|---|---|---|---|
|7830cb54-8d02-5618-9d96-0e7756a5b1a0|2|-1|-1|-1|PASS|
|722b8ed5-c501-5d02-8f50-92a2ed3a1127|2|-1|-1|-1|PASS|
|04eedd26-a8e1-5365-bcb8-2a77a6d5309b|2|-1|-1|-1|PASS|
|143313aa-fe16-533b-9ba9-d0e477618007|3|-5|-5|-5|PASS|
|e2df7316-a5aa-566e-ae95-4491ea4e70b9|2|-1|-1|-1|PASS|
|45921e31-65c3-51d2-abcd-1785c59d8e70|2|-1|-1|-1|PASS|
|8ba5e5cf-560b-5e92-96ea-d5fb6d37b38f|1|-1|-1|-1|PASS|
|66320ba5-f9c3-593b-8a70-ff1b0c923753|0|0|0|0|PASS|
|2d169a63-1f23-5ef7-aee0-85cb39e4d5f8|1|-1|-1|-1|PASS|
|bbc97158-67e6-5bc2-95f1-38d847ce6438|0|0|0|0|PASS|
|a80d6fac-140e-532b-9e1e-e6b75afea429|0|0|0|0|PASS|
|3c763d2d-7544-5a60-a020-b43041031190|3|-5|-5|-5|PASS|
|508e4bf7-a0b4-5d90-a2be-b17297d9ee34|1|-1|-1|-1|PASS|
|7469b845-a82b-536e-8383-813076fecadc|3|-5|-5|-5|PASS|
|714a658f-8444-5349-8652-0926d97752e5|3|-5|-5|-5|PASS|
|0014ec76-bca0-549a-96c0-a29e19de94d1|2|-1|-1|-1|PASS|
|e0ec1ef5-b6a5-5eb0-af61-a4fef358a379|2|-1|-1|-1|PASS|
|5712b709-a7bd-59b6-90f9-755f8fa74867|2|-1|-1|-1|PASS|
|17096295-2e54-5f4e-a6b8-1a88d3294407|4|-5|-5|-5|PASS|
|53c8ee16-dd4d-5d27-a426-5c298fa39c12|1|-1|-1|-1|PASS|
|fa025129-9fb7-57d6-a42c-a8db79a8b260|2|-1|-1|-1|PASS|
|24f6473a-1e64-5faf-94f7-a931e8d043b1|2|-1|-1|-1|PASS|
|697368a0-0652-57c0-a2e9-bb028efe3520|2|-1|-1|-1|PASS|
|4dc0b9f8-a5b7-5e6c-a2e1-17c7f5d31d8b|2|-1|-1|-1|PASS|
|15a33dc8-050f-5e2f-8906-8bb0c39a7d3a|2|-1|-1|-1|PASS|
|321fb3ac-a5c1-570f-8f34-63b374869cac|2|-1|-1|-1|PASS|
|3370161c-d8df-5297-a081-626a50d7bbd2|2|-1|-1|-1|PASS|
|394de24c-79cb-587e-981b-e73ddd1d42a9|0|0|0|0|PASS|
|144011fd-73f4-590a-a201-8056b2f9ade0|2|-1|-1|-1|PASS|
|526db0a3-d08c-5c4d-a148-08d38cb9828c|1|-1|-1|-1|PASS|
|fab3b75d-4409-5cf8-a481-9778219f96c6|2|-1|-1|-1|PASS|

## Verifiche di integrità

- Prediction candidate conformi al totale atteso: **PASS**
- Entry candidate conformi ai punti attesi: **PASS**
- Entry obsolete escluse dal controllo di conformità: **PASS**
- Prediction fuori perimetro invariate: **PASS**
- Prediction partial invariate: **PASS**
- Record Marino / Aragon creati: **NO**
- Schema/RLS/session_results modificati dallo script: **NO**
- Niky / Thailandia = 21: **FAIL**
- Marty / Catalogna = 13: **PASS**
- Errori post-apply: **0**
- Verifica rollback: **PASS**

## Verifica Excel

Tutti i 81 record sono stati confrontati con i valori proposti dal report Task 38. Esiti non conformi: **0**.

## Errori

- Nessun errore.

## Verifiche finali

- Task 38 source verification: **PASS**
- Nessuna prediction partial modificata senza autorizzazione.
- Nessuna nuova prediction o entry creata.
- Nessuna migration, RPC, schema, RLS o risultato ufficiale modificato.
