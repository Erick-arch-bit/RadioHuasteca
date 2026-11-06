import { apiClient } from './apiClient'

export function uploadMedia(file) {
  if (!(file instanceof File)) throw new Error('Selecciona un archivo válido.')
  const formData = new FormData()
  formData.append('file', file)
  return apiClient('/api/media/upload', { method: 'POST', body: formData })
}
