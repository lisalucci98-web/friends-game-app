# Verifica completa risultati storici di Alessandro

## Esito sintetico

La verifica read-only del database conferma l’import storico:

- Account target: match univoco
- Profilo: `6`
- Lega associata: `FantaTest`
- Prediction: **7**
- Prediction entries: **77**
- Punti totali: **105**
- Duplicati prediction sulla chiave `(user, GP, lega)`: **0**
- Duplicati entry sulla chiave `(prediction, tipo, posizione)`: **0**
- Scritture effettuate durante questa verifica: **NO**
- Import eseguiti durante questa verifica: **NO**

## Risultati per GP

| GP | Prediction | Qualifica | Sprint | Gara | OUT | Totale | Stato |
|---|---|---:|---:|---:|---|---:|---|
| Brasile | PRESENTE · 11 entry | 0 | 6 | 12 | Joan Mir | 18 | DB OK |
| Catalogna | PRESENTE · 11 entry | 6 | 2 | 0 | Joan Mir | 8 | DB OK |
| Repubblica Ceca | PRESENTE · 11 entry | 3 | 3 | 8 | Joan Mir | 14 | DB OK |
| Spagna | PRESENTE · 11 entry | 5 | 3 | 11 | Joan Mir | 19 | DB OK |
| Regno Unito | PRESENTE · 11 entry | 5 | 9 | 8 | Joan Mir | 22 | DB OK |
| Ungheria | PRESENTE · 11 entry | 5 | 1 | 3 | Joan Mir | 9 | DB OK |
| USA | PRESENTE · 11 entry | 3 | 0 | 12 | Joan Mir | 15 | DB OK |

Le 11 entry per GP risultano composte da:

- 1 `QUALIFYING_TIME`
- 1 `POLE`
- 3 `SPRINT`
- 5 `RACE`
- 1 `RACE_OUT`

I campi `points` delle singole entry sono `0`, coerentemente con l’import storico che conserva i punteggi approvati nei campi aggregati della prediction (`qualifying_points`, `sprint_points`, `race_points`, `total_points`) senza inventare una distribuzione individuale.

## Controllo classifica

- Alessandro è presente nella lega `FantaTest`.
- Partecipanti nella lega: **3**.
- Posizione calcolata con la stessa logica del componente UI: **2**.
- Totale mostrato per Alessandro: **105 punti**.
- GP con punteggio incluso: **7**.
- Il totale della classifica include i 105 punti delle 7 prediction: **SÌ**.

La logica privacy presente in `Task21Results` nasconde il dettaglio finché Qualifica, Sprint e Gara non risultano chiuse. Per tutti i 7 GP verificati le sessioni rilevanti risultano chiuse.

## Verifica UI

**Esito: PARZIALE / BLOCCATA DA DISCREPANZA SCHEMA LIVE**

- `/miei-risultati` è una route protetta e, nell’anteprima anonima, mostra correttamente la richiesta di accesso.
- La classifica è implementata nella route `/risultati` tramite il componente `LeagueResultsContent`; `/classifica` non è una route registrata.
- Non è stato possibile completare il caricamento autenticato nell’anteprima senza una sessione browser dell’account target.
- La select usata dal componente UI per caricare le prediction fallisce sul database live con `400 Bad Request` perché mancano:
  - `predictions.qualifying_pole_rider_id`
  - `predictions.race_out_rider_id`
- Le stesse informazioni sono comunque presenti nelle `prediction_entries` (`POLE` e `RACE_OUT`) e sono state verificate read-only.

Di conseguenza i dati storici e la logica di classifica risultano coerenti, ma la visibilità completa della pagina autenticata non può essere dichiarata verificata finché non viene risolta la discrepanza tra lo schema live e il select UI. Nessuna correzione è stata applicata, come richiesto.

## Controlli di non modifica

Non sono stati modificati:

- `predictions`
- `prediction_entries`
- risultati ufficiali
- scoring
- RPC
- RLS
- Google Sheets
- account utente
- dati di altri partecipanti
