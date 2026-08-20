/**
 * Preparazione import roster MotoGP 2026 — SOLO DRY-RUN.
 *
 * Questo script legge esclusivamente l'API pubblica MotoGP e costruisce in
 * memoria i record per seasons/teams/riders/rider_seasons.
 * Non importa né modifica dati Supabase.
 */

const API_BASE = 'https://api.motogp.pulselive.com/motogp/v1';
const SEASON_ID = 'e88b4e43-2209-47aa-8e83-0e0b1cedde6e';
const SEASON_YEAR = 2026;

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

    const riderSeasonKey = `${riderId}:${SEASON_ID}:${teamId}`;
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

  printSection('4 · REPORT FINALE DRY-RUN');
  console.log(`  content MotoGP category UUID: ${contentMotoGpCategoryUuid}`);
  console.log(`  Team trovati: ${teams.length}`);
  console.log(`  Piloti trovati: ${riders.length}`);
  console.log(`  Rider_seasons preparati: ${riderSeasons.length}`);
  console.log(`  Duplicati: ${anomalies.duplicateRiders.length}`);
  console.log(`  Piloti senza team: ${anomalies.ridersWithoutTeam.length}`);
  console.log(`  Piloti categoria errata: ${anomalies.ridersWrongCategory.length}`);
  console.log(`  Dati mancanti o incoerenti: ${anomalies.missingData.length}`);
  console.log(`  Nickname non disponibili (facoltativo): ${anomalies.optionalMissing.length}`);
  console.log(`  Team senza rider: ${anomalies.teamsWithoutRiders.length}`);
  console.log('  Scritture Supabase: NESSUNA');

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