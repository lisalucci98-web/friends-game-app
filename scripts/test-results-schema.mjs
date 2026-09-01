import { readFile } from 'node:fs/promises';

const componentPath = new URL(
  '../artifacts/my-first-app/src/components/Task21Results.tsx',
  import.meta.url,
);
const source = await readFile(componentPath, 'utf8');

const selectNames = ['scoreSelect', 'leaderboardSelect', 'predictionEntrySelect'];
const selects = Object.fromEntries(
  selectNames.map((name) => {
    const match = source.match(
      new RegExp(`const\\s+${name}\\s*=\\s*\\[([\\s\\S]*?)\\]\\s*\\.join\\('\\,'\\)`),
    );
    if (!match) {
      throw new Error(`Select ${name} non trovata in Task21Results.tsx.`);
    }

    const columns = [...match[1].matchAll(/'([^']+)'/g)].map((column) => column[1]);
    if (columns.length === 0) {
      throw new Error(`Select ${name} non contiene colonne.`);
    }
    return [name, columns];
  }),
);

const tables = {
  scoreSelect: 'predictions',
  leaderboardSelect: 'predictions',
  predictionEntrySelect: 'prediction_entries',
};

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    'La verifica schema live richiede VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.',
  );
}

const baseUrl = supabaseUrl.replace(/\/+$/, '');

for (const name of selectNames) {
  const columns = selects[name].join(',');
  const url = new URL(`/rest/v1/${tables[name]}`, `${baseUrl}/`);
  url.searchParams.set('select', columns);
  url.searchParams.set('limit', '0');

  const response = await fetch(url, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Schema live non compatibile con ${name} (${tables[name]}): HTTP ${response.status} ${body}`,
    );
  }
}

console.log(
  `Schema live compatibile: ${selectNames.length} select UI verificate (${[
    ...new Set(Object.values(tables)),
  ].join(', ')}).`,
);