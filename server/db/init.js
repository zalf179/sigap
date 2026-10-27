import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import mysql from 'mysql2/promise'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env') })

async function init() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  })

  try {
    const schema = fs.readFileSync(path.resolve(__dirname, './schema.sql'), 'utf8')
    await connection.query(schema)
    console.log('Skema berhasil dibuat / diperbarui.')

    await connection.query('USE sigap')

    // Seed blocks
    const [blocks] = await connection.query('SELECT COUNT(*) as cnt FROM blocks')
    if (blocks[0].cnt === 0) {
      await connection.query("INSERT INTO blocks (name) VALUES ('Blok A'), ('Blok B'), ('Blok C'), ('Area Taman/Fasum')")
      console.log('Blok berhasil di-seed.')
    }

    // Seed waste categories
    const [cats] = await connection.query('SELECT COUNT(*) as cnt FROM waste_categories')
    if (cats[0].cnt === 0) {
      await connection.query(
        `INSERT INTO waste_categories (name, description, handling_instruction) VALUES
        ('Organik', 'Sampah mudah terurai seperti sisa makanan, daun, rumput.', 'Pisahkan ke wadah organik tertutup. Bisa diolah menjadi kompos. Jangan dicampur dengan plastik.'),
        ('Anorganik', 'Sampah tidak mudah terurai seperti plastik, kertas, kaleng, logam.', 'Pastikan bahan daur ulang bersih dan kering, pisahkan menurut jenisnya, lalu setorkan ke tempat pemilahan.'),
        ('B3', 'Bahan Berbahaya dan Beracun seperti baterai, lampu neon, obat kadaluarsa, kemasan beracun.', 'Jangan dibuang ke tempat sampah umum. Kumpulkan terpisah dalam wadah kedap, jauhkan dari jangkauan anak, dan serahkan ke petugas sesuai jadwal penyerahan B3.'),
        ('Residu', 'Sampah yang sulit didaur ulang melalui pemilahan rumah tangga.', 'Pisahkan dari bahan daur ulang dan buang dalam wadah residu tertutup.')`
      )
      console.log('Kategori sampah berhasil di-seed.')
    }

    await connection.query(
      `INSERT INTO waste_categories (name, description, handling_instruction)
       SELECT 'Residu', 'Sampah yang sulit didaur ulang melalui pemilahan rumah tangga.',
              'Pisahkan dari bahan daur ulang dan buang dalam wadah residu tertutup.'
       FROM DUAL
       WHERE NOT EXISTS (SELECT 1 FROM waste_categories WHERE name = 'Residu')`
    )

    await connection.query(
      `UPDATE waste_categories
       SET handling_instruction = 'Pastikan bahan daur ulang bersih dan kering, pisahkan menurut jenisnya, lalu setorkan ke tempat pemilahan.'
       WHERE name = 'Anorganik'
         AND handling_instruction LIKE '%kaca bisa tajam - bungkus dengan aman%'
      `
    )

    // Seed admin and petugas
    const adminPass = await bcrypt.hash('Admin123!', 10)
    const petugasPass = await bcrypt.hash('Petugas123!', 10)

    const [adminExists] = await connection.query("SELECT id FROM users WHERE email = 'admin@sigap.local'")
    if (adminExists.length === 0) {
      await connection.query(
        'INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)',
        ['Admin SIGAP', 'admin@sigap.local', '081234567890', adminPass, 'admin']
      )
      console.log('Admin berhasil dibuat (admin@sigap.local / Admin123!)')
    }

    const [petugasExists] = await connection.query("SELECT id FROM users WHERE email = 'petugas@sigap.local'")
    if (petugasExists.length === 0) {
      await connection.query(
        'INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)',
        ['Petugas SIGAP', 'petugas@sigap.local', '081234567891', petugasPass, 'petugas']
      )
      console.log('Petugas berhasil dibuat (petugas@sigap.local / Petugas123!)')
    }

    // Seed sample articles
    const [articles] = await connection.query('SELECT COUNT(*) as cnt FROM articles')
    if (articles[0].cnt === 0) {
      const [adminUser] = await connection.query("SELECT id FROM users WHERE email = 'admin@sigap.local'")
      const authorId = adminUser[0].id
      await connection.query(
        `INSERT INTO articles (title, slug, content, author_id) VALUES
        ('Cara Memisahkan Sampah di Rumah', 'cara-memisahkan-sampah-di-rumah', 'Pisahkan sampah menjadi organik, anorganik, dan B3. Sampah organik bisa kompos. Anorganik bisa didaur ulang. B3 harus diserahkan terpisah ke petugas.', ?),
        ('Peringatan: Sampah Kaca Perlu Penanganan Khusus', 'peringatan-sampah-kaca-perlu-penanganan-khusus', 'Kaca yang pecah bisa melukai. Bungkus dengan kertas tebal atau serahkan langsung ke petugas dengan memberi keterangan. Jangan campur sembarangan dengan plastik.', ?),
        ('Jadwal dan Tata Cara Pelaporan Sampah', 'jadwal-dan-tata-cara-pelaporan-sampah', 'Warga dapat melapor melalui aplikasi SIGAP. Petugas akan menindaklanjuti laporan sesuai status dan memberikan bukti penutupan bila sudah selesai.', ?)`,
        [authorId, authorId, authorId]
      )
      console.log('Artikel contoh berhasil di-seed.')
    }

    console.log('Inisialisasi database selesai.')
  } catch (e) {
    console.error('Gagal inisialisasi:', e.message)
    process.exit(1)
  } finally {
    await connection.end()
  }
}

init()
