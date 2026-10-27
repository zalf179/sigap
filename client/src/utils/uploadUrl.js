export function getUploadUrl(storedPath) {
  if (!storedPath) return ''
  const segments = String(storedPath).replace(/\\/g, '/').split('/').filter(Boolean)
  const uploadIndex = segments.lastIndexOf('uploads')
  const fileSegments = uploadIndex >= 0 ? segments.slice(uploadIndex + 1) : segments.slice(-1)
  if (fileSegments.length === 0) return ''
  return `/uploads/${fileSegments.map((segment) => encodeURIComponent(segment)).join('/')}`
}
