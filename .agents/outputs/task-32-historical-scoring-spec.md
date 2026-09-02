# Task 32 — Specifica dello scoring storico e test offline

**Data:** 2 settembre 2026  
**Modalità:** esclusivamente read-only  
**Esito:** **PASS** per il replay offline dei 10 casi Excel; **nessuna modifica applicativa**

## 1. Perimetro e vincoli

La fonte primaria è `.agents/outputs/task-31-excel-scoring-reverse-engineering.md`, che a sua volta deriva dalle formule XML e dai valori in cache degli export `.xlsx` dei workbook Google Drive 2026.

Questa attività ha creato soltanto:

- `scripts/historical-scoring-spec.mjs`;
- `scripts/test-historical-scoring-spec.mjs`;
- questo report.

Non sono stati modificati database, prediction, `prediction_entries`, `session_results`, RPC, schema, RLS, migration, Excel o dipendenze. `score_prediction` non è stato chiamato.

Il test usa fixture offline trascritte dalle celle e dai risultati riportati nel Task 31. Non legge Supabase e non forza un ricalcolo Excel: verifica la catena formula → breakdown → totale contro i valori Excel in cache.

## 2. Fonte e convenzioni Excel

Ogni workbook GP usa:

- foglio `Risposte del modulo 1` per Qualifica;
- foglio `Risposte del modulo 2` per Sprint;
- foglio `Risposte del modulo 3` per Gara e breakdown;
- foglio `Risposte del modulo 4`/tabella `Results` per risultati ufficiali;
- `CLASSIFICA` per `Qualifica + Sprint + Gara`.

Le formule operano su stringhe di nomi pilota. Il confronto posizionale è per uguaglianza esatta; la ricerca nell’elenco OUT è la ricerca Excel `SEARCH`, quindi case-insensitive e per sottostringa.

### Errata corrige sul significato di `L`

La formula XML osservata è:

```excel
=SUM(
  IF(ISERROR(SEARCH(Cr,Results[Out])),0,1),
  IF(ISERROR(SEARCH(Dr,Results[Out])),0,1),
  IF(ISERROR(SEARCH(Er,Results[Out])),0,1),
  IF(ISERROR(SEARCH(Fr,Results[Out])),0,1),
  IF(ISERROR(SEARCH(Gr,Results[Out])),0,1)
)
```

Pertanto:

```text
L = numero dei cinque pronostici Gara trovati nella stringa Out ufficiale
```

Non è il numero dei rider non trovati e non è il numero dei `NOT_CLASSIFIED`. Questa è la semantica implementata nel test. Spiega, per esempio, il Brasile con `L=0` quando nessuno dei cinque pronostici è nella stringa OUT, e Catalogna con `L=3` quando tre dei cinque lo sono.

## 3. Specifica matematica

### 3.1 Qualifica

Siano:

- `p` il pilota pronosticato per la Pole;
- `P` il pilota ufficiale Pole;
- `P2` il pilota ufficiale della seconda posizione di Qualifica;
- `t` il tempo pronosticato;
- `T` il tempo ufficiale in secondi.

Il punteggio Pole è:

```text
polePoints =
  5 se p = P
  2 se p = P2
  0 altrimenti
```

Il tempo è letto dalla stringa con posizioni fisse, come nella formula Excel:

```excel
((MID(D,1,2))*60) + MID(D,4,2) + (MID(D,7,3))*0.001
```

Quindi sono accettati entrambi i formati osservati:

```text
MM:SS.MMM
MM:SS:MMM
```

Il carattere in posizione 6 non viene interpretato; i millisecondi sono sempre i caratteri 7–9. Non viene applicato `ROUND`.

Con `e = ABS(t - T)`:

```text
qualifyingTime =
  10 se e < 0.01
   5 se e < T * 0.001
   3 se e < T * 0.0025
   1 se e < T * 0.005
   0 altrimenti
```

Le soglie sono strettamente `<`, non `<=`.

Se il tempo o il risultato ufficiale necessario manca, il test offline non assegna punti tempo. Se il valore è `#N/A`, viene rifiutato come errore Excel e non viene trasformato in un rider valido. Una Pole pronosticata vuota non assegna punti Pole.

```text
qualifying = polePoints + qualifyingTime
```

### 3.2 Sprint

Per ogni slot pronosticato `i` e posizione ufficiale `j`:

```text
                 ufficiale
pronosticato       P1 P2 P3
P1                  3  1  0
P2                  1  3  1
P3                  0  1  3
```

Un pilota non presente nei tre risultati ufficiali vale `0`.

### 3.3 Gara

La matrice posizionale è:

```text
                 ufficiale
pronosticato       P1 P2 P3 P4 P5
P1                  5  3  1  1  1
P2                  3  5  3  1  1
P3                  1  3  5  3  1
P4                  1  1  3  5  3
P5                  1  1  1  3  5
```

Un pilota non presente nella Top 5 ufficiale vale `0`. Non esiste un ramo speciale per `NC/DNF`: il valore è zero perché non c’è uguaglianza con una delle cinque stringhe ufficiali.

Se `out` è il pilota scelto come OUT e compare nei cinque pronostici Gara:

```text
outPenalty = -2
```

Altrimenti `outPenalty = 0`.

Il termine finale osservato in alcune formule:

```excel
IF(ISERROR(SEARCH(...)),0,0)
```

è un termine nullo e vale sempre `0`, anche quando contiene `#REF!`.

## 4. Bonus, OUT e malus

### 4.1 Bonus cumulativo

Sia `J` il numero di posizioni esatte:

```text
J = count(predicted[i] = official[i]) per i = 1..5
```

Il bonus posizione esatta è:

```text
5 se J = 5
3 se J = 4
1 se J = 3
0 altrimenti
```

In aggiunta:

```text
topFiveBonus = 2 se tutti i cinque pronostici compaiono nella Top 5 ufficiale
               0 altrimenti

outBonus = 2 se SEARCH(out, officialOutText) trova il valore
           0 altrimenti
```

Il bonus totale è cumulativo:

```text
bonus = topFiveBonus + exactOrderBonus + outBonus
```

Cinque posizioni esatte valgono quindi `5 + 2` se tutti i cinque sono nella Top 5, oltre a un eventuale bonus OUT corretto.

### 4.2 Malus

Il valore `L` è:

```text
L = Σ per i=1..5:
      1 se SEARCH(predictedRace[i], officialOutText) trova il pilota
      0 altrimenti
```

Il malus è:

```text
malus =
  0   se L = 0
 -1   se 1 <= L <= 2
 -5   se 3 <= L <= 4
-10   se L = 5
```

La ricerca è quella di Excel e quindi può risentire della ricerca per sottostringa. Nei casi con celle vuote, `SEARCH("", testo)` è trattato come una ricerca riuscita, come previsto dal comportamento Excel; `#N/A` resta un errore e non viene convertito.

### 4.3 Gara e totale

```text
race = racePosition + outPenalty + bonus + malus + 0
total = qualifying + sprint + race
```

Il totale `CLASSIFICA` osservato è:

```text
CLASSIFICA = Qualifica + Sprint + Gara
```

Il tempo Qualifica è incluso nel componente Qualifica.

## 5. Pseudocodice

```text
scorePrediction(prediction, officialResults):
    reject #N/A as a rider/error

    polePoints =
        5 if prediction.pole == official.pole
        2 if prediction.pole == official.secondQualifying
        0 otherwise

    predictedSeconds = parse fixed characters 1-2, 4-5, 7-9
    error = abs(predictedSeconds - official.qualifyingTimeSeconds)
    qualifyingTime = thresholdScore(error)
    qualifying = polePoints + qualifyingTime

    sprint = sum(sprintMatrix[predictedSlot, officialSlot]
                 for each matching sprint rider)

    racePosition = sum(raceMatrix[predictedSlot, officialSlot]
                       for each matching Top 5 rider)
    exactPositions = count(predicted[i] == official.raceTopFive[i])

    topFiveBonus = 2 if every prediction is in official Top 5 else 0
    exactOrderBonus = {5: 5, 4: 3, 3: 1}.get(exactPositions, 0)
    outBonus = 2 if SEARCH(prediction.out, official.outText) succeeds else 0
    bonus = topFiveBonus + exactOrderBonus + outBonus

    outPenalty = -2 if prediction.out is in prediction.raceTopFive else 0

    L = count(SEARCH(predictedRaceRider, official.outText) succeeds)
    malus = {0: 0, 1..2: -1, 3..4: -5, 5: -10}[L]

    race = racePosition + outPenalty + bonus + malus + 0
    total = qualifying + sprint + race

    return all components and total
```

L’implementazione isolata corrispondente è in `scripts/historical-scoring-spec.mjs`; il test è in `scripts/test-historical-scoring-spec.mjs`.

## 6. Test obbligatori: confronto Excel → implementazione offline

Le colonne `racePosition`, `exactPositions`, `topFiveBonus`, `exactOrderBonus`, `outBonus`, `outPenalty` e `L` sono componenti ricalcolate direttamente dalle formule Excel; `qualifying`, `sprint`, `race`, `bonus`, `malus` e `total` coincidono con i valori cached nelle celle del workbook.

| Utente | GP | Excel Q | Calc Q | Excel S | Calc S | Excel R | Calc R | Excel B | Calc B | Excel O | Calc O | Excel M | Calc M | Totale Excel | Totale Calc | Delta |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Niky | Thailandia | 8 | 8 | 3 | 3 | 10 | 10 | 2 | 2 | 2 | 2 | -1 | -1 | 21 | 21 | 0 |
| Niky | Brasile | 0 | 0 | 6 | 6 | 19 | 19 | 4 | 4 | 2 | 2 | 0 | 0 | 25 | 25 | 0 |
| Niky | Francia | 3 | 3 | 2 | 2 | 13 | 13 | 2 | 2 | 2 | 2 | -1 | -1 | 18 | 18 | 0 |
| Niky | Aragon | 5 | 5 | 5 | 5 | 14 | 14 | 0 | 0 | 0 | 0 | 0 | 0 | 24 | 24 | 0 |
| Marty | Catalogna | 6 | 6 | 9 | 9 | -2 | -2 | 0 | 0 | 0 | 0 | -5 | -5 | 13 | 13 | 0 |
| Marty | Italia | 5 | 5 | 2 | 2 | 23 | 23 | 3 | 3 | 0 | 0 | 0 | 0 | 30 | 30 | 0 |
| Simo | Thailandia | 8 | 8 | 3 | 3 | 15 | 15 | 2 | 2 | 2 | 2 | -1 | -1 | 26 | 26 | 0 |
| Marino | Aragon | 7 | 7 | 1 | 1 | 20 | 20 | 3 | 3 | 0 | 0 | 0 | 0 | 28 | 28 | 0 |
| Alessandro | Spagna | 5 | 5 | 3 | 3 | 11 | 11 | 0 | 0 | 0 | 0 | -1 | -1 | 19 | 19 | 0 |
| Alessandro | UK | 5 | 5 | 9 | 9 | 8 | 8 | 2 | 2 | 2 | 2 | -1 | -1 | 22 | 22 | 0 |

Tutti i delta sono zero. Il comando di verifica è:

```bash
node scripts/test-historical-scoring-spec.mjs
```

## 7. Breakdown completo dei casi

| Utente / GP | Pole | Time | Q | S | Race position | J | Top 5 | Exact | OUT bonus | OUT penalty | B | L | M | R | Totale |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Niky / Thailandia | 5 | 3 | 8 | 3 | 9 | 0 | 0 | 0 | 2 | 0 | 2 | 2 | -1 | 10 | 21 |
| Niky / Brasile | 0 | 0 | 0 | 6 | 15 | 2 | 2 | 0 | 2 | 0 | 4 | 0 | 0 | 19 | 25 |
| Niky / Francia | 0 | 3 | 3 | 2 | 12 | 2 | 0 | 0 | 2 | 0 | 2 | 1 | -1 | 13 | 18 |
| Niky / Aragon | 2 | 3 | 5 | 5 | 14 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 14 | 24 |
| Marty / Catalogna | 5 | 1 | 6 | 9 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 3 | -5 | -2 | 13 |
| Marty / Italia | 0 | 5 | 5 | 2 | 20 | 4 | 0 | 3 | 0 | 0 | 3 | 0 | 0 | 23 | 30 |
| Simo / Thailandia | 5 | 3 | 8 | 3 | 14 | 1 | 0 | 0 | 2 | 0 | 2 | 1 | -1 | 15 | 26 |
| Marino / Aragon | 2 | 5 | 7 | 1 | 17 | 3 | 2 | 1 | 0 | 0 | 3 | 0 | 0 | 20 | 28 |
| Alessandro / Spagna | 5 | 0 | 5 | 3 | 12 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | -1 | 11 | 19 |
| Alessandro / UK | 0 | 5 | 5 | 9 | 7 | 1 | 0 | 0 | 2 | 0 | 2 | 1 | -1 | 8 | 22 |

## 8. Casi speciali verificati

Il test offline verifica esplicitamente:

- `01:28.526` e `01:17:850`;
- soglie esatte e strettamente inferiori `0.01`, `T*0.001`, `T*0.0025`, `T*0.005`;
- tempo mancante;
- Pole mancante;
- tempo ufficiale mancante senza punti tempo;
- differenze millisecondi ai bordi;
- Sprint incompleto, con blank che non produce punti matrice;
- prediction Gara parziale;
- `#N/A` rifiutato e mai trasformato in rider;
- OUT corretto;
- OUT errato;
- pilota previsto OUT ma classificato, che non riceve il bonus OUT;
- pilota previsto in Top 5 ma presente in OUT;
- valori malus `0`, `-1`, `-5`, `-10`.

Per le celle vuote viene preservata anche la particolarità della formula: le matrici sono protette da `IF(slot="",0,...)`, mentre le formule `SEARCH` di bonus OUT e `L` non hanno un guard esplicito; `SEARCH("", testo)` è pertanto considerato trovato nel test.

## 9. Confronto con scoring attuale

Il confronto con lo scoring applicativo è necessariamente limitato dove il corpo SQL di `public.score_prediction(uuid)` non è recuperabile in modo autorizzato. La firma osservabile non è sufficiente per attribuire all’RPC una formula interna.

| Regola | Storico Excel | Attuale osservabile | Differenza/rischio |
|---|---|---|---|
| Pole | `5` Pole, `2` seconda Qualifica | RPC esistente non formalizzabile dal solo signature; il codice di selezione conserva entry POLE | serve confronto autorizzato del corpo SQL o dei breakdown restituiti |
| Qualifying Time | secondi da caratteri fissi; soglie `<` `10/5/3/1/0`; incluso in Q | le entry possono contenere `QUALIFYING_TIME`, ma l’aggregato può essere nullo | una prediction senza tempo è bloccata dalla RPC attuale con `23502`; non va riempita |
| Sprint | matrice `3/1/0` | la pipeline applicativa seleziona entry e risultati, non dimostra la formula storica | possibile divergenza da misurare sul corpo RPC |
| Gara | matrice `5/3/1`, inclusi i valori `1` a distanza non adiacente entro Top 5 | il modello locale precedente era prudente e non prova la RPC | usare la matrice Excel, non il solo status NC/DNF |
| Bonus | Top 5 cumulativo `+2`, esatte `+5/+3/+1`, OUT corretto `+2` | non dimostrato dal solo signature RPC | il bonus deve restare separato nel breakdown |
| OUT | `+2` quando `SEARCH(out, Out)` trova il valore | il percorso applicativo espone entry `RACE_OUT`, ma non prova la semantica storica | non sostituire con un semplice controllo `NOT_CLASSIFIED` |
| Malus | `L` = piloti Gara trovati in `Out`; `0/-1/-5/-10` | la semantica RPC non è verificabile dal signature | non usare il conteggio dei `NOT_CLASSIFIED` come proxy |
| Aggregato | `Q + S + R` da `CLASSIFICA` | UI e API leggono campi aggregati server-side | l’aggregato deve essere confrontato senza ricalcolo client-side |

## 10. Modifica minima proposta — non applicata

Per allineare lo scoring applicativo a quello storico, la modifica minima concettuale sarebbe:

1. applicare nella funzione autorizzativa la matrice Qualifica/Sprint/Gara formalizzata qui;
2. usare il tempo dell’entry `QUALIFYING_TIME` come sorgente del tempo, con parsing a posizioni fisse e soglie strette;
3. calcolare separatamente bonus OUT, penalità OUT tra i cinque, bonus Top 5/esatte e malus `L`;
4. definire `L` come conteggio dei cinque piloti trovati nella stringa OUT, non come conteggio di `NOT_CLASSIFIED`;
5. aggiornare gli aggregati solo attraverso il percorso autorizzativo esistente;
6. non modificare schema, prediction, `prediction_entries` o risultati ufficiali.

La modifica non viene applicata in questa fase. Prima servono il corpo SQL autorizzato della RPC, test di regressione sulle prediction complete/parziali e una decisione esplicita sul trattamento produttivo dei casi con `QUALIFYING_TIME` mancante.

## 11. Rischi e regressioni

- **Dataset ufficiale diverso:** Catalogna dimostra che una diversa Top 5/OUT cambia il totale anche con gli stessi pronostici.
- **Cache Excel:** il valore `<v>` salvato non prova che un ricalcolo forzato oggi produca lo stesso risultato.
- **Ricerca per sottostringa:** `SEARCH` può trovare nomi dentro stringhe più lunghe; la compatibilità richiede di non sostituirlo automaticamente con un confronto tokenizzato.
- **Celle vuote:** i guard `IF(slot="",0,...)` non sono presenti in tutte le formule; una riscrittura “pulita” può cambiare i casi parziali.
- **`#N/A` e `#REF!`:** `#N/A` è un errore di input e non un pilota; il termine finale `#REF!` osservato ha entrambi i rami a zero e non costituisce un bonus.
- **Prediction parziali:** la RPC attuale può fallire con `23502` in assenza del tempo Qualifica; questa specifica non inventa dati né cambia l’entry.
- **Corpo RPC non osservato:** non è possibile dichiarare equivalenza applicativa completa senza leggere o testare autorizzatamente la funzione.

## 12. Conclusione

**PASS per il criterio offline del Task 32.**

- 10/10 righe obbligatorie coincidono;
- tutte le componenti del breakdown coincidono;
- i casi Qualifying Time coincidono;
- bonus, OUT e malus coincidono;
- tutti i delta Excel → implementazione offline sono zero;
- nessuna modifica a database o scoring è stata applicata.

La conclusione non certifica ancora che l’RPC attuale replichi lo storico: certifica che la specifica eseguibile e i fixture offline riproducono la catena Excel osservata.