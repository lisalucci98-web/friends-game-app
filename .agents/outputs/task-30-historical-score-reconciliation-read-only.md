# Task 30 — Riconciliazione read-only dei punteggi storici

**Data:** 2 settembre 2026  
**Lega:** FantaTest (`TEST01`)  
**Stagione dei casi:** 2026  
**Modalità:** esclusivamente read-only

## Esito sintetico

Le fonti disponibili consentono di confermare integralmente Pole, tempo Qualifica, Sprint e punti posizione Gara dei casi esaminati. Non consentono invece di ricostruire una funzione storica unica per OUT e malus.

Risultati principali:

1. **Niky / Thailandia:** la parte certa vale `20`; per arrivare allo storico `21` serve un contributo netto OUT + malus pari a `+1`. Due combinazioni restano compatibili:
   - OUT `+1`, malus per 2 NC `0`;
   - OUT `+2`, malus per 2 NC `−1`.
2. **Marty / Catalogna:** la formula analitica documentata produce `22`. Per arrivare a `13`, mantenendo Qualifica `6`, Sprint `9` e Race base `8`, servirebbe un contributo Race aggiuntivo pari a `−10`; nessuna regola storica autorevole nel repository lo dimostra.
3. **Marino / Aragon:** non ricostruibile e non ricostruito, perché prediction ed entry non sono disponibili.
4. **Bonus:** l’interpretazione A è necessaria per spiegare Marty/Italia `30`; l’interpretazione B produce `27` e quindi fallisce almeno un caso già verificato.
5. **Qualifying Time:** aggiunge complessivamente `23` punti teorici nei 9 casi disponibili e modifica 7 casi su 9, ma non spiega i delta residui di Thailandia e Catalogna.
6. **Malus:** i fixture storici del repository richiedono residui diversi anche con lo stesso numero di piloti NC. Non esiste quindi una funzione storica dimostrata basata soltanto sulla cardinalità.
7. **Repository/Git:** non è stata trovata una vecchia definizione SQL/RPC autorevole che produca `13` per Marty/Catalogna o `21` per Niky/Thailandia.

## Vincoli rispettati

Durante questo task:

```text
score_prediction eseguita: NO
INSERT/UPDATE/DELETE/UPSERT: NO
Migration applicate: NO
RPC create o modificate: NO
Prediction modificate: NO
Prediction_entries modificate: NO
Session_results modificati: NO
Schema/RLS modificati: NO
```

Sono stati creati o aggiornati soltanto report di documentazione.

---

# Tabella 1 — Casi di test

`Delta = Ricostruito − Atteso`.

La colonna Race contiene i soli punti posizione P1–P5. La colonna Bonus comprende ordine, Top 5 e OUT.

| Utente | GP | Atteso | Ricostruito | Delta | Qualifica | Sprint | Race | Bonus | Malus |
|---|---|---:|---:|---:|---:|---:|---:|---|---:|
| Niky | Thailandia | 21 | 22 | +1 | 8 | 3 | 9 | OUT +2 | 0* |
| Niky | Brasile | 25 | 25 | 0 | 0 | 6 | 15 | Top 5 +2, OUT +2 | 0 |
| Niky | Francia | 18 | 18 | 0 | 3 | 2 | 12 | OUT +2 | -1 |
| Niky | Aragon | 24 | 24 | 0 | 5 | 5 | 14 | 0 | 0 |
| Marty | Catalogna | 13 | 22 | +9 | 6 | 9 | 8 | 0 | -1 |
| Marty | Italia | 30 | 30 | 0 | 5 | 2 | 20 | ordine +3 | 0 |
| Simo | Thailandia | 26 | 26 | 0 | 8 | 3 | 14 | OUT +2 | -1 |
| Marino | Aragon | 28 | — | — | — | — | — | — | — |
| Alessandro | Spagna | 19 | 19 | 0 | 5 | 3 | 12 | 0 | -1 |
| Alessandro | UK | 22 | 22 | 0 | 5 | 9 | 7 | OUT +2 | -1 |

\* L’uso di malus `0` per 2 NC appartiene al modello analitico corrente; non è una regola storica confermata.

Dei 9 casi ricostruibili:

- 7 coincidono;
- Niky/Thailandia differisce di `+1`;
- Marty/Catalogna differisce di `+9`.

---

# Tabella 2 — Niky / Thailandia

## 2.1 Prediction entries

| Tipo | Posizione | Valore |
|---|---:|---|
| POLE | — | Marco Bezzecchi |
| QUALIFYING_TIME | — | 88.526 s |
| SPRINT | P1 | Marco Bezzecchi |
| SPRINT | P2 | Marc Marquez |
| SPRINT | P3 | Fabio Di Giannantonio |
| RACE | P1 | Marc Marquez |
| RACE | P2 | Marco Bezzecchi |
| RACE | P3 | Pedro Acosta |
| RACE | P4 | Raul Fernandez |
| RACE | P5 | Alex Marquez |
| RACE_OUT | — | Joan Mir |

I campi `points` delle entry storiche risultano `0`; i punti sotto sono una ricostruzione locale e non una lettura di un breakdown persistito.

## 2.2 Qualifica

| Componente | Prediction | Risultato ufficiale | Calcolo | Punti |
|---|---|---|---|---:|
| Pole | Marco Bezzecchi | Marco Bezzecchi P1 | P1 corretta | 5 |
| Tempo | 88.526 s | 88.652 s | errore 0.126 s; relativo 0.1421% | 3 |
| **Totale Qualifica** | | | `5 + 3` | **8** |

## 2.3 Sprint

Risultato ufficiale rilevante: Pedro Acosta P1, Marc Marquez P2, Raul Fernandez P3; Marco Bezzecchi è `NOT_CLASSIFIED`, Fabio Di Giannantonio è fuori dalla tolleranza.

| Slot | Prediction | Risultato | Regola | Punti |
|---|---|---|---|---:|
| P1 | Marco Bezzecchi | NOT_CLASSIFIED | nessun punto | 0 |
| P2 | Marc Marquez | P2 | esatta | 3 |
| P3 | Fabio Di Giannantonio | oltre ±1 | nessun punto | 0 |
| **Totale Sprint** | | | `0 + 3 + 0` | **3** |

## 2.4 Gara

Top 5 ufficiale: Marco Bezzecchi, Pedro Acosta, Raul Fernandez, Jorge Martin, Ai Ogura.

| Slot | Prediction | Risultato ufficiale | Status | Regola | Punti |
|---|---|---:|---|---|---:|
| P1 | Marc Marquez | NC | NOT_CLASSIFIED | nessun punto | 0 |
| P2 | Marco Bezzecchi | P1 | CLASSIFIED | differenza 1, ancora Top 5 | 3 |
| P3 | Pedro Acosta | P2 | CLASSIFIED | differenza 1, ancora Top 5 | 3 |
| P4 | Raul Fernandez | P3 | CLASSIFIED | differenza 1, ancora Top 5 | 3 |
| P5 | Alex Marquez | NC | NOT_CLASSIFIED | nessun punto | 0 |
| **Race posizione** | | | | `0 + 3 + 3 + 3 + 0` | **9** |

## 2.5 OUT, bonus e malus

| Elemento | Dato | Modello analitico corrente |
|---|---|---:|
| OUT | Joan Mir = NOT_CLASSIFIED | +2 |
| Posizioni esatte | 0 | 0 |
| Tutti e 5 nella Top 5 | no | 0 |
| Race rider NC | Marc Marquez, Alex Marquez | 2 |
| Malus per 2 NC | soglia non documentata | 0 nel modello |

Conteggi distinti:

- piloti NC nei cinque Race: **2**;
- pilota OUT NC: **1**;
- piloti selezionati NC includendo anche OUT: **3**;
- la formula analitica conta il malus sui cinque Race, non sull’OUT.

## 2.6 Totale e valore necessario

Con il modello analitico:

```text
Qualifica 8
+ Sprint 3
+ Race posizione 9
+ OUT 2
+ Bonus 0
+ Malus 0
= 22
```

La parte certa prima di OUT/malus vale:

```text
8 + 3 + 9 = 20
```

Per arrivare allo storico `21`, il contributo netto richiesto è:

```text
OUT + malus = +1
```

Le due combinazioni compatibili con le fonti sono:

| Ipotesi | OUT | Malus 2 NC | Totale |
|---|---:|---:|---:|
| H1 | +1 | 0 | 21 |
| H2 | +2 | -1 | 21 |

Non esiste una fonte che scelga univocamente H1 o H2.

Il precedente modello prudente del repository osservava OUT storico `+1`, ma dichiarava esplicitamente il malus non risolto. Inoltre, nei fixture storici con 2 NC il residuo necessario è talvolta `0` e talvolta `−1`. Niky/Thailandia non può quindi dimostrare da solo quale delle due regole fosse usata.

---

# Tabella 3 — Marty / Catalogna

## 3.1 Prediction entries

| Tipo | Posizione | Valore |
|---|---:|---|
| POLE | — | Pedro Acosta |
| QUALIFYING_TIME | — | 97.589 s |
| SPRINT | P1 | Alex Marquez |
| SPRINT | P2 | Pedro Acosta |
| SPRINT | P3 | Fabio Di Giannantonio |
| RACE | P1 | Alex Marquez |
| RACE | P2 | Fabio Di Giannantonio |
| RACE | P3 | Jorge Martin |
| RACE | P4 | Raul Fernandez |
| RACE | P5 | Pedro Acosta |
| RACE_OUT | — | Brad Binder |

## 3.2 Qualifica

| Componente | Prediction | Risultato ufficiale | Calcolo | Punti |
|---|---|---|---|---:|
| Pole | Pedro Acosta | Pedro Acosta P1 | P1 corretta | 5 |
| Tempo | 97.589 s | 98.068 s | errore 0.479 s; relativo 0.4884% | 1 |
| **Totale Qualifica** | | | `5 + 1` | **6** |

## 3.3 Sprint

Risultato ufficiale: Alex Marquez P1, Pedro Acosta P2, Fabio Di Giannantonio P3.

| Slot | Prediction | Risultato | Regola | Punti |
|---|---|---:|---|---:|
| P1 | Alex Marquez | P1 | esatta | 3 |
| P2 | Pedro Acosta | P2 | esatta | 3 |
| P3 | Fabio Di Giannantonio | P3 | esatta | 3 |
| **Totale Sprint** | | | `3 + 3 + 3` | **9** |

## 3.4 Gara

Top 5 ufficiale: Pedro Acosta, Raul Fernandez, Jorge Martin, Fabio Di Giannantonio, Johann Zarco.

| Slot | Prediction | Risultato ufficiale | Status | Regola | Punti |
|---|---|---:|---|---|---:|
| P1 | Alex Marquez | NC | NOT_CLASSIFIED | nessun punto | 0 |
| P2 | Fabio Di Giannantonio | P4 | CLASSIFIED | altro pilota nella Top 5 | 1 |
| P3 | Jorge Martin | P3 | CLASSIFIED | esatta | 5 |
| P4 | Raul Fernandez | P2 | CLASSIFIED | altro pilota nella Top 5 | 1 |
| P5 | Pedro Acosta | P1 | CLASSIFIED | altro pilota nella Top 5 | 1 |
| **Race posizione** | | | | `0 + 1 + 5 + 1 + 1` | **8** |

## 3.5 OUT, bonus e malus

| Elemento | Dato | Punti |
|---|---|---:|
| OUT | Brad Binder = CLASSIFIED | 0 |
| Posizioni esatte | 1 | 0 |
| Tutti e 5 nella Top 5 | no | 0 |
| Race rider NC | Alex Marquez | 1 |
| Malus analitico per 1 NC | | -1 |

## 3.6 Somma completa che produce 22

```text
Pole                    5
Qualifying Time         1
Sprint                  9
Race posizione          8
OUT                     0
Bonus ordine/Top 5      0
Malus                  -1
                       ──
Totale                 22
```

## 3.7 Simulazioni teoriche per arrivare a 13

Se Qualifica `6` e Sprint `9` restano confermate:

```text
13 − 6 − 9 = -2
```

La Gara complessiva dovrebbe quindi valere `−2`. Poiché i punti posizione verificati valgono `8` e OUT/bonus valgono `0`, servirebbe:

```text
8 + malus = -2
malus = -10
```

### Simulazione T1 — cambiare solo il malus

| Qualifica | Sprint | Race | OUT/bonus | Malus | Totale |
|---:|---:|---:|---:|---:|---:|
| 6 | 9 | 8 | 0 | -10 | 13 |

Questa è la modifica numerica minima a una sola componente, ma richiederebbe `−10` per un solo Race rider NC. Contraddice sia il regolamento documentato (`−1`) sia i fixture storici, che non dimostrano questa regola.

### Simulazione T2 — omettere tempo e Race, malus -1

| Pole | Tempo | Sprint | Race | OUT/bonus | Malus | Totale |
|---:|---:|---:|---:|---:|---:|---:|
| 5 | 0 | 9 | 0 | 0 | -1 | 13 |

Questa combinazione produce anch’essa `13`, ma richiede contemporaneamente:

- omissione del tempo Qualifica (`−1`);
- azzeramento di tutti gli 8 punti posizione Gara (`−8`);
- malus `−1`.

Nessuna versione storica della RPC trovata nel repository implementa o documenta questa combinazione.

### Confronto con gli aggregati persistiti osservati

Il precedente audit aveva osservato per questa prediction:

```text
qualifying_points = 5
sprint_points     = 9
race_points       = 0
bonus_points      = 0
malus_points      = -10
total_points      = 4
```

Questi aggregati non producono `13`. Aggiungere il solo tempo Qualifica corretto `+1` porterebbe il totale a `5`, non a `13`.

Il `13` è quindi un riferimento storico separato dal totale persistito `4` e dal calcolo locale `22`.

### Conclusione Marty/Catalogna

Sono matematicamente possibili più combinazioni che producono `13`, ma nessuna è identificabile come regola storica autorevole. La causa non può essere attribuita soltanto al tempo Qualifica.

---

# Qualifying Time — analisi indipendente

Il contributo del tempo corretto nei 9 casi disponibili è:

| Utente | GP | Tempo predetto | Tempo ufficiale | Punti tempo | Il caso cambia? |
|---|---|---:|---:|---:|---|
| Niky | Thailandia | 88.526 | 88.652 | 3 | sì |
| Niky | Brasile | 77.850 | 77.410 | 0 | no |
| Niky | Francia | 89.430 | 89.634 | 3 | sì |
| Niky | Aragon | 105.128 | 104.962 | 3 | sì |
| Marty | Catalogna | 97.589 | 98.068 | 1 | sì |
| Marty | Italia | 104.000 | 103.921 | 5 | sì |
| Simo | Thailandia | 88.467 | 88.652 | 3 | sì |
| Alessandro | Spagna | 103.274 | 108.087 | 0 | no |
| Alessandro | UK | 116.128 | 116.160 | 5 | sì |
| **Totale** | | | | **23** | **7 su 9** |

Effetto sui due delta prioritari:

- Niky/Thailandia: il `+3` è già incluso nel ricostruito `22`; senza tempo si avrebbe `19`. Non spiega il punto residuo.
- Marty/Catalogna: il `+1` è già incluso nel ricostruito `22`; senza tempo si avrebbe `21`. Non spiega il delta di 9.
- Sugli aggregati persistiti di Marty/Catalogna, aggiungere `+1` porta `4 → 5`, non `4 → 13`.

Il problema Qualifying Time è quindi reale ma indipendente dalle due discrepanze residue.

---

# Bonus — confronto A/B

## Interpretazione A

```text
5 posizioni esatte → +5
4 posizioni esatte → +3
3 posizioni esatte → +1
tutti e 5 comunque nella Top 5 → +2
```

## Interpretazione B

```text
solo tutti e 5 comunque nella Top 5 → +2
```

## Verifica sui casi già riconciliati

Marty/Italia:

```text
Qualifica = 5
Sprint = 2
Race posizione = 20
4 posizioni esatte = +3
Totale A = 5 + 2 + 20 + 3 = 30
Totale B = 5 + 2 + 20 = 27
Atteso = 30
```

Conclusione:

- **A è compatibile ed è necessaria** per spiegare Marty/Italia `30`;
- **B è incompatibile** con almeno questo caso;
- A resta distinta dal regolamento pubblico che descrive anche bonus basati sul numero di piloti comunque presenti nella Top 5.

---

# Malus — tutte le cardinalità

## Formula analitica documentata

Il modello locale del repository usa:

| Race rider NC | Malus modello |
|---:|---:|
| 0 | 0 |
| 1 | -1 |
| 2 | 0 |
| 3 | -5 |
| 4 | 0 |
| 5 | -10 |

Questa è una formula implementata nello script analitico, non la prova della RPC storica.

## Evidenza ricavata dai fixture storici precedenti

Per ogni fixture è stato sottratto dal punteggio Gara storico il contributo posizione certo e l’OUT prudenziale `+1`. Il residuo necessario è ciò che dovrebbe essere spiegato dal malus o da un’altra regola non osservata.

| Race rider NC | Fixture disponibili | Residui richiesti |
|---:|---:|---|
| 0 | 1 | 0 |
| 1 | 3 | 0, -1, -1 |
| 2 | 4 | 0, 0, -1, 0 |
| 3 | 1 | -1 |
| 4 | 1 | -5 |
| 5 | 0 | nessuna evidenza |

Questa matrice dimostra che:

- per lo stesso conteggio di 1 NC compaiono residui `0` e `−1`;
- per lo stesso conteggio di 2 NC compaiono residui `0` e `−1`;
- il solo caso con 3 NC richiede `−1`, non `−5`;
- il solo caso con 4 NC richiede `−5`, non `0`;
- non esiste un caso storico osservato con 5 NC;
- la formula storica non è deducibile dal solo numero di `NOT_CLASSIFIED`.

Le differenze possono dipendere da DNF/DNS/DSQ/NOT_IN_RESULT, da regole non conservate o da anomalie dello storico. Il dataset disponibile non distingue abbastanza questi casi.

---

# Tabella 4 — Regole storiche deducibili

| Area | Regola deducibile | Stato | Evidenza/limite |
|---|---|---|---|
| Qualifying Time | 10 / 5 / 3 / 1 / 0 con soglie inclusive | **CONFERMATA** | formula locale e casi storici coerenti |
| Pole | P1 +5, P2 +2, altro 0 | **CONFERMATA** | casi ricostruiti |
| Sprint | esatta +3, ±1 +1, oltre/NC 0 | **CONFERMATA** | casi ricostruiti |
| Race esatta | +5 | **CONFERMATA** | casi ricostruiti |
| Race ±1 nella Top 5 | +3 | **CONFERMATA** | casi ricostruiti |
| Altro pilota nella Top 5 | +1 | **CONFERMATA** | casi ricostruiti |
| Pilota oltre P5 | 0 | **CONFERMATA per il modello storico prudente** | vecchio audit rimuove il punto adiacente oltre Top 5 |
| Bonus ordine 5/4/3 esatte | +5 / +3 / +1 | **PARZIALMENTE CONFERMATA** | +3 necessario per Marty/Italia; copertura incompleta per gli altri scaglioni |
| Bonus tutti e 5 nella Top 5 | +2 | **COMPATIBILE** | Niky/Brasile; non isola da solo ogni componente |
| Interpretazione bonus B | solo +2 tutti Top 5 | **INCOMPATIBILE** | Marty/Italia sarebbe 27 invece di 30 |
| OUT classificato | 0 | **CONFERMATO nei casi esaminati** | Marty/Catalogna |
| OUT non classificato | +1 oppure +2 | **INDETERMINATO** | storico prudente suggerisce +1; regolamento corrente usa +2 |
| Malus 1 NC | 0 oppure -1 nei fixture | **INDETERMINATO** | risultati non uniformi |
| Malus 2 NC | 0 oppure -1 nei fixture | **INDETERMINATO** | rilevante per Niky/Thailandia |
| Malus 3 NC | unico residuo osservato -1 | **NON GENERALIZZABILE** | un solo fixture |
| Malus 4 NC | unico residuo osservato -5 | **NON GENERALIZZABILE** | un solo fixture |
| Malus 5 NC | nessun caso | **SCONOSCIUTO** | assenza di evidenza |
| DNF/DNS/DSQ/NOT_IN_RESULT | trattamento distinto | **SCONOSCIUTO** | risultati live espongono soprattutto CLASSIFIED/NOT_CLASSIFIED |

---

# Ricerca repository e cronologia Git

Sono stati cercati:

- vecchie versioni dello scoring;
- migration;
- backup;
- report `.md`;
- fixture;
- script storici;
- test;
- commit contenenti `score_prediction`, `OUT`, bonus, malus, Marty e Catalogna.

Commit e famiglie di file verificati includono:

- prima implementazione dichiarata dello scoring server-side;
- correzione della funzione tempi Qualifica;
- introduzione e successive modifiche del modello analitico storico;
- import e scoring dello storico;
- audit della RPC;
- protezione delle prediction incomplete.

Esito:

1. nel repository non è presente il corpo SQL di `score_prediction`;
2. le migration versionate contengono la funzione tempi Qualifica e il carry-over, non una definizione storica completa della RPC;
3. `scripts/analyze-historical-fantamotogp.mjs` è un modello locale analitico, non codice usato dall’app;
4. il suo helper prudente usa OUT `+1`, ma dichiara il malus non risolto;
5. il modello analitico completo usa OUT `+2` e malus `-1/0/-5/0/-10`, ma fallisce 10 dei 72 test di categoria e 10 dei 29 totali GP;
6. i fixture di quel modello riguardano Gran Bretagna, Italia e Ungheria, non i casi prioritari Thailandia/Catalogna;
7. nessun commit o file contiene una formula autorevole che produca `13` per Marty/Catalogna;
8. il valore `13` compare come riferimento storico nell’audit, non come output derivato da una funzione verificabile.

---

# Conclusione

## 1. Regole definitivamente confermate

- Pole P1 `+5`, P2 `+2`, altro `0`.
- Tempo Qualifica con soglie inclusive `10/5/3/1/0`.
- Sprint `3/1/0`.
- Race: esatta `5`, ±1 nella Top 5 `3`, altro pilota nella Top 5 `1`, oltre P5/NC `0`.
- OUT classificato `0`.
- L’interpretazione bonus B non basta; il bonus ordine `+3` per quattro posizioni esatte è necessario per Marty/Italia.
- Il tempo Qualifica è indipendente dai delta residui di Thailandia e Catalogna.

## 2. Regole ancora indeterminate

- OUT storico non classificato: `+1` o `+2`.
- Malus storico per 1–5 NC.
- Distinzione storica tra NOT_CLASSIFIED, DNF, DNS, DSQ e NOT_IN_RESULT.
- Combinazione esatta che ha prodotto Marty/Catalogna `13`.
- Corpo e comportamento interno della RPC storica.

## 3. Minima modifica futura alla RPC

Non è ancora dimostrabile una modifica unica che garantisca tutti i punteggi storici.

La parte minima già giustificata è:

1. leggere `QUALIFYING_TIME.predicted_time` dalle entry quando presente;
2. convertire entrambi i tempi in secondi;
3. applicare la funzione Qualifica esistente.

Questa correzione non risolve i due casi prioritari.

Prima di modificare OUT/malus, serve una decisione funzionale esplicita:

- per Niky/Thailandia scegliere tra H1 e H2;
- per Marty/Catalogna stabilire se il `13` deriva da un breakdown storico non ancora disponibile oppure se il riferimento deve restare un’eccezione non riproducibile.

Senza questa decisione, cambiare la RPC significherebbe inventare una regola.

## 4. Dati che non devono essere modificati

- prediction storiche;
- `prediction_entries`;
- aggregati storici approvati;
- `session_results`;
- risultati ufficiali;
- schema e RLS;
- utenti e leghe;
- funzione Qualifica già verificata;
- dati mancanti di Marino/Aragon.

## Stato finale

```text
Database modificato: NO
RPC modificata: NO
Dati modificati: NO
Prediction create: NO
Fixture persistenti create: NO
Migration create/apply: NO
score_prediction chiamata: NO
```