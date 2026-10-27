import { useEffect, useState } from 'react'
import { getUploadUrl } from '../utils/uploadUrl'

export default function ReportPhoto({ src, alt, onOpen }) {
  const [status, setStatus] = useState(src ? 'loading' : 'empty')
  const [attempt, setAttempt] = useState(0)
  const imageUrl = getUploadUrl(src)

  useEffect(() => {
    setStatus(src ? 'loading' : 'empty')
    setAttempt(0)
  }, [src])

  if (!src) {
    return <div className="report-photo-empty">Tidak ada foto</div>
  }

  const requestUrl = `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}retry=${attempt}`

  return (
    <div className={`report-photo-frame${status === 'error' ? ' is-error' : ''}`}>
      {status !== 'error' && (
        <button
          className={`report-photo-open${status === 'loaded' ? ' is-loaded' : ''}`}
          type="button"
          disabled={status !== 'loaded'}
          aria-label={`Perbesar ${alt.toLowerCase()}`}
          onClick={(event) => onOpen(imageUrl, alt, event.currentTarget)}
        >
          <img
            src={requestUrl}
            alt={alt}
            loading="lazy"
            decoding="async"
            onLoad={() => setStatus('loaded')}
            onError={() => setStatus('error')}
          />
        </button>
      )}
      {status === 'loading' && <div className="report-photo-loading" aria-label="Memuat foto" />}
      {status === 'error' && (
        <div className="report-photo-error" role="status">
          <span>Foto tidak dapat dimuat</span>
          <button type="button" onClick={() => { setStatus('loading'); setAttempt((count) => count + 1) }}>Coba lagi</button>
        </div>
      )}
    </div>
  )
}
