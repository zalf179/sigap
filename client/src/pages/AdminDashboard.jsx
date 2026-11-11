import { useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import AppShell from '../components/AppShell'
import AdminArticles from './admin/AdminArticles'
import AdminSchedules from './admin/AdminSchedules'
import AdminUsers from './admin/AdminUsers'
import AdminStats from './admin/AdminStats'

export default function AdminDashboard() {
  const tabs = [
    { id: 'statistik', label: 'Ringkasan' },
    { id: 'artikel', label: 'Artikel' },
    { id: 'jadwal', label: 'Jadwal angkut' },
    { id: 'pengguna', label: 'Pengguna' },
  ]
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedTab = searchParams.get('tab')
  const [tab, setTab] = useState(
    tabs.some((item) => item.id === requestedTab) ? requestedTab : 'statistik'
  )
  const tabRefs = useRef([])

  const changeTab = (id) => {
    setTab(id)
    setSearchParams(id === 'statistik' ? {} : { tab: id }, { replace: true })
  }

  const selectTab = (index) => {
    const nextIndex = (index + tabs.length) % tabs.length
    changeTab(tabs[nextIndex].id)
    tabRefs.current[nextIndex]?.focus()
  }

  const handleTabKeyDown = (event, index) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      selectTab(index + 1)
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      selectTab(index - 1)
    } else if (event.key === 'Home') {
      event.preventDefault()
      selectTab(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      selectTab(tabs.length - 1)
    }
  }

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-lg font-semibold mb-2">Pengelolaan SIGAP</h1>
        <p className="text-sm text-gray-600">Pantau layanan lingkungan dan kelola informasi kawasan dari satu tempat.</p>
      </div>
      <div className="admin-tabs" role="tablist" aria-label="Bagian pengelolaan">
        {tabs.map((item, index) => (
          <button key={item.id} ref={(element) => { tabRefs.current[index] = element }} id={`admin-tab-${item.id}`} type="button" role="tab" tabIndex={tab === item.id ? 0 : -1} aria-selected={tab === item.id} aria-controls="admin-panel" onKeyDown={(event) => handleTabKeyDown(event, index)} onClick={() => changeTab(item.id)} className={tab === item.id ? 'admin-tab is-active' : 'admin-tab'}>
            {item.label}
          </button>
        ))}
      </div>
      <div id="admin-panel" role="tabpanel" tabIndex={0} aria-labelledby={`admin-tab-${tab}`}>
        {tab === 'statistik' && <AdminStats />}
        {tab === 'artikel' && <AdminArticles />}
        {tab === 'jadwal' && <AdminSchedules />}
        {tab === 'pengguna' && <AdminUsers />}
      </div>
    </AppShell>
  )
}
