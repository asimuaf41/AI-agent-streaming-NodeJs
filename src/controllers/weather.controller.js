import { streamWeatherChat } from '../services/weather.service.js';
import { endSse, initSse, sendSseData, sendSseError } from '../utils/sse.js';

export async function weatherStreamController(req, res) {
  initSse(req, res);

  const userMessage = req.body?.message;
  if (typeof userMessage !== 'string' || !userMessage.trim()) {
    sendSseError(res, new Error('Provide a non-empty "message" string'));
    return;
  }

  try {
    await streamWeatherChat(userMessage.trim(), (event) => sendSseData(res, event));
    endSse(res);
  } catch (error) {
    sendSseError(res, error);
  }
}
