/**
 * Import risultati ufficiali MotoGP 2026.
 *
 * Default: dry-run, nessuna scrittura.
 * Import reale: node scripts/import-motogp-results-2026.mjs --import
 *
 * L'API MotoGP viene usata per eventi, sessioni e PDF. Gli ID delle
 * sessioni da scrivere sono sempre quelli già presenti in Supabase.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const API_BASE = 'https://api.motogp.pulselive.com/motogp/v1';
const SEASON_ID = 'e88b4e43-2209-47aa-8e83-0e0b1cedde6e';
const SEASON_YEAR = 2026;
const RESULTS_CATEGORY_ID = 'e8c110ad-64aa-4e8e-8a86-f2f152f6a942';
const IMPORT_MODE = process.argv.includes('--import');
const TMP_DIR = join(tmpdir(), 'motogp-results-2026');
const SUPABASE_URL = (
  process.env.SUPABASE_URL ??
  process.env.VITE_SUPABASE_URL ??
  ''
).replace(/\/$/, '');
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

const counters = {
  missingPdf: 0,
  unreadablePdf: 0,
  riderNotFound: 0,
  unparsedRows: 0,
  duplicates: 0,
  duplicatePositions: 0,
  missingSessions: 0,
  orphanResults: 0,
  criticalErrors: 0,
};

const details = {
  missingPdf: [],
  unreadablePdf: [],
  riderNotFound: [],
  unparsedRows: [],
  duplicatePositions: [],
  missingSessions: [],
  orphanResults: [],
  requestFailures: [],
};

function section(title) {
  console.log(`\n${'═'.repeat(76)}\n${title}\n${'═'.repeat(76)}`);
}

function firstValue(...values) {
  return values.find(value => value !== undefined && value !== null && value !== '');
}

function listFrom(payload, keys) {
  if (Array.isArray(payload)) return payload;
  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }
  return [];
}

function textValue(value) {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value === 'object') {
    return firstValue(value.name, value.label, value.shortName, value.value) ?? null;
  }
  return String(value);
}

function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, ' ')
    .trim();
}

async function apiGet(path) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0' },
    signal: AbortSignal.timeout(30_000),
  });
  const body = await response.text();
  let json = null;
  try {
    json = body ? JSON.parse(body) : null;
  } catch {
    // L'errore include il corpo non JSON.
  }
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} — ${body.slice(0, 400)}`);
  }
  return json;
}

async function supabaseRequest(path, options = {}) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      'Servono SUPABASE_URL/VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY per leggere il roster.',
    );
  }
  const response = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers ?? {}),
    },
    signal: AbortSignal.timeout(30_000),
  });
  const body = await response.text();
  let json = null;
  try {
    json = body ? JSON.parse(body) : null;
  } catch {
    // L'errore include il corpo raw.
  }
  if (!response.ok) {
    throw new Error(`Supabase REST ${response.status} ${response.statusText} — ${body.slice(0, 500)}`);
  }
  return json;
}

async function downloadAndExtractPdf(url, key) {
  if (!url) throw new Error('URL PDF assente.');
  await mkdir(TMP_DIR, { recursive: true });
  const pdfPath = join(TMP_DIR, `${key}.pdf`);
  const txtPath = join(TMP_DIR, `${key}.txt`);
  const response = await fetch(url, {
    headers: { Accept: 'application/pdf', 'User-Agent': 'Mozilla/5.0' },
    signal: AbortSignal.timeout(45_000),
  });
  if (!response.ok) throw new Error(`PDF ${response.status} ${response.statusText}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length === 0) throw new Error('PDF vuoto.');
  await writeFile(pdfPath, bytes);
  const extracted = spawnSync('pdftotext', ['-layout', pdfPath, txtPath], {
    encoding: 'utf8',
    maxBuffer: 4 * 1024 * 1024,
  });
  if (extracted.error) throw extracted.error;
  if (extracted.status !== 0) {
    throw new Error(`pdftotext exit ${extracted.status}: ${extracted.stderr ?? ''}`);
  }
  return { text: await readFile(txtPath, 'utf8'), sourceUrl: url };
}

function filesFromDescriptor(descriptor) {
  const files = descriptor?.session_files ?? descriptor?.sessionFiles ?? {};
  const getUrl = (...keys) => {
    for (const key of keys) {
      const value = files[key] ?? files[key.replace(/_([a-z])/g, (_, c) => c.toUpperCase())];
      if (typeof value === 'string') return value;
      if (value?.url) return value.url;
    }
    return null;
  };
  return {
    classification: getUrl('classification'),
    qualifyingResults: getUrl('qualifying_results', 'combined_classification', 'qualifyingResults'),
  };
}

function sessionNumber(source) {
  const value = Number(firstValue(source.number, source.sessionNumber, source.order, source.sequence));
  return Number.isFinite(value) ? value : null;
}

function sessionType(source) {
  return String(firstValue(source.type, source.session_type, source.sessionType, '')).toUpperCase();
}

function eventId(source) {
  return textValue(firstValue(source.id, source.uuid, source.eventUuid));
}

function sessionId(source) {
  return textValue(firstValue(source.id, source.uuid, source.sessionUuid));
}

function descriptorFilesFor(source, descriptor) {
  return { ...filesFromDescriptor(descriptor), apiSessionId: sessionId(source) };
}

function statusFromValue(value, sectionName, hasPosition) {
  const raw = normalizeText(value);
  if (raw.includes('DISQUAL')) return 'DSQ';
  if (raw.includes('DID NOT START') || raw === 'DNS') return 'DNS';
  if (raw.includes('DID NOT FINISH') || raw === 'DNF' || raw === 'RETIRED') return 'DNF';
  if (sectionName === 'NOT CLASSIFIED' || raw === 'NOT CLASSIFIED' || raw === 'NC') {
    return 'NOT_CLASSIFIED';
  }
  return hasPosition ? 'CLASSIFIED' : null;
}

function timeToken(value) {
  return value.match(/(?:\d+:\d{1,2}:\d+(?:\.\d+)?|\d+'\d+\.\d+|\d+\.\d+)/)?.[0] ?? null;
}

function gapToken(value, totalTime) {
  const after = totalTime ? value.slice(value.indexOf(totalTime) + totalTime.length) : value;
  const match = after.match(/(?:\+\s*)?(\d+\.\d{3})/);
  return match ? `+${match[1]}` : null;
}

function riderNameForLine(line, riders, riderNumber) {
  const byNumber = riders.filter(row => Number(row.number) === Number(riderNumber));
  const candidates = byNumber.length > 0 ? byNumber : riders;
  const normalizedLine = normalizeText(line);
  const fullMatches = candidates.filter(row => {
    const full = normalizeText(`${row.name ?? ''} ${row.surname ?? ''}`);
    return full && normalizedLine.includes(full);
  });
  if (fullMatches.length === 1) return fullMatches[0];
  return null;
}

function parsePdfRows(text, riders, sourceUrl, context) {
  const rows = [];
  let sectionName = '';
  const lines = text.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.replace(/\u00a0/g, ' ');
    const upper = normalizeText(line);
    if (upper.includes('NOT CLASSIFIED')) sectionName = 'NOT CLASSIFIED';
    if (upper.includes('CLASSIFICATION') || upper.includes('QUALIFYING RESULTS')) {
      // Non azzerare NOT CLASSIFIED: la sezione può comparire dopo l'intestazione.
      if (!upper.includes('NOT CLASSIFIED')) sectionName = '';
    }

    const start = line.match(
      /^\s*(\d{1,3}|NC|DNF|DNS|DSQ)\s+(?:(\d{1,3})\s+)?(?:(\d{1,3})\s+)?(.+)$/i,
    );
    if (!start) continue;
    const first = start[1].toUpperCase();
    const hasRaceColumns =
      context.type !== 'Q' &&
      /^\d+$/.test(first) &&
      Boolean(start[3]) &&
      Number(first) <= 30 &&
      Number(start[2]) <= 30;
    const hasPosition = /^\d+$/.test(first) && Boolean(start[2]) && !hasRaceColumns;
    const position = hasRaceColumns ? Number(first) : hasPosition ? Number(first) : null;
    const riderNumber = Number(
      hasRaceColumns ? start[3] : hasPosition ? start[2] : first,
    );
    if (!Number.isFinite(riderNumber)) continue;

    const rider = riderNameForLine(line, riders, riderNumber);
    if (!rider) {
      // Solo le righe che assomigliano a una riga dati contano come non interpretate.
      if (/\b(?:[A-Z]{3})\b/.test(start[3]) || /(?:\d+'\d+\.\d+|\d+:\d+:\d+)/.test(line)) {
        counters.riderNotFound += 1;
        details.riderNotFound.push({
          ...context,
          rider_number: riderNumber,
          line: line.trim(),
        });
        counters.unparsedRows += 1;
        details.unparsedRows.push({ ...context, line: line.trim() });
      }
      continue;
    }

    const totalTime = timeToken(line);
    const explicitStatus = line.match(/\b(?:DNF|DNS|DSQ|NC|NOT CLASSIFIED|RETIRED)\b/i)?.[0] ?? first;
    const status = statusFromValue(explicitStatus, sectionName, position !== null);
    const pointsMatch = hasRaceColumns
      ? { 1: start[2] }
      : line.match(/(?:^|\s)(\d+(?:\.\d+)?)\s*(?:pts?|points?)?\s*$/i);
    const points = context.type === 'Q'
      ? null
      : pointsMatch
        ? Number(pointsMatch[1])
        : null;
    rows.push({
      session_id: context.sessionId,
      rider_id: rider.id,
      rider_number: Number.isFinite(Number(rider.number)) ? Number(rider.number) : riderNumber,
      position,
      points,
      total_time: totalTime,
      gap: gapToken(line, totalTime),
      average_speed: null,
      status: status ?? (position === null ? 'NOT_CLASSIFIED' : 'CLASSIFIED'),
      source_url: sourceUrl,
    });
  }
  return rows;
}

function mergeRows(rows) {
  const result = [];
  const seen = new Set();
  for (const row of rows) {
    const key = `${row.session_id}:${row.rider_id}`;
    if (seen.has(key)) {
      counters.duplicates += 1;
      continue;
    }
    seen.add(key);
    result.push(row);
  }
  return result;
}

function validateRows(rows, expectedSessionIds) {
  const ids = new Set(expectedSessionIds);
  for (const row of rows) {
    if (!ids.has(row.session_id) || !row.rider_id) {
      counters.orphanResults += 1;
      details.orphanResults.push(row);
    }
  }
  for (const [sessionIdValue, sessionRows] of Map.groupBy(rows, row => row.session_id)) {
    const positions = new Set();
    for (const row of sessionRows) {
      if (row.position === null || row.status !== 'CLASSIFIED') continue;
      if (positions.has(row.position)) {
        counters.duplicatePositions += 1;
        details.duplicatePositions.push({ session_id: sessionIdValue, position: row.position });
      }
      positions.add(row.position);
    }
  }
}

function criticalErrors(expected) {
  const errors = [];
  if (expected.gpCount !== 22) errors.push(`GP elaborati ${expected.gpCount}/22.`);
  for (const type of ['Q', 'SPR', 'RAC']) {
    if (expected.sessionCounts[type] !== 22) {
      errors.push(`${type}: ${expected.sessionCounts[type]}/22 sessioni.`);
    }
  }
  if (counters.missingPdf) errors.push(`PDF mancanti: ${counters.missingPdf}.`);
  if (counters.unreadablePdf) errors.push(`PDF non leggibili: ${counters.unreadablePdf}.`);
  if (counters.riderNotFound) errors.push(`Rider non trovati: ${counters.riderNotFound}.`);
  if (counters.unparsedRows) errors.push(`Righe non interpretate: ${counters.unparsedRows}.`);
  if (counters.duplicates) errors.push(`Risultati duplicati: ${counters.duplicates}.`);
  if (counters.duplicatePositions) errors.push(`Posizioni duplicate: ${counters.duplicatePositions}.`);
  if (counters.missingSessions) errors.push(`Sessioni mancanti: ${counters.missingSessions}.`);
  if (counters.orphanResults) errors.push(`Risultati orfani: ${counters.orphanResults}.`);
  return errors;
}

async function upsertRows(rows) {
  if (rows.length === 0) return;
  await supabaseRequest('/session_results?on_conflict=session_id%2Crider_id', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(rows),
  });
}

async function verifyStoredRows(rows) {
  const sessionIds = [...new Set(rows.map(row => row.session_id))];
  const stored = [];
  for (let index = 0; index < sessionIds.length; index += 50) {
    const batch = sessionIds.slice(index, index + 50);
    const query = batch.map(id => encodeURIComponent(id)).join(',');
    const data = await supabaseRequest(`/session_results?session_id=in.(${query})&select=session_id,rider_id`);
    stored.push(...listFrom(data, []));
  }
  const expected = new Set(rows.map(row => `${row.session_id}:${row.rider_id}`));
  const actual = new Set(stored.map(row => `${row.session_id}:${row.rider_id}`));
  const missing = [...expected].filter(key => !actual.has(key));
  return { stored, missing };
}

try {
  console.log(IMPORT_MODE
    ? '\nModalità import: verranno scritti solo dati dopo tutte le validazioni.'
    : '\nModalità dry-run: nessuna scrittura Supabase. Aggiungi --import per importare.');
  await mkdir(TMP_DIR, { recursive: true });

  section('0 · DATI SUPABASE');
  const grandPrixRows = listFrom(
    await supabaseRequest(
      `/grand_prix?season_id=eq.${encodeURIComponent(SEASON_ID)}&is_test=eq.false&select=id,name,short_name,country,circuit,date_start,date_end&order=date_start.asc`,
    ),
    [],
  );
  const dbSessions = listFrom(
    await supabaseRequest(
      `/sessions?select=id,grand_prix_id,type,status,session_date,number&order=session_date.asc`,
    ),
    [],
  ).filter(row => grandPrixRows.some(gp => gp.id === row.grand_prix_id));
  const riders = listFrom(
    await supabaseRequest('/riders?select=id,name,surname,nickname'),
    [],
  );
  const riderSeasons = listFrom(
    await supabaseRequest(
      `/rider_seasons?season_id=eq.${encodeURIComponent(SEASON_ID)}&select=rider_id,number`,
    ),
    [],
  );
  const seasonRiders = riders.map(rider => ({
    ...rider,
    number: riderSeasons.find(row => row.rider_id === rider.id)?.number ?? null,
  }));
  console.log(`GP reali in Supabase: ${grandPrixRows.length}`);
  console.log(`Sessioni candidate: ${dbSessions.length}`);
  console.log(`Piloti disponibili per matching: ${seasonRiders.length}`);

  section('1 · EVENTI E SESSIONI API');
  const eventMap = new Map();
  for (const finished of ['false', 'true']) {
    try {
      const payload = await apiGet(
        `/results/events?seasonUuid=${SEASON_ID}&isFinished=${finished}`,
      );
      for (const event of listFrom(payload, ['events', 'items', 'results'])) {
        const id = eventId(event);
        if (id) eventMap.set(id, event);
      }
    } catch (error) {
      details.requestFailures.push(`eventi ${finished}: ${error.message}`);
    }
  }

  const gpById = new Map(grandPrixRows.map(row => [row.id, row]));
  const allResults = [];
  const sessionCounts = { Q: 0, SPR: 0, RAC: 0 };
  const resultCounts = { Q: 0, SPR: 0, RAC: 0 };
  const reportRows = [];

  for (const [gpIndex, gp] of grandPrixRows.entries()) {
    const event = eventMap.get(gp.id);
    const dbForGp = dbSessions.filter(row => row.grand_prix_id === gp.id);
    const apiSessions = event
      ? listFrom(
          await apiGet(
            `/results/sessions?eventUuid=${encodeURIComponent(gp.id)}&categoryUuid=${RESULTS_CATEGORY_ID}`,
          ),
          ['sessions', 'items', 'results'],
        )
      : [];
    const candidates = {
      Q: apiSessions.filter(row => sessionType(row) === 'Q')
        .sort((a, b) => (sessionNumber(a) ?? 0) - (sessionNumber(b) ?? 0)),
      SPR: apiSessions.filter(row => sessionType(row) === 'SPR'),
      RAC: apiSessions.filter(row => sessionType(row) === 'RAC'),
    };
    const selected = {};
    const gpReport = { name: gp.name, sessions: {}, results: {} };

    for (const type of ['Q', 'SPR', 'RAC']) {
      const dbCandidates = dbForGp.filter(row => row.type === type);
      const dbSession = dbCandidates.sort((a, b) => Number(b.number ?? 0) - Number(a.number ?? 0))[0];
      if (!dbSession || candidates[type].length === 0) {
        counters.missingSessions += 1;
        details.missingSessions.push({ gp: gp.name, type, db: Boolean(dbSession), api: candidates[type].length });
        gpReport.sessions[type] = 'MANCANTE';
        continue;
      }
      const apiSession = type === 'Q'
        ? candidates[type].at(-1)
        : candidates[type][0];
      const descriptor = await apiGet(`/results/sessions/${sessionId(apiSession)}`);
      const files = descriptorFilesFor(apiSession, descriptor);
      const pdfUrl = type === 'Q' ? files.qualifyingResults : files.classification;
      if (!pdfUrl) {
        counters.missingPdf += 1;
        details.missingPdf.push({ gp: gp.name, type, session_id: dbSession.id });
        gpReport.sessions[type] = 'PDF ASSENTE';
        continue;
      }
      let extracted;
      try {
        extracted = await downloadAndExtractPdf(
          pdfUrl,
          `${String(gpIndex + 1).padStart(2, '0')}-${type.toLowerCase()}-${dbSession.id}`,
        );
      } catch (error) {
        counters.unreadablePdf += 1;
        details.unreadablePdf.push({ gp: gp.name, type, error: error.message });
        gpReport.sessions[type] = 'PDF NON LEGGIBILE';
        continue;
      }
      const parsed = parsePdfRows(extracted.text, seasonRiders, extracted.sourceUrl, {
        gp: gp.name,
        type,
        sessionId: dbSession.id,
      });
      const rows = mergeRows(parsed);
      if (type === 'Q' && files.classification) {
        // Il PDF QualifyingResults è la classifica finale. La Classification Q2
        // viene scaricata separatamente solo per mantenere la fonte pole.
        try {
          const polePdf = await downloadAndExtractPdf(
            files.classification,
            `${String(gpIndex + 1).padStart(2, '0')}-q2-pole-${dbSession.id}`,
          );
          const poleRows = parsePdfRows(polePdf.text, seasonRiders, polePdf.sourceUrl, {
            gp: gp.name,
            type,
            sessionId: dbSession.id,
          });
          const pole = poleRows.find(row => row.position === 1);
          if (pole) {
            const target = rows.find(row => row.rider_id === pole.rider_id);
            if (target) target.total_time = pole.total_time;
          }
        } catch (error) {
          counters.unreadablePdf += 1;
          details.unreadablePdf.push({ gp: gp.name, type: 'Q2 pole', error: error.message });
        }
      }
      selected[type] = dbSession.id;
      sessionCounts[type] += 1;
      resultCounts[type] += rows.length;
      allResults.push(...rows);
      gpReport.sessions[type] = dbSession.id;
      gpReport.results[type] = rows.length;
    }
    reportRows.push(gpReport);
    console.log(
      `${String(gpIndex + 1).padStart(2, '0')} · ${gp.name ?? gp.id} | ` +
      `Q ${gpReport.results.Q ?? 0} | SPR ${gpReport.results.SPR ?? 0} | RAC ${gpReport.results.RAC ?? 0}`,
    );
  }

  validateRows(allResults, dbSessions.map(row => row.id));
  const expected = {
    gpCount: grandPrixRows.length,
    sessionCounts,
  };
  const errors = criticalErrors(expected);
  counters.criticalErrors = errors.length;

  section('IMPORT RISULTATI MOTOGP 2026');
  console.log(`GP elaborati: ${grandPrixRows.length} / 22`);
  for (const type of ['Q', 'SPR', 'RAC']) {
    console.log(`${type === 'Q' ? 'QUALIFICHE' : type === 'SPR' ? 'SPRINT' : 'GARA'}`);
    console.log(`sessioni: ${sessionCounts[type]} / 22`);
    console.log(`risultati: ${resultCounts[type]}`);
  }
  section('VALIDAZIONI');
  console.log(`PDF mancanti: ${counters.missingPdf}`);
  console.log(`PDF non leggibili: ${counters.unreadablePdf}`);
  console.log(`rider non trovati: ${counters.riderNotFound}`);
  console.log(`righe non interpretate: ${counters.unparsedRows}`);
  console.log(`duplicati: ${counters.duplicates}`);
  console.log(`posizioni duplicate: ${counters.duplicatePositions}`);
  console.log(`sessioni mancanti: ${counters.missingSessions}`);
  console.log(`risultati orfani: ${counters.orphanResults}`);
  console.log(`errori critici: ${counters.criticalErrors}`);

  if (details.missingPdf.length) console.log('\nPDF mancanti:', JSON.stringify(details.missingPdf, null, 2));
  if (details.unreadablePdf.length) console.log('\nPDF non leggibili:', JSON.stringify(details.unreadablePdf, null, 2));
  if (details.riderNotFound.length) console.log('\nRider non trovati:', JSON.stringify(details.riderNotFound, null, 2));
  if (details.unparsedRows.length) console.log('\nRighe non interpretate:', JSON.stringify(details.unparsedRows.slice(0, 30), null, 2));
  if (details.missingSessions.length) console.log('\nSessioni mancanti:', JSON.stringify(details.missingSessions, null, 2));

  if (errors.length > 0) {
    errors.forEach(error => console.error(`✗ ${error}`));
    throw new Error('Validazioni bloccanti fallite: nessuna scrittura eseguita.');
  }

  if (!IMPORT_MODE) {
    console.log('\nScritture Supabase: NESSUNA');
    console.log(`Risultati pronti per l’import: ${allResults.length}`);
  } else {
    section('SCRITTURA SUPABASE');
    await upsertRows(allResults);
    console.log(`UPSERT completato: ${allResults.length} risultati.`);
    const verification = await verifyStoredRows(allResults);
    if (verification.missing.length > 0) {
      throw new Error(`Verifica post-import fallita: ${verification.missing.length} risultati mancanti.`);
    }
    console.log(`Verifica post-import: ${verification.stored.length} righe rileggibili.`);
    console.log('Import risultati completato senza cancellazioni.');
  }
} catch (error) {
  console.error('\n✗ Import risultati fallito:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
}