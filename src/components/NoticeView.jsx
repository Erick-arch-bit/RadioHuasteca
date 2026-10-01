import { useState } from 'react'
import { Bell, CalendarDays, CircleCheck, CloudSun, Droplets, HeartPulse, Megaphone, Play, Plus, Siren, X } from 'lucide-react'

const priorities = ['urgent', 'high', 'normal']
const statuses = ['active', 'scheduled', 'resolved']
const types = ['weather', 'water', 'health', 'community']
const typeIcons = { weather: CloudSun, water: Droplets, health: HeartPulse, community: Megaphone }

function formatDate(date) {
  return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`))
}

export function NoticeView({ copy, notices, onPlayAudio }) {
  const [formOpen, setFormOpen] = useState(false)
  const [saved, setSaved] = useState(false)
  const [formError, setFormError] = useState('')

  function submitNotice(event) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const notice = Object.fromEntries(data.entries())
    if (Object.values(notice).some((value) => !String(value).trim())) {
      setFormError(copy.requiredFields)
      return
    }
    notices.addNotice({ ...notice, audio: data.get('audio') ? notices.sampleAudio : undefined })
    setFormError('')
    setSaved(true)
    event.currentTarget.reset()
    window.setTimeout(() => setSaved(false), 3500)
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

      <p className="mb-4 rounded border border-sun bg-paper/80 p-3 text-xs leading-relaxed text-ink">{copy.noticeDemoNotice}</p>

      <div className="mb-5 grid grid-cols-2 gap-2 rounded-lg border border-line bg-paper/70 p-3">
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

      <div className="grid gap-3">
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
      {notices.visibleNotices.length === 0 ? <div className="mt-4 rounded-lg border border-dashed border-line p-6 text-center text-sm text-muted"><CircleCheck className="mx-auto mb-2" size={24} />{copy.noNotices}<button type="button" className="mx-auto mt-3 block min-h-11 font-bold text-forest" onClick={() => { notices.setPriorityFilter('all'); notices.setStatusFilter('all') }}>{copy.clearFilters}</button></div> : null}

      <div className="mt-8 overflow-hidden rounded-lg border border-line bg-paper">
        <button type="button" data-testid="notice-form-toggle" aria-expanded={formOpen} onClick={() => setFormOpen((open) => !open)} className="flex min-h-12 w-full items-center justify-between gap-2 bg-forest px-4 text-left text-sm font-extrabold text-white"><span className="inline-flex items-center gap-2"><Plus size={17} />{copy.adminForm}</span>{formOpen ? <X size={18} /> : null}</button>
        {formOpen ? <form onSubmit={submitNotice} className="grid gap-3 p-4">
          <p className="rounded bg-cream p-3 text-xs leading-relaxed text-ink">{copy.demoLocal}</p>
          <label className="text-xs font-bold text-ink">{copy.noticeTitle}<input name="title" required maxLength="90" className="mt-1 block min-h-11 w-full rounded border border-line bg-white px-3 text-sm font-normal" /></label>
          <label className="text-xs font-bold text-ink">{copy.description}<textarea name="description" required maxLength="300" rows="3" className="mt-1 block w-full rounded border border-line bg-white px-3 py-2 text-sm font-normal" /></label>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs font-bold text-ink">{copy.priority}<select name="priority" required defaultValue="normal" className="mt-1 block min-h-11 w-full rounded border border-line bg-white px-2 text-xs font-normal">{priorities.map((key) => <option key={key} value={key}>{copy[key]}</option>)}</select></label>
            <label className="text-xs font-bold text-ink">{copy.type}<select name="type" required defaultValue="community" className="mt-1 block min-h-11 w-full rounded border border-line bg-white px-2 text-xs font-normal">{types.map((key) => <option key={key} value={key}>{copy[key]}</option>)}</select></label>
          <label className="text-xs font-bold text-ink">{copy.date}<input type="date" name="date" required defaultValue={new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Mexico_City', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())} className="mt-1 block min-h-11 w-full rounded border border-line bg-white px-2 text-xs font-normal" /></label>
            <label className="text-xs font-bold text-ink">{copy.status}<select name="status" required defaultValue="active" className="mt-1 block min-h-11 w-full rounded border border-line bg-white px-2 text-xs font-normal">{statuses.map((key) => <option key={key} value={key}>{copy[key]}</option>)}</select></label>
          </div>
          <label className="flex min-h-11 items-center gap-2 text-xs text-ink"><input type="checkbox" name="audio" value="yes" />{copy.attachDemoAudio}</label>
          {formError ? <p role="alert" className="text-xs font-bold text-red-800">{formError}</p> : null}
          {saved ? <p role="status" className="text-xs font-bold text-forest">{copy.noticeSaved}</p> : null}
          <button type="submit" className="min-h-12 rounded-md bg-forest px-4 text-sm font-extrabold text-white">{copy.saveNotice}</button>
        </form> : null}
      </div>
    </section>
  )
}
