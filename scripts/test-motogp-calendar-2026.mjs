/**
 * Verifica calendario e sessioni MotoGP 2026.
 *
 * Questo script è solo diagnostico: legge l'API pubblica MotoGP e non
 * effettua alcuna scrittura su Supabase.
 */

const BASE = 'https://api.motogp.pulselive.com/motogp/v1';
const SEASON_UUID = 'e88b4e43-2209-47aa-8e83-0e0b1cedde6e';
const RESULTS_CATEGORY_UUID = 'e8c110ad-64aa-4e8e-8a86-f2f152f6a942';
const SEASON_YEAR = 2026;

const anomalies = [];
const observedSessionTypes = new Set();

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

async function get(path) {
  const url = `${BASE}${path}`;
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

  return { json, url, contentType: response.headers.get('content-type') };
}

function normalizeEvent(source) {
  const id = textValue(firstValue(source.id, source.uuid, source.eventUuid));
  const country = textValue(firstValue(
    source.country,
    source.countryName,
    source.location?.country,
    source.circuit?.country,
  ));
  const circuit = textValue(firstValue(
    source.circuit,
    source.circuitName,
    source.track,
    source.trackName,
    source.location?.circuit,
  ));
  const dateStart = firstValue(
    source.date_start,
    source.dateStart,
    source.startDate,
    source.date?.start,
    source.start,
  );
  const dateEnd = firstValue(
    source.date_end,
    source.dateEnd,
    source.endDate,
    source.date?.end,
    source.end,
  );
  const orderValue = firstValue(
    source.round,
    source.roundNumber,
    source.order,
    source.sequence,
    source.number,
  );
  const order = Number.isFinite(Number(orderValue)) ? Number(orderValue) : null;

  return {
    id,
    name: textValue(firstValue(source.name, source.eventName, source.longName)),
    short_name: textValue(firstValue(
      source.short_name,
      source.shortName,
      source.shortname,
      source.abbreviation,
    )),
    country,
    circuit,
    date_start: textValue(dateStart),
    date_end: textValue(dateEnd),
    test: booleanValue(source.test),
    status: textValue(firstValue(source.status, source.state)),
    round: order,
    raw: source,
  };
}

function normalizeSession(source, event) {
  const rawType = textValue(firstValue(
    source.type,
    source.session_type,
    source.sessionType,
    source.session?.type,
    source.name,
  ));
  const upperType = (rawType ?? '').toUpperCase().replace(/[^A-Z]/g, '');
  let type = null;

  if (upperType === 'FP' || upperType.includes('FREEPRACTICE')) type = 'FP';
  else if (upperType === 'PR' || upperType.includes('PRACTICE')) type = 'PR';
  else if (upperType === 'Q' || upperType.includes('QUAL')) type = 'Q';
  else if (upperType === 'SPR' || upperType.includes('SPRINT')) type = 'SPR';
  else if (upperType === 'WUP' || upperType.includes('WARM')) type = 'WUP';
  else if (upperType === 'RAC' || upperType.includes('RACE')) type = 'RAC';
  else if (rawType) type = rawType.toUpperCase();

  const id = textValue(firstValue(source.id, source.uuid, source.sessionUuid));
  const date = firstValue(
    source.date,
    source.date_start,
    source.dateStart,
    source.startDate,
    source.sessionDate,
    source.start,
  );
  const numberValue = firstValue(
    source.number,
    source.sessionNumber,
    source.order,
    source.sequence,
  );

  if (type) observedSessionTypes.add(type);

  return {
    id,
    type,
    raw_type: rawType,
    status: textValue(firstValue(source.status, source.state)),
    date: textValue(date),
    number: Number.isFinite(Number(numberValue)) ? Number(numberValue) : textValue(numberValue),
    event: event.name ?? event.short_name ?? event.id,
    category: textValue(firstValue(
      source.category,
      source.categoryName,
      source.category?.name,
    )) ?? 'MotoGP',
  };
}

function sortEvents(a, b) {
  if (a.round !== null && b.round !== null && a.round !== b.round) {
    return a.round - b.round;
  }
  return String(a.date_start ?? '').localeCompare(String(b.date_start ?? ''));
}

function eventKey(event) {
  return event.id ?? `${event.name}|${event.date_start}`;
}

function reportEventAnomalies(event, sessions) {
  const types = new Set(sessions.map(session => session.type).filter(Boolean));
  const eventStartDay = event.date_start?.slice(0, 10);
  const eventEndDay = event.date_end?.slice(0, 10);
  const sessionsOutsideEventWindow = [];

  if (!event.id) anomalies.push(`Evento senza UUID: ${event.name ?? '(senza nome)'}`);
  if (!event.name) anomalies.push(`Evento ${event.id ?? '(senza UUID)'} senza nome.`);
  if (!event.date_start || !event.date_end) {
    anomalies.push(`GP "${event.name ?? event.id}" senza data completa.`);
  }
  if (!types.has('Q')) {
    anomalies.push(`GP "${event.name ?? event.id}" senza sessione Q.`);
  }
  if (!types.has('RAC')) {
    anomalies.push(`GP "${event.name ?? event.id}" senza sessione RAC.`);
  }
  for (const session of sessions) {
    if (!session.id) {
      anomalies.push(`GP "${event.name ?? event.id}" con sessione senza UUID.`);
    }
    if (!session.type) {
      anomalies.push(
        `GP "${event.name ?? event.id}" con tipo sessione non riconosciuto` +
        ` (${session.raw_type ?? 'assente'}).`,
      );
    }
    const sessionDay = session.date?.slice(0, 10);
    if (
      sessionDay &&
      eventStartDay &&
      eventEndDay &&
      (sessionDay < eventStartDay || sessionDay > eventEndDay)
    ) {
      sessionsOutsideEventWindow.push(
        `${session.type ?? session.raw_type ?? 'UNKNOWN'} (${sessionDay})`,
      );
    }
  }
  if (sessionsOutsideEventWindow.length > 0) {
    anomalies.push(
      `GP "${event.name ?? event.id}" con ${sessionsOutsideEventWindow.length} ` +
      `sessioni fuori dalla finestra evento ${eventStartDay} → ${eventEndDay}: ` +
      `${sessionsOutsideEventWindow.join(', ')}.`,
    );
  }
}

try {
  section('CALENDARIO + SESSIONI MotoGP 2026');
  console.log(`  seasonUuid: ${SEASON_UUID}`);
  console.log(`  categoryUuid MotoGP results: ${RESULTS_CATEGORY_UUID}`);

  section('1 · EVENTI API');
  const eventResponses = [];
  for (const isFinished of ['false', 'true']) {
    const path = `/results/events?seasonUuid=${SEASON_UUID}&isFinished=${isFinished}`;
    try {
      const response = await get(path);
      const list = listFrom(response.json, ['events', 'items', 'results']);
      eventResponses.push({ isFinished, list });
      console.log(`  ✓ ${path} — ${list.length} record`);
    } catch (error) {
      anomalies.push(`Endpoint eventi isFinished=${isFinished} fallito: ${error.message}`);
      console.log(`  ✗ ${path} — ${error.message}`);
    }
  }

  const rawEvents = eventResponses.flatMap(response => response.list);
  const eventByKey = new Map();
  for (const sourceEvent of rawEvents) {
    const event = normalizeEvent(sourceEvent);
    const key = eventKey(event);
    const previous = eventByKey.get(key);
    eventByKey.set(key, previous ? { ...previous, ...event, raw: sourceEvent } : event);
  }

  const allEvents = [...eventByKey.values()].sort(sortEvents);
  const testEvents = allEvents.filter(event => event.test);
  const realGps = allEvents.filter(event => !event.test);

  console.log(`  Record API totali (prima della deduplicazione): ${rawEvents.length}`);
  console.log(`  Eventi unici: ${allEvents.length}`);
  console.log(`  Eventi test esclusi dai GP giocabili: ${testEvents.length}`);
  console.log(`  GP reali da analizzare: ${realGps.length}`);

  section('2 · SESSIONI PER GP REALI');
  const calendar = [];

  for (const [index, event] of realGps.entries()) {
    const eventLabel = event.name ?? event.id ?? `evento ${index + 1}`;
    const path = `/results/sessions?eventUuid=${encodeURIComponent(event.id)}&categoryUuid=${RESULTS_CATEGORY_UUID}`;
    let sessions = [];

    if (!event.id) {
      anomalies.push(`Impossibile recuperare le sessioni per "${eventLabel}": UUID assente.`);
    } else {
      try {
        const response = await get(path);
        const sourceSessions = listFrom(response.json, ['sessions', 'items', 'results']);
        sessions = sourceSessions.map(source => normalizeSession(source, event));
        console.log(`  ✓ ${eventLabel} — ${sessions.length} sessioni`);
      } catch (error) {
        anomalies.push(`Sessioni non recuperabili per "${eventLabel}": ${error.message}`);
        console.log(`  ✗ ${eventLabel} — ${error.message}`);
      }
    }

    reportEventAnomalies(event, sessions);
    calendar.push({ event, sessions });
  }

  section('3 · REPORT CALENDARIO 2026');
  for (const [index, { event, sessions }] of calendar.entries()) {
    console.log(`\nGP ${index + 1}`);
    console.log(`Nome: ${event.name ?? '—'}`);
    console.log(`Nome breve: ${event.short_name ?? '—'}`);
    console.log(`Paese: ${event.country ?? '—'}`);
    console.log(`Circuito: ${event.circuit ?? '—'}`);
    console.log(`Data: ${event.date_start ?? '—'} → ${event.date_end ?? '—'}`);
    console.log(`Test: ${event.test}`);
    console.log(`Status: ${event.status ?? '—'}`);
    console.log(`Round/ordine: ${event.round ?? '—'}`);
    console.log('SESSIONI');

    if (sessions.length === 0) {
      console.log('- (nessuna sessione disponibile)');
    } else {
      for (const session of sessions) {
        console.log(
          `- ${session.type ?? 'UNKNOWN'} | id: ${session.id ?? '—'} | ` +
          `status: ${session.status ?? '—'} | date: ${session.date ?? '—'} | ` +
          `number: ${session.number ?? '—'} | event: ${session.event ?? '—'} | ` +
          `category: ${session.category ?? '—'}`,
        );
      }
    }
  }

  const gpsWithRace = calendar.filter(({ sessions }) =>
    sessions.some(session => session.type === 'RAC'),
  ).length;
  const gpsWithSprint = calendar.filter(({ sessions }) =>
    sessions.some(session => session.type === 'SPR'),
  ).length;
  const gpsWithoutRace = calendar.filter(({ sessions }) =>
    !sessions.some(session => session.type === 'RAC'),
  ).length;

  section('4 · RIEPILOGO E VALIDAZIONI');
  console.log(`Totale eventi API: ${rawEvents.length}`);
  console.log(`Eventi unici: ${allEvents.length}`);
  console.log(`Eventi test: ${testEvents.length}`);
  console.log(`GP reali: ${realGps.length}`);
  console.log(`GP con gara RAC: ${gpsWithRace}`);
  console.log(`GP con Sprint: ${gpsWithSprint}`);
  console.log(`GP senza RAC: ${gpsWithoutRace}`);
  console.log(`Tipi sessione osservati: ${[...observedSessionTypes].sort().join(', ') || '(nessuno)'}`);
  console.log('Eventi test esclusi dal calendario giocabile: SÌ');
  console.log('Scritture Supabase: NESSUNA');

  console.log('\nEventuali anomalie:');
  if (anomalies.length === 0) {
    console.log('- nessuna');
  } else {
    anomalies.forEach(anomaly => console.log(`- ${anomaly}`));
  }
} catch (error) {
  console.error(
    '\n✗ Verifica calendario fallita:',
    error instanceof Error ? error.message : error,
  );
  process.exitCode = 1;
}