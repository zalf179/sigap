import { query } from '../db/conn.js'

export async function listUsers(req, res, next) {
  try {
    const users = await query(
      'SELECT id, name, email, phone, role, block_id, house_number, created_at FROM users ORDER BY created_at DESC'
    )
    res.json({ users })
  } catch (e) {
    next(e)
  }
}

export async function updateUserRole(req, res, next) {
  try {
    const { id } = req.params
    const { role } = req.body
    if (!['warga', 'petugas', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Role tidak valid' })
    }
    await query('UPDATE users SET role = ? WHERE id = ?', [role, id])
    res.json({ message: 'Role diperbarui' })
  } catch (e) {
    next(e)
  }
}

export async function deleteUser(req, res, next) {
  try {
    const { id } = req.params
    await query('DELETE FROM users WHERE id = ?', [id])
    res.json({ message: 'Pengguna dihapus' })
  } catch (e) {
    next(e)
  }
}
