# Design brief — Risultati e classifiche Fanta MotoGP

## Obiettivo

Dare a chi gioca una lettura immediata di due cose: **quanto ha totalizzato** e **dove si trova nella propria lega**. La superficie deve comunicare precisione sportiva, tensione competitiva e affidabilità dei risultati ufficiali, senza trasformarsi in un pannello tecnico.

Il criterio di successo è semplice: appena aperta la pagina, l’utente deve riconoscere il proprio punteggio stagionale, la posizione in classifica e l’ultimo movimento rilevante senza dover interpretare grafici o copiare numeri.

## Direzione visiva

- **Paradigma:** dashboard editoriale “race control”, con un’intestazione forte e blocchi informativi asimmetrici; prima il dato decisivo, poi il contesto.
- **Mood:** motorsport italiano preciso e competitivo, più paddock operativo che intrattenimento rumoroso.
- **Tipografia:** Barlow Condensed per titoli e numeri di posizione, DM Sans per il testo operativo, Space Mono per date, sessioni, etichette e valori comparabili. È la gerarchia già presente nel prodotto.
- **Palette:** fondo grigio freddo caldo alla lettura (`--background`), testo quasi-nero bluastro, rosso Fanta MotoGP come unico accento dominante, pannelli antracite per gli header di gara, superfici card chiare. Evitare bianco/nero assoluti e nuovi colori arbitrari.
- **Segni distintivi:** marchio FM geometrico, etichette uppercase monospazio, linee rosse sottili, angoli contenuti da 4–6 px, ombre nette ma sobrie e texture diagonale/grana già usata nel branding.
- **Motion:** entrata verticale breve dei blocchi; cambio tab e aggiornamento di classifica con transizioni di opacità/trasformazione. Nessun effetto luminoso o animazione che ostacoli la lettura dei numeri.

## Route `/miei-risultati`

### Gerarchia della pagina

1. **Header della pagina**
   - Eyebrow: `Fanta MotoGP · 2026` (o il valore di stagione già disponibile).
   - Titolo display: `I miei risultati`.
   - Sottotitolo concreto: riepilogo dei risultati personali della stagione, senza promessa di dati non presenti.

2. **Hero del punteggio**
   - Un pannello antracite in stile race control.
   - A sinistra: label `Punteggio stagione`.
   - Al centro: totale personale in grande tipografia Barlow Condensed.
   - A destra: `Posizione migliore` o altro riepilogo solo se già restituito dai dati esistenti; non creare metriche calcolate non previste.
   - Evidenziare il dato con contrasto e spazio, non con un grafico decorativo.

3. **Riepilogo per Gran Premio**
   - Lista verticale o tabella responsive ordinata secondo la stagione.
   - Colonne desktop: GP, sessione/risultato disponibile, punti personali disponibili, posizione nella lega se disponibile.
   - Numeri allineati a destra e in Space Mono; nomi GP in DM Sans; round e stato in monospazio uppercase.
   - Il GP più recente può avere un bordo sinistro rosso, non una card speciale invasiva.

4. **Stato di lettura**
   - Distinguere chiaramente dati ufficiali, dati in attesa e sessioni non ancora disponibili usando testo e icone, mai solo colore.
   - Non reinterpretare né duplicare la logica di scoring: mostrare i punteggi così come arrivano dall’applicazione.

### Stati

- **Caricamento:** skeleton delle righe e del blocco totale, con proporzioni simili ai contenuti reali; niente spinner dominante.
- **Errore:** pannello tratteggiato con `Non riusciamo a caricare i tuoi risultati`, messaggio esistente/fornito dal sistema e azione `Riprova`.
- **Vuoto:** composizione editoriale con `Nessun risultato disponibile` e indicazione breve sul fatto che i dati compariranno quando saranno disponibili; nessun dato fittizio.

## Route `/leghe/:leagueId`

### Classifica della lega

1. **Contesto lega**
   - Titolo con il nome reale della lega.
   - Riga secondaria con numero partecipanti e codice invito, mantenendo il pattern già usato nei dettagli lega.
   - Azione `Copia codice` come controllo secondario; conferma testuale `Codice copiato`, senza emoji.

2. **Blocco classifica**
   - Intestazione: `Classifica lega` + stagione.
   - Tabella desktop con: posizione, partecipante, punteggio disponibile e indicatore di stato/variazione solo se già previsto dai dati. Non inventare variazioni, record o classifiche storiche.
   - La riga dell’utente corrente è riconoscibile con fondo appena tintato e linea rossa laterale, oltre a un testo `Tu`, così resta evidente anche senza colore.
   - Prima posizione e podio usano gerarchia tipografica, non medaglie decorative o colori aggiuntivi.

3. **Dettaglio partecipante**
   - Selezionare una riga apre il dettaglio nello stesso contesto, oppure porta a una sezione espandibile accessibile da tastiera.
   - Il dettaglio mostra il pronostico del partecipante per il GP/sessione selezionati soltanto quando la relativa chiusura è avvenuta.
   - Prima della chiusura: sostituire i contenuti con un pannello bloccato, ad esempio `Pronostico nascosto fino alla chiusura della sessione`, usando `LockKeyhole` e senza esporre nomi, posizioni, tempo o altri valori del pronostico.
   - Dopo la chiusura del GP/sessione: rendere leggibile il pronostico effettivamente disponibile, con le stesse etichette già usate nel flusso pronostici (`Qualifiche`, `Sprint`, `Gara`, `Pole`, `Top 5`, `OUT` solo se questi campi sono presenti). Il gate deve dipendere dallo stato di chiusura reale della sessione, non da un timer visivo locale.
   - Se il dato è chiuso ma non ancora disponibile, distinguere `Sessione chiusa` da `Pronostico non disponibile`: non riempire il dettaglio con placeholder che sembrino valori reali.

### Stati

- **Loading:** skeleton dell’header lega, classifica e dettaglio.
- **Errore/non autorizzato/lega non trovata:** messaggio chiaro e azione `Torna alle leghe`.
- **Lega senza partecipanti:** stato vuoto composto, con invito a condividere il codice già presente; nessun partecipante inventato.

## Responsive e accessibilità

- Desktop: griglia larga con hero e classifica; mobile: una sola colonna, con il punteggio sempre sopra la piega e righe partecipante trasformate in card leggibili.
- Mantenere `min-height: 100dvh`, target touch ampi e scroll orizzontale solo come ultima risorsa.
- Usare intestazioni semantiche, `caption`/scope per tabelle, `aria-current` per la lega attiva, `aria-live` per caricamento/errori e focus visibile coerente con l’outline rosso esistente.
- Ogni controllo deve avere un’azione reale; il brief non introduce nuovi endpoint, dati, flussi di scoring o regole oltre a quelli già disponibili nel prodotto.

## Navigazione e tono

La voce principale `Risultati` può diventare il punto di accesso a `I miei risultati`, mentre `Risultati MotoGP` resta la superficie dei risultati ufficiali già esistente. Il tono resta breve, concreto e sportivo: `Classifica lega`, `Punteggio stagione`, `Sessione chiusa`, `Pronostico nascosto`. Niente emoji, slogan generici o terminologia da analytics.