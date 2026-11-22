import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { query, getConnection } from '../db/conn.js'
import { jwtSecret } from '../middleware/auth.js'

export async function register(req, res, next) {
  let connection
  let emailLock = false
  try {
    const { name, email, phone, password, block_id, house_number } = req.body
    if (!name || !email || !password || !block_id || !house_number) return res.status(400).json({ error: 'Semua field wajib diisi' })
    connection = await getConnection()
    const [lockRows] = await connection.execute('SELECT GET_LOCK(SHA2(?,256),10) AS acquired', [email])
    emailLock = lockRows[0].acquired === 1
    if (!emailLock) return res.status(503).json({ error: 'Pendaftaran sedang sibuk, coba lagi' })
    const [matches] = await connection.execute('SELECT email FROM admin WHERE email=? UNION ALL SELECT email FROM warga WHERE email=? UNION ALL SELECT email FROM petugas WHERE email=?', [email, email, email])
    if (matches.length) return res.status(400).json({ error: 'Email sudah terdaftar' })
    const hash = await bcrypt.hash(password, 10)
    const [nextIds] = await connection.execute('SELECT GREATEST(COALESCE((SELECT MAX(id_admin) FROM admin),0),COALESCE((SELECT MAX(id_warga) FROM warga),0),COALESCE((SELECT MAX(id_petugas) FROM petugas),0))+1 AS id')
    await connection.execute('INSERT INTO warga (id_warga,nama,email,no_telepon,kata_sandi,nomor_rumah,id_blok) VALUES (?,?,?,?,?,?,?)', [nextIds[0].id,name,email,phone || null,hash,house_number,block_id])
    res.status(201).json({ message: 'Pendaftaran berhasil' })
  } catch (e) { next(e) }
  finally {
    if (connection && emailLock) {
      try { await connection.execute('SELECT RELEASE_LOCK(SHA2(?,256))', [req.body.email]) } catch {}
    }
    connection?.release()
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email dan kata sandi wajib diisi' })
    const users = await query(`SELECT id_admin AS id,nama AS name,email,kata_sandi AS password_hash,'admin' AS role,NULL AS block_id,NULL AS block_name FROM admin WHERE email=?
      UNION ALL SELECT w.id_warga AS id,w.nama AS name,w.email,w.kata_sandi AS password_hash,'warga' AS role,w.id_blok AS block_id,b.nama_blok AS block_name FROM warga w LEFT JOIN blok b ON b.id_blok=w.id_blok WHERE w.email=?
      UNION ALL SELECT id_petugas AS id,nama AS name,email,kata_sandi AS password_hash,'petugas' AS role,NULL AS block_id,NULL AS block_name FROM petugas WHERE email=?`, [email,email,email])
    if (!users.length) return res.status(401).json({ error: 'Email atau kata sandi salah' })
    const user = users[0]
    if (!await bcrypt.compare(password, user.password_hash)) return res.status(401).json({ error: 'Email atau kata sandi salah' })
    const publicUser = { id:user.id, name:user.name, email:user.email, role:user.role, ...(user.role==='warga'?{block_id:user.block_id,block_name:user.block_name}:{}) }
    const token = jwt.sign(publicUser, jwtSecret, { expiresIn: '7d' })
    res.json({ token, user: publicUser })
  } catch (e) { next(e) }
}

export async function me(req, res, next) {
  try {
    const table = req.user.role === 'admin' ? ['admin','id_admin'] : req.user.role === 'petugas' ? ['petugas','id_petugas'] : ['warga','id_warga']
    const users = req.user.role === 'warga'
      ? await query('SELECT w.id_warga AS id,w.nama AS name,w.email,w.no_telepon AS phone,? AS role,w.id_blok AS block_id,b.nama_blok AS block_name,w.nomor_rumah AS house_number FROM warga w LEFT JOIN blok b ON b.id_blok=w.id_blok WHERE w.id_warga=?',[req.user.role,req.user.id])
      : await query(`SELECT ${table[1]} AS id,nama AS name,email,no_telepon AS phone,? AS role FROM ${table[0]} WHERE ${table[1]}=?`, [req.user.role,req.user.id])
    if (!users.length) return res.status(404).json({ error: 'Pengguna tidak ditemukan' })
    res.json({ user: users[0] })
  } catch (e) { next(e) }
}
