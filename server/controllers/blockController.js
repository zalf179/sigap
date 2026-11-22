import { query } from '../db/conn.js'

export async function listBlocks(req, res, next) {
  try {
    const blocks = await query('SELECT id_blok AS id, nama_blok AS name FROM blok ORDER BY id_blok ASC')
    res.json({ blocks })
  } catch (e) {
    next(e)
  }
}
