# Task 41 — Debug caricamento punteggi partecipanti nella lega

## Esito

Il database non è stato modificato. Non sono state eseguite `INSERT`, `UPDATE`,
`DELETE`, `UPSERT`, migration o RPC di scoring.

Il caricamento frontend ora mantiene una separazione esplicita tra:

1. controllo di appartenenza dell'utente corrente;
2. caricamento di tutti i membri tramite `get_league_members(p_league_id)`;
3. caricamento dei punteggi della lega;
4. associazione deterministica tramite `predictions.user_id` e
   `predictions.grand_prix_id`.

## Causa individuata

La query diretta a `league_members` non può essere usata come fonte dei
partecipanti: in una sessione autenticata restituisce soltanto l'utente
corrente per effetto della RLS. Questo era il rischio di data loading che
avrebbe ridotto la lega a un solo partecipante.

La RPC esistente è invece il percorso autorizzato per leggere tutti i membri.
Il log della sessione autenticata del workflow ha restituito gli 11 `user_id`
di `TEST01`, inclusi Nicholas, Alessandro, Marty, Simo e Marino.

La precedente struttura di rendering filtrava già i punteggi per
`prediction.user_id === member.user_id`, ma non rendeva esplicito un indice
composito membro/GP. Il codice è stato reso deterministico: ogni prediction
viene indicizzata con `user_id:grand_prix_id`; in caso di duplicati viene
mantenuta la riga più recente.

## File interessato

- `artifacts/my-first-app/src/components/Task21Results.tsx`

## Correzione effettuata

- La membership dell'utente corrente viene usata solo per autorizzare
  l'accesso alla lega.
- Tutti i partecipanti vengono caricati dalla RPC
  `get_league_members`.
- La query dei punteggi è limitata a `league_id` e agli `user_id` dei membri
  restituiti dalla RPC; non usa `auth.uid()` per escludere gli altri.
- La matrice desktop, le card mobile e il dettaglio dei partecipanti usano la
  chiave composta `user_id + grand_prix_id`.
- `prediction_entries` continua a essere collegata tramite
  `prediction_entries.prediction_id`; non viene assunto alcun `user_id` nelle
  entry.
- Gli stati restano invariati:
  - `—` per GP senza prediction;
  - `Attesa` per prediction senza punteggio;
  - numero per punteggio disponibile.
- È presente un log `console.debug` soltanto in sviluppo per controllare
  `currentUserId`, `leagueId`, gli ID membro, gli ID utente delle prediction
  caricate e il conteggio per membro.

## Verifica read-only su TEST01

Snapshot letto dal database senza scritture:

- lega: `FantaTest`, codice `TEST01`;
- membri: 11;
- prediction 2026 nella lega: 113.

| Partecipante | user_id | Prediction | GP con prediction | Totale punti |
|---|---|---:|---:|---:|
| Nicholas | `326a38c8-ee4f-410e-b4e8-35ce104966db` | 14 | 14 | 224 |
| Alessandro | `13f1af08-6dec-4d67-94ee-47bd2a63abb4` | 13 | 13 | 144 |
| Marty | `b16ef69c-3399-4fe5-bcf3-6d2a76508106` | 13 | 13 | 173 |
| Simo | `c95634d4-fe7e-4c84-bfba-e57a9d3b1112` | 13 | 13 | 176 |
| Marino | `7d39687f-7ad3-4617-831d-b3302aa3fae6` | 11 | 11 | 149 |

Esempi della catena verificata:

### Nicholas

`league_members.user_id`
`326a38c8-ee4f-410e-b4e8-35ce104966db`
→ `predictions.user_id` uguale
→ 14 prediction, tra cui `THA = 21`, `BRA = 25`, `RSM = 0`
→ totale 224.

### Alessandro

`league_members.user_id`
`13f1af08-6dec-4d67-94ee-47bd2a63abb4`
→ `predictions.user_id` uguale
→ 13 prediction, tra cui `BRA = 18`, `GBR = 22`, `THA = 19`
→ totale 144.

### Marty

`league_members.user_id`
`b16ef69c-3399-4fe5-bcf3-6d2a76508106`
→ `predictions.user_id` uguale
→ 13 prediction, tra cui `ITA = 30`, `BRA = 13`, `THA = 19`
→ totale 173.

Per ogni riga della matrice il GP viene poi usato nella chiave composta:

```text
member.user_id + grand_prix.id
        ↓
prediction.user_id + prediction.grand_prix_id
        ↓
prediction.id
        ↓
prediction_entries.prediction_id
        ↓
prediction.total_points
```

## Verifica autenticata del workflow

La sessione autenticata disponibile nel workflow è stata usata per verificare
la lega `TEST01`. Il log mostra tutti gli 11 ID membro restituiti dalla RPC,
non soltanto l'utente corrente.

La stessa sessione appartiene all'utente `Patatina`, che nello snapshot
read-only non ha prediction nella lega. Per questo non è stato possibile
usare quella sessione per dimostrare visivamente i punteggi di Nicholas,
Alessandro, Marty, Simo e Marino; non sono state usate credenziali di altri
utenti né è stata creata una nuova sessione.

## Test responsive e regressione

- 1366×768: shell e guard di autenticazione verificati; la pagina protetta
  richiede correttamente l'accesso.
- 1920×1080: stesso esito; nessun errore browser.
- 390×844: shell mobile, menu e bottom navigation verificati; nessun errore
  browser.
- Le card mobile usano lo stesso indice composito della tabella desktop, per
  cui non condividono accidentalmente l'array di punteggi di un altro membro.
- La regressione Nicholas resta coperta dalla stessa relazione
  `user_id + grand_prix_id`; non è stato introdotto alcun filtro esclusivo
  sull'utente corrente.

Una verifica visuale della matrice con un account avente prediction e una
sessione autenticata multi-partecipante resta non eseguibile nel browser
isolato dello screenshot, che viene aperto senza sessione e mostra
correttamente la pagina di login.

## Verifiche finali

- Typecheck: PASS.
- Build Vite con `PORT=21367` e `BASE_PATH=/`: PASS.
- `git diff --check`: PASS.
- Workflow web: operativo.
- Errori browser applicativi nuovi: 0.
- Scritture database: 0.
- Chiamate scoring: 0.
