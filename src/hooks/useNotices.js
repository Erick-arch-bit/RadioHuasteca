import { useEffect, useMemo, useState } from 'react'
import { noticeSeeds } from '../data/notices'
import { audioSources } from '../data/bulletin'

const STORAGE_KEY = 'radiohuasteca-sprint2-notices'

function readNotices() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null')
    return Array.isArray(saved) ? [...saved, ...noticeSeeds] : noticeSeeds
  } catch {
    return noticeSeeds
  }
}

export function useNotices() {
  const [notices, setNotices] = useState(readNotices)
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

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

  function addNotice(notice) {
    const created = { ...notice, id: `notice-${Date.now()}`, createdLocally: true }
    setNotices((current) => [created, ...current])
    setPriorityFilter('all')
    setStatusFilter('all')
  }

  return { visibleNotices, addNotice, priorityFilter, setPriorityFilter, statusFilter, setStatusFilter, sampleAudio: audioSources }
}
