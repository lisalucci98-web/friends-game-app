/**
 * Ricostruzione locale dello scoring storico FantaMotoGP.
 *
 * Questo script è esclusivamente analitico: non usa la RPC Supabase e non
 * viene importato dall'applicazione. Il dataset sorgente contiene email, ma
 * il report usa solo identificativi anonimi P01, P02, ...
 */

import { readFile } from 'node:fs/promises';

const SOURCE = process.env.HISTORICAL_DATASET ??
  'attached_assets/Pasted-Certo-A-questo-punto-userei-i-dati-storici-come-dataset_1787240203484.txt';

const RIDER_NUMBERS = {
  'R. Fernandez': 25,
  'M. Bezzecchi': 72,
  'J. Martin': 89,
  'A. Ogura': 79,
  'F. Di Giannantonio': 49,
  'M. Marquez': 93,
  'F. Bagnaia': 63,
  'P. Acosta': 37,
  'A. Marquez': 73,
  'J. Mir': 36,
  'F. Aldeguer': 54,
  'L. Marini': 10,
  'F. Morbidelli': 21,
  'E. Bastianini': 23,
  'J. Miller': 43,
  'B. Binder': 33,
  'D. Moreira': 11,
  'A. Fernandez': 47,
};

// Results are copied from the official session_results rows read during the
// analysis. Only the fields needed by this local reference model are kept.
const OFFICIAL = {
  GP1: {
    q: { pole: 89, poleTime: 116.160, positions: [89, 25] },
    sprint: [89, 79, 72],
    race: [
      [25, 'CLASSIFIED'], [89, 'CLASSIFIED'], [72, 'CLASSIFIED'],
      [73, 'CLASSIFIED'], [37, 'CLASSIFIED'], [49, 'CLASSIFIED'],
      [93, 'CLASSIFIED'], [33, 'CLASSIFIED'], [10, 'CLASSIFIED'],
      [11, 'CLASSIFIED'], [21, 'CLASSIFIED'], [43, 'CLASSIFIED'],
      [44, 'CLASSIFIED'], [7, 'CLASSIFIED'], [47, 'CLASSIFIED'],
      [20, 'CLASSIFIED'], [23, 'NOT_CLASSIFIED'], [27, 'NOT_CLASSIFIED'],
      [35, 'NOT_CLASSIFIED'], [36, 'NOT_CLASSIFIED'], [42, 'NOT_CLASSIFIED'],
      [63, 'NOT_CLASSIFIED'], [79, 'NOT_CLASSIFIED'],
    ],
  },
  GP2: {
    q: { pole: 72, poleTime: 103.921, positions: [72, 25] },
    sprint: [25, 89, 49],
    race: [
      [72, 'CLASSIFIED'], [89, 'CLASSIFIED'], [63, 'CLASSIFIED'],
      [79, 'CLASSIFIED'], [49, 'CLASSIFIED'], [37, 'CLASSIFIED'],
      [93, 'CLASSIFIED'], [54, 'CLASSIFIED'], [25, 'CLASSIFIED'],
      [11, 'CLASSIFIED'], [33, 'CLASSIFIED'], [36, 'CLASSIFIED'],
      [10, 'CLASSIFIED'], [21, 'CLASSIFIED'], [43, 'CLASSIFIED'],
      [7, 'CLASSIFIED'], [12, 'CLASSIFIED'], [20, 'CLASSIFIED'],
      [51, 'CLASSIFIED'], [23, 'NOT_CLASSIFIED'], [35, 'NOT_CLASSIFIED'],
      [42, 'NOT_CLASSIFIED'],
    ],
  },
  GP3: {
    q: { pole: 93, poleTime: 96.785, positions: [93, 37] },
    sprint: [93, 37, 72],
    race: [
      [93, 'CLASSIFIED'], [37, 'CLASSIFIED'], [63, 'CLASSIFIED'],
      [79, 'CLASSIFIED'], [10, 'CLASSIFIED'], [11, 'CLASSIFIED'],
      [27, 'CLASSIFIED'], [43, 'CLASSIFIED'], [23, 'CLASSIFIED'],
      [33, 'CLASSIFIED'], [7, 'CLASSIFIED'], [49, 'CLASSIFIED'],
      [42, 'CLASSIFIED'], [21, 'CLASSIFIED'], [12, 'CLASSIFIED'],
      [35, 'CLASSIFIED'], [20, 'NOT_CLASSIFIED'], [25, 'NOT_CLASSIFIED'],
      [36, 'NOT_CLASSIFIED'], [54, 'NOT_CLASSIFIED'], [72, 'NOT_CLASSIFIED'],
      [89, 'NOT_CLASSIFIED'],
    ],
  },
};

const BETWEEN = (text, start, end) => {
  const from = text.indexOf(start);
  if (from < 0) return '';
  const to = end ? text.indexOf(end, from + start.length) : text.length;
  return text.slice(from + start.length, to < 0 ? text.length : to);
};

function parseTime(value) {
  const [minutes, seconds] = value.split(':');
  return Number(minutes) * 60 + Number(seconds);
}

function parsePicks(value) {
  return value.split('/').map((item) => item.trim()).filter(Boolean).map((name) => {
    const number = RIDER_NUMBERS[name];
    if (!number) throw new Error(`Rider storico non mappato: ${name}`);
    return number;
  });
}

function parseHistorical(text) {
  const participants = new Map();
  const idFor = (email) => {
    if (!participants.has(email)) participants.set(email, `P${String(participants.size + 1).padStart(2, '0')}`);
    return participants.get(email);
  };
  const gps = {};
  const sections = [...text.matchAll(/^#+ GP (\d+) —/gm)];

  for (let index = 0; index < sections.length; index += 1) {
    const key = `GP${sections[index][1]}`;
    const blockEnd = sections[index + 1]?.index ?? text.length;
    const block = text.slice(sections[index].index, blockEnd);
    const qualifying = [];
    const qBlock = BETWEEN(block, '### Qualifiche', '### Sprint');
    for (const line of qBlock.split(/\r?\n/)) {
      const match = line.match(/^\s*(\S+@\S+)\s+(.+?)\s+(\d{2}:\d{2}\.\d{3})\s+(-?\d+)\s*$/);
      if (match) qualifying.push({ id: idFor(match[1]), pole: match[2].trim(), time: parseTime(match[3]), expected: Number(match[4]) });
    }

    const sprint = [];
    const sprintBlock = BETWEEN(block, '### Sprint', '### Gara');
    for (const line of sprintBlock.split(/\r?\n/)) {
      const match = line.match(/^\s*(\S+@\S+)\s+(.+?)\s+(-?\d+)\s*$/);
      if (match && match[2].includes('/')) sprint.push({ id: idFor(match[1]), picks: parsePicks(match[2]), expected: Number(match[3]) });
    }

    const race = [];
    const raceBlock = BETWEEN(block, '### Gara', '### Totali storici');
    const raceMatches = [...raceBlock.matchAll(/^\s*(\S+@\S+)\s*\n\s*([^\n]+)\n\s*(-?\d+)\s*$/gm)];
    for (const match of raceMatches) {
      race.push({ id: idFor(match[1]), picks: parsePicks(match[2]), expected: Number(match[3]) });
    }

    const totals = {};
    const totalsBlock = BETWEEN(block, '### Totali storici', null);
    for (const line of totalsBlock.split(/\r?\n/)) {
      const match = line.match(/^\s*(\S+@\S+)\s+Q=(-?\d+)\s+S=(-?\d+)\s+R=(-?\d+)\s+TOTAL=(-?\d+)/);
      if (match) totals[idFor(match[1])] = { q: Number(match[2]), sprint: Number(match[3]), race: Number(match[4]), total: Number(match[5]) };
    }
    gps[key] = { qualifying, sprint, race, totals };
  }
  return { gps, participantCount: participants.size };
}

function qualifyingTimePoints(predicted, actual) {
  const error = Math.abs(predicted - actual);
  const relative = error / actual;
  if (error <= 0.010) return 10;
  if (relative <= 0.001) return 5;
  if (relative <= 0.0025) return 3;
  if (relative <= 0.005) return 1;
  return 0;
}

function positionPoints(predicted, actual, exact, adjacent) {
  if (actual === null || actual === undefined) return 0;
  const difference = Math.abs(predicted - actual);
  if (difference === 0) return exact;
  if (difference === 1) return adjacent;
  return actual <= 5 ? 1 : 0;
}

function sprintPositionPoints(predicted, actual) {
  if (actual === null || actual === undefined) return 0;
  const difference = Math.abs(predicted - actual);
  return difference === 0 ? 3 : difference === 1 ? 1 : 0;
}

function scoreQualifying(item, official) {
  const pole = RIDER_NUMBERS[item.pole];
  const polePosition = official.q.positions.indexOf(pole) + 1;
  return {
    time: qualifyingTimePoints(item.time, official.q.poleTime),
    pole: polePosition === 1 ? 5 : polePosition === 2 ? 2 : 0,
  };
}

function scoreSprint(item, official) {
  const positions = new Map(official.sprint.map((rider, index) => [rider, index + 1]));
  return item.picks.reduce((sum, rider, index) => sum + sprintPositionPoints(index + 1, positions.get(rider)), 0);
}

function scoreRace(item, official) {
  const positions = new Map(official.race.map(([rider], index) => [rider, index + 1]));
  const statuses = new Map(official.race);
  const topFive = item.picks.slice(0, 5);
  const positionDetails = topFive.map((rider, index) => ({
    rider,
    predictedPosition: index + 1,
    officialPosition: positions.get(rider) ?? null,
    status: statuses.get(rider) ?? 'NOT_IN_RESULT',
    points: positionPoints(index + 1, positions.get(rider), 5, 3),
  }));
  const position = positionDetails.map(({ points }) => points);
  const exact = topFive.filter((rider, index) => positions.get(rider) === index + 1).length;
  const allInTopFive = topFive.every((rider) => (positions.get(rider) ?? 99) <= 5);
  const out = item.picks[5];
  const outPoints = statuses.get(out) !== 'CLASSIFIED' ? 2 : 0;
  const unfinished = topFive.filter((rider) => statuses.get(rider) !== 'CLASSIFIED').length;
  const malus = unfinished === 1 ? -1 : unfinished === 3 ? -5 : unfinished === 5 ? -10 : 0;
  const exactOrder = exact === 5 ? 5 : exact === 4 ? 3 : exact === 3 ? 1 : 0;
  const topFiveBonus = allInTopFive ? 2 : 0;
  return {
    position: position.reduce((sum, value) => sum + value, 0),
    out: outPoints,
    outRider: out,
    outStatus: statuses.get(out) ?? 'NOT_IN_RESULT',
    positionDetails,
    exactOrder,
    topFiveBonus,
    malus,
  };
}

const text = await readFile(SOURCE, 'utf8');
const fixture = parseHistorical(text);
const rows = [];

for (const [gp, data] of Object.entries(fixture.gps)) {
  const official = OFFICIAL[gp];
  if (!official) continue;
  for (const item of data.qualifying) {
    const score = scoreQualifying(item, official);
    rows.push({ gp, id: item.id, category: 'Qualifica', expected: item.expected, actual: score.time + score.pole });
  }
  for (const item of data.sprint) {
    rows.push({ gp, id: item.id, category: 'Sprint', expected: item.expected, actual: scoreSprint(item, official) });
  }
  for (const item of data.race) {
    const score = scoreRace(item, official);
    rows.push({
      gp,
      id: item.id,
      picks: item.picks,
      category: 'Gara',
      expected: item.expected,
      actual: score.position + score.out + score.exactOrder + score.topFiveBonus + score.malus,
      breakdown: score,
    });
  }
}

const mismatches = rows.filter((row) => row.expected !== row.actual);
const aggregates = [];
for (const [gp, data] of Object.entries(fixture.gps)) {
  for (const [id, expected] of Object.entries(data.totals)) {
    const categoryRows = rows.filter((row) => row.gp === gp && row.id === id);
    const actual = {
      q: categoryRows.find((row) => row.category === 'Qualifica')?.actual ?? 0,
      sprint: categoryRows.find((row) => row.category === 'Sprint')?.actual ?? 0,
      race: categoryRows.find((row) => row.category === 'Gara')?.actual ?? 0,
    };
    aggregates.push({
      gp,
      id,
      expected,
      actual: { ...actual, total: actual.q + actual.sprint + actual.race },
    });
  }
}
const totalMismatches = aggregates.filter((row) => row.expected.total !== row.actual.total);
console.log('RICOSTRUZIONE LOCALE SCORING STORICO FANTAMOTOGP');
console.log(`Partecipanti anonimizzati: ${fixture.participantCount}`);
console.log(`Test categoria: ${rows.length}`);
console.log(`Test categoria passati: ${rows.length - mismatches.length}`);
console.log(`Test categoria falliti: ${mismatches.length}`);
console.log(`Test totali GP: ${aggregates.length}`);
console.log(`Test totali GP passati: ${aggregates.length - totalMismatches.length}`);
console.log(`Test totali GP falliti: ${totalMismatches.length}`);
console.log('\nGP | Utente | Categoria | Atteso | Ottenuto | Stato');
for (const row of rows) {
  console.log(`${row.gp} | ${row.id} | ${row.category} | ${row.expected} | ${row.actual} | ${row.expected === row.actual ? 'PASS' : 'DIFF'}`);
}
if (mismatches.length) {
  console.log('\nDifferenze:');
  for (const row of mismatches) {
    console.log(JSON.stringify(row));
    if (row.category === 'Gara') {
      console.log(`  TOP5: ${row.breakdown.positionDetails.map((item) =>
        `P${item.predictedPosition}=#${item.rider}/ufficiale=${item.officialPosition ?? 'NC'}/${item.status}/punti=${item.points}`).join(' | ')}`);
      console.log(`  OUT: #${row.breakdown.outRider}/${row.breakdown.outStatus}/punti=${row.breakdown.out}`);
    }
  }
}
if (aggregates.length) {
  console.log('\nTOTALI GP | GP | Utente | Atteso Q/S/R/T | Ottenuto Q/S/R/T | Stato');
  for (const row of aggregates) {
    const expectedText = `${row.expected.q}/${row.expected.sprint}/${row.expected.race}/${row.expected.total}`;
    const actualText = `${row.actual.q}/${row.actual.sprint}/${row.actual.race}/${row.actual.total}`;
    console.log(`${row.gp} | ${row.id} | ${expectedText} | ${actualText} | ${expectedText === actualText ? 'PASS' : 'DIFF'}`);
  }
}