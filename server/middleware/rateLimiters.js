import { rateLimit } from 'express-rate-limit'

const fifteenMinutes = 15 * 60 * 1000
const tooManyRequests = { error: 'Terlalu banyak permintaan. Coba lagi nanti.' }

export const apiLimiter = rateLimit({
  windowMs: fifteenMinutes,
  limit: 300,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: tooManyRequests
})

export const loginLimiter = rateLimit({
  windowMs: fifteenMinutes,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: tooManyRequests
})

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: tooManyRequests
})
