import { useCallback, useEffect, useState } from 'react'
import AppShell from '../components/AppShell'
import PhotoLightbox from '../components/PhotoLightbox'
import ReportPhoto from '../components/ReportPhoto'
import api from '../api/axios'

function StatusBadge({ status }) {
  if (status === 'Menunggu') return <span className="text-xs px-2 py-0.5 border border-amber-600 text-amber-700">Menunggu</span>
  if (status === 'Sedang Diproses') return <span className="text-xs px-2 py-0.5 border border-blue-600 text-blue-700">Sedang Diproses</span>
  if (status === 'Selesai') return <span className="text-xs px-2 py-0.5 border border-[#15803D] text-[#15803D]">Selesai</span>
  return <span className="text-xs px-2 py-0.5 border border-neutral-300">{status}</span>
}

export default function PetugasDashboard() {
  const [reports, setReports] = useState([])
  const [blocks, setBlocks] = useState([])
  const [statusFilter, setStatusFilter] = useState('')
  const [blockFilter, setBlockFilter] = useState('')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [lightboxPhoto, setLightboxPhoto] = useState(null)
  const [proofFile, setProofFile] = useState(null)
  const [proofPreview, setProofPreview] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchData = () => {
    const params = {}
    if (statusFilter) params.status = statusFilter
    if (blockFilter) params.block_id = blockFilter
    if (search) params.search = search
    api.get('/officer/reports', { params })
      .then((res) => {
        const nextReports = res.data.reports || []
        setReports(nextReports)
        setSelected((current) => {
          if (!current) return current
          const latest = nextReports.find((report) => report.id === current.id)
          return latest ? { ...current, ...latest } : current
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  const openPhoto = (src, alt, returnFocus) => setLightboxPhoto({ src, alt, returnFocus })
  const closePhoto = useCallback(() => setLightboxPhoto(null), [])

  useEffect(() => {
    api.get('/blocks').then((res) => setBlocks(res.data.blocks || [])).catch(() => {})
    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [statusFilter, blockFilter, search])

  const process = async (id) => {
    setError('')
    try {
      await api.patch(`/officer/reports/${id}/process`)
      fetchData()
      if (selected && selected.id === id) {
        setSelected({ ...selected, status: 'Sedang Diproses' })
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal memproses')
    }
  }

  const onProof = (e) => {
    const f = e.target.files[0]
    setProofFile(f)
    if (f) setProofPreview(URL.createObjectURL(f))
    else setProofPreview(null)
  }

  const complete = async (id) => {
    setError('')
    if (!proofFile) {
      setError('Foto bukti wajib diunggah')
      return
    }
    try {
      const fd = new FormData()
      fd.append('proof', proofFile)
      await api.patch(`/officer/reports/${id}/complete`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setProofFile(null)
      setProofPreview(null)
      fetchData()
      if (selected && selected.id === id) {
        setSelected({ ...selected, status: 'Selesai' })
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal menyelesaikan')
    }
  }

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Dashboard Petugas</h1>
        <p className="text-sm text-gray-600 mt-1">Kelola dan proses laporan warga</p>
      </div>
      {error && <div className="text-sm text-red-700 mb-3 px-2 py-1.5 bg-red-50 border border-red-200" role="alert">{error}</div>}
      <div className="flex flex-wrap gap-2 mb-4">
        <select aria-label="Filter status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-gray-300 px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400">
          <option value="">Semua Status</option>
          <option value="Menunggu">Menunggu</option>
          <option value="Sedang Diproses">Sedang Diproses</option>
          <option value="Selesai">Selesai</option>
        </select>
        <select aria-label="Filter blok" value={blockFilter} onChange={(e) => setBlockFilter(e.target.value)} className="border border-gray-300 px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400">
          <option value="">Semua Blok</option>
          {blocks.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
        <input type="search" aria-label="Cari berdasarkan tiket atau nama warga" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari tiket atau nama warga" className="border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400" />
      </div>

      {loading && <div className="text-sm text-gray-600" role="status" aria-live="polite">Memuat...</div>}
      {!loading && reports.length === 0 && <div className="text-sm text-gray-600">Tidak ada laporan.</div>}
      {reports.length > 0 && (
        <div className="border border-gray-200 bg-white overflow-x-auto mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-2.5 font-medium text-gray-700">No. Tiket</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-700">Pelapor</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-700">Blok</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-700">Kategori</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-700">Status</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-700">Tanggal</th>
                <th className="text-left px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} className={`border-b border-gray-100 hover:bg-gray-50 ${r.status === 'Menunggu' ? 'bg-gray-50/50' : ''}`}>
                  <td className="px-4 py-2.5 text-gray-900 font-mono text-xs">{r.ticket_number}</td>
                  <td className="px-4 py-2.5 text-gray-900">{r.reporter_name}</td>
                  <td className="px-4 py-2.5 text-gray-700">{r.block_name}</td>
                  <td className="px-4 py-2.5 text-gray-700">{r.category_name}</td>
                  <td className="px-4 py-2.5"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-2.5 text-gray-600">{new Date(r.created_at).toLocaleString('id-ID')}</td>
                  <td className="px-4 py-2.5 text-right"><button onClick={() => { setSelected(r); setProofFile(null); setProofPreview(null); setError(''); }} className="text-[#15803D] hover:underline">Detail</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="border border-neutral-200 p-3 max-w-4xl">
          <div className="text-sm font-medium mb-2">Detail Laporan</div>
          <div className="space-y-1 text-sm mb-3">
            <div><span className="text-neutral-600">No. Tiket:</span> {selected.ticket_number}</div>
            <div><span className="text-neutral-600">Pelapor:</span> {selected.reporter_name}</div>
            <div><span className="text-neutral-600">Blok:</span> {selected.block_name}</div>
            <div><span className="text-neutral-600">Kategori:</span> {selected.category_name}</div>
            <div><span className="text-neutral-600">Patokan:</span> {selected.landmark}</div>
            <div><span className="text-neutral-600">Status:</span> {selected.status}</div>
          </div>
          <div className="report-photo-grid mb-3">
            <section className="report-photo-section">
              <div className="text-sm mb-1">Foto Laporan</div>
              <ReportPhoto src={selected.photo_path} alt="Foto laporan" onOpen={openPhoto} />
            </section>
            <section className="report-photo-section">
              <div className="text-sm mb-1">Foto Bukti Penutupan</div>
              <ReportPhoto src={selected.status === 'Selesai' ? selected.proof_photo_path : null} alt="Foto bukti penutupan" onOpen={openPhoto} />
            </section>
          </div>
          <div className="flex gap-2 mb-3">
            {selected.status === 'Menunggu' && (
              <button onClick={() => process(selected.id)} className="bg-[#15803D] text-white px-3 py-1.5">Proses</button>
            )}
            {selected.status === 'Sedang Diproses' && (
              <button onClick={() => complete(selected.id)} className="bg-[#15803D] text-white px-3 py-1.5">Selesaikan</button>
            )}
          </div>
          {selected.status === 'Sedang Diproses' && (
            <div className="space-y-2">
              <div>
                <label htmlFor="proof-photo" className="block text-sm mb-1">Foto Bukti (wajib)</label>
                <input id="proof-photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={onProof} />
              </div>
              {proofPreview && (
                <img src={proofPreview} alt="Pratinjau bukti" className="max-w-sm border border-neutral-200" />
              )}
            </div>
          )}
        </div>
      )}
      {lightboxPhoto && <PhotoLightbox photo={lightboxPhoto} onClose={closePhoto} />}
    </AppShell>
  )
}
