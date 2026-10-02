// Isolated, temporary account for browser verification. Never prints credentials.
import { randomBytes } from 'node:crypto';
import { readFile, writeFile, unlink } from 'node:fs/promises';
import { createRequire } from 'node:module';
const require = createRequire(new URL('../artifacts/my-first-app/package.json', import.meta.url));
const { createClient } = require('@supabase/supabase-js');
const url = process.env.VITE_SUPABASE_URL;
const admin = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const accessPath = '/tmp/fantagp-redesign-test-access.json';
function requireOk(result, label) { if (result.error) throw new Error(`${label}: ${result.error.message}`); return result.data; }

if (process.argv[2] === 'cleanup') {
  const fixture = JSON.parse(await readFile(accessPath, 'utf8'));
  if (fixture.leagueId) {
    const rows = requireOk(await admin.from('predictions').select('id').eq('league_id', fixture.leagueId).eq('user_id', fixture.userId), 'fixture predictions');
    if (rows.length) requireOk(await admin.from('prediction_entries').delete().in('prediction_id', rows.map(row => row.id)), 'fixture entries');
    requireOk(await admin.from('predictions').delete().eq('league_id', fixture.leagueId).eq('user_id', fixture.userId), 'fixture predictions delete');
    requireOk(await admin.from('league_members').delete().eq('league_id', fixture.leagueId).eq('user_id', fixture.userId), 'fixture membership');
    requireOk(await admin.from('leagues').delete().eq('id', fixture.leagueId), 'fixture league');
  }
  requireOk(await admin.from('profiles').delete().eq('user_id', fixture.userId), 'fixture profile');
  requireOk(await admin.auth.admin.deleteUser(fixture.userId), 'fixture auth user');
  await unlink(accessPath);
  console.log('Temporary test resources removed.');
} else {
  const suffix = randomBytes(10).toString('hex');
  const email = `ui-redesign-${suffix}@example.invalid`;
  const password = `${randomBytes(18).toString('base64url')}aA9!`;
  const created = requireOk(await admin.auth.admin.createUser({ email, password, email_confirm: true }), 'create test user');
  const fixture = { email, password, userId: created.user.id, leagueId: null };
  await writeFile(accessPath, JSON.stringify(fixture), { mode: 0o600 });
  const profile = requireOk(await admin.from('profiles').select('id').eq('user_id', fixture.userId).maybeSingle(), 'test profile');
  if (!profile) requireOk(await admin.from('profiles').insert({ user_id: fixture.userId, name: 'Verifica paddock' }), 'create test profile');
  else requireOk(await admin.from('profiles').update({ name: 'Verifica paddock' }).eq('user_id', fixture.userId), 'update test profile');
  const client = createClient(url, process.env.VITE_SUPABASE_ANON_KEY, { auth: { persistSession: false } });
  requireOk(await client.auth.signInWithPassword({ email, password }), 'sign in test user');
  const inviteCode = `UI${randomBytes(5).toString('hex').toUpperCase()}`;
  requireOk(await client.rpc('create_league', { p_name: `Verifica UI ${suffix.slice(0, 6)}`, p_invite_code: inviteCode }), 'create isolated test league');
  const league = requireOk(await client.from('leagues').select('id').eq('invite_code', inviteCode).single(), 'load isolated test league');
  fixture.leagueId = league.id;
  await writeFile(accessPath, JSON.stringify(fixture), { mode: 0o600 });
  await client.auth.signOut();
  console.log(`Temporary isolated test account prepared. Private access file: ${accessPath}`);
}