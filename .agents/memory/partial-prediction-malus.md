---
name: Partial prediction malus
description: Come trattare il malus Gara quando una prediction storica è parziale
---

Una prediction parziale può avere un malus Gara autonomo: se i cinque piloti Gara sono presenti e due o più risultano `NOT_CLASSIFIED` nella sessione ufficiale, il malus va calcolato anche se manca lo Sprint o un altro componente del pronostico.

**Why:** il malus dipende dall’intersezione tra i piloti Gara pronosticati e gli OUT ufficiali, non dalla completezza delle altre sezioni della prediction.

**How to apply:** prima di lasciare il malus a zero per una prediction parziale, confrontare sempre gli entry `RACE` con `session_results` della sessione `RAC`; applicare le soglie cumulative NC previste dal regolamento e aggiornare il totale.