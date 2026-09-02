---
name: Historical scoring apply gate
description: Regole per trasformare il replay storico in un apply sicuro senza confondere snapshot Excel e risultati live.
---

I risultati live non possono sostituire una snapshot storica Excel: un apply è candidabile solo quando prediction, entry complete e fixture ufficiale storica coincidono esattamente. I record partial, extra, mancanti o senza prova storica restano invariati e bloccano l'apply massivo.

**Why:** I risultati correnti possono differire dalla fotografia del weekend storico; usare quel replay per correggere il DB produce aggregati plausibili ma storicamente errati.

**How to apply:** Separare sempre il replay live dal replay della fixture storica nel report. Mostrare entry points e aggregati proposti, ma non scrivere finché tutti i blocker del perimetro non sono risolti.