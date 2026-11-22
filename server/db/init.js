import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import mysql from 'mysql2/promise'
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
    await connection.query('CREATE DATABASE IF NOT EXISTS sigap CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci')
    await connection.query('USE sigap')
    const [legacyTables] = await connection.query("SELECT COUNT(*) AS jumlah FROM information_schema.tables WHERE table_schema='sigap' AND table_name IN ('users','reports','articles','pickup_schedules','waste_categories','blocks')")
    if (legacyTables[0].jumlah > 0) {
      throw new Error('Database masih memakai skema lama. Buat backup lalu jalankan server/db/migrations/002_revisi_skema_erd.sql sebelum menjalankan aplikasi.')
    }
    const schema = fs.readFileSync(path.resolve(__dirname, './schema.sql'), 'utf8')
    await connection.query(schema)
    console.log('Skema berhasil dibuat / diperbarui.')

    await connection.query('USE sigap')

    // Seed blocks
    const [blocks] = await connection.query('SELECT COUNT(*) as cnt FROM blok')
    if (blocks[0].cnt === 0) {
      await connection.query("INSERT INTO blok (nama_blok) VALUES ('Blok A'), ('Blok B'), ('Blok C'), ('Area Taman/Fasum')")
      console.log('Blok berhasil di-seed.')
    }

    // Seed waste categories
    const [cats] = await connection.query('SELECT COUNT(*) as cnt FROM kategori_sampah')
    if (cats[0].cnt === 0) {
      await connection.query(
        `INSERT INTO kategori_sampah (nama_kategori, deskripsi, panduan_penanganan) VALUES
        ('Organik', 'Sampah mudah terurai seperti sisa makanan, daun, rumput.', 'Pisahkan ke wadah organik tertutup. Bisa diolah menjadi kompos. Jangan dicampur dengan plastik.'),
        ('Anorganik', 'Sampah tidak mudah terurai seperti plastik, kertas, kaleng, logam.', 'Pastikan bahan daur ulang bersih dan kering, pisahkan menurut jenisnya, lalu setorkan ke tempat pemilahan.'),
        ('B3', 'Bahan Berbahaya dan Beracun seperti baterai, lampu neon, obat kadaluarsa, kemasan beracun.', 'Jangan dibuang ke tempat sampah umum. Kumpulkan terpisah dalam wadah kedap, jauhkan dari jangkauan anak, dan serahkan ke petugas sesuai jadwal penyerahan B3.'),
        ('Residu', 'Sampah yang sulit didaur ulang melalui pemilahan rumah tangga.', 'Pisahkan dari bahan daur ulang dan buang dalam wadah residu tertutup.')`
      )
      console.log('Kategori sampah berhasil di-seed.')
    }

    await connection.query(
      `INSERT INTO kategori_sampah (nama_kategori, deskripsi, panduan_penanganan)
       SELECT 'Residu', 'Sampah yang sulit didaur ulang melalui pemilahan rumah tangga.',
              'Pisahkan dari bahan daur ulang dan buang dalam wadah residu tertutup.'
       FROM DUAL
       WHERE NOT EXISTS (SELECT 1 FROM kategori_sampah WHERE nama_kategori = 'Residu')`
    )

    await connection.query(
      `UPDATE kategori_sampah
       SET panduan_penanganan = 'Pastikan bahan daur ulang bersih dan kering, pisahkan menurut jenisnya, lalu setorkan ke tempat pemilahan.'
       WHERE nama_kategori = 'Anorganik'
         AND panduan_penanganan LIKE '%kaca bisa tajam - bungkus dengan aman%'
      `
    )

    // Seed sample articles only when an administrator exists to own them.
    const [adminUsers] = await connection.query('SELECT id_admin AS id FROM admin ORDER BY id_admin LIMIT 1')
    const [articles] = await connection.query('SELECT COUNT(*) as cnt FROM artikel')
    if (articles[0].cnt === 0 && adminUsers.length > 0) {
      const authorId = adminUsers[0].id
      await connection.query(
        `INSERT INTO artikel (judul, slug, isi, id_admin) VALUES
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
