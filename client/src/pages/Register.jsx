import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import AuthField from '../components/auth/AuthField'
import AuthLayout from '../components/auth/AuthLayout'
import AuthPasswordInput from '../components/auth/AuthPasswordInput'

export default function Register() {
  const navigate = useNavigate()
  const [blocks, setBlocks] = useState([])
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', block_id: '', house_number: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/blocks').then((res) => setBlocks(res.data.blocks || [])).catch(() => {})
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/register', form)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal mendaftar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      headline="Jadi bagian dari lingkungan yang lebih terawat."
      paragraph="Hubungkan rumah Anda dengan informasi pemilahan sampah, laporan warga, dan layanan angkut di kawasan."
      footerText="SIGAP · Sistem informasi lingkungan perumahan"
      cardTitle="Daftar sebagai warga"
      cardParagraph="Buat akun agar informasi dan laporan sesuai dengan blok tempat tinggal Anda."
      register
      highlight="rumah"
    >
        {error && <div className="auth-error" role="alert">{error}</div>}
        <form onSubmit={submit}>
          <AuthField id="register-name" label="Nama Lengkap" message="Nama wajib diisi.">
            <input className="auth-control" id="register-name" autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nama sesuai KTP" required />
          </AuthField>
          <AuthField id="register-email" label="Email" message="Masukkan alamat email yang valid.">
            <input className="auth-control" id="register-email" type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="nama@email.com" required />
          </AuthField>
          <AuthField id="register-phone" label="Nomor Telepon">
            <input className="auth-control" id="register-phone" type="tel" autoComplete="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="08xxxxxxxxxx" />
          </AuthField>
          <AuthField id="register-password" label="Kata Sandi" message="Kata sandi wajib diisi.">
            <AuthPasswordInput id="register-password" autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required placeholder="Minimal 8 karakter" />
          </AuthField>
          <AuthField id="register-block" label="Blok" message="Pilih blok tempat tinggal Anda.">
            <div className="auth-select-wrap">
              <select className="auth-control" id="register-block" value={form.block_id} onChange={(e) => setForm({ ...form, block_id: e.target.value })} required>
              <option value="">Pilih Blok</option>
              {blocks.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
              </select>
              <svg className="auth-select-chevron" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="m5 7.5 5 5 5-5" /></svg>
            </div>
          </AuthField>
          <AuthField id="register-house" label="Nomor Rumah" message="Nomor rumah wajib diisi.">
            <input className="auth-control" id="register-house" autoComplete="address-line2" value={form.house_number} onChange={(e) => setForm({ ...form, house_number: e.target.value })} placeholder="Contoh: 12" required />
          </AuthField>
          <button type="submit" disabled={loading}>{loading ? 'Membuat akun…' : 'Buat akun warga'}</button>
        </form>
        <div className="auth-switch">
          Sudah punya akun? <Link to="/login">Masuk</Link>
        </div>
    </AuthLayout>
  )
}
