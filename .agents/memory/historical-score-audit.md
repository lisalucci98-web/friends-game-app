---
name: Historical score audit
description: Durable constraints when comparing imported historical totals with current server scoring.
---

I totali GP provenienti da uno storico approvato non sono sufficienti per ricostruire il breakdown corrente: i punteggi delle singole `prediction_entries` possono essere tutti zero mentre gli aggregati della prediction contengono il risultato dello scoring.

**Why:** il metodo storico può avere prodotto un totale con regole o componenti diverse da quelle della RPC attuale; inoltre un import può conservare il tempo Qualifica nell’entry ma lasciare nullo il campo aggregato letto dal percorso di scoring. Senza il corpo SQL della RPC non si deve attribuire la causa interna a una formula precisa.

**How to apply:** durante audit read-only, confrontare separatamente entry, campi aggregati, risultati ufficiali e tabella storica; dichiarare come ipotesi le differenze di Qualifica/OUT/bonus/malus e non inventare punti individuali mancanti. Un fallback del tempo Qualifica è necessario ma non basta: servono anche componenti storiche per i casi non riconciliati. Non dedurre il malus dal solo numero di NC: i fixture storici richiedono residui diversi anche a cardinalità uguale.

L’assenza dell’intero risultato ufficiale di una sessione va distinta da un rider non presente in un risultato disponibile: il primo rende la prediction non valutabile, ma non dimostra che i rider siano mancanti.

**Why:** classificare tutti i rider come assenti quando manca la sessione produce un audit fuorviante e può far sembrare incompleta una fonte ufficiale che non è ancora stata importata.

**How to apply:** genera `missingResults` solo quando esiste il result set ufficiale della sessione corrispondente; usa invece la copertura della sessione per bloccare lo scoring finché i risultati non sono disponibili.