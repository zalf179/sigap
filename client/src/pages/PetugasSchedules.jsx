import { useState } from 'react'
import AppShell from '../components/AppShell'
import useAdminResource from './admin/useAdminResource'
import AdminResourceMessage from './admin/AdminResourceMessage'

export default function PetugasSchedules() {
  const schedulesResource = useAdminResource('/pickup-schedules/admin')
  const blocksResource = useAdminResource('/blocks')
  const schedules = schedulesResource.data?.schedules || []
  const blocks = blocksResource.data?.blocks || []
  const [blockFilter, setBlockFilter] = useState('')

  const filtered = blockFilter ? schedules.filter((s) => s.block_id === Number(blockFilter)) : schedules
  const retryLoad = () => { schedulesResource.retry(); blocksResource.retry() }
  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Jadwal Angkut</h1>
        <p className="text-sm text-gray-600 mt-1">Daftar jadwal pengangkutan sampah per blok (hanya lihat, perubahan diatur pengelola)</p>
      </div>
      <div className="mb-4">
        <select aria-label="Filter blok" value={blockFilter} onChange={(e) => setBlockFilter(e.target.value)} className="border border-gray-300 px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400">
          <option value="">Semua Blok</option>
          {blocks.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>
      {schedulesResource.state !== 'success' || blocksResource.state !== 'success' || filtered.length === 0
        ? <AdminResourceMessage
            state={schedulesResource.state === 'error' || blocksResource.state === 'error' ? 'error' : schedulesResource.state === 'loading' || blocksResource.state === 'loading' ? 'loading' : 'success'}
            errorStatus={schedulesResource.state === 'error' ? schedulesResource.errorStatus : blocksResource.errorStatus}
            onRetry={retryLoad}
            empty={schedulesResource.state === 'success' && blocksResource.state === 'success' && filtered.length === 0}
          />
        : <div className="border border-neutral-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="text-left p-2">Blok</th>
              <th className="text-left p-2">Hari</th>
              <th className="text-left p-2">Waktu</th>
              <th className="text-left p-2">Jenis Sampah</th>
              <th className="text-left p-2">Catatan</th>
            </tr>
          </thead>
          <tbody>
            {filtered
              .sort((a, b) =>
                (a.block_name || '').localeCompare(b.block_name || '') ||
                days.indexOf(a.day_of_week) - days.indexOf(b.day_of_week) ||
                (a.time_start || '').localeCompare(b.time_start || ''))
              .map((s) => (
                <tr key={s.id} className="border-b border-neutral-100">
                  <td className="p-2">{s.block_name}</td>
                  <td className="p-2">{s.day_of_week}</td>
                  <td className="p-2">{s.time_start?.slice(0,5)} - {s.time_end?.slice(0,5)}</td>
                  <td className="p-2">{s.waste_type}</td>
                  <td className="p-2">{s.notes}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>}
    </AppShell>
  )
}
