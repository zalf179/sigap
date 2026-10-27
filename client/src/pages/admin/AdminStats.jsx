import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import useAdminResource from './useAdminResource'
import AdminResourceMessage from './AdminResourceMessage'

export default function AdminStats() {
  const statsResource = useAdminResource('/stats')
  const blocksResource = useAdminResource('/blocks')
  const stats = statsResource.data
  const blocks = blocksResource.data?.blocks || []
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [blockId, setBlockId] = useState('')

  const download = async (format) => {
    const params = new URLSearchParams()
    if (from) params.append('from', from)
    if (to) params.append('to', to)
    if (blockId) params.append('block_id', blockId)
    params.append('format', format)
    const token = localStorage.getItem('token')
    const res = await fetch(`/api/reports/export?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const blob = await res.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = format === 'xlsx' ? 'laporan-sigap.xlsx' : 'laporan-sigap.pdf'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const resourceState = statsResource.state === 'error' || blocksResource.state === 'error'
    ? 'error'
    : statsResource.state === 'loading' || blocksResource.state === 'loading' ? 'loading' : 'success'
  if (resourceState !== 'success') {
    return <AdminResourceMessage
      state={resourceState}
      errorStatus={statsResource.state === 'error' ? statsResource.errorStatus : blocksResource.errorStatus}
      onRetry={() => { statsResource.retry(); blocksResource.retry() }}
    />
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="admin-stat border border-neutral-200 p-3">
          <div className="admin-stat-label">Laporan masuk</div>
          <div className="admin-stat-value">{stats.totals.masuk}</div>
        </div>
        <div className="admin-stat border border-neutral-200 p-3">
          <div className="admin-stat-label">Perlu ditangani</div>
          <div className="admin-stat-value">{stats.totals.tertunda}</div>
        </div>
        <div className="admin-stat border border-neutral-200 p-3">
          <div className="admin-stat-label">Laporan selesai</div>
          <div className="admin-stat-value">{stats.totals.selesai}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-neutral-200 p-3">
          <div className="admin-chart-title">Laporan per blok</div>
          {stats.perBlock.length === 0
            ? <p className="text-sm text-gray-600">Belum ada data.</p>
            : <div style={{ width: '100%', height: 200 }}>
                <ResponsiveContainer>
                  <BarChart data={stats.perBlock}>
                    <XAxis dataKey="block" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Bar dataKey="count" fill="#47784E" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>}
        </div>
        <div className="border border-neutral-200 p-3">
          <div className="admin-chart-title">Laporan per kategori</div>
          {stats.perCategory.length === 0
            ? <p className="text-sm text-gray-600">Belum ada data.</p>
            : <div style={{ width: '100%', height: 200 }}>
                <ResponsiveContainer>
                  <BarChart data={stats.perCategory}>
                    <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Bar dataKey="count" fill="#B95F42" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>}
        </div>
      </div>

      <div className="border border-neutral-200 p-3">
        <h2 className="admin-chart-title">Unduh laporan</h2>
        <div className="flex flex-wrap gap-2 mb-2">
          <input aria-label="Tanggal mulai" type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="border border-neutral-300 px-2 py-1.5" />
          <input aria-label="Tanggal akhir" type="date" value={to} onChange={(e) => setTo(e.target.value)} className="border border-neutral-300 px-2 py-1.5" />
          <select aria-label="Filter blok" value={blockId} onChange={(e) => setBlockId(e.target.value)} className="border border-neutral-300 px-2 py-1.5 bg-white text-neutral-900">
            <option value="" className="bg-white text-neutral-900">Semua Blok</option>
            {blocks.map((b) => (
              <option key={b.id} value={b.id} className="bg-white text-neutral-900">{b.name}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button onClick={() => download('xlsx')} className="bg-[#15803D] text-white px-3 py-1.5">Unduh Excel</button>
          <button onClick={() => download('pdf')} className="border border-neutral-300 px-3 py-1.5">Unduh PDF</button>
        </div>
      </div>
    </div>
  )
}
