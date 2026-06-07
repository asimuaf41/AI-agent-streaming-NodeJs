import * as dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT) || 3001,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  weatherApiKey: process.env.WEATHER_API_KEY
};

if (!env.anthropicApiKey) {
  throw new Error('ANTHROPIC_API_KEY is required');
}
