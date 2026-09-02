# Task 33 — Scoring storico Excel su TEST01

- Modalità: **DRY-RUN OBBLIGATORIO — NESSUNA SCRITTURA**
- Lega: **FantaTest** (TEST01)
- Stagione: **2026**
- Accesso dati: **solo GET Supabase REST/Auth**
- Regole applicate: **specifica offline Task 32 derivata dalle formule Excel**
- Risultati ufficiali del replay: **session_results live, senza ricalcolo Excel forzato**
- RPC scoring invocate: **0**

## Perimetro e sicurezza

- Righe sorgente analizzate: **139**
- Prediction nella lega TEST01: **113**
- Prediction storiche risolte dalla sorgente: **111**
- Prediction non presenti nella sorgente storica: **2**
- Entry delle prediction storiche selezionate: **1094**
- Prediction complete: **81**
- Prediction parziali escluse dal replay: **30**
- Prediction già marcate scored_at: **94**
- Complete già marcate scored_at: **81**
- Complete senza scored_at (candidati apply sicuri): **0**
- Parziali già marcate scored_at: **13**
- Parziali senza scored_at (bloccate): **17**

- Le prediction parziali non vengono completate, corrette, ricalcolate o inviate alla RPC.
- I campi aggregati database vengono soltanto letti e confrontati.
- Il confronto non certifica che i valori cache dei singoli workbook coincidano con gli attuali risultati ufficiali live.
- Il report locale è l’unico file scritto da questa esecuzione.

## Copertura risultati ufficiali

| GP | Prediction | Qualifica | Sprint | Gara |
|---|---:|---|---|---|
| THA | 10 | 22 risultati / FINISHED | 22 risultati / FINISHED | 22 risultati / FINISHED |
| BRA | 10 | 22 risultati / FINISHED | 22 risultati / FINISHED | 22 risultati / FINISHED |
| USA | 10 | 21 risultati / FINISHED | 21 risultati / FINISHED | 21 risultati / FINISHED |
| SPA | 8 | 23 risultati / FINISHED | 23 risultati / FINISHED | 23 risultati / FINISHED |
| FRA | 8 | 22 risultati / FINISHED | 22 risultati / FINISHED | 21 risultati / FINISHED |
| CAT | 9 | 22 risultati / FINISHED | 22 risultati / FINISHED | 22 risultati / FINISHED |
| ITA | 10 | 22 risultati / FINISHED | 22 risultati / FINISHED | 22 risultati / FINISHED |
| HUN | 10 | 22 risultati / FINISHED | 22 risultati / FINISHED | 22 risultati / FINISHED |
| CZE | 7 | 22 risultati / FINISHED | 21 risultati / FINISHED | 20 risultati / FINISHED |
| NED | 7 | 22 risultati / FINISHED | 22 risultati / FINISHED | 22 risultati / FINISHED |
| GER | 7 | 21 risultati / FINISHED | 20 risultati / FINISHED | 20 risultati / FINISHED |
| GBR | 9 | 23 risultati / FINISHED | 23 risultati / FINISHED | 23 risultati / FINISHED |
| ARA | 6 | 22 risultati / FINISHED | 22 risultati / FINISHED | 22 risultati / FINISHED |

## Esito replay offline

- Replay Excel completati: **81**
- Confronti categoria Q/S/R/T coincidenti: **1/81**
- Confronti componenti Q/S/racePosition/bonus/malus/T coincidenti: **0/81**
- Match singoli categorie: Q **27**, S **22**, R **3**, T **3**
- Match singoli componenti: Q **27**, S **22**, racePosition **0**, bonus **76**, malus **50**, T **3**
- Totali database coerenti con i propri componenti memorizzati: **81/81**
- Candidati per apply limitato a complete non scored: **0**

### Totali per utente sulle sole prediction complete

| Utente | Prediction | Match categorie | Match componenti | Totale Excel | Totale database | Delta |
|---|---:|---:|---:|---:|---:|---:|
| Nicholas | 12 | 0 | 0 | 106 | 175 | -69 |
| simo.salva92 | 11 | 0 | 0 | 105 | 139 | -34 |
| marty.bria1996 | 11 | 0 | 0 | 105 | 139 | -34 |
| alessandro.cavasso.1995 | 9 | 0 | 0 | 98 | 121 | -23 |
| ivan23dell | 10 | 1 | 0 | 95 | 82 | 13 |
| marino.dilorenzo | 8 | 0 | 0 | 66 | 97 | -31 |
| lucifero1966 | 6 | 0 | 0 | 46 | 70 | -24 |
| tommaso.strada95 | 6 | 0 | 0 | 42 | 45 | -3 |
| alandellosbel8 | 3 | 0 | 0 | 38 | 41 | -3 |
| dalla.pozza.silvia | 5 | 0 | 0 | 20 | 43 | -23 |

## Dettaglio prediction complete

| Utente | GP | Excel Q/S/R/T | DB Q/S/R/T | Excel componenti | DB componenti | Categorie | Componenti | scored_at |
|---|---|---|---|---|---|---|---|---|
| dalla.pozza.silvia | THA | qualifying=2, sprint=0, race=2, total=4 | qualifying=2, sprint=1, race=9, total=11 | qualifying=2, sprint=0, racePosition=3, bonus=0, malus=-1, total=4 | qualifying=2, sprint=1, racePosition=9, bonus=0, malus=-1, total=11 | DIFF | DIFF | valorizzato |
| tommaso.strada95 | THA | qualifying=2, sprint=0, race=4, total=6 | qualifying=2, sprint=1, race=9, total=11 | qualifying=2, sprint=0, racePosition=5, bonus=0, malus=-1, total=6 | qualifying=2, sprint=1, racePosition=9, bonus=0, malus=-1, total=11 | DIFF | DIFF | valorizzato |
| ivan23dell | THA | qualifying=5, sprint=1, race=7, total=13 | qualifying=5, sprint=1, race=7, total=13 | qualifying=5, sprint=1, racePosition=8, bonus=0, malus=-1, total=13 | qualifying=5, sprint=1, racePosition=7, bonus=0, malus=0, total=13 | PASS | DIFF | valorizzato |
| alessandro.cavasso.1995 | THA | qualifying=6, sprint=1, race=6, total=13 | qualifying=5, sprint=1, race=11, total=18 | qualifying=6, sprint=1, racePosition=5, bonus=2, malus=-1, total=13 | qualifying=5, sprint=1, racePosition=11, bonus=2, malus=-1, total=18 | DIFF | DIFF | valorizzato |
| lucifero1966 | THA | qualifying=5, sprint=2, race=2, total=9 | qualifying=2, sprint=1, race=7, total=10 | qualifying=5, sprint=2, racePosition=3, bonus=0, malus=-1, total=9 | qualifying=2, sprint=1, racePosition=7, bonus=0, malus=0, total=10 | DIFF | DIFF | valorizzato |
| simo.salva92 | THA | qualifying=8, sprint=4, race=4, total=16 | qualifying=5, sprint=3, race=14, total=23 | qualifying=8, sprint=4, racePosition=3, bonus=2, malus=-1, total=16 | qualifying=5, sprint=3, racePosition=14, bonus=2, malus=-1, total=23 | DIFF | DIFF | valorizzato |
| marty.bria1996 | THA | qualifying=8, sprint=4, race=2, total=14 | qualifying=5, sprint=3, race=9, total=16 | qualifying=8, sprint=4, racePosition=3, bonus=0, malus=-1, total=14 | qualifying=5, sprint=3, racePosition=9, bonus=0, malus=-1, total=16 | DIFF | DIFF | valorizzato |
| Nicholas | THA | qualifying=8, sprint=4, race=5, total=17 | qualifying=5, sprint=3, race=9, total=19 | qualifying=8, sprint=4, racePosition=4, bonus=2, malus=-1, total=17 | qualifying=5, sprint=3, racePosition=9, bonus=2, malus=0, total=19 | DIFF | DIFF | valorizzato |
| dalla.pozza.silvia | BRA | qualifying=0, sprint=0, race=1, total=1 | qualifying=0, sprint=0, race=9, total=9 | qualifying=0, sprint=0, racePosition=1, bonus=0, malus=0, total=1 | qualifying=0, sprint=0, racePosition=9, bonus=0, malus=0, total=9 | DIFF | DIFF | valorizzato |
| tommaso.strada95 | BRA | qualifying=0, sprint=0, race=3, total=3 | qualifying=0, sprint=2, race=11, total=15 | qualifying=0, sprint=0, racePosition=1, bonus=2, malus=0, total=3 | qualifying=0, sprint=2, racePosition=11, bonus=2, malus=0, total=15 | DIFF | DIFF | valorizzato |
| marino.dilorenzo | BRA | qualifying=0, sprint=0, race=3, total=3 | qualifying=0, sprint=4, race=10, total=15 | qualifying=0, sprint=0, racePosition=2, bonus=2, malus=-1, total=3 | qualifying=0, sprint=4, racePosition=10, bonus=2, malus=-1, total=15 | DIFF | DIFF | valorizzato |
| ivan23dell | BRA | qualifying=0, sprint=0, race=1, total=1 | qualifying=0, sprint=3, race=7, total=10 | qualifying=0, sprint=0, racePosition=1, bonus=0, malus=0, total=1 | qualifying=0, sprint=3, racePosition=7, bonus=0, malus=0, total=10 | DIFF | DIFF | valorizzato |
| alessandro.cavasso.1995 | BRA | qualifying=0, sprint=0, race=3, total=3 | qualifying=0, sprint=6, race=10, total=18 | qualifying=0, sprint=0, racePosition=1, bonus=2, malus=0, total=3 | qualifying=0, sprint=6, racePosition=10, bonus=2, malus=0, total=18 | DIFF | DIFF | valorizzato |
| simo.salva92 | BRA | qualifying=0, sprint=0, race=5, total=5 | qualifying=0, sprint=1, race=13, total=18 | qualifying=0, sprint=0, racePosition=3, bonus=2, malus=0, total=5 | qualifying=0, sprint=1, racePosition=13, bonus=4, malus=0, total=18 | DIFF | DIFF | valorizzato |
| marty.bria1996 | BRA | qualifying=1, sprint=0, race=5, total=6 | qualifying=0, sprint=2, race=8, total=12 | qualifying=1, sprint=0, racePosition=3, bonus=2, malus=0, total=6 | qualifying=0, sprint=2, racePosition=8, bonus=2, malus=0, total=12 | DIFF | DIFF | valorizzato |
| Nicholas | BRA | qualifying=0, sprint=0, race=3, total=3 | qualifying=0, sprint=6, race=15, total=25 | qualifying=0, sprint=0, racePosition=1, bonus=2, malus=0, total=3 | qualifying=0, sprint=6, racePosition=15, bonus=4, malus=0, total=25 | DIFF | DIFF | valorizzato |
| Nicholas | USA | qualifying=1, sprint=4, race=4, total=9 | qualifying=0, sprint=0, race=14, total=16 | qualifying=1, sprint=4, racePosition=2, bonus=2, malus=0, total=9 | qualifying=0, sprint=0, racePosition=14, bonus=2, malus=0, total=16 | DIFF | DIFF | valorizzato |
| ivan23dell | USA | qualifying=3, sprint=1, race=4, total=8 | qualifying=0, sprint=0, race=16, total=18 | qualifying=3, sprint=1, racePosition=2, bonus=2, malus=0, total=8 | qualifying=0, sprint=0, racePosition=16, bonus=2, malus=0, total=18 | DIFF | DIFF | valorizzato |
| alandellosbel8 | USA | qualifying=7, sprint=6, race=6, total=19 | qualifying=2, sprint=0, race=11, total=17 | qualifying=7, sprint=6, racePosition=4, bonus=2, malus=0, total=19 | qualifying=2, sprint=0, racePosition=11, bonus=4, malus=0, total=17 | DIFF | DIFF | valorizzato |
| marino.dilorenzo | USA | qualifying=1, sprint=1, race=4, total=6 | qualifying=0, sprint=0, race=12, total=12 | qualifying=1, sprint=1, racePosition=4, bonus=0, malus=0, total=6 | qualifying=0, sprint=0, racePosition=12, bonus=0, malus=0, total=12 | DIFF | DIFF | valorizzato |
| alessandro.cavasso.1995 | USA | qualifying=3, sprint=4, race=8, total=15 | qualifying=0, sprint=0, race=10, total=12 | qualifying=3, sprint=4, racePosition=6, bonus=2, malus=0, total=15 | qualifying=0, sprint=0, racePosition=10, bonus=2, malus=0, total=12 | DIFF | DIFF | valorizzato |
| dalla.pozza.silvia | USA | qualifying=0, sprint=3, race=4, total=7 | qualifying=0, sprint=0, race=14, total=16 | qualifying=0, sprint=3, racePosition=2, bonus=2, malus=0, total=7 | qualifying=0, sprint=0, racePosition=14, bonus=2, malus=0, total=16 | DIFF | DIFF | valorizzato |
| lucifero1966 | USA | qualifying=0, sprint=4, race=3, total=7 | qualifying=0, sprint=1, race=9, total=12 | qualifying=0, sprint=4, racePosition=1, bonus=2, malus=0, total=7 | qualifying=0, sprint=1, racePosition=9, bonus=2, malus=0, total=12 | DIFF | DIFF | valorizzato |
| simo.salva92 | USA | qualifying=2, sprint=4, race=4, total=10 | qualifying=2, sprint=0, race=8, total=10 | qualifying=2, sprint=4, racePosition=4, bonus=0, malus=0, total=10 | qualifying=2, sprint=0, racePosition=8, bonus=0, malus=0, total=10 | DIFF | DIFF | valorizzato |
| marty.bria1996 | USA | qualifying=2, sprint=1, race=8, total=11 | qualifying=2, sprint=1, race=5, total=9 | qualifying=2, sprint=1, racePosition=7, bonus=2, malus=-1, total=11 | qualifying=2, sprint=1, racePosition=5, bonus=2, malus=-1, total=9 | DIFF | DIFF | valorizzato |
| alessandro.cavasso.1995 | SPA | qualifying=5, sprint=3, race=2, total=10 | qualifying=5, sprint=3, race=12, total=19 | qualifying=5, sprint=3, racePosition=3, bonus=0, malus=-1, total=10 | qualifying=5, sprint=3, racePosition=12, bonus=0, malus=-1, total=19 | DIFF | DIFF | valorizzato |
| simo.salva92 | SPA | qualifying=3, sprint=3, race=6, total=12 | qualifying=0, sprint=3, race=11, total=13 | qualifying=3, sprint=3, racePosition=7, bonus=0, malus=-1, total=12 | qualifying=0, sprint=3, racePosition=11, bonus=0, malus=-1, total=13 | DIFF | DIFF | valorizzato |
| marty.bria1996 | SPA | qualifying=5, sprint=1, race=4, total=10 | qualifying=0, sprint=3, race=7, total=9 | qualifying=5, sprint=1, racePosition=5, bonus=0, malus=-1, total=10 | qualifying=0, sprint=3, racePosition=7, bonus=0, malus=-1, total=9 | DIFF | DIFF | valorizzato |
| ivan23dell | SPA | qualifying=5, sprint=6, race=8, total=19 | qualifying=5, sprint=3, race=7, total=14 | qualifying=5, sprint=6, racePosition=9, bonus=0, malus=-1, total=19 | qualifying=5, sprint=3, racePosition=7, bonus=0, malus=-1, total=14 | DIFF | DIFF | valorizzato |
| Nicholas | SPA | qualifying=0, sprint=3, race=6, total=9 | qualifying=0, sprint=3, race=10, total=12 | qualifying=0, sprint=3, racePosition=7, bonus=0, malus=-1, total=9 | qualifying=0, sprint=3, racePosition=10, bonus=0, malus=-1, total=12 | DIFF | DIFF | valorizzato |
| lucifero1966 | SPA | qualifying=0, sprint=3, race=7, total=10 | qualifying=0, sprint=4, race=7, total=11 | qualifying=0, sprint=3, racePosition=8, bonus=0, malus=-1, total=10 | qualifying=0, sprint=4, racePosition=7, bonus=0, malus=0, total=11 | DIFF | DIFF | valorizzato |
| dalla.pozza.silvia | SPA | qualifying=0, sprint=0, race=4, total=4 | qualifying=0, sprint=9, race=8, total=17 | qualifying=0, sprint=0, racePosition=5, bonus=0, malus=-1, total=4 | qualifying=0, sprint=9, racePosition=8, bonus=0, malus=0, total=17 | DIFF | DIFF | valorizzato |
| marino.dilorenzo | FRA | qualifying=3, sprint=3, race=6, total=12 | qualifying=0, sprint=3, race=11, total=16 | qualifying=3, sprint=3, racePosition=5, bonus=2, malus=-1, total=12 | qualifying=0, sprint=3, racePosition=11, bonus=2, malus=0, total=16 | DIFF | DIFF | valorizzato |
| Nicholas | FRA | qualifying=3, sprint=3, race=6, total=12 | qualifying=0, sprint=2, race=12, total=15 | qualifying=3, sprint=3, racePosition=5, bonus=2, malus=-1, total=12 | qualifying=0, sprint=2, racePosition=12, bonus=2, malus=-1, total=15 | DIFF | DIFF | valorizzato |
| ivan23dell | FRA | qualifying=3, sprint=3, race=3, total=9 | qualifying=0, sprint=2, race=7, total=9 | qualifying=3, sprint=3, racePosition=4, bonus=0, malus=-1, total=9 | qualifying=0, sprint=2, racePosition=7, bonus=0, malus=0, total=9 | DIFF | DIFF | valorizzato |
| tommaso.strada95 | FRA | qualifying=6, sprint=3, race=7, total=16 | qualifying=5, sprint=2, race=0, total=4 | qualifying=6, sprint=3, racePosition=6, bonus=2, malus=-1, total=16 | qualifying=5, sprint=2, racePosition=0, bonus=2, malus=-5, total=4 | DIFF | DIFF | valorizzato |
| alandellosbel8 | FRA | qualifying=0, sprint=3, race=6, total=9 | qualifying=0, sprint=2, race=4, total=8 | qualifying=0, sprint=3, racePosition=5, bonus=2, malus=-1, total=9 | qualifying=0, sprint=2, racePosition=4, bonus=2, malus=0, total=8 | DIFF | DIFF | valorizzato |
| Nicholas | CAT | qualifying=1, sprint=0, race=12, total=13 | qualifying=0, sprint=3, race=0, total=-7 | qualifying=1, sprint=0, racePosition=13, bonus=0, malus=-1, total=13 | qualifying=0, sprint=3, racePosition=0, bonus=0, malus=-10, total=-7 | DIFF | DIFF | valorizzato |
| tommaso.strada95 | CAT | qualifying=0, sprint=0, race=5, total=5 | qualifying=0, sprint=4, race=0, total=-6 | qualifying=0, sprint=0, racePosition=6, bonus=0, malus=-1, total=5 | qualifying=0, sprint=4, racePosition=0, bonus=0, malus=-10, total=-6 | DIFF | DIFF | valorizzato |
| dalla.pozza.silvia | CAT | qualifying=0, sprint=1, race=3, total=4 | qualifying=0, sprint=0, race=0, total=-10 | qualifying=0, sprint=1, racePosition=4, bonus=0, malus=-1, total=4 | qualifying=0, sprint=0, racePosition=0, bonus=0, malus=-10, total=-10 | DIFF | DIFF | valorizzato |
| marino.dilorenzo | CAT | qualifying=5, sprint=0, race=7, total=12 | qualifying=0, sprint=3, race=0, total=-7 | qualifying=5, sprint=0, racePosition=8, bonus=0, malus=-1, total=12 | qualifying=0, sprint=3, racePosition=0, bonus=0, malus=-10, total=-7 | DIFF | DIFF | valorizzato |
| alessandro.cavasso.1995 | CAT | qualifying=6, sprint=0, race=18, total=24 | qualifying=5, sprint=3, race=0, total=-2 | qualifying=6, sprint=0, racePosition=18, bonus=1, malus=-1, total=24 | qualifying=5, sprint=3, racePosition=0, bonus=0, malus=-10, total=-2 | DIFF | DIFF | valorizzato |
| ivan23dell | CAT | qualifying=3, sprint=0, race=2, total=5 | qualifying=0, sprint=1, race=0, total=-9 | qualifying=3, sprint=0, racePosition=2, bonus=0, malus=0, total=5 | qualifying=0, sprint=1, racePosition=0, bonus=0, malus=-10, total=-9 | DIFF | DIFF | valorizzato |
| marty.bria1996 | CAT | qualifying=6, sprint=0, race=11, total=17 | qualifying=5, sprint=9, race=0, total=4 | qualifying=6, sprint=0, racePosition=12, bonus=0, malus=-1, total=17 | qualifying=5, sprint=9, racePosition=0, bonus=0, malus=-10, total=4 | DIFF | DIFF | valorizzato |
| simo.salva92 | CAT | qualifying=1, sprint=0, race=11, total=12 | qualifying=0, sprint=3, race=0, total=-7 | qualifying=1, sprint=0, racePosition=12, bonus=0, malus=-1, total=12 | qualifying=0, sprint=3, racePosition=0, bonus=0, malus=-10, total=-7 | DIFF | DIFF | valorizzato |
| marty.bria1996 | ITA | qualifying=5, sprint=0, race=2, total=7 | qualifying=0, sprint=2, race=20, total=25 | qualifying=5, sprint=0, racePosition=2, bonus=0, malus=0, total=7 | qualifying=0, sprint=2, racePosition=20, bonus=3, malus=0, total=25 | DIFF | DIFF | valorizzato |
| simo.salva92 | ITA | qualifying=5, sprint=0, race=2, total=7 | qualifying=0, sprint=0, race=12, total=12 | qualifying=5, sprint=0, racePosition=2, bonus=0, malus=0, total=7 | qualifying=0, sprint=0, racePosition=12, bonus=0, malus=0, total=12 | DIFF | DIFF | valorizzato |
| Nicholas | ITA | qualifying=1, sprint=0, race=2, total=3 | qualifying=0, sprint=1, race=14, total=15 | qualifying=1, sprint=0, racePosition=2, bonus=0, malus=0, total=3 | qualifying=0, sprint=1, racePosition=14, bonus=0, malus=0, total=15 | DIFF | DIFF | valorizzato |
| ivan23dell | ITA | qualifying=0, sprint=0, race=2, total=2 | qualifying=0, sprint=3, race=6, total=9 | qualifying=0, sprint=0, racePosition=2, bonus=0, malus=0, total=2 | qualifying=0, sprint=3, racePosition=6, bonus=0, malus=0, total=9 | DIFF | DIFF | valorizzato |
| tommaso.strada95 | ITA | qualifying=1, sprint=0, race=2, total=3 | qualifying=0, sprint=0, race=7, total=7 | qualifying=1, sprint=0, racePosition=2, bonus=0, malus=0, total=3 | qualifying=0, sprint=0, racePosition=7, bonus=0, malus=0, total=7 | DIFF | DIFF | valorizzato |
| Nicholas | HUN | qualifying=3, sprint=2, race=2, total=7 | qualifying=2, sprint=2, race=10, total=16 | qualifying=3, sprint=2, racePosition=1, bonus=2, malus=-1, total=7 | qualifying=2, sprint=2, racePosition=10, bonus=2, malus=0, total=16 | DIFF | DIFF | valorizzato |
| marino.dilorenzo | HUN | qualifying=3, sprint=4, race=0, total=7 | qualifying=2, sprint=4, race=10, total=16 | qualifying=3, sprint=4, racePosition=1, bonus=0, malus=-1, total=7 | qualifying=2, sprint=4, racePosition=10, bonus=0, malus=0, total=16 | DIFF | DIFF | valorizzato |
| alandellosbel8 | HUN | qualifying=0, sprint=4, race=6, total=10 | qualifying=0, sprint=4, race=10, total=16 | qualifying=0, sprint=4, racePosition=5, bonus=2, malus=-1, total=10 | qualifying=0, sprint=4, racePosition=10, bonus=2, malus=0, total=16 | DIFF | DIFF | valorizzato |
| tommaso.strada95 | HUN | qualifying=6, sprint=1, race=2, total=9 | qualifying=5, sprint=1, race=6, total=14 | qualifying=6, sprint=1, racePosition=1, bonus=2, malus=-1, total=9 | qualifying=5, sprint=1, racePosition=6, bonus=2, malus=0, total=14 | DIFF | DIFF | valorizzato |
| marty.bria1996 | HUN | qualifying=3, sprint=6, race=-1, total=8 | qualifying=2, sprint=6, race=10, total=13 | qualifying=3, sprint=6, racePosition=4, bonus=0, malus=-5, total=8 | qualifying=2, sprint=6, racePosition=10, bonus=0, malus=-5, total=13 | DIFF | DIFF | valorizzato |
| simo.salva92 | HUN | qualifying=5, sprint=4, race=1, total=10 | qualifying=2, sprint=4, race=8, total=9 | qualifying=5, sprint=4, racePosition=6, bonus=0, malus=-5, total=10 | qualifying=2, sprint=4, racePosition=8, bonus=0, malus=-5, total=9 | DIFF | DIFF | valorizzato |
| alessandro.cavasso.1995 | HUN | qualifying=5, sprint=1, race=-1, total=5 | qualifying=5, sprint=1, race=6, total=9 | qualifying=5, sprint=1, racePosition=2, bonus=2, malus=-5, total=5 | qualifying=5, sprint=1, racePosition=6, bonus=2, malus=-5, total=9 | DIFF | DIFF | valorizzato |
| ivan23dell | HUN | qualifying=5, sprint=0, race=4, total=9 | qualifying=0, sprint=0, race=3, total=3 | qualifying=5, sprint=0, racePosition=9, bonus=0, malus=-5, total=9 | qualifying=0, sprint=0, racePosition=3, bonus=0, malus=0, total=3 | DIFF | DIFF | valorizzato |
| Nicholas | CZE | qualifying=0, sprint=1, race=2, total=3 | qualifying=0, sprint=2, race=16, total=17 | qualifying=0, sprint=1, racePosition=3, bonus=0, malus=-1, total=3 | qualifying=0, sprint=2, racePosition=16, bonus=0, malus=-1, total=17 | DIFF | DIFF | valorizzato |
| lucifero1966 | CZE | qualifying=3, sprint=1, race=2, total=6 | qualifying=0, sprint=4, race=12, total=16 | qualifying=3, sprint=1, racePosition=2, bonus=0, malus=0, total=6 | qualifying=0, sprint=4, racePosition=12, bonus=0, malus=0, total=16 | DIFF | DIFF | valorizzato |
| marino.dilorenzo | CZE | qualifying=5, sprint=0, race=6, total=11 | qualifying=0, sprint=4, race=10, total=13 | qualifying=5, sprint=0, racePosition=7, bonus=0, malus=-1, total=11 | qualifying=0, sprint=4, racePosition=10, bonus=0, malus=-1, total=13 | DIFF | DIFF | valorizzato |
| alessandro.cavasso.1995 | CZE | qualifying=3, sprint=1, race=4, total=8 | qualifying=0, sprint=4, race=8, total=12 | qualifying=3, sprint=1, racePosition=4, bonus=0, malus=0, total=8 | qualifying=0, sprint=4, racePosition=8, bonus=0, malus=0, total=12 | DIFF | DIFF | valorizzato |
| ivan23dell | CZE | qualifying=10, sprint=1, race=10, total=21 | qualifying=0, sprint=3, race=2, total=5 | qualifying=10, sprint=1, racePosition=11, bonus=0, malus=-1, total=21 | qualifying=0, sprint=3, racePosition=2, bonus=0, malus=0, total=5 | DIFF | DIFF | valorizzato |
| marty.bria1996 | CZE | qualifying=1, sprint=1, race=4, total=6 | qualifying=0, sprint=1, race=12, total=15 | qualifying=1, sprint=1, racePosition=2, bonus=2, malus=0, total=6 | qualifying=0, sprint=1, racePosition=12, bonus=2, malus=0, total=15 | DIFF | DIFF | valorizzato |
| simo.salva92 | CZE | qualifying=1, sprint=0, race=2, total=3 | qualifying=0, sprint=4, race=12, total=16 | qualifying=1, sprint=0, racePosition=2, bonus=0, malus=0, total=3 | qualifying=0, sprint=4, racePosition=12, bonus=0, malus=0, total=16 | DIFF | DIFF | valorizzato |
| marino.dilorenzo | NED | qualifying=1, sprint=0, race=0, total=1 | qualifying=0, sprint=1, race=12, total=12 | qualifying=1, sprint=0, racePosition=1, bonus=0, malus=-1, total=1 | qualifying=0, sprint=1, racePosition=12, bonus=0, malus=-1, total=12 | DIFF | DIFF | valorizzato |
| Nicholas | NED | qualifying=1, sprint=0, race=0, total=1 | qualifying=0, sprint=1, race=12, total=12 | qualifying=1, sprint=0, racePosition=1, bonus=0, malus=-1, total=1 | qualifying=0, sprint=1, racePosition=12, bonus=0, malus=-1, total=12 | DIFF | DIFF | valorizzato |
| simo.salva92 | NED | qualifying=3, sprint=0, race=3, total=6 | qualifying=0, sprint=0, race=7, total=9 | qualifying=3, sprint=0, racePosition=2, bonus=2, malus=-1, total=6 | qualifying=0, sprint=0, racePosition=7, bonus=2, malus=0, total=9 | DIFF | DIFF | valorizzato |
| marty.bria1996 | NED | qualifying=5, sprint=0, race=1, total=6 | qualifying=0, sprint=1, race=7, total=8 | qualifying=5, sprint=0, racePosition=2, bonus=0, malus=-1, total=6 | qualifying=0, sprint=1, racePosition=7, bonus=0, malus=0, total=8 | DIFF | DIFF | valorizzato |
| Nicholas | GER | qualifying=8, sprint=4, race=5, total=17 | qualifying=5, sprint=4, race=9, total=20 | qualifying=8, sprint=4, racePosition=4, bonus=2, malus=-1, total=17 | qualifying=5, sprint=4, racePosition=9, bonus=2, malus=0, total=20 | DIFF | DIFF | valorizzato |
| marino.dilorenzo | GER | qualifying=10, sprint=1, race=3, total=14 | qualifying=5, sprint=4, race=11, total=20 | qualifying=10, sprint=1, racePosition=4, bonus=0, malus=-1, total=14 | qualifying=5, sprint=4, racePosition=11, bonus=0, malus=0, total=20 | DIFF | DIFF | valorizzato |
| alessandro.cavasso.1995 | GER | qualifying=5, sprint=1, race=7, total=13 | qualifying=5, sprint=4, race=7, total=18 | qualifying=5, sprint=1, racePosition=6, bonus=2, malus=-1, total=13 | qualifying=5, sprint=4, racePosition=7, bonus=2, malus=0, total=18 | DIFF | DIFF | valorizzato |
| simo.salva92 | GER | qualifying=6, sprint=4, race=5, total=15 | qualifying=5, sprint=5, race=7, total=19 | qualifying=6, sprint=4, racePosition=4, bonus=2, malus=-1, total=15 | qualifying=5, sprint=5, racePosition=7, bonus=2, malus=0, total=19 | DIFF | DIFF | valorizzato |
| marty.bria1996 | GER | qualifying=8, sprint=1, race=3, total=12 | qualifying=5, sprint=4, race=7, total=16 | qualifying=8, sprint=1, racePosition=4, bonus=0, malus=-1, total=12 | qualifying=5, sprint=4, racePosition=7, bonus=0, malus=0, total=16 | DIFF | DIFF | valorizzato |
| alessandro.cavasso.1995 | GBR | qualifying=5, sprint=0, race=2, total=7 | qualifying=0, sprint=9, race=7, total=17 | qualifying=5, sprint=0, racePosition=1, bonus=2, malus=-1, total=7 | qualifying=0, sprint=9, racePosition=7, bonus=2, malus=-1, total=17 | DIFF | DIFF | valorizzato |
| simo.salva92 | GBR | qualifying=5, sprint=0, race=4, total=9 | qualifying=0, sprint=6, race=10, total=17 | qualifying=5, sprint=0, racePosition=3, bonus=2, malus=-1, total=9 | qualifying=0, sprint=6, racePosition=10, bonus=2, malus=-1, total=17 | DIFF | DIFF | valorizzato |
| Nicholas | GBR | qualifying=3, sprint=3, race=6, total=12 | qualifying=0, sprint=3, race=11, total=15 | qualifying=3, sprint=3, racePosition=5, bonus=2, malus=-1, total=12 | qualifying=0, sprint=3, racePosition=11, bonus=2, malus=-1, total=15 | DIFF | DIFF | valorizzato |
| marty.bria1996 | GBR | qualifying=5, sprint=1, race=2, total=8 | qualifying=2, sprint=4, race=7, total=12 | qualifying=5, sprint=1, racePosition=3, bonus=0, malus=-1, total=8 | qualifying=2, sprint=4, racePosition=7, bonus=0, malus=-1, total=12 | DIFF | DIFF | valorizzato |
| lucifero1966 | GBR | qualifying=7, sprint=3, race=2, total=12 | qualifying=2, sprint=0, race=4, total=5 | qualifying=7, sprint=3, racePosition=3, bonus=0, malus=-1, total=12 | qualifying=2, sprint=0, racePosition=4, bonus=0, malus=-1, total=5 | DIFF | DIFF | valorizzato |
| lucifero1966 | ARA | qualifying=1, sprint=0, race=1, total=2 | qualifying=0, sprint=3, race=14, total=16 | qualifying=1, sprint=0, racePosition=2, bonus=0, malus=-1, total=2 | qualifying=0, sprint=3, racePosition=14, bonus=0, malus=-1, total=16 | DIFF | DIFF | valorizzato |
| ivan23dell | ARA | qualifying=8, sprint=0, race=0, total=8 | qualifying=5, sprint=1, race=5, total=10 | qualifying=8, sprint=0, racePosition=0, bonus=0, malus=0, total=8 | qualifying=5, sprint=1, racePosition=5, bonus=0, malus=-1, total=10 | DIFF | DIFF | valorizzato |

## Prediction parziali escluse dal replay

- Criterio completo richiesto: 1 POLE, 1 QUALIFYING_TIME, 3 SPRINT, 5 RACE, 1 RACE_OUT.
- Non viene applicata alcuna regola autonoma per celle mancanti.

| Utente | GP | Entry | Mancanti | Slot duplicati | scored_at |
|---|---|---:|---|---|---|
| marino.dilorenzo | THA | 8 | SPRINT | — | valorizzato |
| alandellosbel8 | THA | 8 | SPRINT | — | valorizzato |
| alandellosbel8 | BRA | 9 | POLE, QUALIFYING_TIME | — | vuoto |
| lucifero1966 | BRA | 9 | POLE, QUALIFYING_TIME | — | vuoto |
| tommaso.strada95 | USA | 5 | RACE, RACE_OUT | — | valorizzato |
| alandellosbel8 | SPA | 9 | POLE, QUALIFYING_TIME | — | vuoto |
| simo.salva92 | FRA | 9 | POLE, QUALIFYING_TIME | — | vuoto |
| marty.bria1996 | FRA | 9 | POLE, QUALIFYING_TIME | — | vuoto |
| alessandro.cavasso.1995 | FRA | 10 | QUALIFYING_TIME | — | vuoto |
| lucifero1966 | CAT | 8 | SPRINT | — | valorizzato |
| alandellosbel8 | ITA | 9 | POLE, QUALIFYING_TIME | — | vuoto |
| dalla.pozza.silvia | ITA | 8 | SPRINT | — | valorizzato |
| marino.dilorenzo | ITA | 8 | SPRINT | — | valorizzato |
| lucifero1966 | ITA | 9 | POLE, QUALIFYING_TIME | — | vuoto |
| alessandro.cavasso.1995 | ITA | 5 | RACE, RACE_OUT | — | valorizzato |
| dalla.pozza.silvia | HUN | 8 | SPRINT | — | valorizzato |
| lucifero1966 | HUN | 9 | POLE, QUALIFYING_TIME | — | vuoto |
| lucifero1966 | NED | 9 | POLE, QUALIFYING_TIME | — | vuoto |
| dalla.pozza.silvia | NED | 2 | SPRINT, RACE, RACE_OUT | — | valorizzato |
| alessandro.cavasso.1995 | NED | 6 | POLE, QUALIFYING_TIME, SPRINT | — | vuoto |
| lucifero1966 | GER | 5 | RACE, RACE_OUT | — | valorizzato |
| alandellosbel8 | GER | 3 | POLE, QUALIFYING_TIME, RACE, RACE_OUT | — | vuoto |
| alandellosbel8 | GBR | 6 | POLE, QUALIFYING_TIME, SPRINT | — | vuoto |
| ivan23dell | GBR | 8 | SPRINT | — | valorizzato |
| tommaso.strada95 | GBR | 5 | RACE, RACE_OUT | — | valorizzato |
| marino.dilorenzo | GBR | 3 | POLE, QUALIFYING_TIME, RACE, RACE_OUT | — | vuoto |
| tommaso.strada95 | ARA | 6 | POLE, QUALIFYING_TIME, SPRINT | — | vuoto |
| simo.salva92 | ARA | 5 | RACE, RACE_OUT | — | valorizzato |
| alessandro.cavasso.1995 | ARA | 2 | POLE, QUALIFYING_TIME, SPRINT, RACE, RACE_OUT | — | vuoto |
| marty.bria1996 | ARA | 3 | POLE, QUALIFYING_TIME, RACE, RACE_OUT | — | vuoto |

## Prediction TEST01 non risolte dalla sorgente storica

- Nicholas / RSM
- Nicholas / ARA

## Verifica finale

- Errori di selezione: **0**
- Risultati ufficiali mancanti per un GP selezionato: **0**
- INSERT/UPDATE/DELETE/UPSERT: **0**
- `score_prediction`: **non chiamata**
- Prediction modificate: **0**
- Prediction entries modificate: **0**
- Risultati ufficiali, schema, RLS e RPC modificati: **NO**
- Report scritto: **.agents/outputs/task-33-historical-excel-scoring.md**

