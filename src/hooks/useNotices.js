import { useEffect, useMemo, useState } from 'react'
import { noticeSeeds } from '../data/notices'
import { getNotices } from '../services/noticeService'

const STORAGE_KEY = 'radiohuasteca-sprint2-notices'
const CACHE_KEY = 'radiohuasteca-notices-cache'

function readNotices() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null')
    const cached = JSON.parse(window.localStorage.getItem(CACHE_KEY) ?? 'null')
    return [...(Array.isArray(cached) ? cached : noticeSeeds.filter((item) => item.status === 'active')), ...(Array.isArray(saved) ? saved : [])]
  } catch {
    return noticeSeeds.filter((item) => item.status === 'active')
  }
}

export function useNotices(enabled = true) {
  const [notices, setNotices] = useState(readNotices)
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  useEffect(() => {
    if (!enabled) return undefined
    let active = true
    const refresh = () => getNotices()
      .then((remote) => {
        if (!active || !Array.isArray(remote)) return
        const published = remote.filter((notice) => notice.status === 'active')
        try { window.localStorage.setItem(CACHE_KEY, JSON.stringify(published.slice(0, 30))) } catch { /* El contenido remoto sigue disponible durante esta sesión. */ }
        setNotices((current) => [...published, ...current.filter((notice) => notice.createdLocally)])
      })
      .catch(() => {
        if (active) { setNotices(readNotices()); window.dispatchEvent(new Event('radiohuasteca:offline-fallback')) }
      })
    window.addEventListener('radiohuasteca:notices-updated', refresh)
    refresh()
    return () => { active = false; window.removeEventListener('radiohuasteca:notices-updated', refresh) }
  }, [enabled])

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(notices.filter((notice) => notice.createdLocally)),
      )
    } catch {
      // En navegación privada o sin cuota, el aviso se conserva durante la sesión.
    }
  }, [notices])

  const visibleNotices = useMemo(
    () =>
      notices.filter(
        (notice) =>
          (priorityFilter === 'all' || notice.priority === priorityFilter) &&
          (categoryFilter === 'all' || notice.type === categoryFilter) &&
          (statusFilter === 'all' || notice.status === statusFilter),
      ),
    [notices, priorityFilter, categoryFilter, statusFilter],
  )

  return { visibleNotices, priorityFilter, setPriorityFilter, statusFilter, setStatusFilter, categoryFilter, setCategoryFilter }
}
