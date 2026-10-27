import { query } from '../db/conn.js'

export async function listAllReports(req, res, next) {
  try {
    const { status, block_id, search } = req.query
    let sql = `SELECT r.id, r.ticket_number, r.landmark, r.status, r.created_at, r.processed_at, r.completed_at,
                      r.photo_path, r.proof_photo_path, r.user_id,
                      b.id as block_id, b.name as block_name, c.name as category_name, c.id as category_id,
                      u.name as reporter_name
               FROM reports r
               JOIN blocks b ON b.id = r.block_id
               JOIN waste_categories c ON c.id = r.category_id
               JOIN users u ON u.id = r.user_id
               WHERE 1=1`
    const params = []
    if (status) {
      sql += ' AND r.status = ?'
      params.push(status)
    }
    if (block_id) {
      sql += ' AND r.block_id = ?'
      params.push(block_id)
    }
    if (search) {
      sql += ' AND (r.ticket_number LIKE ? OR u.name LIKE ?)'
      params.push(`%${search}%`, `%${search}%`)
    }
    sql += ' ORDER BY (r.status = "Menunggu") DESC, r.created_at DESC'
    const reports = await query(sql, params)
    res.json({ reports })
  } catch (e) {
    next(e)
  }
}

export async function processReport(req, res, next) {
  try {
    const { id } = req.params
    const reports = await query('SELECT id, status FROM reports WHERE id = ?', [id])
    if (reports.length === 0) {
      return res.status(404).json({ error: 'Laporan tidak ditemukan' })
    }
    if (reports[0].status !== 'Menunggu') {
      return res.status(400).json({ error: 'Hanya laporan berstatus Menunggu yang bisa diproses' })
    }
    await query(
      'UPDATE reports SET status = ?, handled_by = ?, processed_at = NOW() WHERE id = ?',
      ['Sedang Diproses', req.user.id, id]
    )
    res.json({ message: 'Laporan diproses' })
  } catch (e) {
    next(e)
  }
}

export async function completeReport(req, res, next) {
  try {
    const { id } = req.params
    if (!req.file) {
      return res.status(400).json({ error: 'Foto bukti wajib diunggah untuk menyelesaikan laporan' })
    }
    const reports = await query('SELECT id, status FROM reports WHERE id = ?', [id])
    if (reports.length === 0) {
      return res.status(404).json({ error: 'Laporan tidak ditemukan' })
    }
    if (reports[0].status !== 'Sedang Diproses') {
      return res.status(400).json({ error: 'Hanya laporan berstatus Sedang Diproses yang bisa diselesaikan' })
    }
    const proof_photo_path = `/uploads/${req.file.filename}`
    await query(
      'UPDATE reports SET status = ?, completed_at = NOW(), proof_photo_path = ? WHERE id = ?',
      ['Selesai', proof_photo_path, id]
    )
    res.json({ message: 'Laporan selesai' })
  } catch (e) {
    next(e)
  }
}
