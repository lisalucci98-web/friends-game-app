# Task 42 — Debug RLS / accesso ai punteggi degli altri membri

## Stato

**Diagnosi completata; correzione RLS non applicata.**

Il comportamento osservato con due account — ogni account vede i propri
punteggi ma non quelli degli altri membri della stessa lega — è coerente con
una restrizione server-side sulle letture di `predictions` e/o
`prediction_entries`. Non è stato usato un service role nel frontend e non
sono stati modificati dati, punteggi, schema o RPC di scoring.

Il criterio PASS completo del Task 42 non può essere dichiarato perché in
questa sessione non è disponibile né un canale SQL Supabase per leggere le
policy né una seconda sessione autenticata per verificare il comportamento
cross-account. Applicare una policy senza questi due riscontri sarebbe
insicuro.

## 1. Catena applicativa verificata

La pagina `/leghe/:leagueId` segue questa sequenza:

```text
utente autenticato
  ↓
league_members: verifica league_id + user_id corrente
  ↓
get_league_members(p_league_id): carica tutti i membri autorizzati
  ↓
predictions: filtro per league_id e user_id dei membri
  ↓
predictions.user_id + predictions.grand_prix_id
  ↓
prediction_entries.prediction_id
  ↓
total_points / dettaglio entry
```

La verifica di appartenenza resta necessaria e non è stata rimossa.

## 2. RLS e policy coinvolte

### Risultato del canale Supabase disponibile

L’integrazione Supabase collegata all’ambiente espone soltanto PostgREST e,
nella chiamata effettuata, opera come ruolo anonimo:

| Risorsa | Risposta osservata |
|---|---|
| `league_members` | HTTP 200, array vuoto |
| `predictions` | HTTP 401, PostgreSQL `42501`, `permission denied for table predictions` |
| `prediction_entries` | HTTP 401, PostgreSQL `42501`, `permission denied for table prediction_entries` |
| `get_league_members` | errore `P0001`, `Not authenticated` |

Queste risposte dimostrano che il proxy anonimo non è un test valido per
l’accesso autenticato, ma confermano che non è possibile usare quel canale per
leggere le policy.

### Policy SQL

Non è stato possibile recuperare:

- nomi delle policy;
- ruolo (`anon`, `authenticated`, eventuali ruoli applicativi);
- comando `SELECT/INSERT/UPDATE/DELETE`;
- condizioni `USING`;
- condizioni `WITH CHECK`;
- eventuali riferimenti a `auth.uid()`.

Il database SQL raggiungibile da `DATABASE_URL` è il database Replit
`heliumdb`, non il progetto Supabase, quindi non è stato usato come
sostituto. L’integrazione REST non espone `pg_policies` né un endpoint SQL
autorizzato.

### Interpretazione

Il test reale riportato nel brief è la prova del sintomo: l’insieme visibile
dei punteggi dipende dall’utente autenticato. La causa più probabile è una
policy `SELECT` owner-scoped su `predictions`, eventualmente accompagnata da
una policy analoga su `prediction_entries`.

Il testo esatto della policy però resta **non verificato** in questa sessione;
non viene quindi attribuito un nome o un `USING` inventato.

## 3. Query frontend analizzate

File:

```text
artifacts/my-first-app/src/components/Task21Results.tsx
```

### Verifica appartenenza

La query usa intenzionalmente l’utente corrente:

```ts
supabase
  .from('league_members')
  .select('league_id')
  .eq('league_id', leagueId)
  .eq('user_id', user.id)
  .maybeSingle()
```

Questo filtro è un controllo di autorizzazione, non un filtro dei punteggi,
ed è rimasto.

### Membri della lega

I membri sono caricati dalla RPC:

```ts
supabase.rpc('get_league_members', { p_league_id: leagueId })
```

La sessione autenticata disponibile nel workflow ha restituito gli 11 ID
membro di `TEST01`, quindi la RPC non appare limitata al solo utente corrente.

### Prediction della lega

Il caricamento usa:

```ts
supabase
  .from('predictions')
  .select(leaderboardSelect)
  .eq('league_id', leagueId)
  .in('user_id', memberIds)
```

Non sono presenti:

```text
.eq('user_id', user.id)
.eq('user_id', currentUserId)
```

nel caricamento della lega. `user.id` non viene usato per escludere le
prediction degli altri membri.

### Prediction entries

Il dettaglio usa gli ID delle prediction già caricate:

```ts
supabase
  .from('prediction_entries')
  .select(predictionEntrySelect)
  .in('prediction_id', predictionIds)
```

Non applica un filtro per `user.id`. Se la query delle prediction fosse
autorizzata, la query delle entry richiederebbe comunque una policy
league-scoped coerente.

## 4. Modifica frontend effettuata

È stata resa esplicita l’associazione dei dati in
`Task21Results.tsx`:

- indice composto `user_id:grand_prix_id`;
- mantenimento della prediction più recente in caso di duplicati;
- stesso indice usato da tabella desktop, card mobile e dettaglio;
- nessun filtro aggiuntivo basato sull’utente corrente;
- log `console.debug` solo in sviluppo con membri e prediction caricate.

Questa modifica elimina ambiguità nel mapping UI, ma **non può bypassare una
policy RLS** che non restituisca le righe degli altri membri.

Nessuna policy RLS è stata modificata.

## 5. Dati read-only di TEST01

Lo snapshot read-only già disponibile per `TEST01` contiene 11 membri e 113
prediction. La catena dati lato database è presente per i partecipanti
richiesti:

| Partecipante | user_id | Prediction | GP | Total points |
|---|---|---:|---:|---:|
| Nicholas | `326a38c8-ee4f-410e-b4e8-35ce104966db` | 14 | 14 | 224 |
| Alessandro | `13f1af08-6dec-4d67-94ee-47bd2a63abb4` | 13 | 13 | 144 |
| Marty | `b16ef69c-3399-4fe5-bcf3-6d2a76508106` | 13 | 13 | 173 |
| Simo | `c95634d4-fe7e-4c84-bfba-e57a9d3b1112` | 13 | 13 | 176 |
| Marino | `7d39687f-7ad3-4617-831d-b3302aa3fae6` | 11 | 11 | 149 |

Esempi:

- Nicholas: `BRA = 25`, `THA = 21`, totale 224.
- Alessandro: `BRA = 18`, `GBR = 22`, totale 144.
- Marty: `ITA = 30`, `THA = 19`, totale 173.

Questi dati sono una verifica amministrativa read-only dell’esistenza e dei
valori; non dimostrano che un secondo utente autenticato possa leggerli,
perché il token di quel secondo utente non è disponibile.

## 6. Test autenticati e cross-league

### Nicholas / Alessandro / terzo partecipante

Non è stato possibile completare il test richiesto con due sessioni reali:

- il workflow autenticato disponibile appartiene a `Patatina`;
- `Patatina` non ha prediction in `TEST01`;
- il browser usato dallo screenshot è senza sessione;
- il tentativo di ottenere i secret per un ulteriore accesso è stato
  rifiutato;
- non sono state impersonate identità e non sono state salvate credenziali.

La RPC è stata verificata con la sessione disponibile e restituisce tutti gli
11 membri, ma non è stato possibile dimostrare da quella sessione la lettura
delle prediction appartenenti agli altri user.

### Cross-league

Non è stato eseguito un test cross-league autenticato. La policy candidata
dovrà verificare l’appartenenza del viewer alla stessa `league_id` della
prediction; non deve diventare una policy pubblica o globale.

## 7. Perché la policy non è stata modificata

Una policy sicura dovrebbe consentire `SELECT` solo quando:

```text
auth.uid() appartiene a league_members
e
la prediction appartiene alla stessa league_id
```

Per `prediction_entries` la condizione dovrebbe seguire la relazione
`prediction_entries.prediction_id → predictions.id` e applicare lo stesso
confine di lega.

Prima di applicarla servono il testo delle policy correnti e la conferma delle
FK/grant reali. In particolare, una policy che interroga
`league_members` può interagire con la sua stessa RLS; una modifica alla cieca
potrebbe causare ricorsione, negare anche il proprietario o aprire dati di
altre leghe. Per questo il task si ferma senza una migrazione o una scrittura
SQL non verificata.

## 8. Verifiche finali

- Typecheck: PASS.
- Build Vite con `PORT=21367`: PASS.
- `git diff --check`: PASS.
- Workflow web: operativo dopo la modifica frontend.
- Console browser: nessun errore applicativo nuovo osservato.
- Database modificato: NO.
- `predictions` modificata: NO.
- `prediction_entries` modificata: NO.
- Punteggi o risultati modificati: NO.
- RPC di scoring invocata: NO.
- Service role inserito nel frontend: NO.

## Conclusione

Il frontend non contiene più un filtro owner-only nel caricamento della lega e
la RPC dei membri è corretta. Il sintomo tra due account resta spiegato da
una restrizione RLS sulle letture autenticate, ma il testo delle policy non è
accessibile dal canale disponibile e non è sicuro applicare una nuova policy
senza verificarlo.

Per chiudere il task con criterio PASS servono:

1. accesso SQL Supabase read-only alle policy, oppure una migrazione/policy
   corrente fornita e verificabile;
2. due sessioni autenticate di membri di `TEST01`;
3. un test negativo su una prediction di un’altra lega.
