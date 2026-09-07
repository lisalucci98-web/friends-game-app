---
name: Historical scoring apply gate
description: Regole per trasformare il replay storico in un apply sicuro senza confondere snapshot Excel e risultati live.
---

I risultati live non possono sostituire una snapshot storica Excel: un apply è candidabile solo quando prediction, entry complete e fixture ufficiale storica coincidono esattamente. I record partial, extra, mancanti o senza prova storica restano invariati e bloccano l'apply massivo.

**Why:** I risultati correnti possono differire dalla fotografia del weekend storico; usare quel replay per correggere il DB produce aggregati plausibili ma storicamente errati.

**How to apply:** Separare sempre il replay live dal replay della fixture storica nel report. Mostrare entry points e aggregati proposti, ma non scrivere finché tutti i blocker del perimetro non sono risolti.

Una entry autorizzata ma assente nel database al preflight va classificata come obsoleta
ed esclusa dalle PATCH; questo non invalida l'aggregato della prediction. Un record
presente ma associato a una prediction diversa resta invece un errore bloccante.

**Why:** Le entry possono essere state eliminate dopo la generazione del report; bloccare
l'intero batch lascerebbe non riconciliati aggregati ancora verificabili, mentre accettare
un'associazione diversa potrebbe scrivere sulla prediction sbagliata.

**How to apply:** Completa il preflight di tutte le entry prima di qualsiasi scrittura,
riporta le obsolete separatamente, escludile dalla verifica dei punti e conserva il
rollback per le PATCH effettivamente eseguite.

Per lo Sprint, la fonte dei punti è esclusivamente la Top 3 ufficiale: un pilota
classificato P4 o oltre deve contribuire zero, anche se una fixture contiene la
classifica completa. Prima dell'apply, la somma delle entry Sprint deve coincidere
con `sprint_points` e `total_points` deve essere autosommante.

**Why:** Un confronto non limitato alla Top 3 può assegnare punti a un pilota
fuori podio; verificare solo l'aggregato può lasciare un dettaglio entry incoerente
con il punteggio salvato.

**How to apply:** Mantieni il limite Top 3 nel calcolo e usa un preflight separato
per bloccare mismatch Sprint o totale prima di qualsiasi PATCH, senza escludere le
prediction partial valide.