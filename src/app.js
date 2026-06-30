import express from 'express';
import { corsMiddleware, logCorsConfig } from './config/cors.js';
import { chatRouter } from './routes/chat.routes.js';

const app = express();

logCorsConfig();
app.use(corsMiddleware);
app.options(/.*/, corsMiddleware);
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api', chatRouter);

export { app };

