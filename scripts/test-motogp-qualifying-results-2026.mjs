/**
 * Analisi esplorativa dei risultati ufficiali delle qualifiche MotoGP 2026.
 *
 * Questo script non scrive su Supabase e non implementa il parser definitivo.
 * Scarica i PDF temporaneamente in /tmp e usa pdftotext -layout per studiarne
 * la struttura.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BASE = 'https://api.motogp.pulselive.com/motogp/v1';
const EVENT_UUID = '6a16e0cb-ef4b-44b1-92e5-2e958cca0815';
const RESULTS_CATEGORY_UUID = 'e8c110ad-64aa-4e8e-8a86-f2f152f6a942';
const EVENT_NAME = 'GRAND PRIX OF GREAT BRITAIN';
const TMP_DIR = join(tmpdir(), 'motogp-qualifying-2026');

function section(title) {
  console.log(`\n${'═'.repeat(76)}\n${title}\n${'═'.repeat(76)}`);
}

function firstValue(...values) {
  return values.find(value => value !== undefined && value !== null && value !== '');
}

function listFrom(payload, keys) {
  if (Array.isArray(payload)) return payload;
  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }
  return [];
}

function textValue(value) {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value === 'object') {
    return firstValue(value.name, value.label, value.value) ?? null;
  }
  return String(value);
}

async function getJson(path) {
  const response = await fetch(`${BASE}${path}`, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'Mozilla/5.0',
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
    throw new Error(`${response.status} ${response.statusText} — ${text.slice(0, 500)}`);
  }

  return json;
}

async function downloadPdf(url, filename) {
  const response = await fetch(url, {
    headers: { Accept: 'application/pdf', 'User-Agent': 'Mozilla/5.0' },
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) {
    throw new Error(`PDF ${response.status} ${response.statusText}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  const filePath = join(TMP_DIR, filename);
  await writeFile(filePath, buffer);
  return filePath;
}

async function extractPdfText(pdfPath, txtPath) {
  const result = spawnSync('pdftotext', ['-layout', pdfPath, txtPath], {
    encoding: 'utf8',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`pdftotext exit ${result.status}: ${result.stderr ?? ''}`);
  }
  return readFile(txtPath, 'utf8');
}

function classifyQualifyingSession(session, index) {
  const number = Number(firstValue(
    session.number,
    session.sessionNumber,
    session.order,
    session.sequence,
  ));
  if (number === 1) return 'Q1';
  if (number === 2) return 'Q2';
  return `Q${index + 1}`;
}

function filesFromDescriptor(descriptor) {
  const files = descriptor?.session_files ?? descriptor?.sessionFiles ?? {};
  return {
    classification: files.classification?.url ?? null,
    combined_classification: files.combined_classification?.url ??
      files.combinedClassification?.url ?? null,
    grid: files.grid?.url ?? null,
  };
}

function findLikelyRows(text) {
  const lines = text.split(/\r?\n/);
  const rows = [];

  for (const line of lines) {
    const match = line.match(
      /^\s*(\d{1,2})\s+(\d{1,3})\s+(.+?)\s{2,}([A-Z]{3})\s+(.+?)\s{2,}([A-Z]+)(?:\s+(Q[12]))?\s+(\d+'\d+\.\d+)/,
    );
    const fallback = !match && line.match(
      /^\s*(\d{1,2})\s+(\d{1,3})\s+(.+?)\s{2,}[A-Z]{3}.*?(\d+'\d+\.\d+)/,
    );
    if (match || fallback) {
      rows.push({
        position: Number((match ?? fallback)[1]),
        rider_number: Number((match ?? fallback)[2]),
        rider: (match ?? fallback)[3].trim(),
        nation: match?.[4] ?? null,
        team: match?.[5]?.trim() ?? null,
        motorcycle: match?.[6] ?? null,
        phase: match?.[7] ?? null,
        time: match?.[8] ?? fallback?.[4],
        raw: line,
      });
    }
  }

  return rows;
}

function printTextExcerpt(label, text, lineCount = 35) {
  const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
  console.log(`\n  ${label} — prime ${Math.min(lineCount, lines.length)} righe non vuote:`);
  lines.slice(0, lineCount).forEach(line => console.log(`    ${line}`));
}

function printFileAvailability(files) {
  console.log(`  classification: ${files.classification ?? '(assente)'}`);
  console.log(`  combined classification: ${files.combined_classification ?? '(assente)'}`);
  console.log(`  grid: ${files.grid ?? '(assente)'}`);
}

try {
  await mkdir(TMP_DIR, { recursive: true });

  section('ANALISI QUALIFICHE MotoGP 2026');
  console.log(`Evento: ${EVENT_NAME}`);
  console.log(`eventUuid: ${EVENT_UUID}`);
  console.log(`categoryUuid: ${RESULTS_CATEGORY_UUID}`);
  console.log(`PDF temporanei: ${TMP_DIR}`);
  console.log('Scritture Supabase: NESSUNA');

  section('1 · SESSIONI MotoGP DELL’EVENTO');
  const sessionsPayload = await getJson(
    `/results/sessions?eventUuid=${EVENT_UUID}&categoryUuid=${RESULTS_CATEGORY_UUID}`,
  );
  const allSessions = listFrom(sessionsPayload, ['sessions', 'items', 'results']);
  const qualifyingSessions = allSessions
    .filter(session => String(session.type ?? session.session_type ?? '').toUpperCase() === 'Q')
    .sort((a, b) => String(a.date ?? '').localeCompare(String(b.date ?? '')));

  console.log(`Sessioni totali evento: ${allSessions.length}`);
  console.log(`Sessioni Q individuate: ${qualifyingSessions.length}`);

  if (qualifyingSessions.length === 0) {
    throw new Error('Nessuna sessione con type=Q trovata.');
  }

  const analyses = [];

  for (const [index, sourceSession] of qualifyingSessions.entries()) {
    const sessionId = textValue(firstValue(
      sourceSession.id,
      sourceSession.uuid,
      sourceSession.sessionUuid,
    ));
    const label = classifyQualifyingSession(sourceSession, index);
    const sessionDate = textValue(firstValue(
      sourceSession.date,
      sourceSession.date_start,
      sourceSession.dateStart,
    ));

    section(`${label} · SESSIONE ${sessionId}`);
    console.log(`Data sessione: ${sessionDate ?? '—'}`);
    console.log(`Status: ${sourceSession.status ?? '—'}`);

    if (!sessionId) {
      throw new Error(`${label} senza session ID.`);
    }

    const descriptor = await getJson(`/results/sessions/${sessionId}`);
    const files = filesFromDescriptor(descriptor);
    console.log('\nPDF disponibili:');
    printFileAvailability(files);

    const analysis = {
      label,
      sessionId,
      sessionDate,
      files,
      classificationText: null,
      classificationRows: [],
      classificationPath: null,
      combinedText: null,
      combinedRows: [],
      gridText: null,
    };

    if (files.classification) {
      const baseName = `${label.toLowerCase()}-${sessionId}`;
      const pdfPath = await downloadPdf(files.classification, `${baseName}-classification.pdf`);
      const txtPath = join(TMP_DIR, `${baseName}-classification.txt`);
      analysis.classificationPath = pdfPath;
      analysis.classificationText = await extractPdfText(pdfPath, txtPath);
      analysis.classificationRows = findLikelyRows(analysis.classificationText);
      printTextExcerpt('Classification PDF', analysis.classificationText);
      console.log(`\n  File locale: ${pdfPath}`);
      console.log(`  Righe risultato riconosciute euristicamente: ${analysis.classificationRows.length}`);
      analysis.classificationRows.slice(0, 10).forEach(row => {
        console.log(`    ${row.position}. ${row.rider} — ${row.time}`);
      });
    }

    if (files.combined_classification) {
      const pdfPath = await downloadPdf(
        files.combined_classification,
        `${label.toLowerCase()}-${sessionId}-combined.pdf`,
      );
      analysis.combinedText = await extractPdfText(
        pdfPath,
        join(TMP_DIR, `${label.toLowerCase()}-${sessionId}-combined.txt`),
      );
      analysis.combinedRows = findLikelyRows(analysis.combinedText);
      printTextExcerpt('Combined classification PDF', analysis.combinedText, 20);
      console.log(`  Righe combined riconosciute euristicamente: ${analysis.combinedRows.length}`);
    }

    if (files.grid) {
      const pdfPath = await downloadPdf(
        files.grid,
        `${label.toLowerCase()}-${sessionId}-grid.pdf`,
      );
      analysis.gridText = await extractPdfText(
        pdfPath,
        join(TMP_DIR, `${label.toLowerCase()}-${sessionId}-grid.txt`),
      );
      printTextExcerpt('Grid PDF', analysis.gridText, 20);
    }

    analyses.push(analysis);
  }

  section('2 · REPORT QUALIFICHE');
  for (const analysis of analyses) {
    console.log(`\n${analysis.label}`);
    console.log(`Session ID: ${analysis.sessionId}`);
    console.log(`Classification: ${analysis.files.classification ?? '(assente)'}`);
    console.log(`Combined classification: ${analysis.files.combined_classification ?? '(assente)'}`);
    console.log(`Grid: ${analysis.files.grid ?? '(assente)'}`);

    if (analysis.classificationRows.length > 0) {
      console.log('Primi risultati estratti dalla Classification:');
      analysis.classificationRows.slice(0, 10).forEach(row => {
        console.log(`- ${row.position} | ${row.rider} | ${row.time}`);
      });
      const pole = analysis.classificationRows.find(row => row.position === 1);
      console.log(`Pole candidata: ${pole?.rider ?? '(non riconosciuta)'}`);
      console.log(`Tempo pole candidato: ${pole?.time ?? '(non riconosciuto)'}`);
    } else {
      console.log('Risultati: struttura non riconosciuta dall’euristica, consultare il testo estratto.');
    }
    if (analysis.combinedRows.length > 0) {
      console.log('Primi 10 del risultato combinato:');
      analysis.combinedRows.slice(0, 10).forEach(row => {
        console.log(`- ${row.position} | ${row.rider} | ${row.phase ?? '—'} | ${row.time}`);
      });
    }
  }

  const q1 = analyses.find(analysis => analysis.label === 'Q1');
  const q2 = analyses.find(analysis => analysis.label === 'Q2');
  const poleSource = q2?.classificationRows.find(row => row.position === 1) ?? null;

  section('3 · CONCLUSIONI PER IL FUTURO IMPORTER');
  console.log('1. Identificazione Q1/Q2:');
  console.log(`   Q1: ${q1?.sessionId ?? '(non identificata)'}`);
  console.log(`   Q2: ${q2?.sessionId ?? '(non identificata)'}`);
  console.log('2. Fonte ufficiale proposta per pole position e tempo pole:');
  console.log(`   ${q2?.files.classification ?? '(Classification Q2 non disponibile)'}`);
  console.log('3. Fonte ufficiale proposta per la posizione di qualifica:');
  console.log(`   ${q2?.files.combined_classification ?? '(Combined classification non disponibile)'}`);
  console.log('4. Piloti eliminati in Q1:');
  console.log(
    `   Classification Q1: ${q1?.files.classification ?? '(assente)'}` +
    ' oppure righe marcate Q1 nel combined.',
  );
  console.log('5. Combined classification:');
  console.log(`   ${q2?.files.combined_classification ?? q1?.files.combined_classification ?? '(non disponibile)'}`);
  console.log('6. Grid:');
  console.log(`   ${q2?.files.grid ?? q1?.files.grid ?? '(non disponibile)'}`);
  console.log('   Il Grid è una griglia di partenza provvisoria, non la fonte della classifica qualifiche.');
  console.log('7. Pole individuata:');
  console.log(`   ${poleSource?.rider ?? '(non riconosciuta)'}`);
  console.log(`   tempo ufficiale candidato: ${poleSource?.time ?? '(non riconosciuto)'}`);
  console.log('8. Primi 10 del risultato finale combinato:');
  (q2?.combinedRows ?? []).slice(0, 10).forEach(row => {
    console.log(`   ${row.position}. ${row.rider} — ${row.phase ?? '—'} — ${row.time}`);
  });
  console.log('9. URL/file da usare nel futuro importer:');
  console.log(`   Classification Q1: ${q1?.files.classification ?? '(assente)'}`);
  console.log(`   Classification Q2: ${q2?.files.classification ?? '(assente)'}`);
  console.log(`   Combined finale: ${q2?.files.combined_classification ?? '(assente)'}`);
  console.log('   Priorità: Classification Q2 per pole/tempo; Combined finale per la posizione di ogni pilota.');
  console.log('   Parser definitivo: NON implementato.');

  section('4 · PROBLEMI / ANOMALIE');
  console.log('- Nessuna scrittura su Supabase.');
  console.log('- Il parser delle righe è solo euristico e non è il parser definitivo.');
  console.log('- Verificare manualmente eventuali righe non riconosciute nel testo completo dei PDF.');
} catch (error) {
  console.error(
    '\n✗ Analisi qualifiche fallita:',
    error instanceof Error ? error.message : error,
  );
  process.exitCode = 1;
}