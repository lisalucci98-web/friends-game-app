/**
 * Specifica eseguibile, ma isolata, dello scoring storico ricavato dai
 * workbook Excel 2026. Non importa moduli dell'app e non usa Supabase.
 */

import {
  flattenRaceResults,
  isRaceOutStatus,
} from './race-results-utils.mjs';

export const SPRINT_MATRIX = [
  [3, 1, 0],
  [1, 3, 1],
  [0, 1, 3],
];

export const RACE_MATRIX = [
  [5, 3, 1, 1, 1],
  [3, 5, 3, 1, 1],
  [1, 3, 5, 3, 1],
  [1, 1, 3, 5, 3],
  [1, 1, 1, 3, 5],
];

function rejectNa(value, label) {
  if (String(value ?? '').trim().toUpperCase() === '#N/A') {
    throw new Error(`${label}: #N/A è un errore Excel, non un rider valido`);
  }
}

/**
 * Replica MID(D,1,2), MID(D,4,2), MID(D,7,3): il separatore può essere
 * "." oppure ":" perché non viene interpretato, vengono letti caratteri fissi.
 */
export function parseExcelTime(value, label = 'tempo') {
  if (value === '' || value === null || value === undefined) return null;
  rejectNa(value, label);
  const text = String(value);
  if (!/^\d{2}:\d{2}[.:]\d{3}$/.test(text)) {
    throw new Error(`${label}: formato inatteso ${text}`);
  }
  return (Number(text.slice(0, 2)) * 60)
    + Number(text.slice(3, 5))
    + (Number(text.slice(6, 9)) * 0.001);
}

export function qualifyingTimePoints(predictedTime, officialTime) {
  if (predictedTime === null || predictedTime === undefined
    || officialTime === null || officialTime === undefined) {
    return 0;
  }
  const error = Math.abs(predictedTime - officialTime);
  if (error < 0.01) return 10;
  if (error < officialTime * 0.001) return 5;
  if (error < officialTime * 0.0025) return 3;
  if (error < officialTime * 0.005) return 1;
  return 0;
}

function riderPresent(value) {
  return value !== '' && value !== null && value !== undefined;
}

export function isNonClassifiedStatus(status) {
  return isRaceOutStatus(status);
}

/**
 * SEARCH è case-insensitive e lavora per sottostringa. SEARCH("", text)
 * restituisce una posizione valida in Excel, quindi includes("") è voluto.
 */
export function excelSearch(query, text) {
  rejectNa(query, 'ricerca');
  rejectNa(text, 'testo Out');
  return String(text ?? '').toLocaleLowerCase('it-IT')
    .includes(String(query ?? '').toLocaleLowerCase('it-IT'));
}

function indexOfRider(list, rider) {
  if (!riderPresent(rider)) return null;
  rejectNa(rider, 'rider');
  const index = list.indexOf(rider);
  return index < 0 ? null : index + 1;
}

function positionPoints(matrix, predictedPosition, officialPosition) {
  if (officialPosition === null) return 0;
  return matrix[predictedPosition - 1]?.[officialPosition - 1] ?? 0;
}

function exactBonus(exactPositions) {
  if (exactPositions === 5) return 5;
  if (exactPositions === 4) return 3;
  if (exactPositions === 3) return 1;
  return 0;
}

/**
 * Conta gli NC solo tra i cinque piloti pronosticati per la Gara.
 *
 * Con una Set il chiamante fornisce gli identificativi ufficiali degli Out;
 * con una stringa si mantiene la semantica SEARCH degli export Excel storici.
 */
export function countPredictedNc(raceTopFive, officialOut) {
  const officialOutSet = officialOut instanceof Set
    ? officialOut
    : Array.isArray(officialOut) ? new Set(officialOut) : null;
  return raceTopFive.slice(0, 5).filter((rider) => riderPresent(rider) && (
    officialOutSet
      ? officialOutSet.has(rider)
      : excelSearch(rider, officialOut)
  )).length;
}

export function malusFromNcCount(ncCount) {
  if (ncCount >= 5) return -10;
  if (ncCount >= 3) return -5;
  if (ncCount >= 1) return -1;
  return 0;
}

/**
 * Estrae i cinque piloti pronosticati per la Gara dagli entry DB.
 *
 * Gli entry mancanti sono rappresentati come null: una prediction parziale
 * non deve trasformare un campo assente in un pilota o in un NC.
 */
export function raceRiderIdsFromEntries(raceEntries) {
  const byPosition = new Map();
  for (const entry of raceEntries ?? []) {
    const position = Number(entry.position);
    if (!Number.isInteger(position) || position < 1 || position > 5) continue;
    if (!byPosition.has(position)) byPosition.set(position, entry.rider_id ?? null);
  }
  return [1, 2, 3, 4, 5].map((position) => byPosition.get(position) ?? null);
}

/**
 * Restituisce gli identificativi dei piloti classificati come OUT/NC nella
 * sessione ufficiale della Gara.
 */
export function officialOutRiderIds(sessionResults) {
  return new Set(
    flattenRaceResults(sessionResults)
      .filter((result) => isNonClassifiedStatus(result.status))
      .map((result) => result.rider_id)
      .filter(riderPresent),
  );
}

/**
 * Audit indipendente del malus Gara: conta solo l'intersezione tra i cinque
 * entry RACE e l'unione degli OUT di tutte le classifiche RAC della Gara.
 */
export function auditRaceMalus(raceEntries, sessionResults) {
  const raceRiderIds = raceRiderIdsFromEntries(raceEntries);
  const officialOut = officialOutRiderIds(sessionResults);
  const ncRiderIds = raceRiderIds.filter((riderId) => (
    riderPresent(riderId) && officialOut.has(riderId)
  ));
  const ncCount = ncRiderIds.length;
  return {
    raceRiderIds,
    officialOutRiderIds: [...officialOut],
    ncRiderIds,
    ncCount,
    expectedMalus: malusFromNcCount(ncCount),
  };
}

// Alias mantenuto per compatibilità con i report storici che chiamavano NC "L".
export function malusFromL(L) {
  return malusFromNcCount(L);
}

/**
 * Mappa il risultato dello scorer nei campi aggregati della tabella
 * predictions.
 *
 * `scorePrediction().race` è la categoria Gara storica completa e include
 * bonus/malus. Il database, invece, espone bonus_points e malus_points in
 * colonne separate: race_points deve quindi contenere solo racePosition.
 */
export function predictionAggregateFromScore(score) {
  const qualifying = Number(score.qualifying ?? 0);
  const sprint = Number(score.sprint ?? 0);
  const racePosition = Number(score.racePosition ?? 0);
  const bonus = Number(score.bonus ?? 0);
  const malus = Number(score.malus ?? 0);

  return {
    qualifying,
    sprint,
    race: racePosition,
    bonus,
    malus,
    total: qualifying + sprint + racePosition + bonus + malus,
  };
}

export function scorePrediction(prediction, officialResults) {
  rejectNa(prediction.pole, 'Pole');
  for (const [index, rider] of prediction.sprint.entries()) {
    rejectNa(rider, `Sprint P${index + 1}`);
  }
  for (const [index, rider] of prediction.raceTopFive.entries()) {
    rejectNa(rider, `Gara P${index + 1}`);
  }
  rejectNa(prediction.out, 'OUT');

  const polePoints = prediction.pole === officialResults.pole
    ? 5
    : prediction.pole === officialResults.secondQualifying ? 2 : 0;
  const predictedTime = parseExcelTime(prediction.qualifyingTime, 'tempo pronosticato');
  const qualifyingTime = qualifyingTimePoints(
    predictedTime,
    officialResults.qualifyingTimeSeconds,
  );
  const qualifying = polePoints + qualifyingTime;

  const sprint = prediction.sprint.reduce((total, rider, index) => {
    const officialPosition = indexOfRider(officialResults.sprintTopThree, rider);
    return total + positionPoints(SPRINT_MATRIX, index + 1, officialPosition);
  }, 0);

  const raceTopFive = prediction.raceTopFive;
  const officialPositions = raceTopFive.map((rider) =>
    indexOfRider(officialResults.raceTopFive, rider));
  const racePosition = officialPositions.reduce((total, officialPosition, index) =>
    total + positionPoints(RACE_MATRIX, index + 1, officialPosition), 0);
  const exactPositions = raceTopFive.reduce((total, rider, index) =>
    total + (rider === officialResults.raceTopFive[index] ? 1 : 0), 0);
  const topFiveBonus = raceTopFive.every((rider) =>
    officialResults.raceTopFive.includes(rider)) ? 2 : 0;
  const exactOrderBonus = exactBonus(exactPositions);
  const officialOut = officialResults.outRiderIds ?? officialResults.outText;
  const outBonus = officialResults.outText !== undefined
    ? excelSearch(prediction.out, officialResults.outText)
      ? 2
      : 0
    : officialOut instanceof Set && officialOut.has(prediction.out) ? 2 : 0;
  const bonus = topFiveBonus + exactOrderBonus + outBonus;
  const outPenalty = raceTopFive.some((rider) => rider === prediction.out) ? -2 : 0;

  const ncCount = countPredictedNc(raceTopFive, officialOut);
  const malus = malusFromNcCount(ncCount);
  const noOpFormulaTerm = 0;
  const race = racePosition + outPenalty + bonus + malus + noOpFormulaTerm;

  return {
    polePoints,
    qualifyingTime,
    qualifying,
    sprint,
    racePosition,
    exactPositions,
    topFiveBonus,
    exactOrderBonus,
    outBonus,
    bonus,
    outPenalty,
    ncCount,
    // L è il nome storico della stessa componente NC nei workbook Excel.
    L: ncCount,
    malus,
    noOpFormulaTerm,
    race,
    total: qualifying + sprint + race,
  };
}

export const REQUIRED_CASES = [
  {
    email: 'nikyturets@gmail.com',
    user: 'Niky',
    gp: 'Thailandia',
    sourceRows: 'Q9 / S7 / R9',
    prediction: {
      pole: 'M. Bezzecchi',
      qualifyingTime: '01:28.526',
      sprint: ['M. Bezzecchi', 'M. Marquez', 'F. Di Giannantonio'],
      raceTopFive: ['M. Marquez', 'M. Bezzecchi', 'P. Acosta', 'R. Fernandez', 'A. Marquez'],
      out: 'J. Mir',
    },
    official: {
      pole: 'M. Bezzecchi',
      secondQualifying: 'M. Marquez',
      qualifyingTimeSeconds: 88.652,
      sprintTopThree: ['P. Acosta', 'M. Marquez', 'R. Fernandez'],
      raceTopFive: ['M. Bezzecchi', 'P. Acosta', 'R. Fernandez', 'J. Martin', 'A. Ogura'],
      outText: 'M. Marquez, A. Marquez, J. Mir',
    },
    excel: {
      polePoints: 5, qualifyingTime: 3, qualifying: 8, sprint: 3,
      racePosition: 9, exactPositions: 0, topFiveBonus: 0, exactOrderBonus: 0,
      outBonus: 2, bonus: 2, outPenalty: 0, L: 2, malus: -1, race: 10, total: 21,
    },
  },
  {
    email: 'nikyturets@gmail.com',
    user: 'Niky',
    gp: 'Brasile',
    sourceRows: 'Q2 / S2 / R2',
    prediction: {
      pole: 'M. Marquez',
      qualifyingTime: '01:17:850',
      sprint: ['M. Marquez', 'M. Bezzecchi', 'J. Martin'],
      raceTopFive: ['M. Marquez', 'M. Bezzecchi', 'F. Di Giannantonio', 'J. Martin', 'A. Ogura'],
      out: 'B. Binder',
    },
    official: {
      pole: 'F. Di Giannantonio',
      secondQualifying: 'M. Bezzecchi',
      qualifyingTimeSeconds: 77.410,
      sprintTopThree: ['M. Marquez', 'F. Di Giannantonio', 'J. Martin'],
      raceTopFive: ['M. Bezzecchi', 'J. Martin', 'F. Di Giannantonio', 'M. Marquez', 'A. Ogura'],
      outText: 'F. Bagnaia, B. Binder, J. Mir, J. Miller',
    },
    excel: {
      polePoints: 0, qualifyingTime: 0, qualifying: 0, sprint: 6,
      racePosition: 15, exactPositions: 2, topFiveBonus: 2, exactOrderBonus: 0,
      outBonus: 2, bonus: 4, outPenalty: 0, L: 0, malus: 0, race: 19, total: 25,
    },
  },
  {
    email: 'nikyturets@gmail.com',
    user: 'Niky',
    gp: 'Francia',
    sourceRows: 'Q6 / S5 / R7',
    prediction: {
      pole: 'F. Di Giannantonio',
      qualifyingTime: '01:29.430',
      sprint: ['M. Marquez', 'M. Bezzecchi', 'F. Bagnaia'],
      raceTopFive: ['M. Bezzecchi', 'J. Martin', 'F. Bagnaia', 'P. Acosta', 'F. Di Giannantonio'],
      out: 'J. Mir',
    },
    official: {
      pole: 'F. Bagnaia',
      secondQualifying: 'M. Marquez',
      qualifyingTimeSeconds: 89.634,
      sprintTopThree: ['J. Martin', 'F. Bagnaia', 'M. Bezzecchi'],
      raceTopFive: ['M. Bezzecchi', 'A. Ogura', 'F. Di Giannantonio', 'P. Acosta', 'J. Martin'],
      outText: 'A. Marquez, F. Bagnaia, B. Binder, J. Mir, D. Moreira',
    },
    excel: {
      polePoints: 0, qualifyingTime: 3, qualifying: 3, sprint: 2,
      racePosition: 12, exactPositions: 2, topFiveBonus: 0, exactOrderBonus: 0,
      outBonus: 2, bonus: 2, outPenalty: 0, L: 1, malus: -1, race: 13, total: 18,
    },
  },
  {
    email: 'nikyturets@gmail.com',
    user: 'Niky',
    gp: 'Aragon',
    sourceRows: 'Q4 / S2 / R4',
    prediction: {
      pole: 'M. Marquez',
      qualifyingTime: '01:45.128',
      sprint: ['M. Marquez', 'M. Bezzecchi', 'A. Marquez'],
      raceTopFive: ['M. Marquez', 'A. Marquez', 'M. Bezzecchi', 'J. Martin', 'F. Di Giannantonio'],
      out: 'J. Mir',
    },
    official: {
      pole: 'M. Bezzecchi',
      secondQualifying: 'M. Marquez',
      qualifyingTimeSeconds: 104.962,
      sprintTopThree: ['M. Marquez', 'A. Marquez', 'M. Bezzecchi'],
      raceTopFive: ['M. Marquez', 'P. Acosta', 'M. Bezzecchi', 'A. Marquez', 'J. Martin'],
      outText: 'F. Bagnaia, F. Morbidelli, R. Fernandez, T. Razgatlioglu',
    },
    excel: {
      polePoints: 2, qualifyingTime: 3, qualifying: 5, sprint: 5,
      racePosition: 14, exactPositions: 2, topFiveBonus: 0, exactOrderBonus: 0,
      outBonus: 0, bonus: 0, outPenalty: 0, L: 0, malus: 0, race: 14, total: 24,
    },
  },
  {
    email: 'marty.bria1996@gmail.com',
    user: 'Marty',
    gp: 'Catalogna',
    sourceRows: 'Q10 / S21 / R10',
    prediction: {
      pole: 'P. Acosta',
      qualifyingTime: '01:37.589',
      sprint: ['A. Marquez', 'P. Acosta', 'F. Di Giannantonio'],
      raceTopFive: ['A. Marquez', 'F. Di Giannantonio', 'J. Martin', 'R. Fernandez', 'P. Acosta'],
      out: 'B. Binder',
    },
    official: {
      pole: 'P. Acosta',
      secondQualifying: 'F. Morbidelli',
      qualifyingTimeSeconds: 98.068,
      sprintTopThree: ['A. Marquez', 'P. Acosta', 'F. Di Giannantonio'],
      raceTopFive: ['F. Di Giannantonio', 'F. Aldeguer', 'F. Bagnaia', 'M. Bezzecchi', 'F. Quartararo'],
      outText: 'A. Marquez, P. Acosta, J. Zarco, E. Bastianini, J. Martin',
    },
    excel: {
      polePoints: 5, qualifyingTime: 1, qualifying: 6, sprint: 9,
      racePosition: 3, exactPositions: 0, topFiveBonus: 0, exactOrderBonus: 0,
      outBonus: 0, bonus: 0, outPenalty: 0, L: 3, malus: -5, race: -2, total: 13,
    },
  },
  {
    email: 'marty.bria1996@gmail.com',
    user: 'Marty',
    gp: 'Italia',
    sourceRows: 'Q3 / S5 / R9',
    prediction: {
      pole: 'F. Di Giannantonio',
      qualifyingTime: '01:44:000',
      sprint: ['M. Bezzecchi', 'R. Fernandez', 'J. Martin'],
      raceTopFive: ['M. Bezzecchi', 'J. Martin', 'F. Bagnaia', 'R. Fernandez', 'F. Di Giannantonio'],
      out: 'M. Marquez',
    },
    official: {
      pole: 'M. Bezzecchi',
      secondQualifying: 'R. Fernandez',
      qualifyingTimeSeconds: 103.921,
      sprintTopThree: ['R. Fernandez', 'J. Martin', 'F. Di Giannantonio'],
      raceTopFive: ['M. Bezzecchi', 'J. Martin', 'F. Bagnaia', 'A. Ogura', 'F. Di Giannantonio'],
      outText: 'J. Zarco, E. Bastianini, A. Rins',
    },
    excel: {
      polePoints: 0, qualifyingTime: 5, qualifying: 5, sprint: 2,
      racePosition: 20, exactPositions: 4, topFiveBonus: 0, exactOrderBonus: 3,
      outBonus: 0, bonus: 3, outPenalty: 0, L: 0, malus: 0, race: 23, total: 30,
    },
  },
  {
    email: 'simo.salva92@gmail.com',
    user: 'Simo',
    gp: 'Thailandia',
    sourceRows: 'Q10 / S8 / R10',
    prediction: {
      pole: 'M. Bezzecchi',
      qualifyingTime: '01:28.467',
      sprint: ['M. Bezzecchi', 'M. Marquez', 'J. Martin'],
      raceTopFive: ['M. Marquez', 'M. Bezzecchi', 'P. Acosta', 'R. Fernandez', 'A. Ogura'],
      out: 'J. Mir',
    },
    official: {
      pole: 'M. Bezzecchi',
      secondQualifying: 'M. Marquez',
      qualifyingTimeSeconds: 88.652,
      sprintTopThree: ['P. Acosta', 'M. Marquez', 'R. Fernandez'],
      raceTopFive: ['M. Bezzecchi', 'P. Acosta', 'R. Fernandez', 'J. Martin', 'A. Ogura'],
      outText: 'M. Marquez, A. Marquez, J. Mir',
    },
    excel: {
      polePoints: 5, qualifyingTime: 3, qualifying: 8, sprint: 3,
      racePosition: 14, exactPositions: 1, topFiveBonus: 0, exactOrderBonus: 0,
      outBonus: 2, bonus: 2, outPenalty: 0, L: 1, malus: -1, race: 15, total: 26,
    },
  },
  {
    email: 'marino.dilorenzo@gmail.com',
    user: 'Marino',
    gp: 'Aragon',
    sourceRows: 'Q3 / S7 / R2',
    prediction: {
      pole: 'M. Marquez',
      qualifyingTime: '01:44.890',
      sprint: ['M. Bezzecchi', 'M. Marquez', 'J. Martin'],
      raceTopFive: ['M. Marquez', 'A. Marquez', 'M. Bezzecchi', 'P. Acosta', 'J. Martin'],
      out: 'J. Mir',
    },
    official: {
      pole: 'M. Bezzecchi',
      secondQualifying: 'M. Marquez',
      qualifyingTimeSeconds: 104.962,
      sprintTopThree: ['M. Marquez', 'A. Marquez', 'M. Bezzecchi'],
      raceTopFive: ['M. Marquez', 'P. Acosta', 'M. Bezzecchi', 'A. Marquez', 'J. Martin'],
      outText: 'F. Bagnaia, F. Morbidelli, R. Fernandez, T. Razgatlioglu',
    },
    excel: {
      polePoints: 2, qualifyingTime: 5, qualifying: 7, sprint: 1,
      racePosition: 17, exactPositions: 3, topFiveBonus: 2, exactOrderBonus: 1,
      outBonus: 0, bonus: 3, outPenalty: 0, L: 0, malus: 0, race: 20, total: 28,
    },
  },
  {
    email: 'alessandro.cavasso.1995@gmail.com',
    user: 'Alessandro',
    gp: 'Spagna',
    sourceRows: 'Q4 / S7 / R7',
    prediction: {
      pole: 'M. Marquez',
      qualifyingTime: '01:43.274',
      sprint: ['M. Marquez', 'M. Bezzecchi', 'F. Di Giannantonio'],
      raceTopFive: ['M. Marquez', 'A. Marquez', 'M. Bezzecchi', 'F. Di Giannantonio', 'J. Martin'],
      out: 'J. Mir',
    },
    official: {
      pole: 'M. Marquez',
      secondQualifying: 'J. Zarco',
      qualifyingTimeSeconds: 108.087,
      sprintTopThree: ['M. Marquez', 'F. Bagnaia', 'F. Morbidelli'],
      raceTopFive: ['A. Marquez', 'M. Bezzecchi', 'F. Di Giannantonio', 'J. Martin', 'A. Ogura'],
      outText: 'M. Marquez, F. Bagnaia, L. Savadori',
    },
    excel: {
      polePoints: 5, qualifyingTime: 0, qualifying: 5, sprint: 3,
      racePosition: 12, exactPositions: 0, topFiveBonus: 0, exactOrderBonus: 0,
      outBonus: 0, bonus: 0, outPenalty: 0, L: 1, malus: -1, race: 11, total: 19,
    },
  },
  {
    email: 'alessandro.cavasso.1995@gmail.com',
    user: 'Alessandro',
    gp: 'UK',
    sourceRows: 'Q4 / S2 / R5',
    prediction: {
      pole: 'M. Bezzecchi',
      qualifyingTime: '01:56.128',
      sprint: ['J. Martin', 'A. Ogura', 'M. Bezzecchi'],
      raceTopFive: ['M. Bezzecchi', 'J. Martin', 'A. Ogura', 'F. Di Giannantonio', 'R. Fernandez'],
      out: 'J. Mir',
    },
    official: {
      pole: 'J. Martin',
      secondQualifying: 'R. Fernandez',
      qualifyingTimeSeconds: 116.160,
      sprintTopThree: ['J. Martin', 'A. Ogura', 'M. Bezzecchi'],
      raceTopFive: ['R. Fernandez', 'J. Martin', 'M. Bezzecchi', 'A. Marquez', 'P. Acosta'],
      outText: 'F. Bagnaia, F. Aldeguer, J. Zarco, E. Bastianini, J. Mir, A. Ogura, A. Rins',
    },
    excel: {
      polePoints: 0, qualifyingTime: 5, qualifying: 5, sprint: 9,
      racePosition: 7, exactPositions: 1, topFiveBonus: 0, exactOrderBonus: 0,
      outBonus: 2, bonus: 2, outPenalty: 0, L: 1, malus: -1, race: 8, total: 22,
    },
  },
];
