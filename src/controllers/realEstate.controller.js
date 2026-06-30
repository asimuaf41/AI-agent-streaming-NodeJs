import { deleteDocument, listDocuments } from '../services/rag.service.js';
import {
  seedAtlantaProperties,
  streamRealEstateChat
} from '../services/realEstate.service.js';
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

export async function realEstateStreamController(req, res) {
  initSse(req, res);

  const messages = normalizeMessages(req.body);
  if (!messages || messages.length === 0) {
    sendSseError(
      res,
      new Error('Provide a "messages" array or a "message" string.')
    );
    return;
  }

  try {
    await streamRealEstateChat(messages, (event) => sendSseData(res, event));
    endSse(res);
  } catch (error) {
    sendSseError(res, error);
  }
}

export async function realEstateSeedController(req, res) {
  try {
    const force = req.query?.force === 'true' || req.body?.force === true;
    const result = await seedAtlantaProperties({ force });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getRealEstateDocumentsController(_req, res) {
  try {
    const documents = await listDocuments();
    res.json({
      total: documents.length,
      documents
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function deleteRealEstateDocumentController(req, res) {
  try {
    const sourceFile = decodeURIComponent(req.params.sourceFile ?? '');

    if (!sourceFile) {
      res.status(400).json({ error: 'sourceFile is required' });
      return;
    }

    await deleteDocument(sourceFile);
    res.json({ success: true, sourceFile });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
