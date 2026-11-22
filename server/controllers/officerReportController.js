import { query } from '../db/conn.js'

export async function listAllReports(req,res,next) {
  try {
    const {status,block_id,search}=req.query
    let sql=`SELECT p.id_pengaduan AS id,p.nomor_tiket AS ticket_number,p.patokan_lokasi AS landmark,p.status,
      p.tanggal_dibuat AS created_at,p.waktu_diproses AS processed_at,p.waktu_selesai AS completed_at,
      p.foto AS photo_path,p.foto_bukti AS proof_photo_path,p.id_warga AS user_id,
      b.id_blok AS block_id,b.nama_blok AS block_name,k.nama_kategori AS category_name,k.id_kategori AS category_id,w.nama AS reporter_name
      FROM pengaduan p JOIN warga w ON w.id_warga=p.id_warga LEFT JOIN blok b ON b.id_blok=w.id_blok
      JOIN kategori_sampah k ON k.id_kategori=p.id_kategori WHERE 1=1`
    const params=[]
    if(status){sql+=' AND p.status=?';params.push(status)}
    if(block_id){sql+=' AND w.id_blok=?';params.push(block_id)}
    if(search){sql+=' AND (p.nomor_tiket LIKE ? OR w.nama LIKE ?)';params.push(`%${search}%`,`%${search}%`)}
    sql+=' ORDER BY (p.status="Menunggu") DESC,p.tanggal_dibuat DESC'
    res.json({reports:await query(sql,params)})
  } catch(e){next(e)}
}

export async function processReport(req,res,next) {
  try {
    const reports=await query('SELECT id_pengaduan AS id,status FROM pengaduan WHERE id_pengaduan=?',[req.params.id])
    if(!reports.length)return res.status(404).json({error:'Laporan tidak ditemukan'})
    if(reports[0].status!=='Menunggu')return res.status(400).json({error:'Hanya laporan berstatus Menunggu yang bisa diproses'})
    await query('UPDATE pengaduan SET status=?,id_petugas=?,waktu_diproses=NOW() WHERE id_pengaduan=?',['Sedang Diproses',req.user.id,req.params.id])
    res.json({message:'Laporan diproses'})
  }catch(e){next(e)}
}

export async function completeReport(req,res,next) {
  try {
    if(!req.file)return res.status(400).json({error:'Foto bukti wajib diunggah untuk menyelesaikan laporan'})
    const reports=await query('SELECT id_pengaduan AS id,status FROM pengaduan WHERE id_pengaduan=?',[req.params.id])
    if(!reports.length)return res.status(404).json({error:'Laporan tidak ditemukan'})
    if(reports[0].status!=='Sedang Diproses')return res.status(400).json({error:'Hanya laporan berstatus Sedang Diproses yang bisa diselesaikan'})
    await query('UPDATE pengaduan SET status=?,waktu_selesai=NOW(),foto_bukti=? WHERE id_pengaduan=?',['Selesai',`/uploads/${req.file.filename}`,req.params.id])
    res.json({message:'Laporan selesai'})
  }catch(e){next(e)}
}
