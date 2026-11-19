import express from 'express'
import { register, login, me } from '../controllers/authController.js'
import { requireAuth } from '../middleware/auth.js'
import { loginLimiter, registerLimiter } from '../middleware/rateLimiters.js'

const router = express.Router()

router.post('/register', registerLimiter, register)
router.post('/login', loginLimiter, login)
router.get('/me', requireAuth, me)

export default router
