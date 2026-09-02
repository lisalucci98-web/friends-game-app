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
let navigationCounter = 0;

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
  const eventWaiters = new Map();
  let nextId = 1;

  const connected = new Promise((resolve, reject) => {
    socket.onopen = resolve;
    socket.onerror = reject;
  });

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.method) {
      const waiters = eventWaiters.get(message.method);
      if (waiters?.length) {
        eventWaiters.delete(message.method);
        for (const resolve of waiters) resolve(message.params);
      }
      return;
    }
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

  function waitForEvent(method) {
    return new Promise((resolve) => {
      const waiters = eventWaiters.get(method) ?? [];
      waiters.push(resolve);
      eventWaiters.set(method, waiters);
    });
  }

  return { send, close, waitForEvent };
}

async function evaluate(cdp, expression) {
  const result = await cdp.send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (result.exceptionDetails) {
    const description =
      result.exceptionDetails.exception?.description ??
      result.exceptionDetails.text ??
      'errore sconosciuto';
    throw new Error(
      `Browser evaluation non riuscita: ${description} (${expression.slice(0, 180)})`,
    );
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
  const loadEvent = cdp.waitForEvent('Page.loadEventFired');
  const separator = path.includes('?') ? '&' : '?';
  await cdp.send('Page.navigate', {
    url: `${appUrl}${path}${separator}resultsVerification=${++navigationCounter}`,
  });
  await Promise.race([loadEvent, sleep(5000)]);
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

const closedStatuses = new Set([
  'FINISHED',
  'COMPLETED',
  'CLASSIFIED',
  'CLOSED',
]);

function isGpClosed(grandPrixId, sessions) {
  const relevantSessions = sessions.filter(
    (session) =>
      session.grand_prix_id === grandPrixId &&
      ['Q', 'SPR', 'RAC'].includes(String(session.type ?? '').toUpperCase()),
  );
  const types = new Set(
    relevantSessions.map((session) => String(session.type ?? '').toUpperCase()),
  );
  return (
    ['Q', 'SPR', 'RAC'].every((type) => types.has(type)) &&
    relevantSessions.every((session) =>
      closedStatuses.has(String(session.status ?? '').toUpperCase()),
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

  const season = seasons.find((candidate) => candidate.year === 2026) ?? seasons[0];
  assert(season, 'Nessuna stagione disponibile.');
  const populatedSeasons = seasons.filter((candidate) =>
    grandPrix.some((item) => item.season_id === candidate.id),
  );
  assert(
    populatedSeasons.length >= 2,
    'Verifica storica impossibile: servono almeno due stagioni con GP valorizzati.',
  );
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

function leaderboardFingerprint(leaderboard) {
  return leaderboard
    .map((row) => `${row.userId}:${row.total}`)
    .join('|');
}

async function selectSeason(cdp, selector, season) {
  const selected = await evaluate(
    cdp,
    `(() => {
      const element = document.querySelector(${JSON.stringify(selector)});
      if (!element) return false;
       const setter = Object.getOwnPropertyDescriptor(
         HTMLSelectElement.prototype,
         'value',
       )?.set;
       if (!setter) return false;
       setter.call(element, ${JSON.stringify(season.id)});
       element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
       return true;
    })()`,
  );
  if (!selected) {
    const state = await evaluate(
      cdp,
      `(() => ({
        url: window.location.href,
        selectors: [...document.querySelectorAll('select')].map((element) => element.getAttribute('data-testid') ?? element.id),
        body: document.body?.innerText?.slice(0, 360) ?? '',
      }))()`,
    );
    throw new Error(
      `Selettore stagione ${selector} non disponibile. Stato pagina: ${JSON.stringify(state)}.`,
    );
  }
  await waitForSelectValue(cdp, selector, season.id);
  try {
    await waitForBody(cdp, (body) =>
      body.toLocaleLowerCase().includes(`stagione ${season.year}`),
    );
  } catch (error) {
    const state = await evaluate(
      cdp,
      `(() => {
        const element = document.querySelector(${JSON.stringify(selector)});
        return {
          value: element?.value ?? '',
          options: [...(element?.options ?? [])].map((option) => option.value),
          seasonText: document.querySelector('.task21-kicker')?.textContent?.trim() ?? '',
        };
      })()`,
    );
    throw new Error(
      `${error instanceof Error ? error.message : error} Stato selettore: ${JSON.stringify(state)}.`,
    );
  }
  await sleep(300);
}

async function waitForSelectValue(cdp, selector, expectedValue, timeout = 25000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const selected = await evaluate(
      cdp,
      `document.querySelector(${JSON.stringify(selector)})?.value === ${JSON.stringify(expectedValue)}`,
    );
    if (selected) return;
    await sleep(100);
  }
  throw new Error(`Selettore ${selector} non ha raggiunto il valore atteso.`);
}

async function selectParticipantGp(cdp, grandPrix) {
  const selected = await evaluate(
    cdp,
    `(() => {
      const element = document.querySelector('#task21-participant-gp');
      if (!element) return false;
      const setter = Object.getOwnPropertyDescriptor(
        HTMLSelectElement.prototype,
        'value',
      )?.set;
      if (!setter) return false;
      setter.call(element, ${JSON.stringify(grandPrix.id)});
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    })()`,
  );
  assert(selected, 'Selettore GP del partecipante non disponibile.');
  await waitForSelectValue(cdp, '#task21-participant-gp', grandPrix.id);
  await waitForBody(cdp, (body) =>
    body.includes(grandPrix.name ?? grandPrix.short_name ?? ''),
  );
  await sleep(300);
}

async function verifyParticipantDetail(cdp, expected, { requireOpen = true } = {}) {
  const openGrandPrix = expected.seasonGrandPrix.find(
    (grandPrix) => !isGpClosed(grandPrix.id, expected.sessions),
  );
  assert(
    openGrandPrix || !requireOpen,
    `Nessun GP aperto disponibile per verificare il dettaglio protetto della stagione ${expected.season.year}.`,
  );
  if (openGrandPrix) {
    await selectParticipantGp(cdp, openGrandPrix);
    console.log(`  · Dettaglio protetto selezionato: ${openGrandPrix.short_name ?? openGrandPrix.name}.`);
    const lockedDetail = await evaluate(
      cdp,
      `(() => ({
        locked: Boolean(document.querySelector('.task21-locked-detail')),
        detail: Boolean(document.querySelector('.task21-prediction-detail')),
        text: document.querySelector('.task21-locked-detail')?.textContent?.trim() ?? '',
        options: [...document.querySelectorAll('#task21-participant-gp option')].map((option) => option.value),
      }))()`,
    );
    assert(lockedDetail.locked, `Il dettaglio del GP aperto ${openGrandPrix.short_name ?? openGrandPrix.name} non è protetto.`);
    assert(!lockedDetail.detail, 'Il dettaglio di un GP aperto è visibile prima della chiusura.');
    assert(
      lockedDetail.text.toLocaleLowerCase().includes('nascosto fino alla chiusura'),
      'Il messaggio di protezione del dettaglio non è coerente.',
    );
    assert(
      lockedDetail.options.length === expected.seasonGrandPrix.length &&
        lockedDetail.options.every((id, index) => id === expected.seasonGrandPrix[index].id),
      'Il selettore GP del partecipante contiene eventi di un’altra stagione.',
    );
  }

  const closedGrandPrix = expected.seasonGrandPrix.find(
    (grandPrix) =>
      isGpClosed(grandPrix.id, expected.sessions) &&
      expected.predictions.some((prediction) => prediction.grand_prix_id === grandPrix.id),
  );
  if (!closedGrandPrix) return;

  const prediction = expected.predictions.find(
    (candidate) => candidate.grand_prix_id === closedGrandPrix.id,
  );
  await selectParticipantGp(cdp, closedGrandPrix);
  console.log(`  · Dettaglio chiuso selezionato: ${closedGrandPrix.short_name ?? closedGrandPrix.name}.`);
  try {
    await waitForBody(
      cdp,
      (body) =>
        body.toLocaleLowerCase().includes('qualifica') &&
        body.toLocaleLowerCase().includes('punteggio disponibile'),
    );
  } catch (error) {
    const body = await evaluate(cdp, 'document.body?.innerText ?? ""');
    throw new Error(
      `${error instanceof Error ? error.message : error} Corpo dopo selezione: ${body.slice(-800)}`,
    );
  }
  const actual = await evaluate(
    cdp,
    `(() => ({
      locked: Boolean(document.querySelector('.task21-locked-detail')),
      detail: Boolean(document.querySelector('.task21-prediction-detail')),
      total: document.querySelector('.task21-prediction-detail .task21-score-item--total strong')?.textContent?.trim() ?? '',
      options: [...document.querySelectorAll('#task21-participant-gp option')].map((option) => option.value),
    }))()`,
  );
  assert(!actual.locked, 'Il dettaglio di un GP chiuso è ancora bloccato.');
  assert(actual.detail, 'Il dettaglio del partecipante non è visibile per un GP chiuso.');
  assert(actual.total === formatTotal(prediction.total_points), `Dettaglio partecipante ${actual.total} != server ${formatTotal(prediction.total_points)}.`);
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
    `document.querySelector('[data-testid="task21-league-season-select"]')?.value ?? ''`,
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

async function selectOfficialSeason(cdp, season, expected) {
  await waitForBody(
    cdp,
    (body) =>
      body.includes('Campionato') &&
      body.includes(`MotoGP ${season.year}`),
  );
  const selected = await evaluate(
    cdp,
    `(() => {
      const element = document.querySelector('[data-testid="select-season"]');
      if (!element) return false;
      const setter = Object.getOwnPropertyDescriptor(
        HTMLSelectElement.prototype,
        'value',
      )?.set;
      if (!setter) return false;
      setter.call(element, ${JSON.stringify(season.id)});
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
       return true;
    })()`,
  );
  if (!selected) {
    const state = await evaluate(
      cdp,
      `(() => ({
        url: window.location.href,
        selectors: [...document.querySelectorAll('select')].map((element) => element.getAttribute('data-testid') ?? element.id),
        body: document.body?.innerText?.slice(0, 360) ?? '',
      }))()`,
    );
    throw new Error(
      `Selettore campionato ufficiale non disponibile per ${season.year}. Stato pagina: ${JSON.stringify(state)}.`,
    );
  }
  await waitForSelectValue(cdp, '[data-testid="select-season"]', season.id);
  const firstGrandPrix = expected.seasonGrandPrix[0];
  const firstGrandPrixLabel = firstGrandPrix?.name ?? firstGrandPrix?.short_name;
  await waitForBody(
    cdp,
    (body) =>
      body.includes(`MotoGP ${season.year}`) &&
      (!firstGrandPrixLabel || body.includes(firstGrandPrixLabel)),
  );
  await sleep(300);
}

async function verifyOfficialResultsForSeason(cdp, expected) {
  const firstGrandPrix = expected.seasonGrandPrix[0];
  assert(firstGrandPrix, `Nessun GP disponibile per la stagione ${expected.season.year}.`);
  await waitForBody(
    cdp,
    (body) => body.includes(firstGrandPrix.name ?? firstGrandPrix.short_name ?? ''),
  );
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

async function verifyOfficialResults(cdp, baseExpectations, expected) {
  await navigate(cdp, '/risultati', 'Risultati MotoGP');
  const actualSelector = await evaluate(
    cdp,
    `(() => ({
      value: document.querySelector('[data-testid="select-season"]')?.value ?? '',
      options: [...document.querySelectorAll('[data-testid="select-season"] option')].map((option) => ({
        value: option.value,
        label: option.textContent?.trim() ?? '',
      })),
    }))()`,
  );
  assert(actualSelector.value === expected.season.id, `Campionato ufficiale di default ${actualSelector.value} != ${expected.season.id}.`);
  for (const season of baseExpectations.seasons) {
    assert(
      actualSelector.options.some((option) => option.value === season.id && option.label === `MotoGP ${season.year}`),
      `Stagione ${season.year} assente dal selettore ufficiale.`,
    );
  }

  await verifyOfficialResultsForSeason(cdp, expected);

  for (const season of baseExpectations.seasons) {
    if (season.id === expected.season.id) continue;
    const historicalExpected = expectationsForSeason(baseExpectations, season);
    if (!historicalExpected.seasonGrandPrix.length) continue;
    await selectOfficialSeason(cdp, season, historicalExpected);
    await verifyOfficialResultsForSeason(cdp, historicalExpected);
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
    console.log('  ✓ Account autenticato caricato nel browser.');
    await verifyMyResults(cdp, expected);
    console.log(`  ✓ I miei risultati: stagione ${expected.season.year}.`);
    await verifyLeaderboard(cdp, expected);
    console.log(`  ✓ Classifica: stagione ${expected.season.year}.`);
    await verifyParticipantDetail(cdp, expected);
    console.log(`  ✓ Dettaglio partecipante: stagione ${expected.season.year}.`);
    const historicalSeason = baseExpectations.seasons.find(
      (candidate) =>
        candidate.id !== expected.season.id &&
        baseExpectations.grandPrix.some((item) => item.season_id === candidate.id),
    );
    if (historicalSeason) {
      const historicalExpected = expectationsForSeason(baseExpectations, historicalSeason);
      assert(
        historicalExpected.seasonGrandPrix.length !== expected.seasonGrandPrix.length,
        'Il cambio stagione non modifica il numero di GP visualizzati.',
      );
      assert(
        historicalExpected.seasonTotal !== expected.seasonTotal,
        'Il cambio stagione non modifica il totale personale.',
      );
      assert(
        leaderboardFingerprint(historicalExpected.leaderboard) !== leaderboardFingerprint(expected.leaderboard),
        'Il cambio stagione non modifica la classifica della lega.',
      );
      await navigate(cdp, '/miei-risultati', 'Punteggio stagione');
      await selectSeason(cdp, '[data-testid="task21-season-select"]', historicalSeason);
      await verifyMyResultsPage(cdp, historicalExpected);
      console.log(`  ✓ I miei risultati: stagione ${historicalSeason.year}.`);
      await navigate(cdp, `/leghe/${expected.leagueId}`, 'Classifica lega');
      await selectSeason(cdp, '[data-testid="task21-league-season-select"]', historicalSeason);
      await verifyLeaderboardPage(cdp, historicalExpected);
      console.log(`  ✓ Classifica: stagione ${historicalSeason.year}.`);
      await verifyParticipantDetail(cdp, historicalExpected, { requireOpen: false });
    } else {
      throw new Error('Nessuna stagione storica con GP valorizzati disponibile.');
    }
    await verifyOfficialResults(cdp, baseExpectations, expected);
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