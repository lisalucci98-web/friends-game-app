/**
 * Analisi read-only dei pronostici storici da Google Sheets.
 *
 * Il comando non conosce Supabase e non contiene credenziali. In modalità live
 * usa il connettore OAuth Google Sheets di Replit; in modalità offline accetta
 * un export JSON dell'API Sheets per poter verificare il parser senza rete.
 *
 * Esempi:
 *   node scripts/import-historical-google-sheets.mjs --email "$TARGET_EMAIL"
 *   node scripts/import-historical-google-sheets.mjs --help
 *   node scripts/import-historical-google-sheets.mjs --email "$TARGET_EMAIL" \
 *     --input /tmp/google-sheets-export.json
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { ReplitConnectors } from '@replit/connectors-sdk';

const DEFAULT_SPREADSHEET_ID = '12LPMVYnqA6gb6uyFYTesw4XVG3XVZbPidVWEHOy7UhY';
const DEFAULT_REPORT = '.agents/outputs/google-history-import.md';
const DEFAULT_LOCAL_SOURCE =
  'attached_assets/Pasted-Certo-A-questo-punto-userei-i-dati-storici-come-dataset_1787240203484.txt';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SESSION_TYPES = ['Qualifica', 'Sprint', 'Gara'];

const RIDER_ALIASES = new Map(
  [
    ['R. Fernandez', 'Raul Fernandez'],
    ['M. Bezzecchi', 'Marco Bezzecchi'],
    ['J. Martin', 'Jorge Martin'],
    ['A. Ogura', 'Ai Ogura'],
    ['F. Di Giannantonio', 'Fabio Di Giannantonio'],
    ['M. Marquez', 'Marc Marquez'],
    ['F. Bagnaia', 'Francesco Bagnaia'],
    ['P. Acosta', 'Pedro Acosta'],
    ['A. Marquez', 'Alex Marquez'],
    ['J. Mir', 'Joan Mir'],
    ['F. Aldeguer', 'Fermin Aldeguer'],
    ['L. Marini', 'Luca Marini'],
    ['F. Morbidelli', 'Franco Morbidelli'],
    ['E. Bastianini', 'Enea Bastianini'],
    ['J. Miller', 'Jack Miller'],
    ['B. Binder', 'Brad Binder'],
    ['D. Moreira', 'Diogo Moreira'],
    ['A. Fernandez', 'Augusto Fernandez'],
  ].map(([key, value]) => [key.toLocaleLowerCase('it-IT'), value]),
);

const SESSION_PATTERNS = {
  Qualifica: /\b(qualifiche?|qualifica|qualifying|pole|q1|q2)\b/i,
  Sprint: /\b(sprint)\b/i,
  Gara: /\b(gara|race|gp)\b/i,
};

function parseArgs(argv) {
  const args = {
    spreadsheetId: process.env.GOOGLE_SHEET_ID ?? DEFAULT_SPREADSHEET_ID,
    email: process.env.TARGET_EMAIL ?? '',
    report: process.env.HISTORICAL_REPORT ?? DEFAULT_REPORT,
    localSource: process.env.HISTORICAL_DATASET ?? DEFAULT_LOCAL_SOURCE,
    input: '',
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--help' || argument === '-h') args.help = true;
    else if (argument === '--spreadsheet-id') args.spreadsheetId = argv[++index] ?? '';
    else if (argument === '--email') args.email = argv[++index] ?? '';
    else if (argument === '--report') args.report = argv[++index] ?? '';
    else if (argument === '--local-source') args.localSource = argv[++index] ?? '';
    else if (argument === '--input') args.input = argv[++index] ?? '';
    else throw new Error(`Argomento non riconosciuto: ${argument}`);
  }

  return args;
}

function printHelp() {
  console.log(`Import storico Google Sheets — analisi esclusivamente read-only

Uso:
  node scripts/import-historical-google-sheets.mjs --email "$TARGET_EMAIL"

Opzioni:
  --email <email>              email da filtrare; non viene scritta nel report
  --spreadsheet-id <id>        ID del foglio (default: foglio di riferimento)
  --input <file.json>           export locale Sheets per analisi offline
  --local-source <file.txt>     dataset storico locale per il confronto
  --report <file.md>            percorso del report (default: ${DEFAULT_REPORT})
  --help                        mostra questo messaggio

Il processo non esegue chiamate di scrittura verso Google, Supabase o altri
servizi e non ricalcola i punteggi storici.`);
}

function normalizeEmail(value) {
  return String(value ?? '')
    .trim()
    .toLocaleLowerCase('en-US')
    .replace(/\s+/g, '');
}

function displayValue(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function normalizeHeader(value) {
  return displayValue(value)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('it-IT')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function canonicalText(value) {
  return displayValue(value)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('it-IT')
    .replace(/\s+/g, ' ')
    .trim();
}

function columnLabel(number) {
  let result = '';
  let current = Math.max(1, number);
  while (current > 0) {
    const remainder = (current - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    current = Math.floor((current - 1) / 26);
  }
  return result;
}

function uniqueHeaders(row) {
  const counts = new Map();
  return row.map((cell, index) => {
    const base = normalizeHeader(cell) || `colonna ${index + 1}`;
    const count = (counts.get(base) ?? 0) + 1;
    counts.set(base, count);
    return count === 1 ? base : `${base} ${count}`;
  });
}

function headerScore(row) {
  const cells = row.map(normalizeHeader).filter(Boolean);
  if (!cells.length) return 0;
  const joined = cells.join(' | ');
  let score = 0;
  if (cells.some((cell) => /\b(email|e mail|mail)\b/.test(cell))) score += 5;
  if (/\b(timestamp|data|date)\b/.test(joined)) score += 1;
  if (/\b(pilota|rider|pole|punteggio|score|p1|p2|p3)\b/.test(joined)) score += 3;
  if (cells.length >= 2) score += 1;
  return score;
}

function findHeaderRow(values) {
  const candidates = values.slice(0, Math.min(25, values.length));
  if (!candidates.length) return { index: 0, headers: [] };
  let bestIndex = 0;
  let bestScore = -1;
  candidates.forEach((row, index) => {
    const score = headerScore(row);
    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  });
  return { index: bestIndex, headers: uniqueHeaders(candidates[bestIndex] ?? []) };
}

function rowsToObjects(values) {
  const { index: headerIndex, headers } = findHeaderRow(values);
  const rows = values.slice(headerIndex + 1).map((row, rowOffset) => {
    const cells = Array.from({ length: headers.length }, (_, index) => displayValue(row?.[index]));
    const valuesByHeader = Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? '']));
    return { rowNumber: headerIndex + rowOffset + 2, cells, valuesByHeader };
  });
  return { headerIndex, headers, rows };
}

function looksLikeEmail(value) {
  return EMAIL_RE.test(normalizeEmail(value));
}

function emailColumnIndexes(headers) {
  return headers
    .map((header, index) => (/\b(email|e mail|mail)\b/.test(header) ? index : -1))
    .filter((index) => index >= 0);
}

function rowEmail(row, headers) {
  const candidates = emailColumnIndexes(headers).map((index) => row.cells[index]);
  candidates.push(...row.cells.filter(looksLikeEmail));
  return candidates.find(looksLikeEmail) ?? '';
}

function valuesWithHeader(row, matcher) {
  return Object.entries(row.valuesByHeader)
    .filter(([header, value]) => value && matcher(header, value))
    .map(([header, value]) => ({ header, value }));
}

function firstValue(row, matchers) {
  for (const matcher of matchers) {
    const found = valuesWithHeader(row, (header) => matcher.test(header));
    if (found.length) return found[0];
  }
  return null;
}

function explicitSession(row) {
  const sessionField = firstValue(row, [
    /\bsessione\b/,
    /\bsession\b/,
    /\btipo pronostico\b/,
    /\btype\b/,
  ]);
  if (!sessionField) return null;
  return detectSession(`${sessionField.header} ${sessionField.value}`);
}

function detectSession(text) {
  const matches = SESSION_TYPES.filter((session) => SESSION_PATTERNS[session].test(text));
  if (matches.length === 1) return matches[0];
  return null;
}

function sessionSignals(headers, sheetTitle, row) {
  const explicit = explicitSession(row);
  if (explicit) return [explicit];

  const titleSession = detectSession(sheetTitle);
  if (titleSession) return [titleSession];

  const headerSessions = new Set();
  for (const header of headers) {
    const detected = detectSession(header);
    if (detected) headerSessions.add(detected);
  }
  if (headerSessions.size) return [...headerSessions];
  return ['Non identificata'];
}

function isPositionHeader(header, position) {
  const normalized = normalizeHeader(header);
  return new RegExp(`(?:^|\\s)(?:p|pos|position|posto)?\\s*${position}(?:$|\\s|°|º|o|a)`).test(normalized)
    || new RegExp(`(?:^|\\s)${position}(?:°|º|o|a)(?:$|\\s)`).test(normalized);
}

function positionValue(row, position, session) {
  const sessionPattern = session === 'Sprint' ? /sprint/ : /gara|race/;
  const candidates = valuesWithHeader(row, (header) => {
    const positionMatch = isPositionHeader(header, position);
    const sessionMatch = sessionPattern.test(header);
    return positionMatch && (sessionMatch || !/\b(qualifica|qualifying|pole)\b/.test(header));
  });
  return candidates[0] ?? null;
}

function riderListFromCell(value) {
  return displayValue(value)
    .split(/\s*[/;,|]\s*/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizationForRider(value) {
  const original = displayValue(value);
  if (!original) return { original, normalized: '', status: 'EMPTY' };
  const normalized = RIDER_ALIASES.get(original.toLocaleLowerCase('it-IT'));
  if (normalized) return { original, normalized, status: 'NORMALIZED' };
  if (/^[A-ZÀ-Ý]\.\s+\S+/.test(original)) {
    return { original, normalized: null, status: 'AMBIGUA' };
  }
  return { original, normalized: original, status: 'UNCHANGED' };
}

function normalizationForList(value) {
  const original = displayValue(value);
  const riders = riderListFromCell(original);
  const items = riders.map(normalizationForRider);
  return {
    original,
    normalized: items.every((item) => item.normalized)
      ? items.map((item) => item.normalized).join(' / ')
      : null,
    status: items.some((item) => item.status === 'AMBIGUA') ? 'AMBIGUA' : items.length ? 'OK' : 'EMPTY',
    items,
  };
}

function historicalScore(row, session) {
  const preferred = firstValue(row, [
    session === 'Qualifica' ? /\b(punteggio qualifica|score qualifica|punti qualifica)\b/ : /a^/,
    session === 'Sprint' ? /\b(punteggio sprint|score sprint|punti sprint)\b/ : /a^/,
    session === 'Gara' ? /\b(punteggio gara|score gara|punti gara)\b/ : /a^/,
    /\b(historical score|historical_score|punteggio|score|punti|total)\b/,
  ]);
  if (!preferred) return null;
  const number = Number(String(preferred.value).replace(',', '.'));
  return Number.isFinite(number) ? number : preferred.value;
}

function poleTimeValue(row) {
  return firstValue(row, [
    /\b(tempo pole|pole time|qualifica.*tempo|tempo.*qualifica|time.*qualifying)\b/,
    /\b(tempo|time)\b/,
  ]);
}

function poleRiderValue(row) {
  return firstValue(row, [
    /\b(pilota pole|pole position|pole rider|pilota.*pole)\b/,
    /\bpole\b/,
  ]);
}

function timeConversionValue(row) {
  return firstValue(row, [/\b(time conversion|conversione tempo|conversion)\b/]);
}

function buildPrediction(row, session) {
  const score = historicalScore(row, session);
  if (session === 'Qualifica') {
    const pole = poleRiderValue(row);
    const time = poleTimeValue(row);
    const conversion = timeConversionValue(row);
    return {
      pole: pole ? normalizationForRider(pole.value) : null,
      poleTime: time ? { original: time.value } : null,
      timeConversion: conversion ? { original: conversion.value } : null,
      historicalScore: score,
    };
  }

  const positions = Array.from({ length: session === 'Sprint' ? 3 : 5 }, (_, index) => index + 1)
    .map((position) => {
      const value = positionValue(row, position, session);
      return value ? normalizationForRider(value.value) : null;
    });
  const listFallback = firstValue(row, [
    session === 'Sprint' ? /\b(top 3|sprint.*pronostico|pronostico sprint)\b/ : /a^/,
    session === 'Gara' ? /\b(top 5|gara.*pronostico|pronostico gara)\b/ : /a^/,
  ]);
  const fallback = listFallback ? normalizationForList(listFallback.value).items : [];
  const picks = positions.map((item, index) => item ?? fallback[index] ?? null);
  const out = session === 'Gara'
    ? firstValue(row, [/\b(pilota out|out rider|out|dnf)\b/])
    : null;

  return {
    positions: picks,
    out: out ? normalizationForRider(out.value) : null,
    historicalScore: score,
  };
}

function pickFirst(row, patterns) {
  return firstValue(row, patterns)?.value ?? '';
}

function identifyGrandPrix(row, sheetTitle, spreadsheetTitle) {
  const explicit = pickFirst(row, [
    /\b(gran premio|grand prix|nome gp|gp name|gp)\b/,
  ]);
  if (explicit) return { label: explicit, source: 'nome GP esplicito', confidence: 'alta' };

  const circuit = pickFirst(row, [/\b(circuito|circuit|track|venue)\b/]);
  if (circuit) return { label: circuit, source: 'circuito', confidence: 'media' };

  const date = pickFirst(row, [/\b(data gp|gp date|race date|weekend date)\b/]);
  if (date) return { label: date, source: 'data', confidence: 'bassa' };

  const title = displayValue(sheetTitle);
  if (/\b(gp|grand prix|gran premio|circuit|circuito)\b/i.test(title) && !/form responses?/i.test(title)) {
    return { label: stripSessionSuffix(title), source: 'nome Sheet', confidence: 'bassa' };
  }

  const spreadsheet = displayValue(spreadsheetTitle);
  if (spreadsheet && !/^(risposte?|responses?|form|classifica|grafici?)\b/i.test(spreadsheet)) {
    return { label: spreadsheet, source: 'titolo spreadsheet', confidence: 'media' };
  }

  return { label: null, source: 'non determinabile', confidence: 'nessuna' };
}

function stripSessionSuffix(value) {
  return displayValue(value)
    .replace(/\s*(?:[-–—|:]\s*)?(qualifiche?|qualifica|qualifying|sprint|gara|race)\s*$/i, '')
    .trim();
}

function normalizeGpKey(label) {
  const value = canonicalText(stripSessionSuffix(label));
  if (!value) return '';
  const number = value.match(/\bgp\s*(\d+)\b/);
  if (number) return `gp-${number[1]}`;
  return value.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function parseSheet(sheetTitle, values, spreadsheetTitle = '') {
  const { headers, rows } = rowsToObjects(values);
  return rows.map((row) => {
    const email = rowEmail(row, headers);
    let sessions = sessionSignals(headers, sheetTitle, row);
    if (sessions[0] === 'Non identificata') {
      const joinedHeaders = headers.join(' | ');
      if (/\b(pilota pole|tempo pole|time conversion)\b/i.test(joinedHeaders)) {
        sessions = ['Qualifica'];
      } else if (headers.some((header) => isPositionHeader(header, 5)) || /\b(pilota out|out rider)\b/i.test(joinedHeaders)) {
        sessions = ['Gara'];
      } else if (
        headers.some((header) => isPositionHeader(header, 1))
        && headers.some((header) => isPositionHeader(header, 2))
        && headers.some((header) => isPositionHeader(header, 3))
      ) {
        sessions = ['Sprint'];
      }
    }
    return sessions.map((session) => {
      const grandPrix = identifyGrandPrix(row, sheetTitle, spreadsheetTitle);
      return {
        sheetTitle,
        rowNumber: row.rowNumber,
        email,
        session,
        grandPrix,
        grandPrixKey: normalizeGpKey(grandPrix.label),
        prediction: session === 'Non identificata' ? null : buildPrediction(row, session),
        rawValues: { ...row.valuesByHeader },
      };
    });
  }).flat();
}

function extractSheetEntries(input) {
  const spreadsheetTitle = input?.metadata?.properties?.title
    ?? input?.spreadsheet?.properties?.title
    ?? input?.title
    ?? '';
  const isAggregateSheet = (title) => /^(classifica|grafici?|dashboard|ranking|totali?)\b/i.test(displayValue(title));
  if (Array.isArray(input?.sheets)) {
    return input.sheets.flatMap((sheet) =>
      isAggregateSheet(sheet.title ?? sheet.name ?? '')
        ? []
        : parseSheet(sheet.title ?? sheet.name ?? '', sheet.values ?? [], spreadsheetTitle),
    );
  }

  const valuesBySheet = input?.valuesBySheet ?? input?.values ?? {};
  return Object.entries(valuesBySheet).flatMap(([title, payload]) =>
    isAggregateSheet(title)
      ? []
      : parseSheet(title, Array.isArray(payload) ? payload : payload?.values ?? [], spreadsheetTitle),
  );
}

function findRelatedGoogleLinks(input) {
  const valuesBySheet = input?.valuesBySheet ?? input?.values ?? {};
  const sheetEntries = Array.isArray(input?.sheets)
    ? input.sheets.map((sheet) => [sheet.title ?? sheet.name ?? '', sheet.values ?? []])
    : Object.entries(valuesBySheet).map(([title, payload]) => [
        title,
        Array.isArray(payload) ? payload : payload?.values ?? [],
      ]);
  const links = [];

  for (const [sheetTitle, rows] of sheetEntries) {
    for (const row of rows) {
      for (const cell of row ?? []) {
        const matches = displayValue(cell).match(/https?:\/\/[^\s"')]+/g) ?? [];
        for (const url of matches) {
          if (!/docs\.google\.com\/(spreadsheets|forms)/i.test(url)) continue;
          links.push({
            sheetTitle,
            kind: /docs\.google\.com\/forms/i.test(url) ? 'Google Form' : 'Google Sheet',
          });
        }
      }
    }
  }
  return links;
}

function getSheetMetadataPayload(metadata) {
  return (metadata?.sheets ?? []).map((sheet) => ({
    title: sheet.properties?.title ?? sheet.title ?? '',
    rowCount: sheet.properties?.gridProperties?.rowCount ?? 1000,
    columnCount: sheet.properties?.gridProperties?.columnCount ?? 26,
  })).filter((sheet) => sheet.title);
}

async function fetchGoogleSheets(spreadsheetId) {
  const connectors = new ReplitConnectors();
  const request = async (path) => {
    const response = await connectors.proxy('google-sheet', path, { method: 'GET' });
    let body = null;
    try {
      body = await response.json();
    } catch {
      body = null;
    }
    if (!response.ok) {
      const providerMessage = body?.error?.message ?? `HTTP ${response.status}`;
      throw new Error(`Google Sheets non disponibile: ${providerMessage}`);
    }
    return body;
  };

  const fields = 'properties.title,spreadsheetUrl,sheets.properties';
  const metadata = await request(`/v4/spreadsheets/${spreadsheetId}?fields=${encodeURIComponent(fields)}`);
  const sheets = getSheetMetadataPayload(metadata);
  const valuesBySheet = {};

  for (const sheet of sheets) {
    const range = `'${sheet.title.replaceAll("'", "''")}'!A1:${columnLabel(sheet.columnCount)}${sheet.rowCount}`;
    valuesBySheet[sheet.title] = await request(
      `/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`,
    );
  }

  return { metadata, valuesBySheet };
}

function filteredRecords(entries, targetEmail) {
  const target = normalizeEmail(targetEmail);
  return entries
    .filter((entry) => normalizeEmail(entry.email) === target)
    .map(({ email: _email, rawValues: _rawValues, ...entry }) => entry);
}

function parseLocalMarkdown(text, targetEmail) {
  const target = normalizeEmail(targetEmail);
  const result = [];
  const gpSections = [...text.matchAll(/^#{1,2}\s+GP (\d+)(?:\s+—\s+([^\n]+))?/gim)];
  for (let index = 0; index < gpSections.length; index += 1) {
    const section = gpSections[index];
    const start = section.index;
    const end = gpSections[index + 1]?.index ?? text.length;
    const block = text.slice(start, end);
    const gpLabel = `GP ${section[1]}${section[2] ? ` — ${section[2].trim()}` : ''}`;

    const qBlock = between(block, '### Qualifiche', '### Sprint');
    for (const line of qBlock.split(/\r?\n/)) {
      const match = line.match(/^\s*(\S+@\S+)\s+(.+?)\s+(\d{2}:\d{2}\.\d{3})\s+(-?\d+)\s*$/);
      if (match && normalizeEmail(match[1]) === target) {
        result.push({
          grandPrix: gpLabel,
          grandPrixKey: normalizeGpKey(`GP ${section[1]}`),
          session: 'Qualifica',
          prediction: {
            pole: normalizationForRider(match[2]),
            poleTime: { original: match[3] },
            timeConversion: null,
            historicalScore: Number(match[4]),
          },
          source: 'dataset locale manuale',
        });
      }
    }

    const sprintBlock = between(block, '### Sprint', '### Gara');
    for (const line of sprintBlock.split(/\r?\n/)) {
      const match = line.match(/^\s*(\S+@\S+)\s+(.+?)\s+(-?\d+)\s*$/);
      if (match && normalizeEmail(match[1]) === target && match[2].includes('/')) {
        result.push({
          grandPrix: gpLabel,
          grandPrixKey: normalizeGpKey(`GP ${section[1]}`),
          session: 'Sprint',
          prediction: {
            positions: normalizationForList(match[2]).items,
            out: null,
            historicalScore: Number(match[3]),
          },
          source: 'dataset locale manuale',
        });
      }
    }

    const raceBlock = between(block, '### Gara', '### Totali storici');
    const raceMatches = [...raceBlock.matchAll(/^\s*(\S+@\S+)\s*\n\s*([^\n]+)\n\s*(-?\d+)\s*$/gm)];
    for (const match of raceMatches) {
      if (normalizeEmail(match[1]) !== target) continue;
      const picks = normalizationForList(match[2]).items;
      result.push({
        grandPrix: gpLabel,
        grandPrixKey: normalizeGpKey(`GP ${section[1]}`),
        session: 'Gara',
        prediction: {
          positions: picks.slice(0, 5),
          out: picks[5] ?? null,
          historicalScore: Number(match[3]),
        },
        source: 'dataset locale manuale',
      });
    }
  }
  return result;
}

function between(text, start, end) {
  const startIndex = text.indexOf(start);
  if (startIndex < 0) return '';
  const endIndex = end ? text.indexOf(end, startIndex + start.length) : -1;
  return text.slice(startIndex + start.length, endIndex < 0 ? text.length : endIndex);
}

function normalizedPredictionValue(value) {
  if (!value) return '';
  if (typeof value === 'string') return canonicalText(value);
  if (value.normalized) return canonicalText(value.normalized);
  if (value.original) return canonicalText(value.original);
  return '';
}

function comparePredictions(google, local) {
  const differences = [];
  const googleGroups = new Map();
  const localGroups = new Map();
  for (const record of google) {
    const key = `${record.grandPrixKey}|${record.session}`;
    if (!googleGroups.has(key)) googleGroups.set(key, record);
  }
  for (const record of local) {
    const key = `${record.grandPrixKey}|${record.session}`;
    localGroups.set(key, record);
  }

  for (const [key, oldRecord] of localGroups) {
    const current = googleGroups.get(key);
    if (!current) {
      differences.push({
        gp: oldRecord.grandPrix,
        session: oldRecord.session,
        previous: formatPrediction(oldRecord.prediction),
        current: 'non trovato nel Google Sheet',
        cause: 'GP/sessione non presenti o non identificabili nel foglio',
      });
      continue;
    }
    const oldValue = formatPrediction(oldRecord.prediction);
    const currentValue = formatPrediction(current.prediction);
    if (oldValue !== currentValue) {
      differences.push({
        gp: current.grandPrix.label ?? current.grandPrix,
        session: current.session,
        previous: oldValue,
        current: currentValue,
        cause: 'valori differenti oppure formattazione diversa',
      });
    }
  }

  for (const [key, current] of googleGroups) {
    if (!localGroups.has(key)) {
      differences.push({
        gp: current.grandPrix.label ?? 'GP non identificato',
        session: current.session,
        previous: 'non presente nel dataset locale',
        current: formatPrediction(current.prediction),
        cause: 'record Google aggiuntivo o GP/sessione non allineati',
      });
    }
  }
  return differences;
}

function formatRider(value) {
  if (!value) return '—';
  return value.original || value.normalized || String(value);
}

function formatPrediction(prediction) {
  if (!prediction) return '—';
  if ('pole' in prediction) {
    return [
      `Pole: ${formatRider(prediction.pole)}`,
      `Tempo: ${prediction.poleTime?.original ?? '—'}`,
      `Time Conversion: ${prediction.timeConversion?.original ?? '—'}`,
      `Score: ${prediction.historicalScore ?? '—'}`,
    ].join('; ');
  }
  return [
    `Top: ${(prediction.positions ?? []).map(formatRider).join(' / ') || '—'}`,
    `OUT: ${formatRider(prediction.out)}`,
    `Score: ${prediction.historicalScore ?? '—'}`,
  ].join('; ');
}

function scoreFor(records, session) {
  const record = records.find((item) => item.session === session);
  return record?.prediction?.historicalScore ?? '—';
}

function markdownCell(value) {
  return String(value ?? '—').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

function buildReport({ args, status, googleRecords, localRecords, differences, relatedLinks, error }) {
  const byGp = new Map();
  for (const record of googleRecords) {
    const key = record.grandPrixKey || `unresolved-${record.sheetTitle}-${record.rowNumber}`;
    if (!byGp.has(key)) byGp.set(key, []);
    byGp.get(key).push(record);
  }

  const lines = [
    '# Task #21 — Analisi pronostici storici Google Sheets',
    '',
    '> Report generato in modalità esclusivamente read-only. Il partecipante è indicato solo come `TARGET` per non persistere l’indirizzo email nel repository.',
    '',
    `- Stato accesso Google Sheets: **${status}**`,
    `- Foglio analizzato: **${args.spreadsheetId ? 'ID configurato' : 'non configurato'}**`,
    `- Record del partecipante trovati: **${googleRecords.length}**`,
    `- Collegamenti ad altri Google Sheet/Form: **${relatedLinks.length}**`,
    `- Punteggi ricalcolati: **NO**`,
    `- Scritture Google Sheets: **NO**`,
    `- Scritture Supabase: **NO**`,
    '',
  ];

  if (error) {
    lines.push(
      '## Blocco operativo',
      '',
      `La lettura live non è stata completata: **${error}**.`,
      '',
      'Il parser e il report restano utilizzabili passando un export JSON locale con `--input`. Nessun workaround pubblico o credenziale alternativa è stato utilizzato.',
      '',
    );
  }

  lines.push(
    '## Riepilogo per GP',
    '',
    '| GP | Qualifica | Sprint | Gara | OUT | Totale |',
    '|---|---:|---:|---:|---|---:|',
  );

  for (const [key, records] of byGp) {
    const label = records[0].grandPrix?.label ?? 'GP non identificato';
    const race = records.find((record) => record.session === 'Gara')?.prediction;
    const scores = SESSION_TYPES.map((session) => scoreFor(records, session));
    const numericScores = scores.filter((score) => typeof score === 'number');
    const total = numericScores.length === 3 ? numericScores.reduce((sum, score) => sum + score, 0) : '—';
    lines.push(`| ${markdownCell(label || key)} | ${scores[0]} | ${scores[1]} | ${scores[2]} | ${markdownCell(formatRider(race?.out))} | ${total} |`);
  }
  if (!byGp.size) lines.push('| — | — | — | — | — | — |');
  lines.push('', '_Il Totale è la somma dei punteggi storici già presenti nelle tre sessioni; non è un nuovo calcolo di scoring._', '');

  lines.push(
    '## Dettaglio',
    '',
    '| GP | Sessione | Pronostico | Punteggio storico |',
    '|---|---|---|---:|',
  );
  for (const record of googleRecords) {
    const label = record.grandPrix?.label ?? 'GP non identificato';
    lines.push(`| ${markdownCell(label)} | ${record.session} | ${markdownCell(formatPrediction(record.prediction))} | ${record.prediction?.historicalScore ?? '—'} |`);
  }
  if (!googleRecords.length) lines.push('| — | — | Nessun record disponibile | — |');
  lines.push('');

  const unresolved = googleRecords.filter((record) => !record.grandPrix?.label);
  lines.push('## GP/sessioni non determinabili', '');
  if (unresolved.length) {
    for (const record of unresolved) {
      lines.push(`- Sheet non identificato · riga ${record.rowNumber} · sessione ${record.session}`);
    }
  } else {
    lines.push('- Nessuno tra i record trovati.');
  }
  lines.push('');

  lines.push('## Normalizzazione piloti', '');
  const riderNormalizations = new Map();
  for (const record of googleRecords) {
    const values = [
      record.prediction?.pole,
      ...(record.prediction?.positions ?? []),
      record.prediction?.out,
    ];
    for (const value of values) {
      if (value?.original) riderNormalizations.set(value.original, value);
    }
  }
  if (riderNormalizations.size) {
    lines.push('| Testo originale | Rappresentazione normalizzata | Stato |');
    lines.push('|---|---|---|');
    for (const value of riderNormalizations.values()) {
      lines.push(`| ${markdownCell(value.original)} | ${markdownCell(value.normalized ?? '—')} | ${value.status} |`);
    }
  } else {
    lines.push('- Nessun pilota disponibile da normalizzare.');
  }
  lines.push('- I valori originali restano disponibili nel processo e non vengono sovrascritti dalla rappresentazione normalizzata.');
  lines.push('');

  lines.push('## Collegamenti ad altri file Google', '');
  if (relatedLinks.length) {
    for (const link of relatedLinks) {
      lines.push(`- ${link.kind} rilevato nel tab \`${link.sheetTitle}\`.`);
    }
  } else {
    lines.push('- Nessun collegamento a Google Sheet o Google Form rilevato nei valori o nelle formule disponibili.');
  }
  lines.push('');

  lines.push('## Confronto con il dataset locale', '');
  if (!localRecords.length) {
    lines.push('- Dataset locale non disponibile o nessun record corrispondente al partecipante.');
  } else if (!googleRecords.length) {
    lines.push(`- Dataset locale rilevato: ${localRecords.length} record; confronto sospeso perché Google Sheets non ha restituito record.`);
  } else if (!differences.length) {
    lines.push('- Nessuna differenza rilevata sulle coppie GP/sessione confrontabili.');
  } else {
    lines.push('| GP | Sessione | Valore precedente | Valore Google Sheet | Differenza | Possibile causa |');
    lines.push('|---|---|---|---|---|---|');
    for (const difference of differences) {
      lines.push(`| ${markdownCell(difference.gp)} | ${difference.session} | ${markdownCell(difference.previous)} | ${markdownCell(difference.current)} | sì | ${markdownCell(difference.cause)} |`);
    }
  }
  lines.push('');

  lines.push(
    '## Verifiche di sicurezza',
    '',
    '- Database modificato: **NO**',
    '- RPC modificate: **NO**',
    '- Migration: **NO**',
    '- Prediction create: **NO**',
    '- Dati ufficiali modificati: **NO**',
    '- Scoring modificato: **NO**',
    '- Google Sheet modificato: **NO**',
    '- Credenziali/token stampati o salvati: **NO**',
    '',
    'Il passaggio successivo, dopo la verifica del report, potrà essere progettato separatamente. Questo script non contiene alcuna routine di importazione verso Supabase.',
  );

  return `${lines.join('\n')}\n`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }
  if (!args.email || !looksLikeEmail(args.email)) {
    throw new Error('Specificare --email con un indirizzo valido o impostare TARGET_EMAIL.');
  }

  let status = 'NON ESEGUITO';
  let googleRecords = [];
  let relatedLinks = [];
  let error = null;

  try {
    const payload = args.input
      ? JSON.parse(await readFile(args.input, 'utf8'))
      : await fetchGoogleSheets(args.spreadsheetId);
    googleRecords = filteredRecords(extractSheetEntries(payload), args.email);
    relatedLinks = findRelatedGoogleLinks(payload);
    status = args.input ? 'EXPORT LOCALE LETTO' : 'LETTO';
  } catch (caught) {
    error = caught instanceof Error ? caught.message : 'errore non specificato';
    status = 'BLOCCATO';
  }

  let localRecords = [];
  try {
    localRecords = parseLocalMarkdown(await readFile(args.localSource, 'utf8'), args.email);
  } catch {
    localRecords = [];
  }

  const differences = comparePredictions(googleRecords, localRecords);
  const report = buildReport({
    args,
    status,
    googleRecords,
    localRecords,
    differences,
    relatedLinks,
    error,
  });
  await mkdir(dirname(args.report), { recursive: true });
  await writeFile(args.report, report, 'utf8');

  console.log('ANALISI STORICA GOOGLE SHEETS');
  console.log(`Stato: ${status}`);
  console.log(`Record target anonimizzato: ${googleRecords.length}`);
  console.log(`Record dataset locale: ${localRecords.length}`);
  console.log(`Differenze: ${differences.length}`);
  console.log(`Report: ${args.report}`);

  if (error && !args.input) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});