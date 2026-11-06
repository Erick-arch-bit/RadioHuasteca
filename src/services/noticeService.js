import { apiClient } from './apiClient'

export function getNotices() {
  return apiClient('/api/notices')
}

export function createNotice(notice) {
  return apiClient('/api/notices', {
    method: 'POST',
    body: JSON.stringify(notice),
  })
}
