import { createContext, useContext, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const LenisContext = createContext(null)

const isPublicPath = (pathname) => pathname === '/' || pathname === '/daftar'

function clearLenisDomState() {
  for (const element of [document.documentElement, document.body]) {
    if (!element) continue
    for (const className of Array.from(element.classList)) {
      if (className === 'lenis' || className.startsWith('lenis-')) element.classList.remove(className)
    }
    element.style.removeProperty('overflow')
  }
}

export function useLenisRef() {
  return useContext(LenisContext)
}

export default function LenisProvider({ children }) {
  const { pathname } = useLocation()
  const lenisRef = useRef(null)

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    let lenis = null
    let tickerCallback
    let scrollCallback
    let refreshFrame
    let changedTickerSmoothing = false

    const destroyLenis = () => {
      if (lenis) {
        if (scrollCallback) lenis.off('scroll', scrollCallback)
        if (tickerCallback) gsap.ticker.remove(tickerCallback)
        lenis.destroy()
        if (lenisRef.current === lenis) lenisRef.current = null
        lenis = null
        scrollCallback = undefined
        tickerCallback = undefined
      }

      if (changedTickerSmoothing) {
        gsap.ticker.lagSmoothing(500, 33)
        changedTickerSmoothing = false
      }

      clearLenisDomState()
    }

    const createLenis = () => {
      if (!isPublicPath(pathname) || motionQuery.matches || lenis) return

      const instance = new Lenis({ autoRaf: false, smoothWheel: true })
      lenis = instance
      lenisRef.current = instance
      scrollCallback = () => ScrollTrigger.update()
      tickerCallback = (time) => instance.raf(time * 1000)
      instance.on('scroll', scrollCallback)
      gsap.ticker.add(tickerCallback)
      gsap.ticker.lagSmoothing(0)
      changedTickerSmoothing = true
    }

    window.scrollTo(0, 0)
    createLenis()

    const handleMotionChange = () => {
      if (motionQuery.matches) destroyLenis()
      else createLenis()
      ScrollTrigger.refresh()
    }

    motionQuery.addEventListener('change', handleMotionChange)
    refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh())

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange)
      if (refreshFrame !== undefined) window.cancelAnimationFrame(refreshFrame)
      destroyLenis()
    }
  }, [pathname])

  return <LenisContext.Provider value={lenisRef}>{children}</LenisContext.Provider>
}
