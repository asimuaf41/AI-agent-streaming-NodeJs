import Anthropic from '@anthropic-ai/sdk';
import { env } from './env.js';

export const anthropicClient = new Anthropic({
  apiKey: env.anthropicApiKey
});
