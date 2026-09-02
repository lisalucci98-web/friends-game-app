/**
 * Task 33 — replay read-only dello scoring storico Excel sulle prediction
 * importate nella lega TEST01.
 *
 * Questo script è deliberatamente dry-run only:
 * - usa esclusivamente richieste GET a Supabase REST/Auth;
 * - non contiene chiamate RPC;
 * - scrive soltanto il report locale indicato da --report;
 * - non interpreta le prediction incomplete come prediction complete.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { pathToFileURL } from 'node:url';

import { scorePrediction } from './historical-scoring-spec.mjs';

const SOURCE =
  'attached_assets/Pasted-GP-Utente-Pole-position-tempo-pole-1-sprint-2-sprint-3-_1788342259417.txt';
const DEFAULT_REPORT = '.agents/outputs/task-33-historical-excel-scoring.md';
const SEASON_YEAR = 2026;
const LEAGUE_CODE = 'TEST01';

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

const CLOSED_STATUSES = new Set([
  'FINISHED',
  'COMPLETED',
  'CLASSIFIED',
  'CLOSED',
]);

const ENTRY_TYPES = ['POLE', 'QUALIFYING_TIME', 'SPRINT', 'RACE', 'RACE_OUT'];
const EXPECTED_ENTRY_COUNTS = {
  POLE: 1,
  QUALIFYING_TIME: 1,
  SPRINT: 3,
  RACE: 5,
  RACE_OUT: 1,
};

function parseArgs(argv) {
  const args = { source: SOURCE, report: DEFAULT_REPORT };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--source') args.source = argv[++index] ?? '';
    else if (argument === '--report') args.report = argv[++index] ?? '';
    else if (argument === '--help' || argument === '-h') {
      console.log(
        'Uso: node scripts/validate-historical-excel-scoring-test01.mjs '
          + '[--source <file.tsv>] [--report <file.md>]',
      );
      process.exit(0);
    } else {
      throw new Error(`Argomento non riconosciuto: ${argument}`);
    }
  }
  return args;
}

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

function isBlank(value) {
  const text = String(value ?? '').trim();
  return text === '' || text === '#N/A';
}

function parseSource(text) {
  const lines = text.replace(/\r/g, '').split('\n');
  while (lines.length && lines.at(-1) === '') lines.pop();
  const header = lines.shift()?.split('\t').map((cell) => cell.trim());
  const expectedHeader = [
    'GP',
    'Utente',
    'Pole position',
    'tempo pole',
    '1 sprint',
    '2 sprint',
    '3 sprint',
    '1gp',
    '2gp',
    '3gp',
    '4gp',
    '5gp',
    'out',
  ];
  if (
    !header
    || header.length !== expectedHeader.length
    || header.some((cell, index) => cell !== expectedHeader[index])
  ) {
    throw new Error(`Intestazione TSV inattesa: ${header?.join(' | ') ?? '(vuota)'}`);
  }

  return lines.map((line, index) => {
    const cells = line.split('\t');
    while (cells.length < expectedHeader.length) cells.push('');
    return {
      line: index + 2,
      cells,
      malformed: cells.length > expectedHeader.length,
    };
  });
}

function createReadOnlyClient() {
  const url = (process.env.VITE_SUPABASE_URL ?? '').replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  if (!url || !key) {
    throw new Error('Servono VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.');
  }

  async function get(path) {
    const response = await fetch(`${url}${path}`, {
      method: 'GET',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(30_000),
    });
    const text = await response.text();
    let json = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      // Il messaggio HTTP sotto conserva solo un estratto non sensibile.
    }
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}: ${String(text).slice(0, 300)}`);
    }
    return json;
  }

  return {
    get: (path) => get(`/rest/v1${path}`),
    authGet: (path) => get(`/auth/v1${path}`),
  };
}

async function getChunks(client, ids, pathForIds) {
  const result = [];
  for (let index = 0; index < ids.length; index += 80) {
    result.push(...await client.get(pathForIds(ids.slice(index, index + 80))));
  }
  return result;
}

function userLabel(userId, usersById, profilesByUserId) {
  return profilesByUserId.get(userId)?.name
    ?? usersById.get(userId)?.email?.split('@')[0]
    ?? userId;
}

function selectHistoricalPredictions(rows, context) {
  const usersByEmail = new Map(
    context.users
      .filter((user) => user.email)
      .map((user) => [normalizedEmail(user.email), user]),
  );
  const memberIds = new Set(
    context.members
      .filter((member) => member.league_id === context.league.id)
      .map((member) => member.user_id),
  );
  const gpsByCode = new Map(context.grandPrix.map((gp) => [gp.short_name, gp]));
  const predictionsByKey = new Map(
    context.predictions.map((prediction) => [
      `${prediction.user_id}|${prediction.grand_prix_id}|${prediction.league_id}`,
      prediction,
    ]),
  );
  const selected = [];
  const errors = [];

  for (const row of rows) {
    if (row.malformed) {
      errors.push(`Riga ${row.line}: troppe colonne`);
      continue;
    }
    const [gpName, rawEmail] = row.cells;
    const user = usersByEmail.get(normalizedEmail(rawEmail));
    const code = GP_CODES.get(String(gpName ?? '').trim());
    const gp = gpsByCode.get(code);
    if (!user || !memberIds.has(user.id) || !gp || row.cells.slice(2).every(isBlank)) {
      continue;
    }

    const key = `${user.id}|${gp.id}|${context.league.id}`;
    const prediction = predictionsByKey.get(key);
    if (!prediction) {
      errors.push(`Riga ${row.line}: prediction non presente per ${gp.short_name}`);
      continue;
    }
    if (selected.some((item) => item.prediction.id === prediction.id)) {
      errors.push(`Riga ${row.line}: prediction duplicata ${prediction.id}`);
      continue;
    }
    selected.push({
      line: row.line,
      userId: user.id,
      gp,
      prediction,
    });
  }

  return { items: selected, errors };
}

function chooseOfficialSession(sessions, resultsBySession, gpId, type) {
  return sessions
    .filter((session) => session.grand_prix_id === gpId && session.type === type)
    .map((session) => ({
      session,
      results: resultsBySession.get(session.id) ?? [],
    }))
    .filter(({ session, results }) => CLOSED_STATUSES.has(session.status) && results.length > 0)
    .sort((left, right) => {
      if (right.results.length !== left.results.length) {
        return right.results.length - left.results.length;
      }
      return String(right.session.session_date).localeCompare(String(left.session.session_date));
    })[0] ?? null;
}

function riderFullName(rider) {
  return `${rider?.name ?? ''} ${rider?.surname ?? ''}`.trim();
}

function parseOfficialTime(value) {
  if (typeof value === 'number') return value;
  const match = String(value ?? '').trim().match(/^(\d+)'(\d+)\.(\d{3})$/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]) + Number(match[3]) * 0.001;
}

function orderedResults(results) {
  return [...results].sort((left, right) => Number(left.position) - Number(right.position));
}

export function buildOfficialResults(coverage, ridersById) {
  const qualifyingResults = orderedResults(coverage.qualifying.results);
  const sprintResults = orderedResults(coverage.sprint.results);
  const raceResults = orderedResults(coverage.race.results);
  const name = (result) => riderFullName(ridersById.get(result.rider_id));
  const nonClassified = raceResults
    .filter((result) => result.status !== 'CLASSIFIED')
    .map(name)
    .filter(Boolean);

  return {
    pole: name(qualifyingResults.find((result) => Number(result.position) === 1)),
    secondQualifying: name(
      qualifyingResults.find((result) => Number(result.position) === 2),
    ),
    qualifyingTimeSeconds: parseOfficialTime(
      qualifyingResults.find((result) => Number(result.position) === 1)?.total_time,
    ),
    sprintTopThree: sprintResults.slice(0, 3).map(name),
    raceTopFive: raceResults.slice(0, 5).map(name),
    outText: nonClassified.join(', '),
  };
}

function entriesForPrediction(entries, predictionId) {
  return entries.filter((entry) => entry.prediction_id === predictionId);
}

export function entryAudit(entries) {
  const counts = Object.fromEntries(
    ENTRY_TYPES.map((type) => [
      type,
      entries.filter((entry) => entry.prediction_type === type).length,
    ]),
  );
  const missing = ENTRY_TYPES.filter((type) =>
    counts[type] < EXPECTED_ENTRY_COUNTS[type]);
  const duplicateSlots = [];
  for (const type of ENTRY_TYPES) {
    const seen = new Set();
    for (const entry of entries.filter((item) => item.prediction_type === type)) {
      const slot = entry.position ?? 'none';
      if (seen.has(slot)) duplicateSlots.push(`${type}:${slot}`);
      seen.add(slot);
    }
  }
  return {
    counts,
    missing,
    duplicateSlots,
    complete: missing.length === 0 && duplicateSlots.length === 0,
  };
}

export function buildPrediction(entries, ridersById) {
  const byType = (type) => entries.filter((entry) => entry.prediction_type === type);
  const rider = (type, position = null) => {
    const entry = byType(type).find((item) => (
      position === null ? true : Number(item.position) === position
    ));
    return entry?.rider_id ? riderFullName(ridersById.get(entry.rider_id)) : '';
  };
  const timeEntry = byType('QUALIFYING_TIME')[0];

  return {
    pole: rider('POLE'),
    qualifyingTime: timeEntry?.predicted_time ?? null,
    sprint: [1, 2, 3].map((position) => rider('SPRINT', position)),
    raceTopFive: [1, 2, 3, 4, 5].map((position) => rider('RACE', position)),
    out: rider('RACE_OUT'),
  };
}

function secondsToExcelTime(value) {
  if (value === null || value === undefined || value === '') return value;
  if (typeof value !== 'number' || !Number.isFinite(value)) return value;
  const minutes = Math.floor(value / 60);
  const milliseconds = Math.round((value - minutes * 60) * 1000);
  const seconds = Math.floor(milliseconds / 1000);
  const remainder = milliseconds % 1000;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(remainder).padStart(3, '0')}`;
}

function scoreRow(item, entries, official, ridersById) {
  const selectedEntries = entriesForPrediction(entries, item.prediction.id);
  const audit = entryAudit(selectedEntries);
  if (!audit.complete) {
    return {
      item,
      audit,
      score: null,
      status: 'PARTIAL',
    };
  }
  const prediction = buildPrediction(selectedEntries, ridersById);
  const score = scorePrediction({
    ...prediction,
    qualifyingTime: secondsToExcelTime(prediction.qualifyingTime),
  }, official);
  return {
    item,
    audit,
    prediction,
    score,
    status: 'SCORED_OFFLINE',
  };
}

function numberOrZero(value) {
  return value === null || value === undefined ? 0 : Number(value);
}

function comparison(row) {
  if (!row.score) return null;
  const current = row.item.prediction;
  const expected = row.score;
  const databaseCategory = {
    qualifying: numberOrZero(current.qualifying_points),
    sprint: numberOrZero(current.sprint_points),
    race: numberOrZero(current.race_points),
    total: numberOrZero(current.total_points),
  };
  const excelCategory = {
    qualifying: expected.qualifying,
    sprint: expected.sprint,
    race: expected.race,
    total: expected.total,
  };
  const databaseComponents = {
    qualifying: numberOrZero(current.qualifying_points),
    sprint: numberOrZero(current.sprint_points),
    racePosition: numberOrZero(current.race_points),
    bonus: numberOrZero(current.bonus_points),
    malus: numberOrZero(current.malus_points),
    total: numberOrZero(current.total_points),
  };
  const excelComponents = {
    qualifying: expected.qualifying,
    sprint: expected.sprint,
    racePosition: expected.racePosition,
    bonus: expected.bonus,
    malus: expected.malus,
    total: expected.total,
  };
  const categoryMatch = Object.keys(excelCategory)
    .every((key) => databaseCategory[key] === excelCategory[key]);
  const componentMatch = Object.keys(excelComponents)
    .every((key) => databaseComponents[key] === excelComponents[key]);
  return {
    databaseCategory,
    excelCategory,
    databaseComponents,
    excelComponents,
    categoryMatch,
    componentMatch,
  };
}

function markdownCell(value) {
  return String(value ?? '—').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

function formatVector(vector, keys) {
  return keys.map((key) => `${key}=${vector[key]}`).join(', ');
}

function buildReport({
  args,
  rows,
  context,
  selection,
  entries,
  resultsBySession,
  coverageByGp,
  scoredRows,
  extraPredictions,
  usersById,
  profilesByUserId,
}) {
  const fullRows = scoredRows.filter((row) => row.status === 'SCORED_OFFLINE');
  const partialRows = scoredRows.filter((row) => row.status === 'PARTIAL');
  const comparisons = fullRows.map((row) => ({
    ...row,
    comparison: comparison(row),
  }));
  const categoryMatches = comparisons.filter((row) => row.comparison.categoryMatch).length;
  const componentMatches = comparisons.filter((row) => row.comparison.componentMatch).length;
  const gpIds = [...new Set(selection.items.map((item) => item.gp.id))];
  const coverageRows = gpIds.map((gpId) => {
    const gp = context.grandPrix.find((item) => item.id === gpId);
    const gpRows = scoredRows.filter((row) => row.item.gp.id === gpId);
    const coverage = coverageByGp.get(gpId);
    const sessionText = (value) => value
      ? `${value.results.length} risultati / ${value.session.status}`
      : 'nessun risultato';
    return {
      gp,
      rows: gpRows,
      qualifying: sessionText(coverage.qualifying),
      sprint: sessionText(coverage.sprint),
      race: sessionText(coverage.race),
    };
  });
  const byUser = new Map();
  for (const row of comparisons) {
    const userId = row.item.userId;
    const current = byUser.get(userId) ?? {
      user: userLabel(userId, usersById, profilesByUserId),
      predictions: 0,
      categoryMatches: 0,
      componentMatches: 0,
      excelTotal: 0,
      databaseTotal: 0,
    };
    current.predictions += 1;
    current.categoryMatches += row.comparison.categoryMatch ? 1 : 0;
    current.componentMatches += row.comparison.componentMatch ? 1 : 0;
    current.excelTotal += row.comparison.excelCategory.total;
    current.databaseTotal += row.comparison.databaseCategory.total;
    byUser.set(userId, current);
  }

  const lines = [
    '# Task 33 — Scoring storico Excel su TEST01',
    '',
    '- Modalità: **DRY-RUN OBBLIGATORIO — NESSUNA SCRITTURA**',
    `- Lega: **${context.league.name}** (${LEAGUE_CODE})`,
    `- Stagione: **${SEASON_YEAR}**`,
    '- Accesso dati: **solo GET Supabase REST/Auth**',
    '- RPC scoring invocate: **0**',
    '',
    '## Perimetro e sicurezza',
    '',
    `- Righe sorgente analizzate: **${rows.length}**`,
    `- Prediction nella lega TEST01: **${context.predictions.length}**`,
    `- Prediction storiche risolte dalla sorgente: **${selection.items.length}**`,
    `- Prediction non presenti nella sorgente storica: **${extraPredictions.length}**`,
    `- Entry delle prediction storiche selezionate: **${entries.length}**`,
    `- Prediction complete: **${fullRows.length}**`,
    `- Prediction parziali escluse dal replay: **${partialRows.length}**`,
    `- Prediction già marcate scored_at: **${selection.items.filter((item) => item.prediction.scored_at !== null).length}**`,
    '',
    '- Le prediction parziali non vengono completate, corrette, ricalcolate o inviate alla RPC.',
    '- I campi aggregati database vengono soltanto letti e confrontati.',
    '- Il report locale è l’unico file scritto da questa esecuzione.',
    '',
    '## Copertura risultati ufficiali',
    '',
    '| GP | Prediction | Qualifica | Sprint | Gara |',
    '|---|---:|---|---|---|',
    ...coverageRows.map((row) =>
      `| ${row.gp.short_name} | ${row.rows.length} | ${row.qualifying} | ${row.sprint} | ${row.race} |`),
    '',
    '## Esito replay offline',
    '',
    `- Replay Excel completati: **${fullRows.length}**`,
    `- Confronti categoria Q/S/R/T coincidenti: **${categoryMatches}/${comparisons.length}**`,
    `- Confronti componenti Q/S/racePosition/bonus/malus/T coincidenti: **${componentMatches}/${comparisons.length}**`,
    '',
    '### Totali per utente sulle sole prediction complete',
    '',
    '| Utente | Prediction | Match categorie | Match componenti | Totale Excel | Totale database | Delta |',
    '|---|---:|---:|---:|---:|---:|---:|',
    ...[...byUser.values()]
      .sort((left, right) => right.excelTotal - left.excelTotal)
      .map((row) =>
        `| ${markdownCell(row.user)} | ${row.predictions} | ${row.categoryMatches}`
        + ` | ${row.componentMatches} | ${row.excelTotal} | ${row.databaseTotal}`
        + ` | ${row.excelTotal - row.databaseTotal} |`),
    '',
    '## Dettaglio prediction complete',
    '',
    '| Utente | GP | Excel Q/S/R/T | DB Q/S/R/T | Excel componenti | DB componenti | Categorie | Componenti | scored_at |',
    '|---|---|---|---|---|---|---|---|---|',
    ...comparisons.map((row) => {
      const item = row.item;
      const c = row.comparison;
      return `| ${markdownCell(userLabel(item.userId, usersById, profilesByUserId))}`
        + ` | ${item.gp.short_name}`
        + ` | ${formatVector(c.excelCategory, ['qualifying', 'sprint', 'race', 'total'])}`
        + ` | ${formatVector(c.databaseCategory, ['qualifying', 'sprint', 'race', 'total'])}`
        + ` | ${formatVector(c.excelComponents, ['qualifying', 'sprint', 'racePosition', 'bonus', 'malus', 'total'])}`
        + ` | ${formatVector(c.databaseComponents, ['qualifying', 'sprint', 'racePosition', 'bonus', 'malus', 'total'])}`
        + ` | ${c.categoryMatch ? 'PASS' : 'DIFF'}`
        + ` | ${c.componentMatch ? 'PASS' : 'DIFF'}`
        + ` | ${item.prediction.scored_at ? 'valorizzato' : 'vuoto'} |`;
    }),
    '',
    '## Prediction parziali escluse dal replay',
    '',
    '- Criterio completo richiesto: 1 POLE, 1 QUALIFYING_TIME, 3 SPRINT, 5 RACE, 1 RACE_OUT.',
    '- Non viene applicata alcuna regola autonoma per celle mancanti.',
    '',
    '| Utente | GP | Entry | Mancanti | Slot duplicati | scored_at |',
    '|---|---|---:|---|---|---|',
    ...partialRows.map((row) =>
      `| ${markdownCell(userLabel(row.item.userId, usersById, profilesByUserId))}`
      + ` | ${row.item.gp.short_name} | ${Object.values(row.audit.counts).reduce((a, b) => a + b, 0)}`
      + ` | ${row.audit.missing.join(', ') || '—'}`
      + ` | ${row.audit.duplicateSlots.join(', ') || '—'}`
      + ` | ${row.item.prediction.scored_at ? 'valorizzato' : 'vuoto'} |`),
    '',
    '## Prediction TEST01 non risolte dalla sorgente storica',
    '',
    ...(extraPredictions.length
      ? extraPredictions.map((item) =>
        `- ${markdownCell(userLabel(item.user_id, usersById, profilesByUserId))} / ${item.gp?.short_name ?? item.grand_prix_id}`)
      : ['- Nessuna']),
    '',
    '## Verifica finale',
    '',
    `- Errori di selezione: **${selection.errors.length}**`,
    `- Risultati ufficiali mancanti per un GP selezionato: **${coverageRows.filter((row) =>
      row.qualifying === 'nessun risultato' || row.sprint === 'nessun risultato' || row.race === 'nessun risultato').length}**`,
    '- INSERT/UPDATE/DELETE/UPSERT: **0**',
    '- `score_prediction`: **non chiamata**',
    '- Prediction modificate: **0**',
    '- Prediction entries modificate: **0**',
    '- Risultati ufficiali, schema, RLS e RPC modificati: **NO**',
    `- Report scritto: **${args.report}**`,
    '',
  ];
  return `${lines.join('\n')}\n`;
}

async function loadContext(client) {
  const [seasons, leagues] = await Promise.all([
    client.get(`/seasons?year=eq.${SEASON_YEAR}&select=id,year`),
    client.get(`/leagues?invite_code=eq.${LEAGUE_CODE}&select=id,name,invite_code`),
  ]);
  if (seasons.length !== 1 || leagues.length !== 1) {
    throw new Error('Stagione o lega target non univoca.');
  }
  const seasonId = seasons[0].id;
  const league = leagues[0];
  const [usersResponse, members, grandPrix, predictions, riders, sessions, profiles] =
    await Promise.all([
      client.authGet('/admin/users?page=1&per_page=1000'),
      client.get(`/league_members?league_id=eq.${league.id}&select=league_id,user_id`),
      client.get(`/grand_prix?season_id=eq.${seasonId}&is_test=eq.false`
        + '&select=id,name,short_name,date_start,date_end&order=date_start.asc'),
      client.get(`/predictions?league_id=eq.${league.id}`
        + '&select=id,user_id,grand_prix_id,league_id,qualifying_points,sprint_points,'
        + 'race_points,bonus_points,malus_points,total_points,scored_at,updated_at'),
      client.get('/riders?select=id,name,surname,nickname'),
      client.get('/sessions?select=id,grand_prix_id,type,status,session_date,number'
        + '&order=session_date.asc'),
      client.get('/profiles?select=id,user_id,name'),
    ]);
  return {
    league,
    users: usersResponse.users ?? [],
    members,
    grandPrix,
    predictions,
    riders,
    sessions,
    profiles,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const rows = parseSource(await readFile(args.source, 'utf8'));
  const client = createReadOnlyClient();
  const context = await loadContext(client);
  const selection = selectHistoricalPredictions(rows, context);
  const selectedIds = new Set(selection.items.map((item) => item.prediction.id));
  const extraPredictions = context.predictions
    .filter((prediction) => !selectedIds.has(prediction.id))
    .map((prediction) => ({
      ...prediction,
      gp: context.grandPrix.find((gp) => gp.id === prediction.grand_prix_id),
    }));
  const entries = await getChunks(
    client,
    selection.items.map((item) => item.prediction.id),
    (ids) => `/prediction_entries?prediction_id=in.(${ids.join(',')})`
      + '&select=id,prediction_id,prediction_type,position,rider_id,predicted_time,points',
  );
  const results = await getChunks(
    client,
    context.sessions
      .filter((session) => context.grandPrix.some((gp) => gp.id === session.grand_prix_id))
      .map((session) => session.id),
    (ids) => `/session_results?session_id=in.(${ids.join(',')})`
      + '&select=id,session_id,rider_id,position,total_time,status',
  );

  const ridersById = new Map(context.riders.map((rider) => [rider.id, rider]));
  const usersById = new Map(context.users.map((user) => [user.id, user]));
  const profilesByUserId = new Map(context.profiles.map((profile) => [profile.user_id, profile]));
  const resultsBySession = new Map();
  for (const result of results) {
    const current = resultsBySession.get(result.session_id) ?? [];
    current.push(result);
    resultsBySession.set(result.session_id, current);
  }

  const coverageByGp = new Map();
  for (const item of selection.items) {
    if (coverageByGp.has(item.gp.id)) continue;
    coverageByGp.set(item.gp.id, {
      qualifying: chooseOfficialSession(
        context.sessions,
        resultsBySession,
        item.gp.id,
        'Q',
      ),
      sprint: chooseOfficialSession(
        context.sessions,
        resultsBySession,
        item.gp.id,
        'SPR',
      ),
      race: chooseOfficialSession(
        context.sessions,
        resultsBySession,
        item.gp.id,
        'RAC',
      ),
    });
  }

  const officialByGp = new Map();
  for (const [gpId, coverage] of coverageByGp) {
    if (!coverage.qualifying || !coverage.sprint || !coverage.race) continue;
    officialByGp.set(
      gpId,
      buildOfficialResults(coverage, ridersById),
    );
  }

  const scoredRows = selection.items.map((item) => {
    const official = officialByGp.get(item.gp.id);
    if (!official) {
      return {
        item,
        audit: entryAudit(entriesForPrediction(entries, item.prediction.id)),
        score: null,
        status: 'NO_OFFICIAL_RESULTS',
      };
    }
    return scoreRow(item, entries, official, ridersById);
  });

  const report = buildReport({
    args,
    rows,
    context,
    selection,
    entries,
    resultsBySession,
    coverageByGp,
    scoredRows,
    extraPredictions,
    usersById,
    profilesByUserId,
  });
  await writeFile(args.report, report, 'utf8');

  const fullRows = scoredRows.filter((row) => row.status === 'SCORED_OFFLINE');
  const partialRows = scoredRows.filter((row) => row.status === 'PARTIAL');
  const comparisons = fullRows.map(comparison);
  console.log('DRY-RUN TASK 33 COMPLETATO');
  console.log(`Prediction storiche: ${selection.items.length}`);
  console.log(`Prediction complete valutate offline: ${fullRows.length}`);
  console.log(`Prediction parziali escluse: ${partialRows.length}`);
  console.log(`Match categorie Q/S/R/T: ${comparisons.filter((row) => row.categoryMatch).length}/${comparisons.length}`);
  console.log(`Match componenti: ${comparisons.filter((row) => row.componentMatch).length}/${comparisons.length}`);
  console.log(`RPC invocate: 0`);
  console.log(`Report: ${args.report}`);
}

export {
  buildReport,
  chooseOfficialSession,
  comparison,
  createReadOnlyClient,
  parseSource,
  selectHistoricalPredictions,
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}