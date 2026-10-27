import { query } from '../db/conn.js'

export async function listBlocks(req, res, next) {
  try {
    const blocks = await query('SELECT id, name FROM blocks ORDER BY id ASC')
    res.json({ blocks })
  } catch (e) {
    next(e)
  }
}
