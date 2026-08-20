/**
 * Import calendario e sessioni MotoGP 2026.
 *
 * Default: dry-run, nessuna scrittura.
 * Import reale: node scripts/import-motogp-calendar-2026.mjs --import
 */

const API_BASE = 'https://api.motogp.pulselive.com/motogp/v1';
const SEASON_ID = 'e88b4e43-2209-47aa-8e83-0e0b1cedde6e';
const RESULTS_CATEGORY_ID = 'e8c110ad-64aa-4e8e-8a86-f2f152f6a942';
const SEASON_YEAR = 2026;
const IMPORT_MODE = process.argv.includes('--import');
const KNOWN_SESSION_TYPES = ['FP', 'PR', 'Q', 'SPR', 'WUP', 'RAC', 'RAC2'];
const SUPABASE_URL = (
  process.env.SUPABASE_URL ??
  process.env.VITE_SUPABASE_URL ??
  ''
).replace(/\/$/, '');
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

const anomalies = {
  duplicateGrandPrix: 0,
  duplicateSessions: 0,
  grandPrixWithoutId: [],
  sessionsWithoutId: [],
  grandPrixWithoutQ: [],
  grandPrixWithoutSprint: [],
  grandPrixWithoutRace: [],
  sessionsWithMissingDate: [],
  sessionsOutsideEventWindow: [],
  unrecognizedSessionTypes: [],
  requestFailures: [],
};

function section(title) {
  console.log(`\n${'═'.repeat(72)}\n${title}\n${'═'.repeat(72)}`);
}

function firstValue(...values) {
  return values.find(value => value !== undefined && value !== null && value !== '');
}

function textValue(value) {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value === 'object') {
    return firstValue(value.name, value.label, value.shortName, value.value) ?? null;
  }
  return String(value);
}

function booleanValue(value) {
  return value === true || value === 'true' || value === 1 || value === '1';
}

function listFrom(payload, keys) {
  if (Array.isArray(payload)) return payload;
  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }
  return [];
}

function printRecord(label, record) {
  console.log(`  ${label}: ${JSON.stringify(record)}`);
}

function criticalValidationErrors(grandPrixRecords, sessionRecords) {
  const errors = [];

  if (grandPrixRecords.length === 0) errors.push('Nessun GP reale preparato.');
  if (sessionRecords.length === 0) errors.push('Nessuna sessione preparata.');
  if (anomalies.requestFailures.length > 0) {
    errors.push(`Richieste API fallite: ${anomalies.requestFailures.length}.`);
  }
  if (anomalies.duplicateGrandPrix > 0) {
    errors.push(`GP duplicati: ${anomalies.duplicateGrandPrix}.`);
  }
  if (anomalies.duplicateSessions > 0) {
    errors.push(`Sessioni duplicate: ${anomalies.duplicateSessions}.`);
  }
  if (anomalies.grandPrixWithoutId.length > 0) {
    errors.push(`GP senza ID: ${anomalies.grandPrixWithoutId.length}.`);
  }
  if (anomalies.sessionsWithoutId.length > 0) {
    errors.push(`Sessioni senza ID: ${anomalies.sessionsWithoutId.length}.`);
  }
  if (anomalies.sessionsWithMissingDate.length > 0) {
    errors.push(`Sessioni senza data: ${anomalies.sessionsWithMissingDate.length}.`);
  }
  if (anomalies.unrecognizedSessionTypes.length > 0) {
    errors.push(
      `Tipi sessione non riconosciuti: ${anomalies.unrecognizedSessionTypes.length}.`,
    );
  }
  if (anomalies.grandPrixWithoutQ.length > 0) {
    errors.push(`GP senza Q: ${anomalies.grandPrixWithoutQ.length}.`);
  }
  if (anomalies.grandPrixWithoutSprint.length > 0) {
    errors.push(`GP senza SPR: ${anomalies.grandPrixWithoutSprint.length}.`);
  }
  if (anomalies.grandPrixWithoutRace.length > 0) {
    errors.push(`GP senza RAC: ${anomalies.grandPrixWithoutRace.length}.`);
  }

  return errors;
}

async function get(path) {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'Mozilla/5.0',
    },
    signal: AbortSignal.timeout(15_000),
  });
  const text = await response.text();
  let json = null;

  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    // L'errore sotto include il corpo non JSON.
  }

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} — ${text.slice(0, 300)}`);
  }

  return { json, url };
}

async function supabaseRequest(path, options = {}) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      'Import reale non disponibile: servono VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.',
    );
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers ?? {}),
    },
    signal: AbortSignal.timeout(20_000),
  });
  const text = await response.text();
  let json = null;

  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    // L'errore sotto include il corpo raw.
  }

  if (!response.ok) {
    throw new Error(
      `Supabase REST ${response.status} ${response.statusText} — ${text.slice(0, 500)}`,
    );
  }

  return json;
}

async function verifySeasonExists() {
  const rows = await supabaseRequest(
    `/seasons?id=eq.${encodeURIComponent(SEASON_ID)}&select=id,year`,
  );
  if (!Array.isArray(rows) || rows.length !== 1) {
    throw new Error(`Stagione ${SEASON_ID} assente o non univoca in public.seasons.`);
  }
  if (rows[0].year !== undefined && Number(rows[0].year) !== SEASON_YEAR) {
    throw new Error(
      `Stagione ${SEASON_ID} con year=${rows[0].year}, atteso ${SEASON_YEAR}.`,
    );
  }
  return rows[0];
}

async function upsertRows(table, rows, onConflict) {
  if (rows.length === 0) return;
  await supabaseRequest(
    `/${table}?on_conflict=${encodeURIComponent(onConflict)}`,
    {
      method: 'POST',
      headers: {
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify(rows),
    },
  );
}

function countDuplicates(rows, keyOf) {
  const seen = new Set();
  let duplicates = 0;
  for (const row of rows) {
    const key = keyOf(row);
    if (seen.has(key)) duplicates += 1;
    else seen.add(key);
  }
  return duplicates;
}

async function verifyImportedData(expected) {
  const [grandPrixRows, allGrandPrixRows, allSessionRows] = await Promise.all([
    supabaseRequest(
      `/grand_prix?season_id=eq.${encodeURIComponent(SEASON_ID)}` +
      '&select=id,season_id,name,short_name,country,circuit,date_start,date_end,is_test,status',
    ),
    supabaseRequest('/grand_prix?select=id'),
    supabaseRequest(
      '/sessions?select=id,grand_prix_id,type,status,session_date,number',
    ),
  ]);

  const grandPrix = Array.isArray(grandPrixRows) ? grandPrixRows : [];
  const allGrandPrix = Array.isArray(allGrandPrixRows) ? allGrandPrixRows : [];
  const allSessions = Array.isArray(allSessionRows) ? allSessionRows : [];
  const grandPrixIds = new Set(grandPrix.map(row => row.id));
  const allGrandPrixIds = new Set(allGrandPrix.map(row => row.id));
  const sessions = allSessions.filter(row => grandPrixIds.has(row.grand_prix_id));
  const sessionsByGrandPrix = new Map();

  for (const session of sessions) {
    const rows = sessionsByGrandPrix.get(session.grand_prix_id) ?? [];
    rows.push(session);
    sessionsByGrandPrix.set(session.grand_prix_id, rows);
  }

  const expectedGrandPrixIds = new Set(expected.grandPrix.map(row => row.id));
  const expectedSessionIds = new Set(expected.sessions.map(row => row.id));
  const dbGrandPrixIds = new Set(grandPrix.map(row => row.id));
  const dbSessionIds = new Set(sessions.map(row => row.id));
  const missingGrandPrix = [...expectedGrandPrixIds].filter(
    id => !dbGrandPrixIds.has(id),
  );
  const missingSessions = [...expectedSessionIds].filter(
    id => !dbSessionIds.has(id),
  );
  const orphanSessions = allSessions.filter(
    row => !allGrandPrixIds.has(row.grand_prix_id),
  );
  const duplicateGrandPrix = countDuplicates(grandPrix, row => row.id);
  const duplicateSessions = countDuplicates(sessions, row => row.id);
  const grandPrixWithoutQ = [];
  const grandPrixWithoutSprint = [];
  const grandPrixWithoutRace = [];

  for (const grandPrixRow of grandPrix) {
    const types = new Set(
      (sessionsByGrandPrix.get(grandPrixRow.id) ?? []).map(row => row.type),
    );
    if (!types.has('Q')) grandPrixWithoutQ.push(grandPrixRow.name ?? grandPrixRow.id);
    if (!types.has('SPR')) {
      grandPrixWithoutSprint.push(grandPrixRow.name ?? grandPrixRow.id);
    }
    if (!types.has('RAC')) grandPrixWithoutRace.push(grandPrixRow.name ?? grandPrixRow.id);
  }

  return {
    grandPrix,
    sessions,
    sessionsByGrandPrix,
    orphanSessions,
    duplicateGrandPrix,
    duplicateSessions,
    grandPrixWithoutQ,
    grandPrixWithoutSprint,
    grandPrixWithoutRace,
    missingGrandPrix,
    missingSessions,
  };
}

function normalizeEvent(source) {
  const orderValue = firstValue(
    source.round,
    source.roundNumber,
    source.order,
    source.sequence,
    source.number,
  );

  return {
    id: textValue(firstValue(source.id, source.uuid, source.eventUuid)),
    season_id: SEASON_ID,
    name: textValue(firstValue(source.name, source.eventName, source.longName)),
    short_name: textValue(firstValue(
      source.short_name,
      source.shortName,
      source.shortname,
      source.abbreviation,
    )),
    country: textValue(firstValue(
      source.country,
      source.countryName,
      source.location?.country,
      source.circuit?.country,
    )),
    circuit: textValue(firstValue(
      source.circuit,
      source.circuitName,
      source.track,
      source.trackName,
      source.location?.circuit,
    )),
    date_start: textValue(firstValue(
      source.date_start,
      source.dateStart,
      source.startDate,
      source.date?.start,
      source.start,
    )),
    date_end: textValue(firstValue(
      source.date_end,
      source.dateEnd,
      source.endDate,
      source.date?.end,
      source.end,
    )),
    is_test: booleanValue(source.test),
    status: textValue(firstValue(source.status, source.state)),
    order: Number.isFinite(Number(orderValue)) ? Number(orderValue) : null,
  };
}

function classifySessionType(source) {
  const rawType = textValue(firstValue(
    source.type,
    source.session_type,
    source.sessionType,
    source.session?.type,
    source.name,
  ));
  // Il valore viene mantenuto esattamente come arriva dall'API: in
  // particolare RAC2 non deve essere ricondotto a RAC.
  return rawType;
}

function normalizeSession(source, grandPrixId) {
  const numberValue = firstValue(
    source.number,
    source.sessionNumber,
    source.order,
    source.sequence,
  );

  return {
    id: textValue(firstValue(source.id, source.uuid, source.sessionUuid)),
    grand_prix_id: grandPrixId,
    type: classifySessionType(source),
    status: textValue(firstValue(source.status, source.state)),
    session_date: textValue(firstValue(
      source.date,
      source.date_start,
      source.dateStart,
      source.startDate,
      source.sessionDate,
      source.start,
    )),
    number: Number.isFinite(Number(numberValue))
      ? Number(numberValue)
      : textValue(numberValue),
  };
}

function eventKey(event) {
  return event.id ?? `${event.name}|${event.date_start}`;
}

function sessionKey(session) {
  return session.id ?? [
    session.grand_prix_id,
    session.type,
    session.session_date,
    session.number,
  ].join('|');
}

function compareEvents(a, b) {
  return String(a.date_start ?? '').localeCompare(String(b.date_start ?? ''));
}

function compareSessions(a, b) {
  return String(a.session_date ?? '').localeCompare(String(b.session_date ?? ''));
}

function isOutsideEventWindow(event, session) {
  const sessionDay = session.session_date?.slice(0, 10);
  const eventStartDay = event.date_start?.slice(0, 10);
  const eventEndDay = event.date_end?.slice(0, 10);

  return Boolean(
    sessionDay &&
    eventStartDay &&
    eventEndDay &&
    (sessionDay < eventStartDay || sessionDay > eventEndDay),
  );
}

try {
  if (IMPORT_MODE) {
    section('0 · VERIFICA STAGIONE SUPABASE');
    const season = await verifySeasonExists();
    console.log(`  ✓ Stagione verificata: ${season.id} (${season.year ?? SEASON_YEAR})`);
  } else {
    console.log('\nModalità dry-run: nessuna scrittura Supabase. Aggiungi --import per importare.');
  }

  section(IMPORT_MODE ? 'IMPORT CALENDARIO MotoGP 2026' : 'DRY-RUN CALENDARIO MotoGP 2026');
  console.log(`  season_id: ${SEASON_ID}`);
  console.log(`  categoryUuid MotoGP results: ${RESULTS_CATEGORY_ID}`);
  console.log(`  stagione: ${SEASON_YEAR}`);
  console.log(
    IMPORT_MODE
      ? '  Scritture Supabase: abilitate server-side'
      : '  Scritture Supabase: NESSUNA',
  );

  section('1 · EVENTI API');
  const eventResponses = [];

  for (const isFinished of ['false', 'true']) {
    const path = `/results/events?seasonUuid=${SEASON_ID}&isFinished=${isFinished}`;
    try {
      const response = await get(path);
      const list = listFrom(response.json, ['events', 'items', 'results']);
      eventResponses.push(list);
      console.log(`  ✓ ${path} — ${list.length} record`);
    } catch (error) {
      anomalies.requestFailures.push(`Eventi isFinished=${isFinished}: ${error.message}`);
      console.log(`  ✗ ${path} — ${error.message}`);
    }
  }

  const rawEvents = eventResponses.flat();
  const eventByKey = new Map();

  for (const sourceEvent of rawEvents) {
    const event = normalizeEvent(sourceEvent);
    if (!event.id) {
      anomalies.grandPrixWithoutId.push(event.name ?? '(senza nome)');
    }
    const key = eventKey(event);
    if (eventByKey.has(key)) {
      anomalies.duplicateGrandPrix += 1;
      eventByKey.set(key, { ...eventByKey.get(key), ...event });
    } else {
      eventByKey.set(key, event);
    }
  }

  const uniqueEvents = [...eventByKey.values()];
  const testEvents = uniqueEvents.filter(event => event.is_test);
  const realEvents = uniqueEvents.filter(event => !event.is_test).sort(compareEvents);

  console.log(`  Eventi API totali: ${rawEvents.length}`);
  console.log(`  Eventi unici: ${uniqueEvents.length}`);
  console.log(`  Eventi test esclusi: ${testEvents.length}`);
  console.log(`  GP reali: ${realEvents.length}`);

  section('2 · COSTRUZIONE GRAND_PRIX E SESSIONS');
  const grandPrixRecords = [];
  const sessionRecords = [];
  const sessionsByGrandPrix = new Map();

  for (const event of realEvents) {
    const eventLabel = event.name ?? event.id ?? '(evento senza nome)';
    const eventSessions = [];

    if (!event.id) {
      anomalies.requestFailures.push(`GP "${eventLabel}" senza event UUID.`);
    } else {
      const path =
        `/results/sessions?eventUuid=${encodeURIComponent(event.id)}` +
        `&categoryUuid=${RESULTS_CATEGORY_ID}`;

      try {
        const response = await get(path);
        const sourceSessions = listFrom(response.json, ['sessions', 'items', 'results']);
        const seenSessionKeys = new Set();

        sourceSessions.forEach(sourceSession => {
          const session = normalizeSession(sourceSession, event.id);
          const key = sessionKey(session);

          if (seenSessionKeys.has(key)) {
            anomalies.duplicateSessions += 1;
            return;
          }
          seenSessionKeys.add(key);

          if (!session.id) {
            anomalies.sessionsWithoutId.push({
              grand_prix_id: event.id,
              type: session.type,
              session_date: session.session_date,
            });
          }

          if (!session.session_date) {
            anomalies.sessionsWithMissingDate.push({
              grand_prix_id: event.id,
              session_id: session.id,
              type: session.type,
            });
          }

          if (session.type && !KNOWN_SESSION_TYPES.includes(session.type)) {
            anomalies.unrecognizedSessionTypes.push({
              grand_prix_id: event.id,
              session_id: session.id,
              type: session.type,
            });
          }

          if (isOutsideEventWindow(event, session)) {
            anomalies.sessionsOutsideEventWindow.push({
              grand_prix_id: event.id,
              grand_prix: event.name,
              session_id: session.id,
              type: session.type,
              session_date: session.session_date,
              event_start: event.date_start,
              event_end: event.date_end,
            });
          }

          eventSessions.push(session);
          sessionRecords.push(session);
        });

        console.log(`  ✓ ${eventLabel} — ${sourceSessions.length} sessioni API`);
      } catch (error) {
        anomalies.requestFailures.push(`Sessioni "${eventLabel}": ${error.message}`);
        console.log(`  ✗ ${eventLabel} — ${error.message}`);
      }
    }

    const types = new Set(eventSessions.map(session => session.type));
    if (!types.has('Q')) anomalies.grandPrixWithoutQ.push(eventLabel);
    if (!types.has('SPR')) anomalies.grandPrixWithoutSprint.push(eventLabel);
    if (!types.has('RAC')) anomalies.grandPrixWithoutRace.push(eventLabel);

    sessionsByGrandPrix.set(event.id, eventSessions.sort(compareSessions));
    grandPrixRecords.push({
      id: event.id,
      season_id: event.season_id,
      name: event.name,
      short_name: event.short_name,
      country: event.country,
      circuit: event.circuit,
      date_start: event.date_start,
      date_end: event.date_end,
      is_test: event.is_test,
      status: event.status,
    });
  }

  // Ricostruisce la lista in modo deterministico e rimuove solo duplicati
  // con la stessa chiave, lasciando le anomalie già conteggiate sopra.
  const uniqueSessionRecords = [];
  const sessionRecordKeys = new Set();
  for (const session of sessionRecords) {
    const key = session.id ?? [
      session.grand_prix_id,
      session.type,
      session.session_date,
      session.number,
    ].join('|');
    if (!sessionRecordKeys.has(key)) {
      sessionRecordKeys.add(key);
      uniqueSessionRecords.push(session);
    }
  }

  section('3 · CALENDARIO 2026');
  for (const [index, grandPrix] of grandPrixRecords.entries()) {
    console.log(`\n#${index + 1}`);
    console.log(`GP: ${grandPrix.name ?? '—'}`);
    console.log(`Paese: ${grandPrix.country ?? '—'}`);
    console.log(`Circuito: ${grandPrix.circuit ?? '—'}`);
    console.log(`Evento start: ${grandPrix.date_start ?? '—'}`);
    console.log(`Evento end: ${grandPrix.date_end ?? '—'}`);
    console.log('Sessioni:');

    const sessions = sessionsByGrandPrix.get(grandPrix.id) ?? [];
    if (sessions.length === 0) {
      console.log('- (nessuna sessione disponibile)');
    } else {
      sessions.forEach(session => {
        console.log(`- ${session.type ?? 'UNKNOWN'} — ${session.session_date ?? 'data mancante'}`);
      });
    }
  }

  const sessionCounts = Object.fromEntries(
    KNOWN_SESSION_TYPES.map(type => [
      type,
      uniqueSessionRecords.filter(session => session.type === type).length,
    ]),
  );
  const gpsWithType = type => grandPrixRecords.filter(grandPrix =>
    (sessionsByGrandPrix.get(grandPrix.id) ?? []).some(session => session.type === type),
  ).length;
  const preImportErrors = criticalValidationErrors(
    grandPrixRecords,
    uniqueSessionRecords,
  );
  let databaseVerification = null;
  let databaseSessionCounts = null;
  const importErrors = [];

  if (IMPORT_MODE) {
    section('4 · VALIDAZIONE CRITICA PRE-IMPORT');
    if (preImportErrors.length > 0) {
      preImportErrors.forEach(error => console.error(`  ✗ ${error}`));
      throw new Error(
        'Validazione critica fallita: import interrotto prima di ogni scrittura.',
      );
    }
    console.log('  ✓ Validazioni critiche superate.');
    console.log(
      `  ✓ Anomalie date non bloccanti: ${anomalies.sessionsOutsideEventWindow.length}`,
    );

    section('5 · IMPORT SUPABASE (UPSERT SERVER-SIDE)');
    await upsertRows('grand_prix', grandPrixRecords, 'id');
    console.log(`  ✓ Grand Prix upsert: ${grandPrixRecords.length}`);
    await upsertRows('sessions', uniqueSessionRecords, 'id');
    console.log(`  ✓ Sessions upsert: ${uniqueSessionRecords.length}`);

    section('6 · VERIFICA RELAZIONI SUPABASE');
    await verifySeasonExists();
    databaseVerification = await verifyImportedData({
      grandPrix: grandPrixRecords,
      sessions: uniqueSessionRecords,
    });
    databaseSessionCounts = Object.fromEntries(
      KNOWN_SESSION_TYPES.map(type => [
        type,
        databaseVerification.sessions.filter(session => session.type === type).length,
      ]),
    );

    if (databaseVerification.grandPrix.length !== grandPrixRecords.length) {
      importErrors.push(
        `Grand Prix DB attesi ${grandPrixRecords.length}, trovati ${databaseVerification.grandPrix.length}.`,
      );
    }
    if (databaseVerification.sessions.length !== uniqueSessionRecords.length) {
      importErrors.push(
        `Sessioni DB attese ${uniqueSessionRecords.length}, trovate ${databaseVerification.sessions.length}.`,
      );
    }
    if (databaseVerification.missingGrandPrix.length > 0) {
      importErrors.push(
        `Grand Prix importati ma non trovati: ${databaseVerification.missingGrandPrix.length}.`,
      );
    }
    if (databaseVerification.missingSessions.length > 0) {
      importErrors.push(
        `Sessioni importate ma non trovate: ${databaseVerification.missingSessions.length}.`,
      );
    }
    if (databaseVerification.duplicateGrandPrix > 0) {
      importErrors.push(
        `Grand Prix duplicati nel DB: ${databaseVerification.duplicateGrandPrix}.`,
      );
    }
    if (databaseVerification.duplicateSessions > 0) {
      importErrors.push(
        `Sessioni duplicate nel DB: ${databaseVerification.duplicateSessions}.`,
      );
    }
    if (databaseVerification.orphanSessions.length > 0) {
      importErrors.push(
        `Sessioni orfane nel DB: ${databaseVerification.orphanSessions.length}.`,
      );
    }
    if (databaseVerification.grandPrixWithoutQ.length > 0) {
      importErrors.push(`GP DB senza Q: ${databaseVerification.grandPrixWithoutQ.length}.`);
    }
    if (databaseVerification.grandPrixWithoutSprint.length > 0) {
      importErrors.push(
        `GP DB senza SPR: ${databaseVerification.grandPrixWithoutSprint.length}.`,
      );
    }
    if (databaseVerification.grandPrixWithoutRace.length > 0) {
      importErrors.push(
        `GP DB senza RAC: ${databaseVerification.grandPrixWithoutRace.length}.`,
      );
    }
  }

  section(IMPORT_MODE ? 'IMPORT COMPLETATO' : '4 · REPORT FINALE DRY-RUN');
  if (IMPORT_MODE) {
    console.log('Grand Prix:');
    console.log(`API: ${grandPrixRecords.length}`);
    console.log(`DB: ${databaseVerification.grandPrix.length}`);
    console.log('\nSessions:');
    console.log(`API: ${uniqueSessionRecords.length}`);
    console.log(`DB: ${databaseVerification.sessions.length}`);
    console.log('\nPer tipo:');
    KNOWN_SESSION_TYPES.forEach(type => {
      console.log(`${type}: ${databaseSessionCounts[type]}`);
    });
    console.log('\nVerifiche:');
    console.log(`- GP duplicati: ${databaseVerification.duplicateGrandPrix}`);
    console.log(`- sessioni duplicate: ${databaseVerification.duplicateSessions}`);
    console.log(`- sessioni orfane: ${databaseVerification.orphanSessions.length}`);
    console.log(`- GP senza Q: ${databaseVerification.grandPrixWithoutQ.length}`);
    console.log(`- GP senza SPR: ${databaseVerification.grandPrixWithoutSprint.length}`);
    console.log(`- GP senza RAC: ${databaseVerification.grandPrixWithoutRace.length}`);
    console.log(`- errori: ${preImportErrors.length + importErrors.length}`);
    console.log('Scritture Supabase: UPSERT completati');
  } else {
    console.log(`Totale eventi API: ${rawEvents.length}`);
    console.log(`Eventi unici: ${uniqueEvents.length}`);
    console.log(`Eventi test: ${testEvents.length}`);
    console.log(`GP reali: ${realEvents.length}`);
    console.log(`Sessioni totali: ${uniqueSessionRecords.length}`);
    KNOWN_SESSION_TYPES.forEach(type => console.log(`${type}: ${sessionCounts[type]}`));
    console.log(`GP con Q: ${gpsWithType('Q')}`);
    console.log(`GP con SPR: ${gpsWithType('SPR')}`);
    console.log(`GP con RAC: ${gpsWithType('RAC')}`);
    console.log(`Duplicati GP: ${anomalies.duplicateGrandPrix}`);
    console.log(`Duplicati sessioni: ${anomalies.duplicateSessions}`);
    console.log(`GP senza Q: ${anomalies.grandPrixWithoutQ.length}`);
    console.log(`GP senza SPR: ${anomalies.grandPrixWithoutSprint.length}`);
    console.log(`GP senza RAC: ${anomalies.grandPrixWithoutRace.length}`);
    console.log(`Sessioni con data mancante: ${anomalies.sessionsWithMissingDate.length}`);
    console.log(`Sessioni fuori finestra evento: ${anomalies.sessionsOutsideEventWindow.length}`);
    console.log('Scritture Supabase: NESSUNA');
  }

  console.log('\nEventuali anomalie:');
  const hasAnomalies = Object.values(anomalies).some(value =>
    Array.isArray(value) ? value.length > 0 : value > 0,
  );
  if (!hasAnomalies) {
    console.log('- nessuna');
  } else {
    if (anomalies.requestFailures.length > 0) {
      anomalies.requestFailures.forEach(item => printRecord('request failure', item));
    }
    if (anomalies.grandPrixWithoutQ.length > 0) {
      printRecord('GP senza Q', anomalies.grandPrixWithoutQ);
    }
    if (anomalies.grandPrixWithoutSprint.length > 0) {
      printRecord('GP senza SPR', anomalies.grandPrixWithoutSprint);
    }
    if (anomalies.grandPrixWithoutRace.length > 0) {
      printRecord('GP senza RAC', anomalies.grandPrixWithoutRace);
    }
    if (anomalies.sessionsWithMissingDate.length > 0) {
      printRecord('sessioni con data mancante', anomalies.sessionsWithMissingDate);
    }
    if (anomalies.sessionsOutsideEventWindow.length > 0) {
      console.log('  Sessioni fuori finestra evento:');
      const outsideByGrandPrix = new Map();
      for (const session of anomalies.sessionsOutsideEventWindow) {
        const group = outsideByGrandPrix.get(session.grand_prix_id) ?? [];
        group.push(session);
        outsideByGrandPrix.set(session.grand_prix_id, group);
      }
      for (const sessions of outsideByGrandPrix.values()) {
        const [first] = sessions;
        const details = sessions
          .map(session => `${session.type ?? 'UNKNOWN'} (${session.session_date})`)
          .join(', ');
        console.log(
          `  - ${first.grand_prix}: ${details}; ` +
          `evento ${first.event_start} → ${first.event_end}`,
        );
      }
    }
    if (anomalies.unrecognizedSessionTypes.length > 0) {
      printRecord('tipi sessione non riconosciuti', anomalies.unrecognizedSessionTypes);
    }
  }

  if (IMPORT_MODE) {
    section('RIEPILOGO GP');
    console.log('GP | Circuito | Q | SPR | RAC | RAC2 | Data gara');
    for (const grandPrix of [...databaseVerification.grandPrix].sort(compareEvents)) {
      const sessions = databaseVerification.sessionsByGrandPrix.get(grandPrix.id) ?? [];
      const types = new Set(sessions.map(session => session.type));
      const raceDate = sessions
        .filter(session => session.type === 'RAC')
        .sort(compareSessions)[0]?.session_date ?? '—';
      console.log(
        `${grandPrix.name ?? '—'} | ${grandPrix.circuit ?? '—'} | ` +
        `${types.has('Q') ? 'SÌ' : 'NO'} | ${types.has('SPR') ? 'SÌ' : 'NO'} | ` +
        `${types.has('RAC') ? 'SÌ' : 'NO'} | ${types.has('RAC2') ? 'SÌ' : 'NO'} | ` +
        `${raceDate}`,
      );
    }
  } else {
    console.log('\nRIEPILOGO PRONTO PER FUTURO IMPORT');
    console.log(`grand_prix records: ${grandPrixRecords.length}`);
    console.log(`sessions records: ${uniqueSessionRecords.length}`);
    console.log('Scritture Supabase: NESSUNA');
  }
} catch (error) {
  console.error(
    '\n✗ Dry-run calendario fallito:',
    error instanceof Error ? error.message : error,
  );
  process.exitCode = 1;
}