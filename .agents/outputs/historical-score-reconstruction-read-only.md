# Ricostruzione read-only dello scoring storico

**Data:** 2 settembre 2026  
**Lega verificata:** FantaTest (`TEST01`)  
**Stagione:** 2026  
**Perimetro:** i 10 casi obbligatori indicati nella richiesta

## 1. Vincoli rispettati

L’analisi è stata eseguita esclusivamente in lettura:

- `score_prediction` **non è stata chiamata**;
- nessuna `INSERT`, `UPDATE`, `DELETE`, `UPSERT` o migrazione;
- nessuna modifica a `predictions`, `prediction_entries`, `session_results`, RPC, schema o RLS;
- nessun pronostico o risultato ufficiale è stato creato o alterato;
- i calcoli dei punti sono stati eseguiti localmente sui dati letti.

Sono state lette:

- le `prediction_entries` dei casi disponibili;
- i risultati ufficiali delle sessioni `Q`, `SPR` e `RAC`;
- i tempi ufficiali della Pole;
- le regole documentate nella pagina/regolamento storico del progetto;
- la firma osservabile della RPC e la definizione disponibile della funzione Qualifica.

Per i 10 casi sono state trovate **38 prediction** e **370 entry**. Per le sessioni rilevanti sono stati letti **533 risultati ufficiali**.

## 2. Fonti e livello di certezza

| Fonte | Informazione | Certezza |
|---|---|---|
| `attached_assets/Pasted-L-audit-read-only-ha-individuato-il-problema-principale_1788351580548.txt` | casi obbligatori e totali storici attesi | riferimento fornito |
| `attached_assets/Pasted-GP-Utente-Pole-position-tempo-pole-1-sprint-2-sprint-3-_1788342259417.txt` | pronostici storici di Pole, tempo, Sprint, Gara e OUT | verificata |
| Supabase REST `prediction_entries` | entry effettivamente presenti e rider associati | verificata |
| Supabase REST `session_results` | posizione, status e tempo ufficiale | verificata |
| `attached_assets/Pasted--Task-14-Implementazione-pagina-Regolamento-Il-report-p_1787296204024.txt` | regolamento pubblicato: punti base e bonus/malus documentati | verificata come documentazione |
| `supabase/migrations/20260820122000_fix_qualifying_time_points.sql` | formula locale della funzione tempi Qualifica | verificata nel workspace |
| `public.score_prediction(uuid)` | firma RPC osservabile | verificata |
| corpo SQL di `score_prediction` | formule interne, ritorno e ordine delle operazioni | **non disponibile** |

La sola firma della RPC non consente di dedurre il suo corpo SQL. Per questo il confronto con lo scoring corrente è distinto tra comportamento osservato, regolamento documentato e comportamento non verificabile.

## 3. Metodo matematico usato

Per verificare la compatibilità con i punteggi storici è stata usata la formula più restrittiva espressa nella richiesta:

```text
Totale GP =
  Qualifica
  + Sprint
  + Gara posizione
  + Bonus ordine
  + Bonus Top 5 per tutti e 5
  + Bonus OUT
  + Malus
```

### Qualifica

```text
Pole P1 = 5
Pole P2 = 2
altra posizione = 0
```

Per il tempo:

```text
errore assoluto ≤ 0,010 s       → 10
errore relativo ≤ 0,1%           → 5
errore relativo ≤ 0,25%          → 3
errore relativo ≤ 0,5%           → 1
oltre                           → 0
```

I limiti sono inclusivi e la soglia assoluta viene valutata per prima.

Nel database il tempo in `prediction_entries.predicted_time` è memorizzato in secondi numerici. Il tempo ufficiale è memorizzato in `session_results.total_time` come stringa, ad esempio `1'28.652`, convertita localmente in `88.652` secondi.

### Sprint

Per ciascuna delle tre posizioni:

```text
posizione esatta       → 3
una posizione di errore → 1
oltre                  → 0
non classificato/assente → 0
```

### Gara

Per ciascuna delle cinque posizioni pronosticate:

```text
posizione esatta nella Top 5             → 5
una posizione di errore, ancora in Top 5 → 3
altro pilota nella Top 5                 → 1
oltre la Top 5                           → 0
non classificato/assente                 → 0
```

Il caso `P5 → P6` è quindi `0`.

### Bonus

Per la ricostruzione storica è stata applicata questa regola:

```text
5 posizioni esatte → +5
4 posizioni esatte → +3
3 posizioni esatte → +1
5 piloti comunque nella Top 5 → +2
```

Il bonus ordine è considerato a scaglione, non come somma simultanea di `+5`, `+3` e `+1`. Il `+2` Top 5 è cumulabile con il bonus ordine.

Il regolamento pubblicato nel Task 14 contiene anche `+3` per 4 piloti nella Top 5 e `+1` per 3 piloti nella Top 5. Questi due bonus **non sono stati applicati** nella ricostruzione storica, perché la richiesta corrente indica esplicitamente il solo `+2` quando tutti e 5 i piloti sono nella Top 5.

### OUT e malus

Per il confronto è stato usato il regolamento documentato:

```text
OUT non classificato/non finisher → +2
OUT classificato                  → 0
```

Per il malus sono state usate solo le soglie dichiarate:

```text
1 pilota selezionato non classificato → -1
3 piloti selezionati non classificati → -5
5 piloti selezionati non classificati → -10
```

Per 2 o 4 piloti non classificati non esiste nella documentazione una regola deterministica. Nei calcoli sotto questo caso è indicato come **non determinabile** e il totale numerico “strict” usa `0` soltanto per misurare la differenza, non come regola storica dimostrata.

## 4. Risultato complessivo

`Delta = Ricostruito − Atteso`.

La colonna `Gara` contiene solo i punti posizione P1-P5. La colonna `Bonus` comprende bonus ordine, bonus Top 5 e bonus OUT.

| Caso | Atteso | Ricostruito strict | Delta | Qualifica | Sprint | Gara | Bonus | Malus |
|---|---:|---:|---:|---:|---:|---:|---|---:|
| Niky / Thailandia | 21 | 22 | +1 | 8 | 3 | 9 | OUT +2 | 0* |
| Niky / Brasile | 25 | 25 | 0 | 0 | 6 | 15 | Top 5 +2, OUT +2 = 4 | 0 |
| Niky / Francia | 18 | 18 | 0 | 3 | 2 | 12 | OUT +2 | -1 |
| Niky / Aragon | 24 | 24 | 0 | 5 | 5 | 14 | 0 | 0 |
| Marty / Catalogna | 13 | 22 | +9 | 6 | 9 | 8 | 0 | -1 |
| Marty / Italia | 30 | 30 | 0 | 5 | 2 | 20 | ordine +3 | 0 |
| Simo / Thailandia | 26 | 26 | 0 | 8 | 3 | 14 | OUT +2 | -1 |
| Marino / Aragon | 28 | — | — | — | — | — | — | — |
| Alessandro / Spagna | 19 | 19 | 0 | 5 | 3 | 12 | 0 | -1 |
| Alessandro / UK | 22 | 22 | 0 | 5 | 9 | 7 | OUT +2 | -1 |

\* Niky/Thailandia ha due selezionati `NOT_CLASSIFIED`; il regolamento fornito non definisce la soglia per 2. Il valore `0` è quindi un’ipotesi di calcolo diagnostico, non una regola storica provata.

**Esito:** 7 casi con prediction presente coincidono esattamente; 2 casi con prediction presente non coincidono; 1 caso non è ricostruibile per assenza della prediction.

## 5. Dimostrazione matematica per caso

### Niky — Thailandia

Qualifica:

```text
tempo: 88.526 − 88.652 = 0.126 s → 3 punti
Pole: Marco Bezzecchi ufficiale P1 → 5 punti
Qualifica = 3 + 5 = 8
```

Sprint:

```text
P1 Marco Bezzecchi → NOT_CLASSIFIED = 0
P2 Marc Marquez → P2 = 3
P3 Fabio Di Giannantonio → P8 = 0
Sprint = 0 + 3 + 0 = 3
```

Gara:

```text
Marc Marquez → NOT_CLASSIFIED = 0
Marco Bezzecchi P2 → P1 = 3
Pedro Acosta P3 → P2 = 3
Raul Fernandez P4 → P3 = 3
Alex Marquez → NOT_CLASSIFIED = 0
Gara posizione = 0 + 3 + 3 + 3 + 0 = 9
```

Joan Mir, indicato come OUT, è `NOT_CLASSIFIED`, quindi il regolamento documentato assegna `+2`. La somma strict è:

```text
8 + 3 + 9 + 2 + 0 = 22
```

Il riferimento storico disponibile per Niky/Thailandia riporta `Qualifica=8`, `Sprint=3`, `Gara=10`, `Totale=21`. Per ottenere `Gara=10` dalla base dimostrata `9`, il dato storico richiede un contributo netto di `+1`, non di `+2`; tuttavia senza una colonna storica separata OUT/malus non è possibile dimostrare se la differenza sia:

- OUT storico `+1`; oppure
- OUT `+2` combinato con una penalità storica di `-1` per la situazione con 2 non classificati; oppure
- un’altra regola non documentata.

La causa esatta è quindi **una differenza storica non risolvibile univocamente tra OUT e malus**.

### Niky — Brasile

```text
Qualifica:
  tempo 77.850 vs 77.410 → 0
  Pole Marc Marquez ufficiale P3 → 0
  Qualifica = 0

Sprint = 3 + 0 + 3 = 6
Gara posizione = 1 + 3 + 5 + 1 + 5 = 15
Bonus Top 5 = +2
OUT Brad Binder NOT_CLASSIFIED = +2
Malus = 0

Totale = 0 + 6 + 15 + 2 + 2 = 25
```

Il totale coincide. Questo caso dimostra anche che il bonus Top 5 e il bonus OUT sono compatibili con la somma del riferimento storico.

### Niky — Francia

```text
Qualifica:
  tempo 89.430 vs 89.634 → 3
  Pole Fabio Di Giannantonio ufficiale P4 → 0
  Qualifica = 3

Sprint = 0 + 1 + 1 = 2
Gara posizione = 3 + 3 + 0 + 3 + 3 = 12
OUT Joan Mir NOT_CLASSIFIED = +2
Malus per un selezionato NOT_CLASSIFIED = -1

Totale = 3 + 2 + 12 + 2 − 1 = 18
```

Il totale coincide.

### Niky — Aragon

```text
Qualifica:
  tempo 105.128 vs 104.962 → 3
  Pole Marc Marquez ufficiale P2 → 2
  Qualifica = 5

Sprint = 3 + 1 + 1 = 5
Gara posizione = 5 + 1 + 5 + 3 + 0 = 14
OUT Joan Mir CLASSIFIED → 0
Malus = 0

Totale = 5 + 5 + 14 = 24
```

Il totale coincide.

### Marty — Catalogna

```text
Qualifica:
  tempo 97.589 vs 98.068 → 1
  Pole Pedro Acosta ufficiale P1 → 5
  Qualifica = 6

Sprint = 3 + 3 + 3 = 9
Gara posizione = 0 + 1 + 5 + 1 + 1 = 8
OUT Brad Binder CLASSIFIED → 0
Malus per un selezionato NOT_CLASSIFIED = -1

Totale strict = 6 + 9 + 8 − 1 = 22
```

Il riferimento atteso è `13`, quindi il delta è `+9`.

Non esiste nei dati letti una combinazione documentata di OUT, bonus o malus che trasformi `22` in `13`:

- l’OUT è classificato e non assegna punti;
- non ci sono 3 o 5 selezionati non classificati;
- il bonus ordine è 0;
- il bonus Top 5 binario è 0;
- le singole componenti calcolate da entry e risultati sono determinate.

La causa esatta non è dimostrabile con il solo totale storico atteso. Sono necessarie le componenti storiche originali di questo caso oppure la fonte che ha prodotto il `13`. Non è corretto attribuire automaticamente il delta a Qualifica, OUT o malus.

### Marty — Italia

```text
Qualifica:
  tempo 104.000 vs 103.921 → 5
  Pole Fabio Di Giannantonio ufficiale P7 → 0
  Qualifica = 5

Sprint = 0 + 1 + 1 = 2
Gara posizione = 5 + 5 + 5 + 0 + 5 = 20
4 posizioni esatte → bonus ordine +3
OUT Marc Marquez CLASSIFIED → 0
Malus = 0

Totale = 5 + 2 + 20 + 3 = 30
```

Il totale coincide.

### Simo — Thailandia

```text
Qualifica:
  tempo 88.467 vs 88.652 → 3
  Pole Marco Bezzecchi ufficiale P1 → 5
  Qualifica = 8

Sprint = 0 + 3 + 0 = 3
Gara posizione = 0 + 3 + 3 + 3 + 5 = 14
OUT Joan Mir NOT_CLASSIFIED = +2
Malus per un selezionato NOT_CLASSIFIED = -1

Totale = 8 + 3 + 14 + 2 − 1 = 26
```

Il totale coincide.

### Marino — Aragon

Non esiste una `prediction` live per la chiave utente/GP/lega e non esiste una riga corrispondente nella sorgente TSV analizzata. Di conseguenza non sono disponibili:

- Pole;
- tempo Qualifica;
- Top 3 Sprint;
- Top 5 Gara;
- OUT;
- entry da confrontare.

Il valore atteso `28` non è quindi matematicamente ricostruibile con le fonti attuali. Non deve essere trasformato in uno zero né usato per creare una prediction mancante.

### Alessandro — Spagna

```text
Qualifica:
  tempo 103.274 vs 108.087 → 0
  Pole Marc Marquez ufficiale P1 → 5
  Qualifica = 5

Sprint = 3 + 0 + 0 = 3
Gara posizione = 0 + 3 + 3 + 3 + 3 = 12
OUT Joan Mir CLASSIFIED → 0
Malus per un selezionato NOT_CLASSIFIED = -1

Totale = 5 + 3 + 12 − 1 = 19
```

Il totale coincide.

### Alessandro — UK

```text
Qualifica:
  tempo 116.128 vs 116.160 → 5
  Pole Marco Bezzecchi ufficiale P5 → 0
  Qualifica = 5

Sprint = 3 + 3 + 3 = 9
Gara posizione = 1 + 5 + 0 + 0 + 1 = 7
OUT Joan Mir NOT_CLASSIFIED = +2
Malus per un selezionato NOT_CLASSIFIED = -1

Totale = 5 + 9 + 7 + 2 − 1 = 22
```

Il totale coincide.

## 6. Cosa dimostrano i casi rispetto alle regole

### Qualify time

Il tempo può essere ricostruito direttamente da `prediction_entries`:

```text
prediction_entries.prediction_type = QUALIFYING_TIME
prediction_entries.predicted_time   = secondi pronosticati
session_results.position = 1         = Pole ufficiale
session_results.total_time            = tempo ufficiale
```

Il campo aggregato `predictions.qualifying_pole_time` non è necessario per leggere il valore quando l’entry esiste. L’audit precedente ha rilevato molte entry Qualifica presenti con il campo aggregato nullo; questo è un problema del percorso di lettura/scoring, non una ragione per modificare lo schema o riempire artificialmente i dati.

Il formato è compatibile dopo conversione:

```text
prediction_entries.predicted_time: numerico in secondi
session_results.total_time:        stringa M'SS.mmm
```

Non è stato osservato un errore generale di unità. Le differenze tra i nove casi disponibili derivano dai valori confrontati e dalle regole bonus/malus, non da una conversione secondi/millisecondi.

### OUT

L’entry OUT è conservata come:

```text
prediction_entries.prediction_type = RACE_OUT
prediction_entries.rider_id
```

Nei casi verificati l’identificativo può essere confrontato con il risultato Gara. I risultati live usano però gli status `CLASSIFIED` e `NOT_CLASSIFIED`; non sono stati osservati token separati `DNF`, `DNS`, `DSQ` o `OUT`. Non è quindi possibile dimostrare che tutti questi status siano trattati allo stesso modo dalla RPC.

Il caso Niky/Thailandia indica inoltre che il valore storico effettivo del contributo OUT/malus non è ricostruibile in modo univoco dal solo totale.

### Bonus

I casi con totale coincidente supportano la seguente ricostruzione storica:

- bonus ordine a scaglione `5/3/1`;
- bonus Top 5 `+2` solo quando tutti e 5 sono nella Top 5;
- cumulabilità del bonus Top 5 con il bonus ordine;
- bonus OUT sommabile al resto della Gara.

Il regolamento pubblicato del Task 14, se applicato letteralmente con anche il bonus `+3` per 4 piloti e `+1` per 3 piloti nella Top 5, produrrebbe risultati diversi in più casi:

- Niky/Francia: il bonus per 4 nella Top 5 aggiungerebbe 3 punti;
- Simo/Thailandia: aggiungerebbe 3 punti;
- Alessandro/UK: il bonus per 3 nella Top 5 aggiungerebbe 1 punto.

Quindi il regolamento pubblico corrente e il metodo storico non sono la stessa cosa.

### Malus

I casi con un solo `NOT_CLASSIFIED` sono compatibili con `-1`, mentre i casi senza non classificati sono compatibili con `0`.

Non è invece verificabile la soglia per 2 o 4 piloti non classificati, perché:

- la richiesta fornisce soglie 1, 3 e 5;
- il dataset live distingue solo `CLASSIFIED` e `NOT_CLASSIFIED`;
- la RPC non è stata chiamata;
- il corpo SQL di `score_prediction` non è disponibile.

## 7. Verifica del percorso RPC e visualizzazione

### RPC

La firma osservabile è:

```text
public.score_prediction(p_prediction_id uuid)
```

Il corpo SQL e il tipo di ritorno non sono disponibili nel catalogo REST/workspace. Non si può quindi dimostrare se la funzione:

- legga `QUALIFYING_TIME` da `prediction_entries`;
- privilegi `predictions.qualifying_pole_time`;
- applichi OUT `+1` o `+2`;
- assegni i bonus Top 5 `+3/+1`;
- tratti 2 o 4 non classificati;
- persista i punti delle singole entry;
- sia idempotente senza effetti collaterali.

L’invocazione è stata pertanto esclusa come richiesto.

### Persistenza

L’import storico conserva il breakdown delle scelte nelle `prediction_entries`, ma i campi `points` delle entry risultano `0`. I valori storici aggregati sono conservati nei campi della prediction:

```text
qualifying_points
sprint_points
race_points
bonus_points
malus_points
total_points
```

Questi aggregati non permettono da soli di ricostruire la formula che li ha prodotti.

### UI

La pagina risultati legge e visualizza gli aggregati della prediction per Qualifica, Sprint, Gara, Bonus, Malus e Totale. Il dettaglio delle entry mostra le scelte, ma non può ricavare retroattivamente i punti individuali quando `prediction_entries.points` è zero.

La visualizzazione quindi può mostrare un totale storico già persistito, ma non può provare né correggere il metodo storico senza un breakdown server-side verificabile.

## 8. Proposta minima, non applicata

Non esiste una singola modifica già dimostrabile come sufficiente per far coincidere tutti i casi, perché:

- Niky/Thailandia resta ambiguo tra OUT e malus per 2 non classificati;
- Marty/Catalogna richiede un totale storico `13` non derivabile dalle entry e dai risultati con le regole fornite;
- Marino/Aragon non ha prediction né entry;
- la definizione SQL reale di `score_prediction` non è disponibile.

La minima modifica tecnica da valutare **dopo conferma esplicita** è:

1. mantenere invariati schema, RLS, prediction, entry e risultati ufficiali;
2. modificare esclusivamente la funzione di scoring già esistente per leggere il tempo direttamente da `prediction_entries` quando `QUALIFYING_TIME` è presente;
3. convertire in modo esplicito il valore numerico dell’entry e il tempo ufficiale in secondi;
4. applicare la funzione Qualifica già esistente;
5. definire prima, in modo scritto e testabile, le regole storiche OUT, Top 5 e malus per 2/4 non classificati;
6. non usare il campo aggregato nullo come motivo per scartare un tempo presente nell’entry;
7. eseguire lo scoring soltanto dopo aver ottenuto il corpo SQL autorizzato e una tabella storica di componenti per i casi non riconciliati.

Questa proposta non viene applicata in questo audit. Un semplice fallback del tempo correggerebbe il difetto Qualifica, ma **non** garantirebbe da solo la corrispondenza con tutti i punteggi storici.

## 9. Conclusione separata

### A. Problemi nelle `prediction_entries`

- `QUALIFYING_TIME` è spesso presente nell’entry, ma il campo aggregato della prediction può essere nullo.
- Le entry storiche conservano le scelte, ma `points` è `0`; non esiste un breakdown individuale persistito.
- Marino/Aragon non ha prediction/entry disponibili.

### B. Problemi nei risultati ufficiali

- Per i nove casi con prediction i risultati Q, Sprint e Gara sono disponibili e utilizzabili.
- Gli status osservati sono `CLASSIFIED` e `NOT_CLASSIFIED`.
- Non è dimostrabile una distinzione tra DNF, DNS, DSQ e OUT.
- Non emerge un errore generale nei risultati ufficiali utilizzati.

### C. Problemi nel percorso/RPC di scoring

- Il campo aggregato Qualifica non è una fonte affidabile quando l’entry del tempo esiste.
- Il corpo SQL di `score_prediction` non è disponibile, quindi bonus, OUT e malus non sono verificabili nel codice server-side.
- Il comportamento storico non coincide sempre con il regolamento pubblicato.
- Non è possibile correggere responsabilmente il percorso senza prima fissare le regole ambigue.

### D. Problemi nella visualizzazione

- Gli aggregati possono essere visualizzati, ma il dettaglio individuale non è ricostruibile da entry con `points=0`.
- La UI non può distinguere da sola se un delta storico proviene da Qualifica, OUT, bonus o malus.
- Una correzione di visualizzazione non risolverebbe il disallineamento del calcolo.

## 10. Stato finale delle modifiche

```text
Database modificato: NO
RPC modificata: NO
Dati modificati: NO
Prediction create: NO
Prediction modificata: NO
Prediction_entries modificate: NO
Risultati ufficiali modificati: NO
RLS modificata: NO
Migration create: NO
score_prediction chiamata: NO
```