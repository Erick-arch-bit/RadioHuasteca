import { useEffect, useState } from 'react'
import { Pencil, Plus, X } from 'lucide-react'

const API = import.meta.env?.VITE_API_URL ?? ''
const blank = () => ({ title: '', description: '', priority: 'normal', type: 'community', date: new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Mexico_City', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()), status: 'active', audioId: '' })
const field = 'mt-1 block min-h-11 w-full rounded-lg border border-line bg-white px-3 text-sm font-normal'

export function NoticeManagement() {
  const [items, setItems] = useState([])
  const [audios, setAudios] = useState([])
  const [form, setForm] = useState(null)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  async function load() {
    const [noticeResponse, audioResponse] = await Promise.all([
      fetch(`${API}/api/admin/notices`, { credentials: 'include' }),
      fetch(`${API}/api/audios`),
    ])
    if (!noticeResponse.ok) throw new Error('No se pudieron cargar los avisos. Inicia sesión de nuevo si hace falta.')
    setItems(await noticeResponse.json())
    if (audioResponse.ok) setAudios(await audioResponse.json())
  }

  // eslint-disable-next-line react/set-state-in-effect -- Fetching this view's server data is the effect.
  useEffect(() => { load().catch((error) => setMessage(error.message)) }, [])

  function edit(item) {
    setForm({ id: item.id, title: item.title, description: item.description, priority: item.priority, type: item.type, date: item.date, status: item.status, audioId: item.audio_id ?? '' })
    setMessage('')
  }

  async function save(event) {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    const payload = { ...form, audioId: form.audioId || null }
    const isEditing = Boolean(form.id)
    const url = isEditing ? `${API}/api/admin/notices/${form.id.replace('community-', '')}` : `${API}/api/admin/notices`
    try {
      const response = await fetch(url, { method: isEditing ? 'PATCH' : 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'No se pudo guardar el aviso.')
      setForm(null)
      setMessage(result.message)
      window.dispatchEvent(new Event('radiohuasteca:notices-updated'))
      await load()
    } catch (error) {
      setMessage(error.message || 'No se pudo conectar con la API.')
    } finally {
      setBusy(false)
    }
  }

  return <section className="mt-5 rounded-2xl border border-line bg-paper p-4 desk:p-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 className="font-serif text-2xl text-ink">Avisos comunitarios</h2><p className="mt-1 text-sm text-muted">Publica, edita o actualiza el estado de los avisos.</p></div>
      <button type="button" onClick={() => { setForm(blank()); setMessage('') }} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-forest px-4 font-bold text-paper"><Plus size={17} />Nuevo aviso</button>
    </div>

    {message && <p role="status" aria-live="polite" className="mt-4 rounded-lg bg-cream p-3 text-sm text-ink">{message}</p>}

    {form && <form onSubmit={save} className="mt-5 grid gap-3 rounded-xl border border-line bg-cream/50 p-4">
      <div className="flex items-center justify-between"><h3 className="font-bold text-ink">{form.id ? 'Editar aviso' : 'Registrar aviso'}</h3><button type="button" aria-label="Cerrar formulario" onClick={() => setForm(null)} className="grid size-10 place-items-center rounded-lg text-ink"><X size={19} /></button></div>
      <label className="text-sm font-bold text-ink">Título<input className={field} required maxLength={90} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
      <label className="text-sm font-bold text-ink">Descripción<textarea className={`${field} py-2`} required maxLength={2000} rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
      <div className="grid grid-cols-1 gap-3 xs:grid-cols-2">
        <label className="text-sm font-bold text-ink">Prioridad<select className={field} value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}><option value="urgent">Urgente</option><option value="high">Alta</option><option value="normal">Normal</option></select></label>
        <label className="text-sm font-bold text-ink">Tipo<select className={field} value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}><option value="community">Comunidad</option><option value="weather">Clima</option><option value="water">Agua</option><option value="health">Salud</option></select></label>
        <label className="text-sm font-bold text-ink">Fecha<input className={field} type="date" required value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></label>
        <label className="text-sm font-bold text-ink">Estado<select className={field} value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}><option value="active">Activo</option><option value="scheduled">Programado</option><option value="resolved">Resuelto</option></select></label>
      </div>
      <label className="text-sm font-bold text-ink">Audio opcional<select className={field} value={form.audioId} onChange={(event) => setForm({ ...form, audioId: event.target.value })}><option value="">Sin audio</option>{audios.map((audio) => <option key={audio.id} value={audio.id}>{audio.title}</option>)}</select></label>
      <div className="flex flex-wrap gap-2"><button disabled={busy} className="min-h-11 rounded-lg bg-forest px-5 font-bold text-paper disabled:opacity-60">{busy ? 'Guardando…' : form.id ? 'Guardar cambios' : 'Publicar aviso'}</button><button type="button" onClick={() => setForm(null)} className="min-h-11 rounded-lg border border-line px-4 font-bold text-ink">Cancelar</button></div>
    </form>}

    <div className="mt-5 grid gap-3">{items.map((item) => <article key={item.id} className="flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-xl border border-line p-3">
      <div className="min-w-0"><strong className="block break-words text-ink">{item.title}</strong><span className="text-xs text-muted">{item.priority} · {item.status} · {item.date}</span></div>
      <button type="button" onClick={() => edit(item)} className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg border border-line px-3 text-sm font-bold text-forest"><Pencil size={15} />Editar</button>
    </article>)}</div>
    {!items.length && !message && <p className="mt-4 text-sm text-muted">Todavía no hay avisos en la base de datos.</p>}
  </section>
}
