import assert from 'node:assert/strict';

import {
  buildEntryAudit,
  buildScoringPlan,
  executeScoring,
  getScoringTargets,
} from './score-historical-predictions.mjs';

const completeGpId = 'gp-complete';
const openGpId = 'gp-without-results';
const completeCoverage = {
  qualifying: { results: [{ rider_id: 'rider-1' }] },
  sprint: { results: [{ rider_id: 'rider-1' }] },
  race: { results: [{ rider_id: 'rider-1' }] },
};
const coverageByGp = new Map([
  [completeGpId, completeCoverage],
  [openGpId, { qualifying: null, sprint: null, race: null }],
]);

function prediction(id, grandPrixId = completeGpId) {
  return {
    id,
    user_id: 'user-1',
    grand_prix_id: grandPrixId,
    scored_at: null,
  };
}

function item(id, grandPrixId = completeGpId) {
  return {
    email: 'same-user@example.test',
    userId: 'user-1',
    gp: { id: grandPrixId, short_name: grandPrixId, name: grandPrixId },
    prediction: prediction(id, grandPrixId),
  };
}

function fullEntries(predictionId) {
  return [
    { prediction_id: predictionId, prediction_type: 'POLE', rider_id: 'rider-1' },
    { prediction_id: predictionId, prediction_type: 'QUALIFYING_TIME', rider_id: null },
    { prediction_id: predictionId, prediction_type: 'SPRINT', rider_id: 'rider-1' },
    { prediction_id: predictionId, prediction_type: 'SPRINT', rider_id: 'rider-1' },
    { prediction_id: predictionId, prediction_type: 'SPRINT', rider_id: 'rider-1' },
    { prediction_id: predictionId, prediction_type: 'RACE', rider_id: 'rider-1' },
    { prediction_id: predictionId, prediction_type: 'RACE', rider_id: 'rider-1' },
    { prediction_id: predictionId, prediction_type: 'RACE', rider_id: 'rider-1' },
    { prediction_id: predictionId, prediction_type: 'RACE', rider_id: 'rider-1' },
    { prediction_id: predictionId, prediction_type: 'RACE', rider_id: 'rider-1' },
    { prediction_id: predictionId, prediction_type: 'RACE_OUT', rider_id: 'rider-1' },
  ];
}

const complete = item('prediction-complete');
const missingQualifying = item('prediction-missing-qualifying');
const withoutOfficialResults = item('prediction-without-results', openGpId);
const items = [complete, missingQualifying, withoutOfficialResults];
const entriesByPrediction = new Map([
  [complete.prediction.id, fullEntries(complete.prediction.id)],
  [
    missingQualifying.prediction.id,
    fullEntries(missingQualifying.prediction.id)
      .filter((entry) => entry.prediction_type !== 'QUALIFYING_TIME'),
  ],
  [withoutOfficialResults.prediction.id, fullEntries(withoutOfficialResults.prediction.id)],
]);
const audit = buildEntryAudit(items, entriesByPrediction, coverageByGp, new Map());
const plan = buildScoringPlan(items, coverageByGp, audit);

assert.deepEqual(plan.toScore.map((entry) => entry.prediction.id), [
  complete.prediction.id,
]);
assert.deepEqual(plan.blocked.map((entry) => entry.prediction.id), [
  missingQualifying.prediction.id,
]);
assert.deepEqual(plan.writeCandidates, [complete.prediction.id]);
assert.equal(audit.incomplete.length, 1);
assert.equal(audit.incomplete[0].predictionId, missingQualifying.prediction.id);
assert.deepEqual([...audit.rpcUnsupportedIds], [missingQualifying.prediction.id]);
assert.equal(audit.missingResults.length, 0);
assert.equal(plan.evaluableGpIds.has(openGpId), false);

const duplicateDescriptionItems = [
  item('prediction-duplicate-description-complete'),
  item('prediction-duplicate-description-blocked'),
];
const duplicateEntries = new Map([
  [
    duplicateDescriptionItems[0].prediction.id,
    fullEntries(duplicateDescriptionItems[0].prediction.id),
  ],
  [
    duplicateDescriptionItems[1].prediction.id,
    fullEntries(duplicateDescriptionItems[1].prediction.id)
      .filter((entry) => entry.prediction_type !== 'QUALIFYING_TIME'),
  ],
]);
const duplicateAudit = buildEntryAudit(
  duplicateDescriptionItems,
  duplicateEntries,
  new Map([[completeGpId, completeCoverage]]),
  new Map(),
);
const duplicatePlan = buildScoringPlan(
  duplicateDescriptionItems,
  new Map([[completeGpId, completeCoverage]]),
  duplicateAudit,
);

assert.equal(duplicateAudit.rpcUnsupported.length, 1);
assert.equal(
  duplicateAudit.rpcUnsupported[0].predictionId,
  duplicateDescriptionItems[1].prediction.id,
);
assert.deepEqual(
  duplicatePlan.toScore.map((entry) => entry.prediction.id),
  [duplicateDescriptionItems[0].prediction.id],
);
assert.deepEqual(duplicatePlan.writeCandidates, [
  duplicateDescriptionItems[0].prediction.id,
]);

let rpcCalls = 0;
const fakeClient = {
  async rpc() {
    rpcCalls += 1;
    throw new Error('RPC non dovrebbe essere invocata in dry-run');
  },
};
assert.deepEqual(getScoringTargets(plan, false), []);
assert.deepEqual(await executeScoring(fakeClient, plan, false), []);
assert.equal(rpcCalls, 0);

const appliedCalls = [];
const applyingClient = {
  async rpc(name, body) {
    appliedCalls.push({ name, body });
  },
};
assert.deepEqual(await executeScoring(applyingClient, duplicatePlan, true), [
  { id: duplicateDescriptionItems[0].prediction.id, ok: true },
]);
assert.deepEqual(appliedCalls, [{
  name: 'score_prediction',
  body: { p_prediction_id: duplicateDescriptionItems[0].prediction.id },
}]);

console.log('✓ Audit e piano scoring per prediction ID verificati, incluso dry-run senza RPC.');