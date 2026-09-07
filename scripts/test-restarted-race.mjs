import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import {
  auditRaceMalus,
  scorePrediction,
} from './historical-scoring-spec.mjs';
import {
  chooseOfficialRaceSessions,
  isRaceOutStatus,
  pairRaceSessions,
  raceOutRiderIds,
} from './race-results-utils.mjs';

const fixture = JSON.parse(await readFile(
  new URL('./fixtures/catalonia-restarted-race.json', import.meta.url),
));
const apiSessions = fixture.sessions.map(({ id, type, number }) => ({ id, type, number }));
const dbSessions = fixture.sessions.map(({ id, type, number, status }) => ({
  id,
  type,
  number,
  status,
  grand_prix_id: 'catalonia',
}));
const pairs = pairRaceSessions(apiSessions, dbSessions);
const groupedResults = new Map(fixture.sessions.map((session) => [session.id, session.results]));
const officialCoverage = chooseOfficialRaceSessions(dbSessions, groupedResults, 'catalonia');

assert.equal(pairs.length, 2);
assert.equal(officialCoverage.length, 2);
assert.deepEqual(
  officialCoverage.map(({ session }) => session.number),
  [null, 2],
);
assert.deepEqual(
  pairs.map(({ apiSession, dbSession }) => [apiSession.number, dbSession.id]),
  [
    [null, '58452c1f-d739-49a3-aa71-046010b64ff1'],
    [2, '96d63c76-6917-40e9-9fb7-2261d9d96d57'],
  ],
);
assert.notEqual(pairs[0].dbSession.id, pairs[1].dbSession.id);
assert.equal(isRaceOutStatus('Not on Restart Grid'), true);

const resultSets = fixture.sessions.map((session) => session.results);
const outIds = raceOutRiderIds(resultSets);
assert.equal(outIds.size, 5);
assert.deepEqual(
  [...outIds].sort(),
  fixture.sessions
    .flatMap((session) => session.results)
    .filter((result) => result.status !== 'CLASSIFIED')
    .map((result) => result.rider_id)
    .filter((riderId, index, ids) => ids.indexOf(riderId) === index)
    .sort(),
);

const raceEntries = [...outIds].map((rider_id, index) => ({
  prediction_type: 'RACE',
  position: index + 1,
  rider_id,
}));
const audit = auditRaceMalus(raceEntries, resultSets);
assert.equal(audit.ncCount, 5);
assert.equal(audit.expectedMalus, -10);

const scored = scorePrediction(
  {
    pole: '',
    qualifyingTime: '',
    sprint: ['', '', ''],
    raceTopFive: [...outIds],
    out: '',
  },
  {
    pole: 'unrelated',
    secondQualifying: 'unrelated',
    qualifyingTimeSeconds: null,
    sprintTopThree: [],
    raceTopFive: [],
    outRiderIds: outIds,
  },
);
assert.equal(scored.ncCount, 5);
assert.equal(scored.malus, -10);

console.log('PASS | Gara Catalogna ripartita: RAC/RAC2 separate, 5 OUT uniti, malus -10');