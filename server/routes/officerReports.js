import express from 'express'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { uploadProof } from '../middleware/uploadProof.js'
import { validateImageSignature } from '../middleware/validateImageSignature.js'
import { listAllReports, processReport, completeReport } from '../controllers/officerReportController.js'

const router = express.Router()

router.get('/', requireAuth, requireRole('petugas', 'admin'), listAllReports)
router.patch('/:id/process', requireAuth, requireRole('petugas'), processReport)
router.patch('/:id/complete', requireAuth, requireRole('petugas'), uploadProof.single('proof'), validateImageSignature, completeReport)

export default router
