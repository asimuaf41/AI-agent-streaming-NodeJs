import { env } from '../config/env.js';
import { deleteMemory, getAllMemories } from '../services/memory.service.js';
import { streamWebSearchChat } from '../services/webSearch.service.js';
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

export async function webSearchStreamController(req, res) {
  initSse(req, res);

  const messages = normalizeMessages(req.body);
  if (!messages) {
    sendSseError(res, new Error('Provide "messages" array or single "message" string'));
    return;
  }

  try {
    await streamWebSearchChat(messages, resolveUserId(req), (event) =>
      sendSseData(res, event)
    );
    endSse(res);
  } catch (error) {
    sendSseError(res, error);
  }
}

export async function getMemoriesController(req, res) {
  try {
    const userId = resolveUserId(req);
    const memories = await getAllMemories(userId);

    res.json({
      userId,
      total: memories.length,
      memories: memories.map((memory) => ({
        id: memory.id,
        content: memory.content,
        category: memory.metadata?.category ?? 'research',
        date: memory.created_at
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function deleteMemoryController(req, res) {
  try {
    const userId = resolveUserId(req);
    const memoryId = Number(req.params.id);

    if (!Number.isFinite(memoryId)) {
      res.status(400).json({ error: 'Invalid memory id' });
      return;
    }

    await deleteMemory(userId, memoryId);
    res.json({ success: true, id: memoryId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
