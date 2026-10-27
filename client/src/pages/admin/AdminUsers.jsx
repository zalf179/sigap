import { useState } from 'react'
import api from '../../api/axios'
import useAdminResource from './useAdminResource'
import AdminResourceMessage from './AdminResourceMessage'

export default function AdminUsers() {
  const resource = useAdminResource('/users')
  const users = resource.data?.users || []
  const [error, setError] = useState('')

  const changeRole = async (id, role) => {
    setError('')
    try {
      await api.patch(`/users/${id}/role`, { role })
      resource.retry()
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal mengubah role')
    }
  }

  const remove = async (id) => {
    if (!confirm('Hapus pengguna ini?')) return
    try {
      await api.delete(`/users/${id}`)
      resource.retry()
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menghapus')
    }
  }

  return (
    <div>
      <div className="text-base font-medium mb-3">Pengguna</div>
      {error && <div className="text-sm text-neutral-700 mb-2" role="alert">{error}</div>}
      {resource.state !== 'success' || users.length === 0
        ? <AdminResourceMessage state={resource.state} errorStatus={resource.errorStatus} onRetry={resource.retry} empty={resource.state === 'success'} />
        : <div className="border border-neutral-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="text-left p-2">Nama</th>
              <th className="text-left p-2">Email</th>
              <th className="text-left p-2">Role</th>
              <th className="text-left p-2"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-neutral-100">
                <td className="p-2">{u.name}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2">
                  <select aria-label={`Peran untuk ${u.name}`} value={u.role} onChange={(e) => changeRole(u.id, e.target.value)} className="border border-neutral-300 px-2 py-1 bg-white text-neutral-900">
                    <option value="warga">warga</option>
                    <option value="petugas">petugas</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td className="p-2"><button onClick={() => remove(u.id)} className="text-neutral-700">Hapus</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>}
    </div>
  )
}
