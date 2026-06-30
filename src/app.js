import express from 'express';
import cors from 'cors';
import { chatRouter } from './routes/chat.routes.js';

const app = express();

// CORS must be first — before body parser and routes
app.use(cors());
app.options(/.*/, cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api', chatRouter);

export { app };
