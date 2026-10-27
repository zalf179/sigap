import express from 'express'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { uploadIdentify } from '../middleware/upload.js'
import { validateImageSignature } from '../middleware/validateImageSignature.js'
import { identifyWaste } from '../controllers/identifyController.js'

const router = express.Router()

router.post('/', requireAuth, requireRole('warga'), uploadIdentify.single('image'), validateImageSignature, identifyWaste)

export default router
