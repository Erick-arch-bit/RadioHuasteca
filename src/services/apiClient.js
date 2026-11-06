const API_URL = (import.meta.env?.VITE_API_URL ?? '').replace(/\/$/, '')

export async function apiClient(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: options.body instanceof FormData
      ? options.headers
      : { 'Content-Type': 'application/json', ...options.headers },
  })

  const contentType = response.headers.get('content-type') ?? ''
  const payload = contentType.includes('application/json') ? await response.json() : null
  if (!response.ok) {
    throw new Error(payload?.message || `La API respondió con ${response.status}.`)
  }
  return payload
}
