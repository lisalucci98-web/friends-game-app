# Task 57 — Audit read-only malus Gara delle prediction partial

- Data/ora audit: **2026-09-07T09:04:44.664Z**
- Fonte elenco partial: **.agents/outputs/task-38-excel-db-mapping.md**
- Lega: **FantaTest (TEST01)**
- Modalità: **GET-only**.
- PATCH Supabase eseguite: **0**.
- RPC di scoring invocate: **0**.

## Gate storico

**BLOCCATO — nessuna prediction partial è candidata a modifica.**

Questo audit rende visibile un eventuale malus Gara già calcolabile, ma non autorizza la correzione del malus né del totale. Le prediction partial restano invariate finché non esiste un’autorizzazione storica completa (fixture, entry e aggregati verificabili).

## Riepilogo

- Prediction partial lette dal report: **30**.
- Prediction con 5 entry RACE auditabili: **20**.
- Prediction con RACE incompleta: **10**.
- Prediction senza record DB o sessione RAC ufficiale: **0**.
- Malus DB divergenti dal malus atteso: **0**.
- Totali attesi calcolabili come sola sostituzione del malus: **30**.

Il totale atteso è `qualifying_points + sprint_points + race_points + bonus_points + malus atteso`. È una diagnostica del delta malus, non il punteggio storico autorizzato della prediction partial.

## Audit per prediction partial

|Utente|GP|Prediction ID|Entry RACE|NC|Malus atteso|Malus DB|Totale DB|Totale atteso|Stato|
|---|---|---|---|---|---|---|---|---|---|
|marty.bria1996|FRA|7cd4da5d-d468-5942-a8df-7d6b7e9bdf0b|5|1|-1|-1|11|11|AUDITABLE|
|alessandro.cavasso.1995|FRA|abe4793a-3b72-583b-8f19-12100587b4a2|5|1|-1|-1|12|12|AUDITABLE|
|alandellosbel8|ITA|561cd7b4-938a-54f7-b2dd-1927cbc73e89|5|0|0|0|19|19|AUDITABLE|
|lucifero1966|ITA|2b6ef934-cdd8-5c7d-9e12-f9c9d78800a6|5|0|0|0|11|11|AUDITABLE|
|lucifero1966|HUN|f3f72104-6cf8-55b3-9946-081210fce12c|5|1|-1|-1|11|11|AUDITABLE|
|lucifero1966|NED|a0442551-6fc6-5503-b4a3-521cdc4b536b|5|2|-1|-1|8|8|AUDITABLE|
|alessandro.cavasso.1995|NED|c897309b-b3d4-5649-85b6-b43f19f2f524|5|1|-1|-1|15|15|AUDITABLE|
|lucifero1966|CAT|38c2ce67-9d8f-51ef-a3f1-af58522ae49f|5|2|-1|-1|10|10|AUDITABLE|
|marino.dilorenzo|ITA|a6b55890-6edf-5aab-9a98-2dccf2195fa7|5|0|0|0|12|12|AUDITABLE|
|alessandro.cavasso.1995|ITA|5dbd6e94-b2ec-5cac-b038-8a25401fc6fd|0|0|0|0|3|3|INCOMPLETE_RACE|
|dalla.pozza.silvia|HUN|1eefa24f-5810-5c62-8a06-e8f1be2d166e|5|2|-1|-1|12|12|AUDITABLE|
|dalla.pozza.silvia|NED|8d4c1653-1955-506e-9fb9-342c9f04a359|0|0|0|0|0|0|INCOMPLETE_RACE|
|alandellosbel8|GER|a7cbd148-00e0-5769-8162-0e0b24539827|0|0|0|0|5|5|INCOMPLETE_RACE|
|alandellosbel8|GBR|1ce67839-1416-50e4-aec1-06930f99db68|5|1|-1|-1|8|8|AUDITABLE|
|marino.dilorenzo|GBR|70801d3f-a57b-5b92-84d5-f9f804bc7072|0|0|0|0|2|2|INCOMPLETE_RACE|
|tommaso.strada95|ARA|1a197edc-54c2-5ffe-bd0a-c37dccd4414a|5|0|0|0|14|14|AUDITABLE|
|alessandro.cavasso.1995|ARA|b7545592-7eaf-588a-ab2d-df5225fc4125|0|0|0|0|2|2|INCOMPLETE_RACE|
|marty.bria1996|ARA|d88bfd72-f680-559d-ba42-0d54dd703d56|0|0|0|0|2|2|INCOMPLETE_RACE|
|tommaso.strada95|USA|2282b994-2da0-5ae2-9b23-72a2fa1956b5|0|0|0|0|1|1|INCOMPLETE_RACE|
|dalla.pozza.silvia|ITA|14d2c15b-9560-5880-ac3d-1e0c22cc7ddc|5|0|0|0|16|16|AUDITABLE|
|lucifero1966|GER|b87a3cf5-802f-5a76-8024-6481084de7e2|0|0|0|0|6|6|INCOMPLETE_RACE|
|ivan23dell|GBR|97b81fc0-d4af-573d-b9e5-c66af0b55c27|5|1|-1|-1|7|7|AUDITABLE|
|tommaso.strada95|GBR|36607962-920f-580a-8e08-b9961c74de41|0|0|0|0|7|7|INCOMPLETE_RACE|
|simo.salva92|ARA|6704f3b1-6d0f-5ed3-97f7-2abfad01f499|0|0|0|0|7|7|INCOMPLETE_RACE|
|marino.dilorenzo|THA|2cd7c3e2-d351-5e80-89cf-ee50a610c399|5|1|-1|-1|16|16|AUDITABLE|
|alandellosbel8|THA|448d7329-40ea-52be-a32c-441a495e9d48|5|2|-1|-1|22|22|AUDITABLE|
|alandellosbel8|BRA|009b2b26-e55b-5a70-92c6-3f764bc42481|5|0|0|0|10|10|AUDITABLE|
|lucifero1966|BRA|6a1323bd-099a-554c-b971-47ab2966ae9d|5|0|0|0|15|15|AUDITABLE|
|alandellosbel8|SPA|5e3e09ea-1f16-5365-b832-af75c75ed56d|5|1|-1|-1|13|13|AUDITABLE|
|simo.salva92|FRA|f211335c-abd2-5889-b214-b556ece4f652|5|1|-1|-1|15|15|AUDITABLE|

## Dettaglio NC e differenze

|Prediction ID|Sessione RAC|Rider NC intersecati|Delta malus atteso - DB|Nota|
|---|---|---|---|---|
|7cd4da5d-d468-5942-a8df-7d6b7e9bdf0b|96ba2bb1-dbd2-4d98-9f94-a9eafdde7057|66b78301-5826-4986-b11e-fa68a7bd77a7|0|cinque entry RACE confrontate con sessione RAC ufficiale|
|abe4793a-3b72-583b-8f19-12100587b4a2|96ba2bb1-dbd2-4d98-9f94-a9eafdde7057|66b78301-5826-4986-b11e-fa68a7bd77a7|0|cinque entry RACE confrontate con sessione RAC ufficiale|
|561cd7b4-938a-54f7-b2dd-1927cbc73e89|a3d72de3-e81c-478a-9669-59727f722e4b|—|0|cinque entry RACE confrontate con sessione RAC ufficiale|
|2b6ef934-cdd8-5c7d-9e12-f9c9d78800a6|a3d72de3-e81c-478a-9669-59727f722e4b|—|0|cinque entry RACE confrontate con sessione RAC ufficiale|
|f3f72104-6cf8-55b3-9946-081210fce12c|ab1f4691-ca70-48b6-bcdd-8b513651ad9f|e622ec5b-5ccf-457c-a67f-ec028f0ddf6e|0|cinque entry RACE confrontate con sessione RAC ufficiale|
|a0442551-6fc6-5503-b4a3-521cdc4b536b|795e11c0-a313-4735-9c54-df93d06624b2|e622ec5b-5ccf-457c-a67f-ec028f0ddf6e, 66b78301-5826-4986-b11e-fa68a7bd77a7|0|cinque entry RACE confrontate con sessione RAC ufficiale|
|c897309b-b3d4-5649-85b6-b43f19f2f524|795e11c0-a313-4735-9c54-df93d06624b2|e622ec5b-5ccf-457c-a67f-ec028f0ddf6e|0|cinque entry RACE confrontate con sessione RAC ufficiale|
|38c2ce67-9d8f-51ef-a3f1-af58522ae49f|96d63c76-6917-40e9-9fb7-2261d9d96d57|41195f0f-9817-4a4d-913e-c1fbbb351d9b, 00db2312-15f2-4333-be5c-4bbff9d17aec|0|cinque entry RACE confrontate con sessione RAC ufficiale|
|a6b55890-6edf-5aab-9a98-2dccf2195fa7|a3d72de3-e81c-478a-9669-59727f722e4b|—|0|cinque entry RACE confrontate con sessione RAC ufficiale|
|5dbd6e94-b2ec-5cac-b038-8a25401fc6fd|a3d72de3-e81c-478a-9669-59727f722e4b|—|0|entry RACE presenti: 0/5; malus calcolato solo sugli entry disponibili|
|1eefa24f-5810-5c62-8a06-e8f1be2d166e|ab1f4691-ca70-48b6-bcdd-8b513651ad9f|e622ec5b-5ccf-457c-a67f-ec028f0ddf6e, 5b9af34e-da94-4ca2-9c4c-6be0fc8b1bbc|0|cinque entry RACE confrontate con sessione RAC ufficiale|
|8d4c1653-1955-506e-9fb9-342c9f04a359|795e11c0-a313-4735-9c54-df93d06624b2|—|0|entry RACE presenti: 0/5; malus calcolato solo sugli entry disponibili|
|a7cbd148-00e0-5769-8162-0e0b24539827|5ecc9282-1135-4611-aa64-fe4ecc512cfd|—|0|entry RACE presenti: 0/5; malus calcolato solo sugli entry disponibili|
|1ce67839-1416-50e4-aec1-06930f99db68|cdee8aec-30af-403a-86fd-64316afc60b5|244b6f51-ac33-40ee-876d-9401dc9d1346|0|cinque entry RACE confrontate con sessione RAC ufficiale|
|70801d3f-a57b-5b92-84d5-f9f804bc7072|cdee8aec-30af-403a-86fd-64316afc60b5|—|0|entry RACE presenti: 0/5; malus calcolato solo sugli entry disponibili|
|1a197edc-54c2-5ffe-bd0a-c37dccd4414a|0c6f6ec2-1f96-4b95-b634-54d01a5bf1d2|—|0|cinque entry RACE confrontate con sessione RAC ufficiale|
|b7545592-7eaf-588a-ab2d-df5225fc4125|0c6f6ec2-1f96-4b95-b634-54d01a5bf1d2|—|0|entry RACE presenti: 0/5; malus calcolato solo sugli entry disponibili|
|d88bfd72-f680-559d-ba42-0d54dd703d56|0c6f6ec2-1f96-4b95-b634-54d01a5bf1d2|—|0|entry RACE presenti: 0/5; malus calcolato solo sugli entry disponibili|
|2282b994-2da0-5ae2-9b23-72a2fa1956b5|19db930a-1a51-4dee-9811-2a5e58e36658|—|0|entry RACE presenti: 0/5; malus calcolato solo sugli entry disponibili|
|14d2c15b-9560-5880-ac3d-1e0c22cc7ddc|a3d72de3-e81c-478a-9669-59727f722e4b|—|0|cinque entry RACE confrontate con sessione RAC ufficiale|
|b87a3cf5-802f-5a76-8024-6481084de7e2|5ecc9282-1135-4611-aa64-fe4ecc512cfd|—|0|entry RACE presenti: 0/5; malus calcolato solo sugli entry disponibili|
|97b81fc0-d4af-573d-b9e5-c66af0b55c27|cdee8aec-30af-403a-86fd-64316afc60b5|244b6f51-ac33-40ee-876d-9401dc9d1346|0|cinque entry RACE confrontate con sessione RAC ufficiale|
|36607962-920f-580a-8e08-b9961c74de41|cdee8aec-30af-403a-86fd-64316afc60b5|—|0|entry RACE presenti: 0/5; malus calcolato solo sugli entry disponibili|
|6704f3b1-6d0f-5ed3-97f7-2abfad01f499|0c6f6ec2-1f96-4b95-b634-54d01a5bf1d2|—|0|entry RACE presenti: 0/5; malus calcolato solo sugli entry disponibili|
|2cd7c3e2-d351-5e80-89cf-ee50a610c399|656efa33-5c39-4d93-b8ef-8b669fdbec05|23e50438-a657-4fb0-a190-3262b5472f29|0|cinque entry RACE confrontate con sessione RAC ufficiale|
|448d7329-40ea-52be-a32c-441a495e9d48|656efa33-5c39-4d93-b8ef-8b669fdbec05|23e50438-a657-4fb0-a190-3262b5472f29, 41195f0f-9817-4a4d-913e-c1fbbb351d9b|0|cinque entry RACE confrontate con sessione RAC ufficiale|
|009b2b26-e55b-5a70-92c6-3f764bc42481|59d15875-e818-47a4-996b-f15506292542|—|0|cinque entry RACE confrontate con sessione RAC ufficiale|
|6a1323bd-099a-554c-b971-47ab2966ae9d|59d15875-e818-47a4-996b-f15506292542|—|0|cinque entry RACE confrontate con sessione RAC ufficiale|
|5e3e09ea-1f16-5365-b832-af75c75ed56d|9267e6f1-75da-4e4f-93a3-e67d629744b2|23e50438-a657-4fb0-a190-3262b5472f29|0|cinque entry RACE confrontate con sessione RAC ufficiale|
|f211335c-abd2-5889-b214-b556ece4f652|96ba2bb1-dbd2-4d98-9f94-a9eafdde7057|66b78301-5826-4986-b11e-fa68a7bd77a7|0|cinque entry RACE confrontate con sessione RAC ufficiale|

## Regole applicate

- NC = intersezione tra i rider degli entry `RACE` presenti nelle posizioni 1–5 e i rider con stato NC/OUT nella sessione ufficiale `RAC` chiusa.
- Soglie cumulative: 0 NC = 0; 1–2 NC = -1; 3–4 NC = -5; 5 NC = -10.
- Una prediction con cinque entry `RACE` può quindi avere un malus auditabile anche se mancano Sprint, Pole o Qualifying Time.
- Gli entry RACE mancanti non vengono inventati e non vengono conteggiati come NC.

## Verifica di sicurezza

- Nessuna PATCH eseguita: **PASS**.
- Nessun aggregato scritto: **PASS**.
- Nessuna prediction partial modificata: **PASS**.
- Il blocco dell’apply storico resta esplicito: **PASS**.

