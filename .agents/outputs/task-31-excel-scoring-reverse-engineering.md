# Task 31 — Reverse engineering dello scoring storico dagli Excel Google Drive

**Data dell’analisi:** 2 settembre 2026  
**Modalità:** esclusivamente read-only  
**Fonte primaria:** export `.xlsx` degli spreadsheet Google Drive usati per i GP 2026  
**Scope:** tutti i file GP 2026 trovati e tutte le 10 righe presenti nella tabella dei casi obbligatori

## 1. Esito sintetico

Gli Excel permettono di ricostruire la catena storica completa: Qualifica, tempo Qualifica, Sprint, Gara, bonus Top 5, OUT, malus e totale `CLASSIFICA`.

Risultati più importanti:

1. Le formule originali sono presenti nei fogli di risposta. I fogli usano due varianti:
   - riferimenti diretti a `Risposte del modulo 4` nei workbook Thailandia e Brasile;
   - riferimenti strutturati alla tabella `Results` negli altri workbook.
2. La formula del bonus è **l’interpretazione A**:
   - `+2` se tutti i cinque piloti pronosticati sono nella Top 5, indipendentemente dall’ordine;
   - `+5`, `+3` o `+1` per rispettivamente 5, 4 o 3 posizioni esatte;
   - `+2` se il pilota indicato come OUT è presente nell’elenco OUT ufficiale.
3. Il malus è esplicitamente:
   - `0` se `L=0`;
   - `−1` se `L` è da 1 a 2;
   - `−5` se `L` è da 3 a 4;
   - `−10` se `L=5`.
4. `L` non conta semplicemente i `NOT_CLASSIFIED` del risultato: conta quanti dei cinque piloti pronosticati per la Gara **sono** trovati nella stringa `Out`, tramite `SEARCH`.
5. Il caso **Niky / Thailandia** è spiegato dall’Excel:
   - Qualifica `8`;
   - Sprint `3`;
   - Gara complessiva nel foglio risposta `10`;
   - totale `21`.
6. Il caso **Marty / Catalogna** è spiegato dall’Excel:
   - Qualifica `6`;
   - Sprint `9`;
   - Gara complessiva `−2`;
   - totale `13`.
7. Il termine finale della formula Gara contiene una condizione senza effetto:
   `IF(ISERROR(SEARCH(...)),0,0)`. In Thailandia il primo argomento contiene anche un riferimento rotto `#REF!`; entrambi i rami restituiscono comunque `0`.
8. I valori nei file sono valori Excel in cache (`<v>`). Il controllo offline riproduce la catena dei valori salvati e il totale `CLASSIFICA`; non è stato eseguito un motore Excel per forzare un ricalcolo completo.

## 2. Vincoli rispettati

Durante l’analisi:

```text
score_prediction eseguita: NO
INSERT/UPDATE/DELETE/UPSERT: NO
Migration applicate: NO
RPC creata o modificata: NO
Prediction modificata: NO
Prediction_entries modificata: NO
Session_results modificati: NO
Schema/RLS modificati: NO
Google Drive/Sheets modificati: NO
```

Sono stati creati soltanto questo report e file temporanei di analisi offline in `/tmp`.

## 3. Inventario dei file 2026

La ricerca Drive aveva restituito 26 spreadsheet complessivi. Nel perimetro 2026 sono stati identificati 16 file pertinenti:

- 14 workbook di GP;
- `CLASSIFICA`;
- `Pronostici 2026`.

I file GP sono stati esportati in `/tmp/fantamotogp-<slug>.xlsx` senza sovrascrivere file del progetto. Nel materiale esportato non è disponibile una revisione Drive numerata o una data di versione del file; le date nelle colonne `A` sono timestamp delle risposte o dei risultati, non revisioni del workbook. Non sono state selezionate revisioni alternative arbitrariamente: è stata analizzata una copia export per ciascun file GP pertinente trovato.

| GP | File export analizzato | Fogli | Formule nei fogli scoring `Q/S/GP/CLASSIFICA` | Tabelle principali |
|---|---|---:|---:|---|
| Thailandia | `fantamotogp-thailandia.xlsx` | 6 | 20 / 8 / 50 / 88 | `Form_Responses`, `Form_Responses2`, `Form_Responses4`, `Form_Responses5`, `GP_THAILANDIA` |
| Brasile | `fantamotogp-brasile.xlsx` | 6 | 20 / 13 / 50 / 79 | `Form_Responses`, `Form_Responses2`, `Form_Responses4`, `Form_Responses5`, `GP_Brasile`, `Table_1` |
| USA | `fantamotogp-usa.xlsx` | 6 | 24 / 13 / 67 / 80 | `Q`, `Sprint`, `GP`, `Results`, `GP_THAILANDIA` |
| Qatar | `fantamotogp-qatar.xlsx` | 6 | 18 / 10 / 60 / 98 | `Q`, `Sprint`, `GP`, `Results`, `GP_THAILANDIA` |
| Spagna | `fantamotogp-spagna.xlsx` | 6 | 22 / 13 / 65 / 85 | `Q`, `Sprint`, `GP`, `Results`, `GP_SPAGNA` |
| Francia | `fantamotogp-francia.xlsx` | 6 | 18 / 11 / 60 / 80 | `Q`, `Sprint`, `GP`, `Results`, `GP_SPAGNA` |
| Catalogna | `fantamotogp-catalogna.xlsx` | 6 | 20 / 20 / 50 / 91 | `Q`, `Sprint`, `GP`, `Results`, `GP_SPAGNA` |
| Italia | `fantamotogp-italia.xlsx` | 6 | 24 / 13 / 45 / 88 | `Q`, `Sprint`, `GP`, `Results`, `GP_SPAGNA` |
| Ungheria | `fantamotogp-ungheria.xlsx` | 6 | 24 / 13 / 55 / 96 | `Q`, `Sprint`, `GP`, `Results`, `GP_SPAGNA` |
| Repubblica Ceca | `fantamotogp-repubblica-ceca.xlsx` | 6 | 14 / 8 / 45 / 84 | `Q`, `Sprint`, `GP`, `Results`, `GP_SPAGNA` |
| Netherlands/Olanda | `fantamotogp-netherlands.xlsx` | 6 | 10 / 6 / 70 / 81 | `Q`, `Sprint`, `GP`, `Results`, `GP_SPAGNA` |
| Germania | `fantamotogp-germany.xlsx` | 6 | 12 / 8 / 35 / 83 | `Q`, `Sprint`, `GP`, `Results`, `GP_SPAGNA` |
| UK | `fantamotogp-uk.xlsx` | 6 | 24 / 13 / 70 / 82 | `Q`, `Sprint`, `GP`, `Results`, `GP_SPAGNA` |
| Aragon | `fantamotogp-aragon.xlsx` | 6 | 20 / 13 / 60 / 77 | `Q`, `Sprint`, `GP`, `Results`, `GP_SPAGNA` |

I due file di supporto sono:

| File | Ruolo osservato |
|---|---|
| `fantamotogp-classifica.xlsx` | workbook/registro di classifiche aggregate |
| `fantamotogp-pronostici-2026.xlsx` | workbook di raccolta/pronostici 2026 |

### 3.1 Fogli visibili, nascosti e named ranges

Ogni export GP contiene gli stessi sei fogli logici:

1. `Risposte del modulo 1` — Qualifica;
2. `Risposte del modulo 2` — Sprint;
3. `Risposte del modulo 3` — Gara e colonne di breakdown;
4. `Risposte del modulo 4` — risultato ufficiale usato dalle formule;
5. `CLASSIFICA` — riepilogo;
6. `Grafici` — foglio vuoto di supporto.

Nel `workbook.xml` di tutti i 14 export GP ogni foglio risulta `visible`; nessuno risulta `hidden` o `veryHidden`. Non sono presenti named ranges workbook-level nelle copie `.xlsx` (`definedNames` vuoto).

I workbook più recenti usano le tabelle:

```text
Q       -> A:F
Sprint  -> A:F
GP      -> A:M
Results -> A:N
CLASSIFICA -> GP_<nome>
```

Thailandia e Brasile conservano invece nomi legacy `Form_Responses*` e riferimenti diretti al foglio 4. Le tabelle sono interne al workbook: non sono stati trovati link a workbook esterni. Le uniche anomalie di riferimento rilevate sono i riferimenti strutturati a nomi di tabella non uniformi e il literal `#REF!` nella parte finale di alcune formule Gara.

## 4. Formule originali e catena dei calcoli

Le formule sono state lette dal foglio XML, non ricostruite dai soli valori visualizzati. Di seguito `r` indica la riga della risposta dell’utente.

### 4.1 Qualifica e tempo Qualifica

Formula originale della conversione del tempo, variante diretta:

```excel
=ABS(((MID(Dr,1,2))*60)+(MID(Dr,4,2))+(MID(Dr,7,3))*0.001-'Risposte del modulo 4'!$C$2)
```

Variante con tabella strutturata:

```excel
=ABS(((MID(Dr,1,2))*60)+(MID(Dr,4,2))+(MID(Dr,7,3))*0.001-Results[time conversion])
```

La formula:

- prende i primi due caratteri come minuti;
- prende i caratteri 4–5 come secondi;
- prende i caratteri 7–9 come millisecondi e li moltiplica per `0.001`;
- applica `ABS`;
- non usa `ROUND`.

Per questo motivo entrambi i formati osservati funzionano:

```text
01:28.526 -> 88.526 secondi
01:17:850 -> 77.850 secondi
```

Il separatore tra secondi e millisecondi può quindi essere `.` oppure `:`, perché la formula legge comunque i caratteri fissi 7–9.

Formula originale del punteggio Qualifica, variante strutturata:

```excel
=IF(Cr="",0,
   IF(Cr=Results[Pilota Pole],5,
      IF(Cr=Results[2° qualifiche],2,0)))
 +IF(Er="",0,
   IF(Er<0.01,10,
      IF(Er<(Results[time conversion]*0.001),5,
         IF(Er<(Results[time conversion]*0.0025),3,
            IF(Er<(Results[time conversion]*0.005),1,0)))))
```

La variante Thailandia/Brasile sostituisce i riferimenti `Results[...]` con:

```excel
'Risposte del modulo 4'!$D$2
'Risposte del modulo 4'!$E$2
'Risposte del modulo 4'!$C$2
```

Regola dimostrata:

| Condizione | Punti tempo |
|---|---:|
| errore `< 0.01` s | 10 |
| errore `< tempo reale * 0.001` | 5 |
| errore `< tempo reale * 0.0025` | 3 |
| errore `< tempo reale * 0.005` | 1 |
| altrimenti | 0 |

Le soglie sono confronti stretti (`<`), non `<=`.

### 4.2 Sprint

Formula originale, variante con `Results`:

```excel
=IF(Cr="",0,
    SUM(IF(Cr=TRANSPOSE(Results[[1° S]:[3° S]]),1,0)*{3;1;0}))
 +IF(Dr="",0,
    SUM(IF(Dr=TRANSPOSE(Results[[1° S]:[3° S]]),1,0)*{1;3;1}))
 +IF(Er="",0,
    SUM(IF(Er=TRANSPOSE(Results[[1° S]:[3° S]]),1,0)*{0;1;3}))
```

La variante legacy sostituisce `Results[[1° S]:[3° S]]` con:

```excel
'Risposte del modulo 4'!$F$2:$H$2
```

La matrice effettiva è:

| Pilota pronosticato | Risultato P1 | Risultato P2 | Risultato P3 |
|---|---:|---:|---:|
| slot pronosticato P1 | 3 | 1 | 0 |
| slot pronosticato P2 | 1 | 3 | 1 |
| slot pronosticato P3 | 0 | 1 | 3 |

Non esistono punti Sprint per un pilota assente dai tre risultati ufficiali. `NOT_CLASSIFIED` o DNF producono quindi zero solo perché non c’è uguaglianza con uno dei tre valori di `Results`.

### 4.3 Gara: punti posizione

Formula originale del punteggio Gara, in forma strutturata:

```excel
=IF(Cr="",0,SUM(IF(Cr=TRANSPOSE(Results[[1° GP]:[5° GP]]),1,0)*{5;3;1;1;1}))
 +IF(Dr="",0,SUM(IF(Dr=TRANSPOSE(Results[[1° GP]:[5° GP]]),1,0)*{3;5;3;1;1}))
 +IF(Er="",0,SUM(IF(Er=TRANSPOSE(Results[[1° GP]:[5° GP]]),1,0)*{1;3;5;3;1}))
 +IF(Fr="",0,SUM(IF(Fr=TRANSPOSE(Results[[1° GP]:[5° GP]]),1,0)*{1;1;3;5;3}))
 +IF(Gr="",0,SUM(IF(Gr=TRANSPOSE(Results[[1° GP]:[5° GP]]),1,0)*{1;1;1;3;5}))
 +IF(COUNTIF(Cr:Gr,Hr)>0,-2,0)
 +Kr+Mr
 +IF(ISERROR(SEARCH(H83,Results[Out])),0,0)
```

Gli indici `H83`, `H54`, ecc. cambiano tra workbook e righe. In Thailandia è osservabile anche la variante:

```excel
+IF(ISERROR(SEARCH(#REF!,'Risposte del modulo 4'!$N$2)),0,0)
```

La parte posizionale è la matrice:

| Slot pronosticato | Risultato P1 | P2 | P3 | P4 | P5 |
|---|---:|---:|---:|---:|---:|
| P1 | 5 | 3 | 1 | 1 | 1 |
| P2 | 3 | 5 | 3 | 1 | 1 |
| P3 | 1 | 3 | 5 | 3 | 1 |
| P4 | 1 | 1 | 3 | 5 | 3 |
| P5 | 1 | 1 | 1 | 3 | 5 |

Conseguenze dimostrate:

- un pilota pronosticato nella Top 5 ma in posizione diversa vale comunque `1` o `3`;
- un pilota non presente nella Top 5 ufficiale vale `0`;
- il semplice stato `NOT_CLASSIFIED` non ha una formula speciale nella matrice: vale zero perché non coincide con una stringa P1–P5;
- se il pilota scelto come OUT compare anche fra i cinque pronostici Gara, `COUNTIF(Cr:Gr,Hr)>0` sottrae `2`.

### 4.4 Posizioni esatte

Formula originale:

```excel
=SUM(
  COUNTIF(Results[1° GP],Cr),
  COUNTIF(Results[2° GP],Dr),
  COUNTIF(Results[3° GP],Er),
  COUNTIF(Results[4° GP],Fr),
  COUNTIF(Results[5° GP],Gr)
)
```

La variante legacy usa le cinque celle:

```excel
'Risposte del modulo 4'!$I$2
'Risposte del modulo 4'!$J$2
'Risposte del modulo 4'!$K$2
'Risposte del modulo 4'!$L$2
'Risposte del modulo 4'!$M$2
```

Il risultato viene salvato nella colonna `J`.

### 4.5 Bonus Top 5 e OUT

Formula originale della colonna `K`:

```excel
=IF(
   SUM(
     COUNTIF(Results[[1° GP]:[5° GP]],Cr),
     COUNTIF(Results[[1° GP]:[5° GP]],Dr),
     COUNTIF(Results[[1° GP]:[5° GP]],Er),
     COUNTIF(Results[[1° GP]:[5° GP]],Fr),
     COUNTIF(Results[[1° GP]:[5° GP]],Gr)
   )=5,
   2,0
 )
 +IF(Jr=5,5,IF(Jr=4,3,IF(Jr=3,1,0)))
 +IF(ISERROR(SEARCH(Hr,Results[Out])),0,2)
```

La variante legacy usa `$I$2:$M$2` e `$N$2`.

La formula dimostra l’interpretazione A:

```text
bonus Top 5 = +2 se tutti i cinque sono nella Top 5
            +5 se cinque slot sono esatti
            +3 se quattro slot sono esatti
            +1 se tre slot sono esatti
            +2 se l’OUT pronosticato è presente nell’elenco Out
```

I bonus sono cumulabili. Per esempio, cinque posizioni esatte valgono `+5` e, se tutti i cinque sono nella Top 5, anche `+2`.

L’OUT non è legato a un pilota particolare della Top 5: è il valore inserito nella colonna `H` della risposta Gara e viene cercato nella stringa `Results[Out]`/`N2`.

### 4.6 Malus

Formula originale della colonna `L`:

```excel
=SUM(
  IF(ISERROR(SEARCH(Cr,Results[Out])),0,1),
  IF(ISERROR(SEARCH(Dr,Results[Out])),0,1),
  IF(ISERROR(SEARCH(Er,Results[Out])),0,1),
  IF(ISERROR(SEARCH(Fr,Results[Out])),0,1),
  IF(ISERROR(SEARCH(Gr,Results[Out])),0,1)
)
```

`L` è quindi il numero di piloti fra i cinque pronostici Gara che **sono** trovati nella stringa degli OUT ufficiali. Non è il numero di NC ufficiali e non è il numero di NC fra i primi cinque.

Formula originale della colonna `M`:

```excel
=IF(Lr=5,-10,IF(Lr>=3,-5,IF(Lr>=1,-1,0)))
```

La formula è salvata come shared formula, tipicamente con il master in `M2` e intervallo `M2:M<n>`. Nei follower XML il tag `<f>` è vuoto ma conserva lo stesso shared-formula id; non significa che la cella sia priva di logica.

Mappatura esatta:

| `L` | Malus `M` |
|---:|---:|
| 0 | 0 |
| 1–2 | −1 |
| 3–4 | −5 |
| 5 | −10 |

La formula può ereditare comportamenti di ricerca per sottostringa di `SEARCH`; quindi un ricalcolo dipende anche dalla stringa completa presente nella colonna `Out`.

## 5. Catena `CLASSIFICA`

Le colonne aggregate sono alimentate da `XLOOKUP`:

```excel
B r = XLOOKUP(Ar,'Risposte del modulo 1'!B:B,'Risposte del modulo 1'!F:F,0)
C r = XLOOKUP(Ar,'Risposte del modulo 2'!B:B,'Risposte del modulo 2'!F:F,0)
D r = XLOOKUP(Ar,'Risposte del modulo 3'!B:B,'Risposte del modulo 3'!I:I,0)
E r = SUM(Br:Dr)
```

Le formule di visualizzazione recuperano inoltre le risposte con `XLOOKUP`:

```excel
G  = XLOOKUP(A,'Risposte del modulo 1'!B:B,'Risposte del modulo 1'!C:D)
I  = XLOOKUP(A,'Risposte del modulo 2'!B:B,'Risposte del modulo 2'!C:E)
L  = XLOOKUP(A,'Risposte del modulo 3'!B:B,'Risposte del modulo 3'!C:H)
```

Il totale storico mostrato da `CLASSIFICA!E` è quindi Qualifica + Sprint + Gara complessiva della colonna `I` del foglio Gara. Il tempo Qualifica è incluso indirettamente in `Risposte del modulo 1!F`.

## 6. Ricostruzione dei casi obbligatori

La tabella dell’incarico contiene 10 righe, non 9; sono state analizzate tutte.

`Q/S/R` sono le righe nei tre fogli di risposta. `Race I` è la Gara complessiva salvata dall’Excel, già comprensiva di bonus/malus secondo la formula della colonna `I`. `J/K/L/M` sono i valori intermedi salvati.

| Utente | GP | Righe Q/S/R | Qualifica `F` | Sprint `F` | Race `I` | `J` esatte | `K` bonus | `L` | `M` | Totale Excel `CLASSIFICA!E` | Atteso |
|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Niky | Thailandia | 9 / 7 / 9 | 8 | 3 | 10 | 0 | 2 | 2 | −1 | **21** | 21 |
| Niky | Brasile | 2 / 2 / 2 | 0 | 6 | 19 | 2 | 4 | 0 | 0 | **25** | 25 |
| Niky | Francia | 6 / 5 / 7 | 3 | 2 | 13 | 0 | 2 | 1 | −1 | **18** | 18 |
| Niky | Aragon | 4 / 2 / 4 | 5 | 5 | 14 | 2 | 0 | 0 | 0 | **24** | 24 |
| Marty | Catalogna | 10 / 21 / 10 | 6 | 9 | −2 | 0 | 0 | 3 | −5 | **13** | 13 |
| Marty | Italia | 3 / 5 / 9 | 5 | 2 | 23 | 4 | 3 | 0 | 0 | **30** | 30 |
| Simo | Thailandia | 10 / 8 / 10 | 8 | 3 | 15 | 1 | 2 | 1 | −1 | **26** | 26 |
| Marino | Aragon | 3 / 7 / 2 | 7 | 1 | 20 | 3 | 3 | 0 | 0 | **28** | 28 |
| Alessandro | Spagna | 4 / 7 / 7 | 5 | 3 | 11 | 0 | 0 | 1 | −1 | **19** | 19 |
| Alessandro | UK | 4 / 2 / 5 | 5 | 9 | 8 | 1 | 2 | 1 | −1 | **22** | 22 |

Il caso Marino/Aragon, che non era disponibile nel dataset applicativo usato nell’audit precedente, è invece presente nel workbook Excel di Aragon alle righe indicate.

### 6.1 Niky / Thailandia — `21`

Coordinate e valori Excel:

| Foglio/cella | Valore |
|---|---|
| `Risposte del modulo 1!C9` | `M. Bezzecchi` |
| `Risposte del modulo 1!D9` | `01:28.526` |
| `Risposte del modulo 1!E9` | `0.126` |
| `Risposte del modulo 1!F9` | `8` |
| `Risposte del modulo 2!C7:E7` | `M. Bezzecchi / M. Marquez / F. Di Giannantonio` |
| `Risposte del modulo 2!F7` | `3` |
| `Risposte del modulo 3!C9:G9` | `M. Marquez / M. Bezzecchi / P. Acosta / R. Fernandez / A. Marquez` |
| `Risposte del modulo 3!H9` | `J. Mir` |
| `Risposte del modulo 3!I9` | `10` |
| `Risposte del modulo 3!J9` | `0` |
| `Risposte del modulo 3!K9` | `2` |
| `Risposte del modulo 3!L9` | `2` |
| `Risposte del modulo 3!M9` | `−1` |
| `CLASSIFICA!B11:E11` | `8 / 3 / 10 / 21` |

Risultato ufficiale nel foglio 4:

```text
Qualifica pole: M. Bezzecchi
Tempo: 88.652 s
Sprint: P. Acosta / M. Marquez / R. Fernandez
Gara: M. Bezzecchi / P. Acosta / R. Fernandez / J. Martin / A. Ogura
Out: M. Marquez, A. Marquez, J. Mir
```

Qualifica:

```text
pole corretta = 5
errore tempo = |88.526 - 88.652| = 0.126 s
0.126 / 88.652 = circa 0.1421%
fascia formula = 3
totale Qualifica = 8
```

Sprint:

```text
Bezzecchi come P1 pronosticato, ma non nei tre risultati = 0
Marquez P2 esatto = 3
Di Giannantonio non nei tre risultati = 0
totale Sprint = 3
```

Gara:

```text
punti matrice posizione = 0 + 3 + 3 + 3 + 0 = 9
J9 = 0
K9 = 2, perché J. Mir è trovato in Out
M9 = -1
penalità scelta OUT fra i cinque = 0
I9 = 9 + 2 - 1 = 10
```

Il totale Excel è quindi:

```text
8 + 3 + 10 = 21
```

Questo chiude la precedente ambiguità `OUT +1` contro `OUT +2`: nella formula Excel osservata il bonus OUT è `+2`, mentre la colonna `M` porta `−1` nel valore salvato, con risultato netto Gara `10`.

### 6.2 Marty / Catalogna — `13`

Coordinate e valori Excel:

| Foglio/cella | Valore |
|---|---|
| `Risposte del modulo 1!C10` | `P. Acosta` |
| `Risposte del modulo 1!D10` | `01:37.589` |
| `Risposte del modulo 1!E10` | `0.479` |
| `Risposte del modulo 1!F10` | `6` |
| `Risposte del modulo 2!C21:E21` | `A. Marquez / P. Acosta / F. Di Giannantonio` |
| `Risposte del modulo 2!F21` | `9` |
| `Risposte del modulo 3!C10:G10` | `A. Marquez / F. Di Giannantonio / J. Martin / R. Fernandez / P. Acosta` |
| `Risposte del modulo 3!H10` | `B. Binder` |
| `Risposte del modulo 3!I10` | `−2` |
| `Risposte del modulo 3!J10` | `0` |
| `Risposte del modulo 3!K10` | `0` |
| `Risposte del modulo 3!L10` | `3` |
| `Risposte del modulo 3!M10` | `−5` |
| `CLASSIFICA!B12:E12` | `6 / 9 / −2 / 13` |

Risultato ufficiale nel workbook Catalogna:

```text
Qualifica pole: P. Acosta
Tempo: 98.068 s
Sprint: A. Marquez / P. Acosta / F. Di Giannantonio
Gara: F. Di Giannantonio / F. Aldeguer / F. Bagnaia / M. Bezzecchi / F. Quartararo
Out: A. Marquez, P. Acosta, J. Zarco, E. Bastianini, J. Martin
```

Qualifica:

```text
pole corretta = 5
errore tempo = |97.589 - 98.068| = 0.479 s
0.479 / 98.068 = circa 0.4884%
fascia formula = 1
totale Qualifica = 6
```

Sprint:

```text
A. Marquez P1 esatto = 3
P. Acosta P2 esatto = 3
F. Di Giannantonio P3 esatto = 3
totale Sprint = 9
```

Gara:

```text
punti matrice posizione = 0 + 3 + 0 + 0 + 0 = 3
J10 = 0
K10 = 0
H10 = B. Binder non è nella stringa Out, quindi bonus OUT = 0
penalità per OUT fra i cinque = 0
L10 = 3 nel valore Excel salvato
M10 = -5
I10 = 3 + 0 - 5 = -2
```

Il totale Excel è:

```text
6 + 9 - 2 = 13
```

Questo è il risultato esatto del workbook e spiega il `13` senza introdurre una formula non documentata. Il precedente `22` dell’audit applicativo proveniva da un altro insieme di risultati ufficiali e da un modello analitico prudente; non è il risultato della catena Excel Catalogna.

## 7. Confronto Excel, RPC e codice corrente

### 7.1 Cosa è dimostrato dall’Excel

- Il tempo Qualifica è parte del punteggio Qualifica.
- Il tempo è convertito dai caratteri della stringa e confrontato in secondi.
- Sprint e Gara usano matrici di uguaglianza con punteggi `3/1/0` e `5/3/1`.
- Il bonus Top 5 è cumulativo e corrisponde all’interpretazione A.
- OUT corretto vale `+2` nella colonna bonus.
- Il malus usa la funzione a soglie `L -> M` riportata sopra.
- `CLASSIFICA` recupera i tre punteggi tramite `XLOOKUP` e li somma.

### 7.2 Differenze o rischi rispetto al codice/RPC corrente

1. Le entry applicative possono contenere il tempo Qualifica, mentre il campo aggregato `predictions.qualifying_pole_time` non è sempre popolato. L’Excel legge direttamente la risposta `D` e calcola `E/F`; un fallback applicativo sul tempo della entry è quindi necessario per ottenere la stessa informazione.
2. L’RPC `score_prediction` è una fonte distinta. La firma è osservabile, ma il corpo SQL autorevole non è stato recuperato; questo report non attribuisce all’RPC una formula non verificata.
3. I risultati ufficiali devono appartenere allo stesso dataset usato dal workbook. Il caso Catalogna dimostra che cambiando il risultato ufficiale cambia anche la matrice Gara e quindi il totale.
4. Una formula Excel salvata con valori in cache non equivale automaticamente a un ricalcolo corrente. Il workbook ha `<calcPr/>` senza indicazioni di ricalcolo completo; perciò il report conserva separati:
   - formula originale;
   - valore `<v>` memorizzato;
   - risultato del replay offline.
5. La formula finale `IF(ISERROR(SEARCH(...)),0,0)` non aggiunge punti, anche quando il riferimento è `#REF!`; non deve essere reinterpretata come un bonus OUT ulteriore.

### 7.3 Riconciliazione con l’audit precedente

L’audit precedente aveva 7 corrispondenze su 9 casi disponibili nell’applicazione, con due delta:

- Niky/Thailandia: `22` modello analitico contro `21` storico;
- Marty/Catalogna: `22` modello analitico contro `13` storico.

Lettura primaria degli Excel:

```text
Niky/Thailandia: 8 + 3 + 10 = 21
Marty/Catalogna: 6 + 9 - 2 = 13
```

I due delta non richiedono più una scelta arbitraria fra due ipotesi OUT/malus: le celle Excel `I/K/L/M` e `CLASSIFICA!E` mostrano la catena utilizzata dal file storico.

## 8. Test offline: Excel = risultato ricostruito

È stato eseguito un replay offline con parser XML standard-library, senza installare dipendenze nel progetto e senza usare Excel/Google Sheets in scrittura.

Il test:

1. individua la riga dell’utente tramite email;
2. legge la riga 2 di `Risposte del modulo 4`;
3. applica le matrici Qualifica, Sprint e Gara;
4. legge i valori intermedi `J/K/L/M`;
5. ricostruisce `I`;
6. verifica `CLASSIFICA!E = B + C + D`.

Risultato:

| GP / utente | Qualifica cache | Sprint cache | Race cache | Totale cache | Replay totale | Esito |
|---|---:|---:|---:|---:|---:|---|
| Thailandia / Niky | 8 | 3 | 10 | 21 | 21 | PASS |
| Brasile / Niky | 0 | 6 | 19 | 25 | 25 | PASS |
| Francia / Niky | 3 | 2 | 13 | 18 | 18 | PASS |
| Aragon / Niky | 5 | 5 | 14 | 24 | 24 | PASS |
| Catalogna / Marty | 6 | 9 | −2 | 13 | 13 | PASS |
| Italia / Marty | 5 | 2 | 23 | 30 | 30 | PASS |
| Thailandia / Simo | 8 | 3 | 15 | 26 | 26 | PASS |
| Aragon / Marino | 7 | 1 | 20 | 28 | 28 | PASS |
| Spagna / Alessandro | 5 | 3 | 11 | 19 | 19 | PASS |
| UK / Alessandro | 5 | 9 | 8 | 22 | 22 | PASS |

Questo è un test di replay della catena Excel e dei valori memorizzati, non una prova che un ricalcolo forzato oggi produrrebbe identici cache value dopo eventuali modifiche ai risultati ufficiali.

## 9. Pseudocodice descrittivo

Il seguente pseudocodice descrive le regole osservate senza implementarle nel progetto:

```text
read official:
  pole
  second_qualifying
  pole_time_seconds
  sprint_top3
  race_top5
  out_text

qualifying_time_seconds = parse_fixed_positions(predicted_time)
time_error = abs(qualifying_time_seconds - pole_time_seconds)

qualifying_points =
  5 if predicted_pole == pole
  else 2 if predicted_pole == second_qualifying
  else 0

qualifying_points +=
  10 if time_error < 0.01
  else 5 if time_error < pole_time_seconds * 0.001
  else 3 if time_error < pole_time_seconds * 0.0025
  else 1 if time_error < pole_time_seconds * 0.005
  else 0

sprint_points = sum(matrix_sprint[predicted_slot, official_slot]
                    for every matching predicted rider)

race_position_points = sum(matrix_race[predicted_slot, official_slot]
                            for every matching predicted rider)

exact_positions = count(
  predicted_slot_rider == official_race_rider_at_same_slot
)

bonus =
  2 if every predicted race rider occurs in official race_top5 else 0
  + 5 if exact_positions == 5
  + 3 if exact_positions == 4
  + 1 if exact_positions == 3
  + 2 if predicted_out occurs in out_text else 0

out_in_race_penalty = -2 if predicted_out occurs in race_predictions else 0

L = count(predicted_race_rider found in out_text)
malus =
  -10 if L == 5
  -5  if L >= 3
  -1  if L >= 1
  0   otherwise

race_total = race_position_points
             + out_in_race_penalty
             + bonus
             + malus
             + 0  # final Excel IF has equal branches

total = qualifying_points + sprint_points + race_total
```

## 10. Distinzione fra regole dimostrate, dedotte e sconosciute

### Regole dimostrate direttamente dalle formule

- conversione del tempo con `MID`, minuti/secondi/millisecondi;
- `ABS` sul delta;
- soglie tempo `10/5/3/1/0`;
- punti Pole `5` e seconda Qualifica `2`;
- matrice Sprint;
- matrice Gara;
- penalità `−2` se l’OUT scelto è anche fra i cinque pronostici Gara;
- conteggio `J` delle posizioni esatte;
- bonus Top 5 cumulativo A;
- OUT corretto `+2`;
- conteggio `L` tramite `SEARCH`;
- malus `0/−1/−5/−10`;
- somma `CLASSIFICA!E = B+C+D`.

### Deduzioni operative supportate dai file

- `Risposte del modulo 4`/`Results` è la sorgente ufficiale che alimenta i tre fogli scoring.
- Le formule sono state copiate lungo le righe delle tabelle; il caso `M` usa shared formulas XML.
- Gli export più vecchi e più recenti usano nomi tabella diversi, ma la logica numerica osservabile è la stessa.
- I valori `I/J/K/L/M` sono una catena di breakdown persistita nel workbook, non soltanto un totale finale.

### Ancora sconosciuto

- Se e quando Google Sheets abbia ricalcolato tutte le formule dopo ogni modifica alla stringa `Out` o ai risultati ufficiali.
- Se l’RPC applicativa storica abbia replicato ogni dettaglio Excel o abbia usato una versione successiva delle regole.
- La cronologia completa delle revisioni Drive e l’eventuale esistenza di copie non esportate o revisioni precedenti dello stesso GP.
- Il significato applicativo di alcune anomalie di riferimento come `H83`/`H54` e `#REF!`; la loro presenza è dimostrata, ma la loro intenzione originaria non è recuperabile dal file.

## Conclusione

La fonte Excel primaria risolve i due casi rimasti discordanti:

```text
Niky / Thailandia = 21
Marty / Catalogna = 13
```

La ricostruzione non richiede modifiche al database o all’RPC. Prima di implementare uno scoring applicativo compatibile, il punto da preservare è la separazione fra:

1. risultati ufficiali usati dal workbook;
2. formule;
3. valori intermedi in cache;
4. totale aggregato `CLASSIFICA`.

In particolare, non bisogna sostituire il malus Excel con una funzione basata soltanto sul numero di `NOT_CLASSIFIED` e non bisogna usare la formula finale con `#REF!` come prova di un bonus aggiuntivo.