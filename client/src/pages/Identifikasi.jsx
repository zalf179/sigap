import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell'
import api from '../api/axios'

const CONFIDENCE_THRESHOLD = 0.60

export default function Identifikasi() {
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
  const [selectedAlternative, setSelectedAlternative] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onFile = (e) => {
    const f = e.target.files[0]
    setFile(f)
    setResult(null)
    setSelectedAlternative(null)
    setError('')
    if (f) {
      setPreview(URL.createObjectURL(f))
    } else {
      setPreview(null)
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!file) {
      setError('Pilih foto terlebih dahulu')
      return
    }
    setLoading(true)
    setError('')
    try {
      const form = new FormData()
      form.append('image', file)
      const res = await api.post('/identify', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      setResult(res.data)
      setSelectedAlternative(null)
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal mengidentifikasi sampah')
    } finally {
      setLoading(false)
    }
  }

  const displayedResult = selectedAlternative && result
    ? { ...result, ...selectedAlternative }
    : result
  const isLowConfidence = Boolean(result) && Number(result.confidence) < CONFIDENCE_THRESHOLD
  const needsUserChoice = isLowConfidence && !selectedAlternative

  const goReport = () => {
    if (!displayedResult || needsUserChoice) return
    navigate('/lapor', { state: { categoryId: displayedResult.category.id, categoryName: displayedResult.category.name } })
  }

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Identifikasi Sampah</h1>
        <p className="text-sm text-gray-600 mt-1">Unggah foto sampah untuk mengidentifikasi jenis dan cara penanganannya</p>
      </div>
      <div className="border border-gray-200 bg-white max-w-lg">
        <form onSubmit={submit} className="p-4 space-y-4">
          <div>
            <label htmlFor="identify-photo" className="block text-sm mb-2 text-gray-700">Unggah Foto (jpg/png/webp, maks 5MB)</label>
            <input id="identify-photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={onFile} className="text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:border file:border-gray-300 file:text-sm file:bg-white file:text-gray-700 hover:file:bg-gray-50" />
          </div>
          {preview && (
            <div className="border border-gray-200 bg-gray-50">
              <img src={preview} alt="Pratinjau" className="w-full max-h-64 object-contain" />
            </div>
          )}
          {error && <div className="text-sm text-red-700 px-2 py-1.5 bg-red-50 border border-red-200" role="alert">{error}</div>}
          <button disabled={loading} className="bg-[#15803D] text-white px-4 py-2 text-sm hover:bg-[#166534] transition-colors disabled:opacity-50">Identifikasi</button>
        </form>
      </div>

      {result && (
        <div className="mt-6 border border-gray-200 bg-white p-4 max-w-lg">
          <div className="mb-3">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="font-medium text-gray-900">{displayedResult.label_display}</span>
              <span className="text-sm text-gray-600">{displayedResult.confidence_text}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-gray-700">{needsUserChoice ? 'Perkiraan kategori:' : 'Kategori:'}</span>
              <span className="text-sm px-2 py-0.5 border border-gray-300 text-gray-900">{displayedResult.category.name}</span>
            </div>
          </div>
          {isLowConfidence && (
            <div className="mb-4" aria-label="Pilih jenis sampah yang paling sesuai">
              <p className="text-sm text-gray-700 mb-2">Kurang yakin dengan hasilnya. Pilih yang paling sesuai:</p>
              <div className="flex flex-wrap gap-2">
                {result.top3?.map((candidate) => {
                  const isSelected = selectedAlternative?.model_label === candidate.model_label
                  return (
                    <button
                      key={candidate.model_label}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setSelectedAlternative(candidate)}
                      className={`text-sm px-3 py-1.5 border transition-colors ${isSelected ? 'border-[#15803D] bg-green-50 text-gray-900' : 'border-gray-300 text-gray-700 hover:border-gray-500'}`}
                    >
                      {candidate.label_display} · {candidate.confidence_text}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
          {(!isLowConfidence || selectedAlternative) && (
            <div className="text-sm mb-4">
              <div className="font-medium mb-2 text-gray-900">Petunjuk Penanganan</div>
              <div className="text-gray-700 whitespace-pre-line leading-relaxed">{displayedResult.category.handling_instruction}</div>
            </div>
          )}
          <button disabled={needsUserChoice} onClick={goReport} className="bg-[#15803D] text-white px-4 py-2 text-sm hover:bg-[#166534] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Laporkan sampah ini</button>
        </div>
      )}
    </AppShell>
  )
}
