import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell'
import api from '../api/axios'

export default function BuatLaporan() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state || {}
  const [blocks, setBlocks] = useState([])
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({ block_id: '', landmark: '', category_id: state.categoryId || '' })
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [ticket, setTicket] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/blocks').then((res) => setBlocks(res.data.blocks || [])).catch(() => {})
    api.get('/categories').then((res) => setCategories(res.data.categories || [])).catch(() => {})
  }, [])

  const onFile = (e) => {
    const f = e.target.files[0]
    setFile(f)
    setError('')
    if (f) setPreview(URL.createObjectURL(f))
    else setPreview(null)
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setTicket('')
    if (!file) {
      setError('Foto laporan wajib diunggah')
      return
    }
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('block_id', form.block_id)
      fd.append('landmark', form.landmark)
      fd.append('category_id', form.category_id)
      fd.append('photo', file)
      const res = await api.post('/reports', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setTicket(res.data.ticket_number)
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal membuat laporan')
    } finally {
      setLoading(false)
    }
  }

  if (ticket) {
    return (
      <AppShell>
        <h1 className="text-lg font-semibold mb-2">Laporan Berhasil Dibuat</h1>
        <p className="text-sm mb-3" role="status" aria-live="polite">Laporan berhasil dibuat. Nomor tiket: <span className="font-medium">{ticket}</span></p>
        <div className="flex gap-2">
          <button onClick={() => navigate('/laporan-saya')} className="bg-[#15803D] text-white px-3 py-1.5">Lihat Laporan Saya</button>
          <button onClick={() => navigate('/beranda')} className="border border-neutral-300 px-3 py-1.5">Kembali ke Beranda</button>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <h1 className="text-lg font-semibold mb-4">Buat Laporan</h1>
      {error && <div className="text-sm text-neutral-700 mb-2" role="alert">{error}</div>}
      <form onSubmit={submit} className="space-y-3 max-w-md">
        <div>
          <label htmlFor="report-block" className="block text-sm mb-1">Lokasi (Blok)</label>
          <select id="report-block" value={form.block_id} onChange={(e) => setForm({ ...form, block_id: e.target.value })} className="w-full border border-neutral-300 px-2 py-1.5 bg-white text-neutral-900" required>
            <option value="" className="bg-white text-neutral-900">Pilih Blok</option>
            {blocks.map((b) => (
              <option key={b.id} value={b.id} className="bg-white text-neutral-900">{b.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="report-landmark" className="block text-sm mb-1">Patokan Detail</label>
          <textarea id="report-landmark" value={form.landmark} onChange={(e) => setForm({ ...form, landmark: e.target.value })} className="w-full border border-neutral-300 px-2 py-1.5" rows={3} required />
        </div>
        <div>
          <label htmlFor="report-category" className="block text-sm mb-1">Kategori</label>
          <select id="report-category" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="w-full border border-neutral-300 px-2 py-1.5 bg-white text-neutral-900" required>
            <option value="" className="bg-white text-neutral-900">Pilih Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id} className="bg-white text-neutral-900">{c.name}</option>
            ))}
          </select>
          {state.categoryName && <div className="text-xs text-neutral-600 mt-1">Dari hasil identifikasi: {state.categoryName}</div>}
        </div>
        <div>
          <label htmlFor="report-photo" className="block text-sm mb-1">Foto (jpg/png/webp, maks 5MB)</label>
          <input id="report-photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={onFile} />
        </div>
        {preview && (
          <div className="border border-neutral-200">
            <img src={preview} alt="Pratinjau" className="w-full max-h-64 object-contain bg-white" />
          </div>
        )}
        <button disabled={loading} className="bg-[#15803D] text-white px-3 py-1.5">Kirim Laporan</button>
      </form>
    </AppShell>
  )
}
