import { query } from '../db/conn.js'
const fields=`s.id_jadwal AS id,s.id_blok AS block_id,s.hari AS day_of_week,s.jam_mulai AS time_start,s.jam_selesai AS time_end,s.jenis_sampah AS waste_type,s.catatan AS notes`
const sortDays="FIELD(s.hari,'Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu')"

export async function publicMySchedule(req,res,next){
  try{
    const warga=await query('SELECT id_blok FROM warga WHERE id_warga=?',[req.user.id])
    if(!warga.length||!warga[0].id_blok)return res.json({schedules:[]})
    const schedules=await query(`SELECT ${fields},b.nama_blok AS block_name FROM jadwal_pengangkutan s JOIN blok b ON b.id_blok=s.id_blok WHERE s.id_blok=? ORDER BY ${sortDays},s.jam_mulai`,[warga[0].id_blok])
    res.json({schedules})
  }catch(e){next(e)}
}
export async function adminListSchedules(req,res,next){
  try{const schedules=await query(`SELECT ${fields},b.nama_blok AS block_name FROM jadwal_pengangkutan s JOIN blok b ON b.id_blok=s.id_blok ORDER BY b.nama_blok,${sortDays},s.jam_mulai`);res.json({schedules})}
  catch(e){next(e)}
}
export async function createSchedule(req,res,next){
  try{
    const {block_id,day_of_week,time_start,time_end,waste_type,notes}=req.body
    if(!block_id||!day_of_week||!time_start||!time_end||!waste_type)return res.status(400).json({error:'Semua field wajib diisi'})
    await query('INSERT INTO jadwal_pengangkutan (id_blok,hari,jam_mulai,jam_selesai,jenis_sampah,catatan) VALUES (?,?,?,?,?,?)',[block_id,day_of_week,time_start,time_end,waste_type,notes||null])
    res.status(201).json({message:'Jadwal dibuat'})
  }catch(e){next(e)}
}
export async function updateSchedule(req,res,next){
  try{
    const {block_id,day_of_week,time_start,time_end,waste_type,notes}=req.body
    await query('UPDATE jadwal_pengangkutan SET id_blok=?,hari=?,jam_mulai=?,jam_selesai=?,jenis_sampah=?,catatan=? WHERE id_jadwal=?',[block_id,day_of_week,time_start,time_end,waste_type,notes||null,req.params.id])
    res.json({message:'Jadwal diperbarui'})
  }catch(e){next(e)}
}
export async function deleteSchedule(req,res,next){
  try{await query('DELETE FROM jadwal_pengangkutan WHERE id_jadwal=?',[req.params.id]);res.json({message:'Jadwal dihapus'})}
  catch(e){next(e)}
}
