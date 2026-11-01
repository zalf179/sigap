import { randomBytes } from 'crypto'
import bcrypt from 'bcrypt'
import { pool, query } from '../db/conn.js'

const email = (process.argv[2] || 'admin@sigap.local').trim()

async function bootstrapAdmin() {
  if (email.length > 150 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Provide a valid admin email address (maximum 150 characters).')
  }

  const matchingUsers = await query('SELECT id, role FROM users WHERE email = ?', [email])
  if (matchingUsers.length > 0 && matchingUsers[0].role !== 'admin') {
    throw new Error('That email belongs to a non-admin account; no changes were made.')
  }

  if (matchingUsers.length === 0) {
    const admins = await query("SELECT id FROM users WHERE role = 'admin' LIMIT 1")
    if (admins.length > 0) {
      throw new Error('An admin already exists. Use that account to manage additional users.')
    }
  }

  const password = randomBytes(24).toString('base64url')
  const passwordHash = await bcrypt.hash(password, 12)

  if (matchingUsers.length > 0) {
    await query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, matchingUsers[0].id])
  } else {
    await query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      ['Admin SIGAP', email, passwordHash, 'admin']
    )
  }

  console.log(`Admin email: ${email}`)
  console.log(`Generated password (shown once): ${password}`)

  const articles = await query('SELECT COUNT(*) AS total FROM articles')
  if (articles[0].total === 0) {
    const admins = await query("SELECT id FROM users WHERE role = 'admin' ORDER BY id LIMIT 1")
    const authorId = admins[0].id
    await query(
      `INSERT INTO articles (title, slug, content, author_id) VALUES
      ('Cara Memisahkan Sampah di Rumah', 'cara-memisahkan-sampah-di-rumah', 'Pisahkan sampah menjadi organik, anorganik, dan B3. Sampah organik bisa kompos. Anorganik bisa didaur ulang. B3 harus diserahkan terpisah ke petugas.', ?),
      ('Peringatan: Sampah Kaca Perlu Penanganan Khusus', 'peringatan-sampah-kaca-perlu-penanganan-khusus', 'Kaca yang pecah bisa melukai. Bungkus dengan kertas tebal atau serahkan langsung ke petugas dengan memberi keterangan. Jangan campur sembarangan dengan plastik.', ?),
      ('Jadwal dan Tata Cara Pelaporan Sampah', 'jadwal-dan-tata-cara-pelaporan-sampah', 'Warga dapat melapor melalui aplikasi SIGAP. Petugas akan menindaklanjuti laporan sesuai status dan memberikan bukti penutupan bila sudah selesai.', ?)`,
      [authorId, authorId, authorId]
    )
  }
}

try {
  await bootstrapAdmin()
} catch (error) {
  console.error(`Admin bootstrap failed: ${error.message}`)
  process.exitCode = 1
} finally {
  await pool.end()
}
