---
name: Task 21 risultati e classifiche
description: Funzionalità implementate per punteggi personali, classifica leghe e dettaglio pronostici con gate di chiusura.
---

# Task 21 — Punteggi, risultati e classifiche

## Funzionalità implementate

- Nuova route protetta `/miei-risultati`.
- La pagina mostra tutti i GP della stagione 2026, inclusi quelli senza pronostico.
- Per ogni pronostico personale sono mostrati:
  - Qualifica
  - Sprint
  - Gara
  - Bonus
  - Malus
  - Totale
- Sono presenti gli stati:
  - `Non compilato`
  - `Pronostico salvato`
  - `In attesa dei risultati`
  - `Punteggio disponibile`
- Il riepilogo personale mostra totale stagione, media dei GP con punteggio e miglior GP.
- La posizione media è indicata come non disponibile perché non esiste una fonte dati attuale per questa metrica.
- `/risultati` continua a rappresentare i risultati ufficiali MotoGP; dalla nuova pagina è disponibile il collegamento esplicito `Risultati MotoGP`.
- `/leghe/:leagueId` ora mostra:
  - contesto reale della lega e codice invito;
  - classifica completa ordinata per punti decrescenti;
  - partecipanti senza pronostico incluso a zero punti;
  - evidenza testuale `Tu` per l’utente corrente;
  - dettaglio selezionabile di ogni partecipante;
  - selezione del GP da analizzare;
  - dettaglio di Qualifica, Sprint, Gara e `OUT` quando autorizzato;
  - ritorno alle leghe e uscita dalla lega, preservando il comportamento esistente.
- Il layout è mobile-first e include stati loading, errore, vuoto, focus visibile e adattamento per schermi stretti.

## Dati e superfici Supabase utilizzati

- `seasons`
- `grand_prix`
- `sessions`
- `league_members`
- `leagues`
- RPC esistente `get_league_members`
- `predictions`
- `prediction_entries`
- `riders`

I punteggi sono letti dalle colonne già presenti in `predictions`: `qualifying_points`, `sprint_points`, `race_points`, `bonus_points`, `malus_points`, `total_points`, `scored_at`. Non viene invocata né modificata la RPC di scoring e non viene ricalcolato alcun punteggio.

## Privacy e visibilità

- La query iniziale della classifica usa esclusivamente colonne di punteggio e metadati; non include pole rider, tempo pole, OUT o entries.
- Il dettaglio di `predictions`, `prediction_entries` e `riders` viene richiesto solo dopo che Qualifica, Sprint e Gara del GP risultano tutte in uno stato chiuso (`FINISHED`, `COMPLETED`, `CLASSIFIED` o `CLOSED`).
- Prima della chiusura il pannello mostra solo lo stato e il messaggio `Pronostico nascosto fino alla chiusura del GP`.
- L’autorizzazione della lega viene verificata con l’appartenenza dell’utente corrente a `league_members`; non sono state introdotte modifiche RLS.
- La validazione completa con due sessioni browser autenticate non è stata possibile nel preview corrente, perché non era disponibile una sessione utente interattiva. Le policy RLS esistenti devono quindi continuare a essere considerate il confine server-side della privacy.

## Limitazioni note

- La posizione media e le variazioni di posizione non sono mostrate perché non sono restituite da una tabella o RPC già disponibile.
- In caso di pari punti viene mantenuta la stessa posizione; non è stato inventato uno spareggio non previsto dai dati.
- La pagina personale usa la lega selezionata come riferimento quando l’utente appartiene a più leghe, evitando di sommare più volte lo stesso GP tra leghe diverse.
- Se un pronostico è chiuso ma `prediction_entries` o i piloti non sono accessibili, il pannello distingue il caso con `Il pronostico è chiuso, ma il dettaglio non è disponibile`.

## Verifiche

- TypeScript dell’app: superato.
- Build Vite con `PORT=21367` e `BASE_PATH=/`: superata.
- `git diff --check`: superato.
- Workflow `artifacts/my-first-app: web`: attivo dopo riavvio.
- Preview landing e route `/miei-risultati` senza sessione: guard di autenticazione renderizzato correttamente.
- Console browser: nessun nuovo errore applicativo.
- La build continua a segnalare solo warning già non bloccanti sulla sourcemap di `tooltip.tsx` e sulla dimensione del chunk JavaScript.