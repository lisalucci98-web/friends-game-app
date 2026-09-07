/**
 * Task 39 — apply controllato dei risultati deterministici del Task 38.
 *
 * Il report del Task 38 è il gate e la fonte di verità per il perimetro e per
 * i valori attesi. Questo script:
 * - legge e valida il report Task 38;
 * - salva l'audit pre-apply;
 * - aggiorna solo predictions/prediction_entries autorizzate;
 * - verifica il valore corrente prima di ogni PATCH;
 * - usa rollback compensativo se una PATCH fallisce;
 * - non invoca score_prediction e non tocca risultati, schema, RLS o utenti.
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const INPUT_REPORT = '.agents/outputs/task-38-excel-db-mapping.md';
const OUTPUT_REPORT = '.agents/outputs/task-39-scoring-apply-final.md';
const SEASON_YEAR = 2026;
const LEAGUE_CODE = 'TEST01';
const PREDICTION_FIELDS = [
  'qualifying_points',
  'sprint_points',
  'race_points',
  'bonus_points',
  'malus_points',
  'total_points',
];
const ENTRY_FIELDS = ['id', 'prediction_id', 'prediction_type', 'position', 'points'];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const EXPECTED_CASES = [
  { user: 'Nicholas', label: 'Niky', gp: 'THAILAND', total: 21, components: [8, 3, 10] },
  { user: 'Nicholas', label: 'Niky', gp: 'BRAZIL', total: 25 },
  { user: 'Nicholas', label: 'Niky', gp: 'FRANCE', total: 18 },
  { user: 'Marty', gp: 'ITALY', total: 30 },
  { user: 'Marty', gp: 'CATALONIA', total: 13 },
  { user: 'Simo', gp: 'THAILAND', total: 26 },
  { user: 'Alessandro', gp: 'SPAIN', total: 19 },
  { user: 'Alessandro', gp: 'GREAT BRITAIN', total: 22 },
];

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

function numberOrZero(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function strictNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function semanticScoreEqual(left, right) {
  return numberOrZero(left) === numberOrZero(right);
}

function jsonEqual(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, ' ')
    .trim();
}

function safeUuid(value, label) {
  if (!UUID_RE.test(value)) throw new Error(`${label} non è un UUID valido.`);
  return value;
}

function parseMarkdownTableRows(text) {
  return String(text)
    .split('\n')
    .filter((line) => /^\|/.test(line) && !/^\|---/.test(line))
    .map((line) => line.slice(1, line.endsWith('|') ? -1 : undefined)
      .split('|').map((cell) => cell.trim()))
    .filter((cells) => cells.length > 1);
}

function parseTask38Report(markdown) {
  if (!markdown.includes('- VERIFIED: **81**')) {
    throw new Error('Il report Task 38 non conferma le 81 prediction VERIFIED attese.');
  }
  if (!markdown.includes('- PARTIAL_EXCLUDED: **30**')) {
    throw new Error('Il report Task 38 non conferma le 30 partial escluse attese.');
  }

  const detailStart = markdown.indexOf('## Dettaglio riga-per-riga delle VERIFIED');
  const partialStart = markdown.indexOf('## Prediction partial escluse');
  const extraStart = markdown.indexOf('## Prediction extra fuori dalla sorgente storica');
  const malusStart = markdown.indexOf('## Dry-run aggiornamento Malus Gara NC');
  if (detailStart < 0 || partialStart < 0 || extraStart < 0 || malusStart < 0) {
    throw new Error('Sezioni obbligatorie mancanti nel report Task 38.');
  }

  const detailText = markdown.slice(detailStart);
  const headings = [...detailText.matchAll(/^### (.+?) \/ (.+)$/gm)];
  const candidates = [];
  for (let index = 0; index < headings.length; index += 1) {
    const heading = headings[index];
    const blockStart = heading.index + heading[0].length;
    const blockEnd = index + 1 < headings.length
      ? headings[index + 1].index
      : detailText.length;
    const block = detailText.slice(blockStart, blockEnd);
    const predictionId = block.match(/^- Prediction DB: `([^`]+)`/m)?.[1];
    const scoreLine = block.match(
      /- Scoring canonico: Qualifica \*\*(-?\d+)\*\*.*?; Sprint \*\*(-?\d+)\*\*.*?; Gara \*\*(-?\d+)\*\* \[posizioni (-?\d+); bonus (-?\d+); malus (-?\d+); OUT (-?\d+)\]/m,
    );
    const total = block.match(/^- Totale storico ricostruito: \*\*(-?\d+)\*\*/m)?.[1];
    if (!predictionId || !scoreLine || total === undefined) {
      throw new Error(`Blocco Task 38 non interpretabile: ${heading[0]}`);
    }
    safeUuid(predictionId, 'Prediction ID nel report Task 38');

    const entryRows = parseMarkdownTableRows(block)
      .filter((cells) => cells.length >= 7 && UUID_RE.test(cells[0]));
    if (entryRows.length !== 11) {
      throw new Error(`${predictionId}: attese 11 entry, trovate ${entryRows.length}.`);
    }
    const entries = entryRows.map((cells) => ({
      id: safeUuid(cells[0], 'Entry ID nel report Task 38'),
      prediction_id: predictionId,
      prediction_type: cells[1],
      position: cells[2] === '—' ? null : Number(cells[2]),
      proposedPoints: Number(cells[6]),
    }));
    if (entries.some((entry) => !Number.isInteger(entry.proposedPoints))) {
      throw new Error(`${predictionId}: punti entry non interi nel report Task 38.`);
    }

    const candidate = {
      predictionId,
      user: heading[1].trim(),
      gp: heading[2].trim(),
      score: {
        qualifying_points: Number(scoreLine[1]),
        sprint_points: Number(scoreLine[2]),
        // Il quarto numero è la Gara completa storica e comprende
        // bonus/malus. Nel database questi valori hanno colonne separate:
        // race_points deve contenere soltanto le posizioni Gara.
        race_points: Number(scoreLine[4]),
        racePosition: Number(scoreLine[4]),
        bonus_points: Number(scoreLine[5]),
        malus_points: Number(scoreLine[6]),
        outBonus: Number(scoreLine[7]),
        total_points: Number(total),
      },
      entries,
    };
    const expectedTotal = candidate.score.qualifying_points
      + candidate.score.sprint_points
      + candidate.score.race_points
      + candidate.score.bonus_points
      + candidate.score.malus_points;
    if (expectedTotal !== candidate.score.total_points) {
      throw new Error(
        `${predictionId}: totale non autosommante: `
          + `${candidate.score.qualifying_points} + ${candidate.score.sprint_points} + `
          + `${candidate.score.race_points} + ${candidate.score.bonus_points} + `
          + `${candidate.score.malus_points} != ${candidate.score.total_points}.`,
      );
    }
    candidates.push(candidate);
  }

  if (candidates.length !== 81) {
    throw new Error(`Il report Task 38 contiene ${candidates.length} dettagli, attesi 81.`);
  }
  if (new Set(candidates.map((candidate) => candidate.predictionId)).size !== candidates.length) {
    throw new Error('Il report Task 38 contiene prediction duplicate.');
  }

  const partialSection = markdown.slice(partialStart, extraStart);
  const partialIds = [...partialSection.matchAll(
    /^\|[^|]+\|[^|]+\|([0-9a-f-]{36})\|/gm,
  )].map((match) => safeUuid(match[1], 'Partial ID nel report Task 38'));

  const malusSection = markdown.slice(malusStart, detailStart);
  const malusRows = parseMarkdownTableRows(malusSection)
    .filter((cells) => cells.length >= 7 && UUID_RE.test(cells[2]))
    .map((cells) => ({
      predictionId: safeUuid(cells[2], 'Malus prediction ID nel report Task 38'),
      ncCount: Number(cells[3]),
      correctedMalus: Number(cells[5]),
    }));

  return { candidates, partialIds, malusRows };
}

function createSupabaseClient() {
  const url = (process.env.VITE_SUPABASE_URL ?? '').replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  if (!url || !key) throw new Error('Servono VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.');

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
      // Conserva solo lo status nell'errore, mai credenziali o header.
    }
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}: ${String(text).slice(0, 300)}`);
    }
    return json;
  }

  return {
    get: (path) => request(`/rest/v1${path}`),
    patch: (path, body) => request(`/rest/v1${path}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
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

function predictionSelect() {
  return ['id', 'user_id', 'grand_prix_id', 'league_id', ...PREDICTION_FIELDS].join(',');
}

function entrySelect() {
  return ENTRY_FIELDS.join(',');
}

async function loadDbSnapshot(client, leagueId) {
  const predictions = await client.get(
    `/predictions?league_id=eq.${leagueId}&select=${predictionSelect()}`,
  );
  const entries = await getChunks(
    client,
    predictions.map((prediction) => prediction.id),
    (ids) => `/prediction_entries?prediction_id=in.(${ids.join(',')})&select=${entrySelect()}`,
  );
  return { predictions, entries };
}

function mapById(rows) {
  return new Map(rows.map((row) => [row.id, row]));
}

function snapshotRows(rows) {
  return new Map(rows.map((row) => [row.id, JSON.parse(JSON.stringify(row))]));
}

export function buildPlan(report, snapshot) {
  const predictionsById = mapById(snapshot.predictions);
  const entriesById = mapById(snapshot.entries);
  const candidateIds = new Set(report.candidates.map((candidate) => candidate.predictionId));
  const plan = [];
  const obsoleteEntries = [];

  for (const candidate of report.candidates) {
    const prediction = predictionsById.get(candidate.predictionId);
    if (!prediction) throw new Error(`${candidate.predictionId}: prediction non presente in TEST01.`);
    if (prediction.league_id === undefined) {
      throw new Error(`${candidate.predictionId}: league_id non letto.`);
    }

    const desired = candidate.score;
    const changedFields = PREDICTION_FIELDS.filter((field) =>
      !semanticScoreEqual(prediction[field], desired[field]));
    if (changedFields.length) {
      plan.push({
        kind: 'prediction',
        predictionId: candidate.predictionId,
        user: candidate.user,
        gp: candidate.gp,
        fields: changedFields,
        desired: Object.fromEntries(changedFields.map((field) => [field, desired[field]])),
      });
    }

    for (const proposedEntry of candidate.entries) {
      const entry = entriesById.get(proposedEntry.id);
      if (!entry) {
        obsoleteEntries.push({
          predictionId: candidate.predictionId,
          user: candidate.user,
          gp: candidate.gp,
          entryId: proposedEntry.id,
          predictionType: proposedEntry.prediction_type,
          proposedPoints: proposedEntry.proposedPoints,
          reason: 'missing-from-preflight',
        });
        continue;
      }
      if (entry.prediction_id !== candidate.predictionId) {
        throw new Error(`${proposedEntry.id}: entry non presente o fuori prediction autorizzata.`);
      }
      if (strictNumber(entry.points) !== proposedEntry.proposedPoints) {
        plan.push({
          kind: 'entry',
          predictionId: candidate.predictionId,
          user: candidate.user,
          gp: candidate.gp,
          entryId: proposedEntry.id,
          desired: { points: proposedEntry.proposedPoints },
        });
      }
    }
  }
  return { plan, candidateIds, obsoleteEntries };
}

function comparePredictionFields(row, desired) {
  return PREDICTION_FIELDS.every((field) => semanticScoreEqual(row[field], desired[field]));
}

function compareEntryPoints(row, desired) {
  return strictNumber(row?.points) === desired;
}

async function fetchOne(client, table, id, select) {
  const rows = await client.get(`/${table}?id=eq.${id}&select=${select}`);
  if (rows.length !== 1) throw new Error(`${table}/${id}: record non univoco durante il recheck.`);
  return rows[0];
}

async function applyPlan(client, plan) {
  const applied = [];
  const skipped = [];
  try {
    for (const item of plan) {
      if (item.kind === 'prediction') {
        const current = await fetchOne(client, 'predictions', item.predictionId, predictionSelect());
        const fields = Object.keys(item.desired).filter((field) =>
          !semanticScoreEqual(current[field], item.desired[field]));
        if (!fields.length) {
          skipped.push({ ...item, reason: 'already-correct-after-preflight' });
          continue;
        }
        const body = Object.fromEntries(fields.map((field) => [field, item.desired[field]]));
        const returned = await client.patch(`/predictions?id=eq.${item.predictionId}`, body);
        if (!Array.isArray(returned) || returned.length !== 1) {
          throw new Error(`PATCH predictions/${item.predictionId} non ha restituito una riga.`);
        }
        for (const field of fields) {
          applied.push({
            kind: 'prediction',
            predictionId: item.predictionId,
            user: item.user,
            gp: item.gp,
            field,
            before: current[field],
            after: item.desired[field],
          });
        }
      } else {
        const current = await fetchOne(client, 'prediction_entries', item.entryId, entrySelect());
        if (compareEntryPoints(current, item.desired.points)) {
          skipped.push({ ...item, reason: 'already-correct-after-preflight' });
          continue;
        }
        const returned = await client.patch(`/prediction_entries?id=eq.${item.entryId}`, {
          points: item.desired.points,
        });
        if (!Array.isArray(returned) || returned.length !== 1) {
          throw new Error(`PATCH prediction_entries/${item.entryId} non ha restituito una riga.`);
        }
        applied.push({
          kind: 'entry',
          predictionId: item.predictionId,
          user: item.user,
          gp: item.gp,
          entryId: item.entryId,
          field: 'points',
          before: current.points,
          after: item.desired.points,
        });
      }
    }
    return { applied, skipped, rolledBack: false, rollbackErrors: [] };
  } catch (error) {
    const rollbackErrors = [];
    for (const change of [...applied].reverse()) {
      try {
        if (change.kind === 'prediction') {
          await client.patch(`/predictions?id=eq.${change.predictionId}`, {
            [change.field]: change.before,
          });
        } else {
          await client.patch(`/prediction_entries?id=eq.${change.entryId}`, {
            points: change.before,
          });
        }
      } catch (rollbackError) {
        rollbackErrors.push(
          `${change.kind}/${change.predictionId ?? change.entryId}: ${rollbackError.message}`,
        );
      }
    }
    const rollbackSuffix = rollbackErrors.length
      ? ` Rollback con ${rollbackErrors.length} errore/i.`
      : ' Rollback completato.';
    throw new Error(`${error.message}.${rollbackSuffix}`);
  }
}

function expectedFromCandidate(candidate) {
  return {
    qualifying_points: candidate.score.qualifying_points,
    sprint_points: candidate.score.sprint_points,
    race_points: candidate.score.race_points,
    bonus_points: candidate.score.bonus_points,
    malus_points: candidate.score.malus_points,
    total_points: candidate.score.total_points,
  };
}

function caseMatches(candidate, expected) {
  if (!candidate) return false;
  const user = normalizeText(candidate.user);
  const gp = normalizeText(candidate.gp);
  return user.includes(normalizeText(expected.user))
    && gp.includes(normalizeText(expected.gp));
}

function buildReport({
  startedAt,
  finishedAt,
  report,
  snapshot,
  postSnapshot,
  plan,
  applied,
  skipped,
  errors,
  verification,
  task38Verification,
  rollbackStatus,
  obsoleteEntries,
}) {
  const candidateIds = new Set(report.candidates.map((candidate) => candidate.predictionId));
  const changedPredictionIds = new Set(
    applied.filter((change) => change.kind === 'prediction').map((change) => change.predictionId),
  );
  const changedEntryIds = new Set(
    applied.filter((change) => change.kind === 'entry').map((change) => change.entryId),
  );
  const excludedIds = snapshot.predictions
    .map((prediction) => prediction.id)
    .filter((id) => !candidateIds.has(id));
  const modificationRows = applied.map((change) => [
    change.predictionId,
    change.user,
    change.gp,
    change.kind === 'entry' ? `entry:${change.entryId}` : 'prediction',
    change.field,
    change.before,
    change.after,
  ]);
  const obsoleteEntryRows = obsoleteEntries.map((entry) => [
    entry.predictionId,
    entry.user,
    entry.gp,
    entry.entryId,
    entry.predictionType,
    entry.proposedPoints,
    entry.reason,
  ]);
  const candidateRows = report.candidates.map((candidate) => {
    const before = snapshot.predictions.find((row) => row.id === candidate.predictionId);
    const after = postSnapshot.predictions.find((row) => row.id === candidate.predictionId);
    const expected = expectedFromCandidate(candidate);
    return [
      candidate.user,
      candidate.gp,
      candidate.predictionId,
      PREDICTION_FIELDS.map((field) => numberOrZero(before?.[field])).join('/'),
      PREDICTION_FIELDS.map((field) => numberOrZero(after?.[field])).join('/'),
      Object.values(expected).join('/'),
      after && comparePredictionFields(after, expected) ? 'PASS' : 'FAIL',
    ];
  });

  const caseRows = EXPECTED_CASES.map((expected) => {
    const candidate = report.candidates.find((item) => caseMatches(item, expected));
    const after = candidate
      ? postSnapshot.predictions.find((row) => row.id === candidate.predictionId)
      : null;
    const actualComponents = after
      ? [after.qualifying_points, after.sprint_points, after.race_points]
      : [];
    const pass = Boolean(after)
      && numberOrZero(after.total_points) === expected.total
      && (!expected.components || jsonEqual(actualComponents.map(numberOrZero), expected.components));
    return [
      `${expected.label ?? expected.user} / ${expected.gp}`,
      candidate?.predictionId ?? '—',
      expected.components ? expected.components.join(' + ') : '—',
      expected.total,
      after?.total_points ?? '—',
      pass ? 'PASS' : 'FAIL',
    ];
  });

  const malusRows = task38Verification.map((row) => {
    const after = postSnapshot.predictions.find((prediction) => prediction.id === row.predictionId);
    const expectedMalus = row.ncCount >= 5 ? -10 : row.ncCount >= 3 ? -5 : row.ncCount >= 1 ? -1 : 0;
    return [
      row.predictionId,
      row.ncCount,
      row.correctedMalus,
      after?.malus_points ?? '—',
      expectedMalus,
      after && numberOrZero(after.malus_points) === expectedMalus ? 'PASS' : 'FAIL',
    ];
  });

  return [
    '# Task 39 — Apply scoring storico finale',
    '',
    `- Data/ora avvio apply: **${startedAt}**`,
    `- Data/ora fine apply: **${finishedAt}**`,
    `- Lega: **FantaTest (${LEAGUE_CODE})**`,
    `- Fonte autorizzativa: **${INPUT_REPORT}**`,
    `- RPC \`score_prediction\`: **0**`,
    `- Stato rollback: **${rollbackStatus}**`,
    `- Preflight completato prima delle scritture: **SI**`,
    '',
    '## Riepilogo',
    '',
    `- Prediction candidate: **${report.candidates.length}**`,
    `- Prediction aggiornate: **${changedPredictionIds.size}**`,
    `- Prediction già corrette: **${report.candidates.length - changedPredictionIds.size}**`,
    `- Entry aggiornate: **${changedEntryIds.size}**`,
    `- Entry obsolete escluse: **${obsoleteEntries.length}**`,
    `- Record esclusi dal perimetro: **${excludedIds.length}**`,
    `- Prediction partial escluse: **${report.partialIds.length}**`,
    `- Errori: **${errors.length}**`,
    `- PATCH aggregate pianificate: **${plan.filter((item) => item.kind === 'prediction').length}**`,
    `- PATCH entry pianificate: **${plan.filter((item) => item.kind === 'entry').length}**`,
    `- Record saltati dopo recheck: **${skipped.length}**`,
    '',
    '## Entry obsolete escluse dal preflight',
    '',
    obsoleteEntryRows.length
      ? mdTable(
        ['Prediction ID', 'Utente', 'GP', 'Entry ID', 'Tipo', 'Punti proposti', 'Motivo'],
        obsoleteEntryRows,
      )
      : 'Nessuna entry obsolete rilevata.',
    '',
    '## Tabella completa delle modifiche',
    '',
    applied.length
      ? mdTable(
        ['Prediction ID', 'Utente', 'GP', 'Record', 'Campo', 'Valore precedente', 'Valore nuovo'],
        modificationRows,
      )
      : 'Nessuna modifica eseguita.',
    '',
    '## Confronto DB pre/post e Task 38',
    '',
    mdTable(
      ['Utente', 'GP', 'Prediction ID', 'DB pre Q/S/R/B/M/T', 'DB post Q/S/R/B/M/T',
        'Task 38 atteso Q/S/R/B/M/T', 'Esito'],
      candidateRows,
    ),
    '',
    '## Casi obbligatori',
    '',
    mdTable(['Caso', 'Prediction ID', 'Componenti attese', 'Totale atteso', 'Totale DB', 'Esito'], caseRows),
    '',
    '## Controllo Malus Gara per NC',
    '',
    'La classificazione NC e il malus corretto sono riletti dalla tabella dry-run del Task 38; '
      + 'non è stata introdotta una nuova interpretazione.',
    malusRows.length
      ? mdTable(['Prediction ID', 'NC Task 38', 'Malus Task 38', 'Malus DB post', 'Malus da soglia', 'Esito'], malusRows)
      : 'Nessuna riga NC con variazione nel report Task 38.',
    '',
    '## Verifiche di integrità',
    '',
    `- Prediction candidate conformi al totale atteso: **${verification.candidateFailures.length === 0 ? 'PASS' : 'FAIL'}**`,
    `- Entry candidate conformi ai punti attesi: **${verification.entryFailures.length === 0 ? 'PASS' : 'FAIL'}**`,
    `- Entry obsolete escluse dal controllo di conformità: **${verification.obsoleteEntryFailures.length === 0 ? 'PASS' : 'FAIL'}**`,
    `- Prediction fuori perimetro invariate: **${verification.outOfScopeFailures.length === 0 ? 'PASS' : 'FAIL'}**`,
    `- Prediction partial invariate: **${verification.partialFailures.length === 0 ? 'PASS' : 'FAIL'}**`,
    `- Record Marino / Aragon creati: **NO**`,
    `- Schema/RLS/session_results modificati dallo script: **NO**`,
    `- Niky / Thailandia = 21: **${caseRows[0]?.[5] ?? 'FAIL'}**`,
    `- Marty / Catalogna = 13: **${caseRows[4]?.[5] ?? 'FAIL'}**`,
    `- Errori post-apply: **${verification.postErrors.length}**`,
    `- Verifica rollback: **${rollbackStatus === 'NON NECESSARIO' || rollbackStatus === 'COMPLETATO' ? 'PASS' : 'FAIL'}**`,
    '',
    '## Verifica Excel',
    '',
    `Tutti i ${report.candidates.length} record sono stati confrontati con i valori proposti dal report Task 38. `
      + `Esiti non conformi: **${candidateRows.filter((row) => row.at(-1) !== 'PASS').length}**.`,
    '',
    '## Errori',
    '',
    errors.length ? errors.map((error) => `- ${error}`).join('\n') : '- Nessun errore.',
    '',
    '## Verifiche finali',
    '',
    `- Task 38 source verification: **${task38Verification.every((row) => row.correctedMalus === (
      row.ncCount >= 5 ? -10 : row.ncCount >= 3 ? -5 : row.ncCount >= 1 ? -1 : 0
    )) ? 'PASS' : 'FAIL'}**`,
    '- Nessuna prediction partial modificata senza autorizzazione.',
    '- Nessuna nuova prediction o entry creata.',
    '- Nessuna migration, RPC, schema, RLS o risultato ufficiale modificato.',
    '',
  ].join('\n');
}

async function verifyAfter({
  client,
  report,
  preSnapshot,
  postSnapshot,
  plan,
  obsoleteEntries,
}) {
  const postPredictionsById = mapById(postSnapshot.predictions);
  const postEntriesById = mapById(postSnapshot.entries);
  const candidateFailures = [];
  const entryFailures = [];
  const obsoleteEntryIds = new Set(obsoleteEntries.map((entry) => entry.entryId));
  const obsoleteEntryFailures = [];
  for (const candidate of report.candidates) {
    const after = postPredictionsById.get(candidate.predictionId);
    if (!after || !comparePredictionFields(after, expectedFromCandidate(candidate))) {
      candidateFailures.push(candidate.predictionId);
    }
    for (const entry of candidate.entries) {
      if (obsoleteEntryIds.has(entry.id)) continue;
      const afterEntry = postEntriesById.get(entry.id);
      if (!afterEntry || !compareEntryPoints(afterEntry, entry.proposedPoints)) {
        entryFailures.push(entry.id);
      }
    }
  }
  for (const obsoleteEntry of obsoleteEntries) {
    if (postEntriesById.has(obsoleteEntry.entryId)) {
      obsoleteEntryFailures.push(obsoleteEntry.entryId);
    }
  }

  const candidateIds = new Set(report.candidates.map((candidate) => candidate.predictionId));
  const prePredictionsById = mapById(preSnapshot.predictions);
  const outOfScopeFailures = [];
  for (const prediction of preSnapshot.predictions) {
    if (candidateIds.has(prediction.id)) continue;
    const after = postPredictionsById.get(prediction.id);
    if (!after || !jsonEqual(prediction, after)) outOfScopeFailures.push(prediction.id);
  }
  const candidateEntryIds = new Set(report.candidates.flatMap((candidate) =>
    candidate.entries.map((entry) => entry.id)));
  for (const entry of preSnapshot.entries) {
    if (candidateEntryIds.has(entry.id)) continue;
    const after = postEntriesById.get(entry.id);
    if (!after || !jsonEqual(entry, after)) outOfScopeFailures.push(`entry:${entry.id}`);
  }

  const partialIds = new Set(report.partialIds);
  const partialFailures = [];
  for (const id of partialIds) {
    const before = prePredictionsById.get(id);
    const after = postPredictionsById.get(id);
    if (!before || !after || !jsonEqual(before, after)) partialFailures.push(id);
  }

  const postErrors = [];
  if (candidateFailures.length) postErrors.push(`prediction candidate non conformi: ${candidateFailures.length}`);
  if (entryFailures.length) postErrors.push(`entry candidate non conformi: ${entryFailures.length}`);
  if (obsoleteEntryFailures.length) {
    postErrors.push(`entry obsolete riapparse dopo il preflight: ${obsoleteEntryFailures.length}`);
  }
  if (outOfScopeFailures.length) postErrors.push(`record fuori perimetro modificati: ${outOfScopeFailures.length}`);
  if (partialFailures.length) postErrors.push(`partial modificate: ${partialFailures.length}`);
  return {
    candidateFailures,
    entryFailures,
    obsoleteEntryFailures,
    outOfScopeFailures,
    partialFailures,
    postErrors,
    planCount: plan.length,
  };
}

async function main() {
  const startedAt = new Date().toISOString();
  const markdown = await readFile(INPUT_REPORT, 'utf8');
  const report = parseTask38Report(markdown);
  const client = createSupabaseClient();

  const [seasons, leagues] = await Promise.all([
    client.get(`/seasons?year=eq.${SEASON_YEAR}&select=id,year`),
    client.get(`/leagues?invite_code=eq.${LEAGUE_CODE}&select=id,name,invite_code`),
  ]);
  if (seasons.length !== 1 || leagues.length !== 1) {
    throw new Error('Stagione o lega TEST01 non univoca.');
  }
  const leagueId = safeUuid(leagues[0].id, 'League ID');

  const preSnapshot = await loadDbSnapshot(client, leagueId);
  const { plan, obsoleteEntries } = buildPlan(report, preSnapshot);
  let applied = [];
  let skipped = [];
  let errors = [];
  let rollbackStatus = 'NON NECESSARIO';
  try {
    const result = await applyPlan(client, plan);
    applied = result.applied;
    skipped = result.skipped;
  } catch (error) {
    rollbackStatus = error.message.includes('Rollback completato')
      ? 'COMPLETATO'
      : 'ERRORE — verificare manualmente';
    errors.push(error.message);
  }

  const postSnapshot = await loadDbSnapshot(client, leagueId);
  const verification = await verifyAfter({
    client,
    report,
    preSnapshot,
    postSnapshot,
    plan,
    obsoleteEntries,
  });
  errors.push(...verification.postErrors);
  const finishedAt = new Date().toISOString();
  const task38Verification = report.malusRows;
  const finalReport = buildReport({
    startedAt,
    finishedAt,
    report,
    snapshot: preSnapshot,
    postSnapshot,
    plan,
    applied,
    skipped,
    errors,
    verification,
    task38Verification,
    rollbackStatus,
    obsoleteEntries,
  });
  await mkdir('.agents/outputs', { recursive: true });
  await writeFile(OUTPUT_REPORT, finalReport, 'utf8');

  if (errors.length) {
    throw new Error(`Task 39 FAIL: ${errors.join(' | ')}. Report: ${OUTPUT_REPORT}`);
  }
  console.log('TASK 39 APPLY COMPLETATO');
  console.log(`Prediction candidate: ${report.candidates.length}`);
  console.log(`Prediction aggiornate: ${new Set(applied.filter((item) => item.kind === 'prediction').map((item) => item.predictionId)).size}`);
  console.log(`Entry aggiornate: ${new Set(applied.filter((item) => item.kind === 'entry').map((item) => item.entryId)).size}`);
  console.log(`Prediction già corrette: ${report.candidates.length - new Set(applied.filter((item) => item.kind === 'prediction').map((item) => item.predictionId)).size}`);
  console.log(`Report: ${OUTPUT_REPORT}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}