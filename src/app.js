import express from 'express';
import cors from 'cors';
import { chatRouter } from './routes/chat.routes.js';

const app = express();

app.use(cors());
app.options("*", cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});
console.log("Backend version: 2");
app.use('/api', chatRouter);

export { app };
