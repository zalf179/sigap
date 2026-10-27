import express from 'express'
import { listBlocks } from '../controllers/blockController.js'

const router = express.Router()

router.get('/', listBlocks)

export default router
