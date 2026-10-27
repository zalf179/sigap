import { readFile } from 'fs/promises'
import { basename } from 'path'
import { query } from '../db/conn.js'

export async function classifyWasteImage(filePath, contentType = 'image/jpeg') {
  const aiServiceUrl = process.env.AI_WASTE_URL || 'http://127.0.0.1:8000/api/v1/identify'
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), Number(process.env.AI_WASTE_TIMEOUT_MS) || 300_000)
  timeout.unref?.()

  try {
    const image = await readFile(filePath)
    const form = new FormData()
    form.append('file', new Blob([image], { type: contentType }), basename(filePath))

    let response
    try {
      response = await fetch(aiServiceUrl, {
        method: 'POST',
        body: form,
        signal: controller.signal
      })
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Layanan identifikasi sampah melewati batas waktu.')
      }
      throw new Error(`Layanan AI tidak dapat dihubungi di ${aiServiceUrl}.`)
    }

    const payload = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(payload.detail || payload.error || `Layanan AI merespons HTTP ${response.status}.`)
    }

    const provider = String(payload.provider || '').trim()
    if (!provider) throw new Error('Layanan AI tidak mengirim nama model/provider.')

    const categories = await query(
      'SELECT id, name, description, handling_instruction FROM waste_categories'
    )
    const categoryByName = new Map(categories.map((category) => [category.name.toLowerCase(), category]))

    const resolveCategory = (categoryName, classInstruction, modelLabel) => {
      const normalizedName = String(categoryName || '').trim()
      const category = categoryByName.get(normalizedName.toLowerCase())
      if (!category) {
        throw new Error(`Kategori "${normalizedName || '-'}" belum tersedia di database SIGAP.`)
      }
      if (!classInstruction) {
        console.warn(`[AI identify] Mapping petunjuk untuk label "${modelLabel || '-'}" tidak ada; memakai petunjuk kategori "${category.name}".`)
      }
      return {
        id: category.id,
        name: category.name,
        handling_instruction: classInstruction || category.handling_instruction
      }
    }

    const modelLabel = String(payload.model_label || payload.asli_dari_model || '').trim()
    const category = resolveCategory(payload.kategori_sampah, payload.handling_instruction, modelLabel)
    const confidence = Number(payload.confidence)
    if (!Number.isFinite(confidence) || confidence < 0 || confidence > 1) {
      throw new Error('Layanan AI mengirim nilai confidence yang tidak valid.')
    }

    const top3 = Array.isArray(payload.top3) ? payload.top3.map((candidate) => ({
      model_label: candidate.model_label,
      label_display: candidate.label_display || candidate.model_label,
      confidence: Number(candidate.confidence),
      confidence_text: candidate.confidence_text,
      category: resolveCategory(candidate.category, candidate.handling_instruction, candidate.model_label)
      })) : []

    return {
      provider,
      category,
      modelLabel,
      labelDisplay: payload.label_display || modelLabel,
      confidence,
      confidenceText: payload.confidence_text,
      top3,
      accuracyText: payload.akurasi
    }
  } finally {
    clearTimeout(timeout)
  }
}
