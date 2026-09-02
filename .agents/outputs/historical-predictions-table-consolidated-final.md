# Import massivo pronostici storici — report finale

- Stato: **COMPLETATO**
- Sorgente: `attached_assets/Pasted-GP-Utente-Pole-position-tempo-pole-1-sprint-2-sprint-3-_1788342259417.txt`
- Stagione: **2026**
- Lega: **FantaTest** (`TEST01`)

## Dry-run

- Righe analizzate: **139**
- Utenti presenti nella sorgente: **12**
- Utenti trovati: **10**
- Utenti non trovati: **2**
- GP trovati: **14**
- Rider trovati: **24**
- Prediction nuove previste: **94**
- Prediction già esistenti previste allo skip: **17**
- Entry valide previste: **907**
- Duplicati rilevati: **1**

## Risultato finale

- Prediction create: **94**
- Prediction skipped perché già esistenti: **17**
- Prediction modificate: **0**
- Entries create: **907**
- Entries skipped: **1**
- Prediction/entry lasciate incomplete per celle vuote: **nessuna scrittura inventata**
- Punti ricalcolati: **NO**
- RPC di scoring invocate o modificate: **NO**
- Carry-over applicato: **NO**
- Schema, RLS e funzioni di scoring modificati: **NO**
- Risultati ufficiali modificati: **NO**
- Google Sheets modificati: **NO**

## Eccezioni e valori esclusi

### Utenti non trovati

- `davide.bettio.3@gmail.com` — 5 righe
- `mosemilan8@gmail.com` — 5 righe

Non sono stati creati utenti o profili.

### GP non trovati

- Nessuno.

### Rider non trovati

- Nessuno.

### Duplicati

- Riga 140, campo `3 sprint`: `A. Marquez` ripetuto nello stesso pronostico Sprint.
- La seconda cella è stata saltata per rispettare il vincolo database
  `(prediction_id, prediction_type, rider_id)`.

### Tempi

- I tempi `MM:SS:MMM` sono stati normalizzati in `MM:SS.MMM`.
- I tempi sono stati salvati come secondi numerici in `QUALIFYING_TIME`.

## Verifica finale di idempotenza

Un secondo dry-run dopo l’import ha prodotto:

- Prediction nuove: **0**
- Prediction da recuperare: **0**
- Entries nuove: **0**
- Valori esclusi: **0**
- Duplicati rilevati: **0**

Audit read-only finale sugli UUID deterministici:

- Prediction importate presenti: **94**
- Entries importate presenti: **907**
- Chiavi entry duplicate: **0**
- Entry importate con punti diversi da zero: **0**

Nessuna prediction già presente è stata sovrascritta e nessun punteggio è stato ricalcolato.