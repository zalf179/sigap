import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import multer from 'multer'
import healthRoutes from './routes/health.js'
import authRoutes from './routes/auth.js'
import blockRoutes from './routes/blocks.js'
import identifyRoutes from './routes/identify.js'
import reportRoutes from './routes/reports.js'
import categoryRoutes from './routes/categories.js'
import officerReportRoutes from './routes/officerReports.js'
import articleRoutes from './routes/articles.js'
import scheduleRoutes from './routes/schedules.js'
import userRoutes from './routes/users.js'
import statsRoutes from './routes/stats.js'
import exportRoutes from './routes/export.js'
import { pool } from './db/conn.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, './.env') })

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/uploads', express.static(path.resolve(__dirname, './uploads'), {
  setHeaders: (res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
  }
}))

app.use('/api/health', healthRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/blocks', blockRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/identify', identifyRoutes)
// Mount the static export path before /:id so "export" is not treated as a report ID.
app.use('/api/reports/export', exportRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/officer/reports', officerReportRoutes)
app.use('/api/articles', articleRoutes)
app.use('/api/pickup-schedules', scheduleRoutes)
app.use('/api/users', userRoutes)
app.use('/api/stats', statsRoutes)

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Ukuran file maksimal 5MB' })
    }
    return res.status(400).json({ error: err.message })
  }
  if (err.message && (err.message.includes('Tipe file') || err.message.includes('file'))) {
    return res.status(400).json({ error: err.message })
  }
  console.error(err)
  res.status(err.status || 500).json({ error: err.message || 'Terjadi kesalahan pada server' })
})

async function startServer() {
  let connection
  let databaseReady = false
  try {
    connection = await pool.getConnection()
    await connection.ping()
    console.log('Koneksi database SIGAP berhasil.')
    databaseReady = true
  } catch (error) {
    console.error('Gagal terhubung ke database SIGAP:', error.message)
  } finally {
    connection?.release()
  }
  if (!databaseReady) {
    await pool.end()
    process.exitCode = 1
    return
  }

  const server = app.listen(PORT, () => {
    console.log(`Server SIGAP berjalan di port ${PORT}`)
  })
  server.on('error', async (error) => {
    console.error(`Gagal menjalankan server pada port ${PORT}:`, error)
    await pool.end()
    process.exitCode = 1
  })
}

startServer()
