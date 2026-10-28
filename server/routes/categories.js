import express from 'express'
import { query } from '../db/conn.js'

const router = express.Router()

router.get('/', async (req, res, next) => {
  try {
    const categories = await query('SELECT id, name, description, handling_instruction FROM waste_categories ORDER BY id ASC')
    res.json({ categories })
  } catch (e) {
    next(e)
  }
})

export default router
