import { useEffect, useState } from 'react'
import { LockKeyhole, LogOut } from 'lucide-react'
import { AudioUpload, ModerationView } from './MediaViews'
import { NoticeManagement } from './NoticeManagement'

const API = (import.meta.env?.VITE_API_URL ?? '').replace(/\/$/, '')

async function responsePayload(response) {
  const raw = await response.text()
  if (!raw.trim()) {
    return { message: `La API respondió sin contenido (HTTP ${response.status}). Revisa VITE_API_URL en Cloudflare Pages.` }
  }

  try {
    return JSON.parse(raw)
  } catch {
    return { message: `La API respondió HTTP ${response.status}, pero no devolvió JSON. Revisa VITE_API_URL y la configuración de Render.` }
  }
}

export function AdminView() {
  const [user, setUser] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [summary, setSummary] = useState(null)
  const [section, setSection] = useState('panel')

  async function loadPanel() {
    try {
      const response = await fetch(`${API}/api/admin/summary`, { credentials: 'include' })
      if (response.ok) setSummary(await response.json())
    } catch {
      setSummary(null)
    }
  }

  useEffect(() => {
    fetch(`${API}/api/auth/me`, { credentials: 'include' })
      .then(async (response) => {
        if (!response.ok) return
        const data = await responsePayload(response)
        if (data.user) {
          setUser(data.user)
          await loadPanel()
        }
      })
      .catch(() => {})
  }, [])

  async function login(event) {
    event.preventDefault()
    if (!username.trim() || !password) {
      setMessage('Completa usuario/correo y contraseña.')
      return
    }

    setBusy(true)
    setMessage('')
    try {
      const response = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: username.trim(), password }),
      })
      const data = await responsePayload(response)
      if (!response.ok) throw new Error(data.message || `La API respondió con HTTP ${response.status}.`)
      if (!data.user) throw new Error('La API no confirmó el inicio de sesión. Comprueba VITE_API_URL y FRONTEND_ORIGIN.')

      const sessionResponse = await fetch(`${API}/api/auth/me`, { credentials: 'include' })
      const session = await responsePayload(sessionResponse)
      if (!sessionResponse.ok || !session.user) {
        throw new Error('El login respondió, pero la sesión no se conservó. Revisa FRONTEND_ORIGIN en Render y las cookies entre dominios.')
      }

      setUser(session.user)
      setPassword('')
      await loadPanel()
    } catch (error) {
      setMessage(error.message === 'Failed to fetch'
        ? 'No se pudo conectar con la API. Comprueba VITE_API_URL y que FRONTEND_ORIGIN coincida con el dominio de Cloudflare.'
        : error.message)
    } finally {
      setBusy(false)
    }
  }

  async function logout() {
    try {
      await fetch(`${API}/api/auth/logout`, { method: 'POST', credentials: 'include' })
    } finally {
      setUser(null)
      setMessage('Sesión cerrada.')
      setSection('panel')
    }
  }

  return (
    <section className="mx-auto max-w-3xl animate-reveal" data-testid="admin-view">
      <p className="text-[10px] font-extrabold uppercase tracking-[.11em] text-clay">Administración</p>
      <h1 className="mt-2 font-serif text-[clamp(38px,9vw,56px)] text-ink">{user ? 'Panel administrativo' : 'Acceso administrativo'}</h1>
      {user ? <>
        <div className="mt-6 rounded-2xl border border-line bg-paper p-5">
          <p>Sesión iniciada como <strong>{user.displayName}</strong>.</p>
          <p className="mt-5 font-bold text-ink">Resumen del catálogo</p>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-cream p-4"><strong className="block text-2xl">{summary?.procedures ?? '—'}</strong><span className="text-xs text-muted">Trámites publicados</span></div>
            <div className="rounded-lg bg-cream p-4"><strong className="block text-2xl">{summary?.priority_procedures ?? '—'}</strong><span className="text-xs text-muted">Con prioridad</span></div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={() => setSection('panel')} className="min-h-11 rounded-lg border border-line px-4 font-bold">Panel</button>
            <button onClick={() => setSection('avisos')} className="min-h-11 rounded-lg border border-line px-4 font-bold">Avisos</button>
            <button onClick={() => setSection('moderacion')} className="min-h-11 rounded-lg border border-line px-4 font-bold">Moderación</button>
            <button onClick={logout} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-forest px-4 font-bold text-paper"><LogOut size={17} /> Cerrar sesión</button>
          </div>
        </div>
        {section === 'moderacion' ? <ModerationView user={user} /> : section === 'avisos' ? <NoticeManagement /> : <AudioUpload onUploaded={() => {}} />}
      </> : <form onSubmit={login} className="mt-6 space-y-4 rounded-2xl border border-line bg-paper p-5">
        <div className="flex items-center gap-2 text-sm text-muted"><LockKeyhole size={18} /> Inicia sesión con una cuenta administradora.</div>
        <label className="block text-sm font-bold">Usuario o correo<input autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} className="mt-1 block min-h-11 w-full rounded-lg border border-line bg-white px-3 font-normal" /></label>
        <label className="block text-sm font-bold">Contraseña<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 block min-h-11 w-full rounded-lg border border-line bg-white px-3 font-normal" /></label>
        <button disabled={busy} className="min-h-11 rounded-lg bg-forest px-5 font-bold text-paper disabled:opacity-60">{busy ? 'Validando…' : 'Iniciar sesión'}</button>
        <p className="text-xs text-muted">Las credenciales se validan en el servidor y no se guardan en este navegador.</p>
      </form>}
      {message && <p role="status" aria-live="polite" className="mt-4 rounded-lg border border-line bg-paper p-3 text-sm">{message}</p>}
    </section>
  )
}
