import { useState } from 'react'
import api from '../../api/axios'
import useAdminResource from './useAdminResource'
import AdminResourceMessage from './AdminResourceMessage'

export default function AdminArticles() {
  const resource = useAdminResource('/articles/admin')
  const articles = resource.data?.articles || []
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', content: '' })
  const [file, setFile] = useState(null)
  const [editId, setEditId] = useState(null)
  const [error, setError] = useState('')

  const openCreate = () => {
    setEditId(null)
    setForm({ title: '', content: '' })
    setFile(null)
    setShowForm(true)
    setError('')
  }

  const openEdit = (a) => {
    setEditId(a.id)
    setForm({ title: a.title, content: '' })
    setFile(null)
    setShowForm(true)
    setError('')
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const fd = new FormData()
      fd.append('title', form.title)
      fd.append('content', form.content)
      if (file) fd.append('cover', file)
      if (editId) {
        await api.put(`/articles/${editId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      } else {
        await api.post('/articles', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      }
      setShowForm(false)
      resource.retry()
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal menyimpan')
    }
  }

  const remove = async (id) => {
    if (!confirm('Hapus artikel ini?')) return
    try {
      await api.delete(`/articles/${id}`)
      resource.retry()
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menghapus')
    }
  }

  return (
    <div>
      <div className="flex justify-between mb-3">
      <div className="text-base font-medium">Artikel</div>
        <button onClick={openCreate} className="bg-[#15803D] text-white px-3 py-1.5 text-sm">Tambah Artikel</button>
      </div>
      {error && !showForm && <div className="text-sm text-neutral-700 mb-2" role="alert">{error}</div>}
      {resource.state !== 'success' || articles.length === 0
        ? <AdminResourceMessage state={resource.state} errorStatus={resource.errorStatus} onRetry={resource.retry} empty={resource.state === 'success'} />
        : <div className="border border-neutral-200 overflow-x-auto mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="text-left p-2">Judul</th>
              <th className="text-left p-2">Penulis</th>
              <th className="text-left p-2">Tanggal</th>
              <th className="text-left p-2"></th>
            </tr>
          </thead>
          <tbody>
            {articles.map((a) => (
              <tr key={a.id} className="border-b border-neutral-100">
                <td className="p-2">{a.title}</td>
                <td className="p-2">{a.author_name}</td>
                <td className="p-2">{new Date(a.created_at).toLocaleDateString('id-ID')}</td>
                <td className="p-2 flex gap-2">
                  <button onClick={() => openEdit(a)} className="text-[#15803D]">Edit</button>
                  <button onClick={() => remove(a.id)} className="text-neutral-700">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>}

      {showForm && (
        <div className="border border-neutral-200 p-3 max-w-md">
          <div className="text-sm font-medium mb-2">{editId ? 'Edit Artikel' : 'Tambah Artikel'}</div>
          {error && <div className="text-sm text-neutral-700 mb-2" role="alert">{error}</div>}
          <form onSubmit={submit} className="space-y-2">
            <div>
              <label htmlFor="article-title" className="block text-sm mb-1">Judul</label>
              <input id="article-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border border-neutral-300 px-2 py-1.5" required />
            </div>
            <div>
              <label htmlFor="article-content" className="block text-sm mb-1">Isi</label>
              <textarea id="article-content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="w-full border border-neutral-300 px-2 py-1.5" rows={4} required />
            </div>
            <div>
              <label htmlFor="article-cover" className="block text-sm mb-1">Cover (jpg/png/webp)</label>
              <input id="article-cover" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setFile(e.target.files[0])} />
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
