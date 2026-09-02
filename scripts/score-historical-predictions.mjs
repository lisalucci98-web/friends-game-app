/**
 * Valuta le prediction storiche della lega TEST01 usando esclusivamente
 * public.score_prediction(uuid).
 *
 * Dry-run di default:
 *   node scripts/score-historical-predictions.mjs
 *
 * Scrittura esplicita:
 *   node scripts/score-historical-predictions.mjs --apply
 *
 * Il selettore delle prediction replica il perimetro dell'import storico:
 * chiave naturale utente + GP + lega, una riga sorgente con almeno un valore
 * importabile e solo membri della lega target. Non applica carry-over.
 */

import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

const SOURCE =
  'attached_assets/Pasted-GP-Utente-Pole-position-tempo-pole-1-sprint-2-sprint-3-_1788342259417.txt';
const DEFAULT_REPORT = '.agents/outputs/historical-scoring-report.md';
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
  const args = {
    apply: false,
    source: SOURCE,
    report: DEFAULT_REPORT,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--apply') args.apply = true;
    else if (argument === '--source') args.source = argv[++index] ?? '';
    else if (argument === '--report') args.report = argv[++index] ?? '';
    else if (argument === '--help' || argument === '-h') {
      console.log(
        'Uso: node scripts/score-historical-predictions.mjs [--apply] '
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

function parseSource(text) {
  const lines = text.replace(/\r/g, '').split('\n');
  while (lines.length && lines.at(-1) === '') lines.pop();
  if (!lines.length) throw new Error('La sorgente storica è vuota.');

  const header = lines.shift().split('\t').map((cell) => cell.trim());
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
    header.length !== expectedHeader.length
    || header.some((cell, index) => cell !== expectedHeader[index])
  ) {
    throw new Error(`Intestazione TSV inattesa: ${header.join(' | ')}`);
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

function createSupabaseClient() {
  const url = (process.env.VITE_SUPABASE_URL ?? '').replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
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
      // Il report conserva solo il messaggio HTTP non sensibile.
    }
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}: ${String(text).slice(0, 300)}`);
    }
    return json;
  }

  return {
    get: (path) => request(`/rest/v1${path}`),
    auth: (path) => request(`/auth/v1${path}`),
    rpc: (name, body) => request(`/rest/v1/rpc/${name}`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  };
}

async function getChunks(client, ids, pathForIds) {
  const result = [];
  for (let index = 0; index < ids.length; index += 80) {
    result.push(...await client.get(pathForIds(ids.slice(index, index + 80))));
  }
  return result;
}

function buildPredictionSelection(rows, context) {
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
    const gp = gpsByCode.get(GP_CODES.get(String(gpName ?? '').trim()));
    if (!user || !memberIds.has(user.id) || !gp || row.cells.slice(2).every(isBlank)) {
      continue;
    }

    const key = `${user.id}|${gp.id}|${context.league.id}`;
    const prediction = predictionsByKey.get(key);
    if (!prediction) {
      errors.push(`Riga ${row.line}: prediction non presente per ${gp.short_name}`);
      continue;
    }
    selected.push({
      line: row.line,
      email: user.email,
      userId: user.id,
      gp,
      prediction,
      deterministicId: deterministicUuid(`historical-table|${key}`),
    });
  }

  const byPredictionId = new Map();
  for (const item of selected) {
    if (byPredictionId.has(item.prediction.id)) {
      errors.push(`Prediction duplicata nella sorgente: ${item.prediction.id}`);
      continue;
    }
    byPredictionId.set(item.prediction.id, item);
  }
  return { items: [...byPredictionId.values()], errors };
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

function entryCounts(entries) {
  return Object.fromEntries(
    ENTRY_TYPES.map((type) => [type, entries.filter((entry) => entry.prediction_type === type).length]),
  );
}

function missingEntryTypes(counts) {
  return ENTRY_TYPES.filter((type) => counts[type] < EXPECTED_ENTRY_COUNTS[type]);
}

function buildCoverage(items, context) {
  const coverageByGp = new Map();
  for (const item of items) {
    if (coverageByGp.has(item.gp.id)) continue;
    const official = {
      qualifying: chooseOfficialSession(
        context.sessions,
        context.resultsBySession,
        item.gp.id,
        'Q',
      ),
      sprint: chooseOfficialSession(
        context.sessions,
        context.resultsBySession,
        item.gp.id,
        'SPR',
      ),
      race: chooseOfficialSession(
        context.sessions,
        context.resultsBySession,
        item.gp.id,
        'RAC',
      ),
    };
    coverageByGp.set(item.gp.id, official);
  }
  return coverageByGp;
}

function buildEntryAudit(items, entriesByPrediction, coverageByGp, ridersById) {
  const incomplete = [];
  const rpcUnsupported = [];
  const missingResults = [];

  for (const item of items) {
    const entries = entriesByPrediction.get(item.prediction.id) ?? [];
    const counts = entryCounts(entries);
    const coverage = coverageByGp.get(item.gp.id);
    const missing = missingEntryTypes(counts);
    if (missing.length) {
      incomplete.push({
        gp: item.gp.short_name,
        email: item.email,
        entries: entries.length,
        missing,
      });
    }
    if (counts.QUALIFYING_TIME === 0
      && coverage?.qualifying
      && coverage?.sprint
      && coverage?.race) {
      rpcUnsupported.push({
        gp: item.gp.short_name,
        email: item.email,
        reason: 'QUALIFYING_TIME assente: score_prediction produce qualifying_points NULL',
      });
    }

    const resultSets = {
      POLE: coverage?.qualifying?.results ?? [],
      SPRINT: coverage?.sprint?.results ?? [],
      RACE: coverage?.race?.results ?? [],
      RACE_OUT: coverage?.race?.results ?? [],
    };
    const missingByType = {};
    for (const entry of entries) {
      const resultSet = resultSets[entry.prediction_type];
      if (!resultSet || !entry.rider_id) continue;
      if (!resultSet.some((result) => result.rider_id === entry.rider_id)) {
        missingByType[entry.prediction_type] = (missingByType[entry.prediction_type] ?? 0) + 1;
      }
    }
    if (Object.keys(missingByType).length) {
      missingResults.push({
        gp: item.gp.short_name,
        email: item.email,
        riders: Object.entries(missingByType).map(([type, count]) => ({
          type,
          count,
          names: entries
            .filter((entry) => entry.prediction_type === type && entry.rider_id
              && !(resultSets[type] ?? []).some((result) => result.rider_id === entry.rider_id))
            .map((entry) => ridersById.get(entry.rider_id) ?? entry.rider_id),
        })),
      });
    }
  }
  return { incomplete, rpcUnsupported, missingResults };
}

function coverageRows(items, coverageByGp) {
  const byGp = new Map();
  for (const item of items) {
    const current = byGp.get(item.gp.id) ?? {
      gp: item.gp.short_name,
      name: item.gp.name,
      predictions: 0,
    };
    current.predictions += 1;
    byGp.set(item.gp.id, current);
  }

  return [...byGp.entries()].map(([gpId, row]) => {
    const coverage = coverageByGp.get(gpId);
    const session = (value) => value
      ? `${value.results.length} risultati / ${value.session.status}`
      : 'nessun risultato';
    return {
      ...row,
      qualifying: session(coverage?.qualifying),
      sprint: session(coverage?.sprint),
      race: session(coverage?.race),
      evaluable: Boolean(coverage?.qualifying && coverage?.sprint && coverage?.race),
    };
  });
}

function aggregateByUser(items, predictions) {
  const selectedIds = new Set(items.map((item) => item.prediction.id));
  const byUser = new Map();
  for (const prediction of predictions) {
    if (!selectedIds.has(prediction.id)) continue;
    const current = byUser.get(prediction.user_id) ?? {
      email: items.find((item) => item.userId === prediction.user_id)?.email ?? prediction.user_id,
      gps: 0,
      qualifying: 0,
      sprint: 0,
      race: 0,
      bonus: 0,
      malus: 0,
      total: 0,
    };
    current.gps += 1;
    current.qualifying += Number(prediction.qualifying_points ?? 0);
    current.sprint += Number(prediction.sprint_points ?? 0);
    current.race += Number(prediction.race_points ?? 0);
    current.bonus += Number(prediction.bonus_points ?? 0);
    current.malus += Number(prediction.malus_points ?? 0);
    current.total += Number(prediction.total_points ?? 0);
    byUser.set(prediction.user_id, current);
  }
  return [...byUser.values()].sort((left, right) => right.total - left.total);
}

function markdownReport({
  args,
  rows,
  items,
  context,
  entries,
  audit,
  coverage,
  rpcResults,
  afterPredictions,
  selectionErrors,
}) {
  const uniquePredictions = new Map(items.map((item) => [item.prediction.id, item]));
  const deterministic = items.filter((item) => item.prediction.id === item.deterministicId).length;
  const legacy = items.length - deterministic;
  const alreadyScored = items.filter((item) => item.prediction.scored_at !== null).length;
  const evaluableGpIds = new Set(
    coverage.filter((row) => row.evaluable).map((row) => context.grandPrix.find((gp) => gp.short_name === row.gp)?.id),
  );
  const needsScoring = items.filter(
    (item) => item.prediction.scored_at === null
      && evaluableGpIds.has(item.gp.id)
      && !audit.rpcUnsupported.some((unsupported) =>
        unsupported.gp === item.gp.short_name && unsupported.email === item.email),
  );
  const notEvaluable = items.filter((item) => !evaluableGpIds.has(item.gp.id));
  const resultErrors = rpcResults.filter((result) => !result.ok);
  const after = afterPredictions.length ? new Map(
    afterPredictions.map((prediction) => [prediction.id, prediction]),
  ) : new Map();
  const updated = afterPredictions.filter((prediction) => prediction.scored_at !== null).length;
  const totals = afterPredictions.length ? aggregateByUser(items, afterPredictions) : [];
  const lines = [
    '# Scoring pronostici storici',
    '',
    `- Modalità: **${args.apply ? 'APPLY — RPC eseguite' : 'DRY-RUN — NESSUNA SCRITTURA'}**`,
    `- Lega: **${context.league.name}** (${LEAGUE_CODE})`,
    `- Stagione: **${SEASON_YEAR}**`,
    '',
    '## Perimetro',
    '',
    `- Righe sorgente analizzate: **${rows.length}**`,
    `- Prediction storiche uniche: **${uniquePredictions.size}**`,
    `- Prediction con UUID deterministico dell’import: **${deterministic}**`,
    `- Prediction preesistenti risolte per chiave naturale: **${legacy}**`,
    `- Prediction già valutate (scored_at valorizzato): **${alreadyScored}**`,
    `- Prediction che necessitano scoring e hanno risultati completi: **${needsScoring.length}**`,
    `- Prediction non valutabili in questa esecuzione: **${notEvaluable.length}**`,
    `- Prediction non supportate dalla RPC per entry QUALIFYING_TIME assente: **${audit.rpcUnsupported.length}**`,
    `- Entry storiche effettivamente presenti: **${entries.length}**`,
    '',
    '## RPC utilizzata',
    '',
    '- `public.score_prediction(p_prediction_id uuid)`',
    '- Nessun carry-over, INSERT, UPDATE o DELETE diretto eseguito dallo script; gli aggiornamenti score sono demandati alla RPC.',
    '',
    '## Copertura risultati ufficiali',
    '',
    '| GP | Prediction | Qualifica | Sprint | Gara | Valutabile |',
    '|---|---:|---|---|---|---|',
    ...coverage.map((row) =>
      `| ${row.gp} | ${row.predictions} | ${row.qualifying} | ${row.sprint} | ${row.race} | ${row.evaluable ? 'Sì' : 'No'} |`),
    '',
    '## Incompletezze delle prediction',
    '',
    `- Prediction con entry mancanti rispetto alla forma completa (1 POLE, 1 QUALIFYING_TIME, 3 SPRINT, 5 RACE, 1 RACE_OUT): **${audit.incomplete.length}**`,
    ...(
      audit.incomplete.length
        ? audit.incomplete.map((item) =>
          `- ${item.gp} / ${item.email}: ${item.entries} entry; mancanti ${item.missing.join(', ')}`)
        : ['- Nessuna']
    ),
    '',
    '## Limiti della RPC esistente',
    '',
    ...(
      audit.rpcUnsupported.length
        ? audit.rpcUnsupported.map((item) => `- ${item.gp} / ${item.email}: ${item.reason}`)
        : ['- Nessuno']
    ),
    '',
    '## Rider non presenti nei risultati ufficiali',
    '',
    '- Sono riferimenti presenti nelle prediction_entries ma assenti dal risultato della sessione selezionata; la RPC esistente li gestisce senza inventare risultati.',
    `- Prediction coinvolte: **${audit.missingResults.length}**`,
    ...(
      audit.missingResults.length
        ? audit.missingResults.map((item) =>
          `- ${item.gp} / ${item.email}: ${item.riders.map((group) => `${group.type}=${group.count}`).join(', ')}`)
        : ['- Nessuna']
    ),
    '',
    '## Esecuzione',
    '',
    `- RPC invocate: **${rpcResults.length}**`,
    `- RPC riuscite: **${rpcResults.filter((result) => result.ok).length}**`,
    `- RPC con errore: **${resultErrors.length}**`,
    `- Prediction con ` + (args.apply ? '`scored_at` aggiornato dopo la verifica' : '`scored_at` che verrebbe aggiornato') + `: **${args.apply ? updated : needsScoring.length}**`,
    ...(
      resultErrors.length
        ? resultErrors.map((result) => `- Errore prediction ${result.id}: ${result.error}`)
        : ['- Nessun errore RPC']
    ),
    '',
    '## Totali storici per utente',
    '',
    ...(totals.length
      ? [
        '| Utente | GP | Qualifica | Sprint | Gara | Bonus | Malus | Totale stagione |',
        '|---|---:|---:|---:|---:|---:|---:|---:|',
        ...totals.map((total) =>
          `| ${total.email} | ${total.gps} | ${total.qualifying} | ${total.sprint} | ${total.race} | ${total.bonus} | ${total.malus} | ${total.total} |`),
      ]
      : ['- Disponibili nella verifica post-apply.']),
    '',
    '## Verifica finale',
    '',
    `- Prediction selezionate ancora nel perimetro: **${items.length}**`,
    `- Errori di selezione: **${selectionErrors.length}**`,
    `- Database modificato: **${args.apply ? 'Sì, esclusivamente tramite score_prediction' : 'No'}**`,
    '- Schema, RLS, risultati ufficiali e funzioni di scoring non sono stati modificati dallo script; le prediction_entries sono state solo rilevate.',
    '- La classifica e il totale stagione leggono i campi aggregati delle prediction; dopo l’apply vengono riletti dal database.',
    '',
  ];
  return `${lines.join('\n')}\n`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const client = createSupabaseClient();
  const rows = parseSource(await readFile(args.source, 'utf8'));
  const [seasons, usersResponse, leagues, members, grandPrix, predictions, riders, sessions] =
    await Promise.all([
      client.get(`/seasons?year=eq.${SEASON_YEAR}&select=id,year`),
      client.auth('/admin/users?page=1&per_page=1000'),
      client.get(`/leagues?invite_code=eq.${LEAGUE_CODE}&select=id,name,invite_code`),
      client.get('/league_members?select=league_id,user_id'),
      client.get('/grand_prix?season_id=eq.'
        + `${encodeURIComponent((await client.get(`/seasons?year=eq.${SEASON_YEAR}&select=id`))[0].id)}`
        + '&is_test=eq.false&select=id,name,short_name,date_start,date_end&order=date_start.asc'),
      client.get('/predictions?league_id=eq.'
        + `${encodeURIComponent((await client.get('/leagues?invite_code=eq.TEST01&select=id'))[0].id)}`
        + '&select=id,user_id,grand_prix_id,league_id,qualifying_points,sprint_points,race_points,bonus_points,malus_points,total_points,scored_at,updated_at'),
      client.get('/riders?select=id,name,surname'),
      client.get('/sessions?select=id,grand_prix_id,type,status,session_date,number&order=session_date.asc'),
    ]);

  if (seasons.length !== 1 || leagues.length !== 1) {
    throw new Error('Stagione o lega target non univoca.');
  }
  const league = leagues[0];
  const relevantSessions = sessions.filter((session) =>
    grandPrix.some((gp) => gp.id === session.grand_prix_id));
  const results = await getChunks(
    client,
    relevantSessions.map((session) => session.id),
    (ids) => `/session_results?session_id=in.(${ids.join(',')})&select=id,session_id,rider_id,position,total_time,status`,
  );
  const resultsBySession = new Map();
  for (const result of results) {
    const current = resultsBySession.get(result.session_id) ?? [];
    current.push(result);
    resultsBySession.set(result.session_id, current);
  }

  const context = {
    league,
    users: usersResponse.users ?? [],
    members,
    grandPrix,
    predictions,
    riders,
    sessions: relevantSessions,
    resultsBySession,
  };
  const selection = buildPredictionSelection(rows, context);
  const predictionIds = selection.items.map((item) => item.prediction.id);
  const entries = await getChunks(
    client,
    predictionIds,
    (ids) => `/prediction_entries?prediction_id=in.(${ids.join(',')})&select=id,prediction_id,prediction_type,position,rider_id,predicted_time,points`,
  );
  const entriesByPrediction = new Map();
  for (const entry of entries) {
    const current = entriesByPrediction.get(entry.prediction_id) ?? [];
    current.push(entry);
    entriesByPrediction.set(entry.prediction_id, current);
  }
  const coverageByGp = buildCoverage(selection.items, context);
  const ridersById = new Map(
    riders.map((rider) => [rider.id, `${rider.name ?? ''} ${rider.surname ?? ''}`.trim()]),
  );
  const audit = buildEntryAudit(
    selection.items,
    entriesByPrediction,
    coverageByGp,
    ridersById,
  );
  const coverage = coverageRows(selection.items, coverageByGp);
  const evaluableGpIds = new Set(
    coverage.filter((row) => row.evaluable)
      .map((row) => grandPrix.find((gp) => gp.short_name === row.gp)?.id),
  );
  const toScore = selection.items.filter(
    (item) => item.prediction.scored_at === null
      && evaluableGpIds.has(item.gp.id)
      && !audit.rpcUnsupported.some((unsupported) =>
        unsupported.gp === item.gp.short_name && unsupported.email === item.email),
  );
  const rpcResults = [];

  if (args.apply) {
    for (const item of toScore) {
      try {
        await client.rpc('score_prediction', { p_prediction_id: item.prediction.id });
        rpcResults.push({ id: item.prediction.id, ok: true });
      } catch (error) {
        rpcResults.push({
          id: item.prediction.id,
          ok: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  const afterPredictions = args.apply
    ? await client.get('/predictions?league_id=eq.'
      + `${encodeURIComponent(league.id)}&select=id,user_id,grand_prix_id,league_id,qualifying_points,sprint_points,race_points,bonus_points,malus_points,total_points,scored_at,updated_at`)
    : [];
  const report = markdownReport({
    args,
    rows,
    items: selection.items,
    context,
    entries,
    audit,
    coverage,
    rpcResults,
    afterPredictions,
    selectionErrors: selection.errors,
  });
  await writeFile(args.report, report, 'utf8');

  console.log(args.apply ? 'SCORING STORICO COMPLETATO' : 'DRY-RUN SCORING COMPLETATO');
  console.log(`Prediction storiche: ${selection.items.length}`);
  console.log(`Prediction valutabili: ${toScore.length}`);
  console.log(`RPC invocate: ${rpcResults.length}`);
  console.log(`Errori selezione: ${selection.errors.length}`);
  console.log(`Report: ${args.report}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});