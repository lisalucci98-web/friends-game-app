import assert from 'node:assert/strict';

import { REQUIRED_CASES } from './historical-scoring-spec.mjs';
import {
  classifyAuditRow,
  detailedScore,
  predictionMatchesFixture,
  scoreMatchesFixture,
} from './audit-historical-scoring-task34.mjs';

const fixture = REQUIRED_CASES[0];
const matchingScore = {
  ...fixture.excel,
  sprintSlots: [1, 1, 1],
  raceSlots: [1, 1, 1, 1, 1],
};
const matchingComparison = {
  categoryMatch: true,
  componentMatch: true,
  fieldMatches: {
    qualifying: true,
    sprint: true,
    race: true,
    bonus: true,
    malus: true,
    total: true,
  },
};
const differentComparison = {
  categoryMatch: false,
  componentMatch: false,
  fieldMatches: {
    qualifying: false,
    sprint: true,
    race: false,
    bonus: true,
    malus: true,
    total: false,
  },
};

assert.equal(scoreMatchesFixture(matchingScore, fixture), true);
assert.equal(predictionMatchesFixture(fixture.prediction, fixture), true);

assert.equal(classifyAuditRow({
  comparison: matchingComparison,
  score: matchingScore,
  fixture,
  predictionMatches: true,
  hasOfficialData: true,
}).classification, 'MATCH');

assert.equal(classifyAuditRow({
  comparison: differentComparison,
  score: { ...matchingScore, total: matchingScore.total + 1 },
  fixture,
  predictionMatches: true,
  hasOfficialData: true,
}).classification, 'DATA_DIFFERENCE');

assert.equal(classifyAuditRow({
  comparison: differentComparison,
  score: matchingScore,
  fixture,
  predictionMatches: true,
  hasOfficialData: true,
}).classification, 'SCORING_DIFFERENCE');

assert.equal(classifyAuditRow({
  comparison: differentComparison,
  score: matchingScore,
  fixture: null,
  predictionMatches: false,
  hasOfficialData: true,
}).classification, 'HISTORICAL_UNCERTAIN');

assert.equal(classifyAuditRow({
  comparison: null,
  score: null,
  fixture: null,
  predictionMatches: false,
  hasOfficialData: false,
}).classification, 'MISSING_DATA');

const score = detailedScore({
  pole: 'Marco Bezzecchi',
  qualifyingTime: '01:28.526',
  sprint: ['Pedro Acosta', 'Marc Marquez', 'Marco Bezzecchi'],
  raceTopFive: ['Marco Bezzecchi', 'Marc Marquez', 'Pedro Acosta', '', ''],
  out: '',
}, {
  pole: 'Marco Bezzecchi',
  secondQualifying: 'Marc Marquez',
  qualifyingTimeSeconds: 88.526,
  sprintTopThree: ['Pedro Acosta', 'Marc Marquez', 'Marco Bezzecchi'],
  raceTopFive: ['Marco Bezzecchi', 'Marc Marquez', 'Pedro Acosta', '', ''],
  outText: '',
});
assert.deepEqual(score.sprintSlots, [3, 3, 3]);
assert.equal(score.sprint, 9);
assert.equal(score.racePosition, 15);
assert.equal(score.total, score.qualifying + score.sprint + score.race);

console.log('✓ Classificazione Task 34 e breakdown per slot verificati.');