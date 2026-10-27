import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

function BrandMark() {
  return <span className="landing-mark" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 21V11"/><path d="M12 14c-4.7 0-7-2.3-7-7 4.7 0 7 2.3 7 7Z"/><path d="M12 11c0-3.8 2-5.8 6-6 0 4-2 6-6 6Z"/><path d="M5 21h14"/></svg></span>
}

function FieldIllustration() {
  return (
    <svg className="field-illustration" viewBox="0 0 600 430" role="img" aria-labelledby="field-title field-desc">
      <title id="field-title">Alur layanan SIGAP</title>
      <desc id="field-desc">Tiga jalur layanan yang menghubungkan informasi warga, tindak lanjut petugas, dan pengelolaan kawasan.</desc>
      <rect className="plot-bed plot-bed-wide" x="74" y="82" width="388" height="74" rx="15"/>
      <rect className="plot-bed plot-bed-small" x="282" y="182" width="238" height="66" rx="15"/>
      <rect className="plot-bed plot-bed-medium" x="112" y="273" width="356" height="66" rx="15"/>
      <path className="field-path" d="M190 156v26h211M401 248v25H230"/>
      <path className="field-path-motion" d="M190 156v26h211M401 248v25H230" pathLength="1" aria-hidden="true"/>
      <path className="field-path-soft" d="M230 182v-13h-40M401 261h34"/>
      <circle className="field-node field-node-leaf" cx="190" cy="156" r="9"/>
      <circle className="field-node field-node-clay" cx="401" cy="248" r="9"/>
      <circle className="field-node field-node-gold" cx="230" cy="273" r="9"/>
      <rect className="field-band field-band-leaf" x="98" y="105" width="10" height="28" rx="5"/>
      <rect className="field-band field-band-clay" x="307" y="201" width="10" height="28" rx="5"/>
      <rect className="field-band field-band-gold" x="137" y="292" width="10" height="28" rx="5"/>
      <circle className="field-node field-node-sage" cx="422" cy="119" r="16"/>
      <circle className="field-node field-node-sage" cx="481" cy="215" r="11"/>
      <circle className="field-node field-node-sage" cx="395" cy="306" r="13"/>
    </svg>
  )
}

const services = [
  { title: 'Pilah dengan lebih yakin', text: 'Unggah foto untuk mengenali kategori sampah dan membaca petunjuk penanganannya.' },
  { title: 'Sampaikan masalah di sekitar', text: 'Buat laporan dengan lokasi dan foto, lalu ikuti perkembangannya sampai selesai.' },
  { title: 'Ikuti jadwal blok Anda', text: 'Lihat jadwal angkut dan informasi lingkungan yang sesuai dengan tempat tinggal.' },
]

export default function Home() {
  const workflowRef = useRef(null)
  const [workflowVisible, setWorkflowVisible] = useState(false)

  useEffect(() => {
    const workflow = workflowRef.current
    if (!workflow) return

    if (!('IntersectionObserver' in window)) {
      setWorkflowVisible(true)
      return
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      setWorkflowVisible(true)
      observer.disconnect()
    }, { threshold: 0.35 })

    observer.observe(workflow)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="landing-page">
      <header className="landing-header">
        <Link className="landing-brand" to="/" aria-label="SIGAP beranda"><BrandMark /><span><strong>SIGAP</strong><small>Rawat lingkungan bersama</small></span></Link>
        <nav className="landing-nav" aria-label="Navigasi halaman">
          <a href="#layanan">Layanan</a>
          <a href="#cara-kerja">Cara kerja</a>
          <Link className="landing-login" to="/login">Masuk</Link>
          <Link className="landing-register" to="/daftar">Daftar warga</Link>
        </nav>
      </header>

      <main>
        <section className="landing-hero">
          <div className="landing-hero-copy">
            <p className="landing-kicker"><span /> Layanan lingkungan perumahan</p>
            <h1>Lingkungan yang terawat dimulai dari langkah <em>bersama.</em></h1>
            <p className="landing-lede">SIGAP menghubungkan warga, petugas, dan pengelola untuk memilah sampah, menyampaikan laporan, dan menjaga jadwal angkut tetap jelas.</p>
            <div className="landing-actions">
              <Link to="/daftar" className="landing-primary">Mulai sebagai warga <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6"/></svg></Link>
              <Link to="/login" className="landing-secondary">Saya sudah punya akun</Link>
            </div>
            <p className="landing-caption">Satu ruang layanan untuk kebutuhan lingkungan di kawasan Anda.</p>
          </div>
          <div className="landing-visual"><div className="visual-stamp">WARGA<br/>PETUGAS<br/>KAWASAN</div><FieldIllustration /><div className="visual-caption"><span className="visual-caption-dot"/> Terkoneksi di satu layanan</div></div>
        </section>

        <section id="layanan" className="landing-services">
          <div className="section-heading">
            <div><h2>Hal kecil yang membuat lingkungan lebih teratur.</h2><p>Dari pemilahan harian sampai tindak lanjut laporan warga.</p></div>
            <Link to="/daftar">Jelajahi layanan <span aria-hidden="true">→</span></Link>
          </div>
          <div className="service-grid">
            {services.map((service) => <article className="service-item" key={service.title}><span className="service-mark" aria-hidden="true"/><h3>{service.title}</h3><p>{service.text}</p></article>)}
          </div>
        </section>

        <section id="cara-kerja" className="landing-how">
          <div className="how-copy"><h2>Bergerak dari rumah, terhubung sebagai kawasan.</h2><p>Warga mendapatkan informasi yang relevan untuk bloknya. Petugas menindaklanjuti laporan di lapangan. Pengelola melihat kebutuhan layanan dan mengatur informasi kawasan.</p><Link to="/login">Masuk ke SIGAP <span aria-hidden="true">→</span></Link></div>
          <div ref={workflowRef} className={`how-steps${workflowVisible ? ' is-in-view' : ''}`}><div><span className="step-dot step-leaf"/><strong>Warga</strong><p>Kenali, laporkan, pantau.</p></div><div><span className="step-dot step-clay"/><strong>Petugas</strong><p>Proses dan beri kabar.</p></div><div><span className="step-dot step-gold"/><strong>Pengelola</strong><p>Atur layanan kawasan.</p></div></div>
        </section>
      </main>

      <footer className="landing-footer"><Link className="landing-brand" to="/" aria-label="SIGAP beranda"><BrandMark /><span><strong>SIGAP</strong><small>Rawat lingkungan bersama</small></span></Link><p>Sistem Informasi Pengelolaan Sampah Perumahan</p><span>© SIGAP</span></footer>
    </div>
  )
}
