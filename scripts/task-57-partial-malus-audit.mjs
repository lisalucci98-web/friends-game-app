/**
 * Task 57 — audit read-only del malus Gara sulle prediction partial.
 *
 * Il report Task 38 è la sorgente dell'elenco partial. Questo script legge
 * soltanto predictions, prediction_entries, sessions e session_results:
 * non espone un metodo PATCH, non invoca RPC e non modifica Supabase.
 *
 * Il "totale atteso" è esclusivamente il totale DB ricalcolato sostituendo
 * il solo malus DB con quello ricavato dagli entry RACE e dalla sessione RAC.
 * Non è un nuovo punteggio storico autorizzato: tutte le prediction partial
 * restano fuori da qualsiasi apply finché manca l'autorizzazione completa.
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

import { auditRaceMalus } from './historical-scoring-spec.mjs';

export const INPUT_REPORT = '.agents/outputs/task-38-excel-db-mapping.md';
export const OUTPUT_REPORT = '.agents/outputs/task-57-partial-malus-audit.md';
export const SEASON_YEAR = 2026;
export const LEAGUE_CODE = 'TEST01';

const PARTIAL_SECTION = '## Prediction partial escluse';
const EXTRA_SECTION = '## Prediction extra fuori dalla sorgente storica';
const CLOSED_SESSION_STATUSES = new Set([
  'FINISHED',
  'COMPLETED',
  'CLASSIFIED',
  'CLOSED',
]);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PREDICTION_FIELDS = [
  'qualifying_points',
  'sprint_points',
  'race_points',
  'bonus_points',
  'malus_points',
  'total_points',
];

function display(value) {
  return value === null || value === undefined || value === '' ? '—' : String(value);
}

function md(value) {
  return display(value).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

export function mdTable(headers, rows) {
  return [
    `|${headers.join('|')}|`,
    `|${headers.map(() => '---').join('|')}|`,
    ...rows.map((row) => `|${row.map(md).join('|')}|`),
  ].join('\n');
}

function safeUuid(value, label) {
  if (!UUID_RE.test(value)) throw new Error(`${label} non è un UUID valido.`);
  return value;
}

function strictNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseMarkdownTableRows(text) {
  return String(text)
    .split('\n')
    .filter((line) => /^\|/.test(line) && !/^\|---/.test(line))
    .map((line) => line.slice(1, line.endsWith('|') ? -1 : undefined)
      .split('|').map((cell) => cell.trim()))
    .filter((cells) => cells.length > 1);
}

/**
 * Legge solo la tabella delle partial del report autorizzativo Task 38.
 * Il conteggio atteso evita di auditare accidentalmente un report troncato.
 */
export function parsePartialRows(markdown) {
  const partialStart = markdown.indexOf(PARTIAL_SECTION);
  const extraStart = markdown.indexOf(EXTRA_SECTION);
  if (partialStart < 0 || extraStart < 0 || extraStart <= partialStart) {
    throw new Error('Sezione partial o delimitatore extra mancanti nel report Task 38.');
  }

  const rows = parseMarkdownTableRows(markdown.slice(partialStart, extraStart))
    .filter((cells) => cells.length >= 4 && UUID_RE.test(cells[2]))
    .map((cells) => ({
      user: cells[0],
      gp: cells[1],
      predictionId: safeUuid(cells[2], 'Partial prediction ID'),
      missing: cells[3] === '—' ? [] : cells[3].split(',').map((item) => item.trim()),
    }));

  if (rows.length !== 30) {
    throw new Error(`Il report Task 38 contiene ${rows.length} partial, attese 30.`);
  }
  if (new Set(rows.map((row) => row.predictionId)).size !== rows.length) {
    throw new Error('Il report Task 38 contiene prediction partial duplicate.');
  }
  return rows;
}

/**
 * Client volutamente limitato alle GET. L'assenza di patch() è una garanzia
 * strutturale del fatto che questo audit non può eseguire PATCH.
 */
export function createReadOnlyClient() {
  const url = (process.env.VITE_SUPABASE_URL ?? '').replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  if (!url || !key) throw new Error('Servono VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.');

  async function get(path) {
    const response = await fetch(`${url}${path}`, {
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
      // L'errore conserva solo lo status; nessun header o segreto viene stampato.
    }
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}: ${String(text).slice(0, 300)}`);
    }
    return json;
  }

  return { get };
}

async function getChunks(client, ids, pathForIds) {
  const result = [];
  for (let index = 0; index < ids.length; index += 80) {
    result.push(...await client.get(pathForIds(ids.slice(index, index + 80))));
  }
  return result;
}

function predictionSelect() {
  return ['id', 'user_id', 'grand_prix_id', ...PREDICTION_FIELDS].join(',');
}

function entrySelect() {
  return ['id', 'prediction_id', 'prediction_type', 'position', 'rider_id', 'points'].join(',');
}

async function loadSnapshot(client, leagueId) {
  const predictions = await client.get(
    `/rest/v1/predictions?league_id=eq.${leagueId}&select=${predictionSelect()}`,
  );
  const entries = await getChunks(
    client,
    predictions.map((prediction) => prediction.id),
    (ids) => `/rest/v1/prediction_entries?prediction_id=in.(${ids.join(',')})`
      + `&select=${entrySelect()}`,
  );
  const grandPrixIds = [...new Set(
    predictions.map((prediction) => prediction.grand_prix_id).filter(Boolean),
  )];
  if (!grandPrixIds.length) {
    return { predictions, entries, raceSessions: [], raceResults: [] };
  }
  const raceSessions = await client.get(
    `/rest/v1/sessions?grand_prix_id=in.(${grandPrixIds.join(',')})`
      + '&type=eq.RAC&select=id,grand_prix_id,type,status,session_date,number',
  );
  const raceSessionIds = raceSessions.map((session) => session.id);
  const raceResults = raceSessionIds.length
    ? await getChunks(
      client,
      raceSessionIds,
      (ids) => `/rest/v1/session_results?session_id=in.(${ids.join(',')})`
        + '&select=id,session_id,rider_id,position,status',
    )
    : [];
  return { predictions, entries, raceSessions, raceResults };
}

function mapById(rows) {
  return new Map(rows.map((row) => [row.id, row]));
}

function resultsBySession(rows) {
  const grouped = new Map();
  for (const row of rows) {
    const current = grouped.get(row.session_id) ?? [];
    current.push(row);
    grouped.set(row.session_id, current);
  }
  return grouped;
}

export function chooseOfficialRaceSession(sessions, groupedResults, grandPrixId) {
  return sessions
    .filter((session) => (
      session.grand_prix_id === grandPrixId
      && session.type === 'RAC'
      && CLOSED_SESSION_STATUSES.has(String(session.status ?? '').toUpperCase())
    ))
    .map((session) => ({
      session,
      results: groupedResults.get(session.id) ?? [],
    }))
    .filter(({ results }) => results.length > 0)
    .sort((left, right) => {
      if (right.results.length !== left.results.length) {
        return right.results.length - left.results.length;
      }
      return String(right.session.session_date ?? '')
        .localeCompare(String(left.session.session_date ?? ''));
    })[0] ?? null;
}

function raceEntriesForPrediction(entries, predictionId) {
  return entries.filter((entry) => (
    entry.prediction_id === predictionId && entry.prediction_type === 'RACE'
  ));
}

function expectedTotalAfterMalus(prediction, expectedMalus) {
  const nonMalusFields = [
    'qualifying_points',
    'sprint_points',
    'race_points',
    'bonus_points',
  ];
  const values = nonMalusFields.map((field) => strictNumber(prediction[field]));
  return values.every((value) => value !== null)
    ? values.reduce((total, value) => total + value, 0) + expectedMalus
    : null;
}

export function auditPartialRows(partialRows, snapshot) {
  const predictionsById = mapById(snapshot.predictions);
  const groupedResults = resultsBySession(snapshot.raceResults ?? []);
  const rows = [];

  for (const partial of partialRows) {
    const prediction = predictionsById.get(partial.predictionId);
    if (!prediction) {
      rows.push({
        ...partial,
        status: 'BLOCKED',
        reason: 'prediction-missing',
        raceEntryCount: null,
        ncCount: null,
        ncRiderIds: [],
        expectedMalus: null,
        dbMalus: null,
        dbTotal: null,
        expectedTotal: null,
        sessionId: null,
      });
      continue;
    }

    const officialSession = chooseOfficialRaceSession(
      snapshot.raceSessions ?? [],
      groupedResults,
      prediction.grand_prix_id,
    );
    const raceEntries = raceEntriesForPrediction(snapshot.entries, partial.predictionId);
    if (!officialSession) {
      rows.push({
        ...partial,
        status: 'BLOCKED',
        reason: 'official-RAC-missing',
        raceEntryCount: raceEntries.length,
        ncCount: null,
        ncRiderIds: [],
        expectedMalus: null,
        dbMalus: strictNumber(prediction.malus_points),
        dbTotal: strictNumber(prediction.total_points),
        expectedTotal: null,
        sessionId: null,
      });
      continue;
    }

    const audit = auditRaceMalus(raceEntries, officialSession.results);
    const dbMalus = strictNumber(prediction.malus_points);
    const dbTotal = strictNumber(prediction.total_points);
    const expectedTotal = expectedTotalAfterMalus(prediction, audit.expectedMalus);
    const status = raceEntries.length === 5 ? 'AUDITABLE' : 'INCOMPLETE_RACE';
    rows.push({
      ...partial,
      status,
      reason: raceEntries.length === 5
        ? 'cinque entry RACE confrontate con sessione RAC ufficiale'
        : `entry RACE presenti: ${raceEntries.length}/5; malus calcolato solo sugli entry disponibili`,
      raceEntryCount: raceEntries.length,
      ncCount: audit.ncCount,
      ncRiderIds: audit.ncRiderIds,
      expectedMalus: audit.expectedMalus,
      dbMalus,
      dbTotal,
      expectedTotal,
      malusDelta: dbMalus === null ? null : audit.expectedMalus - dbMalus,
      sessionId: officialSession.session.id,
    });
  }
  return rows;
}

function divergentRows(rows) {
  return rows.filter((row) => (
    row.expectedMalus !== null
    && row.dbMalus !== null
    && row.expectedMalus !== row.dbMalus
  ));
}

export function buildReport({ partialRows, auditRows, generatedAt }) {
  const blockedRows = auditRows.filter((row) => row.status === 'BLOCKED');
  const auditableRows = auditRows.filter((row) => row.status === 'AUDITABLE');
  const incompleteRaceRows = auditRows.filter((row) => row.status === 'INCOMPLETE_RACE');
  const divergences = divergentRows(auditRows);
  const totalRows = auditRows.filter((row) => row.expectedTotal !== null);
  const tableRows = auditRows.map((row) => [
    row.user,
    row.gp,
    row.predictionId,
    row.raceEntryCount ?? '—',
    row.ncCount ?? '—',
    row.expectedMalus ?? '—',
    row.dbMalus ?? '—',
    row.dbTotal ?? '—',
    row.expectedTotal ?? '—',
    row.status,
  ]);
  const detailRows = auditRows.map((row) => [
    row.predictionId,
    row.sessionId ?? '—',
    row.ncRiderIds.length ? row.ncRiderIds.join(', ') : '—',
    row.malusDelta ?? '—',
    row.reason,
  ]);

  return [
    '# Task 57 — Audit read-only malus Gara delle prediction partial',
    '',
    `- Data/ora audit: **${generatedAt}**`,
    `- Fonte elenco partial: **${INPUT_REPORT}**`,
    `- Lega: **FantaTest (${LEAGUE_CODE})**`,
    '- Modalità: **GET-only**.',
    '- PATCH Supabase eseguite: **0**.',
    '- RPC di scoring invocate: **0**.',
    '',
    '## Gate storico',
    '',
    '**BLOCCATO — nessuna prediction partial è candidata a modifica.**',
    '',
    'Questo audit rende visibile un eventuale malus Gara già calcolabile, ma non '
      + 'autorizza la correzione del malus né del totale. Le prediction partial '
      + 'restano invariate finché non esiste un’autorizzazione storica completa '
      + '(fixture, entry e aggregati verificabili).',
    '',
    '## Riepilogo',
    '',
    `- Prediction partial lette dal report: **${partialRows.length}**.`,
    `- Prediction con 5 entry RACE auditabili: **${auditableRows.length}**.`,
    `- Prediction con RACE incompleta: **${incompleteRaceRows.length}**.`,
    `- Prediction senza record DB o sessione RAC ufficiale: **${blockedRows.length}**.`,
    `- Malus DB divergenti dal malus atteso: **${divergences.length}**.`,
    `- Totali attesi calcolabili come sola sostituzione del malus: **${totalRows.length}**.`,
    '',
    'Il totale atteso è `qualifying_points + sprint_points + race_points + '
      + 'bonus_points + malus atteso`. È una diagnostica del delta malus, non il '
      + 'punteggio storico autorizzato della prediction partial.',
    '',
    '## Audit per prediction partial',
    '',
    mdTable([
      'Utente',
      'GP',
      'Prediction ID',
      'Entry RACE',
      'NC',
      'Malus atteso',
      'Malus DB',
      'Totale DB',
      'Totale atteso',
      'Stato',
    ], tableRows),
    '',
    '## Dettaglio NC e differenze',
    '',
    mdTable([
      'Prediction ID',
      'Sessione RAC',
      'Rider NC intersecati',
      'Delta malus atteso - DB',
      'Nota',
    ], detailRows),
    '',
    '## Regole applicate',
    '',
    '- NC = intersezione tra i rider degli entry `RACE` presenti nelle posizioni 1–5 '
      + 'e i rider con stato NC/OUT nella sessione ufficiale `RAC` chiusa.',
    '- Soglie cumulative: 0 NC = 0; 1–2 NC = -1; 3–4 NC = -5; 5 NC = -10.',
    '- Una prediction con cinque entry `RACE` può quindi avere un malus auditabile '
      + 'anche se mancano Sprint, Pole o Qualifying Time.',
    '- Gli entry RACE mancanti non vengono inventati e non vengono conteggiati come NC.',
    '',
    '## Verifica di sicurezza',
    '',
    '- Nessuna PATCH eseguita: **PASS**.',
    '- Nessun aggregato scritto: **PASS**.',
    '- Nessuna prediction partial modificata: **PASS**.',
    '- Il blocco dell’apply storico resta esplicito: **PASS**.',
    '',
  ].join('\n');
}

async function main() {
  const markdown = await readFile(INPUT_REPORT, 'utf8');
  const partialRows = parsePartialRows(markdown);
  const client = createReadOnlyClient();
  const [seasons, leagues] = await Promise.all([
    client.get(`/rest/v1/seasons?year=eq.${SEASON_YEAR}&select=id,year`),
    client.get(`/rest/v1/leagues?invite_code=eq.${LEAGUE_CODE}&select=id,name,invite_code`),
  ]);
  if (seasons.length !== 1 || leagues.length !== 1) {
    throw new Error('Stagione o lega TEST01 non univoca.');
  }

  const snapshot = await loadSnapshot(client, safeUuid(leagues[0].id, 'League ID'));
  const auditRows = auditPartialRows(partialRows, snapshot);
  const report = buildReport({
    partialRows,
    auditRows,
    generatedAt: new Date().toISOString(),
  });
  await mkdir('.agents/outputs', { recursive: true });
  await writeFile(OUTPUT_REPORT, `${report}\n`, 'utf8');

  const divergences = divergentRows(auditRows);
  console.log('TASK 57 AUDIT COMPLETATO');
  console.log(`Prediction partial: ${partialRows.length}`);
  console.log(`Entry RACE complete: ${auditRows.filter((row) => row.status === 'AUDITABLE').length}`);
  console.log(`Malus DB divergenti: ${divergences.length}`);
  console.log('PATCH Supabase: 0');
  console.log('Gate apply storico: BLOCCATO');
  console.log(`Report: ${OUTPUT_REPORT}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}