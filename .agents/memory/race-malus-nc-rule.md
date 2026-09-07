---
name: Race malus NC
description: Regola condivisa per contare gli NC della Gara e applicare il malus storico/live.
---

Il malus Gara usa soglie cumulative: 0 NC = 0, 1–2 = -1, 3–4 = -5, almeno 5 = -10. NC è l’intersezione tra i cinque piloti pronosticati per la Gara e la lista ufficiale Out/non classificati; gli NC ufficiali non pronosticati non contano.

**Why:** contare tutti i non classificati della sessione penalizza prediction che non li avevano scelti; usare solo i casi 1/3/5 lascia scoperti i confini 2 e 4.

**How to apply:** condividere la funzione tra gli scorer locali e replicare la stessa semantica nella RPC server-side; non usare blank o piloti assenti dalla Top 5 come NC e non modificare i dati storici senza un dry-run.

Se lo stesso pilota compare sia nella Top 5 Gara sia nell’entry `RACE_OUT`, applicare inoltre il malus separato di **-2** previsto dal regolamento.

**Why:** l’overlap è un’incoerenza del pronostico distinta dal malus per piloti ufficialmente non classificati.

**How to apply:** controllare l’intersezione tra gli ID `RACE` e `RACE_OUT` prima del totale; sommare il malus overlap al malus Gara già calcolato e verificare nuovamente l’autosomma.