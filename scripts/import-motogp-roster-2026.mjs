/**
 * Import roster MotoGP 2026 — server-side.
 *
 * Default: dry-run, nessuna scrittura.
 * Import reale: node scripts/import-motogp-roster-2026.mjs --import
 *
 * L'import reale richiede SUPABASE_SERVICE_ROLE_KEY e non deve essere
 * eseguito dal frontend.
 */

const API_BASE = 'https://api.motogp.pulselive.com/motogp/v1';
const SEASON_ID = 'e88b4e43-2209-47aa-8e83-0e0b1cedde6e';
const SEASON_YEAR = 2026;
const IMPORT_MODE = process.argv.includes('--import');
const SUPABASE_URL = (
  process.env.SUPABASE_URL ??
  process.env.VITE_SUPABASE_URL ??
  ''
).replace(/\/$/, '');
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

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
    json = JSON.parse(text);
  } catch {
    // Il chiamante mostrerà il corpo non JSON in caso di errore.
  }

  if (!response.ok) {
    throw new Error(
      `${response.status} ${response.statusText} — ${text.slice(0, 300)}`,
    );
  }

  return { json, url, contentType: response.headers.get('content-type') };
}

async function supabaseRequest(path, options = {}) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      'Import reale non disponibile: servono SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.',
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
    // Il messaggio raw viene incluso nell'errore sotto.
  }

  if (!response.ok) {
    throw new Error(
      `Supabase REST ${response.status} ${response.statusText} — ${text.slice(0, 500)}`,
    );
  }

  return { json, status: response.status };
}

async function verifySeasonExists() {
  const result = await supabaseRequest(
    `/seasons?id=eq.${encodeURIComponent(SEASON_ID)}&select=id,year`,
  );
  const rows = Array.isArray(result.json) ? result.json : [];
  if (rows.length !== 1) {
    throw new Error(
      `La stagione ${SEASON_ID} non esiste in public.seasons o non è univoca.`,
    );
  }
  if (rows[0].year !== undefined && Number(rows[0].year) !== SEASON_YEAR) {
    throw new Error(
      `La stagione ${SEASON_ID} ha year=${rows[0].year}, atteso ${SEASON_YEAR}.`,
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

function criticalValidationErrors(teams, riders, riderSeasons, anomalies) {
  const errors = [];

  if (teams.length !== 11) errors.push(`Team attesi 11, trovati ${teams.length}.`);
  if (riders.length !== 29) errors.push(`Piloti attesi 29, trovati ${riders.length}.`);
  if (riderSeasons.length !== 29) {
    errors.push(`Rider seasons attesi 29, trovati ${riderSeasons.length}.`);
  }
  if (anomalies.duplicateRiders.length > 0) {
    errors.push(`Duplicati rilevati: ${anomalies.duplicateRiders.length}.`);
  }
  if (anomalies.ridersWithoutTeam.length > 0) {
    errors.push(`Piloti senza team: ${anomalies.ridersWithoutTeam.length}.`);
  }
  if (anomalies.ridersWrongCategory.length > 0) {
    errors.push(`Piloti fuori categoria MotoGP: ${anomalies.ridersWrongCategory.length}.`);
  }
  if (anomalies.missingData.length > 0) {
    errors.push(`Dati obbligatori mancanti o incoerenti: ${anomalies.missingData.length}.`);
  }
  if (anomalies.teamsWithoutRiders.length > 0) {
    errors.push(`Team senza rider: ${anomalies.teamsWithoutRiders.length}.`);
  }

  return errors;
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

async function verifyImportedRoster(expected) {
  const [
    seasonResult,
    teamResult,
    riderResult,
    riderSeasonResult,
    joinedResult,
  ] = await Promise.all([
    supabaseRequest(`/seasons?id=eq.${encodeURIComponent(SEASON_ID)}&select=id,year`),
    supabaseRequest('/teams?select=id,name'),
    supabaseRequest('/riders?select=id,name,surname'),
    supabaseRequest(
      `/rider_seasons?season_id=eq.${encodeURIComponent(SEASON_ID)}&select=rider_id,season_id,team_id,number,active`,
    ),
    supabaseRequest(
      `/rider_seasons?season_id=eq.${encodeURIComponent(SEASON_ID)}&select=number,rider:riders(name,surname),team:teams(name),season:seasons(year)&order=number.asc`,
    ),
  ]);

  const seasons = Array.isArray(seasonResult.json) ? seasonResult.json : [];
  const teams = Array.isArray(teamResult.json) ? teamResult.json : [];
  const riders = Array.isArray(riderResult.json) ? riderResult.json : [];
  const riderSeasons = Array.isArray(riderSeasonResult.json)
    ? riderSeasonResult.json
    : [];
  const joinedRows = Array.isArray(joinedResult.json) ? joinedResult.json : [];
  const teamById = new Map(teams.map(team => [team.id, team]));
  const riderById = new Map(riders.map(rider => [rider.id, rider]));
  const expectedTeamIds = new Set(expected.teams.map(team => team.id));
  const expectedRiderIds = new Set(expected.riders.map(rider => rider.id));
  const expectedRelations = new Set(
    expected.riderSeasons.map(row => `${row.rider_id}:${row.season_id}`),
  );
  const storedRelations = new Set(
    riderSeasons.map(row => `${row.rider_id}:${row.season_id}`),
  );

  const missingTeams = [...expectedTeamIds].filter(id => !teamById.has(id));
  const missingRiders = [...expectedRiderIds].filter(id => !riderById.has(id));
  const missingRelations = [...expectedRelations].filter(
    key => !storedRelations.has(key),
  );
  const duplicateRelations = countDuplicates(
    riderSeasons,
    joinedRows,
    row => `${row.rider_id}:${row.season_id}`,
  );
  const orphanRelations = riderSeasons.filter(
    row => !riderById.has(row.rider_id) || !teamById.has(row.team_id),
  );
  const teamCount = new Set(riderSeasons.map(row => row.team_id)).size;
  const riderCount = new Set(riderSeasons.map(row => row.rider_id)).size;

  return {
    seasons,
    teamById,
    riderById,
    riderSeasons,
    teamCount,
    riderCount,
    duplicateRelations,
    orphanRelations,
    missingTeams,
    missingRiders,
    missingRelations,
  };
}

function valueOrNull(value) {
  return value === undefined || value === null || value === '' ? null : value;
}

function printSection(title) {
  console.log(`\n${'═'.repeat(72)}\n${title}\n${'═'.repeat(72)}`);
}

function printRecord(label, record) {
  console.log(`  ${label}: ${JSON.stringify(record)}`);
}

const anomalies = {
  duplicateRiders: [],
  ridersWithoutTeam: [],
  ridersWrongCategory: [],
  missingData: [],
  optionalMissing: [],
  teamsWithoutRiders: [],
};

try {
  if (IMPORT_MODE) {
    printSection('0 · VERIFICA STAGIONE SUPABASE');
    const season = await verifySeasonExists();
    console.log(`  Stagione verificata: ${season.id} (${season.year ?? SEASON_YEAR})`);
  } else {
    console.log('\nModalità dry-run: nessuna scrittura Supabase. Aggiungi --import per importare.');
  }

  printSection('1 · CATEGORIA ANAGRAFICA MotoGP');
  const categoriesResponse = await get(`/categories?seasonYear=${SEASON_YEAR}`);
  const categories = Array.isArray(categoriesResponse.json)
    ? categoriesResponse.json
    : [];
  const motoGpCategory = categories.find(
    category => category.name?.toLowerCase() === 'motogp',
  );

  if (!motoGpCategory?.id) {
    throw new Error('Categoria MotoGP non trovata in /categories.');
  }

  const contentMotoGpCategoryUuid = motoGpCategory.id;
  console.log(`  URL: ${categoriesResponse.url}`);
  console.log(`  HTTP: 200 | content-type: ${categoriesResponse.contentType}`);
  console.log(`  content MotoGP category UUID: ${contentMotoGpCategoryUuid}`);

  printSection('2 · ROSTER TEAM MotoGP 2026');
  const teamsResponse = await get(
    `/teams?seasonYear=${SEASON_YEAR}&categoryUuid=${contentMotoGpCategoryUuid}`,
  );
  const sourceTeams = Array.isArray(teamsResponse.json)
    ? teamsResponse.json
    : [];

  console.log(`  URL: ${teamsResponse.url}`);
  console.log(`  HTTP: 200 | content-type: ${teamsResponse.contentType}`);
  console.log(`  Team trovati: ${sourceTeams.length}`);

  const teams = [];
  const teamIds = new Set();
  const riderSources = [];

  for (const sourceTeam of sourceTeams) {
    const teamId = valueOrNull(sourceTeam.id);
    const teamName = valueOrNull(sourceTeam.name);
    const constructorId = valueOrNull(sourceTeam.constructor?.id);
    const constructorName = valueOrNull(sourceTeam.constructor?.name);
    const categoryName = valueOrNull(sourceTeam.category?.name);
    const sourceRiders = Array.isArray(sourceTeam.riders)
      ? sourceTeam.riders
      : [];

    if (!teamId || !teamName || !constructorId || !constructorName || !categoryName) {
      anomalies.missingData.push({
        type: 'team',
        team_id: teamId,
        fields: {
          id: !teamId,
          name: !teamName,
          constructor_id: !constructorId,
          constructor_name: !constructorName,
          category: !categoryName,
        },
      });
    }

    if (teamId && teamIds.has(teamId)) {
      anomalies.duplicateRiders.push({
        type: 'team',
        team_id: teamId,
        message: 'Team duplicato nella risposta API',
      });
    }
    if (teamId) teamIds.add(teamId);

    teams.push({
      id: teamId,
      name: teamName,
      constructor_id: constructorId,
      constructor_name: constructorName,
      category: categoryName,
      active: true,
    });

    if (sourceRiders.length === 0) {
      anomalies.teamsWithoutRiders.push({
        team_id: teamId,
        team_name: teamName,
      });
    }

    for (const sourceRider of sourceRiders) {
      riderSources.push({
        sourceRider,
        teamId,
        teamName,
        teamCategory: categoryName,
      });
    }
  }

  console.log('\n  Elenco team preparati:');
  teams.forEach(team => printRecord(team.name ?? '(senza nome)', team));

  printSection('3 · RIDER E RELAZIONI STAGIONALI');
  const ridersById = new Map();
  const riderSeasonsByKey = new Map();

  for (const { sourceRider, teamId, teamName, teamCategory } of riderSources) {
    const riderId = valueOrNull(sourceRider.id);
    const riderCategory = valueOrNull(
      sourceRider.current_career_step?.category?.name,
    );
    const number = valueOrNull(sourceRider.current_career_step?.number);
    const riderTeamId = valueOrNull(sourceRider.current_career_step?.team?.id);
    const riderTeamName = valueOrNull(sourceRider.current_career_step?.team?.name);
    const riderTeamMismatch =
      riderTeamId && teamId && riderTeamId !== teamId;

    if (riderCategory !== 'MotoGP') {
      anomalies.ridersWrongCategory.push({
        rider_id: riderId,
        rider_name: `${sourceRider.name ?? ''} ${sourceRider.surname ?? ''}`.trim(),
        category: riderCategory,
        team_id: teamId,
      });
      continue;
    }

    if (!riderId || !teamId) {
      anomalies.ridersWithoutTeam.push({
        rider_id: riderId,
        rider_name: `${sourceRider.name ?? ''} ${sourceRider.surname ?? ''}`.trim(),
        team_id: teamId,
      });
      continue;
    }

    if (riderTeamMismatch) {
      anomalies.missingData.push({
        type: 'rider_team_mismatch',
        rider_id: riderId,
        parent_team_id: teamId,
        embedded_team_id: riderTeamId,
      });
    }

    const riderRecord = {
      id: riderId,
      name: valueOrNull(sourceRider.name),
      surname: valueOrNull(sourceRider.surname),
      nickname: valueOrNull(sourceRider.nickname),
      number,
      nationality: valueOrNull(sourceRider.country?.name),
      country_iso: valueOrNull(sourceRider.country?.iso),
      active:
        sourceRider.retired !== true &&
        sourceRider.published !== false &&
        sourceRider.current_career_step?.current !== false,
    };

    const missingRiderFields = Object.entries(riderRecord)
      .filter(([field, value]) => field !== 'active' && field !== 'nickname' && value === null)
      .map(([field]) => field);
    if (missingRiderFields.length > 0) {
      anomalies.missingData.push({
        type: 'rider',
        rider_id: riderId,
        fields: missingRiderFields,
      });
    }
    if (riderRecord.nickname === null) {
      anomalies.optionalMissing.push({
        type: 'rider',
        rider_id: riderId,
        field: 'nickname',
      });
    }

    if (ridersById.has(riderId)) {
      const previous = ridersById.get(riderId);
      anomalies.duplicateRiders.push({
        rider_id: riderId,
        rider_name: `${riderRecord.name ?? ''} ${riderRecord.surname ?? ''}`.trim(),
        teams: [previous.team_name, teamName],
      });
    } else {
      ridersById.set(riderId, {
        ...riderRecord,
        team_id: teamId,
        team_name: teamName,
      });
    }

    const riderSeasonKey = `${riderId}:${SEASON_ID}`;
    if (!riderSeasonsByKey.has(riderSeasonKey)) {
      riderSeasonsByKey.set(riderSeasonKey, {
        rider_id: riderId,
        season_id: SEASON_ID,
        team_id: teamId,
        number,
        active: riderRecord.active,
      });
    }
  }

  const riders = [...ridersById.values()].map(
    ({ team_id: _teamId, team_name: _teamName, ...rider }) => rider,
  );
  const riderSeasons = [...riderSeasonsByKey.values()];
  const teamNameById = new Map(teams.map(team => [team.id, team.name]));

  const riderCountByTeam = new Map();
  for (const relation of riderSeasons) {
    riderCountByTeam.set(
      relation.team_id,
      (riderCountByTeam.get(relation.team_id) ?? 0) + 1,
    );
  }
  for (const team of teams) {
    if ((riderCountByTeam.get(team.id) ?? 0) === 0) {
      anomalies.teamsWithoutRiders.push({
        team_id: team.id,
        team_name: team.name,
      });
    }
  }

  console.log(`  Piloti MotoGP validati: ${riders.length}`);
  console.log(`  Relazioni rider_seasons preparate: ${riderSeasons.length}`);
  console.log('\n  Elenco piloti preparati:');
  for (const rider of riders) {
    const relation = riderSeasons.find(item => item.rider_id === rider.id);
    console.log(
      `  • ${rider.number ?? '—'} ${rider.name ?? ''} ${rider.surname ?? ''}` +
      ` — ${teamNameById.get(relation?.team_id) ?? '(team mancante)'}` +
      ` [${relation?.team_id ?? '—'}]`,
    );
  }

  const validationErrors = criticalValidationErrors(
    teams,
    riders,
    riderSeasons,
    anomalies,
  );
  let databaseVerification = null;
  const importErrors = [];

  if (IMPORT_MODE) {
    printSection('4 · VALIDAZIONE CRITICA PRE-IMPORT');
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => console.error(`  ✗ ${error}`));
      throw new Error('Validazione critica fallita: import interrotto prima di ogni scrittura.');
    }
    console.log('  ✓ Tutte le validazioni critiche sono superate.');

    printSection('5 · IMPORT SUPABASE (UPSERT SERVER-SIDE)');
    await upsertRows('teams', teams, 'id');
    console.log(`  ✓ Teams upsert: ${teams.length}`);
    await upsertRows('riders', riders, 'id');
    console.log(`  ✓ Riders upsert: ${riders.length}`);
    await upsertRows('rider_seasons', riderSeasons, 'rider_id,season_id');
    console.log(`  ✓ Rider seasons upsert: ${riderSeasons.length}`);

    printSection('6 · VERIFICA POST-IMPORT SUPABASE');
    databaseVerification = await verifyImportedRoster({
      teams,
      riders,
      riderSeasons,
    });

    if (databaseVerification.seasons.length !== 1) {
      importErrors.push('La stagione 2026 non risulta più leggibile dopo l’import.');
    }
    if (databaseVerification.teamCount !== teams.length) {
      importErrors.push(
        `Team 2026 attesi ${teams.length}, trovati ${databaseVerification.teamCount}.`,
      );
    }
    if (databaseVerification.riderCount !== riders.length) {
      importErrors.push(
        `Piloti 2026 attesi ${riders.length}, trovati ${databaseVerification.riderCount}.`,
      );
    }
    if (databaseVerification.riderSeasons.length !== riderSeasons.length) {
      importErrors.push(
        `Rider seasons attesi ${riderSeasons.length}, trovati ${databaseVerification.riderSeasons.length}.`,
      );
    }
    if (databaseVerification.duplicateRelations > 0) {
      importErrors.push(
        `Duplicati rider_seasons: ${databaseVerification.duplicateRelations}.`,
      );
    }
    if (databaseVerification.orphanRelations.length > 0) {
      importErrors.push(
        `Rider seasons orfani: ${databaseVerification.orphanRelations.length}.`,
      );
    }
    if (databaseVerification.missingTeams.length > 0) {
      importErrors.push(
        `Team importati ma non trovati: ${databaseVerification.missingTeams.length}.`,
      );
    }
    if (databaseVerification.missingRiders.length > 0) {
      importErrors.push(
        `Piloti importati ma non trovati: ${databaseVerification.missingRiders.length}.`,
      );
    }
    if (databaseVerification.missingRelations.length > 0) {
      importErrors.push(
        `Rider seasons importati ma non trovati: ${databaseVerification.missingRelations.length}.`,
      );
    }
  }

  printSection(IMPORT_MODE ? 'IMPORT COMPLETATO' : 'REPORT FINALE DRY-RUN');
  console.log(`  content MotoGP category UUID: ${contentMotoGpCategoryUuid}`);
  console.log(`  Teams: ${databaseVerification?.teamCount ?? teams.length}`);
  console.log(`  Riders: ${databaseVerification?.riderCount ?? riders.length}`);
  console.log(`  Rider seasons: ${databaseVerification?.riderSeasons.length ?? riderSeasons.length}`);
  console.log('\n  Verifiche:');
  console.log(
    `  - duplicati: ${databaseVerification?.duplicateRelations ?? anomalies.duplicateRiders.length}`,
  );
  console.log(`  - rider senza team: ${anomalies.ridersWithoutTeam.length}`);
  console.log(
    `  - rider_seasons orfani: ${databaseVerification?.orphanRelations.length ?? 0}`,
  );
  console.log(`  - errori: ${validationErrors.length + importErrors.length}`);
  console.log(`  - nickname non disponibili (facoltativo): ${anomalies.optionalMissing.length}`);
  console.log(`  - team senza rider: ${anomalies.teamsWithoutRiders.length}`);
  console.log(
    IMPORT_MODE
      ? '  Scritture Supabase: UPSERT completati'
      : '  Scritture Supabase: NESSUNA',
  );

  if (databaseVerification) {
    console.log('\n  Numero | Pilota | Team | Stagione');
    console.log('  -------|--------|------|---------');
    databaseVerification.joinedRows.forEach(row => {
      const riderName = `${row.rider?.name ?? '—'} ${row.rider?.surname ?? ''}`.trim();
      console.log(
        `  ${String(row.number ?? '—').padEnd(6)} | ${riderName.padEnd(28)} | ` +
        `${(row.team?.name ?? '—').padEnd(34)} | ${row.season?.year ?? '—'}`,
      );
    });
  }

  if (anomalies.duplicateRiders.length > 0) {
    console.log('\n  Dettaglio duplicati:');
    anomalies.duplicateRiders.forEach(item => printRecord('duplicato', item));
  }
  if (anomalies.ridersWithoutTeam.length > 0) {
    console.log('\n  Dettaglio piloti senza team:');
    anomalies.ridersWithoutTeam.forEach(item => printRecord('senza team', item));
  }
  if (anomalies.ridersWrongCategory.length > 0) {
    console.log('\n  Dettaglio piloti categoria errata:');
    anomalies.ridersWrongCategory.forEach(item => printRecord('categoria errata', item));
  }
  if (anomalies.missingData.length > 0) {
    console.log('\n  Dettaglio dati mancanti/incoerenti:');
    anomalies.missingData.forEach(item => printRecord('anomalia', item));
  }
  if (anomalies.optionalMissing.length > 0) {
    console.log('\n  Nickname non disponibili (campo facoltativo):');
    anomalies.optionalMissing.forEach(item => printRecord('nickname assente', item));
  }
  if (anomalies.teamsWithoutRiders.length > 0) {
    console.log('\n  Dettaglio team senza rider:');
    anomalies.teamsWithoutRiders.forEach(item => printRecord('team vuoto', item));
  }
} catch (error) {
  console.error('\n✗ Import preparation failed:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
}