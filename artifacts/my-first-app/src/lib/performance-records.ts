import type { PredictionEntry, PredictionScore } from '@/components/Task21Results';

export function lapSeconds(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const text = String(value).trim().replace(',', '.');
  const match = text.match(/^(\d+)(?:[:'](\d{1,2}(?:\.\d+)?))?$/);
  if (!match) {
    const number = Number(text);
    return Number.isFinite(number) && number > 0 ? number : null;
  }
  const seconds = match[2] === undefined ? Number(match[1]) : Number(match[1]) * 60 + Number(match[2]);
  return seconds > 0 && Number.isFinite(seconds) ? seconds : null;
}

export function latestPredictions(rows: PredictionScore[]) {
  const newest = new Map<string, PredictionScore>();
  for (const row of rows) {
    const key = `${row.league_id}:${row.user_id}:${row.grand_prix_id}`;
    const prior = newest.get(key);
    const timestamp = (item: PredictionScore) => new Date(item.updated_at || item.created_at || 0).getTime() || 0;
    if (!prior || timestamp(row) > timestamp(prior)) newest.set(key, row);
  }
  return [...newest.values()];
}

export function bestScores(rows: PredictionScore[], getValue: (row: PredictionScore) => number | null) {
  const valid = rows.map(row => ({ row, value: getValue(row) })).filter((item): item is { row: PredictionScore; value: number } => item.value !== null && Number.isFinite(item.value));
  if (!valid.length) return null;
  const value = Math.max(...valid.map(item => item.value));
  return { value, rows: valid.filter(item => item.value === value).map(item => item.row) };
}

export function closestPole(rows: PredictionScore[], entries: PredictionEntry[], officialTimes: Map<string, number>) {
  const comparisons = rows.flatMap(row => {
    const official = officialTimes.get(row.grand_prix_id);
    const entry = entries.find(item => item.prediction_id === row.id && item.prediction_type === 'QUALIFYING_TIME');
    const predicted = lapSeconds(entry?.predicted_time ?? row.qualifying_pole_time);
    return official !== undefined && predicted !== null ? [{ row, error: Math.abs(predicted - official) }] : [];
  });
  if (!comparisons.length) return null;
  const value = Math.min(...comparisons.map(item => item.error));
  return { value, rows: comparisons.filter(item => Math.abs(item.error - value) < 0.000001).map(item => item.row), comparisons: comparisons.length };
}

export function outAccuracy(rows: PredictionScore[], entries: PredictionEntry[]) {
  const counters = new Map<string, { hits: number; attempts: number }>();
  for (const row of rows) {
    const entry = entries.find(item => item.prediction_id === row.id && item.prediction_type === 'RACE_OUT');
    // Only certified entry points count: null is "not scored", not a wrong guess.
    if (!entry?.rider_id || entry.points === null || !Number.isFinite(Number(entry.points))) continue;
    const counter = counters.get(row.user_id) ?? { hits: 0, attempts: 0 };
    counter.attempts++;
    if (Number(entry.points) >= 2) counter.hits++;
    counters.set(row.user_id, counter);
  }
  if (!counters.size) return null;
  const value = Math.max(...[...counters.values()].map(item => item.hits));
  return { value, users: [...counters].filter(([, item]) => item.hits === value).map(([userId, item]) => ({ userId, ...item })) };
}