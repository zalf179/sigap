import express from 'express'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { getStats } from '../controllers/statsController.js'

const router = express.Router()

router.get('/', requireAuth, requireRole('admin'), getStats)

export default router
