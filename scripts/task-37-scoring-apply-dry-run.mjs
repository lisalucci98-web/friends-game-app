/**
 * Task 37 — dry-run obbligatorio per la correzione controllata dello scoring
 * storico su TEST01.
 *
 * Questo script legge Supabase con service-role, calcola offline i punti per
 * le entry e scrive esclusivamente il report locale. Non contiene scritture
 * Supabase e non invoca score_prediction.
 *
 * Un record è ricostruibile solo quando:
 * - è nella sorgente storica e ha tutte le entry richieste;
 * - esistono risultati ufficiali completi;
 * - coincide con uno dei fixture canonici Task 32;
 * - il replay offline coincide esattamente con il fixture Excel.
 *
 * Tutti gli altri record restano bloccati: non è sicuro trasformare il
 * confronto con risultati live in una prova del punteggio storico Excel.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

import {
  REQUIRED_CASES,
} from './historical-scoring-spec.mjs';
import {
  buildOfficialResults,
  buildPrediction,
  chooseOfficialSession,
  createReadOnlyClient,
  entryAudit,
  parseSource,
  selectHistoricalPredictions,
} from './validate-historical-excel-scoring-test01.mjs';
import {
  detailedScore,
  predictionMatchesFixture,
  scoreMatchesFixture,
} from './audit-historical-scoring-task34.mjs';

const SOURCE =
  'attached_assets/Pasted-GP-Utente-Pole-position-tempo-pole-1-sprint-2-sprint-3-_1788342259417.txt';
const REPORT = '.agents/outputs/task-37-scoring-apply-dry-run.md';
const SEASON_YEAR = 2026;
const LEAGUE_CODE = 'TEST01';
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

function display(value) {
  return value === null || value === undefined || value === '' ? '—' : String(value);
}

function md(value) {
  return display(value).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

function numberOrZero(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function numberOrNull(value) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function sum(values) {
  return values.reduce((total, value) => total + numberOrZero(value), 0);
}

function mdTable(headers, rows) {
  const separator = headers.map(() => '---').join('|');
  return [
    `|${headers.join('|')}|`,
    `|${separator}|`,
    ...rows.map((row) => `|${row.map(md).join('|')}|`),
  ].join('\n');
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
  const [usersResponse, members, grandPrix, predictions, riders, sessions, profiles] =
    await Promise.all([
      client.authGet('/admin/users?page=1&per_page=1000'),
      client.get(`/league_members?league_id=eq.${league.id}&select=league_id,user_id`),
      client.get(`/grand_prix?season_id=eq.${seasonId}&is_test=eq.false`
        + '&select=id,name,short_name,country,circuit,date_start,date_end&order=date_start.asc'),
      client.get(`/predictions?league_id=eq.${league.id}`
        + '&select=id,user_id,grand_prix_id,league_id,created_at,updated_at,scored_at,'
        + 'qualifying_pole_time,qualifying_points,sprint_points,race_points,bonus_points,'
        + 'malus_points,total_points&order=created_at.asc'),
      client.get('/riders?select=id,name,surname,nickname'),
      client.get('/sessions?select=id,grand_prix_id,type,status,session_date,number'
        + '&order=session_date.asc'),
      client.get('/profiles?select=id,user_id,name'),
    ]);

  const relevantSessions = sessions.filter((session) =>
    grandPrix.some((gp) => gp.id === session.grand_prix_id));
  const results = await getChunks(
    client,
    relevantSessions.map((session) => session.id),
    (ids) => `/session_results?session_id=in.(${ids.join(',')})`
      + '&select=id,session_id,rider_id,position,total_time,status',
  );
  const resultsBySession = new Map();
  for (const result of results) {
    const current = resultsBySession.get(result.session_id) ?? [];
    current.push(result);
    resultsBySession.set(result.session_id, current);
  }

  const entries = await getChunks(
    client,
    predictions.map((prediction) => prediction.id),
    (ids) => `/prediction_entries?prediction_id=in.(${ids.join(',')})`
      + '&select=id,prediction_id,prediction_type,position,rider_id,predicted_time,points'
      + '&order=prediction_id.asc,prediction_type.asc,position.asc',
  );

  return {
    season: seasons[0],
    league,
    users: usersResponse.users ?? [],
    members,
    grandPrix,
    predictions,
    riders,
    sessions: relevantSessions,
    profiles,
    resultsBySession,
    entries,
  };
}

function entriesFor(entries, predictionId) {
  return entries.filter((entry) => entry.prediction_id === predictionId);
}

function riderName(ridersById, riderId) {
  const rider = ridersById.get(riderId);
  if (!rider) return riderId ?? '—';
  return `${rider.name ?? ''} ${rider.surname ?? ''}`.trim()
    || rider.nickname
    || riderId
    || '—';
}

function userLabel(item, usersById, profilesByUserId) {
  return profilesByUserId.get(item.userId)?.name
    ?? usersById.get(item.userId)?.email?.split('@')[0]
    ?? item.email
    ?? item.userId;
}

function fixtureForItem(item, usersById) {
  const email = normalizedEmail(usersById.get(item.userId)?.email);
  return REQUIRED_CASES.find((fixture) =>
    normalizedEmail(fixture.email) === email
      && GP_CODES.get(fixture.gp) === item.gp.short_name
  ) ?? null;
}

function predictionKey(email, gpCode) {
  return `${normalizedEmail(email)}|${gpCode}`;
}

function requiredFixtureKey(fixture) {
  return predictionKey(fixture.email, GP_CODES.get(fixture.gp));
}

function currentAggregate(prediction) {
  return {
    qualifying: numberOrZero(prediction.qualifying_points),
    sprint: numberOrZero(prediction.sprint_points),
    race: numberOrZero(prediction.race_points),
    bonus: numberOrZero(prediction.bonus_points),
    malus: numberOrZero(prediction.malus_points),
    total: numberOrZero(prediction.total_points),
  };
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

function aggregateChanged(current, proposed) {
  return ['qualifying', 'sprint', 'race', 'bonus', 'malus', 'total']
    .some((field) => current[field] !== proposed[field]);
}

function plannedPoint(entry, score) {
  switch (entry.prediction_type) {
    case 'POLE':
      return score.polePoints;
    case 'QUALIFYING_TIME':
      return score.qualifyingTime;
    case 'SPRINT':
      return score.sprintSlots[Number(entry.position) - 1] ?? 0;
    case 'RACE':
      return score.raceSlots[Number(entry.position) - 1] ?? 0;
    case 'RACE_OUT':
      return score.outBonus;
    default:
      return null;
  }
}

function entryChanges(entries, score) {
  return entries
    .map((entry) => ({
      ...entry,
      proposedPoints: plannedPoint(entry, score),
      currentPoints: numberOrNull(entry.points),
    }))
    .filter((entry) => entry.currentPoints !== entry.proposedPoints);
}

function coverageForGp(item, context) {
  return {
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
}

function hasOfficialCoverage(coverage) {
  return Boolean(coverage.qualifying && coverage.sprint && coverage.race);
}

function sourceRowsByFixture(rows) {
  const result = new Map();
  for (const row of rows) {
    const gpCode = GP_CODES.get(String(row.cells[0] ?? '').trim());
    const email = row.cells[1];
    if (!gpCode || !email || row.malformed) continue;
    result.set(predictionKey(email, gpCode), row);
  }
  return result;
}

function fixtureStatusRows({
  rows,
  selection,
  auditRows,
  context,
  usersById,
}) {
  const selectedByKey = new Map(
    selection.items.map((item) => [
      predictionKey(usersById.get(item.userId)?.email, item.gp.short_name),
      item,
    ]),
  );
  const auditById = new Map(auditRows.map((row) => [row.item.prediction.id, row]));
  const allByKey = new Map(
    context.predictions.map((prediction) => {
      const gp = context.grandPrix.find((candidate) =>
        candidate.id === prediction.grand_prix_id);
      const user = usersById.get(prediction.user_id);
      return [
        gp && user ? predictionKey(user.email, gp.short_name) : prediction.id,
        { prediction, gp, user },
      ];
    }),
  );
  const sourceByKey = sourceRowsByFixture(rows);

  return REQUIRED_CASES.map((fixture) => {
    const key = requiredFixtureKey(fixture);
    const item = selectedByKey.get(key);
    const all = allByKey.get(key);
    const auditRow = item ? auditById.get(item.prediction.id) : null;
    const sourceRow = sourceByKey.get(key);
    if (!sourceRow && all) {
      return {
        fixture,
        status: 'EXTRA_PREDICTION',
        prediction: all.prediction,
        gp: all.gp,
        reason: 'Prediction presente nel DB ma fuori dalla sorgente storica: lasciata inalterata.',
      };
    }
    if (!sourceRow) {
      return {
        fixture,
        status: 'MISSING_DB_PREDICTION',
        reason: 'Prediction DB non risolta per il caso storico richiesto; nessun record viene creato.',
      };
    }
    if (!item) {
      return {
        fixture,
        status: 'MISSING_DB_PREDICTION',
        reason: 'Riga storica presente ma prediction DB non risolta.',
      };
    }
    if (auditRow?.status === 'PARTIAL') {
      return {
        fixture,
        item,
        auditRow,
        status: 'PARTIAL',
        reason: `Entry mancanti: ${auditRow.audit.missing.join(', ') || '—'}.`,
      };
    }
    if (!auditRow?.hasOfficialData) {
      return {
        fixture,
        item,
        auditRow,
        status: fixture.gp === 'Qatar'
          ? 'QATAR_INSUFFICIENT_OFFICIAL_RESULTS'
          : 'NO_OFFICIAL_RESULTS',
        reason: 'Risultati ufficiali insufficienti per il replay.',
      };
    }
    if (!auditRow.predictionMatchesFixture) {
      return {
        fixture,
        item,
        auditRow,
        status: 'HISTORICAL_UNCERTAIN',
        reason: 'Le entry DB non coincidono esattamente con il fixture Excel.',
      };
    }
    if (!auditRow.historicalScoreMatchesFixture) {
      return {
        fixture,
        item,
        auditRow,
        status: 'SCORING_DIFFERENCE',
        reason: 'Il replay offline sulla fotografia ufficiale del fixture non coincide con Excel.',
      };
    }
    return {
      fixture,
      item,
      auditRow,
      status: 'FIXTURE_RECONSTRUCTIBLE',
      reason: 'Entry e replay sulla fotografia ufficiale storica coincidono esattamente con Excel.',
    };
  });
}

function buildReport({
  rows,
  context,
  selection,
  auditRows,
  fixtureRows,
  candidates,
  blockers,
  extraPredictions,
  usersById,
  profilesByUserId,
}) {
  const complete = auditRows.filter((row) => row.audit.complete);
  const partial = auditRows.filter((row) => !row.audit.complete);
  const qatarRows = auditRows.filter((row) => row.status === 'QATAR_INSUFFICIENT_OFFICIAL_RESULTS');
  const uncertain = auditRows.filter((row) => row.status === 'HISTORICAL_UNCERTAIN');
  const candidateEntries = candidates.flatMap((candidate) => candidate.entryChanges);
  const changedAggregates = candidates.filter((candidate) =>
    aggregateChanged(candidate.current, candidate.proposed));
  const fixtureCounts = Object.fromEntries(
    [...new Set(fixtureRows.map((row) => row.status))]
      .map((status) => [status, fixtureRows.filter((row) => row.status === status).length]),
  );
  const safe = blockers.length === 0;
  const userForItem = (item) => userLabel(item, usersById, profilesByUserId);

  const fixtureTable = fixtureRows.map((row) => {
    const score = row.auditRow?.historicalScore ?? row.auditRow?.score;
    const current = row.auditRow?.current;
    const proposed = row.auditRow?.proposed;
    return [
      `${row.fixture.user} / ${row.fixture.gp}`,
      row.status,
      row.item?.prediction.id ?? row.prediction?.id ?? '—',
      current ? `${current.qualifying}/${current.sprint}/${current.race}/${current.total}` : '—',
      proposed ? `${proposed.qualifying}/${proposed.sprint}/${proposed.race}/${proposed.total}` : '—',
      row.auditRow?.score
        ? `${row.auditRow.score.qualifying}/${row.auditRow.score.sprint}/${row.auditRow.score.race}/${row.auditRow.score.total}`
        : '—',
      score ? `${score.sprintSlots.join(',')} / ${score.raceSlots.join(',')}` : '—',
      row.reason,
    ];
  });

  const candidateTable = candidates.map((candidate) => [
    userForItem(candidate.item),
    candidate.item.gp.short_name,
    candidate.item.prediction.id,
    candidate.entryChanges.length,
    candidate.entryChanges.filter((entry) => entry.currentPoints === 0).length,
    `${candidate.current.qualifying}/${candidate.current.sprint}/${candidate.current.race}`
      + `/${candidate.current.bonus}/${candidate.current.malus}/${candidate.current.total}`,
    `${candidate.proposed.qualifying}/${candidate.proposed.sprint}/${candidate.proposed.race}`
      + `/${candidate.proposed.bonus}/${candidate.proposed.malus}/${candidate.proposed.total}`,
    candidate.score.total,
  ]);

  const entryTable = candidateEntries.map((entry) => {
    const candidate = candidates.find((item) => item.item.prediction.id === entry.prediction_id);
    return [
      candidate ? userForItem(candidate.item) : '—',
      candidate?.item.gp.short_name ?? '—',
      entry.prediction_id,
      entry.prediction_type,
      entry.position ?? '—',
      entry.id,
      entry.currentPoints,
      entry.proposedPoints,
    ];
  });

  const uncertainExamples = uncertain.slice(0, 12).map((row) => [
    userForItem(row.item),
    row.item.gp.short_name,
    row.item.prediction.id,
    row.reason,
  ]);
  const extraRows = extraPredictions.map((prediction) => {
    const gp = context.grandPrix.find((item) => item.id === prediction.grand_prix_id);
    const user = usersById.get(prediction.user_id);
    return [
      user?.email ?? prediction.user_id,
      gp?.short_name ?? prediction.grand_prix_id,
      prediction.id,
      'INALTERATA',
      'Fuori dalla sorgente storica',
    ];
  });

  const lines = [
    '# Task 37 — Dry-run correzione controllata dello scoring storico',
    '',
    '## Esito del gate',
    '',
    `- Dry-run read-only: **completato**.`,
    `- Scritture Supabase eseguite: **0**.`,
    `- RPC di scoring invocate: **0**.`,
    `- Apply autorizzabile: **${safe ? 'SÌ' : 'NO — BLOCCATO'}**.`,
    '',
    safe
      ? 'Il perimetro è completamente coerente; l’apply potrebbe essere eseguito '
        + 'solo in una fase esplicita successiva.'
      : 'L’apply è bloccato automaticamente: restano partial, dati storici senza '
        + 'fixture verificabile o risultati ufficiali insufficienti. Non viene '
        + 'eseguito alcun UPDATE e non viene usato score_prediction.',
    '',
    '## Perimetro letto',
    '',
    `- Righe sorgente: **${rows.length}**.`,
    `- Prediction nella lega TEST01: **${context.predictions.length}**.`,
    `- Prediction risolte nella sorgente storica: **${selection.items.length}**.`,
    `- Prediction complete: **${complete.length}**.`,
    `- Prediction partial: **${partial.length}**.`,
    `- Prediction extra fuori sorgente: **${extraPredictions.length}**.`,
    `- Errori di selezione: **${selection.errors.length}**.`,
    '',
    'La selezione storica usa la chiave utente + GP + lega. Le prediction fuori '
      + 'sorgente non sono candidabili anche se hanno risultati replayabili.',
    '',
    '## Classificazione dei 10 fixture obbligatori',
    '',
    mdTable(
      ['Caso', 'Stato', 'Prediction ID', 'DB Q/S/R/T', 'Proposto Q/S/R/T',
        'Replay live Q/S/R/T', 'Entry Sprint / Gara', 'Motivo'],
      fixtureTable,
    ),
    '',
    `Distribuzione fixture: ${Object.entries(fixtureCounts)
      .map(([key, value]) => `${key}=${value}`).join(', ') || '—'}.`,
    '',
    'Regole speciali applicate:',
    '- Marino / Aragon è classificato `MISSING_DB_PREDICTION`; nessun record viene creato.',
    '- Nicholas / Aragon e Nicholas / RSM, se fuori dalla sorgente, sono `EXTRA_PREDICTION` '
      + 'e restano inalterati.',
    '- Qatar resta bloccato se la copertura ufficiale non è sufficiente.',
    '- Le prediction partial restano inalterate.',
    '',
    '### Extra DB fuori sorgente',
    '',
    extraRows.length
      ? mdTable(['Utente', 'GP', 'Prediction ID', 'Azione', 'Motivo'], extraRows)
      : 'Nessun extra DB.',
    '',
    '## Record che verrebbero aggiornati se il gate fosse sbloccato',
    '',
    `- Prediction candidate: **${candidates.length}**.`,
    `- Prediction aggregate candidate con almeno una differenza: **${changedAggregates.length}**.`,
    `- Entry candidate con differenza punti: **${candidateEntries.length}**.`,
    '',
    candidates.length
      ? mdTable(
        ['Utente', 'GP', 'Prediction ID', 'Entry Δ', 'Entry già a 0',
          'DB Q/S/R/B/M/T', 'Proposto Q/S/R/B/M/T', 'Totale replay'],
        candidateTable,
      )
      : 'Nessun record candidato.',
    '',
    'I punti delle entry sono assegnati solo alla relativa previsione: Pole, tempo '
      + 'Qualifica, Sprint P1–P3, Gara P1–P5 e bonus OUT. Bonus top-five/exact-order, '
      + 'penalty OUT e malus L restano componenti aggregate della Gara e non vengono '
      + 'attribuiti artificialmente a un’altra entry.',
    '',
    candidateEntries.length
      ? mdTable(
        ['Utente', 'GP', 'Prediction ID', 'Tipo', 'Posizione', 'Entry ID',
          'DB points', 'Proposed points'],
        entryTable,
      )
      : 'Nessuna entry candidata.',
    '',
    '## Prediction complete senza prova storica sufficiente',
    '',
    `- Complete senza fixture Excel canonico utilizzabile: **${uncertain.length}**.`,
    `- Qatar con copertura insufficiente: **${qatarRows.length}**.`,
    uncertainExamples.length
      ? mdTable(['Utente', 'GP', 'Prediction ID', 'Motivo'], uncertainExamples)
      : 'Nessun esempio.',
    '',
    'Il fatto che un replay corrente sia calcolabile non è sufficiente per applicare '
      + 'quel valore allo storico: per questi record manca una prova Excel comparabile '
      + 'oppure il confronto è condizionato da dati storici non verificabili.',
    '',
    '## Blocker del gate',
    '',
    blockers.length
      ? blockers.map((blocker) => `- ${blocker}`).join('\n')
      : '- Nessun blocker.',
    '',
    '## Decisione',
    '',
    safe
      ? '- Fase B non eseguita in questo script; il dry-run è coerente e può essere sottoposto ad approvazione esplicita.'
      : '- Fase B non eseguita. Prima di qualunque apply serve risolvere i blocker e ripetere questo dry-run.',
    '- Non sono stati modificati score_prediction, dati dei pronostici, rider, GP, utenti, timestamp o risultati ufficiali.',
    '- La classifica non è stata ricalcolata né alterata.',
    '',
  ];

  return `${lines.join('\n')}\n`;
}

async function main() {
  const client = createReadOnlyClient();
  const rows = parseSource(await readFile(SOURCE, 'utf8'));
  const context = await loadContext(client);
  const selection = selectHistoricalPredictions(rows, context);
  const entriesByPrediction = new Map();
  for (const prediction of context.predictions) {
    entriesByPrediction.set(prediction.id, entriesFor(context.entries, prediction.id));
  }

  const ridersById = new Map(context.riders.map((rider) => [rider.id, rider]));
  const usersById = new Map(context.users.map((user) => [user.id, user]));
  const profilesByUserId = new Map(context.profiles.map((profile) => [profile.user_id, profile]));
  const coverageByGp = new Map();
  const officialByGp = new Map();
  for (const item of selection.items) {
    if (coverageByGp.has(item.gp.id)) continue;
    const coverage = coverageForGp(item, context);
    coverageByGp.set(item.gp.id, coverage);
    if (hasOfficialCoverage(coverage)) {
      officialByGp.set(item.gp.id, buildOfficialResults(coverage, ridersById));
    }
  }

  const auditRows = selection.items.map((item) => {
    const entries = entriesByPrediction.get(item.prediction.id) ?? [];
    const audit = entryAudit(entries);
    const coverage = coverageByGp.get(item.gp.id);
    const hasOfficialData = Boolean(coverage && hasOfficialCoverage(coverage));
    if (!audit.complete) {
      return {
        item,
        entries,
        audit,
        status: 'PARTIAL',
        hasOfficialData,
        predictionMatchesFixture: false,
        scoreMatchesFixture: false,
        current: currentAggregate(item.prediction),
        proposed: null,
        score: null,
      };
    }
    if (!hasOfficialData) {
      return {
        item,
        entries,
        audit,
        status: item.gp.short_name === 'QAT'
          ? 'QATAR_INSUFFICIENT_OFFICIAL_RESULTS'
          : 'NO_OFFICIAL_RESULTS',
        hasOfficialData: false,
        predictionMatchesFixture: false,
        scoreMatchesFixture: false,
        current: currentAggregate(item.prediction),
        proposed: null,
        score: null,
      };
    }
    const prediction = buildPrediction(entries, ridersById);
    const score = detailedScore(prediction, officialByGp.get(item.gp.id));
    const fixture = fixtureForItem(item, usersById);
    const matchesPrediction = Boolean(fixture && predictionMatchesFixture(prediction, fixture));
    const historicalScore = fixture
      ? detailedScore(fixture.prediction, fixture.official)
      : null;
    const matchesHistoricalScore = Boolean(
      fixture
      && historicalScore
      && scoreMatchesFixture(historicalScore, fixture),
    );
    return {
      item,
      entries,
      audit,
      status: fixture && matchesPrediction ? 'COMPLETE' : 'HISTORICAL_UNCERTAIN',
      hasOfficialData: true,
      prediction,
      score,
      historicalScore,
      fixture,
      predictionMatchesFixture: matchesPrediction,
      scoreMatchesFixture: matchesHistoricalScore,
      historicalScoreMatchesFixture: matchesHistoricalScore,
      current: currentAggregate(item.prediction),
      proposed: historicalScore ? proposedAggregate(historicalScore) : null,
    };
  });

  const auditById = new Map(auditRows.map((row) => [row.item.prediction.id, row]));
  const fixtureRows = fixtureStatusRows({
    rows,
    selection,
    auditRows,
    context,
    usersById,
  });
  for (const fixtureRow of fixtureRows) {
    if (fixtureRow.item) fixtureRow.auditRow = auditById.get(fixtureRow.item.prediction.id);
  }

  const selectedIds = new Set(selection.items.map((item) => item.prediction.id));
  const extraPredictions = context.predictions.filter((prediction) => !selectedIds.has(prediction.id));
  const candidateFixtureKeys = new Set(
    fixtureRows
      .filter((row) => row.status === 'FIXTURE_RECONSTRUCTIBLE')
      .map((row) => requiredFixtureKey(row.fixture)),
  );
  const candidates = auditRows
    .filter((row) => row.fixture
      && row.predictionMatchesFixture
      && row.historicalScoreMatchesFixture
      && candidateFixtureKeys.has(requiredFixtureKey(row.fixture)))
    .map((row) => ({
      ...row,
      score: row.historicalScore,
      entryChanges: entryChanges(row.entries, row.score),
    }));

  const blockers = [];
  if (selection.errors.length) {
    blockers.push(`errori di selezione: ${selection.errors.length}`);
  }
  if (auditRows.some((row) => row.status === 'PARTIAL')) {
    blockers.push(`prediction partial presenti: ${auditRows.filter((row) => row.status === 'PARTIAL').length}`);
  }
  const noOfficial = auditRows.filter((row) =>
    row.status === 'NO_OFFICIAL_RESULTS' || row.status === 'QATAR_INSUFFICIENT_OFFICIAL_RESULTS');
  if (noOfficial.length) {
    blockers.push(`risultati ufficiali insufficienti: ${noOfficial.length}`);
  }
  const noFixture = auditRows.filter((row) => row.status === 'HISTORICAL_UNCERTAIN');
  if (noFixture.length) {
    blockers.push(`prediction complete senza replay Excel canonico verificabile: ${noFixture.length}`);
  }
  const fixtureBlockers = fixtureRows.filter((row) => row.status !== 'FIXTURE_RECONSTRUCTIBLE');
  if (fixtureBlockers.length) {
    blockers.push(`fixture obbligatori non tutti ricostruibili: ${fixtureBlockers.length}`);
  }
  if (candidates.some((candidate) => candidate.item.gp.short_name === 'QAT')) {
    blockers.push('rischio Qatar: un candidate non può bypassare il gate ufficiale');
  }

  const report = buildReport({
    rows,
    context,
    selection,
    auditRows,
    fixtureRows,
    candidates,
    blockers,
    extraPredictions,
    usersById,
    profilesByUserId,
  });
  await writeFile(REPORT, report, 'utf8');

  console.log('TASK 37 DRY-RUN COMPLETATO');
  console.log(`Prediction storiche: ${selection.items.length}`);
  console.log(`Complete/partial: ${auditRows.filter((row) => row.audit.complete).length}/`
    + `${auditRows.filter((row) => !row.audit.complete).length}`);
  console.log(`Fixture ricostruibili: ${candidates.length}/${REQUIRED_CASES.length}`);
  console.log(`Entry candidate: ${candidates.reduce((total, row) => total + row.entryChanges.length, 0)}`);
  console.log(`Gate apply: ${blockers.length ? 'BLOCCATO' : 'SBLOCCATO'}`);
  console.log('Scritture Supabase: 0');
  console.log(`Report: ${REPORT}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}

export {
  buildReport,
  entryChanges,
  loadContext,
  plannedPoint,
};