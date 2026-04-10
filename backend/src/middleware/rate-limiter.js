const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    data: null,
    message: 'Too many attempts. Try again in 15 minutes.',
    error: 'RATE_LIMIT_EXCEEDED',
    details: null
  },
  standardHeaders: true,
  legacyHeaders: false
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    data: null,
    message: 'Upload limit reached. Try again in 1 hour.',
    error: 'RATE_LIMIT_EXCEEDED',
    details: null
  },
  standardHeaders: true,
  legacyHeaders: false
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    data: null,
    message: 'Too many requests. Try again in 15 minutes.',
    error: 'RATE_LIMIT_EXCEEDED',
    details: null
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = { authLimiter, uploadLimiter, generalLimiter };
