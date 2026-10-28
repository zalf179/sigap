import { createContext, useContext, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const LenisContext = createContext(null)

const isPublicPath = (pathname) => pathname === '/' || pathname === '/daftar'

export function useLenisRef() {
  return useContext(LenisContext)
}

export default function LenisProvider({ children }) {
  const { pathname } = useLocation()
  const lenisRef = useRef(null)
  const pathnameRef = useRef(pathname)
  pathnameRef.current = pathname

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    let tickerCallback
    let scrollCallback

    const createLenis = () => {
      if (motionQuery.matches || lenisRef.current) return

      const lenis = new Lenis({ autoRaf: false, smoothWheel: true })
      lenisRef.current = lenis
      scrollCallback = () => ScrollTrigger.update()
      tickerCallback = (time) => lenis.raf(time * 1000)
      lenis.on('scroll', scrollCallback)
      gsap.ticker.add(tickerCallback)
      gsap.ticker.lagSmoothing(0)

      if (!isPublicPath(pathnameRef.current)) lenis.stop()
    }

    const destroyLenis = () => {
      const lenis = lenisRef.current
      if (!lenis) return
      lenis.off('scroll', scrollCallback)
      gsap.ticker.remove(tickerCallback)
      lenis.destroy()
      lenisRef.current = null
      scrollCallback = undefined
      tickerCallback = undefined
      gsap.ticker.lagSmoothing(500, 33)
    }

    const handleMotionChange = () => {
      if (motionQuery.matches) destroyLenis()
      else createLenis()
    }

    createLenis()
    motionQuery.addEventListener('change', handleMotionChange)
    return () => {
      motionQuery.removeEventListener('change', handleMotionChange)
      destroyLenis()
    }
  }, [])

  useEffect(() => {
    const lenis = lenisRef.current
    if (lenis) {
      lenis.scrollTo(0, { immediate: true, force: true })
      if (isPublicPath(pathname)) lenis.start()
      else lenis.stop()
    } else {
      window.scrollTo(0, 0)
    }

    const refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => window.cancelAnimationFrame(refreshFrame)
  }, [pathname])

  return <LenisContext.Provider value={lenisRef}>{children}</LenisContext.Provider>
}
