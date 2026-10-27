import { unlink } from 'fs/promises'
import { classifyWasteImage } from '../services/classifier.js'

export async function identifyWaste(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Foto wajib diunggah' })
    }
    const result = await classifyWasteImage(req.file.path, req.file.mimetype)
    res.json({
      category: {
        id: result.category.id,
        name: result.category.name,
        handling_instruction: result.category.handling_instruction
      },
      photo_path: `/uploads/${req.file.filename}`,
      provider: result.provider,
      model_label: result.modelLabel,
      label_display: result.labelDisplay,
      confidence: result.confidence,
      confidence_text: result.confidenceText,
      akurasi: result.accuracyText,
      top3: result.top3
    })
  } catch (e) {
    await unlink(req.file.path).catch(() => {})
    next(e)
  }
}
