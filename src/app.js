import express from 'express';
import cors from 'cors';
import { chatRouter } from './routes/chat.routes.js';

const app = express();

const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
  : '*';  // change true to '*' — more reliable

const corsConfig = {
  origin: corsOrigins,
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false  // set to false when using '*'
};

// Handle preflight requests for ALL routes — this line is critical
app.options('*', cors(corsConfig));

// Then apply to all other requests
app.use(cors(corsConfig));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api', chatRouter);

export { app };
