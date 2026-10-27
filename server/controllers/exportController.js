import path from 'path'
import { fileURLToPath } from 'url'
import { query } from '../db/conn.js'
import ExcelJS from 'exceljs'
import PDFDocument from 'pdfkit'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fontPath = path.resolve(__dirname, '../assets/NotoSans-Regular.ttf')
const xlsxMime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

function parseDate(value) {
  if (!value) return null
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const date = new Date(`${value}T00:00:00Z`)
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : value
}

function displayDate(value) {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`
}

function safeText(value) {
  return value == null || value === '' ? '-' : String(value)
}

function buildCounts(rows, key) {
  const counts = new Map()
  rows.forEach((row) => {
    const label = safeText(row[key])
    counts.set(label, (counts.get(label) || 0) + 1)
  })
  return [...counts.entries()].sort(([a], [b]) => a.localeCompare(b, 'id'))
}

function makeSummary(rows) {
  return {
    metrics: [
      ['Laporan masuk', rows.length],
      ['Perlu ditangani', rows.filter((row) => row.status !== 'Selesai').length],
      ['Laporan selesai', rows.filter((row) => row.status === 'Selesai').length]
    ],
    blocks: buildCounts(rows, 'block'),
    categories: buildCounts(rows, 'category')
  }
}

function addWorkbook(rows, summary) {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'SIGAP'

  const summarySheet = workbook.addWorksheet('Ringkasan', { views: [{ state: 'frozen', ySplit: 1 }] })
  summarySheet.columns = [{ width: 30 }, { width: 20 }]
  const headerRows = [1]
  summarySheet.addRow(['Metrik', 'Nilai'])
  summary.metrics.forEach((row) => summarySheet.addRow(row))
  summarySheet.addRow([])
  headerRows.push(summarySheet.rowCount + 1)
  summarySheet.addRow(['Jumlah per blok', 'Jumlah'])
  summary.blocks.forEach((row) => summarySheet.addRow(row))
  summarySheet.addRow([])
  headerRows.push(summarySheet.rowCount + 1)
  summarySheet.addRow(['Jumlah per kategori', 'Jumlah'])
  summary.categories.forEach((row) => summarySheet.addRow(row))
  headerRows.forEach((rowNumber) => {
    const row = summarySheet.getRow(rowNumber)
    row.font = { bold: true }
    row.eachCell((cell) => { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F2EA' } } })
  })

  const reportSheet = workbook.addWorksheet('Laporan', { views: [{ state: 'frozen', ySplit: 1 }] })
  reportSheet.columns = [
    { header: 'Tanggal', key: 'date', width: 15 },
    { header: 'Blok', key: 'block', width: 22 },
    { header: 'Kategori', key: 'category', width: 24 },
    { header: 'Status', key: 'status', width: 24 },
    { header: 'Deskripsi', key: 'description', width: 60 }
  ]
  rows.forEach((row) => reportSheet.addRow({
    date: displayDate(row.report_date),
    block: safeText(row.block),
    category: safeText(row.category),
    status: safeText(row.status),
    description: safeText(row.description)
  }))
  reportSheet.getRow(1).font = { bold: true }
  reportSheet.getRow(1).eachCell((cell) => { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F2EA' } } })
  return workbook
}

function drawPdfTable(doc, rows) {
  const columns = [
    { title: 'Tanggal', key: 'date', width: 58 },
    { title: 'Blok', key: 'block', width: 76 },
    { title: 'Kategori', key: 'category', width: 88 },
    { title: 'Status', key: 'status', width: 102 },
    { title: 'Deskripsi', key: 'description', width: 211 }
  ]
  const tableWidth = columns.reduce((sum, column) => sum + column.width, 0)
  const left = doc.page.margins.left
  const bottom = doc.page.height - doc.page.margins.bottom
  const headerHeight = 24
  const pad = 4
  const drawHeader = () => {
    const headerTop = doc.y
    doc.save().rect(left, headerTop, tableWidth, headerHeight).fill('#E8F2EA').restore()
    doc.font('NotoSans').fontSize(8).fillColor('#111111')
    let x = left
    columns.forEach((column) => {
      doc.text(column.title, x + pad, headerTop + 6, { width: column.width - pad * 2, lineBreak: false })
      x += column.width
    })
    doc.y = headerTop + headerHeight
  }
  drawHeader()
  rows.forEach((row) => {
    const values = {
      date: displayDate(row.report_date),
      block: safeText(row.block),
      category: safeText(row.category),
      status: safeText(row.status),
      description: safeText(row.description)
    }
    doc.font('NotoSans').fontSize(7)
    const height = Math.max(22, ...columns.map((column) => doc.heightOfString(values[column.key], { width: column.width - pad * 2 }))) + pad * 2
    if (doc.y + height > bottom) {
      doc.addPage()
      drawHeader()
    }
    const rowTop = doc.y
    let x = left
    columns.forEach((column) => {
      doc.rect(x, rowTop, column.width, height).strokeColor('#D5D5D5').lineWidth(0.5).stroke()
      doc.text(values[column.key], x + pad, rowTop + pad, { width: column.width - pad * 2, height: height - pad * 2 })
      x += column.width
    })
    doc.y = rowTop + height
  })
}

function makePdf(rows, summary, { from, to, blockName }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 30, bufferPages: false })
    const chunks = []
    doc.on('data', (chunk) => chunks.push(chunk))
    doc.on('error', reject)
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.registerFont('NotoSans', fontPath)
    doc.font('NotoSans').fontSize(18).text('Laporan SIGAP', { align: 'center' })
    doc.moveDown(0.4)
    doc.fontSize(9).text(`Periode: ${displayDate(from)} – ${displayDate(to)} | Blok: ${blockName}`)
    doc.text(`Tanggal ekspor: ${displayDate(new Date())}`)
    doc.moveDown(0.8)
    doc.fontSize(12).text('Ringkasan')
    doc.moveDown(0.25)
    doc.fontSize(9)
    summary.metrics.forEach(([label, value]) => doc.text(`${label}: ${value}`))
    doc.moveDown(0.4)
    doc.fontSize(9).text('Jumlah per blok:')
    summary.blocks.forEach(([label, value]) => doc.text(`• ${label}: ${value}`, { indent: 10 }))
    doc.moveDown(0.25)
    doc.text('Jumlah per kategori:')
    summary.categories.forEach(([label, value]) => doc.text(`• ${label}: ${value}`, { indent: 10 }))
    doc.moveDown(0.6)
    doc.fontSize(12).text('Laporan')
    doc.moveDown(0.3)
    drawPdfTable(doc, rows)
    doc.end()
  })
}

export async function exportReports(req, res) {
  try {
    const { format, from: rawFrom, to: rawTo, block_id: blockId } = req.query
    let from = parseDate(rawFrom)
    let to = parseDate(rawTo)
    if (format === 'pdf') {
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth()
      if (!rawFrom) from = `${year}-${String(month + 1).padStart(2, '0')}-01`
      if (!rawTo) to = `${year}-${String(month + 1).padStart(2, '0')}-${String(new Date(year, month + 1, 0).getDate()).padStart(2, '0')}`
    }
    if ((rawFrom && !from) || (rawTo && !to)) {
      return res.status(400).json({ error: 'Tanggal laporan tidak valid.' })
    }
    if (from && to && to < from) {
      return res.status(400).json({ error: 'Tanggal akhir tidak boleh sebelum tanggal mulai.' })
    }
    if (format !== 'xlsx' && format !== 'pdf') {
      return res.status(400).json({ error: 'Format tidak valid. Gunakan xlsx atau pdf.' })
    }

    let sql = `SELECT DATE_FORMAT(r.created_at, '%Y-%m-%d') AS report_date,
                      r.status, r.landmark AS description,
                      b.name AS block, c.name AS category
               FROM reports r
               JOIN blocks b ON b.id = r.block_id
               JOIN waste_categories c ON c.id = r.category_id
               WHERE 1=1`
    const params = []
    if (from) { sql += ' AND DATE(r.created_at) >= ?'; params.push(from) }
    if (to) { sql += ' AND DATE(r.created_at) <= ?'; params.push(to) }
    if (blockId) { sql += ' AND r.block_id = ?'; params.push(blockId) }
    sql += ' ORDER BY r.created_at ASC'
    const rows = await query(sql, params)
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Tidak ada laporan pada rentang ini.' })
    }
    const summary = makeSummary(rows)
    const today = new Date().toISOString().slice(0, 10)
    const blockName = blockId ? rows[0].block : 'Semua Blok'
    const filename = `laporan-sigap-${today}.${format}`

    if (format === 'xlsx') {
      const buffer = await addWorkbook(rows, summary).xlsx.writeBuffer()
      res.setHeader('Content-Type', xlsxMime)
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
      return res.status(200).send(Buffer.from(buffer))
    }

    const buffer = await makePdf(rows, summary, {
      from: from || rows[0].report_date,
      to: to || rows[rows.length - 1].report_date,
      blockName
    })
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    return res.status(200).send(buffer)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: `Gagal menyiapkan laporan: ${error.message || 'kesalahan tidak diketahui.'}` })
  }
}
