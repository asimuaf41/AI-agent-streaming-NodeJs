import { anthropicClient } from '../config/anthropic.js';

const DEFAULT_MODEL = 'claude-haiku-4-5-20251001';

function chunkText(text, chunkSize = 40) {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}

export async function streamAgentWithTools({
  system,
  tools,
  messages,
  runTool,
  onEvent,
  model = DEFAULT_MODEL,
  maxTokens = 600
}) {
  const conversation = [...messages];

  while (true) {
    const response = await anthropicClient.messages.create({
      model,
      max_tokens: maxTokens,
      system,
      tools,
      messages: conversation
    });

    if (response.stop_reason === 'end_turn') {
      const finalText = response.content
        .filter((block) => block.type === 'text')
        .map((block) => block.text)
        .join('');

      for (const textChunk of chunkText(finalText)) {
        onEvent({ text: textChunk });
      }
      return;
    }

    if (response.stop_reason === 'tool_use') {
      conversation.push({ role: 'assistant', content: response.content });

      const toolResults = [];
      for (const block of response.content.filter((b) => b.type === 'tool_use')) {
        onEvent({
          type: 'tool_use',
          tool: block.name,
          input: block.input
        });

        const result = await runTool(block.name, block.input);

        onEvent({
          type: 'tool_result',
          tool: block.name,
          result
        });

        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: JSON.stringify(result)
        });
      }

      conversation.push({ role: 'user', content: toolResults });
    }
  }
}
