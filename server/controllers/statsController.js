import { query } from '../db/conn.js'

export async function getStats(req, res, next) {
  try {
    const [total] = await query('SELECT COUNT(*) as total FROM reports')
    const [selesai] = await query("SELECT COUNT(*) as total FROM reports WHERE status = 'Selesai'")
    const [tertunda] = await query("SELECT COUNT(*) as total FROM reports WHERE status IN ('Menunggu','Sedang Diproses')")
    const perBlock = await query(
      `SELECT b.name as block, COUNT(r.id) as count
       FROM reports r
       JOIN blocks b ON b.id = r.block_id
       GROUP BY b.id, b.name
       ORDER BY count DESC`
    )
    const perCategory = await query(
      `SELECT c.name as category, COUNT(r.id) as count
       FROM reports r
       JOIN waste_categories c ON c.id = r.category_id
       GROUP BY c.id, c.name
       ORDER BY count DESC`
    )
    /** Response: {totals: {masuk: number, selesai: number, tertunda: number}, perBlock: Array<{block: string, count: number}>, perCategory: Array<{category: string, count: number}>}. */
    res.json({
      totals: {
        masuk: Number(total?.total ?? 0),
        selesai: Number(selesai?.total ?? 0),
        tertunda: Number(tertunda?.total ?? 0)
      },
      perBlock: perBlock.map((row) => ({ ...row, count: Number(row.count ?? 0) })),
      perCategory: perCategory.map((row) => ({ ...row, count: Number(row.count ?? 0) }))
    })
  } catch (e) {
    console.error('GET /api/stats failed:', e)
    return res.status(e.status || 500).json({ error: e.message || 'Gagal memuat statistik' })
  }
}
