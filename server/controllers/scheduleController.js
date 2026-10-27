import { query } from '../db/conn.js'

export async function publicMySchedule(req, res, next) {
  try {
    const userId = req.user.id
    const users = await query('SELECT block_id FROM users WHERE id = ?', [userId])
    if (users.length === 0 || !users[0].block_id) {
      return res.json({ schedules: [] })
    }
    const schedules = await query(
      `SELECT s.id, s.day_of_week, s.time_start, s.time_end, s.waste_type, s.notes, b.name as block_name
       FROM pickup_schedules s
       JOIN blocks b ON b.id = s.block_id
       WHERE s.block_id = ?
       ORDER BY FIELD(s.day_of_week,'Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu'), s.time_start`,
      [users[0].block_id]
    )
    res.json({ schedules })
  } catch (e) {
    next(e)
  }
}

export async function adminListSchedules(req, res, next) {
  try {
    const schedules = await query(
      `SELECT s.id, s.block_id, s.day_of_week, s.time_start, s.time_end, s.waste_type, s.notes, b.name as block_name
       FROM pickup_schedules s
       JOIN blocks b ON b.id = s.block_id
       ORDER BY b.name, FIELD(s.day_of_week,'Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu'), s.time_start`
    )
    res.json({ schedules })
  } catch (e) {
    next(e)
  }
}

export async function createSchedule(req, res, next) {
  try {
    const { block_id, day_of_week, time_start, time_end, waste_type, notes } = req.body
    if (!block_id || !day_of_week || !time_start || !time_end || !waste_type) {
      return res.status(400).json({ error: 'Semua field wajib diisi' })
    }
    await query(
      'INSERT INTO pickup_schedules (block_id, day_of_week, time_start, time_end, waste_type, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [block_id, day_of_week, time_start, time_end, waste_type, notes || null]
    )
    res.status(201).json({ message: 'Jadwal dibuat' })
  } catch (e) {
    next(e)
  }
}

export async function updateSchedule(req, res, next) {
  try {
    const { id } = req.params
    const { block_id, day_of_week, time_start, time_end, waste_type, notes } = req.body
    await query(
      'UPDATE pickup_schedules SET block_id=?, day_of_week=?, time_start=?, time_end=?, waste_type=?, notes=? WHERE id=?',
      [block_id, day_of_week, time_start, time_end, waste_type, notes || null, id]
    )
    res.json({ message: 'Jadwal diperbarui' })
  } catch (e) {
    next(e)
  }
}

export async function deleteSchedule(req, res, next) {
  try {
    const { id } = req.params
    await query('DELETE FROM pickup_schedules WHERE id = ?', [id])
    res.json({ message: 'Jadwal dihapus' })
  } catch (e) {
    next(e)
  }
}
