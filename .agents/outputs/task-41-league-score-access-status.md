# Task 41 — Accesso ai punteggi nella stessa lega

## Stato

La definizione Supabase è pronta in
`supabase/migrations/20260903120000_league_scoped_score_read_access.sql`, ma
non è stata applicata perché l’integrazione disponibile espone solo
PostgREST. Non esiste un canale SQL autorizzato per eseguire la migrazione o
leggere `pg_policy`; il database Replit locale non è un sostituto del
database Supabase.

La migrazione esegue il preflight delle policy `SELECT` correnti su
`league_members`, `predictions` e `prediction_entries` prima di qualsiasi DDL.
Si interrompe se trova policy `SELECT` restrictive o una policy che consente
incondizionatamente tutte le righe su `predictions`/`prediction_entries`.

## Regola prevista

- abilita RLS su `predictions` e `prediction_entries`;
- concede `SELECT` soltanto al ruolo `authenticated`;
- aggiunge un helper `SECURITY DEFINER` che restituisce solo il booleano di
  membership per la lega richiesta;
- consente a un membro autenticato di leggere prediction della stessa
  `league_id`;
- consente le entry solo quando la prediction collegata appartiene a una lega
  dell’utente autenticato;
- non modifica policy di `league_members`, dati, entry o punteggi;
- non concede accesso al ruolo `anon`.

Il file
`supabase/verification/task-41-policy-and-score-audit.sql` contiene le query
read-only per policy/grant/RLS, conteggi e verifiche positive/negative.

## Baseline amministrativo read-only

Snapshot del 3 settembre 2026 tramite service role, senza scrivere dati:

| Voce | Valore |
|---|---:|
| Lega TEST01 | `23812cc9-8f11-4854-b0fb-7fe81a9823a5` |
| Membri | 11 |
| Prediction | 113 |

| Partecipante | `user_id` | Prediction | GP con total_points | Somma total_points |
|---|---|---:|---:|---:|
| Nicholas | `326a38c8-ee4f-410e-b4e8-35ce104966db` | 14 | 14 | 224 |
| Alessandro | `13f1af08-6dec-4d67-94ee-47bd2a63abb4` | 13 | 13 | 144 |
| Marty | `b16ef69c-3399-4fe5-bcf3-6d2a76508106` | 13 | 13 | 173 |

Il dataset contiene una sola lega (`TEST01`), quindi non c’è una prediction
di un’altra lega su cui eseguire la prova negativa senza creare dati di test.

## Verifiche non eseguibili in questo ambiente

- policy SQL correnti prima dell’applicazione;
- applicazione effettiva della migrazione Supabase;
- sessioni autentiche separate di Nicholas, Alessandro e Marty;
- prova negativa autenticata su una prediction di un’altra lega;
- confronto post-apply dei conteggi tramite sessioni RLS.

Non sono stati modificati punteggi, prediction, entry o schema Supabase.

## Verifiche locali

- `pnpm run typecheck`: PASS
- `PORT=21367 BASE_PATH=/ pnpm --filter @workspace/my-first-app run build`: PASS
- `git diff --check`: PASS