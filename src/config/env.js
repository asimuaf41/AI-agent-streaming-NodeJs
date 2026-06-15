import * as dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT) || 3001,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  weatherApiKey: process.env.WEATHER_API_KEY,
  tavilyApiKey: process.env.TAVILY_API_KEY,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey:
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY,
  defaultUserId: process.env.DEFAULT_USER_ID || 'asim-ali-001'
};

if (!env.anthropicApiKey) {
  throw new Error('ANTHROPIC_API_KEY is required');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_KEY) {
  console.warn(
    '[memory] Using SUPABASE_KEY (publishable). Memory writes require RLS policies. ' +
      'Run data/supabase-memories-rls.sql or set SUPABASE_SERVICE_ROLE_KEY.'
  );
}
