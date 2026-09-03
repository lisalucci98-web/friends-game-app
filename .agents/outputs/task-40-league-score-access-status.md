# Task 40 — Stato accesso sicuro ai punteggi nella stessa lega

## Esito

**Bloccato: nessuna policy RLS è stata modificata.**

Il connettore Supabase disponibile espone soltanto PostgREST. La risorsa
`public.pg_policies` non è esposta nello schema REST (`PGRST205`) e non è
disponibile un endpoint SQL read-only. Le migrazioni locali non contengono le
policy correnti né i relativi `USING`, `WITH CHECK` o grant.

Non è quindi sicuro applicare una policy inventata: una condizione errata
potrebbe mantenere il blocco, introdurre ricorsione su `league_members` oppure
esporre prediction di altre leghe.

## Audit dati read-only

Snapshot della lega `TEST01`, stagione 2026, eseguito il 3 settembre 2026 con
sole letture tramite service role non stampato:

| Conteggio | Valore |
|---|---:|
| Membri | 11 |
| GP in stagione | 22 |
| Prediction | 113 |

| Partecipante | `user_id` | Prediction | GP con `total_points` | Somma `total_points` |
|---|---|---:|---:|---:|
| Nicholas | `326a38c8-ee4f-410e-b4e8-35ce104966db` | 14 | 14 | 224 |
| Alessandro | `13f1af08-6dec-4d67-94ee-47bd2a63abb4` | 13 | 13 | 144 |
| Marty | `b16ef69c-3399-4fe5-bcf3-6d2a76508106` | 13 | 13 | 173 |

I valori sopra sono un controllo amministrativo dell’esistenza dei dati e non
una verifica RLS: il service role bypassa le policy.

## Verifiche non eseguibili senza accesso aggiuntivo

- lettura delle policy `SELECT` correnti su `league_members`, `predictions` e
  `prediction_entries`;
- due sessioni utente reali di membri di `TEST01` (Nicholas e Alessandro) più
  un terzo partecipante;
- prova negativa autenticata su una prediction appartenente a un’altra lega.

## Integrità

- policy RLS modificate: **NO**;
- schema modificato: **NO**;
- `predictions` modificate: **NO**;
- `prediction_entries` modificate: **NO**;
- punteggi modificati: **NO**.
