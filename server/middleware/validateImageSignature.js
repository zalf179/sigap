import fs from 'fs/promises'

function detectImageType(buffer) {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg'
  if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png'
  if (buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') return 'image/webp'
  return null
}

export async function validateImageSignature(req, res, next) {
  if (!req.file) return next()

  let handle
  try {
    handle = await fs.open(req.file.path, 'r')
    const header = Buffer.alloc(12)
    const { bytesRead } = await handle.read(header, 0, header.length, 0)
    await handle.close()
    handle = null

    const detectedType = detectImageType(header.subarray(0, bytesRead))
    if (!detectedType || detectedType !== req.file.mimetype) {
      await fs.unlink(req.file.path)
      return res.status(400).json({ error: 'File harus berupa gambar JPEG, PNG, atau WebP yang valid.' })
    }
    return next()
  } catch (error) {
    await handle?.close().catch(() => {})
    await fs.unlink(req.file.path).catch(() => {})
    return next(error)
  }
}
