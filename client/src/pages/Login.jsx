import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthField from '../components/auth/AuthField'
import AuthLayout from '../components/auth/AuthLayout'
import AuthPasswordInput from '../components/auth/AuthPasswordInput'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(email, password)
      if (user.role === 'warga') navigate('/beranda')
      else if (user.role === 'petugas') navigate('/petugas')
      else if (user.role === 'admin') navigate('/admin')
      else navigate('/login')
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal masuk')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      headline="Lingkungan bersih tumbuh dari kebiasaan bersama."
      paragraph="Kenali jenis sampah, laporkan kendala lingkungan, dan tetap terhubung dengan jadwal angkut di kawasan Anda."
      footerText="SIGAP · Sistem informasi lingkungan perumahan"
      cardTitle="Selamat datang kembali"
      cardParagraph="Masuk untuk melanjutkan layanan lingkungan di kawasan Anda."
    >
        {error && <div className="auth-error" role="alert">{error}</div>}
        <form onSubmit={submit}>
          <AuthField id="login-email" label="Email" message="Masukkan alamat email yang valid.">
            <input className="auth-control" id="login-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" required />
          </AuthField>
          <AuthField id="login-password" label="Kata Sandi" message="Kata sandi wajib diisi.">
            <AuthPasswordInput id="login-password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Minimal 8 karakter" />
          </AuthField>
          <button type="submit" disabled={loading}>{loading ? 'Memeriksa akun…' : 'Masuk ke SIGAP'}</button>
        </form>
        <details className="auth-help">
          <summary>Lupa kata sandi?</summary>
          <p>Kata sandi hanya dapat direset oleh pengelola SIGAP. Hubungi petugas atau admin kawasan Anda dengan menyebutkan nama dan email terdaftar, lalu Anda akan diberi kata sandi sementara untuk masuk kembali.</p>
        </details>
        <div className="auth-switch">
          Belum punya akun? <Link to="/daftar">Daftar sebagai warga</Link>
        </div>
    </AuthLayout>
  )
}
