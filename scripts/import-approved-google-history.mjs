/**
 * Importa in Supabase soltanto lo storico Google esplicitamente approvato.
 *
 * Sicurezza:
 * - dry-run di default; le scritture richiedono --import;
 * - account risolto tramite TARGET_EMAIL senza riportare l'email nel report;
 * - mapping GP tramite codici espliciti e match univoco nel calendario app;
 * - UUID deterministici e upsert per rendere l'operazione idempotente;
 * - nessuna chiamata alle RPC di scoring e nessun ricalcolo dei punti.
 *
 * Uso:
 *   TARGET_EMAIL="..." node scripts/import-approved-google-history.mjs
 *   TARGET_EMAIL="..." node scripts/import-approved-google-history.mjs --import
 */

import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

const SOURCE_REPORT = '.agents/outputs/google-history-nikyturets.md';
const OUTPUT_REPORT = '.agents/outputs/google-history-import-final.md';
const SEASON_YEAR = 2026;
const SESSION_NAMES = ['Qualifica', 'Sprint', 'Gara'];
const TARGET_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const APPROVED_GP_CODES = new Map([
  ['Aragon', 'ARA'],
  ['Argentina', 'ARG'],
  ['Australia', 'AUS'],
  ['Austria', 'AUT'],
  ['Brasile', 'BRA'],
  ['Catalogna', 'CAT'],
  ['FRANCIA', 'FRA'],
  ['Germany', 'GER'],
  ['Giappone', 'JPN'],
  ['Indonesia', 'INA'],
  ['Italia', 'ITA'],
  ['Malesia', 'MAL'],
  ['Netherlands', 'NED'],
  ['Portogallo', 'POR'],
  ['QATAR', 'QAT'],
  ['Repubblica Ceca', 'CZE'],
  ['San Marino', 'RSM'],
  ['SPAGNA', 'SPA'],
  ['Thailandia', 'THA'],
  ['UK', 'GBR'],
  ['Ungheria', 'HUN'],
  ['USA', 'USA'],
  ['Valencia', 'VAL'],
]);

const EXPLICIT_EXCLUSIONS = new Map();

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
  ['f. aldeguer ', 'Fermin Aldeguer'],
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
  ['a. fernandez', 'Augusto Fernandez'],
  ['augusto fernandez', 'Augusto Fernandez'],
  ['j. zarco', 'Johann Zarco'],
  ['johann zarco', 'Johann Zarco'],
  ['f. quartararo', 'Fabio Quartararo'],
  ['fabio quartararo', 'Fabio Quartararo'],
]);

function parseArgs(argv) {
  const args = {
    importMode: false,
    source: SOURCE_REPORT,
    report: OUTPUT_REPORT,
    leagueId: '',
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--import') args.importMode = true;
    else if (argument === '--source') args.source = argv[++index] ?? '';
    else if (argument === '--report') args.report = argv[++index] ?? '';
    else if (argument === '--league-id') args.leagueId = argv[++index] ?? '';
    else if (argument === '--help' || argument === '-h') {
      console.log(`Import storico Google approvato

Uso:
  TARGET_EMAIL="..." node scripts/import-approved-google-history.mjs
  TARGET_EMAIL="..." node scripts/import-approved-google-history.mjs --import

Opzioni:
  --import              abilita le scritture; senza questa opzione è un dry-run
  --source <file.md>    report di ricostruzione sorgente
  --report <file.md>    report di mapping/import
  --league-id <uuid>    richiesto solo se l'utente appartiene a più leghe`);
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

function normalizeRider(value) {
  const normalized = RIDER_ALIASES.get(canonical(value));
  if (!normalized) throw new Error(`Pilota non normalizzato: ${value}`);
  return normalized;
}

function deterministicUuid(value) {
  const bytes = createHash('sha256').update(value).digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function poleTimeToSeconds(value) {
  const match = String(value).match(/^(\d{2}):(\d{2})\.(\d{3})$/);
  if (!match) throw new Error(`Tempo Pole non valido: ${value}`);
  return Number(match[1]) * 60 + Number(match[2]) + Number(match[3]) / 1000;
}

function parseSourceReport(markdown) {
  const records = [];
  for (const [googleGp] of APPROVED_GP_CODES) {
    const start = markdown.indexOf(`### ${googleGp}`);
    if (start < 0) throw new Error(`GP approvato assente dal report: ${googleGp}`);
    const next = markdown.indexOf('\n### ', start + 5);
    const block = markdown.slice(start, next < 0 ? markdown.length : next);
    const reconstruction = block.match(/Stato ricostruzione: \*\*(.+?)\*\*/)?.[1];
    const sourceDates = [...block.matchAll(
      /timestamp: (\d{1,2})\/(\d{1,2})\/(\d{4}) [^·\n]+/g,
    )].map((match) => `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`);
    const sourceYears = [...new Set(sourceDates.map((date) => Number(date.slice(0, 4))))];
    if (sourceDates.length !== 3 || sourceYears.length !== 1) {
      records.push({
        googleGp,
        sourceStatus: 'DATE_REVIEW',
        sourceDates,
        sourceYear: sourceYears.length === 1 ? sourceYears[0] : null,
        sessions: null,
      });
      continue;
    }
    if (reconstruction !== 'OK') {
      records.push({
        googleGp,
        sourceStatus: reconstruction ?? 'UNKNOWN',
        sourceDates,
        sourceYear: sourceYears[0],
        sessions: null,
      });
      continue;
    }

    const qualifying = block.match(
      /- Qualifica: \*\*OK\*\*[\s\S]*?- Pole: ([^;]+); Tempo: ([^;]+); Time Conversion: [^;]+; Score: (-?\d+)/,
    );
    const sprint = block.match(
      /- Sprint: \*\*OK\*\*[\s\S]*?- Top: ([^;]+); OUT: [^;]+; Score: (-?\d+)/,
    );
    const race = block.match(
      /- Gara: \*\*OK\*\*[\s\S]*?- Top: ([^;]+); OUT: ([^;]+); Score: (-?\d+)/,
    );
    const aggregate = [...block.matchAll(
      /HISTORICAL_SCORE riepilogo: Q=(\d+), Sprint=(\d+), Gara=(\d+), Totale=(\d+)/g,
    )].map((match) => match.slice(1).map(Number));
    const distinctAggregates = [...new Set(aggregate.map((scores) => scores.join('|')))];
    if (!qualifying || !sprint || !race || distinctAggregates.length !== 1) {
      records.push({
        googleGp,
        sourceStatus: 'REVIEW',
        sourceDates,
        sourceYear: sourceYears[0],
        sessions: null,
      });
      continue;
    }
    const scores = distinctAggregates[0].split('|').map(Number);
    const sessionScores = [Number(qualifying[3]), Number(sprint[2]), Number(race[3])];
    if (scores.some((score, index) => score !== [...sessionScores, scores[3]][index])) {
      records.push({
        googleGp,
        sourceStatus: 'SCORE_MISMATCH',
        sourceDates,
        sourceYear: sourceYears[0],
        sessions: null,
      });
      continue;
    }

    records.push({
      googleGp,
      sourceStatus: 'OK',
      sourceDates,
      sourceYear: sourceYears[0],
      sessions: {
        qualifying: {
          pole: normalizeRider(qualifying[1]),
          poleTime: qualifying[2],
          score: sessionScores[0],
        },
        sprint: {
          riders: sprint[1].split('/').map(normalizeRider),
          score: sessionScores[1],
        },
        race: {
          riders: race[1].split('/').map(normalizeRider),
          out: normalizeRider(race[2]),
          score: sessionScores[2],
        },
        total: scores[3],
      },
    });
  }
  return records;
}

function validateSourceRecord(record) {
  if (!record.sessions) return;
  if (record.sessions.sprint.riders.length !== 3) {
    throw new Error(`${record.googleGp}: Sprint non contiene esattamente 3 piloti`);
  }
  if (record.sessions.race.riders.length !== 5) {
    throw new Error(`${record.googleGp}: Gara non contiene esattamente 5 piloti`);
  }
  if (new Set(record.sessions.sprint.riders).size !== 3) {
    throw new Error(`${record.googleGp}: duplicato nella Sprint`);
  }
  if (new Set(record.sessions.race.riders).size !== 5) {
    throw new Error(`${record.googleGp}: duplicato nella Gara`);
  }
  if (record.sessions.race.riders.includes(record.sessions.race.out)) {
    throw new Error(`${record.googleGp}: pilota OUT presente nella Top 5`);
  }
  const sum = record.sessions.qualifying.score
    + record.sessions.sprint.score
    + record.sessions.race.score;
  if (sum !== record.sessions.total) {
    throw new Error(`${record.googleGp}: totale storico non coerente`);
  }
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
      // L'errore sotto include soltanto un estratto non sensibile.
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

async function resolveTargetUser(client, targetEmail) {
  const normalizedTarget = canonical(targetEmail).replace(/\s+/g, '');
  const { json } = await client.auth('/admin/users?page=1&per_page=1000');
  const users = Array.isArray(json?.users) ? json.users : [];
  const matches = users.filter(
    (user) => canonical(user.email).replace(/\s+/g, '') === normalizedTarget,
  );
  if (matches.length !== 1) {
    throw new Error(`Account target non univoco: trovati ${matches.length} account`);
  }
  const userId = matches[0].id;
  const { json: profiles } = await client.rest(
    `/profiles?user_id=eq.${encodeURIComponent(userId)}&select=id,user_id,name`,
  );
  if (!Array.isArray(profiles) || profiles.length !== 1) {
    throw new Error(`Profilo target non univoco: trovati ${profiles?.length ?? 0} profili`);
  }
  return { userId, profile: profiles[0] };
}

async function resolveLeague(client, userId, requestedLeagueId) {
  const { json: memberships } = await client.rest(
    `/league_members?user_id=eq.${encodeURIComponent(userId)}&select=league_id`,
  );
  const leagueIds = [...new Set((memberships ?? []).map((row) => row.league_id))];
  const selected = requestedLeagueId || (leagueIds.length === 1 ? leagueIds[0] : '');
  if (!selected || !leagueIds.includes(selected)) {
    throw new Error(
      `Lega target non univoca: trovate ${leagueIds.length} appartenenze; usare --league-id.`,
    );
  }
  const { json: leagues } = await client.rest(
    `/leagues?id=eq.${encodeURIComponent(selected)}&select=id,name`,
  );
  if (!Array.isArray(leagues) || leagues.length !== 1) {
    throw new Error('La lega target non esiste o non è univoca.');
  }
  return leagues[0];
}

async function loadAppData(client) {
  const { json: seasons } = await client.rest(
    `/seasons?year=eq.${SEASON_YEAR}&select=id,year`,
  );
  if (!Array.isArray(seasons) || seasons.length !== 1) {
    throw new Error(`Stagione ${SEASON_YEAR} non univoca.`);
  }
  const seasonId = seasons[0].id;
  const [{ json: grandPrix }, { json: riders }] = await Promise.all([
    client.rest(
      `/grand_prix?season_id=eq.${encodeURIComponent(seasonId)}&is_test=eq.false`
      + '&select=id,name,short_name,country,circuit,date_start,date_end&order=date_start.asc',
    ),
    client.rest('/riders?select=id,name,surname,nickname'),
  ]);
  return { seasonId, grandPrix, riders };
}

function mapGrandPrix(sourceRecords, grandPrix) {
  return sourceRecords.map((source) => {
    const code = APPROVED_GP_CODES.get(source.googleGp);
    const matches = grandPrix.filter((gp) => {
      if (canonical(gp.short_name) !== canonical(code)) return false;
      const start = new Date(`${gp.date_start.slice(0, 10)}T00:00:00Z`);
      const end = new Date(`${gp.date_end.slice(0, 10)}T23:59:59Z`);
      start.setUTCDate(start.getUTCDate() - 1);
      end.setUTCDate(end.getUTCDate() + 1);
      return source.sourceDates.every((date) => {
        const timestamp = new Date(`${date}T12:00:00Z`);
        return timestamp >= start && timestamp <= end;
      });
    });
    const explicitExclusion = EXPLICIT_EXCLUSIONS.get(source.googleGp);
    let status = 'MATCHED';
    let reason = '';
    if (explicitExclusion) {
      status = 'EXCLUDED';
      reason = explicitExclusion;
    } else if (source.sourceStatus !== 'OK') {
      status = 'EXCLUDED';
      reason = `sorgente ${source.sourceStatus}`;
    } else if (matches.length !== 1) {
      status = 'EXCLUDED';
      reason = matches.length === 0
        ? `nessun GP ${source.sourceYear} con date corrispondenti nell’app`
        : 'match GP non univoco';
    }
    const reportStatus = source.sourceStatus === 'AGGREGATE_CONFLICT'
      ? 'CONFLICT'
      : source.sourceStatus === 'PARTIAL'
        ? 'PARTIAL'
        : source.sourceStatus !== 'OK'
          ? 'REVIEW'
          : matches.length === 1
            ? 'PENDING'
            : matches.length === 0
              ? 'EXCLUDED'
              : 'REVIEW';
    return {
      ...source,
      code,
      appGp: matches.length === 1 ? matches[0] : null,
      matchCount: matches.length,
      status,
      reason,
      reportStatus,
    };
  });
}

function buildRiderMap(riders) {
  const byName = new Map();
  for (const rider of riders) {
    const name = canonical(`${rider.name ?? ''} ${rider.surname ?? ''}`);
    const list = byName.get(name) ?? [];
    list.push(rider);
    byName.set(name, list);
  }
  return byName;
}

function riderId(byName, fullName) {
  const matches = byName.get(canonical(fullName)) ?? [];
  if (matches.length !== 1) {
    throw new Error(`Match pilota non univoco per ${fullName}: ${matches.length}`);
  }
  return matches[0].id;
}

function buildRows(mapped, userId, leagueId, existingPredictions, riders) {
  const byNaturalKey = new Map();
  for (const prediction of existingPredictions) {
    const key = `${prediction.user_id}|${prediction.grand_prix_id}|${prediction.league_id}`;
    const list = byNaturalKey.get(key) ?? [];
    list.push(prediction);
    byNaturalKey.set(key, list);
  }
  const riderByName = buildRiderMap(riders);
  const predictions = [];
  const entries = [];
  const decisions = [];

  for (const item of mapped.filter((row) => row.status === 'MATCHED')) {
    const naturalKey = `${userId}|${item.appGp.id}|${leagueId}`;
    const existing = byNaturalKey.get(naturalKey) ?? [];
    if (existing.length > 1) {
      throw new Error(`${item.googleGp}: più pronostici esistenti per la stessa chiave naturale`);
    }
    const predictionId = deterministicUuid(`historical-prediction|${naturalKey}`);
    if (existing.length === 1 && existing[0].id !== predictionId) {
      throw new Error(
        `${item.googleGp}: pronostico preesistente non creato da questo import; operazione interrotta`,
      );
    }
    if (existing.length === 1) {
      decisions.push({
        ...item,
        importStatus: 'ALREADY_EXISTS',
        predictionId,
      });
      continue;
    }
    decisions.push({
      ...item,
      importStatus: 'NEW',
      predictionId,
    });
    const qualifyingTime = poleTimeToSeconds(item.sessions.qualifying.poleTime);
    predictions.push({
      id: predictionId,
      user_id: userId,
      grand_prix_id: item.appGp.id,
      league_id: leagueId,
      qualifying_pole_time: qualifyingTime,
      qualifying_points: item.sessions.qualifying.score,
      sprint_points: item.sessions.sprint.score,
      race_points: item.sessions.race.score,
      bonus_points: 0,
      malus_points: 0,
      total_points: item.sessions.total,
      scored_at: null,
    });

    const specs = [
      {
        prediction_type: 'QUALIFYING_TIME',
        position: null,
        rider_id: riderId(riderByName, item.sessions.qualifying.pole),
        predicted_time: qualifyingTime,
      },
      {
        prediction_type: 'POLE',
        position: null,
        rider_id: riderId(riderByName, item.sessions.qualifying.pole),
        predicted_time: null,
      },
      ...item.sessions.sprint.riders.map((name, index) => ({
        prediction_type: 'SPRINT',
        position: index + 1,
        rider_id: riderId(riderByName, name),
        predicted_time: null,
      })),
      ...item.sessions.race.riders.map((name, index) => ({
        prediction_type: 'RACE',
        position: index + 1,
        rider_id: riderId(riderByName, name),
        predicted_time: null,
      })),
      {
        prediction_type: 'RACE_OUT',
        position: null,
        rider_id: riderId(riderByName, item.sessions.race.out),
        predicted_time: null,
      },
    ];
    for (const spec of specs) {
      const slot = spec.position ?? 'none';
      entries.push({
        id: deterministicUuid(
          `historical-entry|${predictionId}|${spec.prediction_type}|${slot}`,
        ),
        prediction_id: predictionId,
        ...spec,
        points: 0,
      });
    }
  }
  return { predictions, entries, decisions };
}

async function countsFor(client, userId, predictionIds = []) {
  const encodedUserId = encodeURIComponent(userId);
  const allPredictions = await client.rest(
    `/predictions?user_id=eq.${encodedUserId}&select=id`,
    { headers: { Prefer: 'count=exact', Range: '0-0' } },
  );
  let importedEntries = { contentRange: '*/0' };
  if (predictionIds.length) {
    importedEntries = await client.rest(
      `/prediction_entries?prediction_id=in.(${predictionIds.join(',')})&select=id`,
      { headers: { Prefer: 'count=exact', Range: '0-0' } },
    );
  }
  const importedPredictions = predictionIds.length
    ? await client.rest(
      `/predictions?id=in.(${predictionIds.join(',')})&select=id`,
      { headers: { Prefer: 'count=exact', Range: '0-0' } },
    )
    : { contentRange: '*/0' };
  const count = (range) => Number(String(range ?? '*/0').split('/')[1] ?? 0);
  return {
    allPredictions: count(allPredictions.contentRange),
    importedPredictions: count(importedPredictions.contentRange),
    importedEntries: count(importedEntries.contentRange),
  };
}

async function upsertRows(client, table, rows) {
  if (!rows.length) return;
  await client.rest(`/${table}?on_conflict=id`, {
    method: 'POST',
    headers: { Prefer: 'resolution=ignore-duplicates,return=minimal' },
    body: JSON.stringify(rows),
  });
}

function sourceSummaryFromReport(markdown) {
  const labels = [
    ['spreadsheets', 'Spreadsheet analizzati'],
    ['tabs', 'Tab analizzati'],
    ['targetTabs', 'Tab con record TARGET'],
    ['grandPrix', 'GP identificati'],
    ['predictions', 'Pronostici TARGET trovati'],
    ['complete', 'GP completi'],
    ['partial', 'GP parziali'],
    ['conflicts', 'Conflitti tra riepiloghi aggregate'],
  ];
  return Object.fromEntries(labels.map(([key, label]) => [
    key,
    Number(markdown.match(new RegExp(`^- ${label}: \\*\\*(\\d+)\\*\\*`))?.[1] ?? 0),
  ]));
}

function buildReport({
  importMode,
  sourceSummary,
  mapped,
  target,
  league,
  before,
  after,
  rows,
}) {
  const imported = rows.decisions.filter((row) => row.importStatus === 'NEW');
  const alreadyExists = rows.decisions.filter((row) => row.importStatus === 'ALREADY_EXISTS');
  const excluded = mapped.filter((row) => row.status !== 'MATCHED');
  const finalStatus = (row) => {
    const decision = rows.decisions.find((candidate) => candidate.googleGp === row.googleGp);
    if (decision?.importStatus === 'NEW') return 'IMPORTED';
    if (decision?.importStatus === 'ALREADY_EXISTS') return 'ALREADY_EXISTS';
    return row.reportStatus;
  };
  const lines = [
    '# Task 23 — Import storico Google Sheets',
    '',
    `- Modalità: **${importMode ? 'IMPORT COMPLETATO' : 'DRY-RUN — NESSUNA SCRITTURA'}**`,
    '- Account target verificato: **SÌ, match univoco**',
    `- Profilo target verificato: **SÌ** (profilo ${target.profile.id})`,
    `- Lega: **${league.name}**`,
    '',
    '## Riepilogo',
    '',
    `- Spreadsheet analizzati: **${sourceSummary.spreadsheets}**`,
    `- Tab analizzati: **${sourceSummary.tabs}**`,
    `- Tab con record TARGET: **${sourceSummary.targetTabs}**`,
    `- GP identificati: **${sourceSummary.grandPrix}**`,
    `- Prediction trovate: **${sourceSummary.predictions}**`,
    `- GP completi: **${sourceSummary.complete}**`,
    `- GP parziali: **${sourceSummary.partial}**`,
    `- Conflitti: **${sourceSummary.conflicts}**`,
    `- GP importabili: **${rows.decisions.length}**`,
    `- Prediction già esistenti: **${alreadyExists.length}**`,
    `- Prediction nuove importate: **${imported.length}**`,
    `- Entry nuove importate: **${rows.entries.length}**`,
    `- Punti storici caricati: **${imported.reduce((sum, row) => sum + row.sessions.total, 0)}**`,
    '',
    '## Mapping verificato prima della scrittura',
    '',
    '| GP Google | Data sorgente | Codice | GP app | Data app | Circuito | Match | Esito |',
    '|---|---|---|---|---|---|---:|---|',
  ];
  for (const row of mapped) {
    const result = row.status !== 'MATCHED'
      ? `ESCLUSO — ${row.reason}`
      : finalStatus(row) === 'ALREADY_EXISTS'
        ? 'ALREADY_EXISTS — nessuna scrittura'
        : 'IMPORTA';
    lines.push(
      `| ${row.googleGp} | ${row.sourceDates?.join(', ') ?? '—'}`
      + ` | ${row.code} | ${row.appGp?.name ?? '—'}`
      + ` | ${row.appGp?.date_start?.slice(0, 10) ?? '—'}`
       + ` | ${row.appGp?.circuit ?? '—'} | ${row.matchCount}`
       + ` | ${result} |`,
    );
  }
  lines.push(
    '',
    '## GP importati',
    '',
    '| GP | Qualifica | Sprint | Gara | Totale | Sessioni | Stato |',
    '|---|---:|---:|---:|---:|---|---|',
  );
  for (const row of rows.decisions) {
    lines.push(
      `| ${row.googleGp} | ${row.sessions.qualifying.score}`
      + ` | ${row.sessions.sprint.score} | ${row.sessions.race.score}`
       + ` | ${row.sessions.total} | Qualifica, Sprint, Gara | ${row.importStatus} |`,
    );
  }
  lines.push(
    '',
    '## Tabella finale per GP',
    '',
    '| GP | GP app ID | Qualifica | Sprint | Gara | OUT | Totale | Stato |',
    '|---|---|---:|---:|---:|---|---:|---|',
  );
  for (const row of mapped) {
    const qualifying = row.sessions?.qualifying?.score ?? '—';
    const sprint = row.sessions?.sprint?.score ?? '—';
    const race = row.sessions?.race?.score ?? '—';
    const total = row.sessions?.total ?? '—';
    const out = row.sessions?.race?.out ?? '—';
    lines.push(
      `| ${row.googleGp} | ${row.appGp?.id ?? '—'} | ${qualifying} | ${sprint}`
      + ` | ${race} | ${out} | ${total} | ${finalStatus(row)} |`,
    );
  }
  lines.push('', '## Conteggi', '');
  lines.push('| Controllo | Prima | Dopo |');
  lines.push('|---|---:|---:|');
  lines.push(`| Pronostici complessivi account target | ${before.allPredictions} | ${after.allPredictions} |`);
  lines.push(`| Pronostici di questo import | ${before.importedPredictions} | ${after.importedPredictions} |`);
  lines.push(`| Entry di questo import | ${before.importedEntries} | ${after.importedEntries} |`);
  lines.push(
    '',
    `- Record prediction nuovi preparati: **${rows.predictions.length}**`,
    `- Record prediction_entries nuovi preparati: **${rows.entries.length}**`,
    `- Prediction già presenti riconosciute: **${alreadyExists.length}**`,
    '- Punti delle entry individuali: **0**; i punteggi storici approvati sono conservati nei campi aggregati Qualifica/Sprint/Gara/Totale senza inventare una distribuzione.',
    '- Scoring/RPC invocati o modificati: **NO**',
    '- Dati ufficiali MotoGP modificati: **NO**',
    '- Pronostici di altri utenti modificati: **NO**',
    `- Database modificato: **${importMode ? 'SI' : 'NO'}**`,
    `- Prediction create: **${importMode ? rows.predictions.length : 0}**`,
    '- Prediction modificate: **0**',
    `- Entry create: **${importMode ? rows.entries.length : 0}**`,
    '- Prediction esistenti sovrascritte: **0**',
    '- RPC modificate: **NO**',
    '- RLS modificate: **NO**',
    '- Scoring modificato: **NO**',
    '- Google Sheets modificato: **NO**',
    '- Token/credenziali salvati o stampati: **NO**',
    '',
    '## Esclusi',
    '',
  );
  for (const row of excluded) lines.push(`- **${row.googleGp}** — ${row.reason}.`);
  lines.push('');
  return `${lines.join('\n')}\n`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const targetEmail = process.env.TARGET_EMAIL ?? '';
  if (!TARGET_EMAIL_RE.test(targetEmail)) {
    throw new Error('Impostare TARGET_EMAIL con un indirizzo valido.');
  }

  const sourceMarkdown = await readFile(args.source, 'utf8');
  const sourceRecords = parseSourceReport(sourceMarkdown);
  const sourceSummary = sourceSummaryFromReport(sourceMarkdown);
  sourceRecords.forEach(validateSourceRecord);
  const client = createSupabaseClient();
  const target = await resolveTargetUser(client, targetEmail);
  const league = await resolveLeague(client, target.userId, args.leagueId);
  const appData = await loadAppData(client);
  const mapped = mapGrandPrix(sourceRecords, appData.grandPrix);
  const { json: existingPredictions } = await client.rest(
    `/predictions?user_id=eq.${encodeURIComponent(target.userId)}`
    + '&select=id,user_id,grand_prix_id,league_id',
  );
  const rows = buildRows(
    mapped,
    target.userId,
    league.id,
    existingPredictions,
    appData.riders,
  );
  const predictionIds = rows.predictions.map((row) => row.id);
  const before = await countsFor(client, target.userId, predictionIds);

  if (args.importMode) {
    await upsertRows(client, 'predictions', rows.predictions);
    await upsertRows(client, 'prediction_entries', rows.entries);
  }

  const after = await countsFor(client, target.userId, predictionIds);
  if (args.importMode) {
    if (after.importedPredictions !== rows.predictions.length) {
      throw new Error('Conteggio finale predictions non corrispondente alle attese.');
    }
    if (after.importedEntries !== rows.entries.length) {
      throw new Error('Conteggio finale prediction_entries non corrispondente alle attese.');
    }
  }

  const report = buildReport({
    importMode: args.importMode,
    sourceSummary,
    mapped,
    target,
    league,
    before,
    after,
    rows,
  });
  await mkdir(dirname(args.report), { recursive: true });
  await writeFile(args.report, report, 'utf8');
  console.log(args.importMode ? 'IMPORT COMPLETATO' : 'DRY-RUN COMPLETATO');
  console.log(`GP con match univoco: ${rows.predictions.length}`);
  console.log(`Sessioni: ${rows.predictions.length * SESSION_NAMES.length}`);
  console.log(`Predictions prima/dopo: ${before.allPredictions}/${after.allPredictions}`);
  console.log(`Entry import prima/dopo: ${before.importedEntries}/${after.importedEntries}`);
  console.log(`Report: ${args.report}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});