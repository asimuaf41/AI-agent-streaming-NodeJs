import { WEB_SEARCH_SYSTEM_PROMPT } from '../prompts/webSearchPrompt.js';
import { webSearchTools } from '../tools/webSearch/definitions.js';
import { runWebSearchTool } from '../tools/webSearch/handlers.js';
import { streamAgentWithTools } from '../utils/agentLoop.js';

export async function streamWebSearchChat(messages, onEvent) {
  await streamAgentWithTools({
    system: WEB_SEARCH_SYSTEM_PROMPT,
    tools: webSearchTools,
    messages,
    runTool: runWebSearchTool,
    onEvent,
    maxTokens: 4096
  });
}
