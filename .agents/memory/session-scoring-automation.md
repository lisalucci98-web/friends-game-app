---
name: Scoring automatico per sezione
description: Intento utente, confine dello storico e requisito di esecuzione continua per lo scoring del weekend.
---

L'utente ha chiesto: «prepara tutto per il gp del giappone, fai in modo che in automatico alla chiusura di ogni sezione Qualifiche, sprint e gp ci sia il calcolo automatico dei punteggi dei pronostici».

Calcolare una sezione quando la sua classifica ufficiale è verificata, senza aspettare la chiusura dell'intero GP e senza creare entry fittizie per le sezioni mancanti. La scadenza per inviare il pronostico non equivale alla disponibilità della classifica.

**Why:** la richiesta riguarda tre aggiornamenti progressivi, non un singolo ricalcolo alla fine della Gara.

**How to apply:** distinguere il calcolo dei totali progressivi dalla privacy delle scelte altrui, che può conservare il gate dell'intero GP. Mantenere il confine dello storico: l'attivazione per un nuovo weekend non autorizza ricalcoli retroattivi.

Importazione ufficiale, chiusura sessione e scoring devono essere un'unica transazione, con retry idempotenti e rollback verificato dopo una scrittura.

**Why:** uno scoring fallito dopo un import separato lascerebbe sessioni chiuse e punteggi non aggiornati; il polling può inoltre avvenire da più istanze.

**How to apply:** non scindere questo confine transazionale e non attestare l'attivazione basandosi solo sui test locali: verificare migrazioni installate e un processo che rimanga attivo senza visite. Autoscale può spegnersi quando inattivo.