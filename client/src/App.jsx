import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import BerandaWarga from './pages/BerandaWarga.jsx'
import PetugasDashboard from './pages/PetugasDashboard.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import AdminArticleEdit from './pages/admin/AdminArticleEdit.jsx'
import Identifikasi from './pages/Identifikasi.jsx'
import BuatLaporan from './pages/BuatLaporan.jsx'
import LaporanSaya from './pages/LaporanSaya.jsx'
import DetailLaporan from './pages/DetailLaporan.jsx'
import ArtikelDetail from './pages/ArtikelDetail.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import LenisProvider from './lib/LenisProvider.jsx'

export default function App() {
  return (
    <LenisProvider>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/daftar" element={<Register />} />
      <Route
        path="/beranda"
        element={
          <ProtectedRoute roles={['warga']}>
            <BerandaWarga />
          </ProtectedRoute>
        }
      />
      <Route
        path="/identifikasi"
        element={
          <ProtectedRoute roles={['warga']}>
            <Identifikasi />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lapor"
        element={
          <ProtectedRoute roles={['warga']}>
            <BuatLaporan />
          </ProtectedRoute>
        }
      />
      <Route
        path="/laporan-saya"
        element={
          <ProtectedRoute roles={['warga']}>
            <LaporanSaya />
          </ProtectedRoute>
        }
      />
      <Route
        path="/laporan/:id"
        element={
          <ProtectedRoute roles={['warga', 'petugas', 'admin']}>
            <DetailLaporan />
          </ProtectedRoute>
        }
      />
      <Route
        path="/artikel/:slug"
        element={
          <ProtectedRoute roles={['warga', 'petugas', 'admin']}>
            <ArtikelDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/petugas"
        element={
          <ProtectedRoute roles={['petugas']}>
            <PetugasDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/artikel/:id/edit"
        element={
          <ProtectedRoute roles={['admin']}>
            <AdminArticleEdit />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
    </LenisProvider>
  )
}
