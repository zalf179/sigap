import bcrypt from 'bcrypt'
import { randomInt } from 'node:crypto'
import { query, getConnection } from '../db/conn.js'

const TEMP_PASSWORD_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
const TABLES = {
  warga: { table:'warga', id:'id_warga' }, petugas: { table:'petugas', id:'id_petugas' }, admin: { table:'admin', id:'id_admin' }
}
function generateTempPassword(length = 10) { return Array.from({length}, () => TEMP_PASSWORD_ALPHABET[randomInt(TEMP_PASSWORD_ALPHABET.length)]).join('') }
function unionUsers() {
  return `SELECT id_warga AS id,nama AS name,email,no_telepon AS phone,'warga' AS role,id_blok AS block_id,nomor_rumah AS house_number,tanggal_dibuat AS created_at,kata_sandi AS password_hash FROM warga
    UNION ALL SELECT id_petugas AS id,nama AS name,email,no_telepon AS phone,'petugas' AS role,NULL AS block_id,NULL AS house_number,tanggal_dibuat AS created_at,kata_sandi AS password_hash FROM petugas
    UNION ALL SELECT id_admin AS id,nama AS name,email,no_telepon AS phone,'admin' AS role,NULL AS block_id,NULL AS house_number,tanggal_dibuat AS created_at,kata_sandi AS password_hash FROM admin`
}

export async function listUsers(req,res,next) {
  try { const users = await query(`SELECT id,name,email,phone,role,block_id,house_number,created_at FROM (${unionUsers()}) AS semua_pengguna ORDER BY created_at DESC`); res.json({users}) }
  catch(e) { next(e) }
}

export async function updateUserRole(req,res,next) {
  let connection
  try {
    connection=await getConnection()
    await connection.beginTransaction()
    const {id}=req.params, {role}=req.body
    if (!TABLES[role]) { await connection.rollback(); return res.status(400).json({error:'Role tidak valid'}) }
    const [users] = await connection.execute(`SELECT * FROM (${unionUsers()}) AS semua_pengguna WHERE id=?`,[id])
    if (!users.length) { await connection.rollback(); return res.status(404).json({error:'Pengguna tidak ditemukan'}) }
    const u=users[0]
    if (u.role===role) { await connection.commit(); return res.json({message:'Role diperbarui'}) }
    if (role==='warga' && (!u.block_id || !u.house_number)) { await connection.rollback(); return res.status(400).json({error:'Akun harus memiliki blok dan nomor rumah untuk menjadi warga'}) }
    if (u.role==='warga') {
      const [linked]=await connection.execute('SELECT id_pengaduan FROM pengaduan WHERE id_warga=? LIMIT 1',[id])
      if(linked.length){await connection.rollback();return res.status(409).json({error:'Peran warga tidak dapat diubah karena akun memiliki pengaduan'})}
    }
    if (u.role==='admin') {
      const [linked]=await connection.execute('SELECT id_artikel FROM artikel WHERE id_admin=? LIMIT 1',[id])
      if(linked.length){await connection.rollback();return res.status(409).json({error:'Peran admin tidak dapat diubah karena akun memiliki artikel'})}
    }
    const destination=TABLES[role]
    const [occupied]=await connection.execute(`SELECT ${destination.id} FROM ${destination.table} WHERE ${destination.id}=?`,[id])
    if (occupied.length) { await connection.rollback(); return res.status(409).json({error:'ID akun sudah digunakan oleh role tujuan'}) }
    await connection.execute(`INSERT INTO ${destination.table} (${destination.id},nama,email,no_telepon,kata_sandi${role==='warga'?',nomor_rumah,id_blok':''},tanggal_dibuat) VALUES (${Array(role==='warga'?8:6).fill('?').join(',')})`,
      role==='warga' ? [id,u.name,u.email,u.phone,u.password_hash,u.house_number,u.block_id,u.created_at] : [id,u.name,u.email,u.phone,u.password_hash,u.created_at])
    const source=TABLES[u.role]
    await connection.execute(`DELETE FROM ${source.table} WHERE ${source.id}=?`,[id])
    await connection.commit()
    res.json({message:'Role diperbarui'})
  } catch(e) { if(connection) await connection.rollback(); next(e) }
  finally { connection?.release() }
}

export async function deleteUser(req,res,next) {
  try {
    const {id}=req.params
    const users=await query(`SELECT id,role FROM (${unionUsers()}) AS semua_pengguna WHERE id=?`,[id])
    if (!users.length) return res.status(404).json({error:'Pengguna tidak ditemukan'})
    const source=TABLES[users[0].role]
    await query(`DELETE FROM ${source.table} WHERE ${source.id}=?`,[id])
    res.json({message:'Pengguna dihapus'})
  } catch(e) { next(e) }
}

export async function resetUserPassword(req,res,next) {
  try {
    const {id}=req.params
    const users=await query(`SELECT id,name,email,role FROM (${unionUsers()}) AS semua_pengguna WHERE id=?`,[id])
    if (!users.length) return res.status(404).json({error:'Pengguna tidak ditemukan'})
    const user=users[0], target=TABLES[user.role], tempPassword=generateTempPassword(), hash=await bcrypt.hash(tempPassword,10)
    await query(`UPDATE ${target.table} SET kata_sandi=? WHERE ${target.id}=?`,[hash,id])
    res.json({message:'Kata sandi berhasil direset',user:{id:user.id,name:user.name,email:user.email},temp_password:tempPassword})
  } catch(e) { next(e) }
}
