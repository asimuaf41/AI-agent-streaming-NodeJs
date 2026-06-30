export function initSse(req, res) {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();
}

export function sendSseData(res, payload) {
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

export function endSse(res) {
  sendSseData(res, { done: true });
  res.end();
}

export function sendSseError(res, error) {
  sendSseData(res, { error: error?.message || 'Unknown error' });
  res.end();
}
