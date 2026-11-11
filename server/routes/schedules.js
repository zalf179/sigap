import express from 'express'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { publicMySchedule, adminListSchedules, createSchedule, updateSchedule, deleteSchedule } from '../controllers/scheduleController.js'

const router = express.Router()

router.get('/mine', requireAuth, requireRole('warga'), publicMySchedule)
router.get('/admin', requireAuth, requireRole('admin', 'petugas'), adminListSchedules)
router.post('/', requireAuth, requireRole('admin'), createSchedule)
router.put('/:id', requireAuth, requireRole('admin'), updateSchedule)
router.delete('/:id', requireAuth, requireRole('admin'), deleteSchedule)

export default router
