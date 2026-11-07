import { useRef, useState } from 'react'
import { Bell, CalendarDays, CircleCheck, CloudSun, Droplets, HeartPulse, Megaphone, Mic, Play, Siren, Square } from 'lucide-react'

const priorities = ['urgent', 'high', 'normal']
const statuses = ['active', 'scheduled', 'resolved']
const typeIcons = { weather: CloudSun, water: Droplets, health: HeartPulse, community: Megaphone }

function formatDate(date) {
  const value = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)
    ? `${date}T12:00:00Z`
    : date
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'Fecha no disponible'
  return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(parsed)
}

export function NoticeView({ copy, notices, onPlayAudio, onGoAdmin }) {
  const [formOpen, setFormOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [noticeMessage, setNoticeMessage] = useState('')
  const [recording, setRecording] = useState(false)
  const [recordedAudio, setRecordedAudio] = useState(null)
  const recorder = useRef(null)
  const recorded = useRef(null)

  async function recordAudio() {
    if (recording) { recorder.current?.stop(); setRecording(false); return }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const instance = new MediaRecorder(stream)
      const chunks = []
      instance.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data) }
      instance.onstop = () => { const audioFile = new File(chunks, 'aviso-audio.webm', { type: instance.mimeType || 'audio/webm' }); recorded.current = audioFile; setRecordedAudio(audioFile); stream.getTracks().forEach((track) => track.stop()) }
      instance.start(); recorder.current = instance; setRecording(true)
    } catch { setNoticeMessage('No se pudo acceder al micrófono. Revisa los permisos del navegador.') }
  }

  async function submitNotice(event) {
    event.preventDefault(); const form = event.currentTarget; const values = new FormData(form)
    setSending(true); setNoticeMessage('')
    try {
      const upload = async (file, folder) => {
        if (!(file instanceof File) || !file.size) return null
        if (file.size > 15 * 1024 * 1024) throw Error('Cada archivo debe pesar menos de 15 MB.')
        const data = new FormData(); data.append('file', file); data.append('folder', folder)
        const response = await fetch(`${import.meta.env?.VITE_API_URL ?? ''}/api/media/upload`, { method: 'POST', body: data })
        const result = await response.json(); if (!response.ok) throw Error(result.message || 'No se pudo subir el archivo.'); return result
      }
      const audio = recorded.current || values.get('audio')
      const [audioAsset,imageAsset] = await Promise.all([upload(audio,'avisos'),upload(values.get('image'),'avisos')])
      const response = await fetch(`${import.meta.env?.VITE_API_URL ?? ''}/api/notices`, { method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
        title:values.get('title'),description:values.get('description'),category:values.get('category'),priority:values.get('category')==='urgent'?'urgent':values.get('priority'),isAnonymous:values.get('anonymous')==='on',
        mediaUrl:audioAsset?.url,mediaPublicId:audioAsset?.publicId,imageUrl:imageAsset?.url,imagePublicId:imageAsset?.publicId,
      })})
      const result=await response.json(); if(!response.ok)throw Error(result.message||'No se pudo enviar el aviso.')
      setNoticeMessage(result.message); form.reset(); recorded.current=null; setRecordedAudio(null); setFormOpen(false)
      window.dispatchEvent(new Event('radiohuasteca:notices-updated'))
    } catch(error) { setNoticeMessage(error.message||'No se pudo enviar el aviso.') }
    finally { setSending(false) }
  }

  return (
    <section data-testid="notices-view" data-check-overflow className="animate-reveal">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="text-[10px] font-extrabold uppercase tracking-[.11em] text-clay">RadioHuasteca · Sprint 2</span>
          <h1 className="mt-2 font-serif text-[clamp(32px,8vw,48px)] leading-tight text-ink">{copy.noticesTitle}</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">{copy.noticesIntro}</p>
        </div>
        <Bell size={26} className="mt-2 shrink-0 text-forest" aria-hidden="true" />
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-paper p-4"><p className="text-sm text-muted">Comparte un aviso para que el equipo de la radio lo revise.</p><button onClick={()=>setFormOpen((v)=>!v)} className="min-h-11 rounded-lg bg-forest px-4 text-sm font-bold text-paper">{formOpen?'Cerrar formulario':'Publicar un aviso'}</button></div>
      {noticeMessage&&<p role="status" aria-live="polite" className="mb-4 rounded-lg bg-paper p-3 text-sm">{noticeMessage}</p>}
      {formOpen&&<form onSubmit={submitNotice} className="mb-5 grid gap-3 rounded-xl border border-line bg-paper p-4 desk:grid-cols-2">
        <label className="text-sm font-bold">Título<input required maxLength="150" name="title" className="mt-1 block min-h-11 w-full rounded-lg border border-line bg-white px-3 font-normal"/></label>
        <label className="text-sm font-bold">Categoría<select name="category" className="mt-1 block min-h-11 w-full rounded-lg border border-line bg-white px-3 font-normal"><option value="urgent">Urgente</option><option value="event">Evento</option><option value="greeting">Saludo</option><option value="lost">Pérdida</option></select></label>
        <label className="text-sm font-bold desk:col-span-2">Descripción<textarea required maxLength="5000" name="description" className="mt-1 block min-h-24 w-full rounded-lg border border-line bg-white p-3 font-normal"/></label>
        <label className="text-sm font-bold">Prioridad<select name="priority" className="mt-1 block min-h-11 w-full rounded-lg border border-line bg-white px-3 font-normal"><option value="normal">Normal</option><option value="high">Alta</option><option value="urgent">Urgente</option></select></label>
        <label className="text-sm font-bold">Imagen opcional<input type="file" name="image" accept="image/jpeg,image/png,image/webp" className="mt-1 block min-h-11 w-full rounded-lg border border-line bg-white p-2 font-normal"/></label>
        <label className="text-sm font-bold">Audio opcional<input type="file" name="audio" accept="audio/mpeg,audio/ogg,audio/webm,audio/mp4" className="mt-1 block min-h-11 w-full rounded-lg border border-line bg-white p-2 font-normal"/></label>
        <div><button type="button" onClick={recordAudio} aria-pressed={recording} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-line px-3 text-sm font-bold">{recording?<Square size={16}/>:<Mic size={16}/>} {recording?'Detener grabación':recordedAudio?'Audio grabado · grabar otra vez':'Grabar audio'}</button></div>
        <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" name="anonymous"/> Publicar como anónimo</label>
        <button disabled={sending} className="min-h-11 rounded-lg bg-forest px-5 font-bold text-paper desk:col-span-2">{sending?'Enviando…':'Enviar a moderación'}</button>
      </form>}

      <div className="mb-5 grid grid-cols-1 gap-2 rounded-lg border border-line bg-paper/70 p-3 desk:grid-cols-3">
        <label className="min-w-0 text-[11px] font-bold text-ink">
          Categoría
          <select aria-label="Categoría" value={notices.categoryFilter} onChange={(e) => notices.setCategoryFilter(e.target.value)} className="mt-1.5 block min-h-11 w-full rounded border border-line bg-paper px-2 text-xs"><option value="all">Todos</option><option value="urgent">Urgentes</option><option value="event">Eventos</option><option value="greeting">Saludos</option><option value="lost">Pérdidas</option></select>
        </label>
        <label className="min-w-0 text-[11px] font-bold text-ink">
          {copy.filterPriority}
          <select aria-label={copy.filterPriority} value={notices.priorityFilter} onChange={(e) => notices.setPriorityFilter(e.target.value)} className="mt-1.5 block min-h-11 w-full rounded border border-line bg-paper px-2 text-xs">
            <option value="all">{copy.all}</option>{priorities.map((key) => <option key={key} value={key}>{copy[key]}</option>)}
          </select>
        </label>
        <label className="min-w-0 text-[11px] font-bold text-ink">
          {copy.filterStatus}
          <select aria-label={copy.filterStatus} value={notices.statusFilter} onChange={(e) => notices.setStatusFilter(e.target.value)} className="mt-1.5 block min-h-11 w-full rounded border border-line bg-paper px-2 text-xs">
            <option value="all">{copy.all}</option>{statuses.map((key) => <option key={key} value={key}>{copy[key]}</option>)}
          </select>
        </label>
      </div>

      <div className="grid gap-3 desk:grid-cols-2">
        {notices.visibleNotices.map((notice) => {
          const TypeIcon = typeIcons[notice.type] ?? Megaphone
          return (
            <article key={notice.id} data-testid="notice-card" data-priority={notice.priority} className={`rounded-lg border bg-paper p-4 ${notice.priority === 'urgent' ? 'border-red-700 border-l-[5px] shadow-[0_3px_14px_rgba(153,27,27,.12)]' : 'border-line'}`}>
              <div className="flex items-start gap-3">
                <span className={`grid size-10 shrink-0 place-items-center rounded-full ${notice.priority === 'urgent' ? 'bg-red-100 text-red-800' : 'bg-leaf text-forest'}`}>
                  {notice.priority === 'urgent' ? <Siren size={21} aria-hidden="true" /> : <TypeIcon size={20} aria-hidden="true" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-1.5">
                    <span className={`rounded-full px-2 py-1 text-[10px] font-extrabold uppercase ${notice.priority === 'urgent' ? 'bg-red-100 text-red-900' : notice.priority === 'high' ? 'bg-orange-100 text-orange-900' : 'bg-mist text-forest'}`}>{copy[notice.priority]}</span>
                    <span className="rounded-full bg-cream px-2 py-1 text-[10px] font-bold text-ink">{copy[notice.status]}</span>
                  </div>
                  <h2 className="break-words font-serif text-lg leading-snug text-ink">{notice.title}</h2>
                  <p className="mt-1 text-xs leading-relaxed text-muted">{notice.description}</p>
                  {notice.image_url || notice.imageUrl ? <img className="mt-3 max-h-64 w-full rounded-lg bg-cream object-contain" src={notice.image_url || notice.imageUrl} loading="lazy" decoding="async" alt={`Imagen del aviso: ${notice.title}`} /> : null}
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-muted"><CalendarDays size={14} aria-hidden="true" />{formatDate(notice.date)} · {copy[notice.type]}</span>
                    {notice.audio ? <button type="button" data-testid={notice.priority === 'urgent' ? 'critical-notice-audio' : `notice-audio-${notice.id}`} aria-label={`${copy.listenNotice}: ${notice.title}`} onClick={() => onPlayAudio(notice.id)} className="inline-flex min-h-11 items-center gap-1.5 rounded-md bg-forest px-3 text-xs font-bold text-white"><Play size={15} fill="currentColor" aria-hidden="true" />{copy.listenNotice}</button> : null}
                  </div>
                </div>
              </div>
            </article>
          )
        })}
      </div>
      {notices.visibleNotices.length === 0 ? <div className="mt-4 rounded-lg border border-dashed border-line p-6 text-center text-sm text-muted"><CircleCheck className="mx-auto mb-2" size={24} />{copy.noNotices}<button type="button" className="mx-auto mt-3 block min-h-11 font-bold text-forest" onClick={() => { notices.setPriorityFilter('all'); notices.setCategoryFilter('all'); notices.setStatusFilter('all') }}>{copy.clearFilters}</button></div> : null}

      <div className="mt-8 flex flex-col items-start gap-3 rounded-lg border border-line bg-paper p-4 desk:flex-row desk:items-center desk:justify-between">
        <p className="text-sm text-muted">{copy.noticeAdminOnly}</p>
        <button type="button" onClick={onGoAdmin} className="min-h-11 rounded-lg bg-forest px-4 text-sm font-bold text-paper">{copy.goToAdmin}</button>
      </div>
    </section>
  )
}
