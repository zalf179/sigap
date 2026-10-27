import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import AppShell from '../components/AppShell'
import api from '../api/axios'

export default function ArtikelDetail() {
  const { slug } = useParams()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/articles/public/${slug}`)
      .then((res) => setArticle(res.data.article))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return <AppShell><div className="text-sm">Memuat...</div></AppShell>
  if (!article) return <AppShell><div className="text-sm">Artikel tidak ditemukan</div></AppShell>

  return (
    <AppShell>
      <article className="max-w-2xl">
        <h1 className="text-lg font-semibold mb-1">{article.title}</h1>
        <div className="text-xs text-neutral-600 mb-3">{new Date(article.created_at).toLocaleDateString('id-ID')} - {article.author_name}</div>
        {article.cover_path && (
          <img src={article.cover_path} alt={article.title} className="mb-3 border border-neutral-200 max-w-full" />
        )}
        <div className="text-sm whitespace-pre-line leading-relaxed">{article.content}</div>
      </article>
    </AppShell>
  )
}
