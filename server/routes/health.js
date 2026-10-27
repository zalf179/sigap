import express from 'express'
import { pool } from '../db/conn.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const conn = await pool.getConnection()
    await conn.ping()
    conn.release()
    res.json({ status: 'ok', db: 'connected' })
  } catch (e) {
    res.status(500).json({ status: 'error', db: 'disconnected', error: e.message })
  }
})

export default router
