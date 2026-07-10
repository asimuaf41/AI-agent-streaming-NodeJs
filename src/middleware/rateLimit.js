import rateLimit from 'express-rate-limit';

const agentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 8,
  message: {
    type: 'error',
    message: 'You are sending messages too quickly. Please wait a moment.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export { agentLimiter };
