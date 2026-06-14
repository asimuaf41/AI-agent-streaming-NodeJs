import { streamWebSearchChat } from '../services/webSearch.service.js';
import { endSse, initSse, sendSseData, sendSseError } from '../utils/sse.js';

function normalizeMessages(payload) {
  if (Array.isArray(payload?.messages) && payload.messages.length > 0) {
    return payload.messages;
  }

  if (typeof payload?.message === 'string' && payload.message.trim()) {
    return [{ role: 'user', content: payload.message.trim() }];
  }

  return null;
}

export async function webSearchStreamController(req, res) {
  initSse(res);

  const messages = normalizeMessages(req.body);
  if (!messages) {
    sendSseError(res, new Error('Provide "messages" array or single "message" string'));
    return;
  }

  try {
    await streamWebSearchChat(messages, (event) => sendSseData(res, event));
    endSse(res);
  } catch (error) {
    sendSseError(res, error);
  }
}
