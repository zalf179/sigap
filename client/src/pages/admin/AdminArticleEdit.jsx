import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AppShell from '../../components/AppShell'
import api from '../../api/axios'

export default function AdminArticleEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [article, setArticle] = useState(null)
  const [form, setForm] = useState({ title: '', content: '' })
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    api.get(`/articles/admin/${id}`)
      .then((res) => {
        if (!active) return
        const data = res.data.article
        setArticle(data)
        setForm({ title: data.title, content: data.content })
      })
      .catch((err) => {
        if (!active) return
        setError(err.response?.status === 404 ? 'Artikel tidak ditemukan' : 'Gagal memuat artikel')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [id])

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview)
  }, [preview])

  const onFile = (event) => {
    const selected = event.target.files[0]
    setFile(selected)
    setError('')
    setPreview(selected ? URL.createObjectURL(selected) : null)
  }

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setSaving(true)
    try {
      const data = new FormData()
      data.append('title', form.title)
      data.append('content', form.content)
      if (file) data.append('cover', file)
      await api.put(`/articles/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
      navigate('/admin?tab=artikel', { replace: true })
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal menyimpan artikel')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <AppShell><div className="text-sm">Memuat artikel...</div></AppShell>
  }

  if (!article) {
    return (
      <AppShell>
        <h1 className="text-lg font-semibold mb-2">Edit Artikel</h1>
        <div className="text-sm text-neutral-700 mb-3" role="alert">{error || 'Artikel tidak ditemukan'}</div>
        <Link to="/admin?tab=artikel" className="text-sm text-[#15803D]">&larr; Kembali ke daftar artikel</Link>
      </AppShell>
    )
  }

  const updatedAt = article.updated_at || article.created_at

  return (
    <AppShell>
      <div className="mb-4">
        <Link to="/admin?tab=artikel" className="text-sm text-[#15803D]">&larr; Kembali ke daftar artikel</Link>
        <h1 className="text-lg font-semibold mt-2">Edit Artikel</h1>
        <p className="text-xs text-neutral-600 mt-1">
          Ditulis oleh {article.author_name}
          {updatedAt && <> &middot; Terakhir diperbarui {new Date(updatedAt).toLocaleString('id-ID')}</>}
        </p>
      </div>

      {error && <div className="text-sm text-neutral-700 mb-2" role="alert">{error}</div>}

      <form onSubmit={submit} className="space-y-3 max-w-2xl">
        <div>
          <label htmlFor="article-title" className="block text-sm mb-1">Judul</label>
          <input
            id="article-title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full border border-neutral-300 px-2 py-1.5"
            required
          />
        </div>

        <div>
          <label htmlFor="article-content" className="block text-sm mb-1">Isi</label>
          <textarea
            id="article-content"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="w-full border border-neutral-300 px-2 py-1.5"
            rows={16}
            required
          />
        </div>

        <div>
          <div className="block text-sm mb-1">Cover saat ini</div>
          {article.cover_path ? (
            <div className="border border-neutral-200 mb-2 w-fit max-w-full">
              <img src={article.cover_path} alt={`Cover ${article.title}`} className="max-h-64 max-w-full object-contain bg-white" />
            </div>
          ) : (
            <div className="text-sm text-neutral-600 mb-2">Artikel ini belum memiliki cover.</div>
          )}
          <label htmlFor="article-cover" className="block text-sm mb-1">
            {article.cover_path ? 'Ganti cover (jpg/png/webp, maks 5MB)' : 'Tambah cover (jpg/png/webp, maks 5MB)'}
          </label>
          <input id="article-cover" type="file" accept="image/jpeg,image/png,image/webp" onChange={onFile} />
          {preview && (
            <div className="mt-2">
              <div className="text-xs text-neutral-600 mb-1">Pratinjau cover baru</div>
              <div className="border border-neutral-200 w-fit max-w-full">
                <img src={preview} alt="Pratinjau cover baru" className="max-h-64 max-w-full object-contain bg-white" />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="bg-[#15803D] text-white px-3 py-1.5 disabled:opacity-60">
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
          <button type="button" onClick={() => navigate('/admin?tab=artikel')} className="border border-neutral-300 px-3 py-1.5">
            Batal
          </button>
        </div>
      </form>
    </AppShell>
  )
}
