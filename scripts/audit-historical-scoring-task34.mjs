/**
 * Task 34 — audit finale read-only dello scoring storico su TEST01.
 *
 * Usa le stesse prediction, gli stessi risultati live e lo stesso scorer
 * offline del Task 33. Scrive soltanto il report markdown locale.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { pathToFileURL } from 'node:url';

import {
  REQUIRED_CASES,
  RACE_MATRIX,
  SPRINT_MATRIX,
  scorePrediction,
} from './historical-scoring-spec.mjs';
import {
  buildOfficialResults,
  buildPrediction,
  chooseOfficialSession,
  createReadOnlyClient,
  entryAudit,
  parseSource,
  secondsToExcelTime,
  selectHistoricalPredictions,
} from './validate-historical-excel-scoring-test01.mjs';

const SOURCE =
  'attached_assets/Pasted-GP-Utente-Pole-position-tempo-pole-1-sprint-2-sprint-3-_1788342259417.txt';
const DEFAULT_REPORT = '.agents/outputs/task-34-historical-scoring-final-audit.md';
const SEASON_YEAR = 2026;
const LEAGUE_CODE = 'TEST01';

const GP_CODES = new Map([
  ['Thailandia', 'THA'],
  ['Brasile', 'BRA'],
  ['USA', 'USA'],
  ['Qatar', 'QAT'],
  ['Spagna', 'SPA'],
  ['Francia', 'FRA'],
  ['Catalogna', 'CAT'],
  ['Italia', 'ITA'],
  ['Ungheria', 'HUN'],
  ['Repubblica Ceca', 'CZE'],
  ['Netherlands', 'NED'],
  ['Germania', 'GER'],
  ['UK', 'GBR'],
  ['Aragon', 'ARA'],
]);

const CLOSED_STATUSES = new Set([
  'FINISHED',
  'COMPLETED',
  'CLASSIFIED',
  'CLOSED',
]);

const ENTRY_TYPES = ['POLE', 'QUALIFYING_TIME', 'SPRINT', 'RACE', 'RACE_OUT'];

function parseArgs(argv) {
  const args = { source: SOURCE, report: DEFAULT_REPORT };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--source') args.source = argv[++index] ?? '';
    else if (argument === '--report') args.report = argv[++index] ?? '';
    else if (argument === '--help' || argument === '-h') {
      console.log(
        'Uso: node scripts/audit-historical-scoring-task34.mjs '
          + '[--source <file.tsv>] [--report <file.md>]',
      );
      process.exit(0);
    } else {
      throw new Error(`Argomento non riconosciuto: ${argument}`);
    }
  }
  return args;
}

function canonical(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .toLocaleLowerCase('it-IT')
    .replace(/\s+/g, ' ');
}

function normalizedEmail(value) {
  return canonical(value).replace(/\s+/g, '');
}

function numberOrZero(value) {
  return value === null || value === undefined ? 0 : Number(value);
}

function markdownCell(value) {
  return String(value ?? '—').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

function formatVector(vector, keys) {
  return keys.map((key) => `${key}=${vector[key]}`).join(', ');
}

function entriesForPrediction(entries, predictionId) {
  return entries.filter((entry) => entry.prediction_id === predictionId);
}

function positionPoints(matrix, predictedPosition, officialPosition) {
  if (officialPosition === null) return 0;
  return matrix[predictedPosition - 1]?.[officialPosition - 1] ?? 0;
}

function officialPosition(list, rider) {
  if (rider === '' || rider === null || rider === undefined) return null;
  const index = list.indexOf(rider);
  return index < 0 ? null : index + 1;
}

function detailedScore(prediction, official) {
  const score = scorePrediction({
    ...prediction,
    qualifyingTime: secondsToExcelTime(prediction.qualifyingTime),
  }, official);
  const sprintSlots = prediction.sprint.map((rider, index) =>
    positionPoints(SPRINT_MATRIX, index + 1, officialPosition(official.sprintTopThree, rider)));
  const raceSlots = prediction.raceTopFive.map((rider, index) =>
    positionPoints(RACE_MATRIX, index + 1, officialPosition(official.raceTopFive, rider)));
  return {
    ...score,
    sprintSlots,
    raceSlots,
  };
}

function databaseVectors(prediction) {
  const category = {
    qualifying: numberOrZero(prediction.qualifying_points),
    sprint: numberOrZero(prediction.sprint_points),
    race: numberOrZero(prediction.race_points),
    total: numberOrZero(prediction.total_points),
  };
  const components = {
    qualifying: category.qualifying,
    sprint: category.sprint,
    racePosition: category.race,
    bonus: numberOrZero(prediction.bonus_points),
    malus: numberOrZero(prediction.malus_points),
    total: category.total,
  };
  return { category, components };
}

export function compareAuditRow(prediction, score) {
  const database = databaseVectors(prediction);
  const excelCategory = {
    qualifying: score.qualifying,
    sprint: score.sprint,
    race: score.race,
    total: score.total,
  };
  const excelComponents = {
    qualifying: score.qualifying,
    sprint: score.sprint,
    racePosition: score.racePosition,
    bonus: score.bonus,
    malus: score.malus,
    total: score.total,
  };
  const categoryKeys = Object.keys(excelCategory);
  const componentKeys = Object.keys(excelComponents);
  return {
    databaseCategory: database.category,
    excelCategory,
    databaseComponents: database.components,
    excelComponents,
    categoryMatch: categoryKeys.every((key) =>
      database.category[key] === excelCategory[key]),
    componentMatch: componentKeys.every((key) =>
      database.components[key] === excelComponents[key]),
    fieldMatches: {
      qualifying: database.category.qualifying === excelCategory.qualifying,
      sprint: database.category.sprint === excelCategory.sprint,
      race: database.category.race === excelCategory.race,
      bonus: database.components.bonus === excelComponents.bonus,
      malus: database.components.malus === excelComponents.malus,
      total: database.category.total === excelCategory.total,
    },
  };
}

function riderSignature(value) {
  const tokens = canonical(value).replace(/\./g, '').split(' ').filter(Boolean);
  if (tokens.length < 2) return tokens.join('|');
  return `${tokens[0][0]}|${tokens.slice(1).join(' ')}`;
}

function riderMatches(left, right) {
  if (canonical(left) === canonical(right)) return true;
  if (!left || !right) return canonical(left) === canonical(right);
  return riderSignature(left) === riderSignature(right);
}

function predictionMatchesFixture(prediction, fixture) {
  return riderMatches(prediction.pole, fixture.prediction.pole)
    && riderMatches(prediction.out, fixture.prediction.out)
    && prediction.sprint.length === fixture.prediction.sprint.length
    && prediction.sprint.every((rider, index) =>
      riderMatches(rider, fixture.prediction.sprint[index]))
    && prediction.raceTopFive.length === fixture.prediction.raceTopFive.length
    && prediction.raceTopFive.every((rider, index) =>
      riderMatches(rider, fixture.prediction.raceTopFive[index]));
}

function scoreMatchesFixture(score, fixture) {
  const keys = [
    'polePoints',
    'qualifyingTime',
    'qualifying',
    'sprint',
    'racePosition',
    'exactPositions',
    'topFiveBonus',
    'exactOrderBonus',
    'outBonus',
    'bonus',
    'outPenalty',
    'L',
    'malus',
    'race',
    'total',
  ];
  return keys.every((key) => score[key] === fixture.excel[key]);
}

function fixtureForItem(item, usersById) {
  const email = normalizedEmail(usersById.get(item.userId)?.email);
  return REQUIRED_CASES.find((fixture) =>
    normalizedEmail(fixture.email) === email
      && GP_CODES.get(fixture.gp) === item.gp.short_name
  ) ?? null;
}

export function classifyAuditRow({
  comparison,
  score,
  fixture,
  predictionMatches,
  hasOfficialData,
}) {
  if (!hasOfficialData) {
    return {
      classification: 'MISSING_DATA',
      reason: 'Manca almeno una sessione ufficiale completa per il replay.',
    };
  }
  if (comparison.categoryMatch && comparison.componentMatch) {
    return {
      classification: 'MATCH',
      reason: 'Aggregati e componenti database coincidono con il replay.',
    };
  }
  if (fixture && predictionMatches) {
    if (!scoreMatchesFixture(score, fixture)) {
      return {
        classification: 'DATA_DIFFERENCE',
        reason: 'Il replay con gli attuali risultati live non riproduce il valore Excel del caso noto; la snapshot ufficiale storica è diversa o non più disponibile.',
      };
    }
    return {
      classification: 'SCORING_DIFFERENCE',
      reason: 'Il replay riproduce il caso Excel noto, ma i componenti aggregati database differiscono.',
    };
  }
  return {
    classification: 'HISTORICAL_UNCERTAIN',
    reason: 'Manca una snapshot Excel riga-per-riga comparabile; non è dimostrabile se la differenza dipenda dai dati ufficiali storici o dalla logica database.',
  };
}

function classifyPartialRow(row, hasOfficialData) {
  return {
    ...row,
    classification: hasOfficialData ? 'PARTIAL' : 'MISSING_DATA',
  };
}

function knownCaseLine(row, fixture, predictionMatches, score) {
  if (!fixture) return 'nessun fixture Task 32';
  if (!predictionMatches) return 'fixture GP/utente trovato, ma entry non equivalenti';
  return scoreMatchesFixture(score, fixture)
    ? `fixture Task 32 coincidente: ${fixture.excel.total} punti`
    : `fixture Task 32 divergente: atteso ${fixture.excel.total}, replay ${score.total}`;
}

function aggregateRows(rows, getKey) {
  const result = new Map();
  for (const row of rows) {
    const key = getKey(row);
    const current = result.get(key) ?? {
      complete: 0,
      match: 0,
      dataDifference: 0,
      scoringDifference: 0,
      missingData: 0,
      historicalUncertain: 0,
      databaseTotal: 0,
      recalculatedTotal: 0,
    };
    current.complete += 1;
    current.databaseTotal += row.comparison?.databaseCategory.total ?? 0;
    current.recalculatedTotal += row.comparison?.excelCategory.total ?? 0;
    if (row.classification === 'MATCH') current.match += 1;
    else if (row.classification === 'DATA_DIFFERENCE') current.dataDifference += 1;
    else if (row.classification === 'SCORING_DIFFERENCE') current.scoringDifference += 1;
    else if (row.classification === 'MISSING_DATA') current.missingData += 1;
    else if (row.classification === 'HISTORICAL_UNCERTAIN') current.historicalUncertain += 1;
    result.set(key, current);
  }
  return result;
}

function aggregateUsers(rows, usersById, profilesByUserId) {
  const result = new Map();
  for (const row of rows) {
    const userId = row.item.userId;
    const current = result.get(userId) ?? {
      user: profilesByUserId.get(userId)?.name
        ?? usersById.get(userId)?.email?.split('@')[0]
        ?? userId,
      complete: 0,
      match: 0,
      discrepancies: 0,
      databaseTotal: 0,
      recalculatedTotal: 0,
    };
    current.complete += 1;
    current.databaseTotal += row.comparison?.databaseCategory.total ?? 0;
    current.recalculatedTotal += row.comparison?.excelCategory.total ?? 0;
    if (row.classification === 'MATCH') current.match += 1;
    else current.discrepancies += 1;
    result.set(userId, current);
  }
  return result;
}

function formatDbBreakdown(comparison) {
  return formatVector(comparison.databaseComponents, [
    'qualifying',
    'sprint',
    'racePosition',
    'bonus',
    'malus',
    'total',
  ]);
}

function formatExcelBreakdown(score) {
  return [
    `Pole=${score.polePoints}`,
    `Time=${score.qualifyingTime}`,
    `Q=${score.qualifying}`,
    `Sprint[${score.sprintSlots.join(',')}] = ${score.sprint}`,
    `Race[${score.raceSlots.join(',')}] = ${score.racePosition}`,
    `OUT bonus=${score.outBonus}`,
    `OUT penalty=${score.outPenalty}`,
    `NC=${score.ncCount}`,
    `Bonus=${score.bonus}`,
    `Malus=${score.malus}`,
    `Race total=${score.race}`,
    `Total=${score.total}`,
  ].join('; ');
}

function sourceGpRows(rows) {
  const result = new Map();
  for (const row of rows) {
    const code = GP_CODES.get(String(row.cells[0] ?? '').trim());
    if (!code || row.cells.slice(2).every((value) =>
      String(value ?? '').trim() === '' || String(value ?? '').trim() === '#N/A')) {
      continue;
    }
    result.set(code, (result.get(code) ?? 0) + 1);
  }
  return result;
}

function buildReport({
  args,
  rows,
  context,
  selection,
  auditRows,
  partialRows,
  extraPredictions,
  coverageByGp,
  usersById,
  profilesByUserId,
}) {
  const completeRows = auditRows.filter((row) => row.status === 'SCORED_OFFLINE');
  const completeWithComparison = completeRows.filter((row) => row.comparison);
  const classifications = ['MATCH', 'DATA_DIFFERENCE', 'SCORING_DIFFERENCE',
    'MISSING_DATA', 'HISTORICAL_UNCERTAIN'];
  const classCounts = Object.fromEntries(classifications.map((key) => [
    key,
    completeRows.filter((row) => row.classification === key).length,
  ]));
  const discrepancyCounts = Object.fromEntries(
    ['qualifying', 'sprint', 'race', 'bonus', 'malus', 'total'].map((field) => [
      field,
      completeWithComparison.filter((row) => !row.comparison.fieldMatches[field]).length,
    ]),
  );
  const fieldCounts = Object.fromEntries(
    ['qualifying', 'sprint', 'race', 'bonus', 'malus', 'total'].map((field) => [
      field,
      completeWithComparison.filter((row) => row.comparison.fieldMatches[field]).length,
    ]),
  );
  const gpAggregation = aggregateRows(completeRows, (row) => row.item.gp.id);
  const userAggregation = aggregateUsers(completeRows, usersById, profilesByUserId);
  const sourceCounts = sourceGpRows(rows);
  const completeScored = completeRows.filter((row) => row.item.prediction.scored_at !== null).length;
  const partialScored = partialRows.filter((row) => row.item.prediction.scored_at !== null).length;
  const completeUnscored = completeRows.length - completeScored;
  const partialUnscored = partialRows.length - partialScored;
  const qatar = context.grandPrix.find((gp) => gp.short_name === 'QAT');
  const qatarCoverage = qatar ? coverageByGp.get(qatar.id) : null;

  const lines = [
    '# Task 34 — Audit finale e riconciliazione scoring storico FantaMotoGP',
    '',
    '## 1. Executive summary',
    '',
    '- Audit **100% read-only** completato sulla lega **TEST01**.',
    `- Prediction storiche risolte: **${selection.items.length}**.`,
    `- Complete valutate: **${completeRows.length}**.`,
    `- Partial escluse dal confronto numerico: **${partialRows.length}**.`,
    `- Extra DB fuori sorgente storica: **${extraPredictions.length}**.`,
    `- MATCH: **${classCounts.MATCH}**.`,
    `- DATA_DIFFERENCE: **${classCounts.DATA_DIFFERENCE}**.`,
    `- SCORING_DIFFERENCE: **${classCounts.SCORING_DIFFERENCE}**.`,
    `- MISSING_DATA: **${classCounts.MISSING_DATA}**.`,
    `- HISTORICAL_UNCERTAIN: **${classCounts.HISTORICAL_UNCERTAIN}**.`,
    '',
    'Interpretazione prudente: una differenza non viene attribuita alla logica database '
      + 'senza una snapshot Excel comparabile. I casi noti Task 32 sono gli unici usati '
      + 'per distinguere in modo dimostrabile dati storici diversi da scoring diverso.',
    '',
    '## 2. Dataset analizzato',
    '',
    `- Righe sorgente analizzate: **${rows.length}**.`,
    `- Prediction nella lega TEST01: **${context.predictions.length}**.`,
    `- Prediction storiche risolte: **${selection.items.length}**.`,
    `- Entry storiche lette: **${auditRows.reduce((total, row) => total + row.entryCount, 0)}**.`,
    `- Complete già marcate scored_at: **${completeScored}**.`,
    `- Complete senza scored_at: **${completeUnscored}**.`,
    `- Partial già marcate scored_at: **${partialScored}**.`,
    `- Partial senza scored_at: **${partialUnscored}**.`,
    `- Errori di selezione: **${selection.errors.length}**.`,
    '',
    '## 3. Metodo di scoring utilizzato',
    '',
    '- Scorer: **identico alla specifica offline validata nel Task 32**.',
    '- Input prediction: `prediction_entries` storiche lette via GET.',
    '- Input ufficiale: `session_results` live chiusi per Q, Sprint e Gara.',
    '- `QUALIFYING_TIME` numerico nel DB convertito solo nel confine del replay in `MM:SS.mmm`.',
    '- Breakdown slot calcolato con le stesse matrici Excel, senza una nuova interpretazione.',
    '- Qatar non viene ricostruito se manca una copertura ufficiale sufficiente.',
    '',
    '## 4. Tabella completa delle prediction COMPLETE',
    '',
    '| Utente | GP | Prediction ID | DB Q | Calc Q | ΔQ | DB S | Calc S | ΔS | DB R | Calc R | ΔR | DB Bonus | Calc Bonus | DB Malus | Calc Malus | DB Totale | Calc Totale | ΔTotale | Classificazione |',
    '|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|',
    ...completeRows.map((row) => {
      const label = profilesByUserId.get(row.item.userId)?.name
        ?? usersById.get(row.item.userId)?.email?.split('@')[0]
        ?? row.item.userId;
      const c = row.comparison;
      const db = c?.databaseCategory ?? { qualifying: '—', sprint: '—', race: '—', total: '—' };
      const calc = c?.excelCategory ?? { qualifying: '—', sprint: '—', race: '—', total: '—' };
      const dbComp = c?.databaseComponents ?? { bonus: '—', malus: '—' };
      const calcComp = c?.excelComponents ?? { bonus: '—', malus: '—' };
      const delta = (left, right) => typeof left === 'number' && typeof right === 'number'
        ? left - right
        : '—';
      return `| ${markdownCell(label)} | ${row.item.gp.short_name} | ${row.item.prediction.id}`
        + ` | ${db.qualifying} | ${calc.qualifying} | ${delta(db.qualifying, calc.qualifying)}`
        + ` | ${db.sprint} | ${calc.sprint} | ${delta(db.sprint, calc.sprint)}`
        + ` | ${db.race} | ${calc.race} | ${delta(db.race, calc.race)}`
        + ` | ${dbComp.bonus} | ${calcComp.bonus}`
        + ` | ${dbComp.malus} | ${calcComp.malus}`
        + ` | ${db.total} | ${calc.total} | ${delta(db.total, calc.total)}`
        + ` | ${row.classification} |`;
    }),
    '',
    '## 5. Dettaglio delle discrepanze',
    '',
    `Prediction con discrepanza Qualifica: **${discrepancyCounts.qualifying}**.`,
    `Prediction con discrepanza Sprint: **${discrepancyCounts.sprint}**.`,
    `Prediction con discrepanza Gara: **${discrepancyCounts.race}**.`,
    `Prediction con discrepanza Bonus: **${discrepancyCounts.bonus}**.`,
    `Prediction con discrepanza Malus: **${discrepancyCounts.malus}**.`,
    `Prediction con discrepanza Totale: **${discrepancyCounts.total}**.`,
    '',
    '### SCORING_DIFFERENCE',
    '',
    ...(completeRows.filter((row) => row.classification === 'SCORING_DIFFERENCE').length
      ? completeRows
        .filter((row) => row.classification === 'SCORING_DIFFERENCE')
        .map((row) => {
          const label = usersById.get(row.item.userId)?.email ?? row.item.userId;
          return `- **${markdownCell(label)} / ${row.item.gp.short_name}** `
            + `(${row.item.prediction.id}): DB ${formatDbBreakdown(row.comparison)}; `
            + `Excel ${formatExcelBreakdown(row.score)}. `
            + 'Pole/Qualifying Time e breakdown slot non sono colonne separate persistite nel DB.';
        })
      : ['- Nessuna prediction classificata SCORING_DIFFERENCE.']),
    '',
    '### DATA_DIFFERENCE e HISTORICAL_UNCERTAIN',
    '',
    ...completeRows
      .filter((row) => ['DATA_DIFFERENCE', 'HISTORICAL_UNCERTAIN'].includes(row.classification))
      .map((row) => {
        const label = usersById.get(row.item.userId)?.email ?? row.item.userId;
        return `- **${markdownCell(label)} / ${row.item.gp.short_name}** `
          + `→ **${row.classification}**: ${row.reason}`;
      }),
    '',
    '## 6. Analisi per GP',
    '',
    '| GP | Complete | Match | Data diff | Scoring diff | Missing data | Historical uncertain | Totale DB | Totale ricalcolato |',
    '|---|---:|---:|---:|---:|---:|---:|---:|---:|',
    ...[...gpAggregation.entries()]
      .sort(([left], [right]) => String(left).localeCompare(String(right)))
      .map(([gpId, value]) => {
        const gp = context.grandPrix.find((item) => item.id === gpId);
        return `| ${gp?.short_name ?? gpId} | ${value.complete} | ${value.match}`
          + ` | ${value.dataDifference} | ${value.scoringDifference}`
          + ` | ${value.missingData} | ${value.historicalUncertain}`
          + ` | ${value.databaseTotal} | ${value.recalculatedTotal} |`;
      }),
    '',
    '## 7. Analisi per utente',
    '',
    '| Utente | Prediction complete | Match | Discrepanze | Punti DB | Punti ricalcolati | Δ |',
    '|---|---:|---:|---:|---:|---:|---:|',
    ...[...userAggregation.values()]
      .sort((left, right) => String(left.user).localeCompare(String(right.user)))
      .map((value) => `| ${markdownCell(value.user)} | ${value.complete} | ${value.match}`
        + ` | ${value.discrepancies} | ${value.databaseTotal} | ${value.recalculatedTotal}`
        + ` | ${value.databaseTotal - value.recalculatedTotal} |`),
    '',
    '## 8. Casi speciali già noti',
    '',
    ...completeRows
      .filter((row) => row.fixture)
      .map((row) => {
        const email = usersById.get(row.item.userId)?.email ?? row.item.userId;
        return `- **${markdownCell(email)} / ${row.item.gp.name}**: `
          + `${row.classification}; ${knownCaseLine(row, row.fixture, row.predictionMatchesFixture, row.score)}.`;
      }),
    '',
    '- Niky / Thailandia: il fixture Task 32 deve produrre **21**.',
    '- Marty / Catalogna: il fixture Task 32 deve produrre **13 = 6 + 9 - 2**.',
    '- Marty / Italia: il fixture Task 32 deve produrre **30** con Bonus A.',
    '- Marino / Aragon: fixture Task 32 verificato offline a **28**; se la prediction DB non è presente, non viene inventata.',
    '',
    '## 9. Qatar',
    '',
    `- Righe sorgente non vuote: **${sourceCounts.get('QAT') ?? 0}**.`,
    `- Prediction storiche risolte in TEST01: **${selection.items.filter((item) => item.gp.short_name === 'QAT').length}**.`,
    `- Copertura live: **${qatarCoverage
      ? `Q=${qatarCoverage.qualifying?.results.length ?? 0}, S=${qatarCoverage.sprint?.results.length ?? 0}, R=${qatarCoverage.race?.results.length ?? 0}`
      : 'nessuna prediction selezionata'}**.`,
    '- Nessun punteggio Qatar viene inventato o ricostruito artificialmente.',
    '',
    '## 10. Prediction extra',
    '',
    ...(extraPredictions.length
      ? extraPredictions.map((item) =>
        `- **EXTRA_NOT_IN_HISTORICAL_SOURCE** — ${markdownCell(
          usersById.get(item.user_id)?.email ?? item.user_id,
        )} / ${item.gp?.short_name ?? item.grand_prix_id} / ${item.id}`)
      : ['- Nessuna.']),
    '',
    '## 11. Partial escluse',
    '',
    '- Criterio: 1 POLE, 1 QUALIFYING_TIME, 3 SPRINT, 5 RACE, 1 RACE_OUT; nessuna entry viene inventata.',
    '',
    '| Utente | GP | Prediction ID | Entry | Mancanti | Slot duplicati | scored_at | Stato |',
    '|---|---|---|---:|---|---|---|---|',
    ...partialRows.map((row) => {
      const label = usersById.get(row.item.userId)?.email ?? row.item.userId;
      return `| ${markdownCell(label)} | ${row.item.gp.short_name} | ${row.item.prediction.id}`
        + ` | ${row.entryCount} | ${row.audit.missing.join(', ') || '—'}`
        + ` | ${row.audit.duplicateSlots.join(', ') || '—'}`
        + ` | ${row.item.prediction.scored_at ? 'valorizzato' : 'vuoto'}`
        + ` | ${row.classification} |`;
    }),
    '',
    '## 12. Sicurezza e verifica finale',
    '',
    '- Modalità: **DRY-RUN read-only**.',
    '- RPC `score_prediction`: **0**.',
    '- INSERT: **0**.',
    '- UPDATE: **0**.',
    '- DELETE: **0**.',
    '- UPSERT: **0**.',
    '- Prediction modificate: **0**.',
    '- Prediction entries modificate: **0**.',
    '- Session results modificati: **0**.',
    '- Leagues/league_members modificati: **0**.',
    '- Schema modificato: **NO**.',
    '- RLS modificato: **NO**.',
    '- RPC modificate: **NO**.',
    '- Workflow modificati: **NO**.',
    `- Report scritto: **${args.report}**.`,
    '',
    '## 13. Conclusioni e raccomandazione',
    '',
    '- Il database contiene punteggi già valorizzati per le prediction complete, ma il replay storico non coincide integralmente con gli aggregati attuali.',
    '- I casi noti dimostrano che i risultati live possono differire dalla snapshot ufficiale usata dai workbook Excel; questi casi sono classificati DATA_DIFFERENCE quando il fixture è comparabile.',
    '- Le altre discrepanze restano HISTORICAL_UNCERTAIN e non vengono attribuite senza una snapshot storica verificabile.',
    '- Non esiste alcuna base read-only per correggere ora i punteggi o aggiornare la classifica.',
    '- Raccomandazione: mantenere invariati i dati e decidere in un task successivo, con approvazione esplicita, se conservare i punteggi storici Excel separati dagli aggregati applicativi oppure riconciliare solo dopo aver definito la snapshot ufficiale.',
    '',
  ];
  return `${lines.join('\n')}\n`;
}

async function loadContext(client) {
  const [seasons, leagues] = await Promise.all([
    client.get(`/seasons?year=eq.${SEASON_YEAR}&select=id,year`),
    client.get(`/leagues?invite_code=eq.${LEAGUE_CODE}&select=id,name,invite_code`),
  ]);
  if (seasons.length !== 1 || leagues.length !== 1) {
    throw new Error('Stagione o lega target non univoca.');
  }
  const seasonId = seasons[0].id;
  const league = leagues[0];
  const [usersResponse, members, grandPrix, predictions, riders, sessions, profiles] =
    await Promise.all([
      client.authGet('/admin/users?page=1&per_page=1000'),
      client.get(`/league_members?league_id=eq.${league.id}&select=league_id,user_id`),
      client.get(`/grand_prix?season_id=eq.${seasonId}&is_test=eq.false`
        + '&select=id,name,short_name,date_start,date_end&order=date_start.asc'),
      client.get(`/predictions?league_id=eq.${league.id}`
        + '&select=id,user_id,grand_prix_id,league_id,qualifying_points,sprint_points,'
        + 'race_points,bonus_points,malus_points,total_points,scored_at,updated_at'),
      client.get('/riders?select=id,name,surname,nickname'),
      client.get('/sessions?select=id,grand_prix_id,type,status,session_date,number'
        + '&order=session_date.asc'),
      client.get('/profiles?select=id,user_id,name'),
    ]);
  return {
    league,
    users: usersResponse.users ?? [],
    members,
    grandPrix,
    predictions,
    riders,
    sessions,
    profiles,
  };
}

async function getChunks(client, ids, pathForIds) {
  const result = [];
  for (let index = 0; index < ids.length; index += 80) {
    result.push(...await client.get(pathForIds(ids.slice(index, index + 80))));
  }
  return result;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const rows = parseSource(await readFile(args.source, 'utf8'));
  const client = createReadOnlyClient();
  const context = await loadContext(client);
  const selection = selectHistoricalPredictions(rows, context);
  const selectedIds = new Set(selection.items.map((item) => item.prediction.id));
  const extraPredictions = context.predictions
    .filter((prediction) => !selectedIds.has(prediction.id))
    .map((prediction) => ({
      ...prediction,
      gp: context.grandPrix.find((gp) => gp.id === prediction.grand_prix_id),
    }));
  const entries = await getChunks(
    client,
    selection.items.map((item) => item.prediction.id),
    (ids) => `/prediction_entries?prediction_id=in.(${ids.join(',')})`
      + '&select=id,prediction_id,prediction_type,position,rider_id,predicted_time,points',
  );
  const results = await getChunks(
    client,
    context.sessions
      .filter((session) => context.grandPrix.some((gp) => gp.id === session.grand_prix_id))
      .map((session) => session.id),
    (ids) => `/session_results?session_id=in.(${ids.join(',')})`
      + '&select=id,session_id,rider_id,position,total_time,status',
  );
  const ridersById = new Map(context.riders.map((rider) => [rider.id, rider]));
  const usersById = new Map(context.users.map((user) => [user.id, user]));
  const profilesByUserId = new Map(context.profiles.map((profile) => [profile.user_id, profile]));
  const resultsBySession = new Map();
  for (const result of results) {
    const current = resultsBySession.get(result.session_id) ?? [];
    current.push(result);
    resultsBySession.set(result.session_id, current);
  }
  const coverageByGp = new Map();
  const officialByGp = new Map();
  for (const item of selection.items) {
    if (coverageByGp.has(item.gp.id)) continue;
    const coverage = {
      qualifying: chooseOfficialSession(context.sessions, resultsBySession, item.gp.id, 'Q'),
      sprint: chooseOfficialSession(context.sessions, resultsBySession, item.gp.id, 'SPR'),
      race: chooseOfficialSession(context.sessions, resultsBySession, item.gp.id, 'RAC'),
    };
    coverageByGp.set(item.gp.id, coverage);
    if (coverage.qualifying && coverage.sprint && coverage.race) {
      officialByGp.set(item.gp.id, buildOfficialResults(coverage, ridersById));
    }
  }

  const auditRows = selection.items.map((item) => {
    const selectedEntries = entriesForPrediction(entries, item.prediction.id);
    const audit = entryAudit(selectedEntries);
    const entryCount = selectedEntries.length;
    const official = officialByGp.get(item.gp.id);
    if (!official) {
      return {
        item,
        audit,
        entryCount,
        score: null,
        comparison: null,
        status: 'NO_OFFICIAL_RESULTS',
        classification: 'MISSING_DATA',
        reason: 'Manca almeno una sessione ufficiale completa per il replay.',
      };
    }
    if (!audit.complete) {
      return classifyPartialRow({
        item,
        audit,
        entryCount,
        score: null,
        comparison: null,
        status: 'PARTIAL',
      }, true);
    }
    const prediction = buildPrediction(selectedEntries, ridersById);
    const score = detailedScore(prediction, official);
    const comparison = compareAuditRow(item.prediction, score);
    const fixture = fixtureForItem(item, usersById);
    const predictionMatchesFixtureValue = fixture
      ? predictionMatchesFixture(prediction, fixture)
      : false;
    const classification = classifyAuditRow({
      comparison,
      score,
      fixture,
      predictionMatches: predictionMatchesFixtureValue,
      hasOfficialData: true,
    });
    return {
      item,
      audit,
      entryCount,
      prediction,
      score,
      comparison,
      fixture,
      predictionMatchesFixture: predictionMatchesFixtureValue,
      status: 'SCORED_OFFLINE',
      ...classification,
    };
  });
  const partialRows = auditRows.filter((row) => row.status === 'PARTIAL');
  const report = buildReport({
    args,
    rows,
    context,
    selection,
    auditRows,
    partialRows,
    extraPredictions,
    coverageByGp,
    usersById,
    profilesByUserId,
  });
  await writeFile(args.report, report, 'utf8');
  const completeRows = auditRows.filter((row) => row.status === 'SCORED_OFFLINE');
  const count = (classification) =>
    completeRows.filter((row) => row.classification === classification).length;
  console.log('AUDIT TASK 34 COMPLETATO');
  console.log(`Prediction storiche: ${selection.items.length}`);
  console.log(`Complete: ${completeRows.length}`);
  console.log(`Partial: ${partialRows.length}`);
  console.log(`MATCH/DATA/SCORING/MISSING/UNCERTAIN: ${
    ['MATCH', 'DATA_DIFFERENCE', 'SCORING_DIFFERENCE', 'MISSING_DATA', 'HISTORICAL_UNCERTAIN']
      .map(count).join('/')
  }`);
  console.log('RPC invocate: 0');
  console.log(`Report: ${args.report}`);
}

export {
  buildReport,
  detailedScore,
  predictionMatchesFixture,
  scoreMatchesFixture,
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}