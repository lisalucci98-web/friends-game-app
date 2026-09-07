import assert from 'node:assert/strict';

import {
  auditPartialRows,
  buildReport,
  parsePartialRows,
} from './task-57-partial-malus-audit.mjs';

const predictionId = '55555555-5555-4555-8555-555555555555';
const grandPrixId = '66666666-6666-4666-8666-666666666666';
const sessionId = '77777777-7777-4777-8777-777777777777';
const raceEntries = ['r1', 'r2', 'r3', 'r4', 'r5'].map((rider_id, index) => ({
  id: `88888888-8888-4888-8888-88888888888${index}`,
  prediction_id: predictionId,
  prediction_type: 'RACE',
  position: index + 1,
  rider_id,
  points: 0,
}));

const rows = auditPartialRows(
  [{
    user: 'fixture-user',
    gp: 'FRA',
    predictionId,
    missing: ['SPRINT'],
  }],
  {
    predictions: [{
      id: predictionId,
      grand_prix_id: grandPrixId,
      qualifying_points: 1,
      sprint_points: 2,
      race_points: 3,
      bonus_points: 4,
      malus_points: 0,
      total_points: 10,
    }],
    entries: raceEntries,
    raceSessions: [{
      id: sessionId,
      grand_prix_id: grandPrixId,
      type: 'RAC',
      status: 'FINISHED',
      session_date: '2026-01-01T00:00:00Z',
    }],
    raceResults: ['r1', 'r2', 'classified'].map((rider_id, index) => ({
      id: `99999999-9999-4999-8999-99999999999${index}`,
      session_id: sessionId,
      rider_id,
      position: index + 1,
      status: rider_id === 'classified' ? 'CLASSIFIED' : 'NOT_CLASSIFIED',
    })),
  },
);

assert.equal(rows.length, 1);
assert.equal(rows[0].status, 'AUDITABLE');
assert.equal(rows[0].raceEntryCount, 5);
assert.equal(rows[0].ncCount, 2);
assert.equal(rows[0].expectedMalus, -1);
assert.equal(rows[0].dbMalus, 0);
assert.equal(rows[0].dbTotal, 10);
assert.equal(rows[0].expectedTotal, 9);

const report = buildReport({
  partialRows: [{ predictionId }],
  auditRows: rows,
  generatedAt: '2026-09-07T00:00:00.000Z',
});
assert.match(report, /PATCH Supabase eseguite: \*\*0\*\*/);
assert.match(report, /BLOCCATO — nessuna prediction partial è candidata a modifica/);
assert.match(report, /\|fixture-user\|FRA\|55555555-5555-4555-8555-555555555555\|5\|2\|-1\|0\|10\|9\|AUDITABLE\|/);

const parsed = parsePartialRows([
  '## Prediction partial escluse',
  '',
  '|Utente|GP|Prediction DB ID|Entry mancanti|',
  '|---|---|---|---|',
  '|a|FRA|55555555-5555-4555-8555-555555555555|SPRINT|',
  ...Array.from({ length: 29 }, (_, index) =>
    `|u${index}|GP|${String(index + 1).padStart(8, '0')}-5555-4555-8555-555555555555|SPRINT|`),
  '',
  '## Prediction extra fuori dalla sorgente storica',
].join('\n'));
assert.equal(parsed.length, 30);

console.log('PASS | Task 57 audit partial malus');