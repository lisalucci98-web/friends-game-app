# Task #21 — Analisi pronostici storici Google Sheets

> Report generato in modalità esclusivamente read-only. Il partecipante è indicato solo come `TARGET` per non persistere l’indirizzo email nel repository.

- Stato accesso Google Sheets: **LETTO**
- Foglio analizzato: **ID configurato**
- Record del partecipante trovati: **5**
- Punteggi ricalcolati: **NO**
- Scritture Google Sheets: **NO**
- Scritture Supabase: **NO**

## Riepilogo per GP

| GP | Qualifica | Sprint | Gara | OUT | Totale |
|---|---:|---:|---:|---|---:|
| Aragon | 5 | 5 | 14 | J. Mir | 24 |
| 14 | 5 | 5 | — | — | — |

## Dettaglio

| GP | Sessione | Pronostico | Punteggio storico |
|---|---|---|---:|
| Aragon | Qualifica | Pole: M. Marquez; Tempo: 01:45.128; Time Conversion: 0,166; Score: 5 | 5 |
| Aragon | Sprint | Top: M. Marquez / M. Bezzecchi / A. Marquez; OUT: —; Score: 5 | 5 |
| Aragon | Gara | Top: M. Marquez / A. Marquez / M. Bezzecchi / J. Martin / F. Di Giannantonio; OUT: J. Mir; Score: 14 | 14 |
| 14 | Qualifica | Pole: —; Tempo: —; Time Conversion: —; Score: 5 | 5 |
| 14 | Sprint | Top: — / — / —; OUT: —; Score: 5 | 5 |

## GP/sessioni non determinabili

- Nessuno tra i record trovati.

## Normalizzazione piloti

- Nessuna corrispondenza ambigua rilevata nei record trovati.
- I valori originali restano disponibili nel processo e non vengono sovrascritti dalla rappresentazione normalizzata.

## Confronto con il dataset locale

| GP | Sessione | Valore precedente | Valore Google Sheet | Differenza | Possibile causa |
|---|---|---|---|---|---|
| GP 1 — Gran Bretagna 2026 | Qualifica | Pole: M. Bezzecchi; Tempo: 01:56.354; Time Conversion: —; Score: 3 | non trovato nel Google Sheet | sì | GP/sessione non presenti o non identificabili nel foglio |
| GP 1 — Gran Bretagna 2026 | Sprint | Top: R. Fernandez / A. Ogura / F. Di Giannantonio; OUT: —; Score: 3 | non trovato nel Google Sheet | sì | GP/sessione non presenti o non identificabili nel foglio |
| GP 1 — Gran Bretagna 2026 | Gara | Top: A. Ogura / J. Martin / M. Bezzecchi / R. Fernandez / F. Di Giannantonio; OUT: J. Mir; Score: 12 | non trovato nel Google Sheet | sì | GP/sessione non presenti o non identificabili nel foglio |
| GP 2 — 30/31 MAGGIO 2026 | Qualifica | Pole: F. Di Giannantonio; Tempo: 01:44.247; Time Conversion: —; Score: 1 | non trovato nel Google Sheet | sì | GP/sessione non presenti o non identificabili nel foglio |
| GP 2 — 30/31 MAGGIO 2026 | Sprint | Top: J. Martin / M. Marquez / F. Bagnaia; OUT: —; Score: 1 | non trovato nel Google Sheet | sì | GP/sessione non presenti o non identificabili nel foglio |
| GP 2 — 30/31 MAGGIO 2026 | Gara | Top: M. Bezzecchi / J. Martin / F. Di Giannantonio / R. Fernandez / A. Ogura; OUT: J. Mir; Score: 14 | non trovato nel Google Sheet | sì | GP/sessione non presenti o non identificabili nel foglio |
| GP 3 — 5/7 GIUGNO 2026 | Qualifica | Pole: P. Acosta; Tempo: 01:36.500; Time Conversion: —; Score: 3 | non trovato nel Google Sheet | sì | GP/sessione non presenti o non identificabili nel foglio |
| GP 3 — 5/7 GIUGNO 2026 | Sprint | Top: P. Acosta / M. Marquez / J. Martin; OUT: —; Score: 2 | non trovato nel Google Sheet | sì | GP/sessione non presenti o non identificabili nel foglio |
| GP 3 — 5/7 GIUGNO 2026 | Gara | Top: M. Marquez / P. Acosta / M. Bezzecchi / J. Martin / F. Di Giannantonio; OUT: J. Mir; Score: 11 | non trovato nel Google Sheet | sì | GP/sessione non presenti o non identificabili nel foglio |
| Aragon | Qualifica | non presente nel dataset locale | Pole: M. Marquez; Tempo: 01:45.128; Time Conversion: 0,166; Score: 5 | sì | record Google aggiuntivo o GP/sessione non allineati |
| Aragon | Sprint | non presente nel dataset locale | Top: M. Marquez / M. Bezzecchi / A. Marquez; OUT: —; Score: 5 | sì | record Google aggiuntivo o GP/sessione non allineati |
| Aragon | Gara | non presente nel dataset locale | Top: M. Marquez / A. Marquez / M. Bezzecchi / J. Martin / F. Di Giannantonio; OUT: J. Mir; Score: 14 | sì | record Google aggiuntivo o GP/sessione non allineati |
| 14 | Qualifica | non presente nel dataset locale | Pole: —; Tempo: —; Time Conversion: —; Score: 5 | sì | record Google aggiuntivo o GP/sessione non allineati |
| 14 | Sprint | non presente nel dataset locale | Top: — / — / —; OUT: —; Score: 5 | sì | record Google aggiuntivo o GP/sessione non allineati |

## Verifiche di sicurezza

- Database modificato: **NO**
- RPC modificate: **NO**
- Migration: **NO**
- Prediction create: **NO**
- Dati ufficiali modificati: **NO**
- Scoring modificato: **NO**
- Google Sheet modificato: **NO**
- Credenziali/token stampati o salvati: **NO**

Il passaggio successivo, dopo la verifica del report, potrà essere progettato separatamente. Questo script non contiene alcuna routine di importazione verso Supabase.
