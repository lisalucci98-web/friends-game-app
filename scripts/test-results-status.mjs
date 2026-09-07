import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const componentPath = new URL(
  '../artifacts/my-first-app/src/components/Task21Results.tsx',
  import.meta.url,
);
const source = await readFile(componentPath, 'utf8');

const hasScoreMatch = source.match(
  /function hasScore\(prediction: PredictionScore \| undefined\) \{[\s\S]*?\n\}/,
);
assert.ok(hasScoreMatch, 'La funzione hasScore non è stata trovata.');

const hasScore = new Function(
  `return (${hasScoreMatch[0].replace(
    'prediction: PredictionScore | undefined',
    'prediction',
  )});`,
)();

const statusMatch = source.match(
  /function statusForPrediction\([\s\S]*?\n\}\n\nfunction predictionForGp/,
);
assert.ok(statusMatch, 'La funzione statusForPrediction non è stata trovata.');

const statusForPrediction = new Function(
  'hasScore',
  'Flag',
  'CheckCircle2',
  'Clock3',
  `return (${statusMatch[0].replace(
    /\n\nfunction predictionForGp[\s\S]*$/,
    '',
  )
    .replace('prediction: PredictionScore | undefined,', 'prediction,')});`,
)(hasScore, 'Flag', 'CheckCircle2', 'Clock3');

const pendingZeroPrediction = {
  scored_at: null,
  qualifying_points: 0,
  sprint_points: 0,
  race_points: 0,
  bonus_points: 0,
  malus_points: 0,
  total_points: 0,
};
assert.equal(
  hasScore(pendingZeroPrediction),
  false,
  'Una prediction con scored_at nullo non deve risultare conteggiata.',
);
assert.equal(
  statusForPrediction(pendingZeroPrediction, true).label,
  'In attesa dei risultati',
  'Una prediction non conteggiata deve restare in attesa.',
);

const countedZeroPrediction = {
  ...pendingZeroPrediction,
  scored_at: '2026-03-29T12:00:00Z',
};
assert.equal(
  hasScore(countedZeroPrediction),
  true,
  'Lo zero deve restare un punteggio valido quando la prediction è conteggiata.',
);
assert.equal(
  statusForPrediction(countedZeroPrediction, true).label,
  'Punteggio disponibile',
);
assert.equal(
  statusForPrediction(undefined, true).label,
  'Non compilato',
  'Una prediction assente deve restare distinta da una prediction in attesa.',
);
assert.equal(
  hasScore({ ...pendingZeroPrediction, scored_at: undefined }),
  false,
  'Un timestamp assente non deve risultare come prediction conteggiata.',
);

console.log('Stati risultati verificati: attesa, zero conteggiato e prediction assente.');