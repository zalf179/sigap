import { useCallback, useEffect, useState } from 'react'
import api from '../../api/axios'

export default function useAdminResource(url) {
  const [refreshKey, setRefreshKey] = useState(0)
  const [loading, setLoading] = useState(true)
  const [resource, setResource] = useState({ state: 'loading', data: null, errorStatus: null })

  useEffect(() => {
    const controller = new AbortController()
    let active = true
    let timedOut = false
    const timeoutId = window.setTimeout(() => {
      timedOut = true
      controller.abort()
    }, 10_000)

    setLoading(true)
    setResource({ state: 'loading', data: null, errorStatus: null })
    const load = async () => {
      try {
        const response = await api.get(url, { signal: controller.signal })
        if (active) setResource({ state: 'success', data: response.data, errorStatus: null })
      } catch (error) {
        if (!active) return
        const status = error.response?.status ?? (timedOut ? 'Timeout (10 detik)' : 'Tidak tersedia')
        console.error(`GET ${url} gagal (status: ${status})`)
        setResource({ state: 'error', data: null, errorStatus: status })
      } finally {
        window.clearTimeout(timeoutId)
        if (active) setLoading(false)
      }
    }
    load()

    return () => {
      active = false
      window.clearTimeout(timeoutId)
      controller.abort()
    }
  }, [url, refreshKey])

  const retry = useCallback(() => {
    setLoading(true)
    setRefreshKey((key) => key + 1)
  }, [])
  return { ...resource, state: loading ? 'loading' : resource.state, retry }
}
