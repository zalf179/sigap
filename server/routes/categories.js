import express from 'express'
import { query } from '../db/conn.js'

const router = express.Router()

router.get('/', async (req, res, next) => {
  try {
    const categories = await query('SELECT id_kategori AS id, nama_kategori AS name, deskripsi AS description, panduan_penanganan AS handling_instruction FROM kategori_sampah ORDER BY id_kategori ASC')
    res.json({ categories })
  } catch (e) {
    next(e)
  }
})

export default router
