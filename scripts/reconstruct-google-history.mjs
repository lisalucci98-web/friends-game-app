/**
 * Ricostruzione read-only dello storico Fanta MotoGP da Google Drive/Sheets.
 *
 * Non esegue INSERT/UPDATE/DELETE, non chiama RPC Supabase e non ricalcola
 * punteggi. L'indirizzo target viene usato solo per il filtro in memoria.
 *
 * Uso:
 *   TARGET_EMAIL="..." node scripts/reconstruct-google-history.mjs
 *   TARGET_EMAIL="..." node scripts/reconstruct-google-history.mjs --spreadsheet-id <id>
 *   TARGET_EMAIL="..." node scripts/reconstruct-google-history.mjs --help
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { ReplitConnectors } from '@replit/connectors-sdk';

const DEFAULT_REPORT = '.agents/outputs/google-history-nikyturets.md';
const DEFAULT_LOCAL_SOURCE =
  'attached_assets/Pasted-Certo-A-questo-punto-userei-i-dati-storici-come-dataset_1787240203484.txt';
const DEFAULT_SPREADSHEET_ID = '12LPMVYnqA6gb6uyFYTesw4XVG3XVZbPidVWEHOy7UhY';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SESSIONS = ['Qualifica', 'Sprint', 'Gara'];

const RIDER_ALIASES = new Map([
    ['r. fernandez', 'Raul Fernandez'],
    ['raul fernandez', 'Raul Fernandez'],
    ['m. bezzecchi', 'Marco Bezzecchi'],
    ['marco bezzecchi', 'Marco Bezzecchi'],
    ['j. martin', 'Jorge Martin'],
    ['jorge martin', 'Jorge Martin'],
    ['a. ogura', 'Ai Ogura'],
    ['ai ogura', 'Ai Ogura'],
    ['f. di giannantonio', 'Fabio Di Giannantonio'],
    ['fabio di giannantonio', 'Fabio Di Giannantonio'],
    ['m. marquez', 'Marc Marquez'],
    ['marc marquez', 'Marc Marquez'],
    ['f. bagnaia', 'Francesco Bagnaia'],
    ['francesco bagnaia', 'Francesco Bagnaia'],
    ['p. acosta', 'Pedro Acosta'],
    ['pedro acosta', 'Pedro Acosta'],
    ['a. marquez', 'Alex Marquez'],
    ['alex marquez', 'Alex Marquez'],
    ['j. mir', 'Joan Mir'],
    ['joan mir', 'Joan Mir'],
    ['f. aldeguer', 'Fermin Aldeguer'],
    ['f. aldegeur', 'Fermin Aldeguer'],
    ['f. aldegu er', 'Fermin Aldeguer'],
    ['f. ald eguer', 'Fermin Aldeguer'],
    ['f. ald e g u e r', 'Fermin Aldeguer'],
    ['f. aldegu er', 'Fermin Aldeguer'],
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
    ['a. fernandez', 'Augusto Fernandez'],
    ['augusto fernandez', 'Augusto Fernandez'],
    ['j. zarco', 'Johann Zarco'],
    ['johann zarco', 'Johann Zarco'],
    ['f. quartararo', 'Fabio Quartararo'],
    ['fabio quartararo', 'Fabio Quartararo'],
  ],
);

const GP_ALIASES = new Map([
  ['uk', 'uk'],
  ['gran bretagna', 'uk'],
  ['great britain', 'uk'],
  ['aragon', 'aragon'],
  ['aragón', 'aragon'],
  ['qatar', 'qatar'],
  ['qatar gp', 'qatar'],
  ['netherlands', 'netherlands'],
  ['olanda', 'netherlands'],
  ['germany', 'germany'],
  ['germania', 'germany'],
  ['czech republic', 'repubblica-ceca'],
  ['repubblica ceca', 'repubblica-ceca'],
  ['czechia', 'repubblica-ceca'],
]);

function parseArgs(argv) {
  const args = {
    email: process.env.TARGET_EMAIL ?? '',
    report: process.env.HISTORICAL_REPORT ?? DEFAULT_REPORT,
    localSource: process.env.HISTORICAL_DATASET ?? DEFAULT_LOCAL_SOURCE,
    spreadsheetId: process.env.GOOGLE_SHEET_ID ?? '',
    help: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--help' || argument === '-h') args.help = true;
    else if (argument === '--email') args.email = argv[++index] ?? '';
    else if (argument === '--report') args.report = argv[++index] ?? '';
    else if (argument === '--local-source') args.localSource = argv[++index] ?? '';
    else if (argument === '--spreadsheet-id') args.spreadsheetId = argv[++index] ?? '';
    else throw new Error(`Argomento non riconosciuto: ${argument}`);
  }
  return args;
}

function printHelp() {
  console.log(`Ricostruzione storico Google Drive/Sheets — sola lettura

Uso:
  TARGET_EMAIL="..." node scripts/reconstruct-google-history.mjs

Opzioni:
  --email <email>              filtro in memoria; non finisce nel report
  --spreadsheet-id <id>        limita l'analisi a un file noto
  --report <file.md>            report di output (default: ${DEFAULT_REPORT})
  --local-source <file.txt>     dataset locale per il confronto
  --help                        mostra questo messaggio

Il comando non scrive su Google, Supabase o database e non ricalcola punteggi.`);
}

function text(value) {
  return String(value ?? '').trim();
}

function canonical(value) {
  return text(value)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('it-IT')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeEmail(value) {
  return text(value).toLocaleLowerCase('en-US').replace(/\s+/g, '');
}

function isEmail(value) {
  return EMAIL_RE.test(normalizeEmail(value));
}

function normalizedHeader(value) {
  return canonical(value).replace(/[^a-z0-9]+/g, ' ').trim();
}

function columnLabel(number) {
  let current = Math.max(1, number);
  let result = '';
  while (current > 0) {
    const remainder = (current - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    current = Math.floor((current - 1) / 26);
  }
  return result;
}

function headerRowIndex(values) {
  let bestIndex = 0;
  let bestScore = -1;
  values.slice(0, 25).forEach((row, index) => {
    const headers = row.map(normalizedHeader);
    const joined = headers.join(' | ');
    let score = headers.length >= 2 ? 1 : 0;
    if (headers.some((header) => /\b(email|e mail|indirizzo)\b/.test(header))) score += 5;
    if (/\b(pilota|pole|punteggio|score|posto|position|timestamp|cronologiche)\b/.test(joined)) score += 3;
    if (index === 0) score += 1;
    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  });
  return bestIndex;
}

function rowsAsObjects(values) {
  const index = headerRowIndex(values);
  const headers = (values[index] ?? []).map((value, position) => {
    const base = normalizedHeader(value) || `colonna ${position + 1}`;
    return base;
  });
  const rows = values.slice(index + 1).map((row, offset) => {
    const cells = Array.from({ length: headers.length }, (_, position) => text(row?.[position]));
    return {
      rowNumber: index + offset + 2,
      cells,
      values: Object.fromEntries(headers.map((header, position) => [header, cells[position] ?? ''])),
    };
  });
  return { headers, rows };
}

function rowEmail(row, headers) {
  const emailIndexes = headers
    .map((header, index) => (/\b(email|e mail|indirizzo)\b/.test(header) ? index : -1))
    .filter((index) => index >= 0);
  const candidates = emailIndexes.map((index) => row.cells[index]);
  candidates.push(...row.cells.filter(isEmail));
  return candidates.find(isEmail) ?? '';
}

function valueByHeader(row, matchers) {
  for (const matcher of matchers) {
    const found = Object.entries(row.values).find(([header, value]) => value && matcher.test(header));
    if (found) return { header: found[0], value: found[1] };
  }
  return null;
}

function sessionFromSheet(sheetTitle, headers) {
  const title = canonical(sheetTitle);
  if (/\bqualifiche?\b|\bqualifying\b|\bpole\b/.test(title)) return 'Qualifica';
  if (/\bsprint\b/.test(title)) return 'Sprint';
  if (/\bgara\b|\brace\b/.test(title)) return 'Gara';

  const joined = headers.join(' | ');
  if (/\bpilota pole\b|\btempo pole\b|\btime conversion\b/.test(joined)) return 'Qualifica';
  if (headers.some((header) => positionHeader(header, 5)) || /\bpilota out\b|\bout rider\b/.test(joined)) return 'Gara';
  if (
    headers.some((header) => positionHeader(header, 1))
    && headers.some((header) => positionHeader(header, 2))
    && headers.some((header) => positionHeader(header, 3))
  ) return 'Sprint';
  return null;
}

function positionHeader(header, position) {
  const normalized = normalizedHeader(header);
  return new RegExp(`(?:^|\\s)(?:p|pos|position|posto)?\\s*${position}(?:$|\\s|°|º|o|a)`).test(normalized)
    || new RegExp(`(?:^|\\s)${position}(?:°|º|o|a)(?:$|\\s)`).test(normalized);
}

function riderNormalization(value) {
  const original = text(value);
  if (!original) return { original, normalized: '', status: 'MISSING' };
  const normalized = RIDER_ALIASES.get(canonical(original));
  if (normalized) return { original, normalized, status: 'NORMALIZED' };
  if (/^[A-ZÀ-Ý]\.\s+\S+/.test(original)) return { original, normalized: null, status: 'AMBIGUA' };
  return { original, normalized: original, status: 'UNCHANGED' };
}

function riderList(value) {
  return text(value).split(/\s*[/;,|]\s*/).filter(Boolean).map(riderNormalization);
}

function numericScore(row, session) {
  const preferred = valueByHeader(row, [
    session === 'Qualifica' ? /\b(punteggio qualifica|score qualifica|punti qualifica)\b/ : /a^/,
    session === 'Sprint' ? /\b(punteggio sprint|score sprint|punti sprint)\b/ : /a^/,
    session === 'Gara' ? /\b(punteggio gara|score gara|punti gara)\b/ : /a^/,
    /\b(historical score|historical_score|punteggio|score|punti)\b/,
  ]);
  if (!preferred) return null;
  const number = Number(preferred.value.replace(',', '.'));
  return Number.isFinite(number) ? number : null;
}

function predictionFromRow(row, session) {
  if (session === 'Qualifica') {
    const pole = valueByHeader(row, [/\b(pilota pole|pole position|pole rider)\b/, /\bpole\b/]);
    const time = valueByHeader(row, [/\b(tempo pole|pole time|qualifica.*tempo)\b/, /\btempo\b|\btime\b/]);
    const conversion = valueByHeader(row, [/\b(time conversion|conversione tempo|conversion)\b/]);
    return {
      pole: riderNormalization(pole?.value),
      poleTime: text(time?.value),
      timeConversion: text(conversion?.value),
      historicalScore: numericScore(row, session),
    };
  }

  const count = session === 'Sprint' ? 3 : 5;
  const positions = Array.from({ length: count }, (_, index) => {
    const found = valueByHeader(row, [
      new RegExp(`(?:^|\\s)(?:p|pos|position|posto)?\\s*${index + 1}(?:$|\\s|°|º|o|a)`),
      new RegExp(`(?:^|\\s)${index + 1}(?:°|º|o|a)(?:$|\\s)`),
    ]);
    return riderNormalization(found?.value);
  });
  const out = session === 'Gara'
    ? riderNormalization(valueByHeader(row, [/\b(pilota out|out rider|out|dnf)\b/])?.value)
    : null;
  return { positions, out, historicalScore: numericScore(row, session) };
}

function timestampFromRow(row) {
  return text(valueByHeader(row, [
    /\b(informazioni cronologiche|timestamp|submitted at|data invio|date)\b/,
  ])?.value);
}

function normalizeGpKey(value) {
  const clean = canonical(value)
    .replace(/\b(gran premio|grand prix)\b/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
  return GP_ALIASES.get(clean) ?? clean.replace(/\s+/g, '-');
}

function gpLabelFor(sheetTitle, spreadsheetTitle, isAggregate = false) {
  const sheet = text(sheetTitle);
  const book = text(spreadsheetTitle);
  if (isAggregate && sheet && !/^(classifica|copia di classifica|grafici?)$/i.test(sheet)) return sheet;
  if (book && !/^(classifica|foglio di lavoro senza nome)$/i.test(book)) return book;
  if (sheet && /\b(gp|gran premio|grand prix|circuit|circuito)\b/i.test(sheet)) {
    return sheet.replace(/\s*(?:[-–—|:]\s*)?(qualifiche?|qualifica|qualifying|sprint|gara|race)\s*$/i, '').trim();
  }
  return null;
}

function isAggregateTab(title, headers) {
  const normalized = canonical(title);
  return /^(classifica|copia di classifica|grafici?)$/.test(normalized)
    || (
      headers.some((header) => /\bpunteggio qualifiche\b/.test(header))
      && headers.some((header) => /\bpunteggio sprint\b/.test(header))
      && headers.some((header) => /\bpunteggio grand prix\b/.test(header))
    );
}

function parsePredictionTab(file, tab, targetEmail) {
  const { headers, rows } = rowsAsObjects(tab.values);
  const session = sessionFromSheet(tab.title, headers);
  if (!session) return [];
  const target = normalizeEmail(targetEmail);
  return rows
    .filter((row) => normalizeEmail(rowEmail(row, headers)) === target)
    .map((row) => {
      const grandPrix = gpLabelFor(tab.title, file.title);
      return {
        fileId: file.id,
        spreadsheet: file.name,
        spreadsheetTitle: file.title,
        tab: tab.title,
        rowNumber: row.rowNumber,
        timestamp: timestampFromRow(row),
        session,
        grandPrix,
        grandPrixKey: normalizeGpKey(grandPrix),
        prediction: predictionFromRow(row, session),
      };
    });
}

function parseAggregateTab(file, tab, targetEmail) {
  const { headers, rows } = rowsAsObjects(tab.values);
  if (!isAggregateTab(tab.title, headers)) return [];
  const target = normalizeEmail(targetEmail);
  const isPerGpSummary = /\bpunteggio qualifiche\b/.test(headers.join(' '))
    && /\bpunteggio sprint\b/.test(headers.join(' '))
    && /\bpunteggio grand prix\b/.test(headers.join(' '));
  if (!isPerGpSummary) return [];
  const gp = gpLabelFor(tab.title, file.title, true);
  if (!gp) return [];
  return rows
    .filter((row) => normalizeEmail(rowEmail(row, headers)) === target)
    .map((row) => ({
      fileId: file.id,
      spreadsheet: file.name,
      tab: tab.title,
      rowNumber: row.rowNumber,
      grandPrix: gp,
      grandPrixKey: normalizeGpKey(gp),
      qualifying: scoreFromHeaders(row, [/\bpunteggio qualifiche\b/]),
      sprint: scoreFromHeaders(row, [/\bpunteggio sprint\b/]),
      race: scoreFromHeaders(row, [/\bpunteggio grand prix\b/]),
      total: scoreFromHeaders(row, [/\btotal(e)?\b/]),
    }));
}

function scoreFromHeaders(row, matchers) {
  const found = valueByHeader(row, matchers);
  if (!found || !text(found.value)) return null;
  const number = Number(found.value.replace(',', '.'));
  return Number.isFinite(number) ? number : null;
}

async function requestJson(connectors, connector, path, attempts = 3) {
  let lastError = null;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await connectors.proxy(connector, path, { method: 'GET' });
      const body = await response.json().catch(() => null);
      if (response.ok) return body;
      const error = body?.error?.message ?? `HTTP ${response.status}`;
      if (![429, 500, 502, 503, 504].includes(response.status)) throw new Error(error);
      lastError = new Error(error);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }
    if (attempt < attempts - 1) await new Promise((resolve) => setTimeout(resolve, 300 * 2 ** attempt));
  }
  throw lastError ?? new Error('Richiesta Google fallita');
}

async function fetchDriveFiles(connectors) {
  const files = [];
  let pageToken = '';
  do {
    const query = new URLSearchParams({
      q: "mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false",
      pageSize: '100',
      fields: 'nextPageToken,files(id,name,mimeType)',
    });
    if (pageToken) query.set('pageToken', pageToken);
    const body = await requestJson(connectors, 'google-drive', `/drive/v3/files?${query.toString()}`);
    files.push(...(body.files ?? []));
    pageToken = body.nextPageToken ?? '';
  } while (pageToken);
  return files;
}

async function fetchSpreadsheet(connectors, file) {
  const metadata = await requestJson(
    connectors,
    'google-sheet',
    `/v4/spreadsheets/${file.id}?fields=${encodeURIComponent('properties.title,sheets.properties')}`,
  );
  const tabs = (metadata.sheets ?? []).map((sheet) => {
    const properties = sheet.properties ?? {};
    return {
      title: properties.title ?? '',
      rows: Math.min(Math.max(properties.gridProperties?.rowCount ?? 1000, 1), 10000),
      columns: Math.min(Math.max(properties.gridProperties?.columnCount ?? 26, 1), 100),
    };
  }).filter((tab) => tab.title);

  const query = new URLSearchParams();
  for (const tab of tabs) {
    query.append(
      'ranges',
      `'${tab.title.replaceAll("'", "''")}'!A1:${columnLabel(tab.columns)}${tab.rows}`,
    );
  }
  const values = tabs.length
    ? await requestJson(connectors, 'google-sheet', `/v4/spreadsheets/${file.id}/values:batchGet?${query.toString()}`)
    : { valueRanges: [] };
  return {
    id: file.id,
    name: file.name,
    title: metadata.properties?.title ?? file.name,
    tabs: tabs.map((tab, index) => ({
      title: tab.title,
      values: values.valueRanges?.[index]?.values ?? [],
    })),
  };
}

function sanitizeEntries(files, targetEmail) {
  const entries = [];
  const aggregates = [];
  let tabCount = 0;
  for (const file of files) {
    for (const tab of file.tabs) {
      tabCount += 1;
      const { headers } = rowsAsObjects(tab.values);
      if (isAggregateTab(tab.title, headers)) {
        aggregates.push(...parseAggregateTab(file, tab, targetEmail));
      } else {
        entries.push(...parsePredictionTab(file, tab, targetEmail));
      }
    }
  }
  return { entries, aggregates, tabCount };
}

function isValidPoleTime(value) {
  return /^\d{2}:\d{2}\.\d{3}$/.test(text(value));
}

function riderKey(value) {
  return canonical(value?.normalized ?? value?.original);
}

function sessionStatus(records, session) {
  const sessionRecords = records.filter((record) => record.session === session);
  if (!sessionRecords.length) return { status: 'MISSING', records: [] };
  if (sessionRecords.length > 1) return { status: 'MULTIPLE SUBMISSIONS', records: sessionRecords };
  const record = sessionRecords[0];
  const prediction = record.prediction;
  if (session === 'Qualifica') {
    const ok = Boolean(prediction.pole?.original)
      && isValidPoleTime(prediction.poleTime)
      && typeof prediction.historicalScore === 'number';
    return { status: ok ? 'OK' : 'MISSING', records: [record] };
  }
  const expected = session === 'Sprint' ? 3 : 5;
  const positions = prediction.positions ?? [];
  const nonEmpty = positions.filter((item) => item?.original);
  const duplicate = new Set(nonEmpty.map(riderKey)).size !== nonEmpty.length;
  let ok = positions.length === expected
    && nonEmpty.length === expected
    && !duplicate
    && typeof prediction.historicalScore === 'number';
  if (session === 'Gara') {
    const out = prediction.out?.original;
    ok = ok && Boolean(out) && !positions.some((item) => riderKey(item) === riderKey(prediction.out));
  }
  return { status: ok ? 'OK' : 'MISSING', records: [record] };
}

function soleRecord(result) {
  return result.records.length === 1 ? result.records[0] : null;
}

function aggregateSignature(aggregate) {
  return [
    aggregate.qualifying,
    aggregate.sprint,
    aggregate.race,
    aggregate.total,
  ].join('|');
}

function summaryForGp(grandPrixKey, entries, aggregates) {
  const gpEntries = entries.filter((entry) => entry.grandPrixKey === grandPrixKey);
  const gpAggregates = aggregates.filter((aggregate) => aggregate.grandPrixKey === grandPrixKey);
  const sessionResults = Object.fromEntries(SESSIONS.map((session) => [session, sessionStatus(gpEntries, session)]));
  const aggregateValues = gpAggregates.filter((item) => [item.qualifying, item.sprint, item.race, item.total].some((value) => typeof value === 'number'));
  const distinctAggregates = [...new Map(aggregateValues.map((item) => [aggregateSignature(item), item])).values()];
  const aggregate = distinctAggregates.length === 1 ? distinctAggregates[0] : null;
  const aggregateConflict = distinctAggregates.length > 1;
  const scores = {
    qualifying: soleRecord(sessionResults.Qualifica)?.prediction.historicalScore ?? null,
    sprint: soleRecord(sessionResults.Sprint)?.prediction.historicalScore ?? null,
    race: soleRecord(sessionResults.Gara)?.prediction.historicalScore ?? null,
  };
  const computedSum = Object.values(scores).every((value) => typeof value === 'number')
    ? Object.values(scores).reduce((sum, value) => sum + value, 0)
    : null;
  const totalMismatch = aggregate
    && aggregate.total !== null
    && computedSum !== null
    && aggregate.total !== computedSum;
  const duplicate = Object.values(sessionResults).some((result) => result.status === 'MULTIPLE SUBMISSIONS');
  const partial = Object.values(sessionResults).some((result) => result.status !== 'OK') || !aggregate || aggregate.total === null;
  const status = duplicate
    ? 'MULTIPLE SUBMISSIONS'
    : aggregateConflict
      ? 'AGGREGATE_CONFLICT'
      : totalMismatch
        ? 'TOTAL_MISMATCH'
        : partial
          ? 'PARTIAL'
          : 'OK';
  return {
    grandPrix: gpEntries[0]?.grandPrix ?? aggregate?.grandPrix ?? 'UNKNOWN',
    grandPrixKey,
    entries: gpEntries,
    aggregates: gpAggregates,
    sessionResults,
    aggregate,
    aggregateConflict,
    scores,
    computedSum,
    totalMismatch,
    status,
  };
}

function parseLocalHistorical(markdown, targetEmail) {
  const target = normalizeEmail(targetEmail);
  const records = [];
  const sections = [...markdown.matchAll(/^#{1,2}\s+GP (\d+)(?:\s+—\s+([^\n]+))?/gim)];
  for (let index = 0; index < sections.length; index += 1) {
    const section = sections[index];
    const block = markdown.slice(section.index, sections[index + 1]?.index ?? markdown.length);
    const gp = `GP ${section[1]}${section[2] ? ` — ${section[2].trim()}` : ''}`;
    const gpKey = section[1] === '1' ? 'uk' : `gp-${section[1]}`;
    const qBlock = between(block, '### Qualifiche', '### Sprint');
    for (const line of qBlock.split(/\r?\n/)) {
      const match = line.match(/^\s*(\S+@\S+)\s+(.+?)\s+(\d{2}:\d{2}\.\d{3})\s+(-?\d+)\s*$/);
      if (match && normalizeEmail(match[1]) === target) {
        records.push({
          grandPrix: gp,
          grandPrixKey: gpKey,
          session: 'Qualifica',
          prediction: {
            pole: riderNormalization(match[2]),
            poleTime: match[3],
            historicalScore: Number(match[4]),
          },
        });
      }
    }
    const sprintBlock = between(block, '### Sprint', '### Gara');
    for (const line of sprintBlock.split(/\r?\n/)) {
      const match = line.match(/^\s*(\S+@\S+)\s+(.+?)\s+(-?\d+)\s*$/);
      if (match && normalizeEmail(match[1]) === target && match[2].includes('/')) {
        records.push({
          grandPrix: gp,
          grandPrixKey: gpKey,
          session: 'Sprint',
          prediction: { positions: riderList(match[2]), historicalScore: Number(match[3]) },
        });
      }
    }
    const raceBlock = between(block, '### Gara', '### Totali storici');
    for (const match of raceBlock.matchAll(/^\s*(\S+@\S+)\s*\n\s*([^\n]+)\n\s*(-?\d+)\s*$/gm)) {
      if (normalizeEmail(match[1]) !== target) continue;
      const picks = riderList(match[2]);
      records.push({
        grandPrix: gp,
        grandPrixKey: gpKey,
        session: 'Gara',
        prediction: { positions: picks.slice(0, 5), out: picks[5] ?? null, historicalScore: Number(match[3]) },
      });
    }
  }
  return records;
}

function between(value, start, end) {
  const from = value.indexOf(start);
  if (from < 0) return '';
  const to = end ? value.indexOf(end, from + start.length) : -1;
  return value.slice(from + start.length, to < 0 ? value.length : to);
}

function formatRider(value) {
  return value?.original || value?.normalized || '—';
}

function formatPrediction(record) {
  const prediction = record?.prediction;
  if (!prediction) return '—';
  if (record.session === 'Qualifica') {
    return `Pole: ${formatRider(prediction.pole)}; Tempo: ${prediction.poleTime || '—'}; Time Conversion: ${prediction.timeConversion || '—'}; Score: ${prediction.historicalScore ?? '—'}`;
  }
  return `Top: ${(prediction.positions ?? []).map(formatRider).join(' / ') || '—'}; OUT: ${formatRider(prediction.out)}; Score: ${prediction.historicalScore ?? '—'}`;
}

function markdownCell(value) {
  return text(value || '—').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

function appMatchStatus(gpLabel, appGps) {
  if (!appGps.length) return { app: 'UNKNOWN', status: 'REVIEW' };
  const normalized = normalizeGpKey(gpLabel);
  const matches = appGps.filter((item) => normalizeGpKey(item.name) === normalized);
  if (matches.length === 1) return { app: matches[0].name, status: 'YES' };
  return { app: matches.length > 1 ? 'AMBIGUOUS' : 'UNKNOWN', status: 'REVIEW' };
}

function buildReport({ files, entries, aggregates, summaries, errors, localRecords, appGps }) {
  const lines = [
    '# Task #22 — Ricostruzione completa storico Google Sheets',
    '',
    '> Analisi esclusivamente read-only. Il partecipante è indicato come `TARGET`; l’indirizzo email usato per il filtro non viene salvato nel report.',
    '',
    `- Spreadsheet analizzati: **${files.length}**`,
    `- Tab analizzati: **${files.reduce((sum, file) => sum + file.tabs.length, 0)}**`,
    `- Tab con record TARGET: **${new Set(entries.map((entry) => `${entry.fileId}|${entry.tab}`)).size}**`,
    `- GP identificati: **${summaries.length}**`,
    `- Pronostici TARGET trovati: **${entries.length}**`,
    `- GP completi: **${summaries.filter((summary) => summary.status === 'OK').length}**`,
    `- GP parziali: **${summaries.filter((summary) => summary.status === 'PARTIAL').length}**`,
    `- Duplicati/multiple submissions: **${summaries.filter((summary) => summary.status === 'MULTIPLE SUBMISSIONS').length}**`,
    `- Conflitti tra riepiloghi aggregate: **${summaries.filter((summary) => summary.status === 'AGGREGATE_CONFLICT').length}**`,
    `- GP con matching certo: **${summaries.filter((summary) => appMatchStatus(summary.grandPrix, appGps).status === 'YES').length}**`,
    `- GP da verificare: **${summaries.filter((summary) => appMatchStatus(summary.grandPrix, appGps).status !== 'YES').length}**`,
    '- GP dell’app/database disponibili per il matching: **0**; tutti i match sono `REVIEW` perché la lettura read-only non ha restituito identificativi GP.',
    '',
  ];

  if (errors.length) {
    lines.push('## Errori di lettura', '', ...errors.map((error) => `- ${error}`), '');
  }

  lines.push(
    '## Riepilogo',
    '',
    '| GP | Qualifica | Tempo Pole | Sprint | Gara | OUT | Totale | Stato |',
    '|---|---|---|---:|---:|---|---:|---|',
  );
  for (const summary of summaries) {
    const q = soleRecord(summary.sessionResults.Qualifica)?.prediction;
    const sprint = soleRecord(summary.sessionResults.Sprint)?.prediction;
    const race = soleRecord(summary.sessionResults.Gara)?.prediction;
    lines.push(`| ${markdownCell(summary.grandPrix)} | ${markdownCell(formatRider(q?.pole))} | ${markdownCell(q?.poleTime)} | ${summary.scores.sprint ?? '—'} | ${summary.scores.race ?? '—'} | ${markdownCell(formatRider(race?.out))} | ${summary.aggregate?.total ?? '—'} | ${summary.status} |`);
  }
  if (!summaries.length) lines.push('| — | — | — | — | — | — | — | UNKNOWN |');
  lines.push('');

  lines.push('## Mappatura Google Sheet / Tab → GP → GP app', '', '| Spreadsheet / Tab | GP riconosciuto | GP app | Match |', '|---|---|---|---|');
  for (const summary of summaries) {
    const sources = [...new Set(summary.entries.map((entry) => `${entry.spreadsheet} / ${entry.tab}`))];
    const match = appMatchStatus(summary.grandPrix, appGps);
    for (const source of sources.length ? sources : ['riepilogo aggregate']) {
      lines.push(`| ${markdownCell(source)} | ${markdownCell(summary.grandPrix)} | ${markdownCell(match.app)} | ${match.status} |`);
    }
  }
  if (!summaries.length) lines.push('| — | UNKNOWN | UNKNOWN | REVIEW |');
  lines.push('');

  lines.push('## Dettaglio per GP', '');
  for (const summary of summaries) {
    lines.push(`### ${summary.grandPrix}`, '');
    const match = appMatchStatus(summary.grandPrix, appGps);
    lines.push(`- GP app: **${match.app}**`);
    lines.push(`- MATCH_STATUS: **${match.status === 'YES' ? 'YES' : 'REVIEW'}**`);
    lines.push(`- Stato ricostruzione: **${summary.status}**`);
    if (summary.aggregateConflict) {
      lines.push('- AGGREGATE_CONFLICT: i riepiloghi disponibili riportano valori diversi; nessun riepilogo è stato scelto automaticamente.');
    }
    if (summary.totalMismatch) {
      lines.push(`- TOTAL_MISMATCH: totale dichiarato ${summary.aggregate?.total}; somma dei tre punteggi dichiarati ${summary.computedSum}.`);
    }
    for (const session of SESSIONS) {
      const result = summary.sessionResults[session];
      lines.push(`- ${session}: **${result.status}**`);
      for (const record of result.records) {
        lines.push(`  - ${formatPrediction(record)} · timestamp: ${record.timestamp || '—'} · origine: ${record.spreadsheet} / ${record.tab} / riga ${record.rowNumber}`);
      }
    }
    if (summary.aggregates.length) {
      for (const aggregate of summary.aggregates) {
        lines.push(`- HISTORICAL_SCORE riepilogo: Q=${aggregate.qualifying ?? '—'}, Sprint=${aggregate.sprint ?? '—'}, Gara=${aggregate.race ?? '—'}, Totale=${aggregate.total ?? '—'} · origine: ${aggregate.spreadsheet} / ${aggregate.tab} / riga ${aggregate.rowNumber}`);
      }
    } else {
      lines.push('- HISTORICAL_SCORE riepilogo: non disponibile.');
    }
    lines.push('');
  }

  lines.push('## Invii multipli e anomalie', '');
  const multiple = summaries.filter((summary) => summary.status === 'MULTIPLE SUBMISSIONS');
  if (!multiple.length) {
    lines.push('- Nessun MULTIPLE SUBMISSIONS rilevato per le sessioni ricostruite.');
  } else {
    for (const summary of multiple) {
      lines.push(`- **MULTIPLE SUBMISSIONS — ${summary.grandPrix}**`);
      for (const entry of summary.entries) {
        lines.push(`  - ${entry.session}: timestamp ${entry.timestamp || '—'} · ${entry.spreadsheet} / ${entry.tab} / riga ${entry.rowNumber} · ${formatPrediction(entry)}`);
      }
    }
  }
  lines.push('');

  lines.push('## Normalizzazione piloti', '', '| Testo originale | normalized_rider | Stato |', '|---|---|---|');
  const riderPairs = new Map();
  for (const entry of entries) {
    const values = entry.session === 'Qualifica'
      ? [entry.prediction.pole]
      : [...(entry.prediction.positions ?? []), entry.prediction.out];
    for (const value of values) if (value?.original) riderPairs.set(value.original, value);
  }
  for (const value of riderPairs.values()) {
    lines.push(`| ${markdownCell(value.original)} | ${markdownCell(value.normalized)} | ${value.status} |`);
  }
  if (!riderPairs.size) lines.push('| — | — | — |');
  lines.push('- Il testo originale del foglio non viene modificato.', '');

  lines.push('## Confronto con lo storico locale', '', '| GP | Sessione | Stato | Dettaglio |', '|---|---|---|---|');
  const localGroups = new Map();
  const googleGroups = new Map();
  for (const record of localRecords) {
    const key = `${record.grandPrixKey}|${record.session}`;
    if (!localGroups.has(key)) localGroups.set(key, []);
    localGroups.get(key).push(record);
  }
  for (const record of entries) {
    const key = `${record.grandPrixKey}|${record.session}`;
    if (!googleGroups.has(key)) googleGroups.set(key, []);
    googleGroups.get(key).push(record);
  }
  for (const record of localRecords) {
    const key = `${record.grandPrixKey}|${record.session}`;
    const matches = googleGroups.get(key) ?? [];
    const status = matches.length === 0
      ? 'MISSING'
      : matches.length > 1
        ? 'UNKNOWN'
        : formatPrediction(matches[0]) === formatPrediction(record)
          ? 'MATCH'
          : 'DIFFERENCE';
    const detail = matches.length === 0
      ? 'non trovata nei Google Sheets'
      : matches.length > 1
        ? `${matches.length} record Google; confronto non risolto automaticamente`
        : status === 'MATCH'
          ? 'valori presenti e coincidenti'
          : 'valori diversi; verificare il record';
    lines.push(`| ${markdownCell(record.grandPrix)} | ${record.session} | ${status} | ${detail} |`);
  }
  for (const [key, records] of googleGroups) {
    if (!localGroups.has(key)) {
      for (const record of records) {
        lines.push(`| ${markdownCell(record.grandPrix)} | ${record.session} | NEW RECORD | presente in Google Sheets ma non nel dataset locale |`);
      }
    }
  }
  if (!localRecords.length && !entries.length) lines.push('| — | — | UNKNOWN | nessun record disponibile |');
  lines.push('');

  lines.push(
    '## Controlli di coerenza',
    '',
    '- I punteggi riportati sono `HISTORICAL_SCORE` già presenti nei fogli.',
    '- Qualifica: controllati pilota Pole, tempo `MM:SS.mmm` e punteggio.',
    '- Sprint: controllati esattamente tre posizioni, duplicati e punteggio.',
    '- Gara: controllati esattamente cinque posizioni, duplicati, OUT distinto e punteggio.',
    '- Il totale dichiarato non viene corretto; eventuali differenze sono marcate `TOTAL_MISMATCH`.',
    '',
    '## Verifiche di sicurezza',
    '',
    '- Database modificato: **NO**',
    '- Prediction create: **NO**',
    '- Prediction modificate: **NO**',
    '- RPC modificate: **NO**',
    '- Migration: **NO**',
    '- Scoring modificato: **NO**',
    '- Google Sheets modificato: **NO**',
    '- Dati ufficiali MotoGP modificati: **NO**',
    '- Token/credenziali salvati o stampati: **NO**',
    '',
    'Questo task non contiene alcuna procedura di importazione verso Supabase.',
  );
  return `${lines.join('\n')}\n`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }
  if (!args.email || !EMAIL_RE.test(normalizeEmail(args.email))) {
    throw new Error('Specificare --email o TARGET_EMAIL con un indirizzo valido.');
  }

  const connectors = new ReplitConnectors();
  let sourceFiles = [];
  const errors = [];
  if (args.spreadsheetId) {
    sourceFiles = [{ id: args.spreadsheetId, name: args.spreadsheetId }];
  } else {
    try {
      sourceFiles = await fetchDriveFiles(connectors);
    } catch (error) {
      errors.push(`Drive: ${error.message}`);
    }
  }

  const files = [];
  for (const source of sourceFiles) {
    try {
      files.push(await fetchSpreadsheet(connectors, source));
    } catch (error) {
      errors.push(`${source.name}: ${error.message}`);
    }
  }

  const parsed = sanitizeEntries(files, args.email);
  const groupedKeys = new Set([
    ...parsed.entries.map((entry) => entry.grandPrixKey),
    ...parsed.aggregates
      .filter((aggregate) => parsed.entries.some((entry) => entry.grandPrixKey === aggregate.grandPrixKey))
      .map((aggregate) => aggregate.grandPrixKey),
  ]);
  const summaries = [...groupedKeys]
    .filter(Boolean)
    .map((key) => summaryForGp(key, parsed.entries, parsed.aggregates))
    .sort((left, right) => canonical(left.grandPrix).localeCompare(canonical(right.grandPrix)));

  let localRecords = [];
  try {
    localRecords = parseLocalHistorical(await readFile(args.localSource, 'utf8'), args.email);
  } catch (error) {
    errors.push(`Dataset locale: ${error.message}`);
  }

  const report = buildReport({
    files,
    entries: parsed.entries,
    aggregates: parsed.aggregates,
    summaries,
    errors,
    localRecords,
    appGps: [],
  });
  await mkdir(dirname(args.report), { recursive: true });
  await writeFile(args.report, report, 'utf8');

  console.log('RICOSTRUZIONE STORICO GOOGLE SHEETS');
  console.log(`Spreadsheet analizzati: ${files.length}`);
  console.log(`Tab analizzati: ${parsed.tabCount}`);
  console.log(`GP identificati: ${summaries.length}`);
  console.log(`Pronostici target trovati: ${parsed.entries.length}`);
  console.log(`GP completi: ${summaries.filter((summary) => summary.status === 'OK').length}`);
  console.log(`GP parziali: ${summaries.filter((summary) => summary.status === 'PARTIAL').length}`);
  console.log(`Multiple submissions: ${summaries.filter((summary) => summary.status === 'MULTIPLE SUBMISSIONS').length}`);
  console.log(`GP da verificare: ${summaries.length}`);
  console.log(`Report: ${args.report}`);
  if (errors.length) {
    console.log(`Errori non bloccanti: ${errors.length}`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});