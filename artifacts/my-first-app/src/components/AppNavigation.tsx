import { Flag, Settings, Target, Trophy, BarChart3, BookOpen, UserRound } from 'lucide-react';
import { type User } from '@supabase/supabase-js';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

const sections = [
  { path: '/pronostici', label: 'Pronostici', icon: Target, id: 'pronostici' },
  { path: '/risultati', label: 'Storico GP', icon: Flag, id: 'storico-gp' },
  { path: '/leghe', label: 'Lega', icon: Trophy, id: 'lega' },
  { path: '/statistiche', label: 'Statistiche', icon: BarChart3, id: 'statistiche' },
  { path: '/impostazioni', label: 'Impostazioni', icon: Settings, id: 'impostazioni' },
];

export function activeSection(location: string): string {
  if (location === '/home' || location === '/profilo' || location === '/miei-risultati' || location.startsWith('/pronostici')) return '/pronostici';
  if (location.startsWith('/risultati')) return '/risultati';
  if (location.startsWith('/leghe')) return '/leghe';
  if (location.startsWith('/statistiche')) return '/statistiche';
  if (location.startsWith('/impostazioni')) return '/impostazioni';
  return '';
}

export function AppNavigation({ location, navigate, user }: { location: string; navigate: (path: string) => void; user?: User | null }) {
  const active = activeSection(location);
  const profile = useQuery({
    queryKey: ['profile-name', user?.id],
    enabled: Boolean(user),
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('name').eq('user_id', user!.id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const colors: Record<string, string> = { racing: '#cc302b', cool: '#246568', gold: '#89661c' };
  const color = colors[String(user?.user_metadata?.paddock_style)] ?? colors.racing;
  return (
    <>
      <header className="welcome-nav app-header">
        <button type="button" className="brand-lockup brand-button" data-testid="text-brand" onClick={() => navigate('/pronostici')}>
          <span className="brand-mark" aria-hidden="true">FM</span>
          <span>FANTA <b>MOTOGP</b></span>
        </button>
        <nav className="desktop-nav" aria-label="Navigazione principale">
          {sections.map(({ path, label, icon: Icon, id }) => {
            const on = active === path;
            return (
              <button key={path} type="button" className={`desktop-nav-item${on ? ' is-active' : ''}`} data-testid={`nav-${id}`} aria-current={on ? 'page' : undefined} onClick={() => navigate(path)}>
                <Icon size={16} strokeWidth={on ? 2.5 : 2} aria-hidden="true" />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>
        <div className="header-tools"><button type="button" className="rules-link" data-testid="link-regolamento" aria-label="Regolamento" aria-current={location === '/regolamento' ? 'page' : undefined} onClick={() => navigate('/regolamento')}>
          <BookOpen size={15} aria-hidden="true" /><span>Regolamento</span>
        </button>
        {user && <button type="button" className="profile-avatar header-avatar" style={{ background: color }} aria-label="Il tuo profilo e le impostazioni" onClick={() => navigate('/impostazioni')}>{profile.data?.name ? profile.data.name.slice(0, 2).toUpperCase() : <UserRound size={17} aria-hidden="true" />}</button>}</div>
      </header>
      <nav className="bottom-nav" aria-label="Navigazione rapida" data-testid="bottom-navigation">
        {sections.map(({ path, label, icon: Icon, id }) => {
          const on = active === path;
          return (
            <button key={path} type="button" className={`bottom-nav-item${on ? ' is-active' : ''}`} data-testid={`bottom-nav-${id}`} aria-current={on ? 'page' : undefined} onClick={() => navigate(path)}>
              <Icon size={20} strokeWidth={on ? 2.6 : 2} aria-hidden="true" />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
