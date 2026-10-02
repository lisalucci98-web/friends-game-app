# GP Giappone: attivazione del calcolo automatico

## Stato

Il calendario Supabase contiene già il GP JPN 2026 a Motegi (2–4 ottobre),
Qualifiche Q1/Q2, Sprint e Gara. Gli ID e le date delle sessioni coincidono
con il feed ufficiale consultato. Qualifiche, Sprint e Gara non risultano
ancora concluse nel feed verificato durante la preparazione.

**Le migrazioni qui sotto non sono state applicate al progetto Supabase.**
Il collegamento disponibile offre REST, non un canale per eseguire SQL.
Finché non sono installate, il worker segnala il blocco nei log e riprova,
senza importare risultati o modificare pronostici.

## 1. Installazione SQL

Nell'SQL Editor del progetto Supabase, eseguire in quest'ordine il contenuto di:

1. `supabase/migrations/20260922153000_section_scoped_prediction_save.sql`
2. `supabase/migrations/20261002090000_japan_session_scoring.sql`

La prima migrazione abilita i tre salvataggi indipendenti ed è compatibile
con le colonne punteggio NOT NULL rilevate sul database. Non dipende dalla
migrazione del carry-over, che è un'altra funzionalità.

La seconda abilita **solo JPN 2026**, non ricalcola eventi storici e non
sostituisce la vecchia funzione di scoring usata da altre procedure.
Le nuove funzioni d'importazione e scoring sono riservate al service role.
Le nuove tabelle hanno RLS attiva, senza accesso anonimo o autenticato.

Controllo SQL dopo l'installazione:

```sql
select gp.short_name, s.year, a.enabled
from public.automatic_scoring_events a
join public.grand_prix gp on gp.id = a.grand_prix_id
join public.seasons s on s.id = gp.season_id;

select grand_prix_id, section, scored_at, predictions_scored
from public.prediction_section_runs
order by scored_at desc;
```

È normale che la seconda query sia vuota prima delle classifiche ufficiali.

## 2. Esecuzione continua

Il worker parte insieme all'API Server e controlla il feed ogni due minuti.
La build include gli script dell'importatore; `poppler-utils` è dichiarato
tra le dipendenze di sistema per leggere i PDF.

Per funzionare senza visite, l'API deve essere pubblicata su un processo
continuamente attivo (per esempio Reserved VM). Autoscale può fermarsi
quando non riceve traffico e **non garantisce** l'esecuzione del timer.
La configurazione di pubblicazione non è stata cambiata.

Anche il workspace in sviluppo deve rimanere attivo: l'avvio del workflow
da solo non garantisce i controlli per tutto il weekend.

## Comportamento

- Non calcola punti alla semplice scadenza dei pronostici: aspetta la
  conclusione ufficiale e il PDF verificabile di quella sezione.
- Qualifiche e Sprint non aspettano la Gara.
- Importazione, chiusura sezione, punti delle entry e aggregati sono atomici.
- Un errore annulla l'intera operazione; il ciclo successivo riprova.
- Nessuna entry mancante viene inventata. Una sezione non compilata vale zero.
- Le altre sezioni mantengono i propri punti. Il totale è sempre
  Qualifiche + Sprint + punti posizione Gara + bonus + malus.
- Il fingerprint persistente evita di sommare punti a ogni retry e permette
  di riconoscere correzioni ufficiali. La rimozione di un rider dal PDF,
  rispetto a righe già importate, blocca il processo per revisione.
- Per una Gara interrotta/ripartita, gli OUT si uniscono tra tutte le parti;
  le posizioni sono quelle della classificazione finale.
- Le pagine esistenti leggono i punteggi memorizzati dal server. I totali
  progressivi sono disponibili al ricaricamento; il dettaglio dei pronostici
  altrui rimane nascosto fino alla chiusura dell'intero GP.

## Verifiche

`supabase/tests/session-scoring-fixture.sql` si esegue **esclusivamente su un
PostgreSQL temporaneo vuoto**, mai sul progetto Supabase. Crea uno schema
isolato, applica entrambe le migrazioni e verifica salvataggi indipendenti,
membership, deadline, pronostici parziali, soglie ±0,010 inclusive, Sprint P4
a zero, bonus cumulabili, malus NC e overlap, retry, correzioni, privilegi,
rollback dopo una scrittura e preservazione dello storico.

Dry-run reale senza scritture:

```sh
node scripts/import-motogp-results-2026.mjs --gp JPN --section Q --require-finished
```

Prima della conclusione ufficiale l'uscita non-zero è attesa.
Per una sezione conclusa di un GP storico, il dry-run `--gp ARA --section Q
--require-finished` ha verificato 22 righe ufficiali, senza richiedere gli
altri risultati del weekend e senza scrivere dati.