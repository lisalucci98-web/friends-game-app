/**
 * Browser verification for the authenticated results surfaces.
 *
 * Required environment:
 *   VITE_SUPABASE_URL
 *   VITE_SUPABASE_ANON_KEY
 *   RESULTS_TEST_EMAIL
 *   RESULTS_TEST_PASSWORD
 *
 * Optional:
 *   RESULTS_APP_URL (default: http://127.0.0.1:21367)
 *   CHROMIUM_PATH (default: chromium)
 *
 * The credentials are read only by this process and are never printed.
 * The script uses Chromium's DevTools Protocol directly so it has no npm
 * browser dependency. It does not write to Supabase.
 */

import { spawn } from 'node:child_process';
import { once } from 'node:events';
import process from 'node:process';

const supabaseUrl = (process.env.VITE_SUPABASE_URL ?? '').replace(/\/$/, '');
const anonKey = process.env.VITE_SUPABASE_ANON_KEY ?? '';
const email = process.env.RESULTS_TEST_EMAIL ?? '';
const password = process.env.RESULTS_TEST_PASSWORD ?? '';
const appUrl = (process.env.RESULTS_APP_URL ?? 'http://127.0.0.1:21367').replace(/\/$/, '');
const chromiumPath = process.env.CHROMIUM_PATH ?? 'chromium';

if (!supabaseUrl || !anonKey || !email || !password) {
  console.error(
    'Impostare VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, RESULTS_TEST_EMAIL e RESULTS_TEST_PASSWORD.',
  );
  process.exit(2);
}

const restHeaders = (accessToken) => ({
  apikey: anonKey,
  Authorization: `Bearer ${accessToken}`,
  Accept: 'application/json',
});

async function supabaseRest(path, accessToken, options = {}) {
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...options,
    headers: {
      ...restHeaders(accessToken),
      ...(options.headers ?? {}),
    },
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Supabase REST ${response.status}: ${text.slice(0, 300)}`);
  }
  return text ? JSON.parse(text) : null;
}

async function signIn() {
  const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      apikey: anonKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok || !data.access_token || !data.user?.id) {
    throw new Error('Accesso dell’account di verifica non riuscito.');
  }
  return data;
}

function numberOrNull(value) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function hasScore(prediction) {
  return Boolean(
    prediction &&
      (prediction.scored_at !== null ||
        [
          'qualifying_points',
          'sprint_points',
          'race_points',
          'bonus_points',
          'malus_points',
          'total_points',
        ].some((field) => prediction[field] !== null)),
  );
}

function formatPoints(value) {
  const parsed = numberOrNull(value);
  if (parsed === null) return '—';
  return parsed > 0 ? `+${parsed}` : `${parsed}`;
}

function formatTotal(value) {
  const parsed = numberOrNull(value);
  return parsed === null ? '—' : `${parsed}`;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function waitForDevToolsPage(port) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/list`);
      if (response.ok) {
        const pages = await response.json();
        const page = pages.find((candidate) => candidate.type === 'page');
        if (page?.webSocketDebuggerUrl) return page;
      }
    } catch {
      // Chromium is still starting.
    }
    await sleep(100);
  }
  throw new Error('Chromium non ha aperto la porta DevTools.');
}

function createCdpClient(endpoint) {
  const socket = new WebSocket(endpoint);
  const pending = new Map();
  let nextId = 1;

  const connected = new Promise((resolve, reject) => {
    socket.onopen = resolve;
    socket.onerror = reject;
  });

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    const request = pending.get(message.id);
    if (!request) return;
    pending.delete(message.id);
    if (message.error) request.reject(new Error(message.error.message));
    else request.resolve(message.result);
  };

  function send(method, params = {}) {
    return connected.then(
      () =>
        new Promise((resolve, reject) => {
          const id = nextId++;
          pending.set(id, { resolve, reject });
          socket.send(JSON.stringify({ id, method, params }));
        }),
    );
  }

  function close() {
    socket.close();
  }

  return { send, close };
}

async function evaluate(cdp, expression) {
  const result = await cdp.send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (result.exceptionDetails) {
    throw new Error('Browser evaluation non riuscita.');
  }
  return result.result?.value;
}

async function waitForBody(cdp, predicate, timeout = 25000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const body = await evaluate(cdp, 'document.body?.innerText ?? ""');
    if (predicate(body)) return body;
    await sleep(250);
  }
  const body = await evaluate(cdp, 'document.body?.innerText ?? ""');
  throw new Error(`La pagina non è diventata pronta in tempo. Testo: ${body.slice(0, 240)}`);
}

async function navigate(cdp, path, readyText) {
  await cdp.send('Page.navigate', { url: `${appUrl}${path}` });
  const normalizedReadyText = readyText.toLocaleLowerCase();
  await waitForBody(cdp, (body) =>
    body.toLocaleLowerCase().includes(normalizedReadyText),
  );
  await sleep(300);
}

function selectedSession(sessions, results, grandPrixId, type) {
  const candidates = sessions.filter(
    (session) => session.grand_prix_id === grandPrixId && session.type === type,
  );
  if (type === 'Q') {
    return (
      candidates.find((session) => String(session.number) === '2') ??
      candidates.find((session) => results.some((result) => result.session_id === session.id)) ??
      null
    );
  }
  return candidates[0] ?? null;
}

function isClassified(result) {
  const position = numberOrNull(result.position);
  const status = String(result.status ?? '').trim().toUpperCase();
  return (
    position !== null &&
    !['DNF', 'DNS', 'DSQ', 'NC', 'NOT CLASSIFIED', 'NOT_CLASSIFIED', 'RETIRED', 'WITHDRAWN'].includes(
      status,
    )
  );
}

async function loadServerExpectations(session) {
  const token = session.access_token;
  const [seasons, grandPrix, sessions, predictions, memberships] = await Promise.all([
    supabaseRest('seasons?select=id,year&order=year.desc', token),
    supabaseRest(
      'grand_prix?select=id,name,short_name,date_start,date_end,season_id&is_test=eq.false&order=date_start.asc',
      token,
    ),
    supabaseRest(
      'sessions?select=id,grand_prix_id,type,status,session_date,number&order=session_date.asc',
      token,
    ),
    supabaseRest(
      `predictions?user_id=eq.${session.user.id}&select=id,user_id,grand_prix_id,league_id,qualifying_points,sprint_points,race_points,bonus_points,malus_points,total_points,scored_at,created_at,updated_at`,
      token,
    ),
    supabaseRest(
      `league_members?user_id=eq.${session.user.id}&select=league_id`,
      token,
    ),
  ]);

  const season = seasons[0];
  assert(season, 'Nessuna stagione disponibile.');
  const leagueId = memberships[0]?.league_id ?? '';
  assert(leagueId, 'L’account di verifica non appartiene a una lega.');

  const [leagueMembers, leagueScores] = await Promise.all([
    supabaseRest('rpc/get_league_members', token, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_league_id: leagueId }),
    }),
    supabaseRest(
      `predictions?league_id=eq.${leagueId}&select=user_id,grand_prix_id,total_points,scored_at,qualifying_points,sprint_points,race_points,bonus_points,malus_points`,
      token,
    ),
  ]);

  return {
    token,
    userId: session.user.id,
    season,
    seasons,
    grandPrix,
    sessions,
    predictions,
    leagueMembers,
    leagueScores,
    leagueId,
  };
}

function expectationsForSeason(base, season) {
  const seasonGrandPrix = base.grandPrix.filter((item) => item.season_id === season.id);
  const seasonGrandPrixIds = new Set(seasonGrandPrix.map((item) => item.id));
  const leaguePredictions = base.predictions.filter(
    (prediction) =>
      prediction.league_id === base.leagueId &&
      seasonGrandPrixIds.has(prediction.grand_prix_id),
  );
  const scoredPredictions = leaguePredictions.filter(hasScore);
  const seasonTotal = scoredPredictions.reduce(
    (total, prediction) => total + (numberOrNull(prediction.total_points) || 0),
    0,
  );
  const totals = new Map();
  for (const member of base.leagueMembers ?? []) {
    totals.set(member.user_id, {
      userId: member.user_id,
      name: member.name ?? 'Utente senza nome',
      total: 0,
    });
  }
  for (const prediction of base.leagueScores ?? []) {
    if (!hasScore(prediction) || !seasonGrandPrixIds.has(prediction.grand_prix_id)) continue;
    const row = totals.get(prediction.user_id);
    if (row) row.total += numberOrNull(prediction.total_points) || 0;
  }

  return {
    ...base,
    season,
    seasonGrandPrix,
    predictions: leaguePredictions,
    seasonTotal,
    leaderboard: [...totals.values()].sort((a, b) => b.total - a.total),
  };
}

async function selectSeason(cdp, selector, season) {
  const selected = await evaluate(
    cdp,
    `(() => {
      const element = document.querySelector(${JSON.stringify(selector)});
      if (!element) return false;
      element.value = ${JSON.stringify(season.id)};
      element.dispatchEvent(new Event('change', { bubbles: true }));
      return element.value === ${JSON.stringify(season.id)};
    })()`,
  );
  assert(selected, `Selettore stagione ${selector} non disponibile.`);
  await waitForBody(cdp, (body) =>
    body.includes(`Stagione ${season.year}`),
  );
  await sleep(300);
}

async function verifyMyResultsPage(cdp, expected) {
  const actual = await evaluate(
    cdp,
    `(() => ({
       seasonLabel: document.querySelector('.task21-toolbar .task21-kicker')?.textContent?.trim() ?? '',
       seasonSelect: document.querySelector('[data-testid="task21-season-select"]')?.value ?? '',
      seasonTotal: document.querySelector('#task21-season-score')?.textContent?.trim() ?? '',
      rows: [...document.querySelectorAll('.task21-gp-row')].map((row) => ({
        total: row.querySelector('.task21-gp-points strong')?.textContent?.trim() ?? '',
        breakdown: Object.fromEntries(
          [...row.querySelectorAll('.task21-score-item')].map((item) => [
            item.querySelector('span')?.textContent?.trim() ?? '',
            item.querySelector('strong')?.textContent?.trim() ?? '',
          ]),
        ),
      })),
      body: document.body.innerText,
    }))()`,
  );

  assert(actual.seasonLabel === `Stagione ${expected.season.year}`, `Stagione UI ${actual.seasonLabel} non valida.`);
  assert(actual.seasonSelect === expected.season.id, `Selettore stagione UI ${actual.seasonSelect} != ${expected.season.id}.`);
  assert(actual.seasonTotal === String(expected.seasonTotal), `Totale stagione UI ${actual.seasonTotal} != server ${expected.seasonTotal}.`);
  assert(
    actual.rows.length === expected.seasonGrandPrix.length,
    `Numero GP UI ${actual.rows.length} != server ${expected.seasonGrandPrix.length}.`,
  );

  for (let index = 0; index < expected.seasonGrandPrix.length; index += 1) {
    const prediction = expected.predictions.find(
      (item) => item.grand_prix_id === expected.seasonGrandPrix[index].id,
    );
    const row = actual.rows[index];
    const fields = {
      Qualifica: prediction?.qualifying_points,
      Sprint: prediction?.sprint_points,
      Gara: prediction?.race_points,
      Bonus: prediction?.bonus_points,
      Malus: prediction?.malus_points,
      Totale: prediction?.total_points,
    };
    for (const [label, value] of Object.entries(fields)) {
      const expectedValue = label === 'Totale' ? formatTotal(value) : formatPoints(value);
      assert(
        row.breakdown[label] === expectedValue,
        `${expected.seasonGrandPrix[index].short_name ?? index + 1} ${label} UI ${row.breakdown[label]} != server ${expectedValue}.`,
      );
    }
  }
}

async function verifyMyResults(cdp, expected) {
  await navigate(cdp, '/miei-risultati', 'Punteggio stagione');
  await verifyMyResultsPage(cdp, expected);
}

async function verifyLeaderboardPage(cdp, expected) {
  const actual = await evaluate(
    cdp,
    `([...document.querySelectorAll('.task21-leader-row')]).map((row) => ({
      name: row.querySelector('.task21-member-name strong')?.textContent?.trim() ?? '',
      total: row.querySelector('.task21-member-meta strong')?.textContent?.trim() ?? '',
    }))`,
  );
  const selectedSeason = await evaluate(
    cdp,
    'document.querySelector("[data-testid=\"task21-league-season-select\"]")?.value ?? ""',
  );
  assert(selectedSeason === expected.season.id, `Stagione classifica UI ${selectedSeason} != ${expected.season.id}.`);
  assert(actual.length === expected.leaderboard.length, 'Numero partecipanti UI diverso dal server.');
  for (let index = 0; index < actual.length; index += 1) {
    const serverRow = expected.leaderboard[index];
    assert(actual[index].name === serverRow.name, `Classifica: nome ${actual[index].name} != ${serverRow.name}.`);
    assert(actual[index].total === String(serverRow.total), `Classifica: punti ${actual[index].total} != ${serverRow.total}.`);
  }
}

async function verifyLeaderboard(cdp, expected) {
  await navigate(cdp, `/leghe/${expected.leagueId}`, 'Classifica lega');
  await verifyLeaderboardPage(cdp, expected);
}

async function verifyOfficialResults(cdp, expected) {
  await navigate(cdp, '/risultati', 'Risultati MotoGP');
  const firstGrandPrix = expected.seasonGrandPrix[0];
  const resultSessions = expected.sessions.filter(
    (session) => session.grand_prix_id === firstGrandPrix.id && ['Q', 'SPR', 'RAC'].includes(session.type),
  );
  const sessionIds = resultSessions.map((session) => session.id);
  const results = sessionIds.length
    ? await supabaseRest(
        `session_results?session_id=in.(${sessionIds.join(',')})&select=session_id,position,status`,
        expected.token,
      )
    : [];

  for (const type of ['Q', 'SPR', 'RAC']) {
    const session = selectedSession(resultSessions, results, firstGrandPrix.id, type);
    const count = session
      ? results.filter((result) => result.session_id === session.id && isClassified(result)).length
      : 0;
    const label = type === 'Q' ? 'Qualifiche' : type === 'SPR' ? 'Sprint' : 'Gara';
    await evaluate(
      cdp,
      `document.querySelector('[data-testid="tab-session-${type.toLowerCase()}"]')?.click()`,
    );
    await sleep(250);
    const actual = await evaluate(
      cdp,
      `(() => ({
        heading: document.querySelector('.results-heading-row h2')?.textContent?.trim() ?? '',
        count: document.querySelector('.results-count')?.textContent?.trim() ?? '',
      }))()`,
    );
    assert(actual.heading === label, `Tab ${label} non attiva.`);
    assert(actual.count === `${count} classificati`, `Classifica ${label}: UI ${actual.count} != server ${count} classificati.`);
  }
}

async function main() {
  const session = await signIn();
  const baseExpectations = await loadServerExpectations(session);
  const expected = expectationsForSeason(baseExpectations, baseExpectations.season);
  const port = 9229;
  const browser = spawn(
    chromiumPath,
    [
      '--headless=new',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      `--remote-debugging-port=${port}`,
      `--user-data-dir=/tmp/fantamotogp-results-verification-${process.pid}`,
      'about:blank',
    ],
    { stdio: 'ignore' },
  );

  let cdp;
  try {
    const page = await waitForDevToolsPage(port);
    cdp = createCdpClient(page.webSocketDebuggerUrl);
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    const storageKey = `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`;
    const storageValue = JSON.stringify(session);
    await cdp.send('Page.addScriptToEvaluateOnNewDocument', {
      source: `localStorage.setItem(${JSON.stringify(storageKey)}, ${JSON.stringify(storageValue)});`,
    });
    await verifyMyResults(cdp, expected);
    await verifyLeaderboard(cdp, expected);
    const historicalSeason = baseExpectations.seasons.find(
      (candidate) =>
        candidate.id !== expected.season.id &&
        baseExpectations.grandPrix.some((item) => item.season_id === candidate.id),
    );
    if (historicalSeason) {
      const historicalExpected = expectationsForSeason(baseExpectations, historicalSeason);
      await selectSeason(cdp, '[data-testid="task21-season-select"]', historicalSeason);
      await verifyMyResultsPage(cdp, historicalExpected);
      await navigate(cdp, `/leghe/${expected.leagueId}`, 'Classifica lega');
      await selectSeason(cdp, '[data-testid="task21-league-season-select"]', historicalSeason);
      await verifyLeaderboardPage(cdp, historicalExpected);
    }
    await verifyOfficialResults(cdp, expected);
    console.log(
      `Verifica autenticata superata: ${expected.seasonGrandPrix.length} GP, ${expected.leaderboard.length} partecipanti, Qualifiche/Sprint/Gara coerenti.`,
    );
  } finally {
    cdp?.close();
    browser.kill('SIGTERM');
    await once(browser, 'exit').catch(() => {});
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});