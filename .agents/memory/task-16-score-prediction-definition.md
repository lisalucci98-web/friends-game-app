---
name: Task 16 score prediction definition recovery
description: Esito del tentativo read-only di recuperare la definizione PostgreSQL reale di score_prediction.
---

# Task #16 — Recupero della definizione reale di `score_prediction`

Data: 21 agosto 2026.

## A. Connessione

### Database interno disponibile

La variabile `DATABASE_URL` è stata verificata con una query read-only di identità:

```text
database: heliumdb
user: postgres
server version: PostgreSQL
```

Questo è il PostgreSQL/Replit interno e non è il database Supabase del progetto FantaMotoGP. Non è stato usato per analizzare `score_prediction`.

### Progetto Supabase

Il progetto Supabase è stato identificato tramite il solo host REST configurato:

```text
wynzzvewvmzmnyvthxtu.supabase.co
```

La connessione Supabase REST/OpenAPI è verificata. Non è invece disponibile una connessione PostgreSQL SQL al progetto Supabase, una CLI Supabase autenticata o un endpoint catalogo SQL esposto tramite REST.

Nessuna credenziale, token, password o API key è stata salvata o riportata.

## B. Firma RPC

Dal catalogo REST Supabase è stata verificata:

```text
public.score_prediction(p_prediction_id uuid)
```

- parametro: `p_prediction_id`
- tipo: `uuid`
- obbligatorio: sì
- default: nessuno osservabile
- tipo di ritorno: non esposto
- volatilità: non disponibile dal catalogo REST
- security mode (`prosecdef`/`SECURITY DEFINER`): non disponibile
- `prokind`: non disponibile
- definizione SQL: non recuperata

Il catalogo OpenAPI espone soltanto una risposta generica `200 OK`, senza schema del risultato.

## C. Definizione SQL

La query prevista dal task:

```sql
SELECT pg_get_functiondef(
  'public.score_prediction(uuid)'::regprocedure
);
```

non è stata eseguita sul database Supabase perché non è disponibile un canale SQL Supabase autorizzato. Non è stata eseguita sul database interno Replit, poiché sarebbe un database diverso e produrrebbe una conclusione non valida.

Risultato:

```text
Corpo SQL recuperato: NO
Motivo: manca una connessione PostgreSQL read-only al progetto Supabase.
```

Non è stato tentato alcun aggiramento tramite endpoint REST non esposti o RPC inventate.

## D. Tabelle e colonne osservabili

Il catalogo REST Supabase espone le seguenti strutture rilevanti:

### `predictions`

```text
id uuid
user_id uuid
grand_prix_id uuid
league_id uuid
qualifying_pole_time numeric
qualifying_points integer
sprint_points integer
race_points integer
bonus_points integer
malus_points integer
total_points integer
created_at timestamptz
updated_at timestamptz
scored_at timestamptz
```

Non sono esposte colonne `qualifying_pole_rider_id` o `race_out_rider_id`.

### `prediction_entries`

```text
id uuid
prediction_id uuid
prediction_type text
position integer
rider_id uuid
predicted_time numeric
created_at timestamptz
points integer
```

I valori effettivi di `prediction_type` per Pole e OUT non sono determinabili: la tabella è vuota.

### `session_results`

```text
id uuid
session_id uuid
rider_id uuid
position integer
points numeric
rider_number integer
total_time text
gap text
average_speed numeric
status text
source_url text
created_at timestamptz
```

### `sessions`

```text
id uuid
grand_prix_id uuid
type text
status text
session_date timestamptz
number integer
created_at timestamptz
```

Il catalogo REST non permette di dichiarare quali tabelle o colonne siano effettivamente utilizzate dal corpo non disponibile di `score_prediction`.

## E. Scoring reale

Non è possibile descrivere formule reali dal codice SQL, perché il corpo della funzione non è stato recuperato.

Non verificabili:

- punti Pole P1/P2/altra posizione;
- punti tempo Pole dentro `score_prediction`;
- punti Sprint;
- punti Gara;
- bonus ordine;
- bonus Top 5;
- bonus per 4 piloti;
- bonus per 3 piloti;
- bonus OUT;
- formula del malus;
- formula del totale;
- scelta fra Q1/Q2;
- scelta fra RAC e RAC2;
- trattamento degli status.

L’unico comportamento separatamente verificato resta `calculate_qualifying_time_points`, tramite i test read-only già presenti nel workspace: 11 casi superati, 0 falliti.

## F. Bonus cumulabili

```text
NON DETERMINABILE
```

Il regolamento `/regolamento` richiede bonus Gara cumulabili. Il comportamento effettivo di `score_prediction` non è osservabile senza la definizione SQL o una risposta verificabile su una prediction esistente.

## G. OUT e malus

### OUT

Il parametro `p_race_out_rider_id uuid` è verificato nella firma di `submit_prediction`, ma non è possibile verificare:

- la colonna o entry in cui viene persistito;
- se `score_prediction` lo legge;
- quali status generino il bonus;
- cosa avvenga se il pilota è classificato;
- cosa avvenga se manca dai risultati;
- se possa coincidere con la Top 5.

Classificazione: **parzialmente verificabile dal contratto di input, non verificabile nello scoring**.

### Malus

Il dataset REST contiene gli status `CLASSIFIED` e `NOT_CLASSIFIED`. Non sono stati osservati `DNF`, `DNS`, `DSQ` o `OUT`.

Non è possibile dedurre dal solo catalogo se:

- `NOT_CLASSIFIED` sia trattato come DNF;
- gli status siano normalizzati;
- l’assenza di un pilota sia conteggiata;
- siano applicate le soglie `-1 / -5 / -10`;
- il malus sia limitato alla Gara.

## H. Idempotenza

```text
UNKNOWN
```

Il codice della funzione non è disponibile e non sono presenti prediction da usare in lettura. Non è quindi possibile stabilire se la funzione:

- aggiorni `predictions`;
- inserisca o aggiorni `prediction_entries`;
- usi `ON CONFLICT`;
- crei duplicati;
- dipenda da trigger;
- sia intrinsecamente idempotente.

`score_prediction` non è stata invocata su prediction reali e non sono state create fixture.

## I. Matrice di confronto

| Regola | Implementazione reale | Regolamento | Stato |
| --- | --- | --- | --- |
| Pole P1 | Corpo SQL non disponibile | 5 | UNKNOWN |
| Pole P2 | Corpo SQL non disponibile | 2 | UNKNOWN |
| Tempo Pole | Funzione dedicata verificata separatamente; integrazione in `score_prediction` ignota | soglie definite | UNKNOWN |
| Sprint esatto | Corpo SQL non disponibile | 3 | UNKNOWN |
| Sprint ±1 | Corpo SQL non disponibile | 1 | UNKNOWN |
| Gara esatta | Corpo SQL non disponibile | 5 | UNKNOWN |
| Gara ±1 in Top 5 | Corpo SQL non disponibile | 3 | UNKNOWN |
| Altro pilota Top 5 | Corpo SQL non disponibile | 1 | UNKNOWN |
| Gara oltre P5 | Corpo SQL non disponibile | 0 | UNKNOWN |
| P5 → P6 | Corpo SQL non disponibile | 0 | UNKNOWN |
| Bonus ordine | Corpo SQL non disponibile | +5 | UNKNOWN |
| Bonus Top 5 | Corpo SQL non disponibile | +2 | UNKNOWN |
| Bonus 4 | Corpo SQL non disponibile | +3 | UNKNOWN |
| Bonus 3 | Corpo SQL non disponibile | +1 | UNKNOWN |
| Bonus cumulabili | Non determinabile | Sì | UNKNOWN |
| OUT | Corpo SQL non disponibile | +2 | UNKNOWN |
| Malus | Corpo SQL non disponibile | regolamento | UNKNOWN |

`FAIL` non è stato assegnato: non è stata osservata alcuna discrepanza dimostrata nel corpo SQL.

## J. Modifiche

```text
Database modificato: NO
RPC modificata: NO
Dati modificati: NO
Prediction create: NO
Fixture create: NO
Migration create: NO
submit_prediction invocata: NO
score_prediction su prediction reale: NO
```

È stato creato esclusivamente questo report documentale:

```text
.agents/memory/task-16-score-prediction-definition.md
```

## Conclusione

Il Task #16 è completato come fase di recupero audit-only con esito:

```text
Definizione reale di public.score_prediction(uuid): NON RECUPERATA
```

La causa è precisa e verificata: il workspace possiede accesso Supabase REST/OpenAPI, ma non una connessione PostgreSQL read-only al progetto Supabase. L’unico accesso SQL disponibile punta a `heliumdb`, il database Replit interno, e non è utilizzabile per questo audit.