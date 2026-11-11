import { query } from '../db/conn.js'

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
}

export async function publicListArticles(req, res, next) {
  try {
    const articles = await query(
      'SELECT id, title, slug, cover_path, created_at FROM articles ORDER BY created_at DESC LIMIT 10'
    )
    res.json({ articles })
  } catch (e) {
    next(e)
  }
}

export async function publicGetArticle(req, res, next) {
  try {
    const { slug } = req.params
    const articles = await query(
      'SELECT a.id, a.title, a.slug, a.content, a.cover_path, a.created_at, a.updated_at, u.name as author_name FROM articles a JOIN users u ON u.id = a.author_id WHERE a.slug = ?',
      [slug]
    )
    if (articles.length === 0) {
      return res.status(404).json({ error: 'Artikel tidak ditemukan' })
    }
    res.json({ article: articles[0] })
  } catch (e) {
    next(e)
  }
}

export async function adminListArticles(req, res, next) {
  try {
    const articles = await query(
      'SELECT a.id, a.title, a.slug, a.cover_path, a.created_at, a.updated_at, u.name as author_name FROM articles a JOIN users u ON u.id = a.author_id ORDER BY a.created_at DESC'
    )
    res.json({ articles })
  } catch (e) {
    next(e)
  }
}

export async function adminGetArticle(req, res, next) {
  try {
    const { id } = req.params
    const articles = await query(
      'SELECT a.id, a.title, a.slug, a.content, a.cover_path, a.created_at, a.updated_at, u.name as author_name FROM articles a JOIN users u ON u.id = a.author_id WHERE a.id = ?',
      [id]
    )
    if (articles.length === 0) {
      return res.status(404).json({ error: 'Artikel tidak ditemukan' })
    }
    res.json({ article: articles[0] })
  } catch (e) {
    next(e)
  }
}

export async function createArticle(req, res, next) {
  try {
    const { title, content } = req.body
    if (!title || !content) {
      return res.status(400).json({ error: 'Judul dan isi wajib diisi' })
    }
    const slug = slugify(title) + '-' + Date.now().toString().slice(-6)
    const cover_path = req.file ? `/uploads/${req.file.filename}` : null
    await query(
      'INSERT INTO articles (title, slug, content, cover_path, author_id) VALUES (?, ?, ?, ?, ?)',
      [title, slug, content, cover_path, req.user.id]
    )
    res.status(201).json({ message: 'Artikel dibuat' })
  } catch (e) {
    next(e)
  }
}

export async function updateArticle(req, res, next) {
  try {
    const { id } = req.params
    const { title, content } = req.body
    if (!title || !content) {
      return res.status(400).json({ error: 'Judul dan isi wajib diisi' })
    }
    const articles = await query('SELECT id FROM articles WHERE id = ?', [id])
    if (articles.length === 0) {
      return res.status(404).json({ error: 'Artikel tidak ditemukan' })
    }
    let sql = 'UPDATE articles SET title = ?, content = ?'
    const params = [title, content]
    if (req.file) {
      sql += ', cover_path = ?'
      params.push(`/uploads/${req.file.filename}`)
    }
    sql += ' WHERE id = ?'
    params.push(id)
    await query(sql, params)
    res.json({ message: 'Artikel diperbarui' })
  } catch (e) {
    next(e)
  }
}

export async function deleteArticle(req, res, next) {
  try {
    const { id } = req.params
    await query('DELETE FROM articles WHERE id = ?', [id])
    res.json({ message: 'Artikel dihapus' })
  } catch (e) {
    next(e)
  }
}
