import express from 'express'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { uploadReport } from '../middleware/uploadReport.js'
import { validateImageSignature } from '../middleware/validateImageSignature.js'
import { createReport, myReports, getReportDetail } from '../controllers/reportController.js'

const router = express.Router()

router.post('/', requireAuth, requireRole('warga'), uploadReport.single('photo'), validateImageSignature, createReport)
router.get('/mine', requireAuth, requireRole('warga'), myReports)
router.get('/:id', requireAuth, getReportDetail)

export default router
