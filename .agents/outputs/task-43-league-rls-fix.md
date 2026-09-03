# Task 43 — Fix RLS punteggi tra membri della stessa lega

## Stato

**Preparazione locale completata; applicazione remota e test autenticati bloccati.**

La migrazione league-scoped è stata resa completa nel repository, ma non è stata
applicata al progetto Supabase perché la connessione disponibile espone
PostgREST senza un canale SQL/DDL. Il tentativo di ottenere l’accesso
amministrativo aggiuntivo è stato rifiutato. Nessun dato o policy remota è stata
modificata.

## 1. Ispezione prima della modifica

### Repository

La migrazione precedente conteneva:

- una funzione `is_league_score_viewer_2026`;
- policy permissive di SELECT su `predictions` e `prediction_entries`;
- nessuna policy league-scoped per `league_members`;
- nessuna rimozione delle policy SELECT owner-only già presenti.

Il controllo remoto della funzione ha restituito:

```text
HTTP 404
PGRST202: function public.is_league_score_viewer_2026(...) was not found
```

Questo dimostra che la migrazione presente nel repository non risultava
applicata nel progetto Supabase al momento del controllo.

### Frontend

In `artifacts/my-first-app/src/components/Task21Results.tsx` la pagina
`/leghe/:leagueId`:

- usa `league_members` con `league_id + user.id` solo per autorizzare l’utente;
- carica tutti i partecipanti tramite `get_league_members`;
- carica le prediction con `league_id` e gli ID dei membri;
- non applica `.eq('user_id', user.id)` alla query della classifica;
- carica le entry tramite `prediction_id`.

I filtri `user_id = user.id` rimasti nel file appartengono a risultati personali,
salvataggio/modifica dei pronostici, profilo o operazioni di uscita dalla lega;
non sono stati rimossi.

## 2. SQL preparato

File:

```text
supabase/migrations/20260903120000_league_scoped_score_read_access.sql
```

La migrazione ora:

1. verifica l’esistenza delle quattro tabelle previste;
2. verifica le colonne `id`, `league_id`, `user_id` e `prediction_id`;
3. verifica la foreign key `prediction_entries.prediction_id`;
4. interrompe l’esecuzione davanti a policy SELECT restrictive o globali;
5. crea la funzione SECURITY DEFINER per il controllo di membership;
6. mantiene RLS attivo sulle tre tabelle coinvolte;
7. concede solo `SELECT` al ruolo `authenticated`;
8. rimuove esclusivamente le policy SELECT owner-only note e i nomi della
   migrazione precedente;
9. crea le tre policy:

```text
Members can view members of their leagues
Members can view predictions in their leagues
Members can view prediction entries in their leagues
```

Le policy INSERT/UPDATE/DELETE non sono toccate.

## 3. Policy rimosse e create

Policy SELECT rimosse, se presenti:

```text
Users can view their own memberships
Users can view own memberships
Users can view own predictions
predictions_select_own
Users can view own prediction entries
prediction_entries_select_own
league members can read league-scoped prediction scores 2026
league members can read league-scoped prediction entries 2026
```

Policy SELECT create:

```text
Members can view members of their leagues
Members can view predictions in their leagues
Members can view prediction entries in their leagues
```

## 4. Integrità dati

Non è stato possibile eseguire i conteggi Supabase prima/dopo tramite la
connessione disponibile: il proxy REST opera senza una sessione utente utile
per `FantaTest` e non espone SQL amministrativo. La richiesta di accesso
amministrativo aggiuntivo non è stata accettata.

Pertanto i seguenti valori sono **NON VERIFICATI in questa sessione**:

- `COUNT(*)` e `SUM(total_points)` su `predictions`;
- `COUNT(*)` e `SUM(points)` su `prediction_entries`;
- confronto di `total_points`, `qualifying_points`, `sprint_points`,
  `race_points`, `bonus_points` e `malus_points`.

La migrazione non contiene `INSERT`, `UPDATE`, `DELETE`, `TRUNCATE` o modifica
di colonne. Nessun punteggio è stato ricalcolato o modificato.

## 5. Test autenticati

Non eseguiti perché non sono disponibili due sessioni reali di membri di
FantaTest e il canale REST dell’integrazione non permette di impersonare
utenti. Non è stato usato `service_role` per simulare un utente.

Restano da eseguire dopo l’applicazione della migrazione:

- USER_A → tutti i membri, prediction ed entries di FantaTest;
- USER_B → gli stessi risultati di USER_A;
- isolamento verso una lega diversa;
- verifica specifica Nicholas, inclusa Thailandia = `21`;
- conferma che `—`, `Attesa` e i valori numerici restino invariati.

## 6. Sicurezza

- Nessuna policy `USING (true)` viene creata.
- Le nuove policy verificano la membership sulla stessa `league_id`.
- `prediction_entries` segue la prediction collegata.
- Nessun `service_role` è presente nel frontend.
- Le policy di scrittura non vengono modificate.
- La migrazione fallisce prima del DDL se la struttura reale non corrisponde.

## 7. Verifiche locali

- Ricerca filtri frontend: PASS; nessun filtro owner-only nella lettura della
  classifica della lega.
- Verifica funzione remota: PASS; `PGRST202` conferma che la migrazione non è
  stata applicata.
- Database remoto modificato: NO.
- Dati e punteggi modificati: NO.
- Scoring invocato: NO.

Typecheck e build devono essere eseguiti dopo il merge/applicazione locale della
migrazione. Il criterio PASS completo del Task 43 richiede inoltre
l’applicazione reale in Supabase e i test autenticati positivi e negativi.