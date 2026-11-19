import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uploadsDirectory = path.resolve(__dirname, '../uploads')

export function resolveUploadPath(fileName) {
  if (typeof fileName !== 'string') {
    throw new TypeError('Uploaded file name must be a string.')
  }

  const safeName = path.basename(fileName)
  if (!safeName || safeName === '.' || safeName === '..' || safeName !== fileName) {
    throw new TypeError('Invalid uploaded file name.')
  }

  const resolvedPath = path.resolve(uploadsDirectory, safeName)
  const relativePath = path.relative(uploadsDirectory, resolvedPath)
  if (!relativePath || relativePath.startsWith(`..${path.sep}`) || path.isAbsolute(relativePath)) {
    throw new TypeError('Uploaded file path must remain inside the uploads directory.')
  }

  return resolvedPath
}
