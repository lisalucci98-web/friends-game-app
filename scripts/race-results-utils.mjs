/**
 * Regole condivise per risultati di gare MotoGP interrotte e ripartite.
 *
 * La API può rappresentare RAC Part 1 e RAC2 Part 2 con lo stesso type
 * `RAC`, distinguendoli con `number`. Non bisogna quindi scegliere una sola
 * sessione in base al numero di righe o alla data.
 */

export const RACE_SESSION_TYPES = new Set(['RAC', 'RAC2']);
export const CLOSED_SESSION_STATUSES = new Set([
  'FINISHED',
  'COMPLETED',
  'CLASSIFIED',
  'CLOSED',
]);

export function isRaceSessionType(type) {
  return RACE_SESSION_TYPES.has(String(type ?? '').toUpperCase());
}

export function sessionNumber(session) {
  const value = Number(session?.number ?? session?.sessionNumber ?? session?.order);
  return Number.isFinite(value) ? value : null;
}

export function compareRaceSessions(left, right) {
  const leftNumber = sessionNumber(left);
  const rightNumber = sessionNumber(right);
  if (leftNumber === null && rightNumber !== null) return -1;
  if (leftNumber !== null && rightNumber === null) return 1;
  return (
    (leftNumber ?? 0) - (rightNumber ?? 0)
    || String(left?.session_date ?? '').localeCompare(String(right?.session_date ?? ''))
    || String(left?.id ?? '').localeCompare(String(right?.id ?? ''))
  );
}

/**
 * Restituisce tutte le sessioni Gara chiuse con risultati per il GP.
 * RAC Part 1 e RAC2 restano elementi distinti nell'array.
 */
export function chooseOfficialRaceSessions(
  sessions,
  resultsBySession,
  grandPrixId,
) {
  return sessions
    .filter((session) => (
      session.grand_prix_id === grandPrixId
      && isRaceSessionType(session.type)
      && CLOSED_SESSION_STATUSES.has(String(session.status ?? '').toUpperCase())
    ))
    .map((session) => ({
      session,
      results: resultsBySession.get(session.id) ?? [],
    }))
    .filter(({ results }) => results.length > 0)
    .sort((left, right) => compareRaceSessions(left.session, right.session));
}

export function flattenRaceResults(resultSets) {
  if (!Array.isArray(resultSets)) return [];
  return resultSets.flatMap((resultSet) => (
    Array.isArray(resultSet) ? resultSet : [resultSet]
  ));
}

export function isRaceOutStatus(status) {
  return [
    'NC',
    'NOT CLASSIFIED',
    'NOT_CLASSIFIED',
    'NOT ON RESTART GRID',
    'NOT_ON_RESTART_GRID',
    'DNF',
    'DNS',
    'DSQ',
    'RETIRED',
    'WITHDRAWN',
  ].includes(String(status ?? '').trim().toUpperCase());
}

/**
 * Calcola gli OUT della Gara completa, unendo tutte le classifiche di Part 1
 * e Part 2. Un pilota che compare in due sezioni viene contato una sola volta.
 */
export function raceOutRiderIds(resultSets) {
  return new Set(
    flattenRaceResults(resultSets)
      .filter((result) => isRaceOutStatus(result.status))
      .map((result) => result.rider_id ?? result.rider_number)
      .filter((riderId) => riderId !== null && riderId !== undefined && riderId !== ''),
  );
}

/**
 * Abbina le sessioni API alle sessioni DB senza sovrascrivere una Parte.
 * Il numero è la chiave primaria; l'indice è solo fallback per feed privi di
 * numero, mantenendo l'ordine ufficiale Part 1 → Part 2.
 */
export function pairRaceSessions(apiSessions, dbSessions) {
  const available = [...dbSessions].sort(compareRaceSessions);
  const used = new Set();
  return [...apiSessions]
    .sort(compareRaceSessions)
    .map((apiSession, index) => {
      const number = sessionNumber(apiSession);
      let dbSession = available.find((candidate) => (
        !used.has(candidate.id)
        && sessionNumber(candidate) === number
      ));
      if (!dbSession) {
        dbSession = available.filter((candidate) => !used.has(candidate.id))[index] ?? null;
      }
      if (dbSession) used.add(dbSession.id);
      return { apiSession, dbSession };
    });
}