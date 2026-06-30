import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseKey = serviceRoleKey || env.supabaseKey;

export const usingServiceRole = Boolean(serviceRoleKey);

export const supabase =
  env.supabaseUrl && supabaseKey
    ? createClient(env.supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      })
    : null;

if (supabase) {
  console.log(
    `[supabase] client ready (${usingServiceRole ? 'service_role key' : 'publishable key'})`
  );
}

export function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }
  return supabase;
}
