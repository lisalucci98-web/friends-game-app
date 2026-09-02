/**
 * Importa una tabella TSV di pronostici storici senza scoring o carry-over.
 *
 * Dry-run di default:
 *   node scripts/import-historical-predictions-table.mjs \
 *     --source attached_assets/<file>.txt
 *
 * Import esplicito:
 *   ... --import
 *
 * Le prediction già presenti sulla chiave user + GP + lega vengono saltate
 * insieme a tutti i loro entry, come richiesto dalla specifica storica.
 */

import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

const DEFAULT_SOURCE =
  'attached_assets/Pasted-GP-Utente-Pole-position-tempo-pole-1-sprint-2-sprint-3-_1788342259417.txt';
const DEFAULT_REPORT = '.agents/outputs/historical-predictions-table-import.md';
const SEASON_YEAR = 2026;
const DEFAULT_LEAGUE_CODE = 'TEST01';

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

const RIDER_ALIASES = new Map([
  ['m. marquez', 'Marc Marquez'],
  ['marc marquez', 'Marc Marquez'],
  ['a. marquez', 'Alex Marquez'],
  ['alex marquez', 'Alex Marquez'],
  ['m. bezzecchi', 'Marco Bezzecchi'],
  ['marco bezzecchi', 'Marco Bezzecchi'],
  ['j. martin', 'Jorge Martin'],
  ['jorge martin', 'Jorge Martin'],
  ['a. ogura', 'Ai Ogura'],
  ['ai ogura', 'Ai Ogura'],
  ['f. di giannantonio', 'Fabio Di Giannantonio'],
  ['fabio di giannantonio', 'Fabio Di Giannantonio'],
  ['f. bagnaia', 'Francesco Bagnaia'],
  ['francesco bagnaia', 'Francesco Bagnaia'],
  ['p. acosta', 'Pedro Acosta'],
  ['pedro acosta', 'Pedro Acosta'],
  ['r. fernandez', 'Raul Fernandez'],
  ['raul fernandez', 'Raul Fernandez'],
  ['a. fernandez', 'Augusto Fernandez'],
  ['augusto fernandez', 'Augusto Fernandez'],
  ['j. mir', 'Joan Mir'],
  ['joan mir', 'Joan Mir'],
  ['f. aldeguer', 'Fermin Aldeguer'],
  ['f. aldegeur', 'Fermin Aldeguer'],
  ['fermin aldeguer', 'Fermin Aldeguer'],
  ['l. marini', 'Luca Marini'],
  ['luca marini', 'Luca Marini'],
  ['f. morbidelli', 'Franco Morbidelli'],
  ['franco morbidelli', 'Franco Morbidelli'],
  ['e. bastianini', 'Enea Bastianini'],
  ['enea bastianini', 'Enea Bastianini'],
  ['j. miller', 'Jack Miller'],
  ['jack miller', 'Jack Miller'],
  ['b. binder', 'Brad Binder'],
  ['brad binder', 'Brad Binder'],
  ['d. moreira', 'Diogo Moreira'],
  ['diogo moreira', 'Diogo Moreira'],
  ['j. zarco', 'Johann Zarco'],
  ['johann zarco', 'Johann Zarco'],
  ['f. quartararo', 'Fabio Quartararo'],
  ['fabio quartararo', 'Fabio Quartararo'],
  ['m. viñales', 'Maverick Viñales'],
  ['m. vinales', 'Maverick Viñales'],
  ['maverick viñales', 'Maverick Viñales'],
  ['n. bulega', 'Nicolo Bulega'],
  ['nicolo bulega', 'Nicolo Bulega'],
  ['t. razgatlioglu', 'Toprak Razgatlioglu'],
  ['toprak razgatlioglu', 'Toprak Razgatlioglu'],
  ['p. espargaro', 'Pol Espargaro'],
  ['pol espargaro', 'Pol Espargaro'],
]);

const COLUMN_NAMES = [
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

function parseArgs(argv) {
  const args = {
    importMode: false,
    source: DEFAULT_SOURCE,
    report: DEFAULT_REPORT,
    leagueId: '',
    leagueCode: DEFAULT_LEAGUE_CODE,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--import') args.importMode = true;
    else if (argument === '--source') args.source = argv[++index] ?? '';
    else if (argument === '--report') args.report = argv[++index] ?? '';
    else if (argument === '--league-id') args.leagueId = argv[++index] ?? '';
    else if (argument === '--league-code') args.leagueCode = argv[++index] ?? '';
    else if (argument === '--help' || argument === '-h') {
      console.log(`Import tabella pronostici storici

Opzioni:
  --import                 abilita le scritture; senza è dry-run
  --source <file.tsv>     sorgente TSV
  --report <file.md>      report di esecuzione
  --league-id <uuid>      lega target; prevale su --league-code
  --league-code <code>    codice lega target (default: ${DEFAULT_LEAGUE_CODE})`);
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
  const normalized = String(value ?? '').trim();
  return normalized === '' || normalized === '#N/A';
}

function deterministicUuid(value) {
  const bytes = createHash('sha256').update(value).digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function normalizePoleTime(value) {
  const raw = String(value ?? '').trim();
  const colonFormat = raw.match(/^(\d{2}):(\d{2}):(\d{3})$/);
  if (colonFormat) return `${colonFormat[1]}:${colonFormat[2]}.${colonFormat[3]}`;
  if (/^\d{2}:\d{2}\.\d{3}$/.test(raw)) return raw;
  return null;
}

function poleTimeToSeconds(value) {
  const normalized = normalizePoleTime(value);
  if (!normalized) return null;
  const match = normalized.match(/^(\d{2}):(\d{2})\.(\d{3})$/);
  return Number(match[1]) * 60 + Number(match[2]) + Number(match[3]) / 1000;
}

function parseTable(text) {
  const lines = text.replace(/\r/g, '').split('\n');
  while (lines.length && lines.at(-1) === '') lines.pop();
  if (!lines.length) throw new Error('La tabella sorgente è vuota.');

  const header = lines.shift().split('\t').map((cell) => cell.trim());
  if (header.length !== COLUMN_NAMES.length || header.some((cell, i) => cell !== COLUMN_NAMES[i])) {
    throw new Error(`Intestazione TSV inattesa: ${header.join(' | ')}`);
  }

  return lines.map((line, index) => {
    const cells = line.split('\t');
    if (cells.length > COLUMN_NAMES.length) {
      return { line: index + 2, cells, malformed: 'troppe colonne' };
    }
    while (cells.length < COLUMN_NAMES.length) cells.push('');
    return { line: index + 2, cells, malformed: null };
  });
}

function createSupabaseClient() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Servono VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.');
  }

  async function request(path, options = {}) {
    const response = await fetch(`${url}${path}`, {
      ...options,
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers ?? {}),
      },
      signal: AbortSignal.timeout(30_000),
    });
    const text = await response.text();
    let json = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      // L'errore usa solo un estratto non sensibile.
    }
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}: ${JSON.stringify(json ?? text.slice(0, 300))}`);
    }
    return { json, contentRange: response.headers.get('content-range') };
  }

  return {
    rest: (path, options) => request(`/rest/v1${path}`, options),
    auth: (path, options) => request(`/auth/v1${path}`, options),
  };
}

async function loadContext(client, args) {
  const sourceUsers = new Set();
  const { json: seasons } = await client.rest(`/seasons?year=eq.${SEASON_YEAR}&select=id,year`);
  if (!Array.isArray(seasons) || seasons.length !== 1) {
    throw new Error(`Stagione ${SEASON_YEAR} non univoca.`);
  }

  const seasonId = seasons[0].id;
  const [usersResponse, leaguesResponse, membersResponse, gpsResponse, ridersResponse] =
    await Promise.all([
      client.auth('/admin/users?page=1&per_page=1000'),
      client.rest('/leagues?select=id,name,invite_code'),
      client.rest('/league_members?select=league_id,user_id'),
      client.rest(
        `/grand_prix?season_id=eq.${encodeURIComponent(seasonId)}&is_test=eq.false`
          + '&select=id,name,short_name,date_start,date_end&order=date_start.asc',
      ),
      client.rest('/riders?select=id,name,surname'),
    ]);

  const users = Array.isArray(usersResponse.json?.users) ? usersResponse.json.users : [];
  const leagues = Array.isArray(leaguesResponse.json) ? leaguesResponse.json : [];
  const members = Array.isArray(membersResponse.json) ? membersResponse.json : [];
  const grandPrix = Array.isArray(gpsResponse.json) ? gpsResponse.json : [];
  const riders = Array.isArray(ridersResponse.json) ? ridersResponse.json : [];

  const targetLeagueMatches = args.leagueId
    ? leagues.filter((league) => league.id === args.leagueId)
    : leagues.filter((league) => league.invite_code === args.leagueCode);
  if (targetLeagueMatches.length !== 1) {
    throw new Error(`Lega target non univoca: ${targetLeagueMatches.length} match.`);
  }
  const league = targetLeagueMatches[0];

  return {
    users,
    members,
    league,
    grandPrix,
    riders,
    sourceUsers,
  };
}

function mapRiders(riders) {
  const result = new Map();
  for (const rider of riders) {
    const key = canonical(`${rider.name ?? ''} ${rider.surname ?? ''}`);
    const matches = result.get(key) ?? [];
    matches.push(rider);
    result.set(key, matches);
  }
  return result;
}

function riderMatch(value, riderByName) {
  if (isBlank(value)) return { status: 'BLANK' };
  const alias = RIDER_ALIASES.get(canonical(value));
  if (!alias) return { status: 'NOT_FOUND', value };
  const matches = riderByName.get(canonical(alias)) ?? [];
  if (matches.length !== 1) {
    return { status: 'NOT_FOUND', value, normalized: alias, matches: matches.length };
  }
  return { status: 'FOUND', rider: matches[0], normalized: alias };
}

function findGrandPrix(name, grandPrix) {
  const code = GP_CODES.get(name);
  if (!code) return { status: 'NOT_FOUND', value: name };
  const matches = grandPrix.filter((item) => item.short_name === code);
  if (matches.length !== 1) return { status: 'NOT_FOUND', value: name, code, matches: matches.length };
  return { status: 'FOUND', grandPrix: matches[0], code };
}

function buildPlan(rows, context, existingPredictions) {
  const usersByEmail = new Map(
    context.users
      .filter((user) => user.email)
      .map((user) => [normalizedEmail(user.email), user]),
  );
  const memberKeys = new Set(
    context.members
      .filter((member) => member.league_id === context.league.id)
      .map((member) => member.user_id),
  );
  const riderByName = mapRiders(context.riders);
  const existingByKey = new Map();
  for (const prediction of existingPredictions) {
    const key = `${prediction.user_id}|${prediction.grand_prix_id}|${prediction.league_id}`;
    const matches = existingByKey.get(key) ?? [];
    matches.push(prediction);
    existingByKey.set(key, matches);
  }

  const plan = {
    predictions: [],
    entries: [],
    rows: [],
    missingUsers: new Map(),
    missingGps: new Map(),
    missingRiders: new Map(),
    invalidValues: [],
    duplicateNaturalKeys: [],
    foundUserIds: new Set(),
    foundGpIds: new Set(),
    foundRiderIds: new Set(),
    skippedExisting: [],
    repairedPartial: [],
    recoveryPredictionIds: [],
    duplicateEntries: [],
    partialRows: [],
  };

  const addMissing = (map, value) => map.set(value, (map.get(value) ?? 0) + 1);
  const entrySpecs = [
    ['pole', 2, 'POLE', null],
    ['poleTime', 3, 'QUALIFYING_TIME', null],
    ['sprint1', 4, 'SPRINT', 1],
    ['sprint2', 5, 'SPRINT', 2],
    ['sprint3', 6, 'SPRINT', 3],
    ['race1', 7, 'RACE', 1],
    ['race2', 8, 'RACE', 2],
    ['race3', 9, 'RACE', 3],
    ['race4', 10, 'RACE', 4],
    ['race5', 11, 'RACE', 5],
    ['out', 12, 'RACE_OUT', null],
  ];

  for (const row of rows) {
    const [gpName, email] = row.cells;
    const decision = {
      line: row.line,
      gp: gpName?.trim() ?? '',
      email: email?.trim() ?? '',
      status: 'EXCLUDED',
      reason: null,
      entryCount: 0,
      skippedEntryCount: 0,
    };
    plan.rows.push(decision);

    if (row.malformed) {
      plan.invalidValues.push({ line: row.line, field: 'row', value: row.malformed });
      decision.reason = row.malformed;
      continue;
    }

    const user = usersByEmail.get(normalizedEmail(email));
    if (!user) {
      addMissing(plan.missingUsers, email || '(vuoto)');
      decision.reason = 'utente non trovato';
      continue;
    }
    if (!memberKeys.has(user.id)) {
      addMissing(plan.missingUsers, `${email} (non membro della lega target)`);
      decision.reason = 'utente non membro della lega target';
      continue;
    }
    plan.foundUserIds.add(user.id);

    const gpMatch = findGrandPrix(gpName?.trim(), context.grandPrix);
    if (gpMatch.status !== 'FOUND') {
      addMissing(plan.missingGps, gpName || '(vuoto)');
      decision.reason = 'GP non trovato con certezza';
      continue;
    }
    plan.foundGpIds.add(gpMatch.grandPrix.id);

    const naturalKey = `${user.id}|${gpMatch.grandPrix.id}|${context.league.id}`;
    const existing = existingByKey.get(naturalKey) ?? [];
    if (existing.length > 1) {
      plan.duplicateNaturalKeys.push({ line: row.line, gp: gpName, email });
      decision.reason = 'duplicati già presenti sulla chiave naturale';
      continue;
    }
    const predictionId = deterministicUuid(`historical-table|${naturalKey}`);
    if (existing.length === 1 && existing[0].id !== predictionId) {
      plan.skippedExisting.push({ line: row.line, gp: gpName, email, predictionId });
      decision.status = 'SKIPPED - prediction already exists';
      decision.reason = 'prediction già esistente';
      continue;
    }
    const isRecovery = existing.length === 1 && existing[0].id === predictionId;
    if (isRecovery) {
      plan.repairedPartial.push({ line: row.line, gp: gpName, email, predictionId });
      plan.recoveryPredictionIds.push(predictionId);
    }

    const specs = [];
    const uniqueEntryKeys = new Set();
    for (const [field, column, predictionType, position] of entrySpecs) {
      const value = row.cells[column]?.trim() ?? '';
      if (isBlank(value)) continue;

      if (predictionType === 'QUALIFYING_TIME') {
        const seconds = poleTimeToSeconds(value);
        if (seconds === null) {
          plan.invalidValues.push({ line: row.line, field, value });
          decision.skippedEntryCount += 1;
          continue;
        }
        specs.push({
          prediction_type: predictionType,
          position,
          rider_id: null,
          predicted_time: seconds,
        });
        continue;
      }

      const match = riderMatch(value, riderByName);
      if (match.status !== 'FOUND') {
        addMissing(plan.missingRiders, value);
        plan.invalidValues.push({ line: row.line, field, value });
        decision.skippedEntryCount += 1;
        continue;
      }
      plan.foundRiderIds.add(match.rider.id);
      const uniqueEntryKey = `${predictionType}|${match.rider.id}`;
      if (uniqueEntryKeys.has(uniqueEntryKey)) {
        plan.duplicateEntries.push({
          line: row.line,
          field,
          value,
          reason: `duplicato ${predictionType} dello stesso rider`,
        });
        plan.invalidValues.push({
          line: row.line,
          field,
          value: `${value} (duplicato ${predictionType})`,
        });
        decision.skippedEntryCount += 1;
        continue;
      }
      uniqueEntryKeys.add(uniqueEntryKey);
      specs.push({
        prediction_type: predictionType,
        position,
        rider_id: match.rider.id,
        predicted_time: null,
      });
    }

    if (!specs.length) {
      decision.reason = 'riga completamente vuota o senza valori validi';
      continue;
    }

    if (row.cells.length > 7 && row.cells.slice(7).every(isBlank)) {
      plan.partialRows.push({ line: row.line, gp: gpName, email });
    }
    decision.status = 'NEW';
    decision.entryCount = specs.length;
    if (!isRecovery) {
      plan.predictions.push({
        id: predictionId,
        user_id: user.id,
        grand_prix_id: gpMatch.grandPrix.id,
        league_id: context.league.id,
      });
    }
    const existingEntryKeys = new Set(
      (isRecovery ? existing[0].entries ?? [] : []).map(
        (entry) => `${entry.prediction_type}|${entry.rider_id ?? 'null'}`,
      ),
    );
    specs.filter((spec) => {
      const key = `${spec.prediction_type}|${spec.rider_id ?? 'null'}`;
      return !existingEntryKeys.has(key);
    }).forEach((spec, index) => {
      plan.entries.push({
        id: deterministicUuid(
          `historical-table-entry|${predictionId}|${spec.prediction_type}|${spec.position ?? 'none'}|${index}`,
        ),
        prediction_id: predictionId,
        ...spec,
        points: 0,
      });
    });
  }

  return plan;
}

async function loadExistingPredictions(client, leagueId) {
  const { json } = await client.rest(
    `/predictions?league_id=eq.${encodeURIComponent(leagueId)}`
      + '&select=id,user_id,grand_prix_id,league_id',
  );
  return Array.isArray(json) ? json : [];
}

async function loadExistingEntries(client, predictionIds) {
  if (!predictionIds.length) return [];
  const { json } = await client.rest(
    `/prediction_entries?prediction_id=in.(${predictionIds.join(',')})`
      + '&select=id,prediction_id,prediction_type,position,rider_id',
  );
  return Array.isArray(json) ? json : [];
}

async function postRows(client, table, rows) {
  if (!rows.length) return;
  await client.rest(`/${table}?on_conflict=id`, {
    method: 'POST',
    headers: { Prefer: 'resolution=ignore-duplicates,return=minimal' },
    body: JSON.stringify(rows),
  });
}

async function verifyImportedRows(client, plan) {
  const ids = [
    ...plan.predictions.map((row) => row.id),
    ...plan.recoveryPredictionIds,
  ];
  if (!ids.length) return { predictions: 0, entries: 0 };
  const idList = ids.join(',');
  const [{ json: predictions }, { json: entries }] = await Promise.all([
    client.rest(`/predictions?id=in.(${idList})&select=id`),
    client.rest(`/prediction_entries?prediction_id=in.(${idList})&select=id`),
  ]);
  return {
    predictions: Array.isArray(predictions) ? predictions.length : 0,
    entries: Array.isArray(entries) ? entries.length : 0,
  };
}

function listMap(map) {
  return [...map.entries()].map(([value, count]) => `${value} (${count})`);
}

function buildReport({ args, rows, context, plan, before, after, writePerformed }) {
  const lines = [
    '# Import massivo pronostici storici',
    '',
    `- Modalità: **${args.importMode ? 'IMPORT REALE' : 'DRY-RUN — NESSUNA SCRITTURA'}**`,
    `- Sorgente: **${args.source}**`,
    `- Stagione: **${SEASON_YEAR}**`,
    `- Lega: **${context.league.name}** (${context.league.invite_code})`,
    '',
    '## Riepilogo dry-run',
    '',
    `- Righe analizzate: **${rows.length}**`,
    `- Utenti trovati: **${plan.foundUserIds.size}**`,
    `- GP trovati: **${plan.foundGpIds.size}**`,
    `- Rider trovati: **${plan.foundRiderIds.size}**`,
    `- Prediction che verrebbero create: **${plan.predictions.length}**`,
    `- Prediction saltate perché già esistenti: **${plan.skippedExisting.length}**`,
    `- Prediction parziali recuperabili dall’import precedente: **${plan.repairedPartial.length}**`,
    `- Entries che verrebbero create: **${plan.entries.length}**`,
    `- Entries saltate per valori non validi o rider non trovati: **${plan.invalidValues.length}**`,
    `- Righe parziali con almeno un valore importabile: **${plan.partialRows.length}**`,
    `- Duplicati rilevati: **${plan.duplicateNaturalKeys.length + plan.duplicateEntries.length}**`,
    '',
    '## Risultato scrittura',
    '',
    `- Database modificato: **${writePerformed ? 'SÌ' : 'NO'}**`,
    `- Prediction create: **${writePerformed ? after.predictions : 0}**`,
    `- Prediction skipped: **${plan.skippedExisting.length}**`,
    `- Entries create: **${writePerformed ? after.entries : 0}**`,
    `- Entries skipped: **${plan.invalidValues.length}**`,
    `- Punti ricalcolati: **NO**`,
    `- RPC scoring invocate o modificate: **NO**`,
    `- Carry-over applicato: **NO**`,
    `- RLS/schema modificati: **NO**`,
    '',
    '## Verifica idempotenza',
    '',
    `- Record importati presenti prima dell’operazione: prediction **${before.predictions}**, entries **${before.entries}**`,
    `- Record importati presenti dopo l’operazione: prediction **${after.predictions}**, entries **${after.entries}**`,
    `- Prediction esistenti sovrascritte: **0**`,
    '',
    '## Utenti non trovati',
    '',
    ...(listMap(plan.missingUsers).length ? listMap(plan.missingUsers).map((value) => `- ${value}`) : ['- Nessuno']),
    '',
    '## GP non trovati',
    '',
    ...(listMap(plan.missingGps).length ? listMap(plan.missingGps).map((value) => `- ${value}`) : ['- Nessuno']),
    '',
    '## Rider non trovati',
    '',
    ...(listMap(plan.missingRiders).length ? listMap(plan.missingRiders).map((value) => `- ${value}`) : ['- Nessuno']),
    '',
    '## Valori non validi',
    '',
    ...(plan.invalidValues.length
      ? plan.invalidValues.map((item) => `- Riga ${item.line}, campo ${item.field}: ${item.value}`)
      : ['- Nessuno']),
    '',
    '## Righe parziali',
    '',
    ...(plan.partialRows.length
      ? plan.partialRows.map((item) => `- Riga ${item.line}: ${item.gp} / ${item.email}`)
      : ['- Nessuna']),
    '',
  ];
  return `${lines.join('\n')}\n`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const sourceText = await readFile(args.source, 'utf8');
  const rows = parseTable(sourceText);
  const client = createSupabaseClient();
  const context = await loadContext(client, args);
  const existingPredictions = await loadExistingPredictions(client, context.league.id);
  const existingEntries = await loadExistingEntries(
    client,
    existingPredictions.map((prediction) => prediction.id),
  );
  const entriesByPrediction = new Map();
  for (const entry of existingEntries) {
    const list = entriesByPrediction.get(entry.prediction_id) ?? [];
    list.push(entry);
    entriesByPrediction.set(entry.prediction_id, list);
  }
  const enrichedExistingPredictions = existingPredictions.map((prediction) => ({
    ...prediction,
    entries: entriesByPrediction.get(prediction.id) ?? [],
  }));
  const plan = buildPlan(rows, context, enrichedExistingPredictions);
  if (plan.duplicateNaturalKeys.length) {
    throw new Error('Rilevati duplicati sulla chiave user + GP + lega; import interrotto senza scritture.');
  }

  const importIds = plan.predictions.map((row) => row.id);
  const before = await verifyImportedRows(client, plan);
  if (args.importMode) {
    await postRows(client, 'predictions', plan.predictions);
    await postRows(client, 'prediction_entries', plan.entries);
  }
  const after = args.importMode ? await verifyImportedRows(client, plan) : before;
  if (args.importMode && (after.predictions !== plan.predictions.length || after.entries !== plan.entries.length)) {
    throw new Error(
      `Verifica post-import fallita: attese ${plan.predictions.length}/${plan.entries.length}, `
        + `ottenute ${after.predictions}/${after.entries.length}.`,
    );
  }

  const report = buildReport({
    args,
    rows,
    context,
    plan,
    before,
    after,
    writePerformed: args.importMode && (plan.predictions.length > 0 || plan.entries.length > 0),
  });
  await mkdir(dirname(args.report), { recursive: true });
  await writeFile(args.report, report, 'utf8');

  console.log(args.importMode ? 'IMPORT COMPLETATO' : 'DRY-RUN COMPLETATO');
  console.log(`Righe: ${rows.length}`);
  console.log(`Utenti trovati: ${plan.foundUserIds.size}`);
  console.log(`GP trovati: ${plan.foundGpIds.size}`);
  console.log(`Rider trovati: ${plan.foundRiderIds.size}`);
  console.log(`Prediction nuove: ${plan.predictions.length}`);
  console.log(`Prediction saltate: ${plan.skippedExisting.length}`);
  console.log(`Entries nuove: ${plan.entries.length}`);
  console.log(`Valori esclusi: ${plan.invalidValues.length}`);
  console.log(`Report: ${args.report}`);
  void importIds;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});