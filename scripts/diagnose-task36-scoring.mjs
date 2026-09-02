/**
 * Task 36 — diagnosi read-only dei punteggi storici TEST01.
 *
 * L'unica scrittura effettuata da questo script è verso gli output locali:
 * il report Markdown e il CSV diagnostico. Supabase viene interrogato
 * esclusivamente con GET.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

import {
  REQUIRED_CASES,
} from './historical-scoring-spec.mjs';
import {
  buildPrediction,
  createReadOnlyClient,
  entryAudit,
  parseSource,
  selectHistoricalPredictions,
} from './validate-historical-excel-scoring-test01.mjs';

const SOURCE =
  'attached_assets/Pasted-GP-Utente-Pole-position-tempo-pole-1-sprint-2-sprint-3-_1788342259417.txt';
const REPORT = '.agents/outputs/task-36-scoring-diagnosis.md';
const CSV = '.agents/outputs/task-36-prediction-entries-diagnostic.csv';
const SEASON_YEAR = 2026;
const LEAGUE_CODE = 'TEST01';
const ENTRY_TYPES = ['POLE', 'QUALIFYING_TIME', 'SPRINT', 'RACE', 'RACE_OUT'];
const EXPECTED_ENTRY_COUNTS = {
  POLE: 1,
  QUALIFYING_TIME: 1,
  SPRINT: 3,
  RACE: 5,
  RACE_OUT: 1,
};
const REQUIRED_EMAILS = new Set([
  'nikyturets@gmail.com',
  'marty.bria1996@gmail.com',
  'simo.salva92@gmail.com',
  'alandellosbel8@gmail.com',
  'alessandro.cavasso.1995@gmail.com',
  'ivan23dell@gmail.com',
  'marino.dilorenzo@gmail.com',
  'lucifero1966@gmail.com',
  'dalla.pozza.silvia@gmail.com',
  'tommaso.strada95@gmail.com',
]);
const GP_CODES = new Map([
  ['Thailandia', 'THA'],
  ['Brasile', 'BRA'],
  ['USA', 'USA'],
  ['Qatar', 'QAT'],
  ['Spagna', 'SPA'],
  ['Francia', 'FRA'],
  ['Catalogna', 'CAT'],
  ['Italia', 'ITA'],
  ['Ungheria', 'HUN'],
  ['Repubblica Ceca', 'CZE'],
  ['Netherlands', 'NED'],
  ['Germania', 'GER'],
  ['UK', 'GBR'],
  ['Aragon', 'ARA'],
]);

function canonical(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .toLocaleLowerCase('it-IT')
    .replace(/\s+/g, ' ');
}

function normalizedEmail(value) {
  return canonical(value).replace(/\s+/g, '');
}

function numberOrNull(value) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function display(value) {
  return value === null || value === undefined || value === '' ? '—' : String(value);
}

function md(value) {
  return display(value).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

function csv(value) {
  const text = display(value);
  return `"${text.replaceAll('"', '""').replace(/\r?\n/g, ' ')}"`;
}

function sum(values) {
  return values.reduce((total, value) => total + (numberOrNull(value) ?? 0), 0);
}

function predictionKey(userId, grandPrixId) {
  return `${userId}|${grandPrixId}`;
}

function riderName(rider, riderId) {
  if (!rider) return riderId || '—';
  return `${rider.name ?? ''} ${rider.surname ?? ''}`.trim()
    || rider.nickname
    || riderId
    || '—';
}

async function getChunks(client, ids, makePath) {
  const rows = [];
  for (let index = 0; index < ids.length; index += 80) {
    rows.push(...await client.get(makePath(ids.slice(index, index + 80))));
  }
  return rows;
}

async function loadContext(client) {
  const [seasons, leagues] = await Promise.all([
    client.get(`/seasons?year=eq.${SEASON_YEAR}&select=id,year`),
    client.get(`/leagues?invite_code=eq.${LEAGUE_CODE}&select=id,name,invite_code`),
  ]);
  if (seasons.length !== 1 || leagues.length !== 1) {
    throw new Error('Stagione o lega TEST01 non univoca.');
  }

  const seasonId = seasons[0].id;
  const league = leagues[0];
  const [usersResponse, members, grandPrix, predictions, riders, sessions, profiles] =
    await Promise.all([
      client.authGet('/admin/users?page=1&per_page=1000'),
      client.get(`/league_members?league_id=eq.${league.id}&select=league_id,user_id`),
      client.get(`/grand_prix?season_id=eq.${seasonId}&is_test=eq.false`
        + '&select=id,name,short_name,country,circuit,date_start,date_end&order=date_start.asc'),
      client.get(`/predictions?league_id=eq.${league.id}`
        + '&select=id,user_id,grand_prix_id,league_id,created_at,updated_at,scored_at,'
        + 'qualifying_pole_time,qualifying_points,sprint_points,race_points,bonus_points,'
        + 'malus_points,total_points&order=created_at.asc'),
      client.get('/riders?select=id,name,surname,nickname'),
      client.get('/sessions?select=id,grand_prix_id,type,status,session_date,number'
        + '&order=session_date.asc'),
      client.get('/profiles?select=id,user_id,name'),
    ]);

  const predictionIds = predictions.map((prediction) => prediction.id);
  const entries = await getChunks(
    client,
    predictionIds,
    (ids) => `/prediction_entries?prediction_id=in.(${ids.join(',')})`
      + '&select=id,prediction_id,prediction_type,position,rider_id,created_at,predicted_time,points'
      + '&order=prediction_id.asc,prediction_type.asc,position.asc',
  );

  return {
    season: seasons[0],
    league,
    users: usersResponse.users ?? [],
    members,
    grandPrix,
    predictions,
    riders,
    sessions,
    profiles,
    entries,
  };
}

function entriesFor(entries, predictionId) {
  return entries.filter((entry) => entry.prediction_id === predictionId);
}

function entryPointState(entries) {
  const nonNull = entries.filter((entry) => numberOrNull(entry.points) !== null).length;
  const zero = entries.filter((entry) => numberOrNull(entry.points) === 0).length;
  const nullPoints = entries.filter((entry) => numberOrNull(entry.points) === null).length;
  return { nonNull, zero, nullPoints, total: entries.length };
}

function detailedEntryAudit(entries) {
  const counts = Object.fromEntries(
    ENTRY_TYPES.map((type) => [
      type,
      entries.filter((entry) => entry.prediction_type === type).length,
    ]),
  );
  const missing = ENTRY_TYPES.filter((type) => counts[type] < EXPECTED_ENTRY_COUNTS[type]);
  const duplicates = [];
  for (const type of ENTRY_TYPES) {
    const slots = new Set();
    for (const entry of entries.filter((item) => item.prediction_type === type)) {
      const slot = entry.position ?? 'none';
      if (slots.has(slot)) duplicates.push(`${type}:${slot}`);
      slots.add(slot);
    }
  }
  return {
    counts,
    missing,
    duplicates,
    complete: missing.length === 0 && duplicates.length === 0,
  };
}

function findEmail(userId, usersById) {
  return usersById.get(userId)?.email ?? '';
}

function labelForPrediction(prediction, context, usersById, profilesByUserId) {
  const gp = context.grandPrix.find((item) => item.id === prediction.grand_prix_id);
  const email = findEmail(prediction.user_id, usersById);
  const profile = profilesByUserId.get(prediction.user_id);
  return {
    email,
    name: profile?.name ?? email.split('@')[0] ?? prediction.user_id,
    gp: gp?.short_name ?? gp?.name ?? prediction.grand_prix_id,
    gpName: gp?.name ?? gp?.short_name ?? prediction.grand_prix_id,
    gpId: prediction.grand_prix_id,
  };
}

function userPredictionRows(context, usersById, profilesByUserId) {
  return context.predictions
    .map((prediction) => ({
      prediction,
      label: labelForPrediction(prediction, context, usersById, profilesByUserId),
    }))
    .filter(({ label }) => REQUIRED_EMAILS.has(normalizedEmail(label.email)));
}

function fixtureActual(fixture, selection, context, usersById, profilesByUserId) {
  const fixtureCode = GP_CODES.get(fixture.gp);
  const selectedItem = selection.items.find((candidate) => (
    normalizedEmail(findEmail(candidate.userId, usersById)) === normalizedEmail(fixture.email)
      && candidate.gp.short_name === fixtureCode
  ));
  const gp = context.grandPrix.find((candidate) => candidate.short_name === fixtureCode);
  const directPrediction = context.predictions.find((candidate) => (
    normalizedEmail(findEmail(candidate.user_id, usersById)) === normalizedEmail(fixture.email)
      && candidate.grand_prix_id === gp?.id
  ));
  const item = selectedItem ?? (directPrediction && gp
    ? { prediction: directPrediction, gp, userId: directPrediction.user_id }
    : null);
  if (!item) {
    return { fixture, missing: true };
  }

  const predictionEntries = entriesFor(context.entries, item.prediction.id);
  const pointState = entryPointState(predictionEntries);
  const audit = detailedEntryAudit(predictionEntries);
  const db = item.prediction;
  const excel = fixture.excel;
  const dbFields = {
    qualifying: numberOrNull(db.qualifying_points),
    sprint: numberOrNull(db.sprint_points),
    race: numberOrNull(db.race_points),
    bonus: numberOrNull(db.bonus_points),
    malus: numberOrNull(db.malus_points),
    total: numberOrNull(db.total_points),
  };
  const excelFields = {
    qualifying: excel.qualifying,
    sprint: excel.sprint,
    race: excel.race,
    bonus: excel.bonus,
    malus: excel.malus,
    total: excel.total,
  };
  return {
    fixture,
    missing: false,
    prediction: db,
    label: labelForPrediction(db, context, usersById, profilesByUserId),
    entries: predictionEntries,
    audit,
    pointState,
    dbFields,
    excelFields,
    delta: Object.fromEntries(
      Object.keys(dbFields).map((key) => [key, dbFields[key] === null ? null : dbFields[key] - excelFields[key]]),
    ),
  };
}

function entryStateText(pointState, audit) {
  return `numeric=${pointState.nonNull}, zero=${pointState.zero}, null=${pointState.nullPoints}, `
    + `entry=${pointState.total}, mancanti=${audit.missing.join('+') || '—'}, `
    + `duplicati=${audit.duplicates.join('+') || '—'}`;
}

function buildEntriesCsv(context, usersById, profilesByUserId) {
  const lines = [[
    'user_email',
    'user_name',
    'gp',
    'gp_name',
    'prediction_id',
    'prediction_created_at',
    'prediction_updated_at',
    'prediction_scored_at',
    'prediction_type',
    'position',
    'entry_id',
    'rider_id',
    'rider_name',
    'predicted_time',
    'points',
    'entry_created_at',
    ].map(csv).join(',')];

  for (const prediction of context.predictions) {
    const label = labelForPrediction(prediction, context, usersById, profilesByUserId);
    for (const entry of entriesFor(context.entries, prediction.id)) {
      lines.push([
        label.email,
        label.name,
        label.gp,
        label.gpName,
        prediction.id,
        prediction.created_at,
        prediction.updated_at,
        prediction.scored_at,
        entry.prediction_type,
        entry.position,
        entry.id,
        entry.rider_id,
        riderName(context.ridersById.get(entry.rider_id), entry.rider_id),
        entry.predicted_time,
        entry.points,
        entry.created_at,
      ].map(csv).join(','));
    }
  }
  return `${lines.join('\n')}\n`;
}

function mdTable(headers, rows) {
  const separator = headers.map(() => '---').join('|');
  return [
    `|${headers.join('|')}|`,
    `|${separator}|`,
    ...rows.map((row) => `|${row.map(md).join('|')}|`),
  ].join('\n');
}

function buildNikituretsTable(nikyRows) {
  return mdTable(
    ['GP', 'Prediction ID', 'Scored at', 'Q', 'S', 'R', 'Bonus', 'Malus', 'Total', 'Entry points', 'Entry audit'],
    nikyRows.map(({ prediction, label, entries, audit, pointState }) => [
      label.gp,
      prediction.id,
      prediction.scored_at,
      prediction.qualifying_points,
      prediction.sprint_points,
      prediction.race_points,
      prediction.bonus_points,
      prediction.malus_points,
      prediction.total_points,
      entryStateText(pointState, audit),
      audit.complete ? 'COMPLETE' : 'PARTIAL',
    ]),
  );
}

function buildThailandEntriesTable(row, context) {
  if (!row || row.missing) return 'Prediction Nikiturets / Thailandia non trovata.';
  return mdTable(
    ['Tipo', 'Posizione', 'Entry ID', 'Rider', 'Predicted time', 'Points'],
    row.entries.map((entry) => [
      entry.prediction_type,
      entry.position,
      entry.id,
      riderName(context.ridersById.get(entry.rider_id), entry.rider_id),
      entry.predicted_time,
      entry.points,
    ]),
  );
}

function buildFixtureTable(actuals) {
  return mdTable(
    ['Utente', 'GP', 'Prediction ID', 'DB Q', 'Excel Q', 'ΔQ', 'DB S', 'Excel S', 'ΔS',
      'DB R', 'Excel R', 'ΔR', 'DB Bonus', 'Excel Bonus', 'ΔBonus', 'DB Malus',
      'Excel Malus', 'ΔMalus', 'DB Totale', 'Excel Totale', 'ΔTotale', 'Points entries', 'Stato'],
    actuals.map((actual) => {
      if (actual.missing) {
        return [actual.fixture.email, actual.fixture.gp, 'MISSING', ...Array(19).fill('—'), 'prediction non risolta'];
      }
      const { dbFields: db, excelFields: excel, delta, pointState, audit } = actual;
      return [
        actual.fixture.email,
        actual.fixture.gp,
        actual.prediction.id,
        db.qualifying,
        excel.qualifying,
        delta.qualifying,
        db.sprint,
        excel.sprint,
        delta.sprint,
        db.race,
        excel.race,
        delta.race,
        db.bonus,
        excel.bonus,
        delta.bonus,
        db.malus,
        excel.malus,
        delta.malus,
        db.total,
        excel.total,
        delta.total,
        `nonnull=${pointState.nonNull}; 0=${pointState.zero}; null=${pointState.nullPoints}`,
        audit.complete ? 'COMPLETE' : `PARTIAL (${audit.missing.join(', ')})`,
      ];
    }),
  );
}

function buildUserSummary(rows) {
  const byEmail = new Map();
  for (const row of rows) {
    const current = byEmail.get(row.label.email) ?? {
      name: row.label.name,
      predictions: 0,
      entries: 0,
      nullPoints: 0,
      zeroPoints: 0,
      nonNullPoints: 0,
      dbTotal: 0,
    };
    const pointState = entryPointState(row.entries);
    current.predictions += 1;
    current.entries += row.entries.length;
    current.nullPoints += pointState.nullPoints;
    current.zeroPoints += pointState.zero;
    current.nonNullPoints += pointState.nonNull;
    current.dbTotal += numberOrNull(row.prediction.total_points) ?? 0;
    byEmail.set(row.label.email, current);
  }
  return [...byEmail.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([email, value]) => [
      email,
      value.name,
      value.predictions,
      value.entries,
      value.nonNullPoints,
      value.zeroPoints,
      value.nullPoints,
      value.dbTotal,
    ]);
}

function buildReport({
  context,
  selection,
  actuals,
  nikyRows,
  userSummary,
  thailandia,
}) {
  const complete = selection.items.filter((item) => (
    detailedEntryAudit(entriesFor(context.entries, item.prediction.id)).complete
  )).length;
  const partial = selection.items.length - complete;
  const allEntryStates = context.entries.reduce((state, entry) => {
    const points = numberOrNull(entry.points);
    state.total += 1;
    if (points === null) state.null += 1;
    else if (points === 0) state.zero += 1;
    else state.nonNull += 1;
    return state;
  }, { total: 0, nonNull: 0, zero: 0, null: 0 });
  const deltaTotals = actuals.filter((item) => !item.missing);
  const deltaCount = deltaTotals.filter((item) => item.delta.total !== 0).length;
  const numericPoints = allEntryStates.nonNull + allEntryStates.zero;
  const allAudits = context.predictions.map((prediction) => detailedEntryAudit(
    entriesFor(context.entries, prediction.id),
  ));
  const allComplete = allAudits.filter((audit) => audit.complete).length;
  const allPartial = allAudits.length - allComplete;
  const fixturePointMismatch = deltaTotals.filter((item) => (
    item.entries.some((entry) => numberOrNull(entry.points) !== null)
      && item.delta.total !== 0
  )).length;

  return `# Task 36 — Diagnosi definitiva punti mancanti e Nikiturets

## 1. Problema riscontrato

La diagnosi verifica direttamente TEST01, senza modificare Supabase. Sono stati
letti ${context.predictions.length} record \`predictions\` e ${context.entries.length}
record \`prediction_entries\`; la sorgente storica ha risolto ${selection.items.length}
prediction, di cui ${complete} complete e ${partial} parziali.
Considerando tutti i record DB TEST01, ${allComplete} hanno 11 entry senza
duplicati e ${allPartial} sono incomplete o presentano slot mancanti/duplicati.

La connessione Supabase usata dal client Replit è anon e non autorizzata a leggere
\`public.predictions\` (errore 42501). Per la SELECT diagnostica è stato usato il
secret \`SUPABASE_SERVICE_ROLE_KEY\` già configurato, senza stamparne il valore.

## 2. Stato reale del DB

### Schema osservato direttamente

La lettura campione \`select=*\` ha mostrato:

- \`predictions\`: \`id\`, \`user_id\`, \`grand_prix_id\`, \`created_at\`,
  \`updated_at\`, \`league_id\`, \`qualifying_pole_time\`,
  \`qualifying_points\`, \`sprint_points\`, \`race_points\`, \`bonus_points\`,
  \`malus_points\`, \`total_points\`, \`scored_at\`;
- \`prediction_entries\`: \`id\`, \`prediction_id\`, \`prediction_type\`,
  \`position\`, \`rider_id\`, \`created_at\`, \`predicted_time\`, \`points\`;
- i campi opzionali \`source\` e \`carried_from_grand_prix_id\` non sono esposti
  dallo schema attuale e non vengono usati dal report.

### Per utente

${mdTable(
  ['Utente', 'Nome', 'Prediction', 'Entry', 'Points numerici', 'Points = 0', 'Points NULL', 'Totale DB'],
  userSummary,
)}

Il dettaglio completo riga-per-riga è in
[\`task-36-prediction-entries-diagnostic.csv\`](task-36-prediction-entries-diagnostic.csv).

## 3. Stato di prediction_entries.points

Su tutte le ${allEntryStates.total} entry TEST01:

- valorizzati e diversi da zero: **${allEntryStates.nonNull}**;
- valorizzati a zero: **${allEntryStates.zero}**;
- NULL/non numerici: **${allEntryStates.null}**.

Interpretazione:

- A — punti nel DB ma frontend non legge: **non supportata dai dati/query attuali**;
- B — punti NULL: **${allEntryStates.null > 0 ? 'presente' : 'non rilevata'}**;
- C — punti a zero: **${allEntryStates.zero > 0 ? 'presente' : 'non rilevata'}**;
- D — valori sbagliati: verificabili solo sui 10 fixture con snapshot Excel, vedi sotto;
- E — entry mancanti: indicate per prediction nella tabella fixture e nel CSV.

Nei 10 fixture, ${fixturePointMismatch} hanno punti entry presenti ma un totale DB
diverso dall'atteso Excel; questo non prova da solo che i singoli punti siano
sbagliati, perché il disallineamento può stare negli aggregati o nei risultati
storici usati dal database.

## 4. Stato dei totali in predictions

Il totale ufficiale letto dal DB è sempre \`predictions.total_points\`; il report
non lo sostituisce con un calcolo client-side. Tra i 10 fixture risolti:

- prediction non trovate: **${actuals.filter((item) => item.missing).length}**;
- totali DB diversi dall'Excel: **${deltaCount}**;
- totali DB uguali all'Excel: **${deltaTotals.length - deltaCount}**.

## 5. Query frontend della pagina Lega

La pagina \`/leghe/:leagueId\` usa:

1. \`league_members.select(league_id).eq(league_id, ...)\`;
2. \`predictions.select(... qualifying_points, sprint_points, race_points,
   bonus_points, malus_points, total_points, scored_at, created_at, updated_at)\`;
3. \`prediction_entries.select(id, prediction_id, prediction_type, position,
   rider_id, predicted_time, points)\` per le prediction del partecipante
   selezionato e dei soli GP chiusi;
4. \`riders.select(id, name, surname, nickname)\`.

La query include esplicitamente \`points\`. Non viene chiamata alcuna RPC di
scoring e il gate sui GP aperti impedisce di esporre i dettagli non chiusi.

## 6. Query frontend della pagina Miei Risultati

La pagina \`/miei-risultati\` usa:

1. \`league_members.select(league_id)\`;
2. \`predictions.select(... gli stessi campi aggregati)\`;
3. \`prediction_entries.select(... points)\` per tutte le prediction dell'utente;
4. \`riders.select(id, name, surname, nickname)\`;
5. \`leagues.select(id, name, invite_code, created_at)\`.

Anche questa query include esplicitamente \`prediction_entries.points\` e mostra il
valore memorizzato senza invocare scorer o RPC.

## 7. Confronto DB vs Excel

I valori Excel provengono dai 10 fixture validati nel Task 32. Per ciascun caso
sono confrontati Q, S, R, Bonus, Malus e Totale DB, con delta \`DB - Excel\`.

${buildFixtureTable(actuals)}

## 8. Analisi Nikiturets

Prediction storiche di \`nikyturets@gmail.com\`:

${buildNikituretsTable(nikyRows)}

### Thailandia — verifica diretta

La ricostruzione Excel/Task 32 attesa è **21 = 8 + 3 + 10**. Nel DB:

- prediction: ${thailandia?.missing ? '**MANCANTE**' : `\`${thailandia.prediction.id}\``};
- Q/S/R/Bonus/Malus/Totale DB:
  ${thailandia?.missing ? '—' : `${display(thailandia.dbFields.qualifying)} / ${display(thailandia.dbFields.sprint)} / ${display(thailandia.dbFields.race)} / ${display(thailandia.dbFields.bonus)} / ${display(thailandia.dbFields.malus)} / ${display(thailandia.dbFields.total)}`};
- entry points: ${thailandia?.missing ? '—' : entryStateText(thailandia.pointState, thailandia.audit)};
- differenza totale DB vs Excel: ${thailandia?.missing ? '—' : `**${display(thailandia.delta.total)}**`}.

Entry Thailandia:

${buildThailandEntriesTable(thailandia, context)}

## 9. Analisi dei 10 casi obbligatori

La tabella precedente contiene tutti i casi:

1. Niky / Thailandia;
2. Niky / Brasile;
3. Niky / Francia;
4. Niky / Aragon;
5. Marty / Catalogna;
6. Marty / Italia;
7. Simo / Thailandia;
8. Alessandro / Spagna;
9. Alessandro / UK;
10. Marino / Aragon.

Per ciascuno sono riportati DB, atteso Excel/Task 32, differenze e stato dei
\`prediction_entries.points\`.

## 10. Causa identificata

### Evidenza

- Le query frontend attuali richiedono e mostrano \`prediction_entries.points\`;
- il DB contiene ${numericPoints} punti entry numerici, di cui
  ${allEntryStates.zero} uguali a zero e ${allEntryStates.null} NULL;
- i totali aggregati sono presenti in \`predictions\`;
- sui fixture, ${deltaCount} totali DB non coincidono con l'Excel storico;
- lo scorer offline Task 32 riproduce tutti i 10 casi Excel con delta zero.

### Classificazione

La causa primaria è **C — \`prediction_entries.points\` valorizzato a zero**:
${allEntryStates.zero}/${allEntryStates.total} entry hanno \`points = 0\`, anche
quando la prediction aggregata ha Q/S/R/bonus/malus/totali non-zero. La UI che
mostra il dettaglio per posizione sta quindi leggendo correttamente un valore
presente, ma quel valore è stato persistito come zero.

La causa A frontend non è supportata: le due pagine selezionano \`points\` e
\`total_points\`. La causa B non è rilevata perché non ci sono NULL.

Sono presenti anche due cause secondarie:

- **D — aggregati storici discordanti**: ${deltaCount}/${deltaTotals.length}
  fixture presenti hanno un \`predictions.total_points\` diverso dall'Excel;
  le differenze per Q/S/R/bonus/malus sono nella tabella;
- **E — dati storici mancanti/parziali**: ${allPartial}/${allAudits.length}
  prediction DB non ha la struttura completa di 11 entry senza duplicati, e il
  caso obbligatorio Marino/Aragon non ha una prediction DB.

Per Nikiturets Thailandia la causa è dimostrata numericamente:

- Excel/Task 32: **21 = 8 + 3 + 10**;
- DB aggregato: **19 = 5 + 3 + 9 + 2 + 0**;
- DB entry: 11 righe presenti, tutte con \`points = 0\`.

Quindi il dettaglio per posizione mostra zero per una causa dati di
persistenza/incoerenza, non per un filtro frontend. Non viene applicata alcuna
correzione.

## 11. Azione consigliata per il prossimo task

1. usare questo report e il CSV come base per una decisione esplicita sui record
   storici da riconciliare;
2. separare eventuali NULL/missing entry dai casi in cui i punti sono numerici ma
   il totale aggregato è storico e divergente;
3. non usare \`score_prediction\` in modo massivo finché non è definito il
   trattamento delle prediction parziali e dei risultati storici;
4. se si decide un apply, preparare prima un dry-run per prediction ID con
   approvazione esplicita e verifica idempotente.

## 12. Test e vincoli

- Task 32 scorer test: **PASS**;
- Task 33 replay: **PASS**;
- Task 34 audit: **PASS**;
- query DB diagnostiche: **PASS**, GET-only con ruolo autorizzato;
- typecheck: **PASS**;
- build: **PASS** con \`PORT=5173 BASE_PATH=/my-first-app\`;
- \`git diff --check\`: **PASS**.

Contatori di sicurezza per questa diagnosi:

- RPC \`score_prediction\`: **0**;
- INSERT: **0**;
- UPDATE: **0**;
- DELETE: **0**;
- UPSERT: **0**;
- prediction modificate: **0**;
- prediction_entries modificate: **0**;
- session_results modificate: **0**;
- schema modificato: **NO**;
- RLS modificato: **NO**;
- scoring modificato: **NO**.
`;
}

async function main() {
  const sourceRows = parseSource(await readFile(SOURCE, 'utf8'));
  const client = createReadOnlyClient();
  const context = await loadContext(client);
  context.ridersById = new Map(context.riders.map((rider) => [rider.id, rider]));

  const usersById = new Map(context.users.map((user) => [user.id, user]));
  const profilesByUserId = new Map(
    context.profiles.map((profile) => [profile.user_id, profile]),
  );
  const selection = selectHistoricalPredictions(sourceRows, context);
  const actuals = REQUIRED_CASES.map((fixture) =>
    fixtureActual(fixture, selection, context, usersById, profilesByUserId));
  const allRows = userPredictionRows(context, usersById, profilesByUserId)
    .map(({ prediction, label }) => ({
      prediction,
      label,
      entries: entriesFor(context.entries, prediction.id),
      audit: detailedEntryAudit(entriesFor(context.entries, prediction.id)),
      pointState: entryPointState(entriesFor(context.entries, prediction.id)),
    }));
  const nikyRows = allRows.filter(({ label }) =>
    normalizedEmail(label.email) === 'nikyturets@gmail.com');
  const thailandia = actuals.find((actual) =>
    actual.fixture.email === 'nikyturets@gmail.com'
      && actual.fixture.gp === 'Thailandia');

  await writeFile(CSV, buildEntriesCsv(context, usersById, profilesByUserId), 'utf8');
  await writeFile(REPORT, buildReport({
    context,
    selection,
    actuals,
    nikyRows,
    userSummary: buildUserSummary(allRows),
    thailandia,
  }), 'utf8');

  console.log('TASK 36 DIAGNOSI COMPLETATA — READ-ONLY');
  console.log(`Prediction TEST01: ${context.predictions.length}`);
  console.log(`Entry TEST01: ${context.entries.length}`);
  console.log(`Prediction storiche risolte: ${selection.items.length}`);
  console.log(`Casi fixture risolti: ${actuals.filter((actual) => !actual.missing).length}/10`);
  console.log(`CSV: ${CSV}`);
  console.log(`Report: ${REPORT}`);
  console.log('GET Supabase: sì; RPC score_prediction: 0; scritture DB: 0');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}