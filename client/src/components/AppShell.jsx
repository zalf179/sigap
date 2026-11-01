import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const paths = {
  home: <><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9M9 20v-6h6v6"/></>,
  identify: <><path d="M12 3 4.5 6v5.2c0 4.7 3.2 8.2 7.5 9.8 4.3-1.6 7.5-5.1 7.5-9.8V6L12 3Z"/><path d="m9 12 2 2 4-4"/></>,
  report: <><path d="M12 4v12M7 9l5-5 5 5"/><path d="M5 14v5h14v-5"/></>,
  list: <><path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/></>,
  logout: <><path d="M10 17l5-5-5-5M15 12H3"/><path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7"/></>,
}

function Icon({ name }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>
}

function BrandMark() {
  return <span className="brand-mark" aria-hidden="true"><svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10"/><path d="M12 13c-4.7 0-7-2.3-7-7 4.7 0 7 2.3 7 7Z"/><path d="M12 10c0-3.8 2-5.8 6-6 0 4-2 6-6 6Z"/><path d="M5 20h14"/></svg></span>
}

export default function AppShell({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const logoutDialogRef = useRef(null)

  useEffect(() => {
    const dialog = logoutDialogRef.current
    if (logoutDialogOpen && dialog && !dialog.open) dialog.showModal()
    if (!logoutDialogOpen && dialog?.open) dialog.close()
  }, [logoutDialogOpen])

  const confirmLogout = () => {
    logoutDialogRef.current?.close()
    setLogoutDialogOpen(false)
    logout()
    navigate('/login', { replace: true })
  }

  const navItems = user?.role === 'warga'
    ? [
        { to: '/beranda', label: 'Beranda', icon: 'home' },
        { to: '/identifikasi', label: 'Identifikasi sampah', icon: 'identify' },
        { to: '/lapor', label: 'Buat laporan', icon: 'report' },
        { to: '/laporan-saya', label: 'Laporan saya', icon: 'list' },
      ]
    : user?.role === 'petugas'
      ? [{ to: '/petugas', label: 'Laporan warga', icon: 'list' }]
      : [{ to: '/admin', label: 'Dasbor pengelola', icon: 'home' }]

  const pageName = navItems.find((item) => location.pathname === item.to)?.label
    || (location.pathname.startsWith('/artikel/') ? 'Artikel lingkungan' : 'Detail laporan')
  const homePath = user?.role === 'warga' ? '/beranda' : user?.role === 'petugas' ? '/petugas' : '/admin'
  const initials = (user?.name || 'SIGAP').split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()

  return (
    <div className="app-frame">
      <aside className="app-rail" aria-label="Navigasi utama">
        <Link className="brand-lockup" to={homePath}>
          <BrandMark />
          <span className="brand-copy"><span className="brand-name">SIGAP</span><span className="brand-caption">Rawat lingkungan bersama</span></span>
        </Link>

        <div className="rail-label">Ruang kerja</div>
        <nav className="rail-nav">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className="rail-link" aria-label={item.label}>
              <Icon name={item.icon} /><span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="rail-grow" />
        <div className="rail-profile">
          <span className="profile-avatar" aria-hidden="true">{initials}</span>
          <div className="profile-copy"><div className="profile-name">{user?.name}</div><div className="profile-role">{user?.role}</div></div>
          <button type="button" onClick={() => setLogoutDialogOpen(true)} className="logout-button" aria-label="Keluar dari SIGAP" title="Keluar"><Icon name="logout" /></button>
        </div>
      </aside>

      <div className="app-workspace">
        <header className="app-topbar">
          <div className="topbar-title"><Link to={homePath} className="topbar-brand">SIGAP</Link><span aria-hidden="true">/</span><span className="topbar-greeting">{pageName}</span></div>
          <div className="topbar-account"><span className="topbar-dot" /><span className="topbar-account-name">{user?.name || 'Pengguna'}</span><span className="topbar-role">{user?.role}</span></div>
          <button type="button" onClick={() => setLogoutDialogOpen(true)} className="mobile-topbar-logout" aria-label="Keluar dari SIGAP">
            <Icon name="logout" /><span>Keluar</span>
          </button>
        </header>
        <main id="main-content" className="app-main">{children}</main>
      </div>
      <nav className="mobile-app-nav" aria-label="Navigasi utama">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} className="mobile-app-link">
            <Icon name={item.icon} /><span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <dialog
        ref={logoutDialogRef}
        className="logout-confirm-dialog"
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
        onCancel={() => setLogoutDialogOpen(false)}
        onClose={() => setLogoutDialogOpen(false)}
      >
        <div className="logout-confirm-content">
          <h2 id="logout-dialog-title">Keluar dari akun?</h2>
          <p id="logout-dialog-description">Anda perlu masuk kembali untuk menggunakan SIGAP.</p>
          <div className="logout-confirm-actions">
            <button type="button" className="logout-cancel-button" autoFocus onClick={() => setLogoutDialogOpen(false)}>Batal</button>
            <button type="button" className="logout-confirm-button" onClick={confirmLogout}>Ya, keluar</button>
          </div>
        </div>
      </dialog>
    </div>
  )
}
