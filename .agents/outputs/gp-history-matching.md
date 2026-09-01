# Task #16 — Matching storico Google Drive → GP app

> Verifica esclusivamente read-only. Nessuna prediction, GP, scoring, RPC, RLS o foglio Google è stato modificato.

## Esito

- GP storici analizzati: **23**
- GP 2026 restituiti dal calendario app: **22**
- MATCH deterministici: **13**
- REVIEW: **9**
- NOT FOUND: **1**
- Round: **derivato dall’ordine cronologico**, perché non è una colonna esposta da `public.grand_prix` nel codice verificato.

I 13 `MATCH` hanno codice/nome coerente e date sorgente 2026 dentro la finestra del GP app. I 9 `REVIEW` hanno un candidato nominale coerente ma date sorgente 2025: non vengono associati automaticamente alla stagione 2026. Argentina è `NOT FOUND` perché non esiste una riga Argentina nel calendario app 2026.

## Metodo e struttura applicativa

- L’app carica `public.seasons` filtrando `year=2026`, poi `public.grand_prix` filtrando `season_id` e `is_test=false`, ordinando per `date_start`.
- L’identificativo univoco usato dall’app è `public.grand_prix.id` (UUID); la relazione con la stagione è `season_id`.
- Campi usati: `name`, `short_name`, `country`, `circuit`, `date_start`, `date_end`, `status`, oltre a `id` e `season_id`.
- `public.sessions` espone `id`, `grand_prix_id`, `type`, `status`, `session_date`, `number`; è stato usato solo come controllo accessorio.
- Le query/endpoint sono quelli già presenti in `artifacts/my-first-app/src/App.tsx` e `scripts/import-motogp-calendar-2026.mjs`; non è stata introdotta una nuova API.

## Perché il tentativo precedente restituiva zero GP

Sono stati confrontati due percorsi read-only:

1. Il connettore Supabase integrato ha restituito HTTP 200 con `[]` per la stagione 2026, la stagione UUID nota, un campione di `grand_prix` e il filtro `grand_prix` per stagione. Non era un errore di endpoint o di schema, ma un problema di visibilità del contesto/credenziale del connettore. La risposta da sola non permette di distinguere RLS/chiave anon, progetto diverso o dataset non visibile.
2. Il percorso REST già usato dagli script del progetto, con la configurazione Supabase disponibile al processo e solo richieste GET, ha restituito la stagione 2026 e **22 GP**. Questo conferma che i dati esistono nel progetto e che il database locale `DATABASE_URL` non va usato come sostituto: è il PostgreSQL interno del workspace, non il progetto Supabase.

## Mapping completo

| Historical GP | App GP name | App GP ID | Date app | Round | Status | Match reason |
|---|---|---|---|---:|---|---|
| Aragon | GRAND PRIX OF ARAGON | 23b7a561-17e4-4aa6-9be3-2529a5b69938 | 2026-08-28 → 2026-08-30 | 13 | MATCH | Codice breve e nome normalizzato coerenti; tutte le date sorgente 2026 ricadono nella finestra del GP app con tolleranza di ±1 giorno sul weekend. |
| Argentina | — | — | — | — | NOT FOUND | Nessun GP 2026 con questo codice/nome normalizzato nel calendario app. |
| Australia | GRAND PRIX OF AUSTRALIA | c1dea7a7-e35e-4363-9e28-7997e3bc6fbf | 2026-10-23 → 2026-10-25 | 18 | REVIEW | Candidato nominale/codice coerente, ma le date sorgente sono del 2025 e il record app è del 2026: non associare automaticamente stagioni diverse. |
| Austria | GRAND PRIX OF AUSTRIA | e191f3f6-218b-4a1c-bbd2-3ed8b5135683 | 2026-09-18 → 2026-09-20 | 15 | REVIEW | Candidato nominale/codice coerente, ma le date sorgente sono del 2025 e il record app è del 2026: non associare automaticamente stagioni diverse. |
| Brasile | GRAND PRIX OF BRAZIL | 738a8b22-f744-4c75-847b-a2565dce17de | 2026-03-20 → 2026-03-22 | 2 | MATCH | Codice breve e nome normalizzato coerenti; tutte le date sorgente 2026 ricadono nella finestra del GP app con tolleranza di ±1 giorno sul weekend. |
| Catalogna | GRAND PRIX OF CATALONIA | a0251657-afe5-4d90-a66f-d4779babd571 | 2026-05-15 → 2026-05-17 | 6 | MATCH | Codice breve e nome normalizzato coerenti; tutte le date sorgente 2026 ricadono nella finestra del GP app con tolleranza di ±1 giorno sul weekend. |
| FRANCIA | GRAND PRIX DE FRANCE | edcfdba3-7a1f-44f3-8fe8-1f8a6609770c | 2026-05-08 → 2026-05-10 | 5 | MATCH | Codice breve e nome normalizzato coerenti; tutte le date sorgente 2026 ricadono nella finestra del GP app con tolleranza di ±1 giorno sul weekend. |
| Germany | GRAND PRIX OF GERMANY | b26a84f7-2d9b-4cc5-a3e5-3d1abe916d8c | 2026-07-10 → 2026-07-12 | 11 | MATCH | Codice breve e nome normalizzato coerenti; tutte le date sorgente 2026 ricadono nella finestra del GP app con tolleranza di ±1 giorno sul weekend. |
| Giappone | GRAND PRIX OF JAPAN | 5a671255-63ca-46e2-bd60-34134bb063b4 | 2026-10-02 → 2026-10-04 | 16 | REVIEW | Candidato nominale/codice coerente, ma le date sorgente sono del 2025 e il record app è del 2026: non associare automaticamente stagioni diverse. |
| Indonesia | GRAND PRIX OF INDONESIA | 275ca55d-45d3-440f-ad59-17d6b3e6b2d3 | 2026-10-09 → 2026-10-11 | 17 | REVIEW | Candidato nominale/codice coerente, ma le date sorgente sono del 2025 e il record app è del 2026: non associare automaticamente stagioni diverse. |
| Italia | GRAND PRIX OF ITALY | dd266adb-3930-4099-a3d1-a9807362f048 | 2026-05-29 → 2026-05-31 | 7 | MATCH | Codice breve e nome normalizzato coerenti; tutte le date sorgente 2026 ricadono nella finestra del GP app con tolleranza di ±1 giorno sul weekend. |
| Malesia | GRAND PRIX OF MALAYSIA | ea2ba334-b943-462f-aedb-084ac38408d1 | 2026-10-30 → 2026-11-01 | 19 | REVIEW | Candidato nominale/codice coerente, ma le date sorgente sono del 2025 e il record app è del 2026: non associare automaticamente stagioni diverse. |
| Netherlands | GRAND PRIX OF THE NETHERLANDS | 83804cb1-a417-4213-b727-37f84b26d36e | 2026-06-26 → 2026-06-28 | 10 | MATCH | Codice breve e nome normalizzato coerenti; tutte le date sorgente 2026 ricadono nella finestra del GP app con tolleranza di ±1 giorno sul weekend. |
| Portogallo | GRAND PRIX OF PORTUGAL | 4b3882a8-24b2-4321-aa12-d1847c989438 | 2026-11-20 → 2026-11-22 | 21 | REVIEW | Candidato nominale/codice coerente, ma le date sorgente sono del 2025 e il record app è del 2026: non associare automaticamente stagioni diverse. |
| QATAR | GRAND PRIX OF QATAR | 5a880aba-62c4-413c-bb2d-b721683dd064 | 2026-11-06 → 2026-11-08 | 20 | REVIEW | Candidato nominale/codice coerente, ma le date sorgente sono del 2025 e il record app è del 2026: non associare automaticamente stagioni diverse. |
| Repubblica Ceca | GRAND PRIX OF CZECHIA | f9d2e80c-431b-485f-afcf-671950648ad7 | 2026-06-19 → 2026-06-21 | 9 | MATCH | Codice breve e nome normalizzato coerenti; tutte le date sorgente 2026 ricadono nella finestra del GP app con tolleranza di ±1 giorno sul weekend. |
| San Marino | GRAND PRIX OF SAN MARINO | a5881826-ec88-4a41-8e4c-ba58709d4591 | 2026-09-11 → 2026-09-13 | 14 | REVIEW | Candidato nominale/codice coerente, ma le date sorgente sono del 2025 e il record app è del 2026: non associare automaticamente stagioni diverse. |
| SPAGNA | GRAND PRIX OF SPAIN | 506917f4-179d-4e1d-b750-805c15bab8d7 | 2026-04-24 → 2026-04-26 | 4 | MATCH | Codice breve e nome normalizzato coerenti; tutte le date sorgente 2026 ricadono nella finestra del GP app con tolleranza di ±1 giorno sul weekend. |
| Thailandia | GRAND PRIX OF THAILAND | f3fd8ba7-2966-46bd-8687-b92047f5e733 | 2026-02-27 → 2026-03-01 | 1 | MATCH | Codice breve e nome normalizzato coerenti; tutte le date sorgente 2026 ricadono nella finestra del GP app con tolleranza di ±1 giorno sul weekend. |
| UK | GRAND PRIX OF GREAT BRITAIN | 6a16e0cb-ef4b-44b1-92e5-2e958cca0815 | 2026-08-07 → 2026-08-09 | 12 | MATCH | Codice breve e nome normalizzato coerenti; tutte le date sorgente 2026 ricadono nella finestra del GP app con tolleranza di ±1 giorno sul weekend. |
| Ungheria | GRAND PRIX OF HUNGARY | 4bd780c9-9da4-48c6-a69f-ebfd6bf8a425 | 2026-06-05 → 2026-06-07 | 8 | MATCH | Codice breve e nome normalizzato coerenti; tutte le date sorgente 2026 ricadono nella finestra del GP app con tolleranza di ±1 giorno sul weekend. |
| USA | GRAND PRIX OF THE UNITED STATES | 782c929d-faaf-44e2-9d6f-0fde033855be | 2026-03-27 → 2026-03-29 | 3 | MATCH | Codice breve e nome normalizzato coerenti; tutte le date sorgente 2026 ricadono nella finestra del GP app con tolleranza di ±1 giorno sul weekend. |
| Valencia | GRAND PRIX OF VALENCIA | 723031d1-27bd-4467-b59c-4cb8f7e081ab | 2026-11-27 → 2026-11-29 | 22 | REVIEW | Candidato nominale/codice coerente, ma le date sorgente sono del 2025 e il record app è del 2026: non associare automaticamente stagioni diverse. |

## GP 2026 dell’app senza corrispondenza nello storico

Nessuno: tutti i 22 GP app hanno un candidato nominale nello storico. I candidati relativi a date 2025 restano però `REVIEW` e non sono match 2026 certificati.

## Anomalie dello storico preservate

- Brasile — tempo Qualifica non valido.
- Indonesia — Sprint mancante.
- San Marino — tempo Qualifica non valido.
- Qatar — conflitto nei riepiloghi aggregate.
- Thailandia — conflitto nei riepiloghi aggregate.

Queste anomalie riguardano il contenuto dei pronostici e non hanno alterato l’associazione del GP. Il mapping non autorizza né esegue importazioni per i casi `REVIEW`, `NOT FOUND` o con contenuto incompleto/conflittuale.

## Vincoli e sicurezza

- Prediction create/modificate: **NO**
- GP create/modificati: **NO**
- Scoring/RPC/RLS modificati: **NO**
- Google Sheets modificati: **NO**
- Dati ufficiali MotoGP modificati: **NO**
- Token o secret stampati nei log: **NO**
- File prodotti: `.agents/outputs/gp-history-matching.md` e `.agents/outputs/gp-history-mapping.json`

## Nota per l’eventuale import successivo

I 13 `MATCH` sono identificativi tecnicamente associabili al calendario 2026. I 9 `REVIEW` richiedono una decisione esplicita sulla stagione storica 2025 e non devono essere importati nel GP 2026 solo per somiglianza del nome. Argentina non ha un GP 2026 corrispondente.
