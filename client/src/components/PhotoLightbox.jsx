import { useEffect, useRef } from 'react'

export default function PhotoLightbox({ photo, onClose }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    const previousFocus = photo.returnFocus
    const closeButton = dialogRef.current?.querySelector('button')
    closeButton?.focus()

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab') return

      const focusable = dialogRef.current?.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
      if (!focusable?.length) {
        event.preventDefault()
        dialogRef.current?.focus()
        return
      }
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      if (previousFocus?.isConnected) previousFocus.focus()
    }
  }, [onClose, photo.returnFocus])

  return (
    <div className="photo-lightbox-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <div className="photo-lightbox-dialog" role="dialog" aria-modal="true" aria-label={`Foto ukuran penuh: ${photo.alt}`} ref={dialogRef} tabIndex={-1}>
        <button className="photo-lightbox-close" type="button" aria-label="Tutup foto" onClick={onClose}>
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m6 6 12 12M18 6 6 18" /></svg>
        </button>
        <img src={photo.src} alt={photo.alt} />
      </div>
    </div>
  )
}
