import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import AppShell from '../components/AppShell'
import api from '../api/axios'

export default function DetailLaporan() {
  const { id } = useParams()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchData = () => {
    api.get(`/reports/${id}`)
      .then((res) => setReport(res.data.report))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [id])

  if (loading) return <AppShell><div className="text-sm">Memuat...</div></AppShell>
  if (!report) return <AppShell><div className="text-sm">Laporan tidak ditemukan</div></AppShell>

  const steps = [
    { key: 'Menunggu', label: 'Menunggu', done: true },
    { key: 'Sedang Diproses', label: 'Sedang Diproses', done: report.status === 'Sedang Diproses' || report.status === 'Selesai' },
    { key: 'Selesai', label: 'Selesai', done: report.status === 'Selesai' },
  ]

  return (
    <AppShell>
      <h1 className="text-lg font-semibold mb-2">Detail Laporan</h1>
      <p className="text-sm mb-4">No. Tiket: <span className="font-medium">{report.ticket_number}</span></p>

      <div className="space-y-2 text-sm mb-4">
        <div><span className="text-neutral-600">Lokasi:</span> {report.block_name}</div>
        <div><span className="text-neutral-600">Patokan:</span> {report.landmark}</div>
        <div><span className="text-neutral-600">Kategori:</span> {report.category_name}</div>
        <div><span className="text-neutral-600">Dibuat:</span> {new Date(report.created_at).toLocaleString('id-ID')}</div>
      </div>

      <div className="mb-4">
        <div className="text-sm font-medium mb-2">Status</div>
        <div className="space-y-2">
          {steps.map((s, idx) => (
            <div key={s.key} className="flex items-start gap-2">
              <div className={`w-3 h-3 mt-1 ${s.done ? 'bg-[#15803D]' : 'border border-neutral-400'}`} />
              <div>
                <div className="text-sm">{s.label}</div>
                {s.key === 'Menunggu' && report.created_at && <div className="text-xs text-neutral-600">{new Date(report.created_at).toLocaleString('id-ID')}</div>}
                {s.key === 'Sedang Diproses' && report.processed_at && <div className="text-xs text-neutral-600">{new Date(report.processed_at).toLocaleString('id-ID')}</div>}
                {s.key === 'Selesai' && report.completed_at && <div className="text-xs text-neutral-600">{new Date(report.completed_at).toLocaleString('id-ID')}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <div className="text-sm font-medium mb-2">Foto Laporan</div>
        {report.photo_path && (
          <img src={report.photo_path} alt="Foto laporan" className="max-w-sm border border-neutral-200" />
        )}
      </div>

      {report.status === 'Selesai' && report.proof_photo_path && (
        <div>
          <div className="text-sm font-medium mb-2">Foto Bukti Penutupan</div>
          <img src={report.proof_photo_path} alt="Foto bukti" className="max-w-sm border border-neutral-200" />
        </div>
      )}
    </AppShell>
  )
}
