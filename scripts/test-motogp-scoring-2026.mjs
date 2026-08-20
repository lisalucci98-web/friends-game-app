/**
 * Test read-only dello scoring FantaMotoGP 2026.
 *
 * Il test invoca le RPC reali Supabase e non esegue INSERT, UPDATE o DELETE.
 * Per il test end-to-end è possibile passare PREDICTION_ID riferito a una
 * fixture isolata già predisposta nell'ambiente di test.
 */

const SUPABASE_URL = (
  process.env.SUPABASE_URL ??
  process.env.VITE_SUPABASE_URL ??
  ''
).replace(/\/$/, '');
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const ACTUAL_POLE_TIME = 116.160;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_URL/VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY sono richiesti.');
}

const headers = {
  apikey: SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
};

async function callRpc(name, body) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  const raw = await response.text();
  let value;
  try {
    value = JSON.parse(raw);
  } catch {
    value = raw;
  }
  if (!response.ok) {
    throw new Error(`${name} HTTP ${response.status}: ${raw}`);
  }
  return value;
}

const tests = [];
const skipped = [];

async function test(name, expected, body) {
  const actual = await callRpc('calculate_qualifying_time_points', body);
  const passed = Number(actual) === expected;
  tests.push({ name, expected, actual: Number(actual), passed });
}

await test('tempo esatto', 10, {
  p_predicted: ACTUAL_POLE_TIME,
  p_actual: ACTUAL_POLE_TIME,
});
await test('limite +0.010 s', 10, {
  p_predicted: ACTUAL_POLE_TIME + 0.010,
  p_actual: ACTUAL_POLE_TIME,
});
await test('limite -0.010 s', 10, {
  p_predicted: ACTUAL_POLE_TIME - 0.010,
  p_actual: ACTUAL_POLE_TIME,
});
await test('immediatamente oltre ±0.010 s, fascia 0.1%', 5, {
  p_predicted: ACTUAL_POLE_TIME + 0.010001,
  p_actual: ACTUAL_POLE_TIME,
});
await test('limite +0.1%', 5, {
  p_predicted: ACTUAL_POLE_TIME * 1.001,
  p_actual: ACTUAL_POLE_TIME,
});
await test('immediatamente oltre 0.1%, fascia 0.25%', 3, {
  p_predicted: ACTUAL_POLE_TIME * 1.001 + 0.000001,
  p_actual: ACTUAL_POLE_TIME,
});
await test('limite +0.25%', 3, {
  p_predicted: ACTUAL_POLE_TIME * 1.0025,
  p_actual: ACTUAL_POLE_TIME,
});
await test('immediatamente oltre 0.25%, fascia 0.5%', 1, {
  p_predicted: ACTUAL_POLE_TIME * 1.0025 + 0.000001,
  p_actual: ACTUAL_POLE_TIME,
});
await test('limite +0.5%', 1, {
  p_predicted: ACTUAL_POLE_TIME * 1.005,
  p_actual: ACTUAL_POLE_TIME,
});
await test('oltre 0.5%', 0, {
  p_predicted: ACTUAL_POLE_TIME * 1.005 + 0.000001,
  p_actual: ACTUAL_POLE_TIME,
});

if (process.env.PREDICTION_ID) {
  const breakdown = await callRpc('score_prediction', {
    p_prediction_id: process.env.PREDICTION_ID,
  });
  tests.push({
    name: 'score_prediction end-to-end su fixture isolata',
    expected: 'breakdown',
    actual: breakdown,
    passed: Boolean(breakdown),
  });
} else {
  skipped.push(
    'score_prediction end-to-end: nessun PREDICTION_ID di fixture isolata fornito; nessuna prediction reale è stata creata.',
  );
}

const passed = tests.filter((testCase) => testCase.passed);
const failed = tests.filter((testCase) => !testCase.passed);

console.log('\nSCORING FANTAMOTOGP 2026 — TEST RPC READ-ONLY');
console.log(`Test eseguiti: ${tests.length}`);
console.log(`Superati: ${passed.length}`);
console.log(`Falliti: ${failed.length}`);
console.log(`Saltati: ${skipped.length}`);
for (const testCase of tests) {
  const marker = testCase.passed ? '✓' : '✗';
  console.log(`${marker} ${testCase.name}: atteso ${testCase.expected}, ottenuto ${testCase.actual}`);
}
for (const item of skipped) console.log(`- ${item}`);

if (failed.length > 0) {
  console.error('\nDiscrepanze da correggere nello scoring server-side:');
  for (const testCase of failed) {
    console.error(`- ${testCase.name}: atteso ${testCase.expected}, ottenuto ${testCase.actual}`);
  }
  process.exitCode = 1;
}