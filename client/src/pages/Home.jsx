import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import api from '../api/axios'
import { useLenisRef } from '../lib/LenisProvider.jsx'

gsap.registerPlugin(useGSAP, ScrollTrigger)

const categoryGuidance = {
  organik: {
    description: 'Sampah mudah terurai seperti sisa makanan, daun, rumput.',
    handling_instruction: 'Pisahkan ke wadah organik tertutup. Bisa diolah menjadi kompos. Jangan dicampur dengan plastik.',
  },
  anorganik: {
    description: 'Sampah tidak mudah terurai seperti plastik, kertas, kaleng, logam.',
    handling_instruction: 'Pastikan bahan daur ulang bersih dan kering, pisahkan menurut jenisnya, lalu setorkan ke tempat pemilahan.',
  },
  b3: {
    description: 'Bahan Berbahaya dan Beracun seperti baterai, lampu neon, obat kadaluarsa, kemasan beracun.',
    handling_instruction: 'Jangan dibuang ke tempat sampah umum. Kumpulkan terpisah dalam wadah kedap, jauhkan dari jangkauan anak, dan serahkan ke petugas sesuai jadwal penyerahan B3.',
  },
  residu: {
    description: 'Sampah yang sulit didaur ulang melalui pemilahan rumah tangga.',
    handling_instruction: 'Pisahkan dari bahan daur ulang dan buang dalam wadah residu tertutup.',
  },
}

function completeCategoryGuidance(categories) {
  return categories.map((category) => {
    const fallback = categoryGuidance[category.name?.trim().toLowerCase()]
    return {
      ...category,
      description: category.description?.trim() || fallback?.description || '',
      handling_instruction: category.handling_instruction?.trim() || fallback?.handling_instruction || '',
    }
  })
}

function WasteGuide() {
  const [categories, setCategories] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let active = true
    api.get('/categories')
      .then(({ data }) => {
        if (!active) return
        const rows = completeCategoryGuidance(data.categories || [])
        setCategories(rows)
        setSelectedId(rows[0]?.id ?? null)
        setStatus('ready')
      })
      .catch(() => { if (active) setStatus('error') })
    return () => { active = false }
  }, [])

  const selected = categories.find((category) => category.id === selectedId)

  return (
    <div className="waste-guide" data-ui>
      <div className="waste-guide-top">
        <h3>Panduan pilah</h3>
        <span>{status === 'ready' ? `${categories.length} kategori` : 'SIGAP'}</span>
      </div>
      {status === 'loading' && <p className="guide-message" role="status">Memuat kategori sampah…</p>}
      {status === 'error' && <div className="guide-message" role="status">Panduan belum tersambung. <Link to="/login">Masuk ke SIGAP</Link> untuk menggunakan layanan.</div>}
      {status === 'ready' && (
        <>
          <div className="waste-guide-options" role="group" aria-label="Pilih kategori sampah">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                aria-pressed={selectedId === category.id}
                onClick={() => setSelectedId(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
          {selected && <div className="waste-guide-result" aria-live="polite" key={selected.id}>
            <h4>{selected.name}</h4>
            <p>{selected.description}</p>
            <p>{selected.handling_instruction}</p>
          </div>}
        </>
      )}
    </div>
  )
}

const capabilities = [
  { title: 'Pilah', copy: 'Unggah foto untuk mengenali kategori sampah dan memahami penanganannya.' },
  { title: 'Jadwal', copy: 'Lihat waktu angkut yang berlaku untuk blok rumah Anda.' },
  { title: 'Laporkan', copy: 'Kirim lokasi dan foto, lalu ikuti status sampai bukti penutupan.' },
]

const reportStages = [
  { title: 'Menunggu', copy: 'Laporan warga masuk dengan lokasi dan foto.' },
  { title: 'Sedang diproses', copy: 'Petugas menangani laporan dan memperbarui status.' },
  { title: 'Selesai', copy: 'Foto bukti penutupan tersedia pada detail laporan.' },
]

export default function Home() {
  const pageRef = useRef(null)
  const headlineRef = useRef(null)
  const lenisRef = useLenisRef()

  useGSAP(() => {
    const page = pageRef.current
    const motionContext = gsap.matchMedia()
    motionContext.add('(prefers-reduced-motion: no-preference)', () => {
      const lines = headlineRef.current?.querySelectorAll('.waterline-line-copy')
      if (!page || !lines || lines.length !== 2) return

      page.classList.add('headline-intro-pending')
      let intro
      const revealHeadline = () => {
        page.classList.remove('headline-intro-pending')
        lines.forEach((line) => {
          line.style.removeProperty('transform')
          line.style.removeProperty('opacity')
          line.style.removeProperty('visibility')
        })
      }
      try {
        intro = gsap.timeline({ onComplete: revealHeadline, onInterrupt: revealHeadline })
        intro
          .fromTo(lines, { yPercent: 110, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 1.1, stagger: 0.12, ease: 'expo.out' })
          .fromTo('.waterline-intro', { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.85, ease: 'power3.out' }, '-=0.24')
          .fromTo('.waterline-wordmark, .waterline-actions a, .waterline-scroll', { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.65, stagger: 0.08, ease: 'power2.out' }, '-=0.18')
      } catch {
        intro?.kill()
        revealHeadline()
        return
      }

      gsap.to('.waterline-headline-parallax', {
        y: -18,
        ease: 'none',
        scrollTrigger: {
          trigger: '.waterline-hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 0.8,
        },
      })

      const revealItems = gsap.utils.toArray('[data-reveal]')
      gsap.set(revealItems, { autoAlpha: 0, y: 20 })
      ScrollTrigger.batch(revealItems, {
        start: 'top 86%',
        once: true,
        onEnter: (elements) => gsap.to(elements, {
          autoAlpha: 1,
          y: 0,
          duration: 0.72,
          stagger: 0.1,
          ease: 'power3.out',
          overwrite: true,
        }),
      })

      return () => {
        intro?.kill()
        revealHeadline()
      }
    })

    return () => {
      motionContext.revert()
      page?.classList.remove('headline-intro-pending')
    }
  }, { scope: pageRef, dependencies: [], revertOnUpdate: true })

  const scrollToServices = (event) => {
    event.preventDefault()
    if (lenisRef?.current) {
      lenisRef.current.scrollTo('#layanan', { offset: -16, duration: 1.05 })
      return
    }
    document.querySelector('#layanan')?.scrollIntoView({ behavior: 'auto', block: 'start' })
  }

  return (
    <div className="sigap-home" ref={pageRef}>
      <main>
        <section className="waterline-hero" aria-labelledby="home-title">
          <div className="waterline-field" aria-hidden="true" />
          <div className="waterline-nav">
            <Link className="waterline-wordmark" to="/" aria-label="SIGAP beranda">SIGAP</Link>
            <div className="waterline-actions">
              <Link to="/login">Masuk</Link>
              <Link className="waterline-register" to="/daftar">Daftar warga</Link>
            </div>
          </div>
          <div className="waterline-headline-parallax" ref={headlineRef}>
            <h1 className="waterline-title" id="home-title" aria-label="Sampah ada alurnya">
              <span className="waterline-line-mask"><span className="waterline-line-copy waterline-line-first">SAMPAH</span></span>
              <span className="waterline-line-mask"><span className="waterline-line-copy waterline-line-second">ADA ALURNYA</span></span>
            </h1>
          </div>
          <p className="waterline-intro">SIGAP menghubungkan panduan pilah, jadwal angkut per blok, dan laporan warga dalam satu layanan lingkungan.</p>
          <a className="waterline-scroll" href="#layanan" onClick={scrollToServices} aria-label="Lihat layanan SIGAP"><span />Lihat layanan</a>
        </section>

        <section className="capability-section" id="layanan" aria-labelledby="capability-heading">
          <div className="capability-intro" data-reveal>
            <h2 id="capability-heading">Satu kawasan.<br />Tiga langkah nyata.</h2>
            <p>Mulai dari mengenali sampah di rumah sampai melihat tindak lanjut laporan lingkungan.</p>
          </div>
          <div className="capability-list">
            {capabilities.map((item) => (
              <article className="capability-row" key={item.title} data-reveal>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="guide-section" aria-labelledby="guide-heading">
          <div className="guide-copy" data-reveal>
            <h2 id="guide-heading">Mulai dari jenisnya.</h2>
            <p>Pilih kategori untuk membaca petunjuk penanganan yang digunakan SIGAP.</p>
          </div>
          <div data-reveal><WasteGuide /></div>
        </section>

        <section className="report-section" id="laporan" aria-labelledby="report-heading">
          <div className="report-heading" data-reveal>
            <h2 id="report-heading">Laporan, sampai selesai.</h2>
            <p>Setiap tahap punya status yang bisa diikuti. Laporan yang selesai menyertakan foto bukti penutupan.</p>
          </div>
          <ol className="report-stages">
            {reportStages.map((stage) => (
              <li key={stage.title} data-reveal>
                <h3>{stage.title}</h3>
                <p>{stage.copy}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="public-cta" aria-labelledby="cta-heading">
          <h2 id="cta-heading">Rawat kawasan<br />bersama SIGAP.</h2>
          <div className="public-cta-choices">
            <Link to="/daftar">Daftar sebagai warga</Link>
            <span>atau</span>
            <Link to="/login">Masuk ke akun</Link>
          </div>
          <p>Warga baru dapat membuat akun. Akun petugas dan pengelola disiapkan oleh administrator.</p>
        </section>
      </main>

      <footer className="public-footer">
        <Link className="public-footer-name" to="/" aria-label="SIGAP beranda">SIGAP</Link>
        <div className="public-footer-bottom">
          <p>Sistem Informasi Pengelolaan Sampah Perumahan</p>
          <nav aria-label="Tautan layanan">
            <a href="#layanan">Layanan</a>
            <a href="#laporan">Cara kerja</a>
            <Link to="/login">Masuk</Link>
          </nav>
          <a href="#home-title">Kembali ke atas ↑</a>
        </div>
      </footer>
    </div>
  )
}
