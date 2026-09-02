import assert from 'node:assert/strict';

import {
  REQUIRED_CASES,
  parseExcelTime,
  qualifyingTimePoints,
  malusFromL,
  scorePrediction,
} from './historical-scoring-spec.mjs';

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
assert.equal(qualifyingTimePoints(100, 100), 10);
assert.equal(qualifyingTimePoints(100.009, 100), 10);
assert.equal(qualifyingTimePoints(100.01, 100), 5);
assert.equal(qualifyingTimePoints(100.099, 100), 5);
assert.equal(qualifyingTimePoints(100.1, 100), 3);
assert.equal(qualifyingTimePoints(100.249, 100), 3);
assert.equal(qualifyingTimePoints(100.25, 100), 1);
assert.equal(qualifyingTimePoints(100.499, 100), 1);
assert.equal(qualifyingTimePoints(100.5, 100), 0);
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
// per le matrici; la semantica SEARCH vuota resta quella della formula Excel.
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
assert.equal(partial.L, 4); // P1 + quattro blank trovati
assert.equal(partial.malus, -5);

assert.equal(malusFromL(0), 0);
assert.equal(malusFromL(1), -1);
assert.equal(malusFromL(2), -1);
assert.equal(malusFromL(3), -5);
assert.equal(malusFromL(4), -5);
assert.equal(malusFromL(5), -10);

console.log(`PASS | casi obbligatori: ${REQUIRED_CASES.length}/10`);
console.log('PASS | casi speciali Qualifying Time, blank, #N/A e malus');