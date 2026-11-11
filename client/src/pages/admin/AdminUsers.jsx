import { useEffect, useRef, useState } from 'react'
import api from '../../api/axios'
import useAdminResource from './useAdminResource'
import AdminResourceMessage from './AdminResourceMessage'

export default function AdminUsers() {
  const resource = useAdminResource('/users')
  const users = resource.data?.users || []
  const [error, setError] = useState('')
  const resetDialogRef = useRef(null)
  const [resetOpen, setResetOpen] = useState(false)
  const [resetTarget, setResetTarget] = useState(null)
  const [resetResult, setResetResult] = useState(null)
  const [resetError, setResetError] = useState('')
  const [resetBusy, setResetBusy] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const dialog = resetDialogRef.current
    if (resetOpen && dialog && !dialog.open) dialog.showModal()
    if (!resetOpen && dialog?.open) dialog.close()
  }, [resetOpen])

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

  const openReset = (user) => {
    setError('')
    setResetTarget(user)
    setResetResult(null)
    setResetError('')
    setCopied(false)
    setResetOpen(true)
  }

  const submitReset = async () => {
    if (!resetTarget || resetBusy) return
    setResetBusy(true)
    setResetError('')
    try {
      const { data } = await api.post(`/users/${resetTarget.id}/reset-password`)
      setResetResult(data)
    } catch (err) {
      setResetError(err.response?.data?.error || 'Gagal mereset kata sandi')
    } finally {
      setResetBusy(false)
    }
  }

  const copyTempPassword = async () => {
    if (!resetResult?.temp_password) return
    try {
      await navigator.clipboard.writeText(resetResult.temp_password)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  const closeReset = () => {
    setResetOpen(false)
    setResetTarget(null)
    setResetResult(null)
    setResetError('')
    setCopied(false)
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
                <td className="p-2 flex gap-3">
                  <button onClick={() => openReset(u)} className="text-neutral-700">Reset sandi</button>
                  <button onClick={() => remove(u.id)} className="text-neutral-700">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>}

      <dialog
        ref={resetDialogRef}
        className="reset-password-dialog"
        aria-labelledby="reset-password-dialog-title"
        onCancel={closeReset}
        onClose={closeReset}
      >
        <div className="reset-password-content">
          {resetResult
            ? <>
              <h2 id="reset-password-dialog-title">Kata sandi berhasil direset</h2>
              <p>
                Sampaikan kata sandi sementara berikut kepada <strong>{resetResult.user?.name || resetTarget?.name}</strong>
                {' '}({resetResult.user?.email || resetTarget?.email}) dan sarankan untuk menyimpannya dengan aman.
              </p>
              <div className="reset-password-code" aria-label="Kata sandi sementara">{resetResult.temp_password}</div>
              <div className="reset-password-actions">
                <button type="button" className="reset-password-secondary" onClick={copyTempPassword} autoFocus>
                  {copied ? 'Tersalin' : 'Salin kata sandi'}
                </button>
                <button type="button" className="reset-password-primary" onClick={closeReset}>Selesai</button>
              </div>
            </>
            : <>
              <h2 id="reset-password-dialog-title">Reset kata sandi {resetTarget?.name}?</h2>
              <p>
                Kata sandi lama akan langsung tidak berlaku dan diganti dengan kata sandi sementara acak.
                Kata sandi sementara hanya ditampilkan sekali setelah proses ini.
              </p>
              {resetError && <div className="reset-password-error" role="alert">{resetError}</div>}
              <div className="reset-password-actions">
                <button type="button" className="reset-password-secondary" onClick={closeReset} disabled={resetBusy}>Batal</button>
                <button type="button" className="reset-password-primary" onClick={submitReset} disabled={resetBusy}>
                  {resetBusy ? 'Memproses…' : 'Ya, reset kata sandi'}
                </button>
              </div>
            </>}
        </div>
      </dialog>
    </div>
  )
}
