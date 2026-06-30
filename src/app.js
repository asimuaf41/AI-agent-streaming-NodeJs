import express from 'express';
import cors from 'cors';
import { chatRouter } from './routes/chat.routes.js';

const app = express();

// Manual CORS headers on every response (including 404)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  next();
});

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'ai-agent-backend' });
});

app.use('/api', chatRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

export { app };
