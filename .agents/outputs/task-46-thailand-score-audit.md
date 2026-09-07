# Task 46 — Audit read-only del punteggio Thailandia di Nicholas

- **Data audit:** 7 settembre 2026
- **Lega:** FantaTest (`TEST01`)
- **GP:** Thailandia (`THA`)
- **Prediction:** `fab3b75d-4409-5cf8-a481-9778219f96c6`
- **Utente:** Nicholas (`326a38c8-ee4f-410e-b4e8-35ce104966db`)
- **Modalità:** 100% read-only

## Esito

La differenza non è nel punteggio di Qualifica né nei punti di posizione della
Gara. Il database conserva:

| Campo | Server-side attuale | Fixture storico |
|---|---:|---:|
| Qualifica | 8 | 8 |
| Sprint | 3 | 3 |
| `race_points` / punti posizione Gara | 9 | 9 |
| Bonus | 2 | 2 |
| Malus | 0 | **-1** |
| Totale | **22** | **21** |

Nel fixture, il valore “Gara 10” è il sottototale della Gara, non il solo
punteggio delle posizioni:

```text
Gara fixture = punti posizione 9 + bonus 2 + malus -1 = 10
Totale fixture = Qualifica 8 + Sprint 3 + Gara 10 = 21
```

La stessa somma in forma normalizzata è:

```text
8 + 3 + 9 + 2 - 1 = 21
```

Il valore server-side è invece internamente coerente con i propri campi:

```text
8 + 3 + 9 + 2 + 0 = 22
```

Quindi il delta effettivo è il malus mancante di **1 punto**. Non bisogna
sommarlo nuovamente al valore fixture “Gara 10”, altrimenti bonus e malus
verrebbero contati due volte.

## Risultati ufficiali letti

Sono state interrogate in sola lettura le sessioni Thailandia e le relative
righe `session_results`:

- Qualifica ufficiale usata: sessione `Q` n. 2, `FINISHED`, 22 risultati;
  pole Marco Bezzecchi, tempo pole `1'28.652`.
- Sprint: sessione `SPR`, `FINISHED`, 22 risultati.
- Gara: sessione `RAC`, `FINISHED`, 22 risultati.
- Gara top five ufficiale: Marco Bezzecchi, Pedro Acosta, Raul Fernandez,
  Jorge Martin, Ai Ogura.
- Gara `NOT_CLASSIFIED`: Marc Marquez, Alex Marquez, Joan Mir.

Le entry di Nicholas sono state lette senza modificarle:

- Pole: Marco Bezzecchi, punti memorizzati `5`.
- Tempo Qualifica: `88.526`, punti `3`.
- Sprint: Marco Bezzecchi / Marc Marquez / Fabio Di Giannantonio, punti
  `0 + 3 + 0 = 3`.
- Gara: Marc Marquez / Marco Bezzecchi / Pedro Acosta / Raul Fernandez /
  Alex Marquez, punti `0 + 3 + 3 + 3 + 0 = 9`.
- OUT: Joan Mir, entry con punti `0`.

La ricostruzione della specifica storica produce quindi:

- i due piloti NC intersecati con la Gara pronosticata sono Marc Marquez e
  Alex Marquez, dunque `ncCount = 2`;
- il malus della specifica è `-1`;
- Joan Mir è effettivamente un OUT ufficiale e produce il bonus OUT `+2`;
- il totale ricostruito è `21`.

Questi valori sono stati verificati anche eseguendo la funzione offline
`scorePrediction` della specifica storica, senza chiamare Supabase.

## Audit della definizione server-side

Il catalogo PostgREST espone soltanto la firma:

```text
public.score_prediction(p_prediction_id uuid)
```

Il corpo SQL della funzione non è esposto dal catalogo REST e non è presente
nel repository. L’audit non ha invocato `score_prediction`, perché sarebbe
un’operazione di scoring con possibili effetti persistenti e il task richiede
sola lettura.

Di conseguenza si può dimostrare il risultato dei dati e della specifica
storica, ma non quale ramo interno della RPC abbia prodotto
`malus_points = 0`. Le ipotesi compatibili includono una regola server-side
diversa per due NC oppure un aggregato storico persistito con regole diverse;
non è corretto attribuirne una al corpo SQL senza accesso SQL autorizzato.

## Modifiche eseguite

```text
Prediction modificata: NO
Prediction entries modificate: NO
Sessioni modificate: NO
Risultati ufficiali modificati: NO
Schema/RLS modificati: NO
RPC score_prediction chiamata: NO
INSERT/UPDATE/DELETE/UPSERT: 0
```

## Conclusione

La causa osservabile della differenza è classificata come **malus server-side
non riconciliato**: i dati ufficiali e il fixture giustificano `-1`, ma il
record aggregato corrente conserva `0`. Il confronto è spiegato fino al
confine consentito dall’accesso REST; la formula interna precisa della RPC
resta **non determinabile senza accesso SQL autorizzato**. Nessuna correzione
è stata applicata.