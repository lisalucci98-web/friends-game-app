import assert from 'node:assert/strict';

import {
  buildOfficialResults,
  buildPrediction,
  comparison,
  entryAudit,
  secondsToExcelTime,
} from './validate-historical-excel-scoring-test01.mjs';

const riders = new Map([
  ['r1', { name: 'Marco', surname: 'Bezzecchi' }],
  ['r2', { name: 'Marc', surname: 'Marquez' }],
  ['r3', { name: 'Pedro', surname: 'Acosta' }],
  ['r4', { name: 'Joan', surname: 'Mir' }],
  ['r5', { name: 'Jorge', surname: 'Martin' }],
  ['r6', { name: 'Alex', surname: 'Marquez' }],
]);

const completeEntries = [
  { prediction_type: 'POLE', position: null, rider_id: 'r1' },
  { prediction_type: 'QUALIFYING_TIME', position: null, rider_id: null, predicted_time: 88.652 },
  { prediction_type: 'SPRINT', position: 1, rider_id: 'r3' },
  { prediction_type: 'SPRINT', position: 2, rider_id: 'r2' },
  { prediction_type: 'SPRINT', position: 3, rider_id: 'r5' },
  { prediction_type: 'RACE', position: 1, rider_id: 'r1' },
  { prediction_type: 'RACE', position: 2, rider_id: 'r3' },
  { prediction_type: 'RACE', position: 3, rider_id: 'r5' },
  { prediction_type: 'RACE', position: 4, rider_id: 'r2' },
  { prediction_type: 'RACE', position: 5, rider_id: 'r6' },
  { prediction_type: 'RACE_OUT', position: null, rider_id: 'r4' },
];

assert.deepEqual(entryAudit(completeEntries), {
  counts: {
    POLE: 1,
    QUALIFYING_TIME: 1,
    SPRINT: 3,
    RACE: 5,
    RACE_OUT: 1,
  },
  missing: [],
  duplicateSlots: [],
  complete: true,
});

const prediction = buildPrediction(completeEntries, riders);
assert.deepEqual(prediction, {
  pole: 'Marco Bezzecchi',
  qualifyingTime: 88.652,
  sprint: ['Pedro Acosta', 'Marc Marquez', 'Jorge Martin'],
  raceTopFive: [
    'Marco Bezzecchi',
    'Pedro Acosta',
    'Jorge Martin',
    'Marc Marquez',
    'Alex Marquez',
  ],
  out: 'Joan Mir',
});
assert.equal(secondsToExcelTime(prediction.qualifyingTime), '01:28.652');
assert.equal(secondsToExcelTime(100.6), '01:40.600');

const official = buildOfficialResults({
  qualifying: {
    results: [
      { position: 1, rider_id: 'r1', total_time: "1'28.652", status: 'CLASSIFIED' },
      { position: 2, rider_id: 'r2', total_time: "1'28.687", status: 'CLASSIFIED' },
    ],
  },
  sprint: {
    results: [
      { position: 1, rider_id: 'r3', status: 'CLASSIFIED' },
      { position: 2, rider_id: 'r2', status: 'CLASSIFIED' },
      { position: 3, rider_id: 'r5', status: 'CLASSIFIED' },
    ],
  },
  race: {
    results: [
      { position: 1, rider_id: 'r1', status: 'CLASSIFIED' },
      { position: 2, rider_id: 'r3', status: 'CLASSIFIED' },
      { position: 3, rider_id: 'r5', status: 'CLASSIFIED' },
      { position: 4, rider_id: 'r2', status: 'CLASSIFIED' },
      { position: 5, rider_id: 'r6', status: 'CLASSIFIED' },
      { position: 6, rider_id: 'r4', status: 'NOT_CLASSIFIED' },
    ],
  },
}, riders);

assert.equal(official.qualifyingTimeSeconds, 88.652);
assert.equal(official.outText, 'Joan Mir');
assert.deepEqual(official.sprintTopThree, [
  'Pedro Acosta',
  'Marc Marquez',
  'Jorge Martin',
]);

const incomplete = completeEntries.filter(
  (entry) => !(entry.prediction_type === 'QUALIFYING_TIME'),
);
assert.equal(entryAudit(incomplete).complete, false);
assert.deepEqual(entryAudit(incomplete).missing, ['QUALIFYING_TIME']);

const databasePrediction = {
  qualifying_points: 15,
  sprint_points: 9,
  race_points: 15,
  bonus_points: 2,
  malus_points: 0,
  total_points: 41,
};
const row = {
  score: {
    qualifying: 15,
    sprint: 9,
    race: 17,
    racePosition: 15,
    bonus: 2,
    malus: 0,
    total: 41,
  },
  item: { prediction: databasePrediction },
};
const result = comparison(row);
assert.equal(result.categoryMatch, false);
assert.equal(result.componentMatch, true);

console.log('✓ Replay offline, conversione risultati e blocco incomplete verificati.');