import { createClient } from '@supabase/supabase-js';

// Supabase Auth must receive the project root URL, not the REST API path.
// Normalize accidental suffixes so Auth requests go to /auth/v1/* rather than
// /rest/v1/auth/v1/*.
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)
  ?.trim()
  .replace(/\/+$/, '')
  .replace(/\/(?:rest\/v1|auth\/v1)$/, '');
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error(
    'VITE_SUPABASE_URL is missing. Add it to the Replit environment variables.',
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    'VITE_SUPABASE_ANON_KEY is missing. Add it to the Replit environment variables.',
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);