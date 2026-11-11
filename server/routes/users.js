import express from 'express'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { listUsers, updateUserRole, deleteUser, resetUserPassword } from '../controllers/userController.js'

const router = express.Router()

router.get('/', requireAuth, requireRole('admin'), listUsers)
router.patch('/:id/role', requireAuth, requireRole('admin'), updateUserRole)
router.post('/:id/reset-password', requireAuth, requireRole('admin'), resetUserPassword)
router.delete('/:id', requireAuth, requireRole('admin'), deleteUser)

export default router
