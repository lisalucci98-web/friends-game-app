import assert from 'node:assert/strict';

import { buildPlan } from './task-39-scoring-apply.mjs';
import {
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

console.log(`PASS | casi obbligatori: ${REQUIRED_CASES.length}/10`);
console.log('PASS | casi speciali Qualifying Time, blank, #N/A, NC pronosticati e malus');