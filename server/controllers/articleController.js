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
      'SELECT id_artikel AS id, judul AS title, slug, gambar_sampul AS cover_path, tanggal_dibuat AS created_at FROM artikel ORDER BY tanggal_dibuat DESC LIMIT 10'
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
      'SELECT a.id_artikel AS id, a.judul AS title, a.slug, a.isi AS content, a.gambar_sampul AS cover_path, a.tanggal_dibuat AS created_at, a.tanggal_diperbarui AS updated_at, u.nama as author_name FROM artikel a JOIN admin u ON u.id_admin = a.id_admin WHERE a.slug = ?',
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
      'SELECT a.id_artikel AS id, a.judul AS title, a.slug, a.gambar_sampul AS cover_path, a.tanggal_dibuat AS created_at, a.tanggal_diperbarui AS updated_at, u.nama as author_name FROM artikel a JOIN admin u ON u.id_admin = a.id_admin ORDER BY a.tanggal_dibuat DESC'
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
      'SELECT a.id_artikel AS id, a.judul AS title, a.slug, a.isi AS content, a.gambar_sampul AS cover_path, a.tanggal_dibuat AS created_at, a.tanggal_diperbarui AS updated_at, u.nama as author_name FROM artikel a JOIN admin u ON u.id_admin = a.id_admin WHERE a.id_artikel = ?',
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
      'INSERT INTO artikel (judul, slug, isi, gambar_sampul, id_admin) VALUES (?, ?, ?, ?, ?)',
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
    const articles = await query('SELECT id_artikel AS id FROM artikel WHERE id_artikel = ?', [id])
    if (articles.length === 0) {
      return res.status(404).json({ error: 'Artikel tidak ditemukan' })
    }
    let sql = 'UPDATE artikel SET judul = ?, isi = ?'
    const params = [title, content]
    if (req.file) {
      sql += ', gambar_sampul = ?'
      params.push(`/uploads/${req.file.filename}`)
    }
    sql += ' WHERE id_artikel = ?'
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
    await query('DELETE FROM artikel WHERE id_artikel = ?', [id])
    res.json({ message: 'Artikel dihapus' })
  } catch (e) {
    next(e)
  }
}
