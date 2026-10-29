import { useEffect, useMemo, useState } from 'react'
import { noticeSeeds } from '../data/notices'

const STORAGE_KEY = 'radiohuasteca-sprint2-notices'
const API = import.meta.env?.VITE_API_URL ?? ''

function readNotices() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null')
    return Array.isArray(saved) ? [...saved, ...noticeSeeds] : noticeSeeds
  } catch {
    return noticeSeeds
  }
}

export function useNotices(enabled = true) {
  const [notices, setNotices] = useState(readNotices)
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    if (!enabled) return undefined
    let active = true
    const refresh = () => fetch(`${API}/api/notices`)
      .then((response) => (response.ok ? response.json() : []))
      .then((remote) => {
        if (!active || !Array.isArray(remote)) return
        setNotices((current) => {
          const local = current.filter((notice) => notice.createdLocally)
          const remoteIds = new Set(remote.map((notice) => notice.id))
          return [...remote, ...local, ...noticeSeeds.filter((notice) => !remoteIds.has(notice.id))]
        })
      })
      .catch(() => {})
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
          (statusFilter === 'all' || notice.status === statusFilter),
      ),
    [notices, priorityFilter, statusFilter],
  )

  return { visibleNotices, priorityFilter, setPriorityFilter, statusFilter, setStatusFilter }
}
