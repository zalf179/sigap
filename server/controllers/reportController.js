import { query } from '../db/conn.js'

function generateTicket() {
  const now = new Date()
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `SGP-${dateStr}-${rand}`
}

export async function createReport(req, res, next) {
  try {
    const { block_id, landmark, category_id } = req.body
    if (!block_id || !landmark || !category_id) {
      return res.status(400).json({ error: 'Semua field wajib diisi' })
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Foto laporan wajib diunggah' })
    }
    const ticket_number = generateTicket()
    const photo_path = `/uploads/${req.file.filename}`
    await query(
      'INSERT INTO reports (ticket_number, user_id, block_id, landmark, category_id, photo_path, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [ticket_number, req.user.id, block_id, landmark, category_id, photo_path, 'Menunggu']
    )
    res.status(201).json({ ticket_number, message: 'Laporan berhasil dibuat' })
  } catch (e) {
    next(e)
  }
}

export async function myReports(req, res, next) {
  try {
    const reports = await query(
      `SELECT r.id, r.ticket_number, r.landmark, r.status, r.created_at, r.photo_path, r.proof_photo_path,
              b.name as block_name, c.name as category_name
       FROM reports r
       JOIN blocks b ON b.id = r.block_id
       JOIN waste_categories c ON c.id = r.category_id
       WHERE r.user_id = ?
       ORDER BY r.created_at DESC`,
      [req.user.id]
    )
    res.json({ reports })
  } catch (e) {
    next(e)
  }
}

export async function getReportDetail(req, res, next) {
  try {
    const { id } = req.params
    const reports = await query(
      `SELECT r.id, r.ticket_number, r.landmark, r.status, r.created_at, r.processed_at, r.completed_at,
              r.photo_path, r.proof_photo_path, r.user_id,
              b.name as block_name, c.name as category_name, c.handling_instruction
       FROM reports r
       JOIN blocks b ON b.id = r.block_id
       JOIN waste_categories c ON c.id = r.category_id
       WHERE r.id = ?`,
      [id]
    )
    if (reports.length === 0) {
      return res.status(404).json({ error: 'Laporan tidak ditemukan' })
    }
    const report = reports[0]
    if (req.user.role === 'warga' && report.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Akses ditolak' })
    }
    res.json({ report })
  } catch (e) {
    next(e)
  }
}
