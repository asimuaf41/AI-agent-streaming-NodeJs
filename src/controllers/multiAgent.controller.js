import { env } from '../config/env.js';
import { runMultiAgentWorkflow } from '../services/multiAgent.service.js';
import { sanitizeChatMessages } from '../utils/sanitizeMessages.js';
import { endSse, initSse, sendSseData, sendSseError } from '../utils/sse.js';

function normalizeMessages(payload) {
  if (Array.isArray(payload?.messages) && payload.messages.length > 0) {
    return sanitizeChatMessages(payload.messages);
  }

  if (typeof payload?.message === 'string' && payload.message.trim()) {
    return [{ role: 'user', content: payload.message.trim() }];
  }

  return null;
}

function resolveUserId(req) {
  return req.body?.userId || req.query?.userId || env.defaultUserId;
}

export async function multiAgentStreamController(req, res) {
  initSse(res);

  const messages = normalizeMessages(req.body);
  if (!messages) {
    sendSseError(
      res,
      new Error('Provide a "messages" array or a "message" string.')
    );
    return;
  }

  try {
    await runMultiAgentWorkflow(messages, resolveUserId(req), (event) =>
      sendSseData(res, event)
    );
    endSse(res);
  } catch (error) {
    sendSseError(res, error);
  }
}
