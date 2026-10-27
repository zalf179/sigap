import express from 'express'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { exportReports } from '../controllers/exportController.js'

const router = express.Router()

router.get('/', requireAuth, requireRole('admin'), exportReports)

export default router
