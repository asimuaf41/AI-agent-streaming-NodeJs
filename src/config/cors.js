import cors from 'cors';

const LOCAL_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

function parseOrigins(value) {
  if (!value?.trim()) return [];
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function buildAllowedOrigins() {
  const fromEnv = [
    ...parseOrigins(process.env.CLIENT_ORIGIN),
    ...parseOrigins(process.env.CORS_ORIGINS)
  ];

  return [...new Set([...LOCAL_ORIGINS, ...fromEnv])];
}

const allowedOrigins = buildAllowedOrigins();

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  // Vercel production + preview deployments
  if (/^https:\/\/[\w-]+\.vercel\.app$/.test(origin)) return true;
  return false;
}

export const corsMiddleware = cors({
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }

    console.warn(`[cors] blocked origin: ${origin}`);
    callback(null, false);
  },
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Type'],
  credentials: false,
  maxAge: 86400
});

export function logCorsConfig() {
  console.log(
    `[cors] allowed origins: ${allowedOrigins.join(', ') || '(none — using vercel.app pattern + no-origin requests)'}`
  );
}
