import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../components/AppShell'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

export default function BerandaWarga() {
  const { user } = useAuth()
  const [articles, setArticles] = useState([])
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState('')

  useEffect(() => {
    Promise.all([
      api.get('/articles/public'),
      api.get('/pickup-schedules/mine')
    ])
      .then(([a, s]) => {
        setArticles(a.data.articles || [])
        setSchedules(s.data.schedules || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const grouped = schedules.reduce((acc, cur) => {
    acc[cur.day_of_week] = acc[cur.day_of_week] || []
    acc[cur.day_of_week].push(cur)
    return acc
  }, {})

  const order = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']
  const visibleDays = order.filter((day) => grouped[day])
  const scheduleDays = selectedDay ? [selectedDay] : visibleDays

  return (
    <AppShell>
      <div className="resident-heading">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Kabar lingkungan Anda</h1>
          <p className="text-sm text-gray-600 mt-1">Selamat datang{user?.name ? `, ${user.name.split(' ')[0]}` : ''}. Pantau jadwal dan rawat kawasan bersama.</p>
        </div>
        <span className="resident-heading-mark" aria-hidden="true">SIGAP</span>
      </div>
      <div className="resident-actions" aria-label="Tindakan cepat">
        <Link to="/identifikasi" className="resident-action resident-action-primary"><span className="action-mark" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3 4.5 6v5.2c0 4.7 3.2 8.2 7.5 9.8 4.3-1.6 7.5-5.1 7.5-9.8V6L12 3Z"/><path d="m9 12 2 2 4-4"/></svg></span><span><strong>Kenali jenis sampah</strong><small>Unggah foto untuk mendapat petunjuk pilah</small></span><span className="action-arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 17 17 7M8 7h9v9"/></svg></span></Link>
        <Link to="/lapor" className="resident-action"><span className="action-mark action-mark-clay" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 4v12M7 9l5-5 5 5"/><path d="M5 14v5h14v-5"/></svg></span><span><strong>Buat laporan lingkungan</strong><small>Sampaikan kendala kepada petugas</small></span><span className="action-arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 17 17 7M8 7h9v9"/></svg></span></Link>
      </div>
      {loading && <div className="text-sm text-gray-600">Memuat...</div>}
      {!loading && (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="border border-gray-200 bg-white home-section">
            <div className="px-4 py-3 border-b border-gray-200">
              <div><h2 className="text-base font-medium text-gray-900">Baca & pelajari</h2><p className="section-note">Panduan praktis pengelolaan sampah</p></div>
            </div>
            <div className="divide-y divide-gray-100">
              {articles.length === 0 && <div className="px-4 py-3 text-sm text-gray-600">Belum ada artikel.</div>}
              {articles.map((art) => (
                <Link key={art.id} to={`/artikel/${art.slug}`} className="block px-4 py-3 hover:bg-gray-50 transition-colors">
                  <div className="text-sm font-medium text-gray-900">{art.title}</div>
                  <div className="text-xs text-gray-500 mt-1">{new Date(art.created_at).toLocaleDateString('id-ID')}</div>
                </Link>
              ))}
            </div>
          </section>
          <section className="border border-gray-200 bg-white home-section">
            <div className="home-section-heading">
              <div><h2 className="text-base font-medium text-gray-900">Jadwal angkut blok Anda</h2><p className="section-note">Waktu pengumpulan yang perlu diketahui</p></div>
            </div>
            <div className="schedule-content">
              {schedules.length === 0 && <div className="text-sm text-gray-600">Belum ada jadwal untuk blok Anda.</div>}
              {visibleDays.length > 0 && <div className="schedule-day-filter" aria-label="Pilih hari jadwal">
                <button type="button" className={!selectedDay ? 'is-selected' : ''} aria-pressed={!selectedDay} onClick={() => setSelectedDay('')}>Semua hari</button>
                {visibleDays.map((day) => <button key={day} type="button" className={selectedDay === day ? 'is-selected' : ''} aria-pressed={selectedDay === day} onClick={() => setSelectedDay(day)}>{day}</button>)}
              </div>}
              <div className="space-y-4">
                {scheduleDays.map((day) => {
                  if (!grouped[day]) return null
                  return (
                    <div key={day}>
                      <div className="text-sm font-medium text-gray-900 mb-2">{day}</div>
                      <div className="space-y-2">
                        {grouped[day].map((s) => (
                          <div key={s.id} className="schedule-row">
                            <div className="schedule-time">{s.time_start?.slice(0,5)} – {s.time_end?.slice(0,5)}</div>
                            <div className="schedule-type">{s.waste_type}</div>
                            {s.notes && <div className="text-xs text-gray-600 mt-1">{s.notes}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        </div>
      )}
    </AppShell>
  )
}
