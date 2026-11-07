import { useEffect, useState } from 'react'
import { LockKeyhole, LogOut } from 'lucide-react'
import { ContentManager, MailboxView, ModerationView } from './MediaViews'
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
      const data = await responsePayload(response)
      if (!response.ok || !data || typeof data !== 'object' || Array.isArray(data)) {
        throw new Error(data?.message || 'No se pudo cargar el resumen administrativo.')
      }
      setSummary(data)
    } catch {
      setSummary(null)
      setMessage('No se pudo cargar el resumen administrativo. Revisa la conexión con la API.')
    }
  }

  function changeSection(next) {
    setSection(next)
    if (next === 'panel') loadPanel()
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
    <section className="mx-auto max-w-6xl animate-reveal" data-testid="admin-view">
      <p className="text-[10px] font-extrabold uppercase tracking-[.11em] text-clay">Administración</p>
      <h1 className="mt-2 font-serif text-[clamp(38px,9vw,56px)] text-ink">{user ? 'Panel administrativo' : 'Acceso administrativo'}</h1>
      {user ? <>
        <div className="mt-6 grid gap-5 desk:grid-cols-[230px_minmax(0,1fr)]">
          <aside className="h-fit rounded-2xl border border-line bg-paper p-3 desk:sticky desk:top-24">
            <p className="px-3 py-2 text-xs text-muted">Sesión: <strong>{user.displayName}</strong></p>
            <nav aria-label="Secciones administrativas" className="grid grid-cols-2 gap-1 desk:grid-cols-1">
              {[
                ['panel','Dashboard'],['moderacion','Moderación'],['buzon','Buzón'],['contenido','Contenido'],['avisos','Avisos'],
              ].map(([id,label])=><button key={id} aria-current={section===id?'page':undefined} onClick={()=>changeSection(id)} className={`min-h-11 rounded-lg px-3 text-left text-sm font-bold ${section===id?'bg-leaf text-forest':'text-ink hover:bg-cream'}`}>{label}{id==='buzon'&&summary?.unread_mailbox>0?<span className="ml-2 rounded-full bg-clay px-2 py-0.5 text-xs text-white">{summary.unread_mailbox}</span>:null}</button>)}
            </nav>
            <button onClick={logout} className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-forest px-4 font-bold text-paper"><LogOut size={17} /> Cerrar sesión</button>
          </aside>
          <div className="min-w-0 rounded-2xl border border-line bg-paper p-4 desk:p-6">
            {section==='panel'?<>
              <h2 className="font-serif text-3xl text-ink">Dashboard</h2><p className="mt-1 text-sm text-muted">Resumen actualizado al abrir esta sección.</p>
              <div className="mt-5 grid grid-cols-2 gap-3 desk:grid-cols-3">
                {[[summary?.pending_notices,'Avisos pendientes'],[summary?.unread_mailbox,'Mensajes sin atender'],[summary?.procedures,'Trámites'],[summary?.capsules,'Cápsulas'],[summary?.latest_bulletin||'—','Último boletín']].map(([value,label])=><article key={label} className="rounded-xl bg-cream p-4"><strong className="block break-words text-2xl text-ink">{value??'—'}</strong><span className="text-xs text-muted">{label}</span></article>)}
              </div>
            </>:section==='moderacion'?<ModerationView user={user}/>:section==='buzon'?<MailboxView/>:section==='avisos'?<NoticeManagement/>:<ContentManager onChange={loadPanel}/>}
          </div>
        </div>
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
