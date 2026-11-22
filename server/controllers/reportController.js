import { query } from '../db/conn.js'
function generateTicket() { return `SGP-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(Math.random()*10000).toString().padStart(4,'0')}` }

export async function createReport(req,res,next) {
  try {
    const {landmark,category_id}=req.body
    if (!landmark || !category_id) return res.status(400).json({error:'Semua field wajib diisi'})
    if (!req.file) return res.status(400).json({error:'Foto laporan wajib diunggah'})
    const warga=await query('SELECT id_blok FROM warga WHERE id_warga=?',[req.user.id])
    if (!warga.length) return res.status(404).json({error:'Data warga tidak ditemukan'})
    if (!warga[0].id_blok) return res.status(400).json({error:'Akun warga belum memiliki blok'})
    const ticket_number=generateTicket(), photo_path=`/uploads/${req.file.filename}`
    await query('INSERT INTO pengaduan (nomor_tiket,id_warga,id_kategori,patokan_lokasi,foto,status) VALUES (?,?,?,?,?,?)',[ticket_number,req.user.id,category_id,landmark,photo_path,'Menunggu'])
    res.status(201).json({ticket_number,message:'Laporan berhasil dibuat'})
  } catch(e) { next(e) }
}

export async function myReports(req,res,next) {
  try {
    const reports=await query(`SELECT p.id_pengaduan AS id,p.nomor_tiket AS ticket_number,p.patokan_lokasi AS landmark,p.status,
      p.tanggal_dibuat AS created_at,p.foto AS photo_path,p.foto_bukti AS proof_photo_path,
      b.nama_blok AS block_name,k.nama_kategori AS category_name
      FROM pengaduan p JOIN warga w ON w.id_warga=p.id_warga LEFT JOIN blok b ON b.id_blok=w.id_blok
      JOIN kategori_sampah k ON k.id_kategori=p.id_kategori WHERE p.id_warga=? ORDER BY p.tanggal_dibuat DESC`,[req.user.id])
    res.json({reports})
  } catch(e) { next(e) }
}

export async function getReportDetail(req,res,next) {
  try {
    const reports=await query(`SELECT p.id_pengaduan AS id,p.nomor_tiket AS ticket_number,p.patokan_lokasi AS landmark,p.status,
      p.tanggal_dibuat AS created_at,p.waktu_diproses AS processed_at,p.waktu_selesai AS completed_at,p.foto AS photo_path,
      p.foto_bukti AS proof_photo_path,p.id_warga AS user_id,b.nama_blok AS block_name,k.nama_kategori AS category_name,
      k.panduan_penanganan AS handling_instruction
      FROM pengaduan p JOIN warga w ON w.id_warga=p.id_warga LEFT JOIN blok b ON b.id_blok=w.id_blok
      JOIN kategori_sampah k ON k.id_kategori=p.id_kategori WHERE p.id_pengaduan=?`,[req.params.id])
    if (!reports.length) return res.status(404).json({error:'Laporan tidak ditemukan'})
    const report=reports[0]
    if (req.user.role==='warga' && report.user_id!==req.user.id) return res.status(403).json({error:'Akses ditolak'})
    res.json({report})
  } catch(e) { next(e) }
}
