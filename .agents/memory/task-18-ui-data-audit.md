---
name: Task 18 UI data audit
description: Audit delle pagine React e delle query Supabase che recuperano pronostici, risultati ufficiali e punteggi.
---

# Task 18 — Audit visualizzazioni e recupero dati

Data: 21 agosto 2026.

## 1. Pagine e componenti analizzati

| File | Route | Componente | Dati visualizzati | Origine |
| --- | --- | --- | --- | --- |
| `artifacts/my-first-app/src/App.tsx` | `/profilo` | `ProfilePage` | profilo utente e sezione pronostici embedded | `profiles`; `PronosticiPage` |
| `artifacts/my-first-app/src/App.tsx` | `/pronostici` | `LegacyPronosticiRedirect` | nessuna UI; redirect a `/profilo` | navigazione locale |
| `artifacts/my-first-app/src/App.tsx` | `/profilo` | `PronosticiPage` | GP, lega, roster, Pole, tempo Pole, Sprint Top 3, Gara Top 5, OUT, deadline | `seasons`, `grand_prix`, `rider_seasons`, `riders`, `league_members`, `leagues`, `sessions`, `predictions`, `prediction_entries` |
| `artifacts/my-first-app/src/App.tsx` | `/risultati` | `ResultsPage` | calendario GP, sessioni Q/Sprint/Gara, classifiche, piloti, team, tempi/gap, status, punti visualizzati | `seasons`, `grand_prix`, `sessions`, `session_results`, `riders`, `rider_seasons`, `teams` |
| `artifacts/my-first-app/src/App.tsx` | `/leghe` | `LeaguesPage` | leghe dell’utente, codice invito, data creazione | `league_members`, `leagues` |
| `artifacts/my-first-app/src/App.tsx` | `/leghe/:leagueId` | `LeagueDetailPage` | dettaglio lega e partecipanti | `leagues`, RPC `get_league_members` |
| `artifacts/my-first-app/src/App.tsx` | `/regolamento` | `RegolamentoPage` | regole statiche, tabelle punti, esempi, formula | costanti JSX; nessun accesso Supabase |
| `artifacts/my-first-app/src/App.tsx` | `/home` | `HomePage` | testo statico | nessun accesso dati |

Non esiste una pagina storico pronostici, classifica fantasy, breakdown punteggi o dettaglio scoring per partecipante.

## 2. Query Supabase individuate

### Profilo

`ProfilePage` esegue:

```text
from('profiles')
select('id, name, created_at')
eq('user_id', user.id)
maybeSingle()
```

Il componente usa `id` per abilitare salvataggio/eliminazione e `name` per il testo del profilo. Il timestamp è richiesto ma non mostrato direttamente nel markup. Le operazioni `update` e `delete` esistono, ma non fanno parte dell’audit di recupero dati.

### Leghe

`LeaguesPage` esegue:

```text
from('league_members')
select('league_id')
eq('user_id', user.id)
```

Poi:

```text
from('leagues')
select('id, name, invite_code, created_at')
.in('id', leagueIds)
.order('created_at', descending)
```

`LeagueDetailPage` esegue:

```text
from('leagues')
select('id, name, invite_code, created_at')
eq('id', leagueId)
.maybeSingle()
```

e:

```text
rpc('get_league_members', { p_league_id: leagueId })
```

Queste query non recuperano prediction, risultati o punteggi.

### Risultati ufficiali

`ResultsPage` carica la stagione:

```text
from('seasons')
select('id, year')
eq('year', 2026)
.maybeSingle()
```

Carica i GP:

```text
from('grand_prix')
select('id, name, short_name, country, circuit, date_start, date_end')
.eq('season_id', seasonRow.id)
.eq('is_test', false)
.order('date_start', ascending)
```

Carica le sessioni:

```text
from('sessions')
select('id, grand_prix_id, type, status, session_date, number')
.in('grand_prix_id', grandPrixIds)
.in('type', ['Q', 'SPR', 'RAC'])
.order('session_date', ascending)
```

Carica i risultati:

```text
from('session_results')
select('session_id, rider_id, rider_number, position, points,
        total_time, gap, average_speed, status')
.in('session_id', sessionIds)
```

Poi arricchisce i risultati con:

```text
from('riders')
select('id, name, surname, nickname')
.in('id', riderIds)
```

```text
from('rider_seasons')
select('rider_id, team_id, number')
.eq('season_id', seasonRow.id)
.in('rider_id', riderIds)
```

```text
from('teams')
select('id, name')
```

Trasformazioni frontend:

- filtra i risultati per la sessione selezionata;
- per Qualifica sceglie la sessione `number = 2` quando disponibile, altrimenti la prima con risultati;
- ordina per posizione;
- separa classificati e non classificati;
- visualizza la prima posizione Q come Pole;
- compone il nome pilota da `riders.name` e `riders.surname`;
- compone il team tramite `rider_seasons.team_id` → `teams.id`;
- mostra `total_time`, `gap`, `average_speed`, status e posizione.

La colonna `session_results.points` viene richiesta dalla query, ma `ResultsRows` mostra per Sprint/Gara il risultato di `resultDisplayPoints`, calcolato localmente con mappe statiche di punti per posizione. Non viene usato il valore server `points`.

### Pronostici

`PronosticiPage` carica:

```text
from('seasons')
select('id, year')
.eq('year', 2026)
.maybeSingle()
```

GP:

```text
from('grand_prix')
select('id, name, short_name, country, circuit, date_start, date_end')
.eq('season_id', seasonRow.id)
.eq('is_test', false)
.order('date_start', ascending)
```

Roster attivo:

```text
from('rider_seasons')
select('rider_id, number')
.eq('season_id', seasonRow.id)
.eq('active', true)
.order('number', ascending)
```

Piloti del roster:

```text
from('riders')
select('id, name, surname, nickname, number')
.in('id', rosterIds)
```

Appartenenze e leghe:

```text
from('league_members')
select('league_id')
.eq('user_id', user.id)
```

```text
from('leagues')
select('id, name, invite_code, created_at')
.in('id', leagueIds)
.order('created_at')
```

Sessioni e deadline:

```text
from('sessions')
select('id, grand_prix_id, type, status, session_date, number')
.in('grand_prix_id', grandPrixIds)
.in('type', ['Q', 'SPR', 'RAC'])
.order('session_date', ascending)
```

Pronostico esistente:

```text
from('predictions')
select('id, grand_prix_id, league_id, qualifying_pole_rider_id,
        qualifying_pole_time, race_out_rider_id, created_at, updated_at')
.eq('user_id', user.id)
.eq('grand_prix_id', selectedGrandPrixId)
.eq('league_id', selectedLeagueId)
.maybeSingle()
```

Entry:

```text
from('prediction_entries')
select('id, prediction_id, prediction_type, position, rider_id, created_at')
.eq('prediction_id', predictionRow.id)
```

Trasformazioni frontend:

- `prediction.qualifying_pole_rider_id` alimenta il pilota Pole;
- `prediction.qualifying_pole_time` viene formattato in `MM:SS.mmm`;
- `prediction.race_out_rider_id` alimenta il pilota OUT;
- entry `prediction_type = 'SPRINT'` e posizioni 1–3 alimentano Sprint;
- entry `prediction_type = 'RACE'` e posizioni 1–5 alimentano Gara;
- le `session_date` delle sessioni Q, SPR e RAC diventano deadline indipendenti;
- il roster selezionabile deriva solo da `rider_seasons.active = true`.

Salvataggio:

```text
rpc('submit_prediction', {
  p_grand_prix_id,
  p_league_id,
  p_qualifying_pole_rider_id,
  p_qualifying_pole_time,
  p_sprint_rider_ids,
  p_race_rider_ids,
  p_race_out_rider_id
})
```

La UI non chiama `score_prediction` e non chiama `calculate_qualifying_time_points`.

## 3. Dati prediction recuperabili dalla UI

| Informazione | Tabella/Fonte | Colonna/API | Recuperabile dalla UI | Note |
| --- | --- | --- | --- | --- |
| Prediction ID | `predictions` | `id` | VERIFIED | richiesto e conservato nello stato |
| GP associato | `predictions` / `grand_prix` | `grand_prix_id`, metadati GP | VERIFIED | selezione e query filtrano per GP |
| Lega associata | `predictions` / `leagues` | `league_id`, nome lega | VERIFIED | selezione e query filtrano per lega |
| Pole rider | `predictions` | `qualifying_pole_rider_id` | VERIFIED nel contratto UI; UNKNOWN nell’esecuzione REST attuale | il frontend lo richiede, ma l’audit REST precedente non esponeva la colonna |
| Tempo Pole | `predictions` | `qualifying_pole_time` | VERIFIED nel contratto UI; UNKNOWN nell’esecuzione REST attuale | viene formattato e convertito da/verso secondi |
| Sprint Top 3 | `prediction_entries` | `prediction_type`, `position`, `rider_id` | VERIFIED nel contratto UI; UNKNOWN con dataset vuoto | mappato su `SPRINT`, posizioni 1–3 |
| Gara Top 5 | `prediction_entries` | `prediction_type`, `position`, `rider_id` | VERIFIED nel contratto UI; UNKNOWN con dataset vuoto | mappato su `RACE`, posizioni 1–5 |
| OUT rider | `predictions` | `race_out_rider_id` | VERIFIED nel contratto UI; UNKNOWN nell’esecuzione REST attuale | il frontend lo richiede, ma la colonna non era esposta nel catalogo precedente |
| Timestamp creazione | `predictions` | `created_at` | VERIFIED come recuperato; non mostrato | presente nella select e nel tipo |
| Timestamp modifica | `predictions` | `updated_at` | VERIFIED come recuperato; non mostrato | presente nella select e nel tipo |
| Punteggio prediction | nessuna query UI | nessuna colonna punti selezionata | UNKNOWN | la UI non carica `qualifying_points`, `sprint_points`, `race_points`, `bonus_points`, `malus_points`, `total_points` |

## 4. Risultati ufficiali recuperabili

| Informazione | Tabella/Fonte | Recuperabile dalla UI | Stato |
| --- | --- | --- | --- |
| GP | `grand_prix` | sì | VERIFIED |
| Sessione | `sessions.id`, `type`, `number` | sì | VERIFIED |
| Sessione Q/Sprint/Gara | `sessions.type` | sì, filtrata a Q/SPR/RAC | VERIFIED |
| Data sessione | `sessions.session_date` | sì | VERIFIED |
| Rider ID | `session_results.rider_id` | sì internamente | VERIFIED |
| Pilota | `riders.name`, `surname`, `nickname` | sì | VERIFIED |
| Numero | `session_results.rider_number` | sì | VERIFIED |
| Posizione | `session_results.position` | sì | VERIFIED |
| Status | `session_results.status` | sì | VERIFIED |
| Tempo totale | `session_results.total_time` | sì | VERIFIED |
| Gap | `session_results.gap` | sì | VERIFIED |
| Velocità media | `session_results.average_speed` | sì | VERIFIED |
| Punti ufficiali riga | `session_results.points` | richiesti ma non usati nel rendering | VERIFIED come query, non come visualizzazione |
| Tempo Pole | prima riga classificata della sessione Q selezionata, `total_time` | sì | INFERRED per il significato Pole; la riga Q è usata come Pole |

Status esplicitamente gestiti dal frontend:

```text
FINISHED, CLASSIFIED, CLASSIFICATO, OK
NOT CLASSIFIED, NOT_CLASSIFIED, NC
DNF, DNS, DSQ, RETIRED, WITHDRAWN
```

Il catalogo/dataset REST osservato negli audit precedenti conteneva effettivamente `CLASSIFIED` e `NOT_CLASSIFIED`; non conteneva righe osservate con `DNF`, `DNS`, `DSQ` o `OUT`.

## 5. Scoring e breakdown

Il frontend:

- non chiama `score_prediction`;
- non chiama `calculate_qualifying_time_points`;
- non riceve un breakdown dal server;
- non carica i campi di punteggio della tabella `predictions`;
- non ricostruisce il totale fantasy;
- non mostra bonus, malus, OUT score o totale prediction;
- mostra nella pagina risultati solo punti di sessione calcolati localmente per posizione.

Le mappe locali sono:

- Sprint: P1–P9 = `12, 9, 7, 6, 5, 4, 3, 2, 1`;
- Gara: P1–P15 = `25, 20, 16, 13, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1`.

Questi sono punti visualizzati nella classifica ufficiale e non costituiscono prova del punteggio FantaMotoGP. Non esiste una query UI per:

```text
qualifying_points
sprint_points
race_points
bonus_points
malus_points
total_points
```

## 6. Storico e classifiche

Non esiste una visualizzazione UI che recuperi, per partecipante:

```text
prediction, Qualifica, Sprint, Gara, bonus, malus, OUT, totale
```

`LeaguesPage` e `LeagueDetailPage` mostrano solo appartenenza, nome, codice, data e membri. Non eseguono query su `predictions` o `prediction_entries`.

## 7. Confronto con Task 15–17

| Informazione | Task 15–17 | Cosa aggiunge la UI | Valutazione |
| --- | --- | --- | --- |
| Prediction ID | nessuna prediction reale osservata | query UI lo seleziona | VERIFIED come codice, non come dato presente |
| Pole rider | colonna non esposta nel catalogo precedente | `predictions.qualifying_pole_rider_id` è richiesta dal frontend | INFERRED/UNKNOWN sul database effettivo |
| Tempo Pole | colonna e parametro già osservati | UI lo formatta | VERIFIED nel contratto UI |
| Sprint/Gara entries | tabella vuota negli audit | UI le richiede e le mappa | VERIFIED come query, UNKNOWN come dati |
| OUT rider | parametro `submit_prediction` osservato; colonna non esposta | UI richiede `race_out_rider_id` | INFERRED/UNKNOWN sul database effettivo |
| Breakdown | non disponibile via REST/OpenAPI | nessun breakdown nella UI | UNKNOWN |
| Score totale | return type RPC non disponibile | nessuna visualizzazione score | UNKNOWN |
| Risultati ufficiali | 786 righe e 177 sessioni osservate | UI recupera e visualizza risultati | VERIFIED come pipeline frontend |
| Body `score_prediction` | non disponibile | nessun riferimento frontend | UNKNOWN |

La UI non rivela informazioni che consentano di recuperare il corpo SQL o di verificare l’implementazione interna di `score_prediction`.

## 8. Contratto finale VERIFIED / INFERRED / UNKNOWN

| Informazione | Valutazione | Motivazione |
| --- | --- | --- |
| Route `/profilo` con pronostici | VERIFIED | route e componente presenti |
| `/pronostici` redirect a `/profilo` | VERIFIED | `LegacyPronosticiRedirect` |
| Route `/risultati` | VERIFIED | `ResultsPage` protetta |
| Query stagionale/GP/sessioni | VERIFIED | query e filtri leggibili nel codice |
| Risultati ufficiali e status | VERIFIED | query e rendering leggibili |
| Punti risultati visualizzati | VERIFIED | calcolo locale leggibile |
| Punteggi fantasy server-side | UNKNOWN | nessuna query o breakdown |
| Pole rider persistito | INFERRED/UNKNOWN | la UI lo richiede, ma il catalogo REST precedente non esponeva la colonna |
| OUT rider persistito | INFERRED/UNKNOWN | stesso limite della colonna OUT |
| Sprint/Gara prediction entries esistenti | UNKNOWN | query presente, dataset precedente vuoto |
| Bonus cumulabili | UNKNOWN | nessun dato o RPC scoring nella UI |
| Malus | UNKNOWN | nessun dato o RPC scoring nella UI |
| Storico punteggi per lega | UNKNOWN | pagina e query assenti |
| Return type `score_prediction` | UNKNOWN | non richiesto né mostrato dalla UI |

## 9. Raccomandazione

Non modificare RPC o privilegi sulla base di questo audit. Il prossimo passo, se autorizzato separatamente, è ottenere una connessione SQL read-only reale al database Supabase o una fonte amministrativa equivalente; solo allora si potranno verificare `pg_proc`, il corpo di `score_prediction`, il return type e le dipendenze effettive.

## 10. Vincoli rispettati

```text
Database modificato: NO
RPC modificata: NO
Migration creata: NO
Schema/RLS/policy modificati: NO
UI modificata: NO
Prediction create: NO
Fixture create: NO
score_prediction eseguita: NO
Query mutative: NO
```