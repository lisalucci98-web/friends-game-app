---
name: Historical Excel row mapping
description: Regole per mappare in modo deterministico gli export Google Sheets alle prediction storiche senza confondere colonne o perimetro.
---

I fogli risultati storici espongono nello stesso header le colonne `1° S`/`2° S`/`3° S` e `1° GP`–`5° GP`: la selezione delle colonne deve essere filtrata per modalità, non solo per posizione numerica.

**Why:** selezionare i primi cinque header numerici mescola Sprint e Gara e produce un totale plausibile ma storicamente errato.

**How to apply:** usare le righe Q/Sprint/Gara per il match del pronostico e il foglio risultati solo per i risultati ufficiali; mantenere separato il perimetro storico canonico dagli extra già classificati, anche se un export più ampio contiene una riga compatibile.