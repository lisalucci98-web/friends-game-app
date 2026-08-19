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
    return { status: res.status, ok: res.ok, json, text };
  } catch (err) {
    return { status: 0, ok: false, json: null, text: String(err) };
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

// ─── 5. Session detail + classification endpoint ─────────────────────────────

section('5a · /results/sessions/{sessionId}  (descriptor)');

if (!finishedSessionId) {
  console.log('  ⚠ nessuna sessione conclusa trovata, skip');
} else {
  const detRes = await get(`/results/sessions/${finishedSessionId}`);
  if (!detRes.ok) {
    fail(`/results/sessions/${finishedSessionId}`, detRes.status, detRes.text);
  } else {
    ok(`/results/sessions/${finishedSessionId}`, detRes.status);
    const det = detRes.json;
    console.log(`  Chiavi risposta: ${keys(det)}`);
    if (det?.session_files) {
      console.log(`  session_files keys: ${keys(det.session_files)}`);
    }
    // Cerca classification inline
    const classificationInline =
      det?.classification ?? det?.results?.classification ?? null;
    if (Array.isArray(classificationInline)) {
      console.log(`  ✓ classification inline (${classificationInline.length} righe)`);
    } else {
      console.log(`  (nessuna classification inline — probabilmente su endpoint separato)`);
    }
  }
}

section('5b · /results/sessions/{sessionId}/classification  (gara RAC)');

// Usa sessione RAC per la classifica se trovata, altrimenti la prima disponibile
// La sessione RAC ha type === 'RAC'; l'abbiamo vista al punto 4
// finishedSessionId è la FP1; usiamo la RAC se la conosciamo
// Riproviamo a ricavarla dalla lista sessioni

let racSessionId = finishedSessionId; // fallback
if (!eventUuid || !categoryUuid) {
  console.log('  ⚠ skip (mancano UUID)');
} else {
  // Ri-fetch sessioni per trovare RAC
  const sessAgain = await get(`/results/sessions?eventUuid=${eventUuid}&categoryUuid=${categoryUuid}`);
  if (sessAgain.ok && sessAgain.json) {
    const list = Array.isArray(sessAgain.json) ? sessAgain.json : Object.values(sessAgain.json);
    const rac = list.find(s => s.type === 'RAC');
    if (rac) {
      racSessionId = rac.id ?? rac.uuid;
      console.log(`  Sessione RAC trovata → ${racSessionId}`);
    }
  }

  const classRes = await get(`/results/sessions/${racSessionId}/classification`);
  if (!classRes.ok) {
    fail(`/results/sessions/${racSessionId}/classification`, classRes.status, classRes.text?.slice(0, 200));
  } else {
    ok(`/results/sessions/${racSessionId}/classification`, classRes.status);
    const cls = classRes.json;
    console.log(`  Chiavi risposta: ${keys(cls)}`);

    // classification può stare direttamente in array o dentro .classification
    const rows = Array.isArray(cls) ? cls
      : Array.isArray(cls?.classification) ? cls.classification
      : null;

    if (rows && rows.length > 0) {
      const first = rows[0];
      console.log(`  Righe: ${rows.length}`);
      console.log(`  Campi primo elemento: ${keys(first)}`);
      if (first.rider) console.log(`  Campi rider: ${keys(first.rider)}`);
      if (first.team)  console.log(`  Campi team:  ${keys(first.team)}`);
      console.log('\n  Prime 3 righe (campi selezionati):');
      preview(rows, ['position', 'rider', 'team', 'constructor',
                     'time', 'gap', 'points', 'status', 'number', 'avg_speed'], 3);
    } else {
      console.log(`  Raw (slice):`, JSON.stringify(cls)?.slice(0, 500));
    }
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
