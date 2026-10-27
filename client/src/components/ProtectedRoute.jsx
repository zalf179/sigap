import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="p-4">Memuat...</div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) {
    if (user.role === 'warga') return <Navigate to="/beranda" replace />
    if (user.role === 'petugas') return <Navigate to="/petugas" replace />
    if (user.role === 'admin') return <Navigate to="/admin" replace />
    return <Navigate to="/login" replace />
  }
  return children
}
