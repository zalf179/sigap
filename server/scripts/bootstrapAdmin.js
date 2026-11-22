import { randomBytes } from 'crypto'
import bcrypt from 'bcrypt'
import { chmod, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { pool, query } from '../db/conn.js'

const email = (process.argv[2] || 'admin@sigap.local').trim()
const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function bootstrapAdmin() {
  if (email.length > 150 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Provide a valid admin email address (maximum 150 characters).')
  }

  const matchingUsers = await query('SELECT id_admin AS id FROM admin WHERE email = ?', [email])
  const matchingWarga = await query('SELECT id_warga FROM warga WHERE email = ?', [email])
  const matchingPetugas = await query('SELECT id_petugas FROM petugas WHERE email = ?', [email])
  if (matchingWarga.length > 0 || matchingPetugas.length > 0) {
    throw new Error('That email belongs to a non-admin account; no changes were made.')
  }

  if (matchingUsers.length === 0) {
    const admins = await query('SELECT id_admin AS id FROM admin LIMIT 1')
    if (admins.length > 0) {
      throw new Error('An admin already exists. Use that account to manage additional users.')
    }
  }

  const password = randomBytes(24).toString('base64url')
  const passwordHash = await bcrypt.hash(password, 12)
  const passwordFile = process.env.ADMIN_BOOTSTRAP_PASSWORD_FILE
    ? path.resolve(process.env.ADMIN_BOOTSTRAP_PASSWORD_FILE)
    : path.resolve(__dirname, '../.admin-bootstrap-password')
  await writeFile(passwordFile, `${password}\n`, { mode: 0o600 })
  await chmod(passwordFile, 0o600)

  if (matchingUsers.length > 0) {
    await query('UPDATE admin SET kata_sandi = ? WHERE id_admin = ?', [passwordHash, matchingUsers[0].id])
  } else {
    const [nextId] = await query('SELECT GREATEST(COALESCE((SELECT MAX(id_admin) FROM admin),0),COALESCE((SELECT MAX(id_warga) FROM warga),0),COALESCE((SELECT MAX(id_petugas) FROM petugas),0))+1 AS id')
    await query(
      'INSERT INTO admin (id_admin, nama, email, kata_sandi) VALUES (?, ?, ?, ?)',
      [nextId.id, 'Admin SIGAP', email, passwordHash]
    )
  }

  console.log('Admin bootstrap completed. Read the generated password from the protected password file.')
  console.log(`Password file: ${passwordFile}`)

  const articles = await query('SELECT COUNT(*) AS total FROM artikel')
  if (articles[0].total === 0) {
    const admins = await query('SELECT id_admin AS id FROM admin ORDER BY id_admin LIMIT 1')
    const authorId = admins[0].id
    await query(
      `INSERT INTO artikel (judul, slug, isi, id_admin) VALUES
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
