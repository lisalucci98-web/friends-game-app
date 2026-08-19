import { spawnSync } from 'node:child_process';

/**
 * Script temporaneo — test API MotoGP
 * Obiettivo: verificare endpoint, struttura JSON, UUID chiave.
 * Non scrive nulla nel database. Non modifica App.tsx o Supabase.
 */

const BASE = 'https://api.motogp.pulselive.com/motogp/v1';
const YEAR  = 2026;

// ─── utility ────────────────────────────────────────────────────────────────

function section(title) {
  console.log('\n' + '═'.repeat(60));
  console.log(`  ${title}`);
  console.log('═'.repeat(60));
}

function ok(label, status) {
  console.log(`✓  ${label}  [HTTP ${status}]`);
}

function fail(label, status, body) {
  console.log(`✗  ${label}  [HTTP ${status}]  →  ${String(body).slice(0, 120)}`);
}

/** Effettua GET e restituisce { status, ok, json? } */
async function get(path) {
  const url = BASE + path;
  try {
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(10_000),
    });
    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch { /* non-JSON */ }
    return {
      status: res.status,
      ok: res.ok,
      contentType: res.headers.get('content-type') ?? '(assente)',
      json,
      text,
    };
  } catch (err) {
    return {
      status: 0,
      ok: false,
      contentType: '(non raggiungibile)',
      json: null,
      text: String(err),
    };
  }
}

/** Mostra i primi N elementi di un array con solo le chiavi indicate. */
function preview(arr, keys, n = 2) {
  if (!Array.isArray(arr)) { console.log('  (non è un array)'); return; }
  arr.slice(0, n).forEach((item, i) => {
    const picked = {};
    keys.forEach(k => { if (k in item) picked[k] = item[k]; });
    console.log(`  [${i}]`, JSON.stringify(picked));
  });
  if (arr.length > n) console.log(`  … altri ${arr.length - n} elementi`);
}

/** Stampa le chiavi di primo livello di un oggetto. */
function keys(obj) {
  if (!obj || typeof obj !== 'object') return '(non oggetto)';
  return Object.keys(obj).join(', ');
}

function entityRows(payload, names) {
  if (Array.isArray(payload)) return { path: '$', rows: payload };
  if (!payload || typeof payload !== 'object') return null;
  for (const name of names) {
    if (Array.isArray(payload[name])) {
      return { path: `$.${name}`, rows: payload[name] };
    }
  }
  return null;
}

function entityCompleteness(row, kind) {
  if (!row || typeof row !== 'object') return [];
  const text = JSON.stringify(row).toLowerCase();
  const expected = kind === 'rider'
    ? ['id', 'full_name', 'number', 'country']
    : kind === 'team'
      ? ['id', 'name', 'season']
      : ['id', 'name'];
  return expected.filter(field => text.includes(`"${field}"`));
}

// ─── 1. Seasons ─────────────────────────────────────────────────────────────

section('1 · /results/seasons');
const seasonsRes = await get('/results/seasons');
let seasonUuid = null;

if (!seasonsRes.ok) {
  fail('/results/seasons', seasonsRes.status, seasonsRes.text);
} else {
  ok('/results/seasons', seasonsRes.status);
  const seasons = seasonsRes.json;
  console.log(`  Chiavi primo livello: ${keys(seasons)}`);

  // L'API restituisce un array o { seasons: [...] }
  const list = Array.isArray(seasons) ? seasons
    : Array.isArray(seasons?.seasons) ? seasons.seasons
    : null;

  if (list) {
    console.log(`  Totale stagioni: ${list.length}`);
    const s2026 = list.find(s => s.year === YEAR || s.year === String(YEAR));
    if (s2026) {
      seasonUuid = s2026.id ?? s2026.uuid ?? s2026.seasonUuid;
      console.log(`  ✓ Stagione ${YEAR} trovata → UUID: ${seasonUuid}`);
      console.log(`    Campi: ${keys(s2026)}`);
    } else {
      console.log(`  ✗ Stagione ${YEAR} non trovata`);
      preview(list, ['year', 'id', 'uuid', 'name'], 3);
    }
  } else {
    console.log(`  Struttura raw (slice):`, JSON.stringify(seasons)?.slice(0, 300));
  }
}

// ─── 2. Events ──────────────────────────────────────────────────────────────

section('2 · /results/events?seasonUuid=...');
let eventUuid = null;

if (!seasonUuid) {
  console.log('  ⚠ seasonUuid non disponibile, skip');
} else {
  const evRes = await get(`/results/events?seasonUuid=${seasonUuid}&isFinished=true`);
  if (!evRes.ok) {
    fail('/results/events', evRes.status, evRes.text);
  } else {
    ok('/results/events', evRes.status);
    const ev = evRes.json;
    console.log(`  Chiavi primo livello: ${keys(ev)}`);

    const list = Array.isArray(ev) ? ev
      : Array.isArray(ev?.events) ? ev.events
      : null;

    if (list) {
      console.log(`  GP conclusi: ${list.length}`);
      if (list.length > 0) {
        // Preferisci gare vere (test: false) alle sessioni di test
      const races = list.filter(e => !e.test);
      const target = races.length > 0 ? races[races.length - 1] : list[list.length - 1];
        eventUuid = target.id ?? target.uuid ?? target.eventUuid;
        console.log(`  GP conclusi (totale): ${list.length}  |  gare vere: ${races.length}`);
        console.log(`  Ultimo GP scelto: "${target.name ?? target.shortname ?? target.circuit?.name}"  (test: ${target.test})`);
        console.log(`  UUID: ${eventUuid}`);
        console.log(`  Campi: ${keys(target)}`);
      }
    } else {
      console.log(`  Raw (slice):`, JSON.stringify(ev)?.slice(0, 300));
    }
  }
}

// ─── 3. Categories ──────────────────────────────────────────────────────────

section('3 · /results/categories?seasonUuid=...');
let categoryUuid = null;

if (!seasonUuid) {
  console.log('  ⚠ seasonUuid non disponibile, skip');
} else {
  const catRes = await get(`/results/categories?seasonUuid=${seasonUuid}`);
  if (!catRes.ok) {
    fail('/results/categories', catRes.status, catRes.text);
  } else {
    ok('/results/categories', catRes.status);
    const cat = catRes.json;
    console.log(`  Chiavi primo livello: ${keys(cat)}`);

    const list = Array.isArray(cat) ? cat
      : Array.isArray(cat?.categories) ? cat.categories
      : null;

    if (list) {
      console.log(`  Categorie disponibili:`);
      list.forEach(c => {
        const id = c.id ?? c.uuid ?? c.categoryUuid;
        console.log(`    • ${c.name ?? c.legacy_name ?? '(senza nome)'}  →  ${id}`);
        if ((c.name ?? '').toLowerCase().includes('motogp') ||
            (c.legacy_name ?? '').toLowerCase().includes('motogp')) {
          categoryUuid = id;
        }
      });
      if (categoryUuid) console.log(`  ✓ MotoGP categoryUuid: ${categoryUuid}`);
    } else {
      console.log(`  Raw (slice):`, JSON.stringify(cat)?.slice(0, 300));
    }
  }
}

// ─── 3b. Anagrafica piloti, team e costruttori ────────────────────────────────

section('3b · anagrafica piloti, team e costruttori');

const entityCategoriesRes = await get(`/categories?seasonYear=${YEAR}`);
let entityCategoryUuid = null;

console.log(`\n  Categorie anagrafiche — URL: ${BASE}/categories?seasonYear=${YEAR}`);
console.log(`  HTTP: ${entityCategoriesRes.status}  |  content-type: ${entityCategoriesRes.contentType}`);
if (entityCategoriesRes.ok && Array.isArray(entityCategoriesRes.json)) {
  const motoGpCategory = entityCategoriesRes.json.find(
    category => category.name?.toLowerCase() === 'motogp',
  );
  entityCategoryUuid = motoGpCategory?.id ?? null;
  console.log(`  MotoGP categoryUuid anagrafico: ${entityCategoryUuid ?? '(non trovato)'}`);
  console.log(`  Campi categoria: ${keys(motoGpCategory)}`);
} else {
  console.log(`  Errore/body: ${entityCategoriesRes.text.slice(0, 220)}`);
}

const entityCandidates = [
  { kind: 'rider', label: 'piloti seasonYear/categoria', path: `/riders?seasonYear=${YEAR}&categoryUuid=${entityCategoryUuid}` },
  { kind: 'rider', label: 'piloti stagione/categoria', path: `/riders?seasonUuid=${seasonUuid}&categoryUuid=${categoryUuid}` },
  { kind: 'rider', label: 'piloti stagione', path: `/riders?seasonUuid=${seasonUuid}` },
  { kind: 'rider', label: 'piloti categoria', path: `/riders?categoryUuid=${categoryUuid}` },
  { kind: 'rider', label: 'piloti generico', path: '/riders' },
  { kind: 'team', label: 'team seasonYear/categoria', path: `/teams?seasonYear=${YEAR}&categoryUuid=${entityCategoryUuid}` },
  { kind: 'team', label: 'team stagione/categoria', path: `/teams?seasonUuid=${seasonUuid}&categoryUuid=${categoryUuid}` },
  { kind: 'team', label: 'team stagione', path: `/teams?seasonUuid=${seasonUuid}` },
  { kind: 'team', label: 'team categoria', path: `/teams?categoryUuid=${categoryUuid}` },
  { kind: 'team', label: 'team generico', path: '/teams' },
  { kind: 'constructor', label: 'costruttori stagione/categoria', path: `/constructors?seasonUuid=${seasonUuid}&categoryUuid=${categoryUuid}` },
  { kind: 'constructor', label: 'costruttori stagione', path: `/constructors?seasonUuid=${seasonUuid}` },
  { kind: 'constructor', label: 'costruttori categoria', path: `/constructors?categoryUuid=${categoryUuid}` },
  { kind: 'constructor', label: 'costruttori generico', path: '/constructors' },
  { kind: 'rider', label: 'results/riders stagione', path: `/results/riders?seasonUuid=${seasonUuid}&categoryUuid=${categoryUuid}` },
  { kind: 'team', label: 'results/teams stagione', path: `/results/teams?seasonUuid=${seasonUuid}&categoryUuid=${categoryUuid}` },
  { kind: 'constructor', label: 'results/constructors stagione', path: `/results/constructors?seasonUuid=${seasonUuid}&categoryUuid=${categoryUuid}` },
];

const entityLists = [];
const attemptedDetailIds = new Set();

for (const candidate of entityCandidates) {
  console.log(`\n  [${candidate.kind}] ${candidate.label}`);
  const response = await get(candidate.path);
  console.log(`  URL: ${BASE}${candidate.path}`);
  console.log(`  HTTP: ${response.status}  |  content-type: ${response.contentType}`);

  if (!response.ok) {
    console.log(`  Errore/body: ${response.text.slice(0, 220)}`);
    continue;
  }

  console.log(`  Struttura JSON principale: ${keys(response.json)}`);
  const names = candidate.kind === 'rider'
    ? ['riders', 'rider', 'data', 'items', 'content']
    : candidate.kind === 'team'
      ? ['teams', 'team', 'data', 'items', 'content']
      : ['constructors', 'constructor', 'manufacturers', 'data', 'items', 'content'];
  const found = entityRows(response.json, names);

  if (!found) {
    console.log(`  Record: nessun array anagrafico riconoscibile`);
    console.log(`  Anteprima: ${JSON.stringify(response.json)?.slice(0, 500)}`);
    continue;
  }

  console.log(`  Array: ${found.path}  |  totale: ${found.rows.length}`);
  if (candidate.kind === 'rider') {
    const motoGpRows = found.rows.filter(
      rider => rider.current_career_step?.category?.name === 'MotoGP',
    );
    console.log(`  Piloti con current_career_step MotoGP: ${motoGpRows.length}`);
  }
  found.rows.slice(0, 2).forEach((row, index) => {
    console.log(`  Record ${index + 1} campi: ${keys(row)}`);
    console.log(`  Record ${index + 1} anteprima: ${JSON.stringify(row).slice(0, 900)}`);
  });
  entityLists.push({ ...candidate, rows: found.rows });

  // Un solo endpoint di dettaglio per tipo, solo dopo aver trovato un ID reale.
  const first = found.rows[0];
  const entityId = first?.id ?? first?.uuid;
  if (entityId && !attemptedDetailIds.has(candidate.kind)) {
    attemptedDetailIds.add(candidate.kind);
    const detailQuery = candidate.kind === 'team'
      ? `seasonYear=${YEAR}&categoryUuid=${entityCategoryUuid}`
      : `seasonUuid=${seasonUuid}`;
    const detailPath = `/${candidate.kind === 'constructor' ? 'constructors' : `${candidate.kind}s`}/${entityId}?${detailQuery}`;
    const detailResponse = await get(detailPath);
    console.log(`  Dettaglio: ${BASE}${detailPath}`);
    console.log(`  Dettaglio HTTP: ${detailResponse.status}  |  content-type: ${detailResponse.contentType}`);
    if (detailResponse.ok) {
      console.log(`  Dettaglio campi: ${keys(detailResponse.json)}`);
      console.log(`  Dettaglio anteprima: ${JSON.stringify(detailResponse.json)?.slice(0, 900)}`);
    } else {
      console.log(`  Dettaglio errore/body: ${detailResponse.text.slice(0, 220)}`);
    }
  }
}

console.log('\n  Sintesi anagrafica:');
for (const kind of ['rider', 'team', 'constructor']) {
  const match = entityLists.find(item => item.kind === kind);
  if (!match) {
    console.log(`  • ${kind}: nessun endpoint anagrafico verificato`);
    continue;
  }
  const completeness = entityCompleteness(match.rows[0], kind);
  console.log(`  • ${kind}: ${match.path} → ${match.rows.length} record; campi chiave rilevati: ${completeness.join(', ') || '(nessuno)'}`);
}

// ─── 4. Sessions ────────────────────────────────────────────────────────────

section('4 · /results/sessions?eventUuid=...&categoryUuid=...');
let finishedSessionId = null;

if (!eventUuid || !categoryUuid) {
  console.log('  ⚠ eventUuid o categoryUuid non disponibili, skip');
} else {
  const sessRes = await get(`/results/sessions?eventUuid=${eventUuid}&categoryUuid=${categoryUuid}`);
  if (!sessRes.ok) {
    fail('/results/sessions', sessRes.status, sessRes.text);
  } else {
    ok('/results/sessions', sessRes.status);
    const sess = sessRes.json;
    console.log(`  Chiavi primo livello: ${keys(sess)}`);

    const list = Array.isArray(sess) ? sess
      : Array.isArray(sess?.sessions) ? sess.sessions
      : null;

    if (list) {
      console.log(`  Sessioni disponibili:`);
      list.forEach(s => {
        const id = s.id ?? s.uuid ?? s.sessionUuid;
        const finished = s.status?.toUpperCase() === 'FINISHED' || s.finished === true;
        console.log(`    • [${s.type ?? s.session_type ?? '?'}]  ${s.status ?? ''}  →  ${id}`);
        if (finished && !finishedSessionId) finishedSessionId = id;
      });
    } else {
      console.log(`  Raw (slice):`, JSON.stringify(sess)?.slice(0, 300));
    }
  }
}

// ─── 5. Mirata ricerca classification JSON + PDF ufficiale ───────────────────

let racSessionId = finishedSessionId;
let classificationPdfUrl = null;

section('5a · session descriptor e link classification PDF');

if (!eventUuid || !categoryUuid || !finishedSessionId) {
  console.log('  ⚠ UUID insufficienti, skip');
} else {
  const sessAgain = await get(
    `/results/sessions?eventUuid=${eventUuid}&categoryUuid=${categoryUuid}`,
  );
  if (sessAgain.ok && Array.isArray(sessAgain.json)) {
    const rac = sessAgain.json.find(s => s.type === 'RAC');
    if (rac) {
      racSessionId = rac.id ?? rac.uuid ?? rac.sessionUuid;
      console.log(`  Sessione RAC scelta: ${racSessionId}`);
    }
  }

  const detRes = await get(`/results/sessions/${racSessionId}`);
  console.log(`  URL: ${BASE}/results/sessions/${racSessionId}`);
  console.log(`  HTTP: ${detRes.status}  |  content-type: ${detRes.contentType}`);
  if (!detRes.ok) {
    console.log(`  Errore: ${detRes.text.slice(0, 240)}`);
  } else {
    const det = detRes.json;
    console.log(`  Struttura principale: ${keys(det)}`);
    if (det?.session_files) {
      console.log(`  session_files: ${keys(det.session_files)}`);
      classificationPdfUrl = det.session_files.classification?.url ?? null;
      console.log(`  classification.url: ${classificationPdfUrl ?? '(non presente)'}`);
    }
  }
}

function findRecordArray(payload) {
  if (Array.isArray(payload)) return { path: '$', rows: payload };
  if (!payload || typeof payload !== 'object') return null;

  const preferred = [
    'classification', 'classifications', 'results', 'records',
    'riders', 'standings', 'data', 'content',
  ];
  for (const name of preferred) {
    if (Array.isArray(payload[name])) {
      return { path: `$.${name}`, rows: payload[name] };
    }
  }
  return null;
}

function printProbeResult(path, response) {
  console.log(`\n  URL: ${BASE}${path}`);
  console.log(`  HTTP: ${response.status}  |  content-type: ${response.contentType}`);
  if (!response.ok) {
    console.log(`  Errore/body: ${response.text.slice(0, 240)}`);
    return null;
  }

  console.log(`  Struttura JSON principale: ${keys(response.json)}`);
  const found = findRecordArray(response.json);
  if (!found || found.rows.length === 0) {
    console.log(`  Record: nessun array riconoscibile`);
    console.log(`  Anteprima: ${JSON.stringify(response.json)?.slice(0, 420)}`);
    return null;
  }

  console.log(`  Array record: ${found.path}  |  totale: ${found.rows.length}`);
  found.rows.slice(0, 2).forEach((row, index) => {
    console.log(`  Record ${index + 1} campi: ${keys(row)}`);
    console.log(`  Record ${index + 1} anteprima: ${JSON.stringify(row).slice(0, 700)}`);
  });
  return found.rows;
}

section('5b · endpoint JSON plausibili (probe mirato)');

if (!racSessionId || !eventUuid || !categoryUuid) {
  console.log('  ⚠ UUID insufficienti, skip');
} else {
  const q = `sessionUuid=${racSessionId}`;
  const qAll = `sessionUuid=${racSessionId}&eventUuid=${eventUuid}&categoryUuid=${categoryUuid}`;
  const candidates = [
    `/results/sessions/${racSessionId}/classification`,
    `/results/classifications?${qAll}`,
    `/results/classification?${qAll}`,
    `/results/results?${qAll}`,
    `/results/session-results?${qAll}`,
    `/results/session/classification?${qAll}`,
    `/results/riders?${q}`,
    `/results/riders/${racSessionId}?eventUuid=${eventUuid}&categoryUuid=${categoryUuid}`,
    `/results/standings?${qAll}`,
    `/results/standings?seasonUuid=${seasonUuid}&categoryUuid=${categoryUuid}&eventUuid=${eventUuid}`,
  ];

  const successfulClassificationEndpoints = [];
  for (const path of candidates) {
    const response = await get(path);
    const rows = printProbeResult(path, response);
    if (rows && rows.length > 0) {
      const first = rows[0];
      const fieldText = Object.keys(first).join(' ').toLowerCase();
      const signals = ['position', 'rider', 'number', 'team', 'bike', 'time', 'gap', 'status']
        .filter(signal => fieldText.includes(signal));
      if (signals.length >= 2) {
        successfulClassificationEndpoints.push({ path, signals });
        console.log(`  ✓ Possibile classification strutturata: ${signals.join(', ')}`);
      }
    }
  }

  console.log('\n  Endpoint candidati con segnali di classification:');
  if (successfulClassificationEndpoints.length === 0) {
    console.log('  (nessuno)');
  } else {
    successfulClassificationEndpoints.forEach(({ path, signals }) => {
      console.log(`  • ${path}  →  ${signals.join(', ')}`);
    });
  }
}

section('5c · PDF classification ufficiale (fallback)');

if (!classificationPdfUrl) {
  console.log('  ⚠ URL PDF non disponibile, skip');
} else {
  try {
    const pdfRes = await fetch(classificationPdfUrl, {
      headers: { Accept: 'application/pdf', 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(15_000),
    });
    const pdfBytes = Buffer.from(await pdfRes.arrayBuffer());
    console.log(`  URL: ${classificationPdfUrl}`);
    console.log(`  HTTP: ${pdfRes.status}  |  content-type: ${pdfRes.headers.get('content-type') ?? '(assente)'}`);
    console.log(`  Dimensione: ${pdfBytes.length} byte`);

    if (pdfRes.ok && pdfBytes.length > 0) {
      const extracted = spawnSync(
        'pdftotext',
        ['-layout', '-', '-'],
        { input: pdfBytes, encoding: 'utf8', maxBuffer: 2 * 1024 * 1024 },
      );
      if (extracted.status !== 0) {
        console.log(`  Estrazione automatica fallita: ${extracted.stderr || '(nessun dettaglio)'}`);
      } else {
        const text = extracted.stdout.trim();
        console.log(`  Estrazione automatica: OK (${text.length} caratteri)`);
        console.log('  Prime righe estratte:');
        console.log(text.split(/\r?\n/).slice(0, 35).join('\n'));
      }
    }
  } catch (error) {
    console.log(`  Errore download/estrazione PDF: ${String(error)}`);
  }
}

// ─── 6. Live timing ─────────────────────────────────────────────────────────

section('6 · /timing-gateway/livetiming-lite');
const ltRes = await get('/timing-gateway/livetiming-lite');
if (ltRes.status === 0) {
  console.log(`  ✗ Non raggiungibile: ${ltRes.text}`);
} else if (!ltRes.ok) {
  fail('/timing-gateway/livetiming-lite', ltRes.status, ltRes.text?.slice(0, 200));
} else {
  ok('/timing-gateway/livetiming-lite', ltRes.status);
  console.log(`  Chiavi risposta: ${keys(ltRes.json)}`);
  if (ltRes.json) {
    console.log(`  Anteprima:`, JSON.stringify(ltRes.json)?.slice(0, 300));
  } else {
    console.log(`  Corpo (non JSON):`, ltRes.text?.slice(0, 200));
  }
}

// ─── Riepilogo ───────────────────────────────────────────────────────────────

section('RIEPILOGO UUID');
console.log(`  Stagione ${YEAR}  →  ${seasonUuid ?? '(non trovato)'}`);
console.log(`  Ultimo GP concluso →  ${eventUuid ?? '(non trovato)'}`);
console.log(`  Categoria MotoGP   →  ${categoryUuid ?? '(non trovato)'}`);
console.log(`  Sessione conclusa  →  ${finishedSessionId ?? '(non trovata)'}`);
console.log('');
