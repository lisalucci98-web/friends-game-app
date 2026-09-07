import assert from 'node:assert/strict';

import {
  aggregateTotal,
  applyPlan,
  buildMalusPreflight,
  buildPlan,
  verifyAfter,
} from './task-39-scoring-apply.mjs';
import {
  auditRaceMalus,
  REQUIRED_CASES,
  countPredictedNc,
  parseExcelTime,
  predictionAggregateFromScore,
  qualifyingTimePoints,
  malusFromNcCount,
  malusFromL,
  scorePrediction,
} from './historical-scoring-spec.mjs';

const predictionId = '11111111-1111-4111-8111-111111111111';
const existingEntryId = '22222222-2222-4222-8222-222222222222';
const obsoleteEntryId = '33333333-3333-4333-8333-333333333333';

const applyReport = {
  candidates: [{
    predictionId,
    user: 'Test',
    gp: 'GP',
    score: {
      qualifying_points: 1,
      sprint_points: 2,
      race_points: 3,
      bonus_points: 4,
      malus_points: -1,
      total_points: 9,
    },
    entries: [
      {
        id: existingEntryId,
        prediction_type: 'SPRINT',
        proposedPoints: 5,
      },
      {
        id: obsoleteEntryId,
        prediction_type: 'RACE',
        proposedPoints: 4,
      },
    ],
  }],
};

const preflight = buildPlan(applyReport, {
  predictions: [{
    id: predictionId,
    league_id: '44444444-4444-4444-8444-444444444444',
    qualifying_points: 0,
    sprint_points: 0,
    race_points: 0,
    bonus_points: 0,
    malus_points: 0,
    total_points: 0,
  }],
  entries: [{
    id: existingEntryId,
    prediction_id: predictionId,
    prediction_type: 'SPRINT',
    position: 1,
    points: 0,
  }],
});

assert.equal(preflight.obsoleteEntries.length, 1);
assert.equal(preflight.obsoleteEntries[0].entryId, obsoleteEntryId);
assert.equal(preflight.obsoleteEntries[0].reason, 'missing-from-preflight');
assert.deepEqual(
  preflight.plan.map((item) => item.kind),
  ['prediction', 'entry'],
);
assert.equal(
  preflight.plan.some((item) => item.entryId === obsoleteEntryId),
  false,
);
console.log('PASS | preflight entry obsolete classificata senza PATCH pianificata');

const componentKeys = [
  'polePoints',
  'qualifyingTime',
  'qualifying',
  'sprint',
  'racePosition',
  'exactPositions',
  'topFiveBonus',
  'exactOrderBonus',
  'outBonus',
  'bonus',
  'outPenalty',
  'L',
  'malus',
  'race',
  'total',
];

for (const fixture of REQUIRED_CASES) {
  const actual = scorePrediction(fixture.prediction, fixture.official);
  for (const key of componentKeys) {
    assert.equal(
      actual[key],
      fixture.excel[key],
      `${fixture.user}/${fixture.gp}: ${key} Excel=${fixture.excel[key]} Calc=${actual[key]}`,
    );
  }
  assert.equal(
    actual.ncCount,
    fixture.excel.L,
    `${fixture.user}/${fixture.gp}: NC non coincide`,
  );
  assert.equal(
    actual.total,
    fixture.excel.total,
    `${fixture.user}/${fixture.gp}: totale non coincide`,
  );
  console.log(
    `PASS | ${fixture.user} | ${fixture.gp} | `
      + `Q ${actual.qualifying} (pole ${actual.polePoints}, time ${actual.qualifyingTime}) | `
      + `S ${actual.sprint} | R ${actual.race} | `
      + `B ${actual.bonus} | O ${actual.outBonus} | M ${actual.malus} | `
      + `T ${actual.total}`,
  );
}

// Qualifying Time: entrambi i separatori funzionano, le soglie sono strette.
assert.equal(parseExcelTime('01:28.526'), 88.526);
assert.equal(parseExcelTime('01:17:850'), 77.850);
assert.equal(qualifyingTimePoints(1000, 1000), 10);
assert.equal(qualifyingTimePoints(1000.009, 1000), 10);
assert.equal(qualifyingTimePoints(1000.010001, 1000), 5);
assert.equal(qualifyingTimePoints(1000.099, 1000), 5);
assert.equal(qualifyingTimePoints(1001, 1000), 3);
assert.equal(qualifyingTimePoints(1002.49, 1000), 3);
assert.equal(qualifyingTimePoints(1002.5, 1000), 1);
assert.equal(qualifyingTimePoints(1004.99, 1000), 1);
assert.equal(qualifyingTimePoints(1005, 1000), 0);
assert.equal(qualifyingTimePoints(null, 100), 0);
assert.equal(qualifyingTimePoints(100, null), 0);
assert.throws(() => parseExcelTime('#N/A'), /non un rider valido/);
assert.throws(
  () => scorePrediction(
    { pole: '#N/A', qualifyingTime: '', sprint: ['', '', ''], raceTopFive: ['', '', '', '', ''], out: '' },
    {
      pole: 'P1', secondQualifying: 'P2', qualifyingTimeSeconds: 100,
      sprintTopThree: [], raceTopFive: [], outText: '',
    },
  ),
  /non un rider valido/,
);

// Sprint mancante e prediction parziale: i blank nelle posizioni sono zero
// per le matrici e non sono piloti pronosticati ai fini del malus NC.
const partial = scorePrediction(
  { pole: '', qualifyingTime: '', sprint: ['P1', '', ''], raceTopFive: ['P1', '', '', '', ''], out: '' },
  {
    pole: 'P1', secondQualifying: 'P2', qualifyingTimeSeconds: 100,
    sprintTopThree: ['P1', 'P2', 'P3'], raceTopFive: ['P1', 'P2', 'P3', 'P4', 'P5'],
    outText: 'P9',
  },
);
assert.equal(partial.qualifying, 0);
assert.equal(partial.sprint, 3);
assert.equal(partial.racePosition, 5);
assert.equal(partial.outBonus, 2); // SEARCH("", Out)
assert.equal(partial.ncCount, 0);
assert.equal(partial.L, 0);
assert.equal(partial.malus, 0);

for (const [nc, expected] of [[0, 0], [1, -1], [2, -1], [3, -5], [4, -5], [5, -10]]) {
  assert.equal(malusFromNcCount(nc), expected, `${nc} NC`);
  assert.equal(malusFromL(nc), expected, `alias L con ${nc} NC`);
}

// I campi aggregati del database tengono Gara, Bonus e Malus separati.
// Il totale deve quindi essere autosommante senza contare due volte bonus/malus.
assert.deepEqual(
  predictionAggregateFromScore({
    qualifying: 1,
    sprint: 2,
    racePosition: 1,
    bonus: 2,
    malus: -1,
    race: 2,
    total: 5,
  }),
  {
    qualifying: 1,
    sprint: 2,
    race: 1,
    bonus: 2,
    malus: -1,
    total: 5,
  },
);

// La gara può avere più NC ufficiali, ma conta solo l'intersezione con la
// Top 5 pronosticata: 2 NC tra i 5 pick restano -1 anche con 7 NC ufficiali.
const predictedNc = countPredictedNc(
  ['A', 'B', 'X', 'Y', 'Z'],
  new Set(['A', 'B', 'R1', 'R2', 'R3', 'R4', 'R5']),
);
assert.equal(predictedNc, 2);
assert.equal(malusFromNcCount(predictedNc), -1);

function raceEntries(riderIds) {
  return riderIds.map((rider_id, index) => ({
    prediction_type: 'RACE',
    position: index + 1,
    rider_id,
  }));
}

function raceResults(outRiderIds) {
  return [
    ...outRiderIds.map((rider_id, index) => ({
      rider_id,
      position: index + 6,
      status: index === 0 ? 'NOT_CLASSIFIED' : 'DNF',
    })),
    { rider_id: 'classified-rider', position: 1, status: 'CLASSIFIED' },
  ];
}

// Le soglie sono cumulative e coprono esplicitamente entrambi i confini.
const malusFixtures = [
  { label: '0 NC', out: [], expected: 0 },
  { label: '1 NC', out: ['r1'], expected: -1 },
  { label: '2 NC', out: ['r1', 'r2'], expected: -1 },
  { label: '3 NC', out: ['r1', 'r2', 'r3'], expected: -5 },
  { label: '4 NC', out: ['r1', 'r2', 'r3', 'r4'], expected: -5 },
  { label: '5+ NC', out: ['r1', 'r2', 'r3', 'r4', 'r5', 'r6'], expected: -10 },
];
for (const fixture of malusFixtures) {
  const audit = auditRaceMalus(
    raceEntries(['r1', 'r2', 'r3', 'r4', 'r5']),
    raceResults(fixture.out),
  );
  assert.equal(audit.ncCount, Math.min(fixture.out.length, 5), fixture.label);
  assert.equal(audit.expectedMalus, fixture.expected, fixture.label);
}

// Anche una prediction parziale (solo i cinque entry Gara) riceve il malus
// corretto: la completezza di Sprint/Qualifica non è una condizione del gate.
const partialRaceAudit = auditRaceMalus(
  raceEntries(['r1', 'r2', 'r3', 'r4', 'r5']),
  raceResults(['r1', 'r2']),
);
assert.equal(partialRaceAudit.ncCount, 2);
assert.equal(partialRaceAudit.expectedMalus, -1);

const malusPredictionId = '55555555-5555-4555-8555-555555555555';
const malusPreflight = buildMalusPreflight(
  {
    candidates: [{
      predictionId: malusPredictionId,
      score: {
        qualifying_points: 1,
        sprint_points: 2,
        race_points: 3,
        bonus_points: 4,
        malus_points: -5,
        total_points: 5,
      },
    }],
  },
  {
    predictions: [{
      id: malusPredictionId,
      grand_prix_id: '66666666-6666-4666-8666-666666666666',
      malus_points: 0,
    }],
    entries: raceEntries(['r1', 'r2', 'r3', 'r4', 'r5']).map((entry) => ({
      ...entry,
      prediction_id: malusPredictionId,
    })),
    raceSessions: [{
      id: '77777777-7777-4777-8777-777777777777',
      grand_prix_id: '66666666-6666-4666-8666-666666666666',
      type: 'RAC',
      status: 'FINISHED',
    }],
    raceResults: raceResults(['r1', 'r2', 'r3']).map((result) => ({
      ...result,
      session_id: '77777777-7777-4777-8777-777777777777',
    })),
  },
);
assert.equal(malusPreflight.rows[0].ncCount, 3);
assert.equal(malusPreflight.rows[0].expectedMalus, -5);
assert.equal(malusPreflight.rows[0].currentMalus, 0);
assert.equal(malusPreflight.currentDivergences.length, 1);
assert.equal(malusPreflight.failures.length, 0);

const blockedPreflight = buildMalusPreflight(
  {
    candidates: [{
      predictionId: malusPredictionId,
      score: {
        qualifying_points: 1,
        sprint_points: 2,
        race_points: 3,
        bonus_points: 4,
        malus_points: -1,
        total_points: 9,
      },
    }],
  },
  {
    predictions: [{
      id: malusPredictionId,
      grand_prix_id: '66666666-6666-4666-8666-666666666666',
      malus_points: 0,
    }],
    entries: raceEntries(['r1', 'r2', 'r3', 'r4', 'r5']).map((entry) => ({
      ...entry,
      prediction_id: malusPredictionId,
    })),
    raceSessions: [{
      id: '77777777-7777-4777-8777-777777777777',
      grand_prix_id: '66666666-6666-4666-8666-666666666666',
      type: 'RAC',
      status: 'FINISHED',
    }],
    raceResults: raceResults(['r1', 'r2', 'r3']).map((result) => ({
      ...result,
      session_id: '77777777-7777-4777-8777-777777777777',
    })),
  },
);
assert.equal(blockedPreflight.failures.length, 1);
assert.equal(blockedPreflight.failures[0].reason, 'report-malus-diverges-from-official-RAC');

assert.equal(aggregateTotal({
  qualifying_points: 1,
  sprint_points: 2,
  race_points: 3,
  bonus_points: 4,
  malus_points: -5,
}), 5);
assert.notEqual(aggregateTotal({
  qualifying_points: 1,
  sprint_points: 2,
  race_points: 3,
  bonus_points: 4,
  malus_points: -1,
}), 5);

// Un PATCH fallito dopo due scritture deve lasciare il client simulato
// esattamente nello snapshot iniziale: sia gli aggregati (incluso il malus)
// sia l'entry già aggiornata devono essere ripristinati.
const rollbackPredictionId = '88888888-8888-4888-8888-888888888888';
const failedPredictionId = '99999999-9999-4999-8999-999999999999';
const rollbackEntryId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const initialRollbackPrediction = {
  id: rollbackPredictionId,
  qualifying_points: 10,
  sprint_points: 20,
  race_points: 30,
  bonus_points: 0,
  malus_points: -5,
  total_points: 59,
};
const initialFailedPrediction = {
  id: failedPredictionId,
  qualifying_points: 6,
  sprint_points: 7,
  race_points: 8,
  bonus_points: 1,
  malus_points: 0,
  total_points: 22,
};
const initialRollbackEntry = {
  id: rollbackEntryId,
  prediction_id: rollbackPredictionId,
  prediction_type: 'RACE',
  points: 0,
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createFailingSupabaseClient({ predictions, entries, failOnPatch }) {
  const state = { predictions: clone(predictions), entries: clone(entries) };
  let patchCount = 0;
  let successfulPatchCount = 0;
  const patchLog = [];

  function parseTarget(path) {
    const match = path.match(/^\/(predictions|prediction_entries)\?id=eq\.([^&]+)/);
    assert.ok(match, `path PATCH inatteso: ${path}`);
    return { table: match[1], id: match[2] };
  }

  function stateTable(table) {
    return table === 'prediction_entries' ? 'entries' : table;
  }

  return {
    state,
    patchLog,
    get patchCount() {
      return patchCount;
    },
    get successfulPatchCount() {
      return successfulPatchCount;
    },
    async get(path) {
      const { table, id } = parseTarget(path);
      const row = state[stateTable(table)].find((candidate) => candidate.id === id);
      return row ? [clone(row)] : [];
    },
    async patch(path, body) {
      patchCount += 1;
      patchLog.push({ path, body: clone(body) });
      if (patchCount === failOnPatch) {
        throw new Error('simulated PATCH failure');
      }
      const { table, id } = parseTarget(path);
      const row = state[stateTable(table)].find((candidate) => candidate.id === id);
      assert.ok(row, `record PATCH non trovato: ${table}/${id}`);
      Object.assign(row, body);
      successfulPatchCount += 1;
      return [clone(row)];
    },
  };
}

const failingClient = createFailingSupabaseClient({
  predictions: [initialRollbackPrediction, initialFailedPrediction],
  entries: [initialRollbackEntry],
  // Prediction, entry e poi il PATCH che deve fallire: almeno due modifiche
  // sono quindi state applicate prima di avviare il rollback.
  failOnPatch: 3,
});
await assert.rejects(
  () => applyPlan(failingClient, [
    {
      kind: 'prediction',
      predictionId: rollbackPredictionId,
      user: 'Test',
      gp: 'GP',
      desired: {
        qualifying_points: 1,
        sprint_points: 2,
        race_points: 3,
        bonus_points: 4,
        malus_points: -1,
        total_points: 9,
      },
    },
    {
      kind: 'entry',
      predictionId: rollbackPredictionId,
      entryId: rollbackEntryId,
      user: 'Test',
      gp: 'GP',
      desired: { points: 7 },
    },
    {
      kind: 'prediction',
      predictionId: failedPredictionId,
      user: 'Test',
      gp: 'GP 2',
      desired: {
        qualifying_points: 1,
        sprint_points: 1,
        race_points: 1,
        bonus_points: 0,
        malus_points: -1,
        total_points: 2,
      },
    },
  ]),
  /simulated PATCH failure\. Rollback completato\./,
);
assert.equal(failingClient.successfulPatchCount >= 2, true);
assert.equal(failingClient.patchCount, 10);
assert.deepEqual(
  failingClient.state.predictions.find((row) => row.id === rollbackPredictionId),
  initialRollbackPrediction,
);
assert.deepEqual(
  failingClient.state.predictions.find((row) => row.id === failedPredictionId),
  initialFailedPrediction,
);
assert.deepEqual(
  failingClient.state.entries.find((row) => row.id === rollbackEntryId),
  initialRollbackEntry,
);
console.log('PASS | PATCH fallito dopo modifiche: aggregate, malus ed entry ripristinati');

// La verifica post-apply deve distinguere un totale non autosommante anche
// quando gli altri campi e il malus Gara sono coerenti.
const totalCheckPredictionId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const totalCheckSessionId = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const totalCheckReport = {
  candidates: [{
    predictionId: totalCheckPredictionId,
    user: 'Test',
    gp: 'GP',
    score: {
      qualifying_points: 1,
      sprint_points: 2,
      race_points: 3,
      bonus_points: 4,
      malus_points: 0,
      total_points: 9,
    },
    entries: [],
  }],
  partialIds: [],
};
const totalCheckSnapshot = {
  predictions: [{
    id: totalCheckPredictionId,
    grand_prix_id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
    qualifying_points: 1,
    sprint_points: 2,
    race_points: 3,
    bonus_points: 4,
    malus_points: 0,
    // 1 + 2 + 3 + 4 + 0 = 10, quindi 9 è volutamente errato.
    total_points: 9,
  }],
  entries: [],
  raceSessions: [{
    id: totalCheckSessionId,
    grand_prix_id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
    type: 'RAC',
    status: 'FINISHED',
  }],
  raceResults: [{
    id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
    session_id: totalCheckSessionId,
    rider_id: 'classified-rider',
    position: 1,
    status: 'CLASSIFIED',
  }],
};
const postApplyVerification = await verifyAfter({
  client: {},
  report: totalCheckReport,
  preSnapshot: totalCheckSnapshot,
  postSnapshot: totalCheckSnapshot,
  plan: [],
  obsoleteEntries: [],
});
assert.deepEqual(postApplyVerification.totalFailures, [totalCheckPredictionId]);
assert.ok(
  postApplyVerification.postErrors.some((error) =>
    error.includes('totali post-apply non autosommanti: 1')),
);
console.log('PASS | verifica post-apply segnala il totale non autosommante');

console.log(`PASS | casi obbligatori: ${REQUIRED_CASES.length}/10`);
console.log('PASS | casi speciali Qualifying Time, blank, #N/A, NC pronosticati e malus');