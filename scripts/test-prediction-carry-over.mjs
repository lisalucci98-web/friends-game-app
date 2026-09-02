const entryTypesBySession = {
  Q: ['POLE', 'QUALIFYING_TIME'],
  SPR: ['SPRINT'],
  RAC: ['RACE', 'RACE_OUT'],
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function applyCarryOver({ current, previous, sessionType }) {
  const entryTypes = entryTypesBySession[sessionType];
  if (!entryTypes) throw new Error(`Unknown session type: ${sessionType}`);

  const currentEntries = current?.entries ?? [];
  if (currentEntries.some((entry) => entryTypes.includes(entry.prediction_type))) {
    return current;
  }

  const previousEntries = (previous?.entries ?? []).filter((entry) =>
    entryTypes.includes(entry.prediction_type),
  );
  if (!previousEntries.length) return current;

  const next = current
    ? clone(current)
    : { id: 'current', entries: [] };
  const existingKeys = new Set(
    next.entries.map((entry) => `${entry.prediction_type}:${entry.position ?? 'null'}`),
  );

  for (const entry of previousEntries) {
    const key = `${entry.prediction_type}:${entry.position ?? 'null'}`;
    if (existingKeys.has(key)) continue;
    next.entries.push({
      ...clone(entry),
      points: 0,
      source: 'CARRY_OVER',
      carried_from_grand_prix_id: 'previous-gp',
    });
    existingKeys.add(key);
  }

  return next;
}

function score(entries) {
  return entries.reduce((total, entry) => total + (entry.points ?? 0), 0);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const previous = {
  id: 'previous-prediction',
  entries: [
    { prediction_type: 'POLE', position: null, rider_id: 'r1', points: 2 },
    { prediction_type: 'QUALIFYING_TIME', position: null, rider_id: 'r1', predicted_time: 85.2, points: 4 },
    { prediction_type: 'SPRINT', position: 1, rider_id: 'r2', points: 12 },
    { prediction_type: 'SPRINT', position: 2, rider_id: 'r3', points: 9 },
    { prediction_type: 'SPRINT', position: 3, rider_id: 'r4', points: 7 },
    { prediction_type: 'RACE', position: 1, rider_id: 'r2', points: 25 },
    { prediction_type: 'RACE_OUT', position: null, rider_id: 'r5', points: 2 },
  ],
};

const manualCurrent = {
  id: 'manual-current',
  entries: [{ prediction_type: 'SPRINT', position: 1, rider_id: 'manual-rider', points: 0, source: 'MANUAL' }],
};
assert(
  applyCarryOver({ current: manualCurrent, previous, sessionType: 'SPR' }).entries[0].rider_id === 'manual-rider',
  'manual current prediction must win',
);

const inherited = applyCarryOver({ current: undefined, previous, sessionType: 'RAC' });
assert(inherited.entries.length === 2, 'race carry-over should copy race and OUT entries');
assert(inherited.entries.every((entry) => entry.source === 'CARRY_OVER'), 'copied entries must be traceable');
assert(inherited.entries.every((entry) => entry.carried_from_grand_prix_id === 'previous-gp'), 'source GP must be preserved');

const noFallback = applyCarryOver({
  current: undefined,
  previous: { id: 'empty', entries: [] },
  sessionType: 'Q',
});
assert(noFallback === undefined, 'missing previous session must remain uncompiled');

const repeated = applyCarryOver({ current: inherited, previous, sessionType: 'RAC' });
assert(repeated.entries.length === inherited.entries.length, 'repeated carry-over must not duplicate entries');

const scoredCarryOver = inherited.entries.map((entry) => ({ ...entry, points: entry.rider_id === 'r2' ? 25 : 2 }));
assert(score(scoredCarryOver) === 27, 'carry-over entries must participate in normal scoring');

const leaderboard = [
  { user: 'manual', points: 30 },
  { user: 'carry-over', points: score(scoredCarryOver) },
].sort((a, b) => b.points - a.points);
assert(leaderboard[0].user === 'manual' && leaderboard[1].user === 'carry-over', 'leaderboard must include carry-over score');

console.log('prediction carry-over policy tests: 6 passed');