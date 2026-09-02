/**
 * Verifica di regressione per l'import mirato dei risultati MotoGP 2026.
 *
 * Il test usa un GP già disputato e completo (ARA di default) e verifica:
 * - dry-run senza scritture;
 * - presenza di risultati per Q, SPR e RAC;
 * - idempotenza di due import consecutivi;
 * - chiusura delle sessioni Q/SPR/RAC del solo GP scelto.
 *
 * Il test è intenzionalmente live: richiede la rete MotoGP, pdftotext e una
 * chiave service role Supabase. Non cancella dati e non tocca prediction o
 * scoring.
 */

import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const SEASON_ID = 'e88b4e43-2209-47aa-8e83-0e0b1cedde6e';
const DEFAULT_GP = 'ARA';
const SUPABASE_URL = (
  process.env.SUPABASE_URL ??
  process.env.VITE_SUPABASE_URL ??
  ''
).replace(/\/$/, '');
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const IMPORTER_PATH = resolve(new URL('./import-motogp-results-2026.mjs', import.meta.url).pathname);

function cliValue(name, fallback) {
  const index = process.argv.indexOf(name);
  return index === -1 ? fallback : String(process.argv[index + 1] ?? '').trim().toUpperCase();
}

const GP_CODE = cliValue('--gp', process.env.MOTOGP_RESULTS_TEST_GP ?? DEFAULT_GP)
  .trim()
  .toUpperCase();

function assertCondition(condition, message) {
  if (!condition) throw new Error(message);
}

function listFrom(payload) {
  return Array.isArray(payload) ? payload : [];
}

function encodeIn(values) {
  return values.map(value => encodeURIComponent(value)).join(',');
}

async function supabaseGet(path) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      Accept: 'application/json',
    },
    signal: AbortSignal.timeout(30_000),
  });
  const body = await response.text();
  if (!response.ok) {
    throw new Error(`Supabase REST ${response.status} ${response.statusText}: ${body.slice(0, 500)}`);
  }
  try {
    return body ? JSON.parse(body) : null;
  } catch {
    throw new Error(`Risposta Supabase non JSON per ${path}.`);
  }
}

function sortSessionRows(rows) {
  return [...rows].sort((a, b) => {
    const typeOrder = { Q: 0, SPR: 1, RAC: 2 };
    return (
      (typeOrder[a.type] ?? 99) - (typeOrder[b.type] ?? 99) ||
      Number(b.number ?? 0) - Number(a.number ?? 0) ||
      String(a.id).localeCompare(String(b.id))
    );
  });
}

function sessionForType(rows, type) {
  return sortSessionRows(rows.filter(row => row.type === type))[0] ?? null;
}

function canonicalRows(rows) {
  return rows
    .map(row => ({
      session_id: row.session_id,
      rider_id: row.rider_id,
      position: row.position ?? null,
      total_time: row.total_time ?? null,
      gap: row.gap ?? null,
      status: row.status ?? null,
      source_url: row.source_url ?? null,
    }))
    .sort((a, b) =>
      `${a.session_id}:${a.rider_id}`.localeCompare(`${b.session_id}:${b.rider_id}`),
    );
}

function rowKeys(rows) {
  return new Set(rows.map(row => `${row.session_id}:${row.rider_id}`));
}

function sameJson(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

async function readState(grandPrixId, sessions) {
  const sessionIds = sessions.map(row => row.id);
  assertCondition(sessionIds.length > 0, `Nessuna sessione Q/SPR/RAC trovata per ${GP_CODE}.`);

  const results = listFrom(await supabaseGet(
    `/session_results?session_id=in.(${encodeIn(sessionIds)})` +
    '&select=session_id,rider_id,position,total_time,gap,status,source_url',
  ));

  return {
    sessions: sortSessionRows(sessions).map(row => ({
      id: row.id,
      type: row.type,
      number: row.number ?? null,
      status: row.status ?? null,
    })),
    results: canonicalRows(results),
    grandPrixId,
  };
}

function runImporter(...args) {
  const result = spawnSync(process.execPath, [IMPORTER_PATH, '--gp', GP_CODE, ...args], {
    encoding: 'utf8',
    env: process.env,
    maxBuffer: 12 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  const output = `${result.stdout ?? ''}\n${result.stderr ?? ''}`;
  if (result.status !== 0) {
    throw new Error(
      `Importer fallito (${result.status}) con --gp ${GP_CODE}${args.length ? ` ${args.join(' ')}` : ''}:\n` +
      output.slice(-4_000),
    );
  }
  return output;
}

function assertImporterOutput(output, expectations, label) {
  for (const expectation of expectations) {
    assertCondition(
      output.includes(expectation),
      `${label}: output importer privo di "${expectation}".`,
    );
  }
}

assertCondition(/^[A-Z0-9_-]+$/.test(GP_CODE), `Codice GP non valido: ${GP_CODE}.`);
assertCondition(
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY,
  'Servono SUPABASE_URL/VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.',
);

const grandPrixRows = listFrom(await supabaseGet(
  `/grand_prix?season_id=eq.${encodeURIComponent(SEASON_ID)}` +
  `&short_name=eq.${encodeURIComponent(GP_CODE)}` +
  '&is_test=eq.false&select=id,name,short_name',
));
assertCondition(grandPrixRows.length === 1, `GP ${GP_CODE} non trovato in Supabase.`);

const grandPrix = grandPrixRows[0];
const sessions = listFrom(await supabaseGet(
  `/sessions?grand_prix_id=eq.${encodeURIComponent(grandPrix.id)}` +
  '&type=in.(Q,SPR,RAC)&select=id,type,status,number&order=number.desc',
));

for (const type of ['Q', 'SPR', 'RAC']) {
  assertCondition(
    sessions.some(row => row.type === type),
    `Sessione ${type} mancante per ${grandPrix.name ?? GP_CODE}.`,
  );
}

const selectedSessions = ['Q', 'SPR', 'RAC'].map(type => sessionForType(sessions, type));
const beforeDryRun = await readState(grandPrix.id, sessions);
const dryRunOutput = runImporter();
assertImporterOutput(
  dryRunOutput,
  [
    'Modalità dry-run: nessuna scrittura Supabase.',
    'GP elaborati: 1 (filtro',
    'sessioni: 1 / 1',
    'PDF mancanti futuri: 0',
    'errori critici: 0',
    'Scritture Supabase: NESSUNA',
  ],
  'dry-run',
);

const afterDryRun = await readState(grandPrix.id, sessions);
assertCondition(
  sameJson(beforeDryRun, afterDryRun),
  'dry-run ha modificato sessioni o risultati Supabase.',
);

const firstImportOutput = runImporter('--import');
assertImporterOutput(
  firstImportOutput,
  [
    'UPSERT completato:',
    'Verifica post-import:',
    'Stato sessioni Q/SPR/RAC: FINISHED.',
  ],
  'primo import',
);
const afterFirstImport = await readState(grandPrix.id, sessions);

for (const session of selectedSessions) {
  assertCondition(
    afterFirstImport.results.some(row => row.session_id === session.id),
    `Nessun risultato importato per ${session.type} (${session.id}).`,
  );
}
assertCondition(
  afterFirstImport.results.length >= 3,
  `Risultati insufficienti dopo il primo import: ${afterFirstImport.results.length}.`,
);
assertCondition(
  rowKeys(afterFirstImport.results).size === afterFirstImport.results.length,
  'Duplicati session_id+rider_id dopo il primo import.',
);
assertCondition(
  afterFirstImport.sessions.every(row => row.status === 'FINISHED'),
  'Non tutte le sessioni Q/SPR/RAC del GP sono FINISHED dopo il primo import.',
);

const secondImportOutput = runImporter('--import');
assertImporterOutput(
  secondImportOutput,
  [
    'UPSERT completato:',
    'Verifica post-import:',
    'Stato sessioni Q/SPR/RAC: FINISHED.',
  ],
  'secondo import',
);
const afterSecondImport = await readState(grandPrix.id, sessions);

assertCondition(
  sameJson(afterFirstImport.results, afterSecondImport.results),
  'Il secondo import ha modificato il contenuto dei risultati.',
);
assertCondition(
  rowKeys(afterSecondImport.results).size === afterSecondImport.results.length,
  'Duplicati session_id+rider_id dopo il secondo import.',
);
assertCondition(
  sameJson(afterFirstImport.sessions, afterSecondImport.sessions),
  'Il secondo import ha modificato gli stati delle sessioni.',
);

console.log(`\n✓ Import mirato ${GP_CODE}: dry-run, 3 sessioni, upsert idempotente e FINISHED verificati.`);
console.log(`  Risultati verificati: ${afterSecondImport.results.length}`);