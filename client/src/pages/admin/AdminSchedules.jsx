import { useState } from 'react'
import api from '../../api/axios'
import useAdminResource from './useAdminResource'
import AdminResourceMessage from './AdminResourceMessage'

export default function AdminSchedules() {
  const schedulesResource = useAdminResource('/pickup-schedules/admin')
  const blocksResource = useAdminResource('/blocks')
  const schedules = schedulesResource.data?.schedules || []
  const blocks = blocksResource.data?.blocks || []
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ block_id: '', day_of_week: 'Senin', time_start: '', time_end: '', waste_type: '', notes: '' })
  const [editId, setEditId] = useState(null)
  const [error, setError] = useState('')

  const retryLoad = () => { schedulesResource.retry(); blocksResource.retry() }

  const openCreate = () => {
    setEditId(null)
    setForm({ block_id: '', day_of_week: 'Senin', time_start: '', time_end: '', waste_type: '', notes: '' })
    setShowForm(true)
    setError('')
  }

  const openEdit = (s) => {
    setEditId(s.id)
    setForm({ block_id: s.block_id, day_of_week: s.day_of_week, time_start: s.time_start, time_end: s.time_end, waste_type: s.waste_type, notes: s.notes || '' })
    setShowForm(true)
    setError('')
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (editId) {
        await api.put(`/pickup-schedules/${editId}`, form)
      } else {
        await api.post('/pickup-schedules', form)
      }
      setShowForm(false)
      schedulesResource.retry()
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal menyimpan')
    }
  }

  const remove = async (id) => {
    if (!confirm('Hapus jadwal ini?')) return
    try {
      await api.delete(`/pickup-schedules/${id}`)
      schedulesResource.retry()
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menghapus')
    }
  }

  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']

  return (
    <div>
      <div className="flex justify-between mb-3">
        <div className="text-base font-medium">Jadwal Angkut</div>
        <button onClick={openCreate} className="bg-[#15803D] text-white px-3 py-1.5 text-sm">Tambah Jadwal</button>
      </div>
      {schedulesResource.state !== 'success' || blocksResource.state !== 'success' || schedules.length === 0
        ? <AdminResourceMessage
            state={schedulesResource.state === 'error' || blocksResource.state === 'error' ? 'error' : schedulesResource.state === 'loading' || blocksResource.state === 'loading' ? 'loading' : 'success'}
            errorStatus={schedulesResource.state === 'error' ? schedulesResource.errorStatus : blocksResource.errorStatus}
            onRetry={retryLoad}
            empty={schedulesResource.state === 'success' && blocksResource.state === 'success' && schedules.length === 0}
          />
        : <div className="border border-neutral-200 overflow-x-auto mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="text-left p-2">Blok</th>
              <th className="text-left p-2">Hari</th>
              <th className="text-left p-2">Waktu</th>
              <th className="text-left p-2">Jenis Sampah</th>
              <th className="text-left p-2">Catatan</th>
              <th className="text-left p-2"></th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((s) => (
              <tr key={s.id} className="border-b border-neutral-100">
                <td className="p-2">{s.block_name}</td>
                <td className="p-2">{s.day_of_week}</td>
                <td className="p-2">{s.time_start?.slice(0,5)} - {s.time_end?.slice(0,5)}</td>
                <td className="p-2">{s.waste_type}</td>
                <td className="p-2">{s.notes}</td>
                <td className="p-2 flex gap-2">
                  <button onClick={() => openEdit(s)} className="text-[#15803D]">Edit</button>
                  <button onClick={() => remove(s.id)} className="text-neutral-700">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>}

      {showForm && (
        <div className="border border-neutral-200 p-3 max-w-md">
          <div className="text-sm font-medium mb-2">{editId ? 'Edit Jadwal' : 'Tambah Jadwal'}</div>
          {error && <div className="text-sm text-neutral-700 mb-2" role="alert">{error}</div>}
          <form onSubmit={submit} className="space-y-2">
            <div>
              <label htmlFor="schedule-block" className="block text-sm mb-1">Blok</label>
              <select id="schedule-block" value={form.block_id} onChange={(e) => setForm({ ...form, block_id: e.target.value })} className="w-full border border-neutral-300 px-2 py-1.5 bg-white text-neutral-900" required>
                <option value="" className="bg-white text-neutral-900">Pilih Blok</option>
                {blocks.map((b) => (
                  <option key={b.id} value={b.id} className="bg-white text-neutral-900">{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="schedule-day" className="block text-sm mb-1">Hari</label>
              <select id="schedule-day" value={form.day_of_week} onChange={(e) => setForm({ ...form, day_of_week: e.target.value })} className="w-full border border-neutral-300 px-2 py-1.5 bg-white text-neutral-900">
                {days.map((d) => <option key={d} value={d} className="bg-white text-neutral-900">{d}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label htmlFor="schedule-start" className="block text-sm mb-1">Jam Mulai</label>
                <input id="schedule-start" type="time" value={form.time_start} onChange={(e) => setForm({ ...form, time_start: e.target.value })} className="w-full border border-neutral-300 px-2 py-1.5" required />
              </div>
              <div className="flex-1">
                <label htmlFor="schedule-end" className="block text-sm mb-1">Jam Selesai</label>
                <input id="schedule-end" type="time" value={form.time_end} onChange={(e) => setForm({ ...form, time_end: e.target.value })} className="w-full border border-neutral-300 px-2 py-1.5" required />
              </div>
            </div>
            <div>
              <label htmlFor="schedule-waste-type" className="block text-sm mb-1">Jenis Sampah</label>
              <input id="schedule-waste-type" value={form.waste_type} onChange={(e) => setForm({ ...form, waste_type: e.target.value })} className="w-full border border-neutral-300 px-2 py-1.5" required />
            </div>
            <div>
              <label htmlFor="schedule-notes" className="block text-sm mb-1">Catatan</label>
              <input id="schedule-notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full border border-neutral-300 px-2 py-1.5" />
            </div>
            <div className="flex gap-2">
              <button className="bg-[#15803D] text-white px-3 py-1.5">Simpan</button>
              <button type="button" onClick={() => setShowForm(false)} className="border border-neutral-300 px-3 py-1.5">Batal</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
