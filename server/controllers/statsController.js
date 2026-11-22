import { query } from '../db/conn.js'
export async function getStats(req,res,next){
  try{
    const [total]=await query('SELECT COUNT(*) AS total FROM pengaduan')
    const [selesai]=await query("SELECT COUNT(*) AS total FROM pengaduan WHERE status='Selesai'")
    const [tertunda]=await query("SELECT COUNT(*) AS total FROM pengaduan WHERE status IN ('Menunggu','Sedang Diproses')")
    const perBlock=await query(`SELECT b.nama_blok AS block,COUNT(p.id_pengaduan) AS count FROM pengaduan p JOIN warga w ON w.id_warga=p.id_warga LEFT JOIN blok b ON b.id_blok=w.id_blok GROUP BY b.id_blok,b.nama_blok ORDER BY count DESC`)
    const perCategory=await query(`SELECT k.nama_kategori AS category,COUNT(p.id_pengaduan) AS count FROM pengaduan p JOIN kategori_sampah k ON k.id_kategori=p.id_kategori GROUP BY k.id_kategori,k.nama_kategori ORDER BY count DESC`)
    res.json({totals:{masuk:Number(total?.total??0),selesai:Number(selesai?.total??0),tertunda:Number(tertunda?.total??0)},perBlock:perBlock.map(row=>({...row,count:Number(row.count??0)})),perCategory:perCategory.map(row=>({...row,count:Number(row.count??0)}))})
  }catch(e){console.error('GET /api/stats failed:',e);res.status(e.status||500).json({error:e.message||'Gagal memuat statistik'})}
}
