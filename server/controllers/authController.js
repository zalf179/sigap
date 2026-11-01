import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { query } from '../db/conn.js'
import { jwtSecret } from '../middleware/auth.js'

export async function register(req, res, next) {
  try {
    const { name, email, phone, password, block_id, house_number } = req.body
    if (!name || !email || !password || !block_id || !house_number) {
      return res.status(400).json({ error: 'Semua field wajib diisi' })
    }
    const existing = await query('SELECT id FROM users WHERE email = ?', [email])
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email sudah terdaftar' })
    }
    const hash = await bcrypt.hash(password, 10)
    await query(
      'INSERT INTO users (name, email, phone, password_hash, role, block_id, house_number) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, phone || null, hash, 'warga', block_id, house_number]
    )
    res.status(201).json({ message: 'Pendaftaran berhasil' })
  } catch (e) {
    next(e)
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'Email dan kata sandi wajib diisi' })
    }
    const users = await query('SELECT * FROM users WHERE email = ?', [email])
    if (users.length === 0) {
      return res.status(401).json({ error: 'Email atau kata sandi salah' })
    }
    const user = users[0]
    const match = await bcrypt.compare(password, user.password_hash)
    if (!match) {
      return res.status(401).json({ error: 'Email atau kata sandi salah' })
    }
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: '7d' }
    )
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
  } catch (e) {
    next(e)
  }
}

export async function me(req, res, next) {
  try {
    const users = await query('SELECT id, name, email, phone, role, block_id, house_number FROM users WHERE id = ?', [req.user.id])
    if (users.length === 0) {
      return res.status(404).json({ error: 'Pengguna tidak ditemukan' })
    }
    res.json({ user: users[0] })
  } catch (e) {
    next(e)
  }
}
