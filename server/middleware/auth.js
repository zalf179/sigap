import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env') })

export const jwtSecret = process.env.JWT_SECRET
if (!jwtSecret || jwtSecret.length < 32 || jwtSecret === 'replace-with-a-long-random-secret') {
  throw new Error('JWT_SECRET must be configured with a random secret of at least 32 characters')
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) {
    return res.status(401).json({ error: 'Tidak ada token autentikasi' })
  }
  try {
    const payload = jwt.verify(token, jwtSecret)
    req.user = payload
    next()
  } catch (e) {
    return res.status(401).json({ error: 'Token tidak valid atau kadaluarsa' })
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Tidak terautentikasi' })
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Akses ditolak' })
    }
    next()
  }
}
