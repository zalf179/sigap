import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../components/AppShell'
import api from '../api/axios'

function StatusBadge({ status }) {
  if (status === 'Menunggu') return <span className="text-xs px-2 py-0.5 border border-amber-600 text-amber-700">Menunggu</span>
  if (status === 'Sedang Diproses') return <span className="text-xs px-2 py-0.5 border border-blue-600 text-blue-700">Sedang Diproses</span>
  if (status === 'Selesai') return <span className="text-xs px-2 py-0.5 border border-[#15803D] text-[#15803D]">Selesai</span>
  return <span className="text-xs px-2 py-0.5 border border-neutral-300">{status}</span>
}

export default function LaporanSaya() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = () => {
    api.get('/reports/mine')
      .then((res) => setReports(res.data.reports || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <AppShell>
      <h1 className="text-lg font-semibold mb-4">Laporan Saya</h1>
      {loading && <div className="text-sm">Memuat...</div>}
      {!loading && reports.length === 0 && <div className="text-sm text-neutral-700">Belum ada laporan.</div>}
      {reports.length > 0 && (
        <div className="border border-neutral-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left p-2">No. Tiket</th>
                <th className="text-left p-2">Lokasi</th>
                <th className="text-left p-2">Kategori</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Tanggal</th>
                <th className="text-left p-2"></th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} className="border-b border-neutral-100">
                  <td className="p-2">{r.ticket_number}</td>
                  <td className="p-2">{r.block_name}</td>
                  <td className="p-2">{r.category_name}</td>
                  <td className="p-2"><StatusBadge status={r.status} /></td>
                  <td className="p-2">{new Date(r.created_at).toLocaleString('id-ID')}</td>
                  <td className="p-2"><Link to={`/laporan/${r.id}`} className="text-[#15803D]">Detail</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  )
}
