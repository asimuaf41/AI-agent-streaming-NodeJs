import { streamSimpleChat, streamToolChat } from '../services/chat.service.js';
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

export async function chatStreamController(req, res) {
  initSse(res);

  const messages = normalizeMessages(req.body);
  if (!messages) {
    sendSseError(res, new Error('Provide "messages" array or single "message" string'));
    return;
  }

  try {
    await streamSimpleChat(messages, (event) => sendSseData(res, event));
    endSse(res);
  } catch (error) {
    sendSseError(res, error);
  }
}

export async function chatToolStreamController(req, res) {
  initSse(res);

  const userMessage = req.body?.message;
  if (typeof userMessage !== 'string' || !userMessage.trim()) {
    sendSseError(res, new Error('Provide a non-empty "message" string'));
    return;
  }

  try {
    await streamToolChat(userMessage.trim(), (event) => sendSseData(res, event));
    endSse(res);
  } catch (error) {
    sendSseError(res, error);
  }
}
