---
name: Excel historical scoring
description: Durable findings from the read-only reverse engineering of the 2026 Google Drive scoring workbooks.
---

Gli export Excel dei GP sono la fonte primaria per il breakdown storico quando il risultato applicativo non coincide: includono formule originali, formule shared/copiate e valori calcolati in cache. La catena osservata include tempo Qualifica, matrici Sprint/Gara, bonus Top 5 cumulativo, OUT `+2` e malus a soglie calcolato sul conteggio dei pronostici trovati nella stringa `Out`.

**Why:** il ricalcolo corrente può usare un risultato ufficiale diverso o campi applicativi incompleti; il totale Excel può quindi essere corretto rispetto allo storico anche quando un replay basato soltanto sui dati applicativi produce un altro valore. I casi Catalogna `13` e Thailandia `21` sono spiegati direttamente dai valori intermedi Excel.

**How to apply:** negli audit futuri conserva separati formula, valore XML in cache, risultato `CLASSIFICA` e ricalcolo indipendente. Non dedurre OUT o malus dal solo numero di `NOT_CLASSIFIED`, e non trattare un `<f>` shared vuoto nei follower XML come una cella senza formula.