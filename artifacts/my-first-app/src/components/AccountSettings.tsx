import { type User } from '@supabase/supabase-js';
import { useEffect, useState, type FormEvent } from 'react';
import { BookOpen, Check, Flag, LogOut, ShieldCheck, UserRound } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';

const profileStyles = [
  { id: 'racing', label: 'Sempre a gas', color: '#cc302b' },
  { id: 'cool', label: 'Sangue freddo', color: '#246568' },
  { id: 'gold', label: 'Voglia di podio', color: '#89661c' },
] as const;

function Feedback({ error, message }: { error?: string | null; message?: string | null }) {
  return <>{error && <p role="alert" className="settings-error">{error}</p>}{message && <p role="status" className="settings-success"><Check size={16} aria-hidden="true" /> {message}</p>}</>;
}

export function AccountSettings({ user, navigate }: { user: User; navigate: (path: string) => void }) {
  const queryClient = useQueryClient();
  const [profileId, setProfileId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [savedName, setSavedName] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [nameBusy, setNameBusy] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [nameMessage, setNameMessage] = useState<string | null>(null);
  const initialStyle = profileStyles.some(style => style.id === user.user_metadata?.paddock_style)
    ? String(user.user_metadata.paddock_style) : 'racing';
  const [styleId, setStyleId] = useState(initialStyle);
  const [styleBusy, setStyleBusy] = useState(false);
  const [styleError, setStyleError] = useState<string | null>(null);
  const [styleMessage, setStyleMessage] = useState<string | null>(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [logoutBusy, setLogoutBusy] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let live = true;
    setLoading(true);
    setLoadError(null);
    void supabase.from('profiles').select('id, name').eq('user_id', user.id).maybeSingle().then(({ data, error }) => {
      if (!live) return;
      if (error) setLoadError('Il profilo non risponde. Riprova tra poco.');
      else {
        setProfileId(data?.id ?? null);
        setName(data?.name ?? '');
        setSavedName(data?.name ?? '');
      }
      setLoading(false);
    });
    return () => { live = false; };
  }, [user.id, reload]);

  async function saveName(event: FormEvent) {
    event.preventDefault();
    setNameError(null); setNameMessage(null);
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length > 60) {
      setNameError('Scegli un nome da 1 a 60 caratteri. Anche i soprannomi valgono.'); return;
    }
    if (!profileId) { setNameError('Profilo non disponibile per questo account.'); return; }
    setNameBusy(true);
    try {
      const { data, error } = await supabase.from('profiles').update({ name: trimmedName })
        .eq('id', profileId).eq('user_id', user.id).select('id, name').maybeSingle();
      if (error || !data) throw new Error('Nome non salvato. Controlla la connessione e riprova.');
      setName(data.name ?? trimmedName); setSavedName(data.name ?? trimmedName);
      await queryClient.invalidateQueries({ queryKey: ['profile-name', user.id] });
      setNameMessage('Nome salvato. Adesso possono chiamarti dal podio.');
    } catch (error) { setNameError(error instanceof Error ? error.message : 'Non è stato possibile salvare il nome.'); }
    finally { setNameBusy(false); }
  }

  async function saveStyle(event: FormEvent) {
    event.preventDefault();
    setStyleError(null); setStyleMessage(null); setStyleBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ data: { paddock_style: styleId } });
      if (error) throw new Error('Livrea non salvata. Riprova tra poco.');
      setStyleMessage('Livrea salvata. La riconosci anche dopo il prossimo accesso.');
    } catch (error) { setStyleError(error instanceof Error ? error.message : 'Non è stato possibile salvare la livrea.'); }
    finally { setStyleBusy(false); }
  }

  async function savePassword(event: FormEvent) {
    event.preventDefault();
    setPasswordError(null); setPasswordMessage(null);
    if (newPassword.length < 8) { setPasswordError('La nuova password deve avere almeno 8 caratteri.'); return; }
    if (newPassword !== confirmPassword) { setPasswordError('Le due nuove password non coincidono.'); return; }
    if (newPassword === oldPassword) { setPasswordError('Scegli una password diversa da quella attuale.'); return; }
    if (!user.email) { setPasswordError('Questo account non ha un indirizzo email verificabile.'); return; }
    setPasswordBusy(true);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email: user.email, password: oldPassword });
      if (authError || data.user?.id !== user.id) throw new Error('Password attuale non corretta oppure accesso da verificare.');
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw new Error('Password non aggiornata. Verifica i requisiti di sicurezza del tuo account e riprova.');
      setOldPassword(''); setNewPassword(''); setConfirmPassword('');
      setPasswordMessage('Password aggiornata. Questa teniamola fuori dalla chat di lega.');
    } catch (error) { setPasswordError(error instanceof Error ? error.message : 'Non è stato possibile aggiornare la password.'); }
    finally { setPasswordBusy(false); }
  }

  async function logout() {
    setLogoutBusy(true); setLogoutError(null);
    const { error } = await supabase.auth.signOut();
    if (error) { setLogoutError('Non è stato possibile uscire. Riprova.'); setLogoutBusy(false); }
    else navigate('/auth');
  }

  const style = profileStyles.find(item => item.id === styleId) ?? profileStyles[0];
  return <div className="settings-grid">
    <section className="settings-card" aria-labelledby="settings-identity-title">
      <div className="section-intro"><UserRound size={20} aria-hidden="true" /><div><h2 id="settings-identity-title">Come ti chiama il paddock?</h2><p>Il nome che gli amici vedono nelle classifiche.</p></div></div>
      {loading ? <p role="status">Caricamento del profilo…</p> : loadError ? <><Feedback error={loadError} /><button type="button" className="task21-button task21-button--secondary" onClick={() => setReload(value => value + 1)}>Riprova</button></> :
        <form onSubmit={saveName}>
          <label className="settings-field" htmlFor="profile-name"><span>Nome o soprannome</span><input id="profile-name" name="name" autoComplete="nickname" maxLength={60} required value={name} onChange={event => { setName(event.target.value); setNameMessage(null); }} disabled={nameBusy || !profileId} placeholder="Il tuo nome da griglia" /></label>
          {!profileId && <p role="alert">Nessun profilo associato a questo account. Il nome non può essere modificato.</p>}
          <button type="submit" className="task21-button" disabled={nameBusy || !profileId}>{nameBusy ? 'Salvataggio…' : 'Salva nome'}</button>
          <Feedback error={nameError} message={nameMessage} />
        </form>}
    </section>
    <section className="settings-card" aria-labelledby="settings-style-title">
      <div className="section-intro"><Flag size={20} aria-hidden="true" /><div><h2 id="settings-style-title">Scegli la tua livrea</h2><p>Non dà punti. Ma fa scena.</p></div></div>
      <form onSubmit={saveStyle}>
        <div className="profile-preview" style={{ borderColor: style.color }}>
          <span className="profile-avatar" style={{ background: style.color }}>{(savedName || name || 'P').slice(0, 2).toUpperCase()}</span>
          <div><strong>{savedName || 'Il tuo profilo'}</strong><p>{style.label}</p></div>
        </div>
        <div className="avatar-choice" aria-label="Livrea del profilo">{profileStyles.map(item => <button type="button" className={styleId === item.id ? 'is-active' : ''} key={item.id} aria-pressed={styleId === item.id} disabled={styleBusy} onClick={() => { setStyleId(item.id); setStyleMessage(null); }}><span style={{ background: item.color }} aria-hidden="true" />{item.label}</button>)}</div>
        <button className="task21-button" type="submit" disabled={styleBusy}>{styleBusy ? 'Salvataggio…' : 'Salva livrea'}</button>
        <Feedback error={styleError} message={styleMessage} />
      </form>
    </section>
    <section className="settings-card" aria-labelledby="settings-password-title">
      <div className="section-intro"><ShieldCheck size={20} aria-hidden="true" /><div><h2 id="settings-password-title">Tieni al sicuro il box</h2><p>La password non è un pronostico: niente tentativi a caso.</p></div></div>
      <form onSubmit={savePassword}>
        <label className="settings-field" htmlFor="current-password"><span>Password attuale</span><input id="current-password" type="password" autoComplete="current-password" required value={oldPassword} onChange={event => setOldPassword(event.target.value)} disabled={passwordBusy} /></label>
        <label className="settings-field" htmlFor="new-password"><span>Nuova password</span><input id="new-password" type="password" autoComplete="new-password" minLength={8} required value={newPassword} onChange={event => setNewPassword(event.target.value)} disabled={passwordBusy} /></label>
        <label className="settings-field" htmlFor="confirm-password"><span>Ripeti la nuova password</span><input id="confirm-password" type="password" autoComplete="new-password" minLength={8} required value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} disabled={passwordBusy} /></label>
        <small>Almeno 8 caratteri. Usa una password unica per questo account.</small>
        <button className="task21-button" type="submit" disabled={passwordBusy}>{passwordBusy ? 'Aggiornamento…' : 'Aggiorna password'}</button>
        <Feedback error={passwordError} message={passwordMessage} />
      </form>
    </section>
    <section className="settings-card" aria-label="Accesso e regole">
      <h2>Prima di tornare in pista</h2>
      <button type="button" className="task21-button task21-button--secondary" onClick={() => navigate('/regolamento')}><BookOpen size={17} aria-hidden="true" /> Regolamento</button>
      <button type="button" className="task21-button task21-button--secondary" onClick={() => void logout()} disabled={logoutBusy}><LogOut size={17} aria-hidden="true" />{logoutBusy ? 'Uscita…' : 'Esci dal tuo account'}</button>
      <Feedback error={logoutError} />
    </section>
  </div>;
}