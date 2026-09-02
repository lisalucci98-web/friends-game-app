/**
 * Task 38 — mappatura read-only riga-per-riga tra i workbook storici
 * Excel e le prediction/entry già presenti in TEST01.
 *
 * Il comando usa solo GET verso Supabase e scrive esclusivamente il report
 * locale. Non contiene INSERT, UPDATE, DELETE, UPSERT o chiamate RPC.
 */

import { execFileSync } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

import { parseExcelTime, scorePrediction } from './historical-scoring-spec.mjs';
import {
  createReadOnlyClient,
  entryAudit,
} from './validate-historical-excel-scoring-test01.mjs';
import {
  detailedScore,
} from './audit-historical-scoring-task34.mjs';

const REPORT = '.agents/outputs/task-38-excel-db-mapping.md';
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
const EXTRA_PREDICTION_IDS = new Set([
  'a24c434a-17ff-45e6-a008-64dce2e5b634',
  '24ab1b38-0fe7-5d61-9272-3998401157cc',
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

const WORKBOOKS = new Map([
  ['THA', ['/tmp/fantamotogp-thailandia.xlsx', 'Thailandia']],
  ['BRA', ['/tmp/fantamotogp-brasile.xlsx', 'Brasile']],
  ['USA', ['/tmp/fantamotogp-usa.xlsx', 'USA']],
  ['QAT', ['/tmp/fantamotogp-qatar.xlsx', 'Qatar']],
  ['SPA', ['/tmp/fantamotogp-spagna.xlsx', 'Spagna']],
  ['FRA', ['/tmp/fantamotogp-francia.xlsx', 'Francia']],
  ['CAT', ['/tmp/fantamotogp-catalogna.xlsx', 'Catalogna']],
  ['ITA', ['/tmp/fantamotogp-italia.xlsx', 'Italia']],
  ['HUN', ['/tmp/fantamotogp-ungheria.xlsx', 'Ungheria']],
  ['CZE', ['/tmp/fantamotogp-repubblica-ceca.xlsx', 'Repubblica Ceca']],
  ['NED', ['/tmp/fantamotogp-netherlands.xlsx', 'Netherlands']],
  ['GER', ['/tmp/fantamotogp-germany.xlsx', 'Germania']],
  ['GBR', ['/tmp/fantamotogp-uk.xlsx', 'UK']],
  ['ARA', ['/tmp/fantamotogp-aragon.xlsx', 'Aragon']],
]);

function parseArgs(argv) {
  const args = { report: REPORT };
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === '--report') args.report = argv[++index] ?? '';
    else if (argv[index] === '--help' || argv[index] === '-h') {
      console.log('Uso: node scripts/task-38-excel-db-mapping.mjs [--report <file.md>]');
      process.exit(0);
    } else {
      throw new Error(`Argomento non riconosciuto: ${argv[index]}`);
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

function emailKey(value) {
  return canonical(value).replace(/\s+/g, '');
}

function valueKey(value) {
  return canonical(value)
    .replace(/[.']/g, '')
    .replace(/[,;]+/g, ' ')
    .replace(/\s+/g, ' ');
}

function isBlank(value) {
  return value === null || value === undefined || String(value).trim() === ''
    || String(value).trim().toUpperCase() === '#N/A';
}

function display(value) {
  return value === null || value === undefined || value === '' ? '—' : String(value);
}

function md(value) {
  return display(value).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

function mdTable(headers, rows) {
  return [
    `|${headers.join('|')}|`,
    `|${headers.map(() => '---').join('|')}|`,
    ...rows.map((row) => `|${row.map(md).join('|')}|`),
  ].join('\n');
}

function unzipText(file, member) {
  return execFileSync('unzip', ['-p', file, member], {
    encoding: 'utf8',
    maxBuffer: 8 * 1024 * 1024,
  });
}

function decodeXml(value) {
  return String(value ?? '')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, decimal) => String.fromCodePoint(Number(decimal)))
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

function xmlAttrs(fragment) {
  const attrs = {};
  for (const match of String(fragment).matchAll(/([\w:.-]+)="([^"]*)"/g)) {
    attrs[match[1]] = decodeXml(match[2]);
  }
  return attrs;
}

function xmlText(fragment) {
  return decodeXml(String(fragment ?? '').replace(/<[^>]+>/g, ''));
}

function sharedStrings(xml) {
  return [...xml.matchAll(/<si\b[^>]*>([\s\S]*?)<\/si>/g)]
    .map((match) => xmlText(match[1].replace(/<\/?r\b[^>]*>/g, '')));
}

function parseWorksheet(xml, strings) {
  const rows = [];
  for (const rowMatch of xml.matchAll(/<row\b([^>]*)>([\s\S]*?)<\/row>/g)) {
    const rowAttrs = xmlAttrs(rowMatch[1]);
    const row = { number: Number(rowAttrs.r), cells: new Map() };
    for (const cellMatch of rowMatch[2].matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const attrs = xmlAttrs(cellMatch[1]);
      const ref = attrs.r ?? '';
      const column = ref.match(/^([A-Z]+)/)?.[1];
      if (!column) continue;
      const body = cellMatch[2] ?? '';
      const raw = body.match(/<v\b[^>]*>([\s\S]*?)<\/v>/)?.[1] ?? '';
      const inline = body.match(/<is\b[^>]*>([\s\S]*?)<\/is>/)?.[1];
      let value = raw === '' ? (inline === undefined ? '' : xmlText(inline)) : decodeXml(raw);
      if (attrs.t === 's' && value !== '') value = strings[Number(value)] ?? '';
      row.cells.set(column, {
        value,
        formula: body.match(/<f\b[^>]*>([\s\S]*?)<\/f>/)?.[1]
          ? decodeXml(body.match(/<f\b[^>]*>([\s\S]*?)<\/f>/)[1])
          : null,
      });
    }
    rows.push(row);
  }
  return rows;
}

function readWorkbook(file) {
  const strings = sharedStrings(unzipText(file, 'xl/sharedStrings.xml'));
  const workbook = unzipText(file, 'xl/workbook.xml');
  const relationships = unzipText(file, 'xl/_rels/workbook.xml.rels');
  const targets = new Map(
    [...relationships.matchAll(/<Relationship\b([^>]*)\/>/g)]
      .map((match) => {
        const attrs = xmlAttrs(match[1]);
        return [attrs.Id, attrs.Target];
      }),
  );
  const sheets = [];
  for (const match of workbook.matchAll(/<sheet\b([^>]*)\/>/g)) {
    const attrs = xmlAttrs(match[1]);
    const target = targets.get(attrs['r:id']);
    if (!target) continue;
    const member = target.startsWith('/') ? target.slice(1) : `xl/${target}`;
    sheets.push({
      name: attrs.name,
      member,
      rows: parseWorksheet(unzipText(file, member), strings),
    });
  }
  return sheets;
}

function rowValues(row) {
  return Object.fromEntries([...row.cells].map(([column, cell]) => [column, cell.value]));
}

function headerIndex(sheet) {
  const first = sheet.rows.find((row) => row.number === 1) ?? sheet.rows[0];
  const result = new Map();
  if (!first) return result;
  for (const [column, cell] of first.cells) result.set(canonical(cell.value), column);
  return result;
}

function firstColumn(headers, predicates) {
  for (const [header, column] of headers) {
    if (predicates.some((predicate) => predicate(header))) return column;
  }
  return null;
}

function postColumns(headers, count, mode = null) {
  const result = [];
  for (const [header, column] of headers) {
    if (mode === 'sprint' && !/\bs$/.test(header)) continue;
    if (mode === 'race' && !/\bgp$/.test(header)) continue;
    if (/^\d[°º]?\s*(posto|post[io]|p)\b/.test(header)
      || /^\d[°º]?\s*(gp|s)\b/.test(header)
      || /^\d[°º]?\s*(posto|gp|s)$/.test(header)) {
      result.push([Number(header.match(/^\d+/)[0]), column]);
    }
  }
  return result
    .sort((left, right) => left[0] - right[0])
    .slice(0, count)
    .map(([, column]) => column);
}

function identifySheet(sheet) {
  const headers = headerIndex(sheet);
  const labels = [...headers.keys()];
  const hasEmail = labels.some((label) => label.includes('indirizzo email'));
  const hasOut = labels.some((label) => label === 'out' || label.includes('pilota out'));
  const hasFive = postColumns(headers, 5).length >= 5;
  const hasThree = postColumns(headers, 3).length >= 3;
  const hasPole = labels.some((label) => label.includes('pilota pole'));
  const hasResultsPole = labels.some((label) => label === 'pilota pole');
  if (hasEmail && hasOut && hasFive) return 'race';
  if (hasEmail && hasThree) return 'sprint';
  if (hasEmail && hasPole) return 'qualifying';
  if (!hasEmail && hasResultsPole) return 'results';
  return 'other';
}

function cellRef(sheet, row, column) {
  return column ? `${sheet.name}!${column}${row.number}` : '—';
}

function sourceRows(sheet, kind) {
  const headers = headerIndex(sheet);
  const emailColumn = firstColumn(headers, [(header) => header.includes('indirizzo email')]);
  const rows = [];
  for (const row of sheet.rows) {
    if (row.number === 1) continue;
    const values = rowValues(row);
    const email = emailColumn ? values[emailColumn] : '';
    if (isBlank(email)) continue;
    const emailValue = String(email).trim();
    if (kind === 'qualifying') {
      const poleColumn = firstColumn(headers, [
        (header) => header.includes('pilota pole position'),
        (header) => header === 'pilota pole',
      ]);
      const timeColumn = firstColumn(headers, [(header) => header.includes('tempo pole position')]);
      rows.push({
        kind,
        sheet: sheet.name,
        row: row.number,
        email: emailValue,
        pole: values[poleColumn] ?? '',
        qualifyingTime: values[timeColumn] ?? '',
        refs: {
          pole: cellRef(sheet, row, poleColumn),
          qualifyingTime: cellRef(sheet, row, timeColumn),
        },
      });
    } else if (kind === 'sprint') {
      const columns = postColumns(headers, 3);
      rows.push({
        kind,
        sheet: sheet.name,
        row: row.number,
        email: emailValue,
        sprint: columns.map((column) => values[column] ?? ''),
        refs: Object.fromEntries(columns.map((column, index) => [
          `sprint${index + 1}`, cellRef(sheet, row, column),
        ])),
      });
    } else {
      const columns = postColumns(headers, 5);
      const outColumn = firstColumn(headers, [
        (header) => header === 'out',
        (header) => header.includes('pilota out'),
      ]);
      rows.push({
        kind: 'race',
        sheet: sheet.name,
        row: row.number,
        email: emailValue,
        raceTopFive: columns.map((column) => values[column] ?? ''),
        out: values[outColumn] ?? '',
        refs: {
          ...Object.fromEntries(columns.map((column, index) => [
            `race${index + 1}`, cellRef(sheet, row, column),
          ])),
          out: cellRef(sheet, row, outColumn),
        },
      });
    }
  }
  return rows;
}

function resultRow(sheet) {
  const headers = headerIndex(sheet);
  const first = sheet.rows.find((row) => row.number > 1 && row.cells.size > 0);
  if (!first) return null;
  const values = rowValues(first);
  const column = (predicate) => firstColumn(headers, [predicate]);
  const read = (predicate) => {
    const selected = column(predicate);
    return {
      value: selected ? values[selected] ?? '' : '',
      ref: cellRef(sheet, first, selected),
    };
  };
  const sprintColumns = postColumns(headers, 3, 'sprint');
  const raceColumns = postColumns(headers, 5, 'race');
  const qtime = read((header) => header === 'time conversion');
  const pole = read((header) => header === 'pilota pole');
  const second = read((header) => header.includes('2') && header.includes('qualifiche'));
  const out = read((header) => header === 'out');
  return {
    sheet: sheet.name,
    row: first.number,
    pole: pole.value,
    secondQualifying: second.value,
    qualifyingTimeSeconds: Number.isFinite(Number(qtime.value)) ? Number(qtime.value) : null,
    sprintTopThree: sprintColumns.map((column) => values[column] ?? ''),
    raceTopFive: raceColumns.map((column) => values[column] ?? ''),
    outText: out.value,
    refs: {
      pole: pole.ref,
      secondQualifying: second.ref,
      qualifyingTimeSeconds: qtime.ref,
      ...Object.fromEntries(sprintColumns.map((column, index) => [
        `sprint${index + 1}`, cellRef(sheet, first, column),
      ])),
      ...Object.fromEntries(raceColumns.map((column, index) => [
        `race${index + 1}`, cellRef(sheet, first, column),
      ])),
      out: out.ref,
    },
  };
}

function readHistoricalSources() {
  const byGp = new Map();
  for (const [code, [file, gpName]] of WORKBOOKS) {
    const sheets = readWorkbook(file);
    const source = {
      code,
      gpName,
      file,
      sheets: sheets.map((sheet) => sheet.name),
      qualifying: [],
      sprint: [],
      race: [],
      results: null,
    };
    for (const sheet of sheets) {
      const kind = identifySheet(sheet);
      if (kind === 'results') source.results ??= resultRow(sheet);
      else if (kind !== 'other') source[kind].push(...sourceRows(sheet, kind));
    }
    byGp.set(code, source);
  }
  return byGp;
}

async function getChunks(client, ids, pathForIds) {
  const result = [];
  for (let index = 0; index < ids.length; index += 80) {
    result.push(...await client.get(pathForIds(ids.slice(index, index + 80))));
  }
  return result;
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
  const [usersResponse, members, grandPrix, predictions, riders, profiles] = await Promise.all([
    client.authGet('/admin/users?page=1&per_page=1000'),
    client.get(`/league_members?league_id=eq.${league.id}&select=league_id,user_id`),
    client.get(`/grand_prix?season_id=eq.${seasonId}&is_test=eq.false`
      + '&select=id,name,short_name,country,date_start,date_end&order=date_start.asc'),
    client.get(`/predictions?league_id=eq.${league.id}`
      + '&select=id,user_id,grand_prix_id,league_id,created_at,updated_at,scored_at,'
      + 'qualifying_pole_time,qualifying_points,sprint_points,race_points,bonus_points,'
      + 'malus_points,total_points&order=created_at.asc'),
    client.get('/riders?select=id,name,surname,nickname'),
    client.get('/profiles?select=id,user_id,name'),
  ]);
  const entries = await getChunks(
    client,
    predictions.map((prediction) => prediction.id),
    (ids) => `/prediction_entries?prediction_id=in.(${ids.join(',')})`
      + '&select=id,prediction_id,prediction_type,position,rider_id,predicted_time,points'
      + '&order=prediction_id.asc,prediction_type.asc,position.asc',
  );
  return {
    league,
    users: usersResponse.users ?? [],
    members,
    grandPrix,
    predictions,
    riders,
    profiles,
    entries,
  };
}

function riderAliases(rider) {
  const aliases = new Set();
  const name = String(rider?.name ?? '').trim();
  const surname = String(rider?.surname ?? '').trim();
  if (name || surname) {
    aliases.add(valueKey(`${name} ${surname}`));
    if (name && surname) aliases.add(valueKey(`${name[0]}. ${surname}`));
  }
  if (rider?.nickname) aliases.add(valueKey(rider.nickname));
  return aliases;
}

function riderMatches(value, riderId, ridersById) {
  if (isBlank(value) || !riderId) return false;
  return riderAliases(ridersById.get(riderId)).has(valueKey(value));
}

function timeMillis(value) {
  if (isBlank(value)) return null;
  if (typeof value === 'number' && Number.isFinite(value)) return Math.round(value * 1000);
  const text = String(value).trim();
  try {
    return Math.round(parseExcelTime(text, 'tempo') * 1000);
  } catch {
    const numeric = Number(text);
    return Number.isFinite(numeric) ? Math.round(numeric * 1000) : null;
  }
}

function predictionForEntries(entries, ridersById) {
  const byType = (type) => entries.filter((entry) => entry.prediction_type === type);
  const rider = (type, position = null) => {
    const entry = byType(type).find((item) =>
      position === null ? true : Number(item.position) === position);
    return entry?.rider_id ?? null;
  };
  const time = byType('QUALIFYING_TIME')[0]?.predicted_time ?? null;
  return {
    poleRiderId: rider('POLE'),
    qualifyingTime: time,
    sprintRiderIds: [1, 2, 3].map((position) => rider('SPRINT', position)),
    raceRiderIds: [1, 2, 3, 4, 5].map((position) => rider('RACE', position)),
    outRiderId: rider('RACE_OUT'),
    ridersById,
  };
}

function sourceMatchesPrediction(source, dbPrediction) {
  const rider = (value, id) => riderMatches(value, id, dbPrediction.ridersById);
  const mismatches = [];
  if (!rider(source.pole, dbPrediction.poleRiderId)) mismatches.push('pole');
  if (timeMillis(source.qualifyingTime) !== timeMillis(dbPrediction.qualifyingTime)) {
    mismatches.push('qualifyingTime');
  }
  source.sprint.forEach((value, index) => {
    if (!rider(value, dbPrediction.sprintRiderIds[index])) mismatches.push(`sprint${index + 1}`);
  });
  source.raceTopFive.forEach((value, index) => {
    if (!rider(value, dbPrediction.raceRiderIds[index])) mismatches.push(`race${index + 1}`);
  });
  if (!rider(source.out, dbPrediction.outRiderId)) mismatches.push('out');
  return mismatches;
}

function rowIsComplete(row) {
  const values = row.kind === 'qualifying'
    ? [row.pole, row.qualifyingTime]
    : row.kind === 'sprint'
      ? row.sprint
      : [...row.raceTopFive, row.out];
  return values.every((value) => !isBlank(value));
}

function emptySourceMatch(code, source, email, dbPrediction) {
  const qualifying = source.qualifying.filter((row) => emailKey(row.email) === email);
  const sprint = source.sprint.filter((row) => emailKey(row.email) === email);
  const race = source.race.filter((row) => emailKey(row.email) === email);
  const hasRows = qualifying.length > 0 || sprint.length > 0 || race.length > 0;
  const incompleteRows = [...qualifying, ...sprint, ...race].some((row) => !rowIsComplete(row));
  const candidates = {
    qualifying: [],
    sprint: sprint.filter((row) => (
      row.sprint.every((value, index) => riderMatches(value, dbPrediction.sprintRiderIds[index], dbPrediction.ridersById))
    )),
    race: race.filter((row) => (
      row.raceTopFive.every((value, index) => riderMatches(value, dbPrediction.raceRiderIds[index], dbPrediction.ridersById))
        && riderMatches(row.out, dbPrediction.outRiderId, dbPrediction.ridersById)
    )),
  };
  // The qualifying comparison is kept separate because it contains the only time field.
  candidates.qualifying = qualifying.filter((row) =>
    riderMatches(row.pole, dbPrediction.poleRiderId, dbPrediction.ridersById)
      && timeMillis(row.qualifyingTime) === timeMillis(dbPrediction.qualifyingTime));
  return { qualifying, sprint, race, candidates, hasRows, incompleteRows, code };
}

function matchSource(source, email, dbPrediction) {
  const found = emptySourceMatch(source.code, source, email, dbPrediction);
  const { candidates } = found;
  const counts = Object.fromEntries(Object.entries(candidates).map(([kind, rows]) => [kind, rows.length]));
  if (counts.qualifying === 1 && counts.sprint === 1 && counts.race === 1) {
    return {
      status: 'VERIFIED',
      rows: {
        qualifying: candidates.qualifying[0],
        sprint: candidates.sprint[0],
        race: candidates.race[0],
      },
      counts,
    };
  }
  if (counts.qualifying > 1 || counts.sprint > 1 || counts.race > 1) {
    return { status: 'AMBIGUOUS', counts };
  }
  if (found.hasRows && found.incompleteRows) return { status: 'INCOMPLETE_SOURCE', counts };
  return { status: 'NOT_FOUND', counts };
}

function officialComplete(official) {
  if (!official) return false;
  return !isBlank(official.pole)
    && !isBlank(official.secondQualifying)
    && Number.isFinite(official.qualifyingTimeSeconds)
    && official.sprintTopThree.length === 3
    && official.sprintTopThree.every((value) => !isBlank(value))
    && official.raceTopFive.length === 5
    && official.raceTopFive.every((value) => !isBlank(value))
    && !isBlank(official.outText);
}

function sourcePredictionValues(match) {
  return {
    pole: match.rows.qualifying.pole,
    qualifyingTime: match.rows.qualifying.qualifyingTime,
    sprint: match.rows.sprint.sprint,
    raceTopFive: match.rows.race.raceTopFive,
    out: match.rows.race.out,
  };
}

function scoreEntryPoints(entries, score) {
  return entries.map((entry) => {
    let proposedPoints = null;
    if (entry.prediction_type === 'POLE') proposedPoints = score.polePoints;
    else if (entry.prediction_type === 'QUALIFYING_TIME') proposedPoints = score.qualifyingTime;
    else if (entry.prediction_type === 'SPRINT') proposedPoints = score.sprintSlots[Number(entry.position) - 1] ?? 0;
    else if (entry.prediction_type === 'RACE') proposedPoints = score.raceSlots[Number(entry.position) - 1] ?? 0;
    else if (entry.prediction_type === 'RACE_OUT') proposedPoints = score.outBonus;
    return { entry, proposedPoints };
  });
}

function aggregate(prediction) {
  return {
    qualifying: Number(prediction.qualifying_points ?? 0),
    sprint: Number(prediction.sprint_points ?? 0),
    race: Number(prediction.race_points ?? 0),
    bonus: Number(prediction.bonus_points ?? 0),
    malus: Number(prediction.malus_points ?? 0),
    total: Number(prediction.total_points ?? 0),
  };
}

function malusDryRunRows(rows) {
  return rows
    .filter((row) => row.status === 'VERIFIED' && row.score && row.current && row.proposed)
    .map((row) => ({
      user: row.userLabel,
      gp: row.gp?.short_name ?? '—',
      predictionId: row.prediction.id,
      ncCount: row.score.ncCount,
      currentMalus: row.current.malus,
      correctedMalus: row.proposed.malus,
      deltaTotal: row.proposed.malus - row.current.malus,
    }));
}

function proposedAggregate(score) {
  return {
    qualifying: score.qualifying,
    sprint: score.sprint,
    race: score.race,
    bonus: score.bonus,
    malus: score.malus,
    total: score.total,
  };
}

function riderLabel(riderId, ridersById) {
  const rider = ridersById.get(riderId);
  return rider ? `${rider.name ?? ''} ${rider.surname ?? ''}`.trim() || rider.nickname || riderId : riderId ?? '—';
}

function userLabel(prediction, usersById, profilesByUserId) {
  return profilesByUserId.get(prediction.user_id)?.name
    ?? usersById.get(prediction.user_id)?.email?.split('@')[0]
    ?? prediction.user_id;
}

function classifyPrediction(prediction, context, sourcesByGp, usersById, ridersById) {
  const gp = context.grandPrix.find((candidate) => candidate.id === prediction.grand_prix_id);
  const user = usersById.get(prediction.user_id);
  const source = sourcesByGp.get(gp?.short_name);
  const entries = context.entries.filter((entry) => entry.prediction_id === prediction.id);
  const audit = entryAudit(entries);
  const base = {
    prediction,
    gp,
    user,
    entries,
    audit,
    userLabel: userLabel(prediction, usersById, new Map()),
    source,
  };
  if (!audit.complete) return { ...base, status: 'PARTIAL_EXCLUDED', scoringStatus: 'EXCLUDED' };
  if (EXTRA_PREDICTION_IDS.has(prediction.id)) {
    return {
      ...base,
      status: 'EXTRA_NOT_IN_HISTORICAL_SOURCE',
      scoringStatus: 'EXCLUDED',
    };
  }
  if (!source || !user?.email) {
    return { ...base, status: 'NOT_FOUND', scoringStatus: 'NOT_DETERMINISTIC' };
  }
  const dbPrediction = predictionForEntries(entries, ridersById);
  const match = matchSource(source, emailKey(user.email), dbPrediction);
  if (match.status !== 'VERIFIED') {
    return { ...base, ...match, scoringStatus: 'NOT_DETERMINISTIC' };
  }
  const sourceValues = sourcePredictionValues(match);
  const official = source.results;
  if (!officialComplete(official)) {
    return {
      ...base,
      ...match,
      sourceValues,
      official,
      scoringStatus: 'MISSING_DATA',
      status: source.code === 'QAT' ? 'MISSING_DATA' : 'INCOMPLETE_SOURCE',
    };
  }
  const score = detailedScore(sourceValues, official);
  const entryPoints = scoreEntryPoints(entries, score);
  const current = aggregate(prediction);
  const proposed = proposedAggregate(score);
  return {
    ...base,
    ...match,
    sourceValues,
    official,
    score,
    entryPoints,
    current,
    proposed,
    scoringStatus: 'DETERMINISTIC',
    status: 'VERIFIED',
  };
}

function comparisonRows(rows, ridersById) {
  return rows.filter((row) => row.status === 'VERIFIED' && row.score).map((row) => ({
    user: row.userLabel,
    gp: row.gp?.short_name,
    predictionId: row.prediction.id,
    dbTotal: row.current.total,
    excelTotal: row.proposed.total,
    delta: row.proposed.total - row.current.total,
    entryDb: row.entryPoints.map(({ entry }) => `${entry.prediction_type}:${entry.position ?? '—'}=${entry.points ?? 0}`).join(', '),
    entryProposed: row.entryPoints.map(({ entry, proposedPoints }) =>
      `${entry.prediction_type}:${entry.position ?? '—'}=${proposedPoints}`).join(', '),
    state: row.entryPoints.every(({ entry, proposedPoints }) => Number(entry.points ?? 0) === proposedPoints)
      && row.current.total === row.proposed.total
      ? 'MATCH'
      : 'DIFF',
    ridersById,
  }));
}

function verifiedDetail(row, ridersById) {
  const dbPrediction = predictionForEntries(row.entries, ridersById);
  const entryRows = row.entryPoints.map(({ entry, proposedPoints }) => [
    entry.id,
    entry.prediction_type,
    entry.position ?? '—',
    entry.prediction_type === 'QUALIFYING_TIME'
      ? display(entry.predicted_time)
      : riderLabel(entry.rider_id, ridersById),
    entry.prediction_type === 'QUALIFYING_TIME'
      ? display(row.sourceValues.qualifyingTime)
      : entry.prediction_type === 'POLE'
        ? row.sourceValues.pole
        : entry.prediction_type === 'SPRINT'
          ? row.sourceValues.sprint[Number(entry.position) - 1]
          : entry.prediction_type === 'RACE'
            ? row.sourceValues.raceTopFive[Number(entry.position) - 1]
            : row.sourceValues.out,
    entry.points ?? 0,
    proposedPoints,
  ]);
  return [
    `### ${row.userLabel} / ${row.gp?.name ?? row.gp?.short_name}`,
    '',
    `- Prediction DB: \`${row.prediction.id}\``,
    `- Excel: \`${row.source.file}\``,
    `- Righe: Q \`${row.rows.qualifying.sheet}!${row.rows.qualifying.row}\`, `
      + `Sprint \`${row.rows.sprint.sheet}!${row.rows.sprint.row}\`, `
      + `Gara \`${row.rows.race.sheet}!${row.rows.race.row}\``,
    `- Riferimenti: Pole \`${row.rows.qualifying.refs.pole}\`, tempo \`${row.rows.qualifying.refs.qualifyingTime}\`, `
      + `Sprint \`${Object.values(row.rows.sprint.refs).join(', ')}\`, `
      + `Gara \`${Object.values(row.rows.race.refs).join(', ')}\``,
    `- Valori Excel: pole=${row.sourceValues.pole}; tempo=${row.sourceValues.qualifyingTime}; `
      + `sprint=${row.sourceValues.sprint.join(' / ')}; gara=${row.sourceValues.raceTopFive.join(' / ')}; out=${row.sourceValues.out}`,
    '',
    mdTable(
      ['Entry DB', 'Tipo', 'Pos.', 'Valore DB', 'Valore Excel', 'Punti DB', 'Punti proposti'],
      entryRows,
    ),
    '',
    `- Scoring canonico: Qualifica **${row.score.qualifying}** `
      + `(pole ${row.score.polePoints} + tempo ${row.score.qualifyingTime}); `
      + `Sprint **${row.score.sprint}** [${row.score.sprintSlots.join(', ')}]; `
      + `Gara **${row.score.race}** [posizioni ${row.score.racePosition}; bonus ${row.score.bonus}; malus ${row.score.malus}; `
      + `OUT ${row.score.outBonus}]`,
    `- Totale storico ricostruito: **${row.proposed.total}** = ${row.proposed.qualifying} + ${row.proposed.sprint} + ${row.proposed.race}.`,
  ].join('\n');
}

function buildReport({ args, context, sourcesByGp, rows, usersById, ridersById }) {
  const counts = Object.fromEntries(
    ['VERIFIED', 'AMBIGUOUS', 'NOT_FOUND', 'INCOMPLETE_SOURCE', 'MISSING_DATA',
      'PARTIAL_EXCLUDED', 'EXTRA_NOT_IN_HISTORICAL_SOURCE']
      .map((status) => [status, rows.filter((row) => row.status === status).length]),
  );
  const completeRows = rows.filter((row) =>
    row.status !== 'PARTIAL_EXCLUDED' && row.status !== 'EXTRA_NOT_IN_HISTORICAL_SOURCE');
  const extras = rows.filter((row) => row.status === 'EXTRA_NOT_IN_HISTORICAL_SOURCE').map((row) => [
    row.userLabel,
    row.gp?.short_name ?? '—',
    row.prediction.id,
    'EXTRA_NOT_IN_HISTORICAL_SOURCE',
    'Non usata per il replay storico',
  ]);
  const comparisons = comparisonRows(rows, ridersById);
  const mapping = completeRows.map((row) => [
    row.userLabel,
    row.gp?.short_name ?? '—',
    row.prediction.id,
    row.source?.file ?? '—',
    row.rows?.qualifying?.sheet ?? '—',
    row.rows?.qualifying?.row ?? '—',
    row.user?.email ? 'YES (email)' : 'NO',
    row.source ? 'YES (file/GP)' : 'NO',
    row.status === 'VERIFIED' ? 'YES (all fields)' : 'NO',
    row.scoringStatus,
    row.status,
  ]);
  const partial = rows.filter((row) => row.status === 'PARTIAL_EXCLUDED').map((row) => [
    row.userLabel, row.gp?.short_name ?? '—', row.prediction.id, row.audit.missing.join(', ') || '—',
  ]);
  const comparison = comparisons.map((row) => [
    row.user, row.gp, row.predictionId, row.dbTotal, row.excelTotal, row.delta, row.entryDb, row.entryProposed, row.state,
  ]);
  const malusRows = malusDryRunRows(rows);
  const changedMalusRows = malusRows.filter((row) => row.currentMalus !== row.correctedMalus);
  const details = rows
    .filter((row) => row.status === 'VERIFIED' && row.score)
    .map((row) => verifiedDetail(row, ridersById))
    .join('\n\n');
  const thailandia = rows.find((row) =>
    row.status === 'VERIFIED' && row.gp?.short_name === 'THA'
      && row.user?.email && emailKey(row.user.email) === emailKey('nikyturets@gmail.com'));
  const fixtureLine = thailandia?.score
    ? `Niky / Thailandia: ${thailandia.proposed.qualifying} + ${thailandia.proposed.sprint} + ${thailandia.proposed.race} = ${thailandia.proposed.total}`
    : 'Niky / Thailandia: fixture non ricostruibile';
  const sourceInventory = [...sourcesByGp.values()].map((source) => [
    source.gpName,
    source.code,
    source.file,
    source.sheets.join(', '),
    source.results?.sheet ?? '—',
    source.results?.row ?? '—',
  ]);
  return [
    '# Task 38 — Mappatura Excel → Prediction DB per scoring storico',
    '',
    '- Modalità: **100% READ-ONLY — nessuna scrittura**',
    `- Lega: **${context.league.name}** (${LEAGUE_CODE}); stagione **${SEASON_YEAR}**`,
    '- Accesso Supabase: **solo GET REST/Auth**',
    '- INSERT/UPDATE/DELETE/UPSERT: **0**',
    '- RPC `score_prediction`: **0**',
    '- Database, workbook, workflow, schema e RLS: **invariati**',
    '',
    '## Scoring live / RPC',
    '',
    '- L’applicazione non calcola il malus localmente: invia i pronostici e legge i punteggi server-side.',
    '- `public.score_prediction(p_prediction_id uuid)` è una funzione remota Supabase; il suo corpo SQL non è presente nel repository.',
    '- Il collegamento disponibile espone solo PostgREST REST e non consente di leggere `pg_get_functiondef`; la RPC non è stata invocata.',
    '- Di conseguenza nessuna migration o sostituzione SQL è stata inventata: l’allineamento della RPC live richiede il corpo SQL o un canale SQL autorizzato.',
    '',
    '## Esito sintetico',
    '',
    `- Prediction complete analizzate: **${completeRows.length}**`,
    `- VERIFIED: **${counts.VERIFIED}**`,
    `- AMBIGUOUS: **${counts.AMBIGUOUS}**`,
    `- NOT_FOUND: **${counts.NOT_FOUND}**`,
    `- INCOMPLETE_SOURCE: **${counts.INCOMPLETE_SOURCE}**`,
    `- MISSING_DATA: **${counts.MISSING_DATA}**`,
    `- PARTIAL_EXCLUDED: **${counts.PARTIAL_EXCLUDED}**`,
    `- EXTRA_NOT_IN_HISTORICAL_SOURCE: **${counts.EXTRA_NOT_IN_HISTORICAL_SOURCE}**`,
    `- Confronti scoring prodotti: **${comparisons.length}**`,
    '',
    'La certezza della mappatura deriva dalla corrispondenza email/utente, GP/file e contenuto completo del pronostico. '
      + 'Gli attuali `prediction_entries.points` pari a zero non sono usati per decidere se una riga è verificata.',
    '',
    '## Inventario dei workbook usati',
    '',
    mdTable(['GP', 'Codice', 'File', 'Fogli', 'Foglio risultati', 'Riga risultati'], sourceInventory),
    '',
    '## Mappatura di tutte le prediction complete',
    '',
    mdTable(
      ['Utente', 'GP', 'Prediction DB ID', 'Excel file', 'Excel sheet', 'Excel row', 'Match utente', 'Match GP', 'Match pronostico', 'Scoring deterministico', 'Stato'],
      mapping,
    ),
    '',
    '## Prediction partial escluse',
    '',
    mdTable(['Utente', 'GP', 'Prediction DB ID', 'Entry mancanti'], partial),
    '',
    '## Prediction extra fuori dalla sorgente storica',
    '',
    mdTable(['Utente', 'GP', 'Prediction DB ID', 'Stato', 'Motivo'], extras),
    '',
    '## Confronto per le VERIFIED',
    '',
    mdTable(
      ['Utente', 'GP', 'Prediction ID', 'DB Total', 'Excel Total', 'Δ', 'Entry DB points', 'Entry proposed points', 'Stato'],
      comparison,
    ),
    '',
    '## Dry-run aggiornamento Malus Gara NC',
    '',
    `- Prediction storiche complete valutate: **${malusRows.length}**`,
    `- Prediction il cui malus cambierebbe: **${changedMalusRows.length}**`,
    '- Il confronto usa NC = intersezione tra i 5 piloti Gara pronosticati e la lista ufficiale Out/NC del workbook. '
      + 'Prediction partial, extra e dati ufficiali incompleti restano escluse.',
    '',
    changedMalusRows.length
      ? mdTable(
      ['Utente', 'GP', 'Prediction ID', 'NC pronosticati', 'Malus attuale', 'Malus corretto', 'Δ Totale'],
        changedMalusRows.map((row) => [
          row.user,
          row.gp,
          row.predictionId,
          row.ncCount,
          row.currentMalus,
          row.correctedMalus,
          row.deltaTotal,
        ]),
      )
      : 'Nessuna prediction storica cambierebbe.',
    '',
    `- Fixture obbligatorio: **${fixtureLine}**`,
    '- Le componenti bonus/malus restano nel calcolo aggregato canonico; non vengono attribuite artificialmente a una singola entry.',
    '',
    '## Dettaglio riga-per-riga delle VERIFIED',
    '',
    details || 'Nessuna prediction VERIFIED con scoring deterministico.',
    '',
    '## Casi speciali richiesti',
    '',
    '- **Niky / Thailandia**: verificato sopra con righe Excel, entry DB e ricostruzione 8 + 3 + 10 = 21 quando disponibile.',
    '- **Nicholas / RSM** e **Nicholas / Aragon**: una prediction non presente nei workbook storici viene lasciata fuori dalla sorgente e non modificata.',
    '- **Marino / Aragon**: la mappatura di una prediction DB mancante non crea alcun record; stato `MISSING_DB_PREDICTION` nel perimetro storico precedente.',
    '- **Qatar**: se i risultati ufficiali del workbook non sono completi, lo scoring è `MISSING_DATA` e non viene inventato alcun valore.',
    '',
    '## Decisione di sicurezza',
    '',
    'Questo report non autorizza alcun apply. Anche le righe VERIFIED mostrano solo candidati read-only; '
      + 'partial, ambiguous, not found, incomplete, extra e missing-data restano invariati.',
    '',
  ].join('\n');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const client = createReadOnlyClient();
  const [context, sourcesByGp] = await Promise.all([
    loadContext(client),
    Promise.resolve(readHistoricalSources()),
  ]);
  const usersById = new Map(context.users.map((user) => [user.id, user]));
  const ridersById = new Map(context.riders.map((rider) => [rider.id, rider]));
  const gpSources = new Map([...sourcesByGp].map(([code, source]) => [code, source]));
  const sourceByShortName = new Map();
  for (const [code, source] of gpSources) sourceByShortName.set(code, source);
  const rows = context.predictions.map((prediction) => {
    const gp = context.grandPrix.find((candidate) => candidate.id === prediction.grand_prix_id);
    return classifyPrediction(
      prediction,
      context,
      sourceByShortName,
      usersById,
      ridersById,
    );
  });
  // Keep user-facing labels consistent after classification without affecting matching.
  const profilesByUserId = new Map(context.profiles.map((profile) => [profile.user_id, profile]));
  for (const row of rows) row.userLabel = userLabel(row.prediction, usersById, profilesByUserId);
  await writeFile(args.report, buildReport({
    args,
    context,
    sourcesByGp,
    rows,
    usersById,
    ridersById,
  }), 'utf8');
  const counts = Object.fromEntries(
    ['VERIFIED', 'AMBIGUOUS', 'NOT_FOUND', 'INCOMPLETE_SOURCE', 'MISSING_DATA',
      'PARTIAL_EXCLUDED', 'EXTRA_NOT_IN_HISTORICAL_SOURCE']
      .map((status) => [status, rows.filter((row) => row.status === status).length]),
  );
  console.log('TASK 38 COMPLETATO — READ-ONLY');
  console.log(`Prediction analizzate: ${rows.length}`);
  console.log(Object.entries(counts).map(([key, value]) => `${key}=${value}`).join(' '));
  console.log('INSERT=0 UPDATE=0 DELETE=0 UPSERT=0 RPC=0');
  console.log(`Report: ${args.report}`);
}

export {
  readWorkbook,
  readHistoricalSources,
  matchSource,
  officialComplete,
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.stack ?? error.message : error);
    process.exitCode = 1;
  });
}