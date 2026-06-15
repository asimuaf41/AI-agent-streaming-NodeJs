import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

export const supabase = env.supabaseUrl && env.supabaseKey
  ? createClient(env.supabaseUrl, env.supabaseKey)
  : null;

export function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Set SUPABASE_URL and SUPABASE_KEY.');
  }
  return supabase;
}
