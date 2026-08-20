/**
 * Dry-run import calendario e sessioni MotoGP 2026.
 *
 * Questo script legge l'API pubblica MotoGP e costruisce in memoria i record
 * destinati a public.grand_prix e public.sessions.
 * Non esegue INSERT, UPDATE, UPSERT o DELETE su Supabase.
 */

const API_BASE = 'https://api.motogp.pulselive.com/motogp/v1';
const SEASON_ID = 'e88b4e43-2209-47aa-8e83-0e0b1cedde6e';
const RESULTS_CATEGORY_ID = 'e8c110ad-64aa-4e8e-8a86-f2f152f6a942';
const SEASON_YEAR = 2026;
const KNOWN_SESSION_TYPES = ['FP', 'PR', 'Q', 'SPR', 'WUP', 'RAC'];

const anomalies = {
  duplicateGrandPrix: 0,
  duplicateSessions: 0,
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
  const normalized = (rawType ?? '').toUpperCase().replace(/[^A-Z]/g, '');

  if (normalized === 'FP' || normalized.includes('FREEPRACTICE')) return 'FP';
  if (normalized === 'PR' || normalized.includes('PRACTICE')) return 'PR';
  if (normalized === 'Q' || normalized.includes('QUAL')) return 'Q';
  if (normalized === 'SPR' || normalized.includes('SPRINT')) return 'SPR';
  if (normalized === 'WUP' || normalized.includes('WARM')) return 'WUP';
  if (normalized === 'RAC' || normalized.includes('RACE')) return 'RAC';
  return rawType ? rawType.toUpperCase() : null;
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
  section('DRY-RUN CALENDARIO MotoGP 2026');
  console.log(`  season_id: ${SEASON_ID}`);
  console.log(`  categoryUuid MotoGP results: ${RESULTS_CATEGORY_ID}`);
  console.log(`  stagione: ${SEASON_YEAR}`);
  console.log('  Scritture Supabase: NESSUNA');

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

  section('4 · REPORT FINALE DRY-RUN');
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

  console.log('\nRIEPILOGO PRONTO PER FUTURO IMPORT');
  console.log(`grand_prix records: ${grandPrixRecords.length}`);
  console.log(`sessions records: ${uniqueSessionRecords.length}`);
  console.log('Scritture Supabase: NESSUNA');
} catch (error) {
  console.error(
    '\n✗ Dry-run calendario fallito:',
    error instanceof Error ? error.message : error,
  );
  process.exitCode = 1;
}