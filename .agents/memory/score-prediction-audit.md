---
name: Score prediction read-only audit
description: Audit tecnico del contratto Supabase e del confronto con il regolamento FantaMotoGP.
---

# Task 15 — Audit scoring server-side

Data audit: 21 agosto 2026.

## 1. `score_prediction`

**Firma osservabile dal catalogo REST Supabase**

```text
public.score_prediction(p_prediction_id uuid)
```

- Parametri: `p_prediction_id`, tipo `uuid`, obbligatorio.
- Valori di default osservabili: nessuno.
- Risposta HTTP catalogata: `200 OK`.
- Return type: **non esposto dal catalogo OpenAPI/PostgREST**.
- Corpo SQL: **NO**, non disponibile nel workspace né nel catalogo REST.
- Struttura del risultato: **non osservabile** senza una prediction esistente e senza poter dimostrare che l’invocazione sia priva di effetti persistenti.

Il catalogo espone `score_prediction` come RPC, ma la risposta `200` non contiene uno schema di risposta. La sola firma non permette di ricostruire il corpo SQL, i dati letti o i campi restituiti.

## 2. Fonti disponibili

| Fonte | Percorso o endpoint | Informazioni disponibili | Attendibilità |
| --- | --- | --- | --- |
| Catalogo REST Supabase | `GET /rest/v1/` | Firma osservabile delle RPC, colonne esposte e tipi catalogati | Verificata direttamente |
| Migrazione locale | `supabase/migrations/20260820122000_fix_qualifying_time_points.sql` | Definizione locale della sola `calculate_qualifying_time_points` | Verificata dal file, non è `score_prediction` |
| Test RPC | `scripts/test-motogp-scoring-2026.mjs` | Test read-only della funzione Qualifica; chiamata a `score_prediction` solo se viene fornito un ID esterno | Verificata dal codice |
| Frontend | `artifacts/my-first-app/src/App.tsx` | Uso della RPC `submit_prediction`, caricamento di prediction/entry e validazioni UI | Deduzione dal codice |
| Modello storico locale | `scripts/analyze-historical-fantamotogp.mjs` | Scorer diagnostico non applicativo su dati storici | Non prova l’implementazione Supabase |
| Pagina regolamento | `/regolamento` | Riferimento funzionale statico alle regole adottate | Verificata dal codice applicativo |

Non è disponibile una definizione SQL locale di `score_prediction`, uno schema SQL amministrativo, una connessione SQL autorizzata o un tipo generato per il return value dell’RPC.

## 3. RPC correlate osservabili

### `submit_prediction`

La firma osservabile è:

```text
public.submit_prediction(
  p_grand_prix_id uuid,
  p_league_id uuid,
  p_qualifying_pole_rider_id uuid,
  p_qualifying_pole_time numeric,
  p_sprint_rider_ids uuid[],
  p_race_rider_ids uuid[],
  p_race_out_rider_id uuid
)
```

Tutti i sette parametri risultano obbligatori nel catalogo REST. Il catalogo non espone il return type né il corpo SQL.

### `calculate_qualifying_time_points`

La firma osservabile è:

```text
public.calculate_qualifying_time_points(
  p_predicted numeric,
  p_actual numeric
) -> risultato non tipizzato dal catalogo
```

La funzione è definita localmente come `returns integer` nella migrazione non applicata al database Replit. Il test RPC read-only ha eseguito 11 casi: 11 superati, 0 falliti.

## 4. Dati osservabili

### Tabelle

Il catalogo REST espone:

`predictions`

- `id uuid`
- `user_id uuid`
- `grand_prix_id uuid`
- `league_id uuid`
- `qualifying_pole_time numeric`
- `qualifying_points integer`
- `sprint_points integer`
- `race_points integer`
- `bonus_points integer`
- `malus_points integer`
- `total_points integer`
- `created_at`, `updated_at`, `scored_at` timestamp with time zone

Non sono esposte le colonne `qualifying_pole_rider_id` o `race_out_rider_id`.

`prediction_entries`

- `prediction_id uuid`
- `prediction_type text`
- `position integer`
- `rider_id uuid`
- `predicted_time numeric`
- `points integer`
- `id uuid`, `created_at` timestamp with time zone

Il catalogo non documenta quali valori effettivi di `prediction_type` rappresentino Pole o OUT.

`sessions`

- `grand_prix_id uuid`
- `type text`
- `number integer`
- `status text`
- `session_date timestamp with time zone`

I tipi sessione osservati sono `FP`, `PR`, `Q`, `SPR`, `WUP`, `RAC`. Gli status sessione osservati sono `FINISHED` e `NOT-STARTED`.

`session_results`

- `session_id uuid`
- `rider_id uuid`
- `position integer`
- `status text`
- `total_time text`
- `gap text`
- `points numeric`
- `rider_number integer`
- `source_url text`
- `average_speed numeric`
- `id uuid`, `created_at` timestamp with time zone

### Cardinalità osservata

- `predictions`: 0 righe
- `prediction_entries`: 0 righe
- `session_results`: 786 righe
- `sessions`: 177 righe

## 5. Pole, Sprint, Gara e OUT

| Dato | Presente nel contratto | Dove | Stato |
| --- | --- | --- | --- |
| Pilota Pole pronosticato | Parametro presente in `submit_prediction` | `p_qualifying_pole_rider_id` | Verificato nel contratto RPC; persistenza/accesso da `score_prediction` non verificabile |
| Tempo Pole pronosticato | Sì | `predictions.qualifying_pole_time` e `p_qualifying_pole_time` | Colonna e parametro verificati |
| Risultato Pole ufficiale | Indirettamente | `session_results.position`, `rider_id`, sessione `Q` | Dati disponibili, collegamento usato da `score_prediction` non verificabile |
| Tempo Pole ufficiale | Indirettamente | `session_results.total_time` | Colonna verificata; selezione della sessione finale non verificabile |
| Sprint Top 3 | Parametro presente | `p_sprint_rider_ids`, entry con `position`/`rider_id` | Parametro verificato; valori e persistenza non osservabili perché entries vuote |
| Gara Top 5 | Parametro presente | `p_race_rider_ids`, entry con `position`/`rider_id` | Parametro verificato; valori e persistenza non osservabili |
| Pilota OUT | Parametro presente | `p_race_out_rider_id` | Contratto RPC verificato; destinazione dati e accessibilità da `score_prediction` non verificabili |
| Posizione ufficiale | Sì | `session_results.position` | Verificata |
| Status ufficiale | Sì | `session_results.status` | Verificata |

## 6. Audit OUT

**Classificazione: OUT parzialmente verificabile.**

È verificato che `submit_prediction` riceva `p_race_out_rider_id uuid`. Non è verificato dove il valore venga persistito, perché `predictions` e `prediction_entries` sono vuote e il corpo SQL di `submit_prediction` non è disponibile. Non è quindi possibile dimostrare che `score_prediction` possa accedere al riferimento OUT o che applichi `+2` per un non-finisher.

Non è stata proposta né applicata alcuna modifica.

## 7. Audit Pole

**Classificazione: Pole parzialmente verificabile.**

Il tempo pronosticato è osservabile sia come parametro RPC sia come colonna `predictions.qualifying_pole_time`. Il pilota Pole è presente nella firma di `submit_prediction`, ma non come colonna della tabella `predictions` esposta dal catalogo. Il risultato e il tempo ufficiali sono rappresentabili in `session_results`, ma non è osservabile quale sessione venga letta dalla RPC di scoring.

## 8. Status ufficiali

Gli status effettivamente osservati in `session_results` sono:

| Status esatto | Fonte | Significato deducibile |
| --- | --- | --- |
| `CLASSIFIED` | `session_results.status` | Il record è classificato secondo il dataset importato |
| `NOT_CLASSIFIED` | `session_results.status` | Il record non è classificato secondo il dataset importato |

Non sono stati osservati `DNF`, `DNS`, `DSQ` o `OUT` nelle 786 righe lette. Il dataset non consente quindi di dimostrare se tali status siano usati, convertiti o distinti dalla funzione di scoring. Non viene assunta l’equivalenza automatica `NOT_CLASSIFIED = DNF`.

## 9. Confronto con il regolamento

| Area | Regolamento | Implementazione verificata | Stato |
| --- | --- | --- | --- |
| Pole | +5 / +2 / 0 | Input Pole presente nella firma; corpo scoring non disponibile | UNKNOWN |
| Tempo Pole | fasce definite | `calculate_qualifying_time_points` testata con 11/11 casi superati | PASS |
| Sprint | 3 / 1 / 0 | Parametro Top 3 presente; scoring non osservabile | UNKNOWN |
| Gara posizione | 5 / 3 / 1 / 0 | Parametro Top 5 presente; scoring non osservabile | UNKNOWN |
| P5 → P6 | 0 | Nessuna prediction/risposta scoring disponibile | UNKNOWN |
| Bonus ordine | +5 | Corpo scoring non disponibile | UNKNOWN |
| Bonus Top 5 | +2 | Corpo scoring non disponibile | UNKNOWN |
| Bonus 4 piloti | +3 | Corpo scoring non disponibile | UNKNOWN |
| Bonus 3 piloti | +1 | Corpo scoring non disponibile | UNKNOWN |
| Bonus cumulabili | Sì | Cumulabilità non osservabile senza breakdown o corpo SQL | UNKNOWN |
| OUT | +2 | Parametro presente, persistenza e scoring non verificabili | UNKNOWN |
| Malus | -1 / -5 / -10 | Status e corpo scoring insufficienti | UNKNOWN |
| Idempotenza | richiesta | Non testata: non è possibile garantire assenza di effetti persistenti | UNKNOWN |

Non ci sono discrepanze dimostrate tra `score_prediction` e il regolamento; le aree non osservabili restano `UNKNOWN`, non `FAIL`.

## 10. Esecuzione read-only con prediction esistente

Non sono presenti prediction esistenti:

```text
predictions: 0
prediction_entries: 0
```

`score_prediction` non è stata invocata durante questo audit. Il catalogo non dimostra che l’esecuzione sia priva di effetti persistenti o idempotente, e il task vieta la creazione di fixture. Pertanto:

```text
Esecuzione bloccata per impossibilità di garantire assenza di effetti persistenti.
```

## 11. Bloccanti tecnici

1. Il catalogo REST non pubblica il corpo SQL di `score_prediction`.
2. Il catalogo non pubblica il return type o lo schema della risposta.
3. Non esistono prediction/entry esistenti da leggere.
4. `predictions` non espone colonne per il pilota Pole o il pilota OUT.
5. Il catalogo non consente di ricostruire la destinazione dei parametri Pole/OUT di `submit_prediction`.
6. Gli status `DNF`, `DNS`, `DSQ` e `OUT` non sono presenti nei risultati osservati.
7. Non è possibile verificare l’idempotenza senza eseguire la RPC su una prediction reale o su una fixture autorizzata e reversibile.
8. Le policy RLS e i vincoli SQL completi non sono esposti dal catalogo REST; non sono stati dedotti.

## 12. Azioni non eseguite

- Database: **NO MODIFICHE**
- RPC: **NO MODIFICHE**
- Migration: **NO**
- Prediction create: **NO**
- Entry create: **NO**
- Risultati ufficiali modificati: **NO**
- Fixture persistenti: **NO**
- `score_prediction` invocata: **NO durante questo audit**

## Conclusione

**C — Il contratto dati disponibile è insufficiente per verificare responsabilmente alcune parti dello scoring.**

Il tempo Qualifica è verificato con test read-only. Il resto dello scoring è solo parzialmente auditabile: le firme degli input sono osservabili, ma non sono disponibili il corpo SQL, il return type, una prediction da leggere o una prova sicura di idempotenza e assenza di effetti collaterali.