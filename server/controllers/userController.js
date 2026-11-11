import bcrypt from 'bcrypt'
import { randomBytes } from 'node:crypto'
import { query } from '../db/conn.js'

const TEMP_PASSWORD_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'

function generateTempPassword(length = 10) {
  const bytes = randomBytes(length)
  let password = ''
  for (let i = 0; i < length; i += 1) {
    password += TEMP_PASSWORD_ALPHABET[bytes[i] % TEMP_PASSWORD_ALPHABET.length]
  }
  return password
}

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

export async function resetUserPassword(req, res, next) {
  try {
    const { id } = req.params
    const users = await query('SELECT id, name, email FROM users WHERE id = ?', [id])
    if (users.length === 0) {
      return res.status(404).json({ error: 'Pengguna tidak ditemukan' })
    }
    const user = users[0]
    const tempPassword = generateTempPassword()
    const hash = await bcrypt.hash(tempPassword, 10)
    await query('UPDATE users SET password_hash = ? WHERE id = ?', [hash, id])
    res.json({
      message: 'Kata sandi berhasil direset',
      user: { id: user.id, name: user.name, email: user.email },
      temp_password: tempPassword
    })
  } catch (e) {
    next(e)
  }
}
