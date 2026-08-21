---
name: Task 17 score prediction SQL analysis
description: Verifica dell’integrazione Supabase e limite di accesso SQL/read-only per l’audit di score_prediction.
---

# Task 17 — Accesso SQL read-only e analisi `score_prediction`

Data: 21 agosto 2026.

## Connessione

| Verifica | Esito |
| --- | --- |
| Integrazione Supabase disponibile | YES |
| Integrazione Supabase collegata all’ambiente | YES |
| Canale disponibile | PostgREST REST |
| Connessione PostgreSQL SQL Supabase | NO |
| Database verificato via SQL | NO |
| Utente PostgreSQL verificato via SQL | NO |
| Accesso read-only PostgreSQL verificato | NO |
| Credenziali esposte o salvate | NO |

È stata trovata una connessione Supabase già autorizzata e collegata all’ambiente tramite il sistema di integrazioni Replit. La documentazione della connessione dichiara un proxy PostgREST REST, non una sessione PostgreSQL e non un client SQL.

Il progetto Supabase resta identificato dall’host REST:

```text
wynzzvewvmzmnyvthxtu.supabase.co
```

Per verificare il canale di lettura è stata eseguita soltanto una GET:

```text
GET /rest/v1/predictions?select=id&limit=1
```

Risposta osservata:

```text
HTTP 401
PostgreSQL code: 42501
message: permission denied for table predictions
hint: Grant the required privileges to the current role with: GRANT SELECT ON public.predictions TO anon;
```

La risposta dimostra che il proxy raggiunge Supabase, ma il ruolo corrente non può leggere `public.predictions`. Non è stato eseguito il suggerimento `GRANT`, perché il task vieta modifiche a permessi/RLS/schema e la connessione deve rimanere audit-only.

## RPC

Funzione richiesta:

```text
public.score_prediction(uuid)
```

Metadati disponibili dal precedente catalogo REST/OpenAPI:

| Campo | Valore |
| --- | --- |
| Schema | `public` |
| Nome | `score_prediction` |
| Argomento | `p_prediction_id uuid` |
| Argomenti obbligatori | Sì |
| Default | Nessuno osservabile |
| Return type | Non esposto |
| Linguaggio | Non esposto |
| Volatilità | Non esposta |
| Security mode / `prosecdef` | Non esposto |
| `prokind` | Non esposto |
| Definizione recuperata | NO |

La query prevista:

```sql
SELECT pg_get_functiondef(
  'public.score_prediction(uuid)'::regprocedure
);
```

non è stata eseguita perché non esiste un canale PostgreSQL SQL collegato a Supabase. Il database Replit interno raggiungibile tramite `DATABASE_URL` è `heliumdb` e non è il database del progetto; non è stato usato come sostituto.

## Scoring effettivamente implementato

Il corpo SQL non è accessibile. Di conseguenza non è possibile verificare responsabilmente:

- punti Pole e gestione del pilota Pole;
- tempo Pole, soglie, null ed errori dentro `score_prediction`;
- punti Sprint, assenti e non classificati;
- punti Gara P1–P5 e caso P5 pronosticato → P6 ufficiale;
- piloti oltre P5;
- bonus ordine `+5`;
- bonus Top 5 `+2`;
- bonus 4 piloti;
- bonus 3 piloti;
- cumulabilità dei bonus;
- lettura e valore dell’OUT;
- interazione OUT/Top 5;
- status che generano malus;
- soglie, limite massimo e inclusione dell’OUT nel malus;
- formula finale e ordine di applicazione;
- idempotenza;
- tipo e struttura del valore restituito.

L’unico elemento verificato separatamente resta `calculate_qualifying_time_points`: test read-only già eseguiti, 11 superati e 0 falliti. Questo non dimostra come `score_prediction` integri la funzione.

## Confronto con il regolamento app

| Area | Implementazione reale | Regolamento app | Esito |
| --- | --- | --- | --- |
| Pole | Corpo SQL non disponibile; input presente nella RPC correlata | +5 / +2 | UNKNOWN |
| Tempo Pole | Integrazione in `score_prediction` non osservabile | soglie definite | UNKNOWN |
| Sprint | Corpo SQL non disponibile; input Top 3 presente | 3 / 1 / 0 | UNKNOWN |
| Gara | Corpo SQL non disponibile; input Top 5 presente | 5 / 3 / 1 / 0 | UNKNOWN |
| P5 → P6 | Non verificabile | 0 | UNKNOWN |
| Bonus ordine | Non verificabile | +5 | UNKNOWN |
| Bonus Top 5 | Non verificabile | +2 | UNKNOWN |
| Bonus 4 | Non verificabile | bonus previsto | UNKNOWN |
| Bonus 3 | Non verificabile | bonus previsto | UNKNOWN |
| Bonus cumulabili | Non verificabile | Sì, cumulabili | UNKNOWN |
| OUT | Parametro presente in `submit_prediction`; persistenza/scoring non verificabili | +2 | UNKNOWN |
| Malus | Status e corpo scoring non verificabili | -1 / -5 / -10 | UNKNOWN |
| Totale | Formula non verificabile | Qualifica + Sprint + Gara + Bonus + OUT − Malus | UNKNOWN |

Non è stata dimostrata alcuna discrepanza: le aree non osservabili sono `UNKNOWN`, non `FAIL`.

## Dipendenze dati osservabili

Il catalogo REST precedente esponeva strutture compatibili con:

- `predictions`: `id`, `user_id`, `grand_prix_id`, `league_id`, `qualifying_pole_time`, campi punti e timestamp;
- `prediction_entries`: `prediction_id`, `prediction_type`, `position`, `rider_id`, `predicted_time`, `points`;
- `sessions`: `id`, `grand_prix_id`, `type`, `status`, `session_date`, `number`;
- `session_results`: `session_id`, `rider_id`, `position`, `status`, tempi, gap e dati ufficiali.

Queste sono colonne esposte dal catalogo, non dipendenze dimostrate del corpo di `score_prediction`. Non sono esposte colonne dedicate a `qualifying_pole_rider_id` o `race_out_rider_id` in `predictions`.

Le cardinalità osservate nell’audit precedente erano:

```text
predictions: 0
prediction_entries: 0
session_results: 786
sessions: 177
```

Non sono state create prediction o fixture e `score_prediction` non è stata invocata.

## Bloccanti residui

1. L’integrazione disponibile è REST/PostgREST, non PostgreSQL SQL.
2. Il ruolo corrente non può leggere `public.predictions`; la GET read-only ha restituito `401`/`42501`.
3. Il catalogo REST non espone `pg_proc`, `pg_get_functiondef`, return type, linguaggio, volatilità o security mode.
4. Non è possibile applicare il suggerimento `GRANT SELECT`, perché modificherebbe permessi/RLS.
5. Il corpo SQL e le dipendenze effettive di `score_prediction` restano non verificabili.

## Vincoli rispettati

```text
Database dati modificato: NO
RPC modificata: NO
Schema/RLS/permessi modificati: NO
Migration creata: NO
UI modificata: NO
Prediction creata o modificata: NO
Fixture creata: NO
INSERT/UPDATE/DELETE eseguiti: NO
score_prediction invocata: NO
Credenziali riportate: NO
```

## Conclusione

La connessione Supabase REST è stata collegata e raggiunge il progetto, ma l’accesso SQL read-only richiesto dal Task 17 non è disponibile. Inoltre il ruolo REST corrente non possiede neppure lettura su `public.predictions`. L’analisi della definizione reale e dello scoring deve quindi fermarsi senza ricostruzioni deduttive o modifiche ai permessi.