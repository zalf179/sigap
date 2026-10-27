import express from 'express'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { uploadArticle } from '../middleware/uploadArticle.js'
import {
  publicListArticles,
  publicGetArticle,
  adminListArticles,
  createArticle,
  updateArticle,
  deleteArticle
} from '../controllers/articleController.js'

const router = express.Router()

router.get('/public', publicListArticles)
router.get('/public/:slug', publicGetArticle)
router.get('/admin', requireAuth, requireRole('admin'), adminListArticles)
router.post('/', requireAuth, requireRole('admin'), uploadArticle.single('cover'), createArticle)
router.put('/:id', requireAuth, requireRole('admin'), uploadArticle.single('cover'), updateArticle)
router.delete('/:id', requireAuth, requireRole('admin'), deleteArticle)

export default router
