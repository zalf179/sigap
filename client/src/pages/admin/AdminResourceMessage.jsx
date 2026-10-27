export default function AdminResourceMessage({ state, errorStatus, onRetry, empty = false }) {
  if (state === 'loading') {
    return <p className="text-sm text-gray-600" role="status" aria-live="polite">Memuat...</p>
  }

  if (state === 'error') {
    return (
      <div className="space-y-1" role="alert">
        <p className="text-sm text-red-700">Gagal memuat data. Coba lagi.</p>
        <p className="text-xs text-gray-500">Status: {errorStatus}</p>
        <button type="button" onClick={onRetry} className="bg-[#15803D] text-white px-3 py-1.5 text-sm">Coba lagi</button>
      </div>
    )
  }

  if (empty) return <p className="text-sm text-gray-600">Belum ada data.</p>
  return null
}
